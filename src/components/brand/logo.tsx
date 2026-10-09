import { cn } from "@/lib/utils/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-10 w-10", className)} aria-hidden>
      <rect width="40" height="40" rx="11" fill="var(--primary)" />
      <path
        d="M20 8.5 29.5 12v7.6c0 6-4 10.6-9.5 12.4-5.5-1.8-9.5-6.4-9.5-12.4V12L20 8.5Z"
        fill="none"
        stroke="var(--on-primary)"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="m15.5 20.2 3.2 3.2 6-6.4" fill="none" stroke="var(--on-primary)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      {!compact && (
        <span className="leading-tight">
          <span className="block text-[17px] font-extrabold tracking-tight text-fg">
            CekGuard <span className="text-primary">Edu</span>
          </span>
          <span className="block text-[11px] font-medium text-fg-muted">Kenali • Pahami • Lindungi</span>
        </span>
      )}
    </span>
  );
}
