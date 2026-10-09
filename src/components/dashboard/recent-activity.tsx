"use client";

import { BookOpen, ListChecks, ScanSearch } from "lucide-react";
import Link from "next/link";
import { RiskBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/feedback";
import { ButtonLink } from "@/components/ui/button";
import { formatRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { Activity } from "@/types";

const ICON = { scan: ScanSearch, lesson: BookOpen, quiz: ListChecks } as const;
const TONE = {
  scan: "bg-danger-soft text-danger",
  lesson: "bg-success-soft text-success",
  quiz: "bg-accent-soft text-accent",
} as const;

export function ActivityList({ items, limit = 5 }: { items: Activity[]; limit?: number }) {
  if (!items.length) {
    return (
      <EmptyState
        icon={<ScanSearch className="h-6 w-6" />}
        title="Belum ada aktivitas."
        description="Mulai pemeriksaan pertama."
        action={<ButtonLink href="/scan">Mulai Cek Risiko</ButtonLink>}
      />
    );
  }
  return (
    <ul className="divide-y divide-border">
      {items.slice(0, limit).map((a) => {
        const Icon = ICON[a.type];
        const body = (
          <>
            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", TONE[a.type])} aria-hidden>
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-fg">{a.title}</span>
              <span className="block truncate text-sm text-fg-muted">{a.detail}</span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1">
              {a.riskLevel && <RiskBadge level={a.riskLevel} short />}
              <time dateTime={a.createdAt} className="text-xs text-fg-muted">
                {formatRelative(a.createdAt)}
              </time>
            </span>
          </>
        );
        return (
          <li key={a.id}>
            {a.href ? (
              <Link href={a.href} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-surface-2">
                {body}
              </Link>
            ) : (
              <div className="flex items-center gap-3 py-3">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
