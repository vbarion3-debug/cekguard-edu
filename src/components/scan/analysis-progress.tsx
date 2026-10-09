"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

/**
 * Staged loading experience. Steps advance on a timer while the request is
 * running; the last step stays active until the result arrives.
 */
export function AnalysisProgress({ steps, title = "Menganalisis konten...", stepMs = 900 }: { steps: string[]; title?: string; stepMs?: number }) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (done >= steps.length - 1) return;
    const t = setTimeout(() => setDone((d) => d + 1), stepMs);
    return () => clearTimeout(t);
  }, [done, steps.length, stepMs]);

  return (
    <Card className="overflow-hidden" aria-busy="true">
      <div className="relative h-1.5 overflow-hidden bg-surface-2">
        <div className="h-full bg-primary transition-[width] duration-700" style={{ width: `${((done + 0.5) / steps.length) * 100}%` }} />
      </div>
      <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[auto_1fr] md:items-center">
        <div className="relative mx-auto grid h-32 w-32 place-items-center overflow-hidden rounded-3xl bg-primary-soft" aria-hidden>
          <div className="absolute inset-x-0 h-1/2 animate-scan bg-gradient-to-b from-transparent via-primary/25 to-transparent" />
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-fg" role="status">
            {title}
          </h2>
          <p className="mt-1 text-sm text-fg-muted">Mohon tunggu, sistem sedang memeriksa pola risiko.</p>
          <ol className="mt-5 space-y-3">
            {steps.map((s, i) => {
              const state = i < done ? "done" : i === done ? "active" : "pending";
              return (
                <li key={s} className={cn("flex items-center gap-3 text-sm", state === "pending" ? "text-fg-muted" : "text-fg")}>
                  {state === "done" ? (
                    <CheckCircle2 className="h-5 w-5 text-success" aria-hidden />
                  ) : state === "active" ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden />
                  ) : (
                    <span className="h-5 w-5 rounded-full border-2 border-border-strong" aria-hidden />
                  )}
                  <span className={cn(state === "active" && "font-semibold")}>{s}</span>
                  <span className="sr-only">{state === "done" ? "(selesai)" : state === "active" ? "(sedang berjalan)" : "(menunggu)"}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </Card>
  );
}
