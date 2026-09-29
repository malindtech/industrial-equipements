import type { AppData, Order, Payment, Quote } from "@/types/domain";
import { orderTotal } from "@/lib/orders";
import { stockForProduct } from "@/lib/selectors";

export function openPipelineValue(orders: Order[]) {
  return orders
    .filter((o) => !["delivered", "cancelled", "draft"].includes(o.status))
    .reduce((s, o) => s + orderTotal(o), 0);
}

export function collectedRevenue(payments: Payment[]) {
  return payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
}

export function leadConversionRate(leads: AppData["leads"]) {
  const total = leads.filter((l) => l.status !== "lost").length;
  const converted = leads.filter((l) => l.status === "converted").length;
  if (total === 0) return 0;
  return Math.round((converted / total) * 100);
}

export function estimateLineCost(
  order: Order,
  line: Order["lines"][0],
  data: Pick<AppData, "inventory" | "products" | "vendorPOs">
): number {
  if (line.fulfillment === "stock") {
    const rows = data.inventory.filter((i) => i.productId === line.productId);
    const avgCost =
      rows.reduce((s, r) => s + r.unitCost, 0) / Math.max(rows.length, 1);
    return avgCost * line.quantity;
  }
  const po = data.vendorPOs.find(
    (p) => p.orderId === order.id && p.productIds.includes(line.productId)
  );
  if (po) {
    const share = line.quantity / Math.max(po.productIds.length, 1);
    return (po.amount / Math.max(po.productIds.length, 1)) * share;
  }
  const product = data.products.find((p) => p.id === line.productId);
  return (product?.listPrice ?? line.unitPrice) * 0.72 * line.quantity;
}

export function orderMargin(order: Order, data: Pick<AppData, "inventory" | "products" | "vendorPOs">) {
  const revenue = orderTotal(order);
  const cost = order.lines.reduce((s, l) => s + estimateLineCost(order, l, data), 0);
  return { revenue, cost, margin: revenue - cost, marginPct: revenue ? ((revenue - cost) / revenue) * 100 : 0 };
}

export function lowStockProducts(data: Pick<AppData, "products" | "inventory">, threshold = 3) {
  return data.products.filter((p) => {
    const qty = stockForProduct(data.inventory, p.id);
    return qty <= threshold;
  });
}

export function quotesExpiringSoon(quotes: Quote[], withinDays = 14) {
  const cutoff = Date.now() + withinDays * 86400000;
  return quotes.filter(
    (q) => q.status === "sent" && new Date(q.validUntil).getTime() <= cutoff
  );
}
