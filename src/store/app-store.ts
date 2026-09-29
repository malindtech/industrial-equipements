"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { seedData } from "@/data/seed";
import type {
  AppData,
  ImportShipment,
  ImportStatus,
  Lead,
  LeadStatus,
  OrderStatus,
  PaymentStatus,
  TrackingEvent,
} from "@/types/domain";
import { generateId } from "@/lib/utils";
import { orderTotal } from "@/lib/orders";
import { importStatusLabels } from "@/lib/labels";

export { orderTotal };

type AppState = AppData & {
  resetDemo: () => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  addLead: (lead: Omit<Lead, "id" | "createdAt">) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updateImportStatus: (id: string, status: ImportStatus) => void;
  confirmPayment: (paymentId: string) => void;
  markPaymentPaid: (paymentId: string, method: string) => void;
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

const storage =
  typeof window !== "undefined"
    ? createJSONStorage(() => localStorage)
    : undefined;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...seedData,
      resetDemo: () => set({ ...seedData }),
      updateLeadStatus: (id, status) =>
        set((s) => ({
          leads: s.leads.map((l) => (l.id === id ? { ...l, status } : l)),
        })),
      addLead: (lead) =>
        set((s) => ({
          leads: [
            {
              ...lead,
              id: generateId("led"),
              createdAt: new Date().toISOString(),
            },
            ...s.leads,
          ],
        })),
      updateOrderStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),
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
          return { imports, orders };
        }),
      confirmPayment: (paymentId) =>
        set((s) => ({
          payments: s.payments.map((p) =>
            p.id === paymentId
              ? {
                  ...p,
                  status: "awaiting_confirmation" as PaymentStatus,
                  confirmedAt: new Date().toISOString(),
                }
              : p
          ),
        })),
      markPaymentPaid: (paymentId, method) =>
        set((s) => ({
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
        })),
    }),
    {
      name: "equipment-demo-v2",
      storage,
      partialize: (state) => {
        const {
          resetDemo,
          updateLeadStatus,
          addLead,
          updateOrderStatus,
          updateImportStatus,
          confirmPayment,
          markPaymentPaid,
          ...data
        } = state;
        void resetDemo;
        void updateLeadStatus;
        void addLead;
        void updateOrderStatus;
        void updateImportStatus;
        void confirmPayment;
        void markPaymentPaid;
        return data as AppData;
      },
    }
  )
);
