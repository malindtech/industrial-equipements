"use client";

import Link from "next/link";
import type { Order } from "@/types/domain";
import { useAppStore } from "@/store/app-store";
import { getOrderNextActions } from "@/lib/next-actions";
import { orderMargin } from "@/lib/insights";
import { formatCurrency } from "@/lib/utils";

export function OrderSmartHeader({ order }: { order: Order }) {
  const state = useAppStore();
  const actions = getOrderNextActions(order, state);
  const top = actions[0];
  const margin = orderMargin(order, state);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {top ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Suggested action</p>
          <p className="mt-1 font-medium text-slate-900">{top.label}</p>
          <p className="text-sm text-slate-600">{top.description}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-800">
          No blocking actions on this order.
        </div>
      )}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Commercials</p>
        <div className="mt-2 flex flex-wrap gap-4 text-sm">
          <div>
            <p className="text-slate-500">Revenue</p>
            <p className="font-semibold">{formatCurrency(margin.revenue, order.currency)}</p>
          </div>
          <div>
            <p className="text-slate-500">Est. cost</p>
            <p className="font-semibold">{formatCurrency(margin.cost, order.currency)}</p>
          </div>
          <div>
            <p className="text-slate-500">Margin</p>
            <p className="font-semibold text-emerald-700">
              {formatCurrency(margin.margin, order.currency)} ({margin.marginPct.toFixed(0)}%)
            </p>
          </div>
        </div>
        <Link href="/payments" className="mt-2 inline-block text-xs text-blue-600 hover:underline">
          View receivables
        </Link>
      </div>
    </div>
  );
}
