"use client";

import { useAppStore, orderTotal } from "@/store/app-store";
import { Card, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CustomersPage() {
  const { customers, orders } = useAppStore();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Buyers across industries — linked to orders and payment history.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {customers.map((customer) => {
          const customerOrders = orders.filter((o) => o.customerId === customer.id);
          const lifetime = customerOrders.reduce((s, o) => s + orderTotal(o), 0);
          return (
            <Card key={customer.id}>
              <CardHeader title={customer.company} description={customer.industry} />
              <div className="space-y-2 px-5 pb-5 text-sm">
                <p>
                  <span className="text-[var(--color-muted)]">Contact:</span> {customer.name}
                </p>
                <p>
                  <span className="text-[var(--color-muted)]">Email:</span> {customer.email}
                </p>
                <p>
                  <span className="text-[var(--color-muted)]">Phone:</span> {customer.phone}
                </p>
                <p>
                  <span className="text-[var(--color-muted)]">Country:</span> {customer.country}
                </p>
                <p className="pt-2 text-xs text-[var(--color-muted)]">
                  Customer since {formatDate(customer.createdAt)} · {customerOrders.length} orders ·{" "}
                  {formatCurrency(lifetime)} order value
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
