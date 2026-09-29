import type {
  ImportStatus,
  LeadSource,
  LeadStatus,
  OrderStatus,
  PaymentStatus,
} from "@/types/domain";

export const leadSourceLabels: Record<LeadSource, string> = {
  cold_call: "Cold call",
  social_media: "Social media",
  referral: "Referral",
  other: "Other",
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  converted: "Converted",
  lost: "Lost",
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  draft: "Draft",
  confirmed: "Confirmed",
  sourcing: "Sourcing",
  import_in_progress: "Import in progress",
  ready_to_deliver: "Ready to deliver",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const importStatusLabels: Record<ImportStatus, string> = {
  planned: "Planned",
  ordered_from_vendor: "Ordered from vendor",
  in_transit: "In transit",
  customs: "Customs",
  arrived: "Arrived",
  received_in_stock: "Received in stock",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: "Pending delivery",
  awaiting_confirmation: "Awaiting customer confirmation",
  paid: "Paid",
  disputed: "Disputed",
};
