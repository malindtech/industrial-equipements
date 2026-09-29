"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, Package, Ship, TrendingUp } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { orderTotal } from "@/lib/orders";
import { pipelineCounts } from "@/lib/selectors";
import { orderStatusLabels, importStatusLabels } from "@/lib/labels";
import { orderStatusTone, importStatusTone } from "@/lib/status-tones";
import { Badge } from "@/components/ui/badge";
import { TodayPanel } from "@/components/dashboard/today-panel";
import { RoleSwitcher } from "@/components/role/role-switcher";
import { useRoleStore, roleLabels } from "@/store/role-store";
import { BusinessMetrics } from "@/components/dashboard/business-metrics";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { NextActionsPanel } from "@/components/dashboard/next-actions-panel";
import { QuickCreate } from "@/components/dashboard/quick-create";
import { orderMargin } from "@/lib/insights";

const pipelineLabels: Record<string, string> = {
  confirmed: "Confirmed",
  sourcing: "Sourcing",
  import_in_progress: "Importing",
  ready_to_deliver: "Ready",
  awaiting_payment: "Awaiting pay",
};

export default function DashboardPage() {
  const { role } = useRoleStore();
  const state = useAppStore();
  const { orders, imports, payments, customers, leads, products, inventory, vendorPOs } = state;

  const pipeline = pipelineCounts(orders);
  const openOrders = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled");
  const pendingPay = payments.filter((p) => p.status !== "paid");
  const pendingAmount = pendingPay.reduce((s, p) => s + p.amount, 0);
  const activeImports = imports.filter((i) => !["arrived", "received_in_stock"].includes(i.status));

  const attention = [...orders]
    .filter((o) => o.status !== "cancelled")
    .map((o) => {
      const pay = payments.find((p) => p.orderId === o.id);
      const m = orderMargin(o, { inventory, products, vendorPOs });
      const score =
        o.status === "delivered" && pay?.status !== "paid"
          ? 4
          : o.status === "ready_to_deliver"
            ? 3
            : o.status === "import_in_progress"
              ? 2
              : 1;
      return { o, score, pay, m };
    })
    .sort((a, b) => b.score - a.score || b.o.createdAt.localeCompare(a.o.createdAt))
    .slice(0, 6);

  const maxPipeline = Math.max(...Object.values(pipeline), 1);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-10">
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-xl md:px-10 md:py-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-300">EquipFlow · {roleLabels[role]} view</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Your operating picture
            </h1>
            <p className="mt-3 max-w-xl text-sm text-slate-300 md:text-base">
              Metrics, recommended actions, and a live activity stream — every change updates what your team
              should do next.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs text-slate-400">Open orders</p>
              <p className="text-2xl font-semibold">{openOrders.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs text-slate-400">To collect</p>
              <p className="text-2xl font-semibold">{formatCurrency(pendingAmount)}</p>
            </div>
          </div>
        </div>
      </section>

      <BusinessMetrics />

      <QuickCreate />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <TodayPanel />
          <NextActionsPanel />
        </div>
        <div className="lg:col-span-2">
          <ActivityFeed limit={10} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <section className="h-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Order pipeline
              </h2>
              <div className="flex items-center gap-3">
                <Link href="/orders" className="text-sm font-medium text-blue-600 hover:underline">
                  All orders
                </Link>
                <RoleSwitcher />
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {Object.entries(pipeline).map(([key, count]) => (
                <Link
                  key={key}
                  href={`/orders?stage=${key}`}
                  className="group rounded-xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {pipelineLabels[key] ?? key}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{count}</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all group-hover:bg-blue-700"
                      style={{ width: `${(count / maxPipeline) * 100}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900">
                <Ship className="h-4 w-4 text-blue-600" />
                Imports in progress
              </h2>
              <Link href="/imports" className="text-xs font-medium text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            <ul className="mt-4 space-y-3">
              {activeImports.slice(0, 4).map((imp) => (
                <li key={imp.id}>
                  <Link
                    href={imp.orderId ? `/orders/${imp.orderId}` : "/imports"}
                    className="block rounded-xl border border-slate-100 p-3 transition hover:border-blue-200 hover:bg-blue-50/30"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{imp.reference}</span>
                      <Badge tone={importStatusTone[imp.status]} className="text-[10px]">
                        {importStatusLabels[imp.status]}
                      </Badge>
                    </div>
                    {imp.eta ? (
                      <p className="mt-1 text-xs text-slate-400">ETA {formatDate(imp.eta)}</p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <Package className="h-4 w-4 text-emerald-600" />
              Catalog
            </h2>
            <Link
              href="/products"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
            >
              {products.length} products · {leads.filter((l) => l.status !== "lost").length} active leads{" "}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Priority orders</h2>
          <p className="text-sm text-slate-500">Margin and payment status at a glance</p>
        </div>
        <ul className="divide-y divide-slate-100">
          {attention.map(({ o, pay, m }) => {
            const customer = customers.find((c) => c.id === o.customerId);
            return (
              <li key={o.id}>
                <Link
                  href={`/orders/${o.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{o.reference}</p>
                    <p className="truncate text-sm text-slate-500">
                      {customer?.company} · {formatCurrency(orderTotal(o), o.currency)} · margin{" "}
                      {formatCurrency(m.margin, o.currency)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={orderStatusTone[o.status]}>{orderStatusLabels[o.status]}</Badge>
                    {pay && pay.status !== "paid" ? <Badge tone="amber">Payment open</Badge> : null}
                    <ChevronRight className="h-5 w-5 text-slate-300" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
