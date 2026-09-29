"use client";

import Link from "next/link";
import { useAppStore, orderTotal } from "@/store/app-store";
import { Card, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { orderMargin } from "@/lib/insights";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CustomersPage() {
  const state = useAppStore();
  const { customers, orders } = state;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Add manually here, or auto-create when a lead accepts a quote.
          </p>
        </div>
        <Link href="/customers/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add customer
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {customers.map((customer) => {
          const customerOrders = orders.filter((o) => o.customerId === customer.id);
          const lifetime = customerOrders.reduce((s, o) => s + orderTotal(o), 0);
          const margin = customerOrders.reduce((s, o) => s + orderMargin(o, state).margin, 0);
          return (
            <Link key={customer.id} href={`/customers/${customer.id}`}>
              <Card className="transition hover:border-blue-200 hover:shadow-md">
                <CardHeader title={customer.company} description={customer.industry} />
                <div className="space-y-2 px-5 pb-5 text-sm">
                  <p>{customer.name}</p>
                  <p className="text-[var(--color-muted)]">{customer.country}</p>
                  <p className="pt-2 font-medium">
                    {formatCurrency(lifetime)} revenue · {formatCurrency(margin)} est. margin
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    Since {formatDate(customer.createdAt)} · {customerOrders.length} orders
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600">
                    View profile <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
