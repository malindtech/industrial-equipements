export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm font-medium text-slate-800">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-[var(--color-muted)]">{description}</p>
      ) : null}
    </div>
  );
}
