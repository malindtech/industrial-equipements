import type { ImportStatus, LeadStatus, OrderStatus, PaymentStatus } from "@/types/domain";
import type { ComponentProps } from "react";
import type { Badge } from "@/components/ui/badge";

type Tone = NonNullable<ComponentProps<typeof Badge>["tone"]>;

export const leadStatusTone: Record<LeadStatus, Tone> = {
  new: "blue",
  contacted: "violet",
  qualified: "amber",
  converted: "green",
  lost: "red",
};

export const orderStatusTone: Record<OrderStatus, Tone> = {
  draft: "neutral",
  confirmed: "blue",
  sourcing: "violet",
  import_in_progress: "amber",
  ready_to_deliver: "green",
  delivered: "green",
  cancelled: "red",
};

export const importStatusTone: Record<ImportStatus, Tone> = {
  planned: "neutral",
  ordered_from_vendor: "blue",
  in_transit: "amber",
  customs: "violet",
  arrived: "green",
  received_in_stock: "green",
};

export const paymentStatusTone: Record<PaymentStatus, Tone> = {
  pending: "neutral",
  awaiting_confirmation: "amber",
  paid: "green",
  disputed: "red",
};
