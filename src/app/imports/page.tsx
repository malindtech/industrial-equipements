"use client";

import { Lock } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { PageHeader } from "@/components/layout/page-header";
import { ImportTracker } from "@/components/tracking/import-tracker";

export default function ImportsPage() {
  const { imports } = useAppStore();
  const sorted = [...imports].sort((a, b) => (b.orderedAt ?? "").localeCompare(a.orderedAt ?? ""));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Import tracking"
        description="Internal vendor shipment tracking — linked to orders and products. Customers do not see this view."
      />

      <p className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <Lock className="h-4 w-4 shrink-0" />
        Updating status here adds timeline events and can advance the linked customer order automatically.
      </p>

      <div className="space-y-5">
        {sorted.map((imp) => (
          <ImportTracker key={imp.id} shipment={imp} />
        ))}
      </div>
    </div>
  );
}
