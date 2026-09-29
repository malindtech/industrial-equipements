"use client";

import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { paymentStatusLabels } from "@/lib/labels";
import { paymentStatusTone } from "@/lib/status-tones";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PaymentsPage() {
  const { payments, orders, customers, markPaymentPaid, confirmPayment } = useAppStore();

  const rows = payments.map((p) => {
    const order = orders.find((o) => o.id === p.orderId);
    const customer = order ? customers.find((c) => c.id === order.customerId) : undefined;
    return { payment: p, order, customer };
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Collected after delivery when the customer confirms receipt — COD / confirmation workflow.
        </p>
      </div>

      <Card>
        <CardHeader title="Receivables" description="Demo actions simulate confirmation and settlement" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b bg-slate-50/80 text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ payment, order, customer }) => (
                <tr key={payment.id} className="border-b last:border-0 hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-medium">
                    {order ? (
                      <Link href={`/orders/${order.id}`} className="text-blue-600 hover:underline">
                        {order.reference}
                      </Link>
                    ) : (
                      payment.orderId
                    )}
                  </td>
                  <td className="px-5 py-4">{customer?.company ?? "—"}</td>
                  <td className="px-5 py-4 font-medium">{formatCurrency(payment.amount, payment.currency)}</td>
                  <td className="px-5 py-4">
                    <Badge tone={paymentStatusTone[payment.status]}>
                      {paymentStatusLabels[payment.status]}
                    </Badge>
                    {payment.paidAt ? (
                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        Paid {formatDate(payment.paidAt)}
                        {payment.method ? ` · ${payment.method}` : ""}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {payment.status === "pending" && order?.status === "delivered" ? (
                        <Button
                          variant="secondary"
                          className="text-xs"
                          onClick={() => confirmPayment(payment.id)}
                        >
                          Customer confirmed receipt
                        </Button>
                      ) : null}
                      {payment.status === "awaiting_confirmation" ? (
                        <Button className="text-xs" onClick={() => markPaymentPaid(payment.id, "Bank transfer")}>
                          Record payment
                        </Button>
                      ) : null}
                      {payment.status === "paid" ? (
                        <span className="text-xs text-emerald-600">Complete</span>
                      ) : null}
                    </div>
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
