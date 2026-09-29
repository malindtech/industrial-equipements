import type { AppData, Order, Product } from "@/types/domain";
import { orderTotal } from "@/lib/orders";

export function getProduct(data: Pick<AppData, "products">, id: string): Product | undefined {
  return data.products.find((p) => p.id === id);
}

export function getVendor(data: Pick<AppData, "vendors">, id: string) {
  return data.vendors.find((v) => v.id === id);
}

export function stockForProduct(
  inventory: AppData["inventory"],
  productId: string
): number {
  return inventory
    .filter((i) => i.productId === productId)
    .reduce((s, i) => s + i.quantity, 0);
}

export function ordersForProduct(orders: Order[], productId: string) {
  return orders.filter((o) => o.lines.some((l) => l.productId === productId));
}

export function pipelineCounts(orders: Order[]) {
  const buckets: Record<string, number> = {
    confirmed: 0,
    sourcing: 0,
    import_in_progress: 0,
    ready_to_deliver: 0,
    awaiting_payment: 0,
  };
  for (const o of orders) {
    if (o.status === "cancelled" || o.status === "draft") continue;
    if (["confirmed", "sourcing", "import_in_progress", "ready_to_deliver"].includes(o.status)) {
      buckets[o.status] += 1;
    }
    if (o.status === "delivered") buckets.awaiting_payment += 1;
  }
  return buckets;
}

export function orderAttentionScore(order: Order, paid: boolean) {
  if (order.status === "ready_to_deliver") return 3;
  if (order.status === "import_in_progress") return 2;
  if (order.status === "delivered" && !paid) return 4;
  return 1;
}

export function formatOrderValue(order: Order) {
  return orderTotal(order);
}
