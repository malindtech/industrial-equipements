"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { stockForProduct, ordersForProduct } from "@/lib/selectors";
import { orderTotal } from "@/lib/orders";
import { orderStatusLabels } from "@/lib/labels";
import { orderStatusTone } from "@/lib/status-tones";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { products, vendors, inventory, orders, imports } = useAppStore();

  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  const vendor = vendors.find((v) => v.id === product.vendorId);
  const qty = stockForProduct(inventory, product.id);
  const relatedOrders = ordersForProduct(orders, product.id);
  const relatedImports = imports.filter((i) => i.productIds.includes(product.id));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader backHref="/products" title={product.name} description={product.shortDescription} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className={`overflow-hidden rounded-2xl bg-gradient-to-br ${product.accent} p-8 text-white shadow-lg`}>
            <p className="font-mono text-sm opacity-90">{product.sku}</p>
            <p className="mt-4 text-3xl font-semibold">{formatCurrency(product.listPrice, product.currency)}</p>
            <p className="mt-2 text-sm opacity-90">
              {product.industry} · {product.type.replace("_", " ")} · {product.leadTimeDays} day vendor lead
            </p>
          </div>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Description</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{product.description}</p>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Specifications</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {product.specifications.map((spec) => (
                <div key={spec.label} className="rounded-lg bg-slate-50 px-4 py-3">
                  <dt className="text-xs font-medium uppercase text-slate-400">{spec.label}</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {relatedOrders.length > 0 ? (
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-slate-900">Active & recent orders</h2>
              <ul className="mt-4 divide-y divide-slate-100">
                {relatedOrders.map((o) => (
                  <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <Link href={`/orders/${o.id}`} className="font-medium text-blue-600 hover:underline">
                      {o.reference}
                    </Link>
                    <div className="flex items-center gap-2">
                      <Badge tone={orderStatusTone[o.status]}>{orderStatusLabels[o.status]}</Badge>
                      <span className="text-sm text-slate-500">{formatCurrency(orderTotal(o))}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Stock</h2>
            <p className="mt-2 text-3xl font-semibold">{qty}</p>
            <p className="text-sm text-slate-500">units across warehouses</p>
            <Link href="/inventory" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
              View stock locations
            </Link>
          </div>

          {vendor ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Primary vendor</h2>
              <Link href={`/vendors/${vendor.id}`} className="mt-2 block text-lg font-medium text-blue-600 hover:underline">
                {vendor.name}
              </Link>
              <p className="text-sm text-slate-500">
                {vendor.city}, {vendor.country}
              </p>
              <p className="mt-2 text-sm text-slate-600">{vendor.contactEmail}</p>
            </div>
          ) : null}

          {relatedImports.length > 0 ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Import activity</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {relatedImports.map((imp) => (
                  <li key={imp.id}>
                    <Link href={imp.orderId ? `/orders/${imp.orderId}` : "/imports"} className="text-blue-600 hover:underline">
                      {imp.reference}
                    </Link>
                    <p className="text-xs text-slate-500">{imp.itemsSummary}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="text-xs text-slate-400">Catalog updated {formatDate(new Date().toISOString())}</p>
        </aside>
      </div>
    </div>
  );
}
