import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <section className="rounded-xl border border-dashed border-stone-300 bg-white my-4 p-10 text-center">
      <h1 className="text-xl font-semibold">{title}</h1>

      {description && (
        <p className="mt-2 text-sm text-stone-500">{description}</p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </section>
  );
}
