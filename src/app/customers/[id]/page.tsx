"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useAppStore, orderTotal } from "@/store/app-store";
import { PageHeader } from "@/components/layout/page-header";
import { formatCurrency, formatDate } from "@/lib/utils";
import { orderStatusLabels } from "@/lib/labels";
import { orderStatusTone } from "@/lib/status-tones";
import { Badge } from "@/components/ui/badge";
import { orderMargin } from "@/lib/insights";
import { paymentStatusLabels } from "@/lib/labels";
import { paymentStatusTone } from "@/lib/status-tones";

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const state = useAppStore();
  const { customers, orders, payments, leads } = state;

  const customer = customers.find((c) => c.id === id);
  if (!customer) notFound();

  const customerOrders = orders.filter((o) => o.customerId === id);
  const lifetime = customerOrders.reduce((s, o) => s + orderTotal(o), 0);
  const totalMargin = customerOrders.reduce(
    (s, o) => s + orderMargin(o, state).margin,
    0
  );
  const relatedLeads = leads.filter((l) => l.customerId === id || l.email === customer.email);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        backHref="/customers"
        title={customer.company}
        description={`${customer.industry} · ${customer.country}`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Lifetime order value</p>
          <p className="text-2xl font-semibold">{formatCurrency(lifetime)}</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Est. total margin</p>
          <p className="text-2xl font-semibold text-emerald-700">{formatCurrency(totalMargin)}</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Orders</p>
          <p className="text-2xl font-semibold">{customerOrders.length}</p>
        </div>
      </div>

      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Contact</h2>
        </div>
        <dl className="grid gap-3 px-5 py-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-400">Name</dt>
            <dd>{customer.name}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Email</dt>
            <dd>{customer.email}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Phone</dt>
            <dd>{customer.phone}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Customer since</dt>
            <dd>{formatDate(customer.createdAt)}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Order history</h2>
        </div>
        <ul className="divide-y">
          {customerOrders.map((o) => {
            const pay = payments.find((p) => p.orderId === o.id);
            const m = orderMargin(o, state);
            return (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <Link href={`/orders/${o.id}`} className="font-medium text-blue-600 hover:underline">
                    {o.reference}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {formatDate(o.createdAt)} · margin {formatCurrency(m.margin, o.currency)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={orderStatusTone[o.status]}>{orderStatusLabels[o.status]}</Badge>
                  {pay ? (
                    <Badge tone={paymentStatusTone[pay.status]}>{paymentStatusLabels[pay.status]}</Badge>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {relatedLeads.length > 0 ? (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Related leads</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {relatedLeads.map((l) => (
              <li key={l.id}>
                <Link href={`/leads/${l.id}`} className="text-blue-600 hover:underline">
                  {l.contactName} · {l.company}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
