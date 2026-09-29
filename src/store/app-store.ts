"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { seedData } from "@/data/seed";
import type {
  AppData,
  CustomerInput,
  DirectOrderInput,
  ImportShipment,
  ImportStatus,
  InteractionChannel,
  Lead,
  LeadStatus,
  Order,
  OrderDocumentType,
  OrderStatus,
  PaymentStatus,
  ProductInput,
  QuoteDraftInput,
  TrackingEvent,
  VendorInput,
} from "@/types/domain";
import { generateId } from "@/lib/utils";
import { orderTotal } from "@/lib/orders";
import { importStatusLabels } from "@/lib/labels";
import { nextNumericRef } from "@/lib/reference";
import { logActivity } from "@/lib/activity";
import { fulfillNewOrder } from "@/lib/fulfill-order";

const PRODUCT_ACCENTS = [
  "from-emerald-500 to-teal-700",
  "from-amber-500 to-orange-700",
  "from-blue-500 to-indigo-700",
  "from-slate-600 to-zinc-800",
  "from-violet-500 to-purple-800",
  "from-rose-500 to-pink-700",
];
import { orderImports } from "@/lib/workflow";
import { useUiStore } from "@/store/ui-store";

export { orderTotal };

type AppState = AppData & {
  resetDemo: () => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  addLead: (lead: Omit<Lead, "id" | "createdAt">) => void;
  addLeadInteraction: (leadId: string, channel: InteractionChannel, summary: string) => void;
  createQuote: (input: QuoteDraftInput) => string;
  sendQuote: (quoteId: string) => void;
  acceptQuoteToOrder: (quoteId: string) => string | null;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  scheduleDelivery: (orderId: string, isoDate: string) => void;
  markDelivered: (orderId: string) => boolean;
  updateImportStatus: (id: string, status: ImportStatus) => void;
  confirmPayment: (paymentId: string) => void;
  markPaymentPaid: (paymentId: string, method: string) => void;
  addOrderDocument: (orderId: string, type: OrderDocumentType, name: string) => void;
  addCustomer: (input: CustomerInput) => string;
  addVendor: (input: VendorInput) => string;
  addProduct: (input: ProductInput) => string;
  createDirectOrder: (input: DirectOrderInput) => string | null;
};

function timelineEntry(status: ImportStatus, detail?: string): TrackingEvent {
  return {
    id: generateId("te"),
    at: new Date().toISOString(),
    status,
    title: importStatusLabels[status],
    detail: detail ?? `Status updated to ${importStatusLabels[status]}.`,
  };
}

function syncOrderFromImport(orderId: string, importStatus: ImportStatus): OrderStatus | null {
  if (["planned", "ordered_from_vendor"].includes(importStatus)) return "sourcing";
  if (["in_transit", "customs"].includes(importStatus)) return "import_in_progress";
  if (importStatus === "arrived") return "ready_to_deliver";
  if (importStatus === "received_in_stock") return "ready_to_deliver";
  return null;
}

function importsBlockingDelivery(order: Order, imports: ImportShipment[]) {
  const linked = orderImports(order, imports);
  if (linked.length === 0) return false;
  return linked.some((i) => !["arrived", "received_in_stock"].includes(i.status));
}

const storage =
  typeof window !== "undefined"
    ? createJSONStorage(() => localStorage)
    : undefined;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...seedData,
      resetDemo: () => {
        set({ ...seedData });
        useUiStore.getState().pushToast("Demo data restored.", "success");
      },
      updateLeadStatus: (id, status) =>
        set((s) => ({
          leads: s.leads.map((l) => (l.id === id ? { ...l, status } : l)),
          activities: logActivity(s.activities, {
            title: "Lead status updated",
            detail: `Lead moved to ${status}.`,
            entityType: "lead",
            entityId: id,
            href: `/leads/${id}`,
          }),
        })),
      addLead: (lead) =>
        set((s) => {
          const id = generateId("led");
          return {
            leads: [{ ...lead, id, createdAt: new Date().toISOString() }, ...s.leads],
            activities: logActivity(s.activities, {
              title: "New lead captured",
              detail: `${lead.company} — ${lead.source.replace("_", " ")}.`,
              entityType: "lead",
              entityId: id,
              href: `/leads/${id}`,
            }),
          };
        }),
      addLeadInteraction: (leadId, channel, summary) =>
        set((s) => ({
          leadInteractions: [
            {
              id: generateId("int"),
              leadId,
              at: new Date().toISOString(),
              channel,
              summary,
            },
            ...s.leadInteractions,
          ],
          activities: logActivity(s.activities, {
            title: "Lead touch logged",
            detail: summary,
            entityType: "lead",
            entityId: leadId,
            href: `/leads/${leadId}`,
          }),
        })),
      createQuote: (input) => {
        const id = generateId("qte");
        const reference = nextNumericRef(
          "QUO",
          get().quotes.map((q) => q.reference)
        );
        const lines = input.lines.map((l) => ({ ...l, id: generateId("ql") }));
        set((s) => ({
          quotes: [
            {
              id,
              reference,
              leadId: input.leadId,
              status: "draft",
              lines,
              currency: input.currency,
              sellingCountry: input.sellingCountry,
              validUntil: input.validUntil,
              notes: input.notes,
              createdAt: new Date().toISOString(),
            },
            ...s.quotes,
          ],
          activities: logActivity(s.activities, {
            title: "Quote drafted",
            detail: `${reference} prepared for lead.`,
            entityType: "quote",
            entityId: id,
            href: `/leads/convert/${input.leadId}`,
          }),
        }));
        return id;
      },
      sendQuote: (quoteId) =>
        set((s) => {
          const q = s.quotes.find((x) => x.id === quoteId);
          return {
            quotes: s.quotes.map((quote) =>
              quote.id === quoteId
                ? { ...quote, status: "sent", sentAt: new Date().toISOString() }
                : quote
            ),
            activities: logActivity(s.activities, {
              title: "Proforma sent",
              detail: q ? `${q.reference} sent to customer.` : "Quote sent.",
              entityType: "quote",
              entityId: quoteId,
              href: q ? `/leads/convert/${q.leadId}` : "/leads",
            }),
          };
        }),
      acceptQuoteToOrder: (quoteId) => {
        const s = get();
        const quote = s.quotes.find((q) => q.id === quoteId);
        const lead = quote ? s.leads.find((l) => l.id === quote.leadId) : undefined;
        if (!quote || !lead || quote.status === "accepted") return null;

        let customerId = lead.customerId;
        let customers = s.customers;
        if (!customerId) {
          customerId = generateId("cus");
          customers = [
            {
              id: customerId,
              name: lead.contactName,
              company: lead.company,
              email: lead.email,
              phone: lead.phone,
              country: quote.sellingCountry,
              industry: lead.industry,
              createdAt: new Date().toISOString(),
            },
            ...customers,
          ];
        }

        const result = fulfillNewOrder(
          { ...s, customers },
          {
            customerId,
            leadId: lead.id,
            quoteId: quote.id,
            currency: quote.currency,
            sellingCountry: quote.sellingCountry,
            notes: quote.notes,
            expectedDelivery: quote.validUntil,
            lines: quote.lines,
          }
        );

        if ("error" in result) {
          useUiStore.getState().pushToast(result.error, "error");
          return null;
        }

        set({
          customers,
          ...result.patch,
          quotes: s.quotes.map((q) =>
            q.id === quoteId ? { ...q, status: "accepted", orderId: result.orderId } : q
          ),
          leads: s.leads.map((l) =>
            l.id === lead.id ? { ...l, status: "converted", customerId } : l
          ),
          activities: logActivity(s.activities, {
            title: "Order created from quote",
            detail: `${result.reference} created.`,
            entityType: "order",
            entityId: result.orderId,
            href: `/orders/${result.orderId}`,
          }),
        });

        useUiStore.getState().pushToast(`Order ${result.reference} created.`, "success");
        return result.orderId;
      },
      addCustomer: (input) => {
        const id = generateId("cus");
        set((s) => ({
          customers: [{ ...input, id, createdAt: new Date().toISOString() }, ...s.customers],
          activities: logActivity(s.activities, {
            title: "Customer added",
            detail: input.company,
            entityType: "customer",
            entityId: id,
            href: `/customers/${id}`,
          }),
        }));
        useUiStore.getState().pushToast(`${input.company} added.`, "success");
        return id;
      },
      addVendor: (input) => {
        const id = generateId("vnd");
        set((s) => ({
          vendors: [{ ...input, id, productIds: [] }, ...s.vendors],
          activities: logActivity(s.activities, {
            title: "Vendor added",
            detail: `${input.name} · ${input.country}`,
            entityType: "vendor",
            entityId: id,
            href: `/vendors/${id}`,
          }),
        }));
        useUiStore.getState().pushToast(`Vendor ${input.name} added.`, "success");
        return id;
      },
      addProduct: (input) => {
        const id = generateId("prd");
        const accent = PRODUCT_ACCENTS[get().products.length % PRODUCT_ACCENTS.length];
        set((s) => {
          const product = {
            id,
            sku: input.sku,
            name: input.name,
            type: input.type,
            industry: input.industry,
            shortDescription: input.shortDescription,
            description: input.description,
            specifications: [] as { label: string; value: string }[],
            vendorId: input.vendorId,
            listPrice: input.listPrice,
            currency: input.currency,
            leadTimeDays: input.leadTimeDays,
            accent,
          };
          const vendors = s.vendors.map((v) =>
            v.id === input.vendorId ? { ...v, productIds: [...v.productIds, id] } : v
          );
          let inventory = s.inventory;
          if (input.initialStock && input.initialStock > 0) {
            inventory = [
              {
                id: generateId("inv"),
                productId: id,
                sku: input.sku,
                name: input.name,
                type: input.type,
                industry: input.industry,
                quantity: input.initialStock,
                unitCost: input.unitCost ?? input.listPrice * 0.75,
                location: input.stockLocation ?? "Warehouse — main",
                updatedAt: new Date().toISOString(),
              },
              ...inventory,
            ];
          }
          return {
            products: [product, ...s.products],
            vendors,
            inventory,
            activities: logActivity(s.activities, {
              title: "Product catalog updated",
              detail: `${input.name} (${input.sku})`,
              entityType: "product",
              entityId: id,
              href: `/products/${id}`,
            }),
          };
        });
        useUiStore.getState().pushToast(`Product ${input.name} added.`, "success");
        return id;
      },
      createDirectOrder: (input) => {
        const s = get();
        const customer = s.customers.find((c) => c.id === input.customerId);
        if (!customer) {
          useUiStore.getState().pushToast("Select a valid customer.", "error");
          return null;
        }
        if (input.lines.length === 0) {
          useUiStore.getState().pushToast("Add at least one line item.", "error");
          return null;
        }
        const result = fulfillNewOrder(s, {
          customerId: input.customerId,
          currency: input.currency,
          sellingCountry: input.sellingCountry,
          notes: input.notes,
          expectedDelivery: input.expectedDelivery,
          lines: input.lines,
        });
        if ("error" in result) {
          useUiStore.getState().pushToast(result.error, "error");
          return null;
        }
        set({
          ...result.patch,
          activities: logActivity(s.activities, {
            title: "Order created",
            detail: `${result.reference} for ${customer.company}.`,
            entityType: "order",
            entityId: result.orderId,
            href: `/orders/${result.orderId}`,
          }),
        });
        useUiStore.getState().pushToast(`Order ${result.reference} created.`, "success");
        return result.orderId;
      },
      updateOrderStatus: (id, status) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          return {
            orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
            activities: logActivity(s.activities, {
              title: "Order status changed",
              detail: order ? `${order.reference} → ${status.replace(/_/g, " ")}.` : status,
              entityType: "order",
              entityId: id,
              href: `/orders/${id}`,
            }),
          };
        }),
      scheduleDelivery: (orderId, isoDate) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === orderId);
          return {
            orders: s.orders.map((o) =>
              o.id === orderId
                ? { ...o, deliveryScheduledAt: isoDate, expectedDelivery: isoDate.slice(0, 10) }
                : o
            ),
            activities: logActivity(s.activities, {
              title: "Delivery scheduled",
              detail: order
                ? `${order.reference} handover set for ${isoDate.slice(0, 10)}.`
                : "Delivery date saved.",
              entityType: "order",
              entityId: orderId,
              href: `/orders/${orderId}`,
            }),
          };
        }),
      markDelivered: (orderId) => {
        const s = get();
        const order = s.orders.find((o) => o.id === orderId);
        if (!order) return false;
        if (importsBlockingDelivery(order, s.imports)) {
          useUiStore.getState().pushToast(
            "Cannot deliver — linked import has not arrived yet.",
            "error"
          );
          return false;
        }
        if (!order.deliveryScheduledAt) {
          useUiStore.getState().pushToast(
            "Schedule delivery first so ops has a committed date.",
            "error"
          );
          return false;
        }
        set({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? { ...o, status: "delivered", deliveredAt: new Date().toISOString() }
              : o
          ),
          activities: logActivity(s.activities, {
            title: "Delivered to customer",
            detail: `${order.reference} — payment confirmation unlocked.`,
            entityType: "order",
            entityId: orderId,
            href: `/orders/${orderId}`,
          }),
        });
        useUiStore.getState().pushToast("Marked delivered — confirm payment when customer approves.", "success");
        return true;
      },
      updateImportStatus: (id, status) =>
        set((s) => {
          const target = s.imports.find((i) => i.id === id);
          const imports = s.imports.map((imp) => {
            if (imp.id !== id) return imp;
            const patch: Partial<ImportShipment> = {
              status,
              timeline: [...imp.timeline, timelineEntry(status)],
            };
            if (status === "in_transit" && !imp.shippedAt) {
              patch.shippedAt = new Date().toISOString();
            }
            if (status === "arrived" || status === "received_in_stock") {
              patch.arrivedAt = new Date().toISOString();
            }
            return { ...imp, ...patch };
          });

          let orders = s.orders;
          if (target?.orderId) {
            const next = syncOrderFromImport(target.orderId, status);
            if (next) {
              orders = orders.map((o) =>
                o.id === target.orderId ? { ...o, status: next } : o
              );
            }
          }

          return {
            imports,
            orders,
            activities: logActivity(s.activities, {
              title: "Import milestone",
              detail: target
                ? `${target.reference}: ${importStatusLabels[status]}.`
                : importStatusLabels[status],
              entityType: "import",
              entityId: id,
              href: target?.orderId ? `/orders/${target.orderId}` : "/imports",
            }),
          };
        }),
      confirmPayment: (paymentId) =>
        set((s) => {
          const pay = s.payments.find((p) => p.id === paymentId);
          const order = pay ? s.orders.find((o) => o.id === pay.orderId) : undefined;
          return {
            payments: s.payments.map((p) =>
              p.id === paymentId
                ? {
                    ...p,
                    status: "awaiting_confirmation" as PaymentStatus,
                    confirmedAt: new Date().toISOString(),
                  }
                : p
            ),
            activities: logActivity(s.activities, {
              title: "Customer confirmed receipt",
              detail: order ? `${order.reference} ready to collect.` : "Receipt confirmed.",
              entityType: "payment",
              entityId: paymentId,
              href: order ? `/orders/${order.id}` : "/payments",
            }),
          };
        }),
      markPaymentPaid: (paymentId, method) =>
        set((s) => {
          const pay = s.payments.find((p) => p.id === paymentId);
          const order = pay ? s.orders.find((o) => o.id === pay.orderId) : undefined;
          return {
            payments: s.payments.map((p) =>
              p.id === paymentId
                ? {
                    ...p,
                    status: "paid" as PaymentStatus,
                    paidAt: new Date().toISOString(),
                    method,
                  }
                : p
            ),
            activities: logActivity(s.activities, {
              title: "Payment recorded",
              detail: order
                ? `${order.reference} — ${method}.`
                : `Paid via ${method}.`,
              entityType: "payment",
              entityId: paymentId,
              href: order ? `/orders/${order.id}` : "/payments",
            }),
          };
        }),
      addOrderDocument: (orderId, type, name) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === orderId);
          return {
            orderDocuments: [
              {
                id: generateId("doc"),
                orderId,
                type,
                name,
                uploadedAt: new Date().toISOString(),
              },
              ...s.orderDocuments,
            ],
            activities: logActivity(s.activities, {
              title: "Document attached",
              detail: order ? `${name} on ${order.reference}.` : name,
              entityType: "order",
              entityId: orderId,
              href: `/orders/${orderId}`,
            }),
          };
        }),
    }),
    {
      name: "equipment-demo-v4",
      storage,
      partialize: (state) => {
        const {
          resetDemo,
          updateLeadStatus,
          addLead,
          addLeadInteraction,
          createQuote,
          sendQuote,
          acceptQuoteToOrder,
          updateOrderStatus,
          scheduleDelivery,
          markDelivered,
          updateImportStatus,
          confirmPayment,
          markPaymentPaid,
          addOrderDocument,
          addCustomer,
          addVendor,
          addProduct,
          createDirectOrder,
          ...data
        } = state;
        void resetDemo;
        void updateLeadStatus;
        void addLead;
        void addLeadInteraction;
        void createQuote;
        void sendQuote;
        void acceptQuoteToOrder;
        void updateOrderStatus;
        void scheduleDelivery;
        void markDelivered;
        void updateImportStatus;
        void confirmPayment;
        void markPaymentPaid;
        void addOrderDocument;
        void addCustomer;
        void addVendor;
        void addProduct;
        void createDirectOrder;
        return data as AppData;
      },
    }
  )
);
