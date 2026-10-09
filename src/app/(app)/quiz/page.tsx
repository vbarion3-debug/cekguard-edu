"use client";

import { ArrowRight, ListChecks, Trophy } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/feedback";
import { scoreLabel, scoreTone } from "@/components/ui/progress";
import { CATEGORY_TITLE } from "@/lib/constants/categories";
import { formatRelative } from "@/lib/utils/format";
import { contentRepository } from "@/services/database/repository";
import { bestQuizScore } from "@/services/learning/progress";
import { useAppStore } from "@/store/app-store";

const TYPE_LABEL = { multiple: "Pilihan ganda", truefalse: "Benar/Salah", scenario: "Skenario" } as const;

export default function QuizListPage() {
  const attempts = useAppStore((s) => s.quizAttempts);
  const quizzes = contentRepository.listQuizzes();

  return (
    <div>
      <PageHeader icon={<ListChecks className="h-6 w-6" />} title="Quiz" description="Uji pemahamanmu dengan pertanyaan pilihan ganda, benar/salah, dan skenario nyata." />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {quizzes.map((q) => {
          const best = bestQuizScore(attempts, q.category);
          const last = attempts.find((a) => a.quizId === q.id);
          const types = Array.from(new Set(q.questions.map((x) => x.type)));
          return (
            <article key={q.id} className="card flex flex-col p-5">
              <div className="flex items-center justify-between gap-2">
                <Badge tone="primary">{CATEGORY_TITLE[q.category]}</Badge>
                {best !== undefined ? (
                  <Badge tone={scoreTone(best)} icon={<Trophy className="h-3.5 w-3.5" aria-hidden />}>
                    Terbaik {best}% · {scoreLabel(best)}
                  </Badge>
                ) : (
                  <Badge>Belum dikerjakan</Badge>
                )}
              </div>
              <h2 className="mt-3 text-lg font-bold text-fg">{q.title}</h2>
              <p className="mt-1 text-sm text-fg-muted">{q.description}</p>
              <p className="mt-3 text-sm text-fg-muted">
                {q.questions.length} pertanyaan · {types.map((t) => TYPE_LABEL[t]).join(", ")}
              </p>
              {last && <p className="mt-1 text-xs text-fg-muted">Terakhir dikerjakan {formatRelative(last.completedAt)}</p>}
              <Link
                href={`/quiz/${q.id}`}
                className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 pt-0 text-sm font-semibold text-on-primary hover:bg-primary-hover [margin-top:1.25rem]"
              >
                {last ? "Ulangi Quiz" : "Mulai Quiz"}
                <span className="sr-only">: {q.title}</span>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
