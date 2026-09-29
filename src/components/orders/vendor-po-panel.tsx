"use client";

import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import type { Order } from "@/types/domain";
import { vendorPOStatusLabels } from "@/lib/labels";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function VendorPOPanel({ order }: { order: Order }) {
  const { vendorPOs, vendors } = useAppStore();
  const pos = vendorPOs.filter((p) => p.orderId === order.id);

  if (pos.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-sm text-slate-500">
        No vendor purchase orders — stock-only fulfillment.
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Vendor purchase orders</h2>
      <ul className="mt-4 space-y-4">
        {pos.map((po) => {
          const vendor = vendors.find((v) => v.id === po.vendorId);
          return (
            <li key={po.id} className="rounded-xl border border-slate-100 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{po.reference}</p>
                <Badge tone={po.status === "acknowledged" ? "green" : "blue"}>
                  {vendorPOStatusLabels[po.status]}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                <Link href={`/vendors/${po.vendorId}`} className="text-blue-600 hover:underline">
                  {vendor?.name}
                </Link>
                {" · "}
                {formatCurrency(po.amount, po.currency)}
              </p>
              {po.orderedAt ? (
                <p className="mt-1 text-xs text-slate-500">Sent {formatDate(po.orderedAt)}</p>
              ) : null}
              <p className="mt-2 text-xs text-slate-500">{po.notes}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
