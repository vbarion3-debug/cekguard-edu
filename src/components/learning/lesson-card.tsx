import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { CATEGORY_TITLE, LEVEL_LABEL } from "@/lib/constants/categories";
import type { Lesson } from "@/types";

const LEVEL_TONE = { pemula: "success", menengah: "warning", lanjutan: "danger" } as const;

export function LessonCard({ lesson, percent, completed }: { lesson: Lesson; percent: number; completed: boolean }) {
  const cta = completed ? "Ulangi Pelajaran" : percent > 0 ? "Lanjutkan Belajar" : "Mulai Belajar";
  return (
    <article className="card flex flex-col p-5 transition-shadow hover:shadow-pop">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="primary">{CATEGORY_TITLE[lesson.category]}</Badge>
        <Badge tone={LEVEL_TONE[lesson.level]}>{LEVEL_LABEL[lesson.level]}</Badge>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-fg-muted">
          <Clock className="h-3.5 w-3.5" aria-hidden /> {lesson.durationMin} menit
        </span>
        {completed && (
          <Badge tone="success" icon={<CheckCircle2 className="h-3.5 w-3.5" aria-hidden />} className="ml-auto">
            Selesai
          </Badge>
        )}
      </div>
      <h3 className="mt-3 text-lg font-bold text-fg">{lesson.title}</h3>
      <p className="mt-1 text-sm text-fg-muted">{lesson.description}</p>
      <p className="mt-4 text-sm font-semibold text-fg">Pelajari:</p>
      <ul className="mt-1.5 space-y-1 text-sm text-fg-muted">
        {lesson.objectives.map((o) => (
          <li key={o} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
            {o}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-5">
        <div className="mb-3 flex items-center justify-between text-xs font-medium text-fg-muted">
          <span>Progress</span>
          <span className="tabular-nums">{percent}%</span>
        </div>
        <ProgressBar value={percent} label={`Progress ${lesson.title}`} tone={completed ? "success" : "primary"} size="sm" />
        <Link
          href={`/learning/${lesson.slug}`}
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-hover"
        >
          {cta}
          <span className="sr-only">: {lesson.title}</span>
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
