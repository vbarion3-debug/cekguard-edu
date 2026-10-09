"use client";

import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Clock, ListChecks, PartyPopper, ScanSearch, Target } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { LessonStepView } from "@/components/learning/lesson-steps";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Segmented } from "@/components/ui/controls";
import { EmptyState } from "@/components/ui/feedback";
import { ProgressBar } from "@/components/ui/progress";
import { useEffectiveLevel, useLearningStats } from "@/hooks/use-learning";
import { CATEGORY_TITLE, LEVELS, LEVEL_LABEL } from "@/lib/constants/categories";
import { MODULE_HREF, MODULE_NAME } from "@/lib/constants/modules";
import { cn } from "@/lib/utils/cn";
import { contentRepository } from "@/services/database/repository";
import { useAppStore } from "@/store/app-store";
import type { LearningLevel, ScanModule } from "@/types";

const STEP_LABEL = {
  concept: "Konsep",
  example: "Contoh Nyata",
  danger: "Mengapa Berbahaya",
  recognize: "Cara Mengenali",
  action: "Yang Harus Dilakukan",
  quiz: "Mini Quiz",
} as const;

function LessonPlayer({ slug }: { slug: string }) {
  const lesson = contentRepository.getLesson(slug)!;
  const params = useSearchParams();
  const from = params.get("from") as ScanModule | null;
  const fromResult = useAppStore((s) => (from ? s.lastResults[from] : undefined));
  const progress = useAppStore((s) => s.lessonProgress[lesson.id]);
  const updateLessonStep = useAppStore((s) => s.updateLessonStep);
  const completeLesson = useAppStore((s) => s.completeLesson);
  const simplified = useAppStore((s) => s.accessibility.simplified);
  const effective = useEffectiveLevel();
  const stats = useLearningStats();
  const masteryBefore = useMemo(() => stats.mastery.find((m) => m.category === lesson.category)?.score ?? 0, []); // eslint-disable-line react-hooks/exhaustive-deps

  const total = lesson.steps.length;
  const [index, setIndex] = useState(() => (progress && !progress.completed ? Math.min(progress.step, total - 1) : 0));
  const [maxVisited, setMaxVisited] = useState(index);
  const [quizDone, setQuizDone] = useState(false);
  const [finished, setFinished] = useState(false);
  const [level, setLevel] = useState<LearningLevel>(effective);
  const step = lesson.steps[index];
  const isLast = index === total - 1;

  function go(next: number) {
    setIndex(next);
    setMaxVisited((m) => Math.max(m, next));
    updateLessonStep(lesson.id, next, total);
    document.getElementById("lesson-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (finished) {
    const masteryAfter = stats.mastery.find((m) => m.category === lesson.category)?.score ?? 0;
    return (
      <Card className="animate-pop">
        <CardContent className="py-10 text-center">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-success-soft text-success" aria-hidden>
            <PartyPopper className="h-10 w-10" />
          </span>
          <h1 className="mt-5 text-3xl font-extrabold text-fg" role="status">
            Pelajaran selesai!
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-fg-muted">
            Kamu telah menyelesaikan “{lesson.title}”. Sekarang uji apakah kamu sudah benar-benar memahaminya.
          </p>
          <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-surface-2 p-4 text-left">
            <p className="text-sm font-semibold text-fg-muted">Penguasaan {CATEGORY_TITLE[lesson.category]}</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-fg">
              {masteryBefore}% <ArrowRight className="inline h-5 w-5 text-fg-muted" aria-label="menjadi" /> <span className="text-success">{masteryAfter}%</span>
            </p>
            <ProgressBar value={masteryAfter} label={`Penguasaan ${CATEGORY_TITLE[lesson.category]}`} tone="success" className="mt-2" />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href={`/quiz/${lesson.quizId}`} size="lg">
              <ListChecks className="h-5 w-5" aria-hidden /> Mulai Quiz
            </ButtonLink>
            <ButtonLink href="/learning" size="lg" variant="outline">
              <BookOpen className="h-5 w-5" aria-hidden /> Kembali ke Belajar
            </ButtonLink>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div id="lesson-top" className="scroll-mt-24">
      <Link href="/learning" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-fg-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Belajar
      </Link>

      {from && fromResult && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-primary/30 bg-primary-soft/60 p-4">
          <ScanSearch className="h-5 w-5 text-primary" aria-hidden />
          <p className="min-w-0 flex-1 text-sm text-fg">
            <span className="font-semibold">Dari hasil {MODULE_NAME[from]}:</span> {fromResult.summary}. Pelajaran ini menjelaskan pola yang ditemukan.
          </p>
          <Link href={MODULE_HREF[from]} className="text-sm font-semibold text-primary hover:underline">
            Lihat hasil
          </Link>
        </div>
      )}

      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="primary">{CATEGORY_TITLE[lesson.category]}</Badge>
          <Badge tone="neutral">{LEVEL_LABEL[lesson.level]}</Badge>
          <span className="inline-flex items-center gap-1 text-sm text-fg-muted">
            <Clock className="h-4 w-4" aria-hidden /> {lesson.durationMin} menit
          </span>
          {progress?.completed && (
            <Badge tone="success" icon={<CheckCircle2 className="h-3.5 w-3.5" aria-hidden />}>
              Pernah diselesaikan
            </Badge>
          )}
        </div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-fg sm:text-3xl">{lesson.title}</h1>
        <p className="mt-1 text-fg-muted">{lesson.description}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-fg-muted">Langkah</p>
              <p className="text-2xl font-extrabold tabular-nums text-fg" aria-live="polite">
                {index + 1} / {total}
              </p>
              <ProgressBar value={((index + 1) / total) * 100} label="Kemajuan pelajaran" className="mt-2" />
              <nav aria-label="Langkah pelajaran" className="mt-4">
                <ol className="space-y-1">
                  {lesson.steps.map((s, i) => {
                    const reachable = i <= maxVisited || progress?.completed;
                    return (
                      <li key={i}>
                        <button
                          type="button"
                          disabled={!reachable}
                          onClick={() => go(i)}
                          aria-current={i === index ? "step" : undefined}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm font-medium transition-colors disabled:cursor-not-allowed",
                            i === index ? "bg-primary-soft text-primary" : reachable ? "text-fg hover:bg-surface-2" : "text-fg-muted opacity-60",
                          )}
                        >
                          <span
                            className={cn(
                              "grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold",
                              i < index || (progress?.completed && i !== index) ? "bg-success text-white" : i === index ? "bg-primary text-on-primary" : "bg-surface-2 text-fg-muted",
                            )}
                            aria-hidden
                          >
                            {i < index ? "✓" : i + 1}
                          </span>
                          {STEP_LABEL[s.type]}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </nav>
            </CardContent>
          </Card>
          <Card className="hidden lg:block">
            <CardContent className="p-4">
              <p className="flex items-center gap-1.5 text-sm font-bold text-fg">
                <Target className="h-4 w-4 text-primary" aria-hidden /> Tujuan belajar
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-fg-muted">
                {lesson.objectives.map((o) => (
                  <li key={o} className="flex gap-1.5">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-hidden />
                    {o}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </aside>

        <Card>
          <CardContent className="p-5 sm:p-8">
            {step.type === "concept" && !simplified && (
              <div className="mb-6 rounded-2xl bg-surface-2 p-3">
                <p className="mb-2 text-xs font-semibold text-fg-muted">Sesuaikan bahasa penjelasan</p>
                <Segmented label="Tingkat bahasa penjelasan" value={level} onChange={setLevel} options={LEVELS.map((l) => ({ value: l.id, label: l.label }))} />
              </div>
            )}
            <LessonStepView key={index} step={step} level={simplified ? "pemula" : level} stepKey={`${lesson.id}-${index}`} onQuizDone={() => setQuizDone(true)} />

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="ghost" disabled={index === 0} onClick={() => go(index - 1)}>
                <ArrowLeft className="h-4 w-4" aria-hidden /> Sebelumnya
              </Button>
              {isLast ? (
                <div className="flex flex-col items-stretch gap-1 sm:items-end">
                  <Button
                    size="lg"
                    disabled={!quizDone}
                    onClick={() => {
                      completeLesson(lesson.id, total);
                      setFinished(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <CheckCircle2 className="h-5 w-5" aria-hidden /> Selesai
                  </Button>
                  {!quizDone && <p className="text-xs text-fg-muted">Jawab mini quiz untuk menyelesaikan pelajaran.</p>}
                </div>
              ) : (
                <Button size="lg" onClick={() => go(index + 1)}>
                  Lanjut: {STEP_LABEL[lesson.steps[index + 1].type]} <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LessonPage() {
  const { slug } = useParams<{ slug: string }>();
  const lesson = contentRepository.getLesson(slug);
  if (!lesson) {
    return (
      <EmptyState
        titleAs="h1"
        icon={<BookOpen className="h-6 w-6" />}
        title="Pelajaran tidak ditemukan"
        description="Pelajaran yang kamu cari tidak tersedia."
        action={<ButtonLink href="/learning">Lihat semua pelajaran</ButtonLink>}
      />
    );
  }
  return (
    <Suspense>
      <LessonPlayer slug={slug} />
    </Suspense>
  );
}
