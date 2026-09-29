"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  CreditCard,
  LayoutDashboard,
  Menu,
  Package,
  Ship,
  ShoppingCart,
  Users,
  X,
  Factory,
  Layers,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/products", label: "Products", icon: Layers },
  { href: "/vendors", label: "Vendors", icon: Truck },
  { href: "/imports", label: "Import tracking", icon: Ship },
  { href: "/inventory", label: "Stock", icon: Package },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/customers", label: "Customers", icon: Factory },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const resetDemo = useAppStore((s) => s.resetDemo);

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={cn("flex flex-col gap-1", mobile && "px-3")}>
      {nav.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => mobile && setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-white lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-[var(--color-border)] px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-brand-600)] text-white">
            <Box className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">EquipFlow</p>
            <p className="text-xs text-[var(--color-muted)]">Operations demo</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavLinks />
        </div>
        <div className="border-t border-[var(--color-border)] p-4">
          <Button variant="secondary" className="w-full text-xs" onClick={() => resetDemo()}>
            Reset demo data
          </Button>
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <span className="font-semibold">Menu</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-3">
              <NavLinks mobile />
            </div>
            <div className="border-t p-4">
              <Button variant="secondary" className="w-full text-xs" onClick={() => resetDemo()}>
                Reset demo data
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-white/90 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="lg:hidden">
              <p className="text-sm font-semibold">EquipFlow</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-[var(--color-muted)] sm:flex">
            <span className="rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
              Demo mode
            </span>
            <span>Internal ops — import tracking not customer-facing</span>
          </div>
        </header>
        <main className="flex-1 bg-[var(--color-subtle)] px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
