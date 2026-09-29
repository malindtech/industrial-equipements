"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { leadSourceLabels, leadStatusLabels } from "@/lib/labels";
import { leadStatusTone } from "@/lib/status-tones";
import { formatDate } from "@/lib/utils";
import type { LeadSource, LeadStatus } from "@/types/domain";

export default function LeadsPage() {
  const { leads, updateLeadStatus, addLead } = useAppStore();
  const [filter, setFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    const list = [...leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (filter === "all") return list;
    return list.filter((l) => l.status === filter);
  }, [leads, filter]);

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addLead({
      contactName: String(fd.get("contactName")),
      company: String(fd.get("company")),
      phone: String(fd.get("phone")),
      email: String(fd.get("email")),
      source: fd.get("source") as LeadSource,
      status: "new",
      industry: String(fd.get("industry")),
      notes: String(fd.get("notes") ?? ""),
    });
    e.currentTarget.reset();
    setShowForm(false);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Cold calls, social inbound, and referrals — qualify before converting to orders.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" /> Add lead
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader title="New lead" description="Saved locally for this demo session" />
          <CardBody>
            <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="contactName">Contact name</Label>
                <Input id="contactName" name="contactName" required />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" required />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div>
                <Label htmlFor="source">Source</Label>
                <Select id="source" name="source" defaultValue="social_media">
                  {Object.entries(leadSourceLabels).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" name="industry" placeholder="Agriculture, Mining…" required />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" rows={3} />
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit">Save lead</Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader
          title="Pipeline"
          action={
            <Select
              className="w-44"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              {Object.entries(leadStatusLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b bg-slate-50/80 text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <tr>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Source</th>
                <th className="px-5 py-3 font-medium">Industry</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-b last:border-0 hover:bg-slate-50/50">
                  <td className="px-5 py-4">
                    <p className="font-medium">{lead.contactName}</p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {lead.company} · {lead.phone}
                    </p>
                  </td>
                  <td className="px-5 py-4">{leadSourceLabels[lead.source]}</td>
                  <td className="px-5 py-4">{lead.industry}</td>
                  <td className="px-5 py-4">
                    <Select
                      className="max-w-[160px] py-1.5 text-xs"
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                      aria-label={`Status for ${lead.contactName}`}
                    >
                      {Object.entries(leadStatusLabels).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </Select>
                    <div className="mt-1">
                      <Badge tone={leadStatusTone[lead.status]}>{leadStatusLabels[lead.status]}</Badge>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[var(--color-muted)]">{formatDate(lead.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
