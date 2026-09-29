"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { orderTotal } from "@/lib/orders";
import { formatCurrency } from "@/lib/utils";

export function GlobalSearch() {
  const { orders, leads, products, customers } = useAppStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [];
    const items: { href: string; label: string; meta: string }[] = [];

    for (const o of orders) {
      if (o.reference.toLowerCase().includes(term)) {
        items.push({
          href: `/orders/${o.id}`,
          label: o.reference,
          meta: `Order · ${formatCurrency(orderTotal(o), o.currency)}`,
        });
      }
    }
    for (const l of leads) {
      if (
        l.contactName.toLowerCase().includes(term) ||
        l.company.toLowerCase().includes(term)
      ) {
        items.push({
          href: `/leads/${l.id}`,
          label: l.company,
          meta: `Lead · ${l.contactName}`,
        });
      }
    }
    for (const p of products) {
      if (p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)) {
        items.push({
          href: `/products/${p.id}`,
          label: p.name,
          meta: `Product · ${p.sku}`,
        });
      }
    }
    for (const c of customers) {
      if (c.company.toLowerCase().includes(term) || c.name.toLowerCase().includes(term)) {
        items.push({
          href: `/customers/${c.id}`,
          label: c.company,
          meta: `Customer · ${c.country}`,
        });
      }
    }
    return items.slice(0, 8);
  }, [q, orders, leads, products, customers]);

  return (
    <div className="relative hidden md:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        placeholder="Search orders, leads, products…"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="w-64 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none ring-blue-500 focus:bg-white focus:ring-2 lg:w-80"
      />
      {open && results.length > 0 ? (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
          {results.map((r) => (
            <li key={r.href + r.label}>
              <Link
                href={r.href}
                className="block px-3 py-2 hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                <p className="text-sm font-medium text-slate-900">{r.label}</p>
                <p className="text-xs text-slate-500">{r.meta}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
