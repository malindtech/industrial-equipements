"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { suggestFulfillment } from "@/lib/order-factory";
import { formatCurrency } from "@/lib/utils";

type LineDraft = {
  productId: string;
  quantity: number;
  unitPrice: number;
  fulfillment: "stock" | "vendor_import";
};

export default function NewOrderPage() {
  const router = useRouter();
  const { customers, products, inventory, createDirectOrder } = useAppStore();
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [lines, setLines] = useState<LineDraft[]>(() => {
    const p = products[0];
    if (!p) return [];
    return [
      {
        productId: p.id,
        quantity: 1,
        unitPrice: p.listPrice,
        fulfillment: suggestFulfillment(p.id, 1, inventory),
      },
    ];
  });

  const total = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);

  function updateLine(i: number, patch: Partial<LineDraft>) {
    setLines((prev) =>
      prev.map((l, idx) => {
        if (idx !== i) return l;
        const next = { ...l, ...patch };
        if (patch.productId || patch.quantity) {
          next.fulfillment = suggestFulfillment(next.productId, next.quantity, inventory);
          const p = products.find((x) => x.id === next.productId);
          if (p && patch.productId) next.unitPrice = p.listPrice;
        }
        return next;
      })
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const orderId = createDirectOrder({
      customerId,
      currency: String(fd.get("currency")),
      sellingCountry: String(fd.get("sellingCountry")),
      notes: String(fd.get("notes") ?? ""),
      expectedDelivery: String(fd.get("expectedDelivery") || undefined),
      lines,
    });
    if (orderId) router.push(`/orders/${orderId}`);
  }

  if (customers.length === 0) {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-8 text-center">
        <p className="text-slate-600">Add a customer before creating an order.</p>
        <Link href="/customers/new">
          <Button>Add customer</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        backHref="/orders"
        title="Create order"
        description="Direct order for an existing customer — stock or vendor import, payment on delivery."
      />

      <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm">
        <div>
          <Label htmlFor="customerId">Customer</Label>
          <Select
            id="customerId"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company} — {c.name}
              </option>
            ))}
          </Select>
          <Link href="/customers/new" className="mt-1 inline-block text-xs text-blue-600 hover:underline">
            + Add new customer
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="sellingCountry">Delivery country</Label>
            <Input id="sellingCountry" name="sellingCountry" defaultValue="Pakistan" required />
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select id="currency" name="currency" defaultValue="USD">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="PKR">PKR</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="expectedDelivery">Target delivery</Label>
            <Input id="expectedDelivery" name="expectedDelivery" type="date" />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-800">Line items</p>
          {lines.map((line, i) => (
            <div key={i} className="grid gap-3 rounded-xl border border-slate-100 p-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Product</Label>
                <Select value={line.productId} onChange={(e) => updateLine(i, { productId: e.target.value })}>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Qty</Label>
                <Input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) => updateLine(i, { quantity: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Unit price</Label>
                <Input
                  type="number"
                  min={0}
                  value={line.unitPrice}
                  onChange={(e) => updateLine(i, { unitPrice: Number(e.target.value) })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Fulfillment</Label>
                <Select
                  value={line.fulfillment}
                  onChange={(e) =>
                    updateLine(i, { fulfillment: e.target.value as "stock" | "vendor_import" })
                  }
                >
                  <option value="stock">From stock</option>
                  <option value="vendor_import">Vendor import</option>
                </Select>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              const p = products[0];
              if (!p) return;
              setLines((prev) => [
                ...prev,
                {
                  productId: p.id,
                  quantity: 1,
                  unitPrice: p.listPrice,
                  fulfillment: suggestFulfillment(p.id, 1, inventory),
                },
              ]);
            }}
          >
            Add line
          </Button>
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" rows={2} placeholder="Payment on delivery…" />
        </div>

        <p className="text-right text-lg font-semibold">Total {formatCurrency(total)}</p>

        <Button type="submit" className="w-full sm:w-auto">
          Create order & start workflow
        </Button>
      </form>
    </div>
  );
}
