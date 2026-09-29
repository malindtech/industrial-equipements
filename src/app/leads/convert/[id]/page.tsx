"use client";

import { useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { suggestFulfillment } from "@/lib/order-factory";
import { formatCurrency } from "@/lib/utils";
import { Check, Send } from "lucide-react";

type LineDraft = {
  productId: string;
  quantity: number;
  unitPrice: number;
  fulfillment: "stock" | "vendor_import";
};

export default function ConvertLeadPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;
  const { leads, products, inventory, createQuote, sendQuote, acceptQuoteToOrder, quotes } =
    useAppStore();

  const lead = leads.find((l) => l.id === leadId);
  if (!lead) notFound();

  const existingQuote = quotes.find((q) => q.leadId === leadId && q.status !== "accepted");

  const [step, setStep] = useState(1);
  const [currency, setCurrency] = useState("USD");
  const [country, setCountry] = useState("Pakistan");
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState(lead.notes);
  const [lines, setLines] = useState<LineDraft[]>(() => {
    const pid = lead.interestedProductIds?.[0] ?? products[0]?.id;
    if (!pid) return [];
    const p = products.find((x) => x.id === pid)!;
    return [
      {
        productId: pid,
        quantity: 1,
        unitPrice: p.listPrice,
        fulfillment: suggestFulfillment(pid, 1, inventory),
      },
    ];
  });
  const [quoteId, setQuoteId] = useState<string | null>(existingQuote?.id ?? null);

  const total = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);

  function addLine() {
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
  }

  function updateLine(index: number, patch: Partial<LineDraft>) {
    setLines((prev) =>
      prev.map((l, i) => {
        if (i !== index) return l;
        const next = { ...l, ...patch };
        if (patch.productId || patch.quantity) {
          next.fulfillment = suggestFulfillment(
            next.productId,
            next.quantity,
            inventory
          );
          const product = products.find((p) => p.id === next.productId);
          if (product && patch.productId) next.unitPrice = product.listPrice;
        }
        return next;
      })
    );
  }

  function saveQuote(andSend: boolean) {
    const id = createQuote({
      leadId,
      currency,
      sellingCountry: country,
      validUntil,
      notes,
      lines: lines.map(({ productId, quantity, unitPrice, fulfillment }) => ({
        productId,
        quantity,
        unitPrice,
        fulfillment,
      })),
    });
    setQuoteId(id);
    if (andSend) sendQuote(id);
    setStep(3);
  }

  function confirmOrder() {
    const qid = quoteId ?? existingQuote?.id;
    if (!qid) return;
    if (quotes.find((q) => q.id === qid)?.status === "draft") sendQuote(qid);
    const orderId = acceptQuoteToOrder(qid);
    if (orderId) router.push(`/orders/${orderId}`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        backHref="/leads"
        title="Lead → Quote → Order"
        description={`${lead.contactName} · ${lead.company}`}
      />

      <div className="flex gap-2 text-sm">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`flex-1 rounded-lg py-2 text-center font-medium ${
              step === n ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
            }`}
          >
            {n === 1 ? "Products" : n === 2 ? "Proforma" : "Confirm"}
          </span>
        ))}
      </div>

      {step === 1 ? (
        <div className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Select products & fulfillment</h2>
          {lines.map((line, idx) => (
            <div key={idx} className="grid gap-3 rounded-xl border border-slate-100 p-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Product</Label>
                <Select
                  value={line.productId}
                  onChange={(e) => updateLine(idx, { productId: e.target.value })}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) => updateLine(idx, { quantity: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Unit price ({currency})</Label>
                <Input
                  type="number"
                  min={0}
                  value={line.unitPrice}
                  onChange={(e) => updateLine(idx, { unitPrice: Number(e.target.value) })}
                />
              </div>
              <div className="sm:col-span-2 text-sm text-slate-600">
                Suggested:{" "}
                <strong>{line.fulfillment === "stock" ? "From stock" : "Vendor import"}</strong>
                <Select
                  className="mt-1 max-w-xs"
                  value={line.fulfillment}
                  onChange={(e) =>
                    updateLine(idx, {
                      fulfillment: e.target.value as "stock" | "vendor_import",
                    })
                  }
                >
                  <option value="stock">From stock</option>
                  <option value="vendor_import">Vendor import</option>
                </Select>
              </div>
            </div>
          ))}
          <Button variant="secondary" onClick={addLine}>
            Add line
          </Button>
          <div className="flex justify-between border-t pt-4">
            <p className="font-semibold">Subtotal {formatCurrency(total, currency)}</p>
            <Button onClick={() => setStep(2)}>Next: Proforma</Button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Proforma / quote terms</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Customer country</Label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
            <div>
              <Label>Currency</Label>
              <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="AED">AED</option>
                <option value="PKR">PKR</option>
              </Select>
            </div>
            <div>
              <Label>Valid until</Label>
              <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Notes on quote</Label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="rounded-xl bg-slate-50 p-4 text-sm">
            <p className="font-medium text-slate-800">Payment terms</p>
            <p className="mt-1 text-slate-600">100% due on delivery after customer confirms receipt.</p>
          </div>
          <ul className="divide-y text-sm">
            {lines.map((l, i) => {
              const p = products.find((x) => x.id === l.productId);
              return (
                <li key={i} className="flex justify-between py-2">
                  <span>
                    {l.quantity}× {p?.name}
                  </span>
                  <span>{formatCurrency(l.quantity * l.unitPrice, currency)}</span>
                </li>
              );
            })}
          </ul>
          <p className="text-right text-lg font-semibold">{formatCurrency(total, currency)}</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button variant="secondary" onClick={() => saveQuote(false)}>
              Save draft quote
            </Button>
            <Button className="gap-2" onClick={() => saveQuote(true)}>
              <Send className="h-4 w-4" />
              Send proforma to customer
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-emerald-700">
            <Check className="h-5 w-5" />
            Customer accepted?
          </h2>
          <p className="text-sm text-slate-600">
            Confirming creates the official order, reserves stock, raises vendor POs & import tracking for
            import lines, and opens pay-on-delivery receivable.
          </p>
          <p className="text-2xl font-semibold">{formatCurrency(total, currency)}</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={confirmOrder}>Accept quote & create order</Button>
            <Link href="/leads">
              <Button variant="secondary">Back to leads</Button>
            </Link>
          </div>
        </div>
      ) : null}

      {existingQuote && step < 3 ? (
        <p className="text-sm text-amber-700">
          Open quote {existingQuote.reference} exists — continuing will create a new quote unless you
          complete step 2.
        </p>
      ) : null}
    </div>
  );
}
