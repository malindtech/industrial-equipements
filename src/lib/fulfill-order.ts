import type { AppData, Order, QuoteLine } from "@/types/domain";
import { generateId } from "@/lib/utils";
import { nextNumericRef } from "@/lib/reference";
import {
  buildImportForOrder,
  buildVendorPO,
  initialOrderStatus,
  paymentFromOrder,
  quoteLinesToOrderLines,
  reserveStock,
} from "@/lib/order-factory";
import { validateStockForQuoteLines } from "@/lib/stock";

export type OrderLineInput = Omit<QuoteLine, "id">;

export function fulfillNewOrder(
  s: AppData,
  input: {
    customerId: string;
    leadId?: string;
    quoteId?: string;
    currency: string;
    sellingCountry: string;
    notes: string;
    expectedDelivery?: string;
    lines: OrderLineInput[];
  }
): { orderId: string; reference: string; patch: Partial<AppData> } | { error: string } {
  const stockCheck = validateStockForQuoteLines(input.lines, s.inventory);
  if (!stockCheck.ok) return { error: stockCheck.message };

  const orderId = generateId("ord");
  const reference = nextNumericRef(
    "ORD",
    s.orders.map((o) => o.reference)
  );
  const lines = quoteLinesToOrderLines(
    input.lines.map((l) => ({ ...l, id: generateId("ql") })),
    s.products
  );
  const status = initialOrderStatus(lines);

  const order: Order = {
    id: orderId,
    reference,
    customerId: input.customerId,
    leadId: input.leadId,
    quoteId: input.quoteId,
    status,
    lines,
    currency: input.currency,
    sellingCountry: input.sellingCountry,
    notes: input.notes,
    createdAt: new Date().toISOString(),
    expectedDelivery: input.expectedDelivery,
  };

  let imports = [...s.imports];
  let vendorPOs = [...s.vendorPOs];
  const importRefs = imports.map((i) => i.reference);
  const poRefs = vendorPOs.map((p) => p.reference);

  if (lines.some((l) => l.fulfillment === "vendor_import")) {
    const byVendor = new Map<string, string[]>();
    for (const line of lines) {
      if (line.fulfillment !== "vendor_import") continue;
      const product = s.products.find((p) => p.id === line.productId);
      if (!product) continue;
      const list = byVendor.get(product.vendorId) ?? [];
      list.push(line.productId);
      byVendor.set(product.vendorId, list);
    }

    for (const [vendorId, productIds] of byVendor) {
      const vendor = s.vendors.find((v) => v.id === vendorId);
      if (!vendor) continue;
      const imp = buildImportForOrder(order, vendor, productIds, importRefs);
      importRefs.push(imp.reference);
      imports = [...imports, imp];
      const vpo = buildVendorPO(order, vendor, imp.id, productIds, poRefs);
      poRefs.push(vpo.reference);
      vendorPOs = [...vendorPOs, vpo];
      for (const line of order.lines) {
        if (line.fulfillment === "vendor_import" && productIds.includes(line.productId)) {
          line.importShipmentId = imp.id;
        }
      }
    }
  }

  const inventory = reserveStock(s.inventory, lines);
  const payment = paymentFromOrder(order);
  const orderDocuments = [
    {
      id: generateId("doc"),
      orderId,
      type: "proforma" as const,
      name: `${reference}-proforma.pdf`,
      uploadedAt: new Date().toISOString(),
    },
    ...s.orderDocuments,
  ];

  return {
    orderId,
    reference,
    patch: {
      orders: [order, ...s.orders],
      imports,
      vendorPOs,
      inventory,
      payments: [payment, ...s.payments],
      orderDocuments,
    },
  };
}
