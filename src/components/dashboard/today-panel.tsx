"use client";

import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { useRoleStore } from "@/store/role-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { quoteStatusLabels } from "@/lib/labels";
import { Phone, Ship, Wallet, FileCheck } from "lucide-react";

export function TodayPanel() {
  const { role } = useRoleStore();
  const { leads, quotes, imports, payments, orders, customers } = useAppStore();

  const leadsToCall = leads.filter((l) => ["new", "contacted", "qualified"].includes(l.status));
  const quotesAwaiting = quotes.filter((q) => q.status === "sent");
  const arrivals = imports.filter((i) => i.eta && !["received_in_stock"].includes(i.status));
  const payQueue = payments.filter((p) => p.status !== "paid");
  const deliveries = orders.filter((o) => o.status === "ready_to_deliver");

  if (role === "sales") {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          <Phone className="h-4 w-4 text-blue-600" />
          Today — Sales
        </h2>
        <ul className="mt-4 space-y-3 text-sm">
          {leadsToCall.slice(0, 4).map((l) => (
            <li key={l.id} className="flex justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <span>
                {l.contactName} · {l.company}
              </span>
              <Link href={`/leads/convert/${l.id}`} className="shrink-0 font-medium text-blue-600 hover:underline">
                Quote
              </Link>
            </li>
          ))}
          {quotesAwaiting.map((q) => {
            const lead = leads.find((l) => l.id === q.leadId);
            return (
              <li key={q.id} className="flex justify-between gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
                <span>
                  {q.reference} · {lead?.company ?? "Lead"}
                </span>
                <span className="text-xs text-amber-800">{quoteStatusLabels.sent}</span>
              </li>
            );
          })}
        </ul>
        <Link href="/leads" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
          Open leads pipeline
        </Link>
      </section>
    );
  }

  if (role === "operations") {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          <Ship className="h-4 w-4 text-blue-600" />
          Today — Operations
        </h2>
        <ul className="mt-4 space-y-3 text-sm">
          {arrivals.slice(0, 3).map((i) => (
            <li key={i.id}>
              <Link
                href={i.orderId ? `/orders/${i.orderId}` : "/imports"}
                className="block rounded-lg bg-slate-50 px-3 py-2 hover:bg-blue-50"
              >
                <span className="font-medium">{i.reference}</span>
                {i.eta ? <span className="text-slate-500"> · ETA {formatDate(i.eta)}</span> : null}
              </Link>
            </li>
          ))}
          {deliveries.map((o) => {
            const c = customers.find((x) => x.id === o.customerId);
            return (
              <li key={o.id}>
                <Link href={`/orders/${o.id}`} className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
                  <FileCheck className="h-4 w-4 text-emerald-600" />
                  Schedule delivery · {o.reference} ({c?.company})
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 font-semibold text-slate-900">
        <Wallet className="h-4 w-4 text-blue-600" />
        Today — Finance
      </h2>
      <ul className="mt-4 space-y-3 text-sm">
        {payQueue.map((p) => {
          const order = orders.find((o) => o.id === p.orderId);
          return (
            <li key={p.id}>
              <Link href={order ? `/orders/${order.id}` : "/payments"} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 hover:bg-blue-50">
                <span>{order?.reference ?? p.orderId}</span>
                <span className="font-medium">{formatCurrency(p.amount, p.currency)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link href="/payments" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
        Receivables
      </Link>
    </section>
  );
}
