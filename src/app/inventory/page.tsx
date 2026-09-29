"use client";

import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function InventoryPage() {
  const { inventory } = useAppStore();
  const sorted = [...inventory].sort((a, b) => a.name.localeCompare(b.name));
  const totalValue = inventory.reduce((s, i) => s + i.quantity * i.unitCost, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Stock & spare inventory</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Extra machines and parts on hand — available to fulfill orders without import lead time.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[var(--radius-lg)] border bg-white p-5 shadow-[var(--shadow-card)]">
          <p className="text-sm text-[var(--color-muted)]">SKUs</p>
          <p className="text-2xl font-semibold">{inventory.length}</p>
        </div>
        <div className="rounded-[var(--radius-lg)] border bg-white p-5 shadow-[var(--shadow-card)]">
          <p className="text-sm text-[var(--color-muted)]">Total units</p>
          <p className="text-2xl font-semibold">{inventory.reduce((s, i) => s + i.quantity, 0)}</p>
        </div>
        <div className="rounded-[var(--radius-lg)] border bg-white p-5 shadow-[var(--shadow-card)]">
          <p className="text-sm text-[var(--color-muted)]">Book value (cost)</p>
          <p className="text-2xl font-semibold">{formatCurrency(totalValue)}</p>
        </div>
      </div>

      <Card>
        <CardHeader title="Warehouse items" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b bg-slate-50/80 text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <tr>
                <th className="px-5 py-3 font-medium">SKU</th>
                <th className="px-5 py-3 font-medium">Item</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Industry</th>
                <th className="px-5 py-3 font-medium">Qty</th>
                <th className="px-5 py-3 font-medium">Unit cost</th>
                <th className="px-5 py-3 font-medium">Location</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-mono text-xs">{item.sku}</td>
                  <td className="px-5 py-4 font-medium">
                    <Link href={`/products/${item.productId}`} className="hover:text-blue-600">
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone="neutral">{item.type.replace("_", " ")}</Badge>
                  </td>
                  <td className="px-5 py-4">{item.industry}</td>
                  <td className="px-5 py-4">
                    <span className={item.quantity <= 2 ? "font-semibold text-amber-700" : ""}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-5 py-4">{formatCurrency(item.unitCost)}</td>
                  <td className="px-5 py-4 text-xs text-[var(--color-muted)]">
                    {item.location}
                    <br />
                    Updated {formatDate(item.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
