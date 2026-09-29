"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { orderStatusLabels } from "@/lib/labels";
import { orderStatusTone } from "@/lib/status-tones";
import { formatCurrency, formatDate } from "@/lib/utils";
import { orderTotal } from "@/lib/orders";

export default function OrdersPage() {
  const { orders, customers } = useAppStore();
  const sorted = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Orders"
        description="Select an order to see workflow steps, line items, vendor imports, and payment status."
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Fulfillment</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium" aria-hidden />
              </tr>
            </thead>
            <tbody>
              {sorted.map((order) => {
                const customer = customers.find((c) => c.id === order.customerId);
                const fromStock = order.lines.every((l) => l.fulfillment === "stock");
                return (
                  <tr key={order.id} className="group border-b last:border-0">
                    <td className="px-5 py-4">
                      <Link href={`/orders/${order.id}`} className="font-semibold text-slate-900 hover:text-blue-600">
                        {order.reference}
                      </Link>
                      <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p>{customer?.company ?? "—"}</p>
                      <p className="text-xs text-slate-500">{customer?.name}</p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={fromStock ? "green" : "amber"}>
                        {fromStock ? "Stock" : "Import"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 font-medium">{formatCurrency(orderTotal(order), order.currency)}</td>
                    <td className="px-5 py-4">
                      <Badge tone={orderStatusTone[order.status]}>
                        {orderStatusLabels[order.status]}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 opacity-80 transition group-hover:opacity-100"
                      >
                        Details
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
