"use client";

import { useAppStore } from "@/store/app-store";
import {
  collectedRevenue,
  leadConversionRate,
  lowStockProducts,
  openPipelineValue,
  quotesExpiringSoon,
} from "@/lib/insights";
import { orderMargin } from "@/lib/insights";
import { formatCurrency } from "@/lib/utils";

export function BusinessMetrics() {
  const state = useAppStore();
  const { orders, payments, leads, quotes, inventory, products, vendorPOs } = state;

  const pipeline = openPipelineValue(orders);
  const collected = collectedRevenue(payments);
  const conversion = leadConversionRate(leads);
  const lowStock = lowStockProducts({ products, inventory });
  const expiring = quotesExpiringSoon(quotes);

  const openOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const marginSum = openOrders.reduce((s, o) => {
    const m = orderMargin(o, { inventory, products, vendorPOs });
    return s + m.margin;
  }, 0);

  const cards = [
    { label: "Open pipeline", value: formatCurrency(pipeline), hint: "Active order value" },
    { label: "Est. gross margin", value: formatCurrency(marginSum), hint: "On open orders" },
    { label: "Collected (demo)", value: formatCurrency(collected), hint: "Paid receivables" },
    { label: "Lead → order", value: `${conversion}%`, hint: "Conversion rate" },
    { label: "Low stock SKUs", value: String(lowStock.length), hint: "≤3 units" },
    { label: "Quotes expiring", value: String(expiring.length), hint: "Next 14 days" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm"
        >
          <p className="text-xs font-medium text-slate-500">{c.label}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">{c.value}</p>
          <p className="text-[10px] text-slate-400">{c.hint}</p>
        </div>
      ))}
    </div>
  );
}
