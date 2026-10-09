import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  titleAs: Title = "p",
}: {
  icon: ReactNode;
  title: string;
  /** Use "h1" when the empty state is the whole page content. */
  titleAs?: "p" | "h1" | "h2";
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border px-6 py-10 text-center",
        className,
      )}
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary" aria-hidden>
        {icon}
      </span>
      <Title className="mt-4 text-base font-bold text-fg">{title}</Title>
      {description && <p className="mt-1 max-w-md text-sm text-fg-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-xl bg-surface-2", className)} />;
}

export function PageSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Memuat halaman">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-40 w-full" />
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  icon,
}: {
  title: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        {icon && (
          <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-on-primary shadow-sm sm:grid" aria-hidden>
            {icon}
          </span>
        )}
        <div className="min-w-0">
          {eyebrow && <div className="mb-1 flex flex-wrap items-center gap-2">{eyebrow}</div>}
          <h1 className="text-2xl font-extrabold tracking-tight text-fg sm:text-3xl">{title}</h1>
          {description && <p className="mt-1.5 max-w-2xl text-fg-muted">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "primary",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: "primary" | "danger" | "success" | "warning" | "accent" | "info";
  className?: string;
}) {
  const toneClass = {
    primary: "bg-primary-soft text-primary",
    danger: "bg-danger-soft text-danger",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    accent: "bg-accent-soft text-accent",
    info: "bg-info-soft text-info",
  }[tone];
  return (
    <div className={cn("card flex items-start gap-4 p-5", className)}>
      {icon && (
        <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", toneClass)} aria-hidden>
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium text-fg-muted">{label}</p>
        <p className="mt-0.5 text-2xl font-extrabold tabular-nums text-fg">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-fg-muted">{hint}</p>}
      </div>
    </div>
  );
}
