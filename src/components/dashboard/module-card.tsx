import { ArrowRight, Link2, MessageSquareWarning, ScanFace, ShieldAlert, UsersRound, Newspaper } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/badge";
import type { ModuleInfo } from "@/lib/constants/modules";
import { cn } from "@/lib/utils/cn";

const ICONS: Record<string, typeof Link2> = {
  cekjudol: MessageSquareWarning,
  ceklink: Link2,
  cekdeepfake: ScanFace,
  cekscam: ShieldAlert,
  cekcyberbully: UsersRound,
  cekinfo: Newspaper,
};

export function ModuleCard({ module, compact }: { module: ModuleInfo; compact?: boolean }) {
  const Icon = ICONS[module.id] ?? ShieldAlert;
  const available = module.status === "available" && module.href;
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "grid h-11 w-11 place-items-center rounded-xl",
            available ? "bg-primary-soft text-primary" : "bg-surface-2 text-fg-muted",
          )}
          aria-hidden
        >
          <Icon className="h-5 w-5" />
        </span>
        <StatusBadge status={module.status} />
      </div>
      <h3 className={cn("mt-4 font-bold", available ? "text-fg" : "text-fg-muted")}>{module.name}</h3>
      {!compact && <p className="mt-1 text-sm text-fg-muted">{module.description}</p>}
      {available ? (
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
          Buka modul <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      ) : (
        <span className="mt-4 inline-block text-sm font-medium text-fg-muted">Dalam pengembangan</span>
      )}
    </>
  );

  return available ? (
    <Link
      href={module.href!}
      className="card group block p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-pop"
    >
      {inner}
    </Link>
  ) : (
    <div className="card block border-dashed p-5 opacity-80" aria-disabled="true">
      {inner}
    </div>
  );
}
