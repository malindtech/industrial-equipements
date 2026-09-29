"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { PageHeader } from "@/components/layout/page-header";
import { WorkflowTimeline } from "@/components/workflow/workflow-timeline";
import { ImportTracker } from "@/components/tracking/import-tracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { buildOrderWorkflow, orderImports } from "@/lib/workflow";
import { orderStatusLabels, paymentStatusLabels } from "@/lib/labels";
import { orderStatusTone, paymentStatusTone } from "@/lib/status-tones";
import { formatCurrency, formatDate } from "@/lib/utils";
import { orderTotal } from "@/lib/orders";
import type { OrderStatus } from "@/types/domain";
import { ExternalLink } from "lucide-react";
import { DeliveryPanel } from "@/components/orders/delivery-panel";
import { DocumentsPanel } from "@/components/orders/documents-panel";
import { VendorPOPanel } from "@/components/orders/vendor-po-panel";
import { OrderSmartHeader } from "@/components/orders/order-smart-header";

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const {
    orders,
    customers,
    leads,
    products,
    vendors,
    imports,
    payments,
    updateOrderStatus,
    confirmPayment,
    markPaymentPaid,
    quotes,
  } = useAppStore();

  const order = orders.find((o) => o.id === id);
  if (!order) notFound();

  const customer = customers.find((c) => c.id === order.customerId);
  const lead = order.leadId ? leads.find((l) => l.id === order.leadId) : undefined;
  const payment = payments.find((p) => p.orderId === order.id);
  const linkedImports = orderImports(order, imports);
  const workflow = buildOrderWorkflow(order, imports, payment);
  const quote = order.quoteId ? quotes.find((q) => q.id === order.quoteId) : undefined;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        backHref="/orders"
        title={order.reference}
        description={`${customer?.company ?? "Customer"} · ${order.sellingCountry} · ${order.currency} · Created ${formatDate(order.createdAt)}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={orderStatusTone[order.status]}>{orderStatusLabels[order.status]}</Badge>
            <span className="text-lg font-semibold">{formatCurrency(orderTotal(order), order.currency)}</span>
          </div>
        }
      />

      <OrderSmartHeader order={order} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Order workflow</h2>
            <p className="mt-1 text-sm text-slate-500">
              Lead → confirm → source/import → deliver → collect payment on confirmation.
            </p>
            <div className="mt-6">
              <WorkflowTimeline steps={workflow} />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
              <label className="text-sm font-medium text-slate-700">Update stage</label>
              <Select
                className="max-w-xs"
                value={order.status}
                onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
              >
                {Object.entries(orderStatusLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Line items</h2>
            <ul className="mt-4 divide-y divide-slate-100">
              {order.lines.map((line) => {
                const product = products.find((p) => p.id === line.productId);
                const vendor = product ? vendors.find((v) => v.id === product.vendorId) : undefined;
                return (
                  <li key={line.id} className="flex flex-wrap items-start justify-between gap-4 py-4 first:pt-0">
                    <div>
                      <Link
                        href={`/products/${line.productId}`}
                        className="font-medium text-slate-900 hover:text-blue-600"
                      >
                        {line.quantity}× {line.description}
                      </Link>
                      <p className="mt-1 text-sm text-slate-500">
                        {product?.sku} · {line.industry}
                        {vendor ? (
                          <>
                            {" "}
                            ·{" "}
                            <Link href={`/vendors/${vendor.id}`} className="text-blue-600 hover:underline">
                              {vendor.name}
                            </Link>
                          </>
                        ) : null}
                      </p>
                      <Badge tone={line.fulfillment === "stock" ? "green" : "amber"} className="mt-2">
                        {line.fulfillment === "stock" ? "From stock" : "Vendor import"}
                      </Badge>
                    </div>
                    <p className="font-semibold">{formatCurrency(line.quantity * line.unitPrice, order.currency)}</p>
                  </li>
                );
              })}
            </ul>
            {order.notes ? (
              <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{order.notes}</p>
            ) : null}
          </section>

          <VendorPOPanel order={order} />

          {linkedImports.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Internal import tracking
              </h2>
              {linkedImports.map((imp) => (
                <ImportTracker key={imp.id} shipment={imp} showOrderLink={false} />
              ))}
            </section>
          ) : (
            <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-sm text-slate-500">
              No vendor import linked — this order is fulfilled entirely from stock.
            </section>
          )}

          <DocumentsPanel order={order} />
        </div>

        <aside className="space-y-6">
          <DeliveryPanel order={order} />
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Customer</h2>
            {customer ? (
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-slate-400">Company</dt>
                  <dd className="font-medium">{customer.company}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Contact</dt>
                  <dd>{customer.name}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Phone</dt>
                  <dd>{customer.phone}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Country</dt>
                  <dd>{customer.country}</dd>
                </div>
              </dl>
            ) : null}
            <Link
              href="/customers"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
            >
              All customers <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          {lead ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Originating lead</h2>
              <p className="mt-2 text-sm font-medium">{lead.contactName}</p>
              <p className="text-sm text-slate-500">{lead.company}</p>
              <Link href="/leads" className="mt-3 text-sm text-blue-600 hover:underline">
                View leads pipeline
              </Link>
            </div>
          ) : null}

          {quote ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Source quote</h2>
              <p className="mt-2 font-mono text-sm">{quote.reference}</p>
              <p className="text-xs text-slate-500">Proforma accepted · pay on delivery</p>
            </div>
          ) : null}

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Payment (on delivery)</h2>
            {payment ? (
              <>
                <p className="mt-2 text-2xl font-semibold">
                  {formatCurrency(payment.amount, payment.currency)}
                </p>
                <Badge tone={paymentStatusTone[payment.status]} className="mt-2">
                  {paymentStatusLabels[payment.status]}
                </Badge>
                <div className="mt-4 flex flex-col gap-2">
                  {payment.status === "pending" && order.status === "delivered" ? (
                    <Button variant="secondary" onClick={() => confirmPayment(payment.id)}>
                      Customer confirmed receipt
                    </Button>
                  ) : null}
                  {payment.status === "awaiting_confirmation" ? (
                    <Button onClick={() => markPaymentPaid(payment.id, "Bank transfer")}>
                      Record payment
                    </Button>
                  ) : null}
                  {order.status !== "delivered" && payment.status === "pending" ? (
                    <p className="text-xs text-slate-500">Payment unlocks after delivery is marked.</p>
                  ) : null}
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No payment record for this order.</p>
            )}
          </div>

          {order.expectedDelivery ? (
            <div className="rounded-2xl bg-slate-900 p-5 text-white">
              <p className="text-xs uppercase tracking-wide text-slate-400">Target delivery</p>
              <p className="mt-1 text-xl font-semibold">{formatDate(order.expectedDelivery)}</p>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
