import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <section className="rounded-md border border-line bg-surface/60 backdrop-blur-sm my-4 p-10 text-center">
      <h1 className="text-xl font-semibold">{title}</h1>

      {description && (
        <p className="mt-2 text-sm text-ink-muted">{description}</p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </section>
  );
}
