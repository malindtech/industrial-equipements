"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { orderStatusLabels } from "@/lib/labels";
import { orderStatusTone } from "@/lib/status-tones";
import { formatCurrency, formatDate } from "@/lib/utils";
import { orderTotal } from "@/lib/orders";
import { orderMargin } from "@/lib/insights";
function OrdersPageContent() {
  const searchParams = useSearchParams();
  const stageFilter = searchParams.get("stage");
  const state = useAppStore();
  const { orders, customers } = state;
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const sorted = useMemo(() => {
    let list = [...orders];
    if (q.trim()) {
      const term = q.toLowerCase();
      list = list.filter((o) => {
        const c = customers.find((x) => x.id === o.customerId);
        return (
          o.reference.toLowerCase().includes(term) ||
          c?.company.toLowerCase().includes(term) ||
          o.sellingCountry?.toLowerCase().includes(term)
        );
      });
    }
    if (status !== "all") {
      list = list.filter((o) => o.status === status);
    } else if (stageFilter === "awaiting_payment") {
      list = list.filter((o) => o.status === "delivered");
    } else if (stageFilter && stageFilter in orderStatusLabels) {
      list = list.filter((o) => o.status === stageFilter);
    }
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [orders, customers, q, status, stageFilter]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Orders"
        description="Search, filter, and open any order — or create directly for an existing customer."
        action={
          <Link href="/orders/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create order
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search reference, customer, country…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:max-w-xs">
          <option value="all">All statuses</option>
          {Object.entries(orderStatusLabels).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Market</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Margin</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium" aria-hidden />
              </tr>
            </thead>
            <tbody>
              {sorted.map((order) => {
                const customer = customers.find((c) => c.id === order.customerId);
                const m = orderMargin(order, state);
                const fromStock = order.lines.every((l) => l.fulfillment === "stock");
                return (
                  <tr key={order.id} className="group border-b last:border-0 hover:bg-slate-50/80">
                    <td className="px-5 py-4">
                      <Link href={`/orders/${order.id}`} className="font-semibold text-slate-900 hover:text-blue-600">
                        {order.reference}
                      </Link>
                      <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/customers/${order.customerId}`} className="hover:text-blue-600">
                        {customer?.company ?? "—"}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {order.sellingCountry ?? "—"}
                      <br />
                      <span className="text-xs">{fromStock ? "Stock" : "Import"}</span>
                    </td>
                    <td className="px-5 py-4 font-medium">{formatCurrency(orderTotal(order), order.currency)}</td>
                    <td className="px-5 py-4 text-emerald-700">
                      {formatCurrency(m.margin, order.currency)}
                      <span className="text-xs text-slate-400"> ({m.marginPct.toFixed(0)}%)</span>
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={orderStatusTone[order.status]}>
                        {orderStatusLabels[order.status]}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600"
                      >
                        Open
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading orders…</div>}>
      <OrdersPageContent />
    </Suspense>
  );
}
