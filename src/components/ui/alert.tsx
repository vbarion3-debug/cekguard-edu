import { AlertOctagon, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { TONE_CLASS } from "./badge";

const ICONS = { info: Info, success: CheckCircle2, warning: TriangleAlert, danger: AlertOctagon } as const;

export function Alert({
  tone = "info",
  title,
  children,
  action,
  className,
  live,
}: {
  tone?: keyof typeof ICONS;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
  /** Announce to screen readers when it appears. */
  live?: boolean;
}) {
  const Icon = ICONS[tone];
  return (
    <div
      role={live ? (tone === "danger" ? "alert" : "status") : undefined}
      className={cn(
        "flex items-start gap-3 rounded-xl border-(length:--border-w) p-4 text-sm",
        TONE_CLASS[tone],
        className,
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn("text-fg", title && "mt-0.5")}>{children}</div>}
      </div>
      {action}
    </div>
  );
}
