"use client";

import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { formatDate } from "@/lib/utils";
import { Activity } from "lucide-react";

export function ActivityFeed({ limit = 8 }: { limit?: number }) {
  const activities = useAppStore((s) => s.activities).slice(0, limit);

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <Activity className="h-4 w-4 text-blue-600" />
        <h2 className="font-semibold text-slate-900">Live activity</h2>
      </div>
      <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
        {activities.map((a) => (
          <li key={a.id}>
            <Link href={a.href} className="block px-5 py-3 transition hover:bg-slate-50">
              <p className="text-sm font-medium text-slate-900">{a.title}</p>
              <p className="text-xs text-slate-500">{a.detail}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
                {formatDate(a.at)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
