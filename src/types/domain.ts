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
  /** Demo accent for product cards (no external images) */
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

export interface Order {
  id: string;
  reference: string;
  customerId: string;
  leadId?: string;
  status: OrderStatus;
  lines: OrderLine[];
  currency: string;
  notes: string;
  createdAt: string;
  expectedDelivery?: string;
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
  vendors: Vendor[];
  products: Product[];
  orders: Order[];
  imports: ImportShipment[];
  inventory: InventoryItem[];
  payments: Payment[];
}
