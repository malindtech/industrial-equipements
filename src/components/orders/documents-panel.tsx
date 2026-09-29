"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { documentTypeLabels } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import type { Order, OrderDocumentType } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { FileText, Upload } from "lucide-react";

export function DocumentsPanel({ order }: { order: Order }) {
  const { orderDocuments, addOrderDocument } = useAppStore();
  const docs = orderDocuments.filter((d) => d.orderId === order.id);
  const [type, setType] = useState<OrderDocumentType>("invoice");
  const [name, setName] = useState("");

  function mockUpload() {
    const fileName = name.trim() || `${order.reference}-${type}.pdf`;
    addOrderDocument(order.id, type, fileName);
    setName("");
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
        <FileText className="h-4 w-4" />
        Documents
      </h2>
      <ul className="mt-4 space-y-2">
        {docs.length === 0 ? (
          <li className="text-sm text-slate-500">No documents yet.</li>
        ) : (
          docs.map((d) => (
            <li
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm"
            >
              <span className="font-medium text-slate-800">{d.name}</span>
              <span className="text-xs text-slate-500">
                {documentTypeLabels[d.type]} · {formatDate(d.uploadedAt)}
              </span>
            </li>
          ))
        )}
      </ul>
      <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="doc-type">Type</Label>
          <Select id="doc-type" value={type} onChange={(e) => setType(e.target.value as OrderDocumentType)}>
            {Object.entries(documentTypeLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="doc-name">File name (demo)</Label>
          <Input
            id="doc-name"
            placeholder="optional.pdf"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>
      <Button variant="secondary" className="mt-3 gap-2" onClick={mockUpload}>
        <Upload className="h-4 w-4" />
        Attach document (mock upload)
      </Button>
    </section>
  );
}
