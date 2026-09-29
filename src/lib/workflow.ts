import type { ImportShipment, Order, OrderStatus, Payment } from "@/types/domain";
import { importStatusLabels, orderStatusLabels } from "@/lib/labels";

export const orderPipeline: OrderStatus[] = [
  "confirmed",
  "sourcing",
  "import_in_progress",
  "ready_to_deliver",
  "delivered",
];

export type WorkflowStep = {
  id: string;
  label: string;
  description: string;
  state: "done" | "current" | "upcoming" | "skipped";
  at?: string;
};

export function orderImports(order: Order, imports: ImportShipment[]) {
  const ids = new Set(
    order.lines
      .map((l) => l.importShipmentId)
      .filter((id): id is string => Boolean(id))
  );
  return imports.filter((i) => i.orderId === order.id || ids.has(i.id));
}

export function buildOrderWorkflow(
  order: Order,
  imports: ImportShipment[],
  payment?: Payment
): WorkflowStep[] {
  const linked = orderImports(order, imports);
  const needsImport = order.lines.some((l) => l.fulfillment === "vendor_import");
  const importComplete =
    !needsImport ||
    linked.every((i) => ["arrived", "received_in_stock"].includes(i.status));
  const importStarted = linked.some((i) => i.status !== "planned");

  const statusIndex = orderPipeline.indexOf(
    order.status === "draft" || order.status === "cancelled" ? "confirmed" : order.status
  );

  const steps: Omit<WorkflowStep, "state">[] = [
    {
      id: "confirmed",
      label: "Order confirmed",
      description: "Customer request locked — sourcing begins.",
    },
    {
      id: "sourcing",
      label: needsImport ? "Vendor sourcing" : "Allocate from stock",
      description: needsImport
        ? "PO placed with international vendor."
        : "Items reserved from warehouse.",
    },
    {
      id: "import_in_progress",
      label: needsImport ? "Import in transit" : "Preparing shipment",
      description: needsImport
        ? "Internal tracking until goods arrive locally."
        : "Quality check and dispatch prep.",
    },
    {
      id: "ready_to_deliver",
      label: "Ready to deliver",
      description: "Goods available for customer handover.",
    },
    {
      id: "delivered",
      label: "Delivered",
      description: "Customer received equipment — confirm for payment.",
    },
    {
      id: "paid",
      label: "Payment collected",
      description: "Pay-on-delivery settlement complete.",
    },
  ];

  return steps.map((step, index) => {
    let state: WorkflowStep["state"] = "upcoming";

    if (order.status === "cancelled") {
      state = index === 0 ? "done" : "skipped";
      return { ...step, state };
    }

    if (step.id === "paid") {
      if (payment?.status === "paid") state = "done";
      else if (order.status === "delivered") state = "current";
      else state = "upcoming";
      return {
        ...step,
        state,
        at: payment?.paidAt,
      };
    }

    const stepStatus = step.id as OrderStatus;
    const pipelineIdx = orderPipeline.indexOf(stepStatus);
    if (pipelineIdx === -1) {
      state = payment?.status === "paid" ? "done" : "upcoming";
      return { ...step, state };
    }

    if (order.status === "delivered" && pipelineIdx <= orderPipeline.indexOf("delivered")) {
      state = "done";
    } else if (pipelineIdx < statusIndex) {
      state = "done";
    } else if (pipelineIdx === statusIndex) {
      state = "current";
    } else {
      state = "upcoming";
    }

    if (step.id === "import_in_progress" && needsImport && importStarted && !importComplete) {
      state = "current";
    }
    if (step.id === "import_in_progress" && needsImport && importComplete && order.status !== "delivered") {
      state = "done";
    }

    return {
      ...step,
      state,
      at:
        step.id === "delivered" && order.status === "delivered"
          ? order.expectedDelivery
          : undefined,
    };
  });
}

export function importProgress(status: ImportShipment["status"]) {
  const stages: ImportShipment["status"][] = [
    "planned",
    "ordered_from_vendor",
    "in_transit",
    "customs",
    "arrived",
    "received_in_stock",
  ];
  const idx = stages.indexOf(status);
  return { idx, total: stages.length, label: importStatusLabels[status] };
}

export function orderStatusLabel(status: OrderStatus) {
  return orderStatusLabels[status];
}
