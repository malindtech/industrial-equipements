import type { AppData, Order } from "@/types/domain";
import { orderImports } from "@/lib/workflow";

export type NextAction = {
  id: string;
  label: string;
  description: string;
  href: string;
  priority: "high" | "medium" | "low";
};

export function getOrderNextActions(
  order: Order,
  data: Pick<AppData, "imports" | "payments" | "quotes">
): NextAction[] {
  const actions: NextAction[] = [];
  const payment = data.payments.find((p) => p.orderId === order.id);
  const imports = orderImports(order, data.imports);
  const importPending = imports.some(
    (i) => !["arrived", "received_in_stock"].includes(i.status)
  );

  if (order.status === "sourcing" || order.status === "import_in_progress") {
    if (importPending) {
      actions.push({
        id: "track-import",
        label: "Update import status",
        description: "Advance vendor shipment so the order can move to delivery.",
        href: `/orders/${order.id}`,
        priority: "high",
      });
    }
  }

  if (order.status === "ready_to_deliver") {
    if (!order.deliveryScheduledAt) {
      actions.push({
        id: "schedule",
        label: "Schedule customer delivery",
        description: "Set a delivery date before dispatch.",
        href: `/orders/${order.id}`,
        priority: "high",
      });
    } else {
      actions.push({
        id: "deliver",
        label: "Mark delivered",
        description: "Customer received goods — unlocks payment confirmation.",
        href: `/orders/${order.id}`,
        priority: "high",
      });
    }
  }

  if (order.status === "delivered" && payment?.status === "pending") {
    actions.push({
      id: "confirm-receipt",
      label: "Record customer confirmation",
      description: "Customer confirmed receipt — prepare to collect payment.",
      href: `/orders/${order.id}`,
      priority: "high",
    });
  }

  if (payment?.status === "awaiting_confirmation") {
    actions.push({
      id: "collect",
      label: "Record payment received",
      description: "Mark bank transfer / COD collected.",
      href: `/orders/${order.id}`,
      priority: "high",
    });
  }

  return actions;
}

export function collectAllNextActions(data: AppData): NextAction[] {
  const fromOrders = data.orders
    .flatMap((o) => getOrderNextActions(o, data))
    .sort((a, b) => {
      const rank = (p: NextAction) => (p.priority === "high" ? 0 : p.priority === "medium" ? 1 : 2);
      return rank(a) - rank(b);
    });

  const fromQuotes = data.quotes
    .filter((q) => q.status === "sent")
    .map(
      (q): NextAction => ({
        id: `quote-${q.id}`,
        label: `Follow up quote ${q.reference}`,
        description: "Customer has proforma — confirm acceptance or extend validity.",
        href: `/leads/convert/${q.leadId}`,
        priority: "medium",
      })
    );

  const fromLeads = data.leads
    .filter((l) => l.status === "qualified" || l.status === "contacted")
    .slice(0, 3)
    .map(
      (l): NextAction => ({
        id: `lead-${l.id}`,
        label: `Call ${l.contactName}`,
        description: `${l.company} — move toward quote.`,
        href: `/leads/${l.id}`,
        priority: "medium",
      })
    );

  return [...fromOrders, ...fromQuotes, ...fromLeads].slice(0, 12);
}
