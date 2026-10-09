import { AlertOctagon, AlertTriangle, CheckCircle2, Clock, FlaskConical, Info } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { RISK_META } from "@/lib/constants/risk";
import { cn } from "@/lib/utils/cn";
import type { RiskLevel } from "@/types";

export type Tone = "neutral" | "primary" | "danger" | "warning" | "success" | "info" | "accent";

export const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-surface-2 text-fg-muted border-border",
  primary: "bg-primary-soft text-primary border-primary/25",
  danger: "bg-danger-soft text-danger border-danger/30",
  warning: "bg-warning-soft text-warning border-warning/30",
  success: "bg-success-soft text-success border-success/30",
  info: "bg-info-soft text-info border-info/30",
  accent: "bg-accent-soft text-accent border-accent/30",
};

export function Badge({
  tone = "neutral",
  className,
  icon,
  children,
  ...props
}: ComponentProps<"span"> & { tone?: Tone; icon?: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border-(length:--border-w) px-2.5 py-0.5 text-xs font-semibold",
        TONE_CLASS[tone],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}

const RISK_ICON = {
  high: AlertOctagon,
  medium: AlertTriangle,
  low: Info,
  safe: CheckCircle2,
} as const;

/** Risk badge always pairs color with an icon and text — never color alone. */
export function RiskBadge({
  level,
  size = "sm",
  short,
  className,
}: {
  level: RiskLevel;
  size?: "sm" | "lg";
  short?: boolean;
  className?: string;
}) {
  const meta = RISK_META[level];
  const Icon = RISK_ICON[level];
  return (
    <Badge
      tone={meta.tone}
      className={cn(size === "lg" && "px-3 py-1 text-sm uppercase tracking-wide", className)}
      icon={<Icon className={size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"} aria-hidden />}
    >
      {short ? meta.short : meta.label}
    </Badge>
  );
}

export function DemoBadge({ className, label = "Demo Analysis" }: { className?: string; label?: string }) {
  return (
    <Badge tone="accent" className={className} icon={<FlaskConical className="h-3.5 w-3.5" aria-hidden />}>
      {label}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: "available" | "soon" }) {
  return status === "available" ? (
    <Badge tone="success" icon={<CheckCircle2 className="h-3.5 w-3.5" aria-hidden />}>
      Tersedia
    </Badge>
  ) : (
    <Badge tone="neutral" icon={<Clock className="h-3.5 w-3.5" aria-hidden />}>
      Segera Hadir
    </Badge>
  );
}
