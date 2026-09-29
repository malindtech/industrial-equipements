"use client";

import { useUiStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function ToastHost() {
  const { toasts, dismissToast } = useUiStore();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-start gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg",
            t.tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-900",
            t.tone === "error" && "border-red-200 bg-red-50 text-red-900",
            t.tone === "info" && "border-slate-200 bg-white text-slate-800"
          )}
        >
          <p className="flex-1">{t.message}</p>
          <button type="button" onClick={() => dismissToast(t.id)} aria-label="Dismiss">
            <X className="h-4 w-4 opacity-60" />
          </button>
        </div>
      ))}
    </div>
  );
}
