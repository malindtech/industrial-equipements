"use client";

import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { PageHeader } from "@/components/layout/page-header";
import { Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VendorsPage() {
  const { vendors, products } = useAppStore();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Vendors"
        description="Global suppliers you import from — each vendor is tied to products and shipment tracking."
        action={
          <Link href="/vendors/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add vendor
            </Button>
          </Link>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {vendors.map((vendor) => {
          const catalog = products.filter((p) => vendor.productIds.includes(p.id));
          return (
            <Link
              key={vendor.id}
              href={`/vendors/${vendor.id}`}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{vendor.name}</h2>
                  <p className="text-sm text-slate-500">
                    {vendor.city}, {vendor.country}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  {vendor.rating}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600 line-clamp-2">{vendor.notes}</p>
              <p className="mt-4 text-xs font-medium text-slate-400">
                {catalog.length} products · ~{vendor.leadTimeDays}d lead time
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
