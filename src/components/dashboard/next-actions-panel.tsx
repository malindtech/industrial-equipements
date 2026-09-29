"use client";

import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { collectAllNextActions } from "@/lib/next-actions";
import { Zap } from "lucide-react";

export function NextActionsPanel() {
  const state = useAppStore();
  const actions = collectAllNextActions(state);

  return (
    <section className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 font-semibold text-slate-900">
        <Zap className="h-4 w-4 text-amber-500" />
        Recommended next steps
      </h2>
      <p className="mt-1 text-xs text-slate-500">System-generated from live order, import, and lead state.</p>
      <ul className="mt-4 space-y-2">
        {actions.length === 0 ? (
          <li className="text-sm text-slate-500">All caught up — no urgent actions.</li>
        ) : (
          actions.map((a) => (
            <li key={a.id}>
              <Link
                href={a.href}
                className={`block rounded-xl border px-3 py-2.5 transition hover:border-blue-300 hover:bg-white ${
                  a.priority === "high" ? "border-amber-200 bg-amber-50/50" : "border-slate-100 bg-white/60"
                }`}
              >
                <p className="text-sm font-medium text-slate-900">{a.label}</p>
                <p className="text-xs text-slate-500">{a.description}</p>
              </Link>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
