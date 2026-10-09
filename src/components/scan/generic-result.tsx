"use client";

import { CheckCircle2, CircleDashed, ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { AnalysisResult, LinkCheck } from "@/types";
import {
  ExplanationCard,
  LearningConnection,
  ResultBanner,
  ResultFeedback,
  RiskScoreCard,
  SafeActionsCard,
} from "./result-sections";

/** Checklist of every check performed — flagged and passed — for transparency. */
export function ChecksCard({ checks, title = "Pemeriksaan yang dilakukan" }: { checks: LinkCheck[]; title?: string }) {
  return (
    <Card>
      <CardHeader title={title} description="Semua aspek yang diperiksa, termasuk yang tidak bermasalah" icon={<ListChecks className="h-5 w-5" />} />
      <CardContent>
        <ul className="divide-y divide-border">
          {checks.map((c) => (
            <li key={c.id} className="flex items-start gap-3 py-3">
              {c.flagged ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden />
              ) : (
                <CircleDashed className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
              )}
              <div className="min-w-0 flex-1">
                <p className={cn("font-semibold", c.flagged ? "text-fg" : "text-fg-muted")}>
                  {c.label}
                  <span className={cn("ml-2 text-xs font-bold uppercase", c.flagged ? "text-danger" : "text-success")}>
                    {c.flagged ? "Terindikasi" : "Tidak terindikasi"}
                  </span>
                </p>
                <p className="reading text-sm text-fg-muted">{c.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/** Standard result layout: Detect → Explain → Learn → Act. */
export function StandardResult({
  result,
  onReset,
  scoreExtra,
  children,
}: {
  result: AnalysisResult;
  onReset: () => void;
  scoreExtra?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <ResultBanner result={result} onReset={onReset} />
      <RiskScoreCard result={result}>{scoreExtra}</RiskScoreCard>
      <ExplanationCard result={result} />
      {children}
      <LearningConnection result={result} />
      <SafeActionsCard result={result} />
      <ResultFeedback result={result} />
    </div>
  );
}
