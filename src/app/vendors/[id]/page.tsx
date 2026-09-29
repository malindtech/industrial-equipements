"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { PageHeader } from "@/components/layout/page-header";
import { formatCurrency } from "@/lib/utils";
import { ImportTracker } from "@/components/tracking/import-tracker";
import { Mail, Phone, Star } from "lucide-react";

export default function VendorDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { vendors, products, imports } = useAppStore();

  const vendor = vendors.find((v) => v.id === id);
  if (!vendor) notFound();

  const catalog = products.filter((p) => vendor.productIds.includes(p.id));
  const vendorImports = imports.filter((i) => i.vendorId === vendor.id);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        backHref="/vendors"
        title={vendor.name}
        description={`${vendor.city}, ${vendor.country} · ${vendor.specialties.join(" · ")}`}
        action={
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-900">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            {vendor.rating} supplier score
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Products supplied</h2>
            <ul className="mt-4 divide-y divide-slate-100">
              {catalog.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <Link href={`/products/${p.id}`} className="font-medium text-blue-600 hover:underline">
                    {p.name}
                  </Link>
                  <span className="text-sm text-slate-500">
                    {p.sku} · {formatCurrency(p.listPrice, p.currency)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Shipments from this vendor
            </h2>
            {vendorImports.length ? (
              vendorImports.map((imp) => <ImportTracker key={imp.id} shipment={imp} />)
            ) : (
              <p className="text-sm text-slate-500">No active shipments.</p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Contact</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2 text-slate-600">
                <Mail className="h-4 w-4 text-slate-400" />
                {vendor.contactEmail}
              </li>
              <li className="flex items-center gap-2 text-slate-600">
                <Phone className="h-4 w-4 text-slate-400" />
                {vendor.contactPhone}
              </li>
            </ul>
            <p className="mt-4 text-sm text-slate-500">Typical lead time: {vendor.leadTimeDays} days</p>
          </div>
          <div className="rounded-2xl bg-slate-900 p-5 text-white">
            <p className="text-xs uppercase tracking-wide text-slate-400">Notes</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">{vendor.notes}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
