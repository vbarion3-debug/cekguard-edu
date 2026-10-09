import { cn } from "@/lib/utils/cn";
import type { Tone } from "./badge";

const FILL: Record<Tone, string> = {
  neutral: "bg-fg-muted",
  primary: "bg-primary",
  danger: "bg-danger",
  warning: "bg-warning",
  success: "bg-success",
  info: "bg-info",
  accent: "bg-accent",
};

export function ProgressBar({
  value,
  label,
  tone = "primary",
  size = "md",
  className,
  showValue,
}: {
  value: number;
  label: string;
  tone?: Tone;
  size?: "sm" | "md" | "lg";
  className?: string;
  showValue?: boolean;
}) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-surface-2 [[data-contrast=high]_&]:outline [[data-contrast=high]_&]:outline-1",
          size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2",
        )}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-700 ease-out", FILL[tone])}
          style={{ width: `${v}%` }}
        />
      </div>
      {showValue && <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums text-fg">{v}%</span>}
    </div>
  );
}

/** Tone for a mastery score — paired with a text label wherever shown. */
export function scoreTone(score: number): Tone {
  if (score >= 75) return "success";
  if (score >= 55) return "primary";
  if (score >= 45) return "warning";
  return "danger";
}

export function scoreLabel(score: number): string {
  if (score >= 75) return "Baik";
  if (score >= 55) return "Cukup";
  if (score >= 45) return "Perlu latihan";
  return "Prioritas";
}
