"use client";

import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { importStatusLabels } from "@/lib/labels";
import { importStatusTone } from "@/lib/status-tones";
import { importProgress } from "@/lib/workflow";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import type { ImportShipment, ImportStatus } from "@/types/domain";
import { useAppStore } from "@/store/app-store";
import { ChevronRight, MapPin } from "lucide-react";

export function ImportTracker({
  shipment,
  showOrderLink = true,
}: {
  shipment: ImportShipment;
  showOrderLink?: boolean;
}) {
  const { vendors, orders, updateImportStatus } = useAppStore();
  const vendor = vendors.find((v) => v.id === shipment.vendorId);
  const order = shipment.orderId ? orders.find((o) => o.id === shipment.orderId) : undefined;
  const { idx, total } = importProgress(shipment.status);
  const timeline = [...shipment.timeline].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900">{shipment.reference}</h3>
            <Badge tone={importStatusTone[shipment.status]}>
              {importStatusLabels[shipment.status]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {vendor?.name} · {shipment.originCountry} → {shipment.destination}
          </p>
          {showOrderLink && order ? (
            <Link
              href={`/orders/${order.id}`}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
            >
              Customer order {order.reference}
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
        <Select
          className="w-52 text-xs"
          value={shipment.status}
          onChange={(e) => updateImportStatus(shipment.id, e.target.value as ImportStatus)}
          aria-label="Update import status"
        >
          {Object.entries(importStatusLabels).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </div>

      <p className="mt-4 text-sm text-slate-700">{shipment.itemsSummary}</p>

      <div className="mt-4 flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-blue-600" : "bg-slate-200"}`}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
        {shipment.eta ? <span>ETA {formatDate(shipment.eta)}</span> : null}
        {shipment.trackingNotes ? <span>{shipment.trackingNotes}</span> : null}
      </div>

      <div className="mt-6 border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Live timeline</p>
        <ul className="mt-3 space-y-4">
          {timeline.map((ev, i) => (
            <li key={ev.id} className="relative flex gap-3 pl-1">
              {i < timeline.length - 1 ? (
                <span className="absolute left-[7px] top-6 h-full w-px bg-slate-200" />
              ) : null}
              <span
                className={`relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                  i === 0 ? "bg-blue-600 ring-4 ring-blue-100" : "bg-slate-300"
                }`}
              />
              <div>
                <p className="text-sm font-medium text-slate-900">{ev.title}</p>
                <p className="text-sm text-slate-500">{ev.detail}</p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  {formatDate(ev.at)}
                  {ev.location ? (
                    <>
                      <MapPin className="h-3 w-3" />
                      {ev.location}
                    </>
                  ) : null}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
