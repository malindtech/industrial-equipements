"use client";

import { useHydrated } from "@/hooks/use-hydrated";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-[var(--color-muted)]">
        Loading workspace…
      </div>
    );
  }
  return children;
}
