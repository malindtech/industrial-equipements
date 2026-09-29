export type LeadSource = "cold_call" | "social_media" | "referral" | "other";
export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

export type OrderStatus =
  | "draft"
  | "confirmed"
  | "sourcing"
  | "import_in_progress"
  | "ready_to_deliver"
  | "delivered"
  | "cancelled";

export type ImportStatus =
  | "planned"
  | "ordered_from_vendor"
  | "in_transit"
  | "customs"
  | "arrived"
  | "received_in_stock";

export type PaymentStatus = "pending" | "awaiting_confirmation" | "paid" | "disputed";

export type ItemType = "full_machine" | "part" | "accessory";

export type QuoteStatus = "draft" | "sent" | "accepted" | "expired";

export type VendorPOStatus = "draft" | "sent" | "acknowledged";

export type OrderDocumentType =
  | "proforma"
  | "invoice"
  | "packing_list"
  | "bill_of_lading"
  | "other";

export type DemoRole = "sales" | "operations" | "finance";

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  industry: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  contactName: string;
  company: string;
  phone: string;
  email: string;
  source: LeadSource;
  status: LeadStatus;
  industry: string;
  notes: string;
  createdAt: string;
  customerId?: string;
  interestedProductIds?: string[];
  nextFollowUpAt?: string;
}

export type InteractionChannel = "call" | "whatsapp" | "email" | "meeting";

export interface LeadInteraction {
  id: string;
  leadId: string;
  at: string;
  channel: InteractionChannel;
  summary: string;
}

export type ActivityEntityType =
  | "order"
  | "lead"
  | "import"
  | "payment"
  | "quote"
  | "customer"
  | "product"
  | "vendor";

export interface ActivityEvent {
  id: string;
  at: string;
  title: string;
  detail: string;
  entityType: ActivityEntityType;
  entityId: string;
  href: string;
}

export interface Vendor {
  id: string;
  name: string;
  country: string;
  city: string;
  contactEmail: string;
  contactPhone: string;
  leadTimeDays: number;
  specialties: string[];
  productIds: string[];
  notes: string;
  rating: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  type: ItemType;
  industry: string;
  shortDescription: string;
  description: string;
  specifications: { label: string; value: string }[];
  vendorId: string;
  listPrice: number;
  currency: string;
  leadTimeDays: number;
  accent: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  type: ItemType;
  industry: string;
  quantity: number;
  unitCost: number;
  location: string;
  updatedAt: string;
}

export interface OrderLine {
  id: string;
  productId: string;
  description: string;
  type: ItemType;
  industry: string;
  quantity: number;
  unitPrice: number;
  fulfillment: "stock" | "vendor_import";
  importShipmentId?: string;
}

export interface QuoteLine {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  fulfillment: "stock" | "vendor_import";
}

export interface Quote {
  id: string;
  reference: string;
  leadId: string;
  status: QuoteStatus;
  lines: QuoteLine[];
  currency: string;
  sellingCountry: string;
  validUntil: string;
  notes: string;
  createdAt: string;
  sentAt?: string;
  orderId?: string;
}

export interface Order {
  id: string;
  reference: string;
  customerId: string;
  leadId?: string;
  quoteId?: string;
  status: OrderStatus;
  lines: OrderLine[];
  currency: string;
  sellingCountry: string;
  notes: string;
  createdAt: string;
  expectedDelivery?: string;
  deliveryScheduledAt?: string;
  deliveredAt?: string;
}

export interface VendorPO {
  id: string;
  reference: string;
  orderId: string;
  vendorId: string;
  importShipmentId?: string;
  productIds: string[];
  amount: number;
  currency: string;
  status: VendorPOStatus;
  orderedAt?: string;
  notes: string;
}

export interface OrderDocument {
  id: string;
  orderId: string;
  type: OrderDocumentType;
  name: string;
  uploadedAt: string;
}

export interface TrackingEvent {
  id: string;
  at: string;
  status: ImportStatus;
  title: string;
  detail: string;
  location?: string;
}

export interface ImportShipment {
  id: string;
  reference: string;
  vendorId: string;
  orderId?: string;
  productIds: string[];
  status: ImportStatus;
  originCountry: string;
  destination: string;
  itemsSummary: string;
  orderedAt?: string;
  shippedAt?: string;
  eta?: string;
  arrivedAt?: string;
  trackingNotes: string;
  timeline: TrackingEvent[];
  internalOnly: true;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  dueOnDelivery: true;
  confirmedAt?: string;
  paidAt?: string;
  method?: string;
}

export interface AppData {
  customers: Customer[];
  leads: Lead[];
  leadInteractions: LeadInteraction[];
  vendors: Vendor[];
  products: Product[];
  quotes: Quote[];
  orders: Order[];
  vendorPOs: VendorPO[];
  orderDocuments: OrderDocument[];
  imports: ImportShipment[];
  inventory: InventoryItem[];
  payments: Payment[];
  activities: ActivityEvent[];
}

export type QuoteDraftInput = {
  leadId: string;
  currency: string;
  sellingCountry: string;
  validUntil: string;
  notes: string;
  lines: Omit<QuoteLine, "id">[];
};

export type CustomerInput = Omit<Customer, "id" | "createdAt">;

export type VendorInput = Omit<Vendor, "id" | "productIds">;

export type ProductInput = {
  sku: string;
  name: string;
  type: ItemType;
  industry: string;
  shortDescription: string;
  description: string;
  vendorId: string;
  listPrice: number;
  currency: string;
  leadTimeDays: number;
  initialStock?: number;
  stockLocation?: string;
  unitCost?: number;
};

export type DirectOrderInput = {
  customerId: string;
  currency: string;
  sellingCountry: string;
  notes: string;
  expectedDelivery?: string;
  lines: Omit<QuoteLine, "id">[];
};
