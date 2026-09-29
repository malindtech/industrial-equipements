import type {
  ImportShipment,
  InventoryItem,
  Order,
  OrderLine,
  Product,
  Quote,
  QuoteLine,
  Vendor,
  VendorPO,
} from "@/types/domain";
import { generateId } from "@/lib/utils";
import { nextNumericRef } from "@/lib/reference";
import { orderTotal } from "@/lib/orders";

export function suggestFulfillment(
  productId: string,
  quantity: number,
  inventory: InventoryItem[]
): "stock" | "vendor_import" {
  const qty = inventory
    .filter((i) => i.productId === productId)
    .reduce((s, i) => s + i.quantity, 0);
  return qty >= quantity ? "stock" : "vendor_import";
}

export function quoteLinesToOrderLines(
  quoteLines: QuoteLine[],
  products: Product[]
): OrderLine[] {
  return quoteLines.map((ql) => {
    const product = products.find((p) => p.id === ql.productId)!;
    return {
      id: generateId("ol"),
      productId: ql.productId,
      description: product.name,
      type: product.type,
      industry: product.industry,
      quantity: ql.quantity,
      unitPrice: ql.unitPrice,
      fulfillment: ql.fulfillment,
    };
  });
}

export function buildImportForOrder(
  order: Order,
  vendor: Vendor,
  productIds: string[],
  importRefs: string[]
): ImportShipment {
  const summary = order.lines
    .filter((l) => l.fulfillment === "vendor_import")
    .map((l) => `${l.quantity}× ${l.description}`)
    .join(", ");
  const now = new Date().toISOString();
  const eta = new Date();
  eta.setDate(eta.getDate() + vendor.leadTimeDays);

  return {
    id: generateId("imp"),
    reference: nextNumericRef("IMP", importRefs),
    vendorId: vendor.id,
    orderId: order.id,
    productIds,
    status: "ordered_from_vendor",
    originCountry: vendor.country,
    destination: "Port / warehouse — local hub",
    itemsSummary: summary,
    orderedAt: now,
    eta: eta.toISOString(),
    trackingNotes: `Auto-created from order ${order.reference}.`,
    internalOnly: true,
    timeline: [
      {
        id: generateId("te"),
        at: now,
        status: "ordered_from_vendor",
        title: "Vendor PO placed",
        detail: `PO issued to ${vendor.name}.`,
        location: `${vendor.city}, ${vendor.country}`,
      },
    ],
  };
}

export function buildVendorPO(
  order: Order,
  vendor: Vendor,
  importId: string | undefined,
  productIds: string[],
  poRefs: string[]
): VendorPO {
  const amount = order.lines
    .filter((l) => l.fulfillment === "vendor_import" && productIds.includes(l.productId))
    .reduce((s, l) => s + l.quantity * l.unitPrice * 0.72, 0);

  return {
    id: generateId("vpo"),
    reference: nextNumericRef("VPO", poRefs),
    orderId: order.id,
    vendorId: vendor.id,
    importShipmentId: importId,
    productIds,
    amount: Math.round(amount),
    currency: order.currency,
    status: "sent",
    orderedAt: new Date().toISOString(),
    notes: `Purchase order for ${order.reference}.`,
  };
}

export function quoteTotal(quote: Pick<Quote, "lines">) {
  return quote.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
}

export function initialOrderStatus(lines: OrderLine[]): Order["status"] {
  const needsImport = lines.some((l) => l.fulfillment === "vendor_import");
  if (needsImport) return "sourcing";
  return "ready_to_deliver";
}

export function reserveStock(
  inventory: InventoryItem[],
  lines: OrderLine[]
): InventoryItem[] {
  const next = inventory.map((i) => ({ ...i }));
  for (const line of lines) {
    if (line.fulfillment !== "stock") continue;
    let remaining = line.quantity;
    for (const row of next.filter((i) => i.productId === line.productId)) {
      if (remaining <= 0) break;
      const take = Math.min(row.quantity, remaining);
      row.quantity -= take;
      remaining -= take;
      row.updatedAt = new Date().toISOString();
    }
  }
  return next;
}

export function paymentFromOrder(order: Order) {
  return {
    id: generateId("pay"),
    orderId: order.id,
    amount: orderTotal(order),
    currency: order.currency,
    status: "pending" as const,
    dueOnDelivery: true as const,
  };
}
