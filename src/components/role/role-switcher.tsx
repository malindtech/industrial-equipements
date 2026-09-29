"use client";

import { useRoleStore, roleLabels } from "@/store/role-store";
import type { DemoRole } from "@/types/domain";
import { cn } from "@/lib/utils";

const roles: DemoRole[] = ["sales", "operations", "finance"];

export function RoleSwitcher({ compact }: { compact?: boolean }) {
  const { role, setRole } = useRoleStore();

  return (
    <div className={cn("flex items-center gap-2", compact && "flex-col items-stretch sm:flex-row")}>
      {!compact ? (
        <span className="hidden text-xs text-slate-500 lg:inline">Demo role</span>
      ) : null}
      <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
        {roles.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-xs font-medium transition",
              role === r ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            )}
          >
            {roleLabels[r]}
          </button>
        ))}
      </div>
    </div>
  );
}
