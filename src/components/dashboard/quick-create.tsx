"use client";

import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { Plus, ShoppingCart, Package, Truck, Users, UserPlus } from "lucide-react";

const actions = [
  { href: "/orders/new", label: "Create order", icon: ShoppingCart, desc: "Direct order (skip quote)" },
  { href: "/customers/new", label: "Add customer", icon: UserPlus, desc: "New buyer profile" },
  { href: "/products/new", label: "Add product", icon: Package, desc: "Catalog + optional stock" },
  { href: "/vendors/new", label: "Add vendor", icon: Truck, desc: "Supplier for imports" },
  { href: "/leads", label: "New lead", icon: Users, desc: "Or convert lead → customer" },
];

export function QuickCreate() {
  const { orders, customers, products, vendors, activities } = useAppStore();
  const latest = activities[0];

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold text-slate-900">Quick create</h2>
          <p className="mt-1 text-xs text-slate-500">
            Live counts · {orders.length} orders · {customers.length} customers · {products.length}{" "}
            products · {vendors.length} vendors
          </p>
        </div>
        {latest ? (
          <p className="max-w-xs text-right text-[10px] text-slate-400">
            Latest: {latest.title}
          </p>
        ) : null}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-3 transition hover:border-blue-200 hover:bg-blue-50/60"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white">
              <Icon className="h-4 w-4" />
            </span>
            <span>
              <span className="flex items-center gap-1 text-sm font-medium text-slate-900">
                {label}
                <Plus className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
              </span>
              <span className="text-xs text-slate-500">{desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
