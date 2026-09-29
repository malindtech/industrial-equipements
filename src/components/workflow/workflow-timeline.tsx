import { cn } from "@/lib/utils";
import type { WorkflowStep } from "@/lib/workflow";
import { formatDate } from "@/lib/utils";

export function WorkflowTimeline({ steps }: { steps: WorkflowStep[] }) {
  return (
    <ol className="relative space-y-0">
      {steps.map((step, i) => (
        <li key={step.id} className="flex gap-4 pb-8 last:pb-0">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                step.state === "done" && "border-emerald-500 bg-emerald-500 text-white",
                step.state === "current" && "border-blue-600 bg-blue-600 text-white ring-4 ring-blue-100",
                step.state === "upcoming" && "border-slate-200 bg-white text-slate-400",
                step.state === "skipped" && "border-slate-100 bg-slate-50 text-slate-300"
              )}
            >
              {step.state === "done" ? "✓" : i + 1}
            </span>
            {i < steps.length - 1 ? (
              <span
                className={cn(
                  "mt-1 w-0.5 flex-1 min-h-[2rem]",
                  step.state === "done" ? "bg-emerald-400" : "bg-slate-200"
                )}
              />
            ) : null}
          </div>
          <div className="min-w-0 pt-0.5">
            <p
              className={cn(
                "text-sm font-semibold",
                step.state === "current" && "text-blue-700",
                step.state === "skipped" && "text-slate-400 line-through"
              )}
            >
              {step.label}
            </p>
            <p className="mt-0.5 text-sm text-slate-500">{step.description}</p>
            {step.at ? (
              <p className="mt-1 text-xs text-slate-400">{formatDate(step.at)}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
