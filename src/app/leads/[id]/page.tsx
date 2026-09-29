"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { leadSourceLabels, leadStatusLabels, quoteStatusLabels } from "@/lib/labels";
import { leadStatusTone } from "@/lib/status-tones";
import { formatCurrency, formatDate } from "@/lib/utils";
import { quoteTotal } from "@/lib/order-factory";
import type { InteractionChannel, LeadStatus } from "@/types/domain";
import { Phone } from "lucide-react";

export default function LeadDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const {
    leads,
    leadInteractions,
    quotes,
    orders,
    updateLeadStatus,
    addLeadInteraction,
  } = useAppStore();

  const lead = leads.find((l) => l.id === id);
  if (!lead) notFound();

  const interactions = leadInteractions
    .filter((i) => i.leadId === id)
    .sort((a, b) => b.at.localeCompare(a.at));
  const leadQuotes = quotes.filter((q) => q.leadId === id);
  const leadOrders = orders.filter((o) => o.leadId === id);

  const [channel, setChannel] = useState<InteractionChannel>("call");
  const [summary, setSummary] = useState("");

  function logTouch(e: React.FormEvent) {
    e.preventDefault();
    if (!summary.trim()) return;
    addLeadInteraction(id, channel, summary.trim());
    setSummary("");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        backHref="/leads"
        title={lead.contactName}
        description={`${lead.company} · ${lead.industry}`}
        action={
          <Badge tone={leadStatusTone[lead.status]}>{leadStatusLabels[lead.status]}</Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="font-semibold">Log communication</h2>
            <form onSubmit={logTouch} className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Channel</Label>
                  <Select value={channel} onChange={(e) => setChannel(e.target.value as InteractionChannel)}>
                    <option value="call">Phone call</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                  </Select>
                </div>
                <div>
                  <Label>Pipeline status</Label>
                  <Select
                    value={lead.status}
                    onChange={(e) => updateLeadStatus(id, e.target.value as LeadStatus)}
                  >
                    {Object.entries(leadStatusLabels).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div>
                <Label>Summary</Label>
                <Textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="What was discussed? Next step?"
                />
              </div>
              <Button type="submit">Save touchpoint</Button>
            </form>
          </section>

          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="font-semibold">Interaction history</h2>
            <ul className="mt-4 space-y-3">
              {interactions.map((i) => (
                <li key={i.id} className="border-l-2 border-blue-200 pl-4">
                  <p className="text-xs uppercase text-slate-400">
                    {i.channel} · {formatDate(i.at)}
                  </p>
                  <p className="text-sm text-slate-800">{i.summary}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border bg-white p-5 shadow-sm text-sm space-y-2">
            <p>
              <span className="text-slate-400">Source:</span> {leadSourceLabels[lead.source]}
            </p>
            <p>
              <span className="text-slate-400">Phone:</span>{" "}
              <a href={`tel:${lead.phone}`} className="text-blue-600">
                {lead.phone}
              </a>
            </p>
            <p>
              <span className="text-slate-400">Email:</span> {lead.email}
            </p>
            {lead.nextFollowUpAt ? (
              <p className="rounded-lg bg-amber-50 px-2 py-1 text-amber-900">
                Follow up {formatDate(lead.nextFollowUpAt)}
              </p>
            ) : null}
            <p className="text-slate-600">{lead.notes}</p>
          </div>

          <Link href={`/leads/convert/${id}`}>
            <Button className="w-full gap-2">
              <Phone className="h-4 w-4" />
              Quote → Order wizard
            </Button>
          </Link>

          {leadQuotes.length > 0 ? (
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold">Quotes</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {leadQuotes.map((q) => (
                  <li key={q.id}>
                    {q.reference} · {quoteStatusLabels[q.status]}
                    <br />
                    <span className="text-slate-500">{formatCurrency(quoteTotal(q), q.currency)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {leadOrders.length > 0 ? (
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold">Orders</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {leadOrders.map((o) => (
                  <li key={o.id}>
                    <Link href={`/orders/${o.id}`} className="text-blue-600 hover:underline">
                      {o.reference}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
