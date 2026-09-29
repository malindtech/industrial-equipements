import { Card, CardBody } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <CardBody className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--color-muted)]">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
          {hint ? <p className="mt-1 text-xs text-[var(--color-muted)]">{hint}</p> : null}
        </div>
        <div className="rounded-lg bg-[var(--color-brand-50)] p-2.5 text-[var(--color-brand-600)]">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </CardBody>
    </Card>
  );
}
