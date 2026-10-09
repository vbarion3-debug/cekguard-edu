"use client";

import { ArrowLeft, ArrowRight, BarChart3, BookOpen, CheckCircle2, ListChecks, RotateCcw, Sparkles, Target } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { RadialScore } from "@/components/charts/charts";
import { QuestionCard } from "@/components/quiz/question-card";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { ProgressBar } from "@/components/ui/progress";
import { useLearningStats } from "@/hooks/use-learning";
import { CATEGORY_TITLE } from "@/lib/constants/categories";
import { contentRepository } from "@/services/database/repository";
import { useAppStore } from "@/store/app-store";
import type { Quiz, QuizAttempt } from "@/types";

const TYPE_LABEL = { multiple: "Pilihan ganda", truefalse: "Benar / Salah", scenario: "Skenario" } as const;

function verdict(score: number) {
  if (score >= 85) return { title: "Excellent!", tone: "success" as const };
  if (score >= 70) return { title: "Bagus!", tone: "primary" as const };
  if (score >= 50) return { title: "Cukup baik", tone: "warning" as const };
  return { title: "Perlu latihan lagi", tone: "danger" as const };
}

function QuizResult({ quiz, attempt, before, onRetry }: { quiz: Quiz; attempt: QuizAttempt; before: number; onRetry: () => void }) {
  const stats = useLearningStats();
  const after = stats.mastery.find((m) => m.category === quiz.category)?.score ?? before;
  const v = verdict(attempt.score);
  const progress = useAppStore((s) => s.lessonProgress);
  const lessons = contentRepository.listLessons(quiz.category);
  const recommended = lessons.find((l) => !progress[l.id]?.completed) ?? lessons[0];
  const topic = CATEGORY_TITLE[quiz.category].toLowerCase();
  const message =
    attempt.score >= 85
      ? `Kamu sudah memahami sebagian besar indikator ${topic}.`
      : attempt.score >= 50
        ? `Pemahamanmu tentang ${topic} sudah baik, tetapi masih ada beberapa topik yang perlu diperkuat.`
        : `Yuk pelajari lagi materi ${topic} agar lebih siap menghadapi situasi nyata.`;

  return (
    <div className="space-y-6">
      <Card className="animate-pop">
        <CardContent className="flex flex-col items-center gap-6 py-8 text-center md:flex-row md:text-left">
          <RadialScore value={attempt.score} label={`Skor quiz ${attempt.score} persen`} tone={v.tone === "primary" ? "primary" : v.tone} caption="skor" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-fg-muted" role="status">
              Quiz Selesai
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-fg">{attempt.score}%</h1>
            <p className="mt-1 font-semibold text-fg">
              {attempt.correct} / {attempt.total} benar
            </p>
            <Badge tone={v.tone} className="mt-3 px-3 py-1 text-sm">
              {v.title}
            </Badge>
            <p className="reading mt-3 max-w-xl text-fg-muted">{message}</p>
          </div>
          <div className="w-full max-w-xs rounded-2xl bg-success-soft/70 p-4 text-left [[data-contrast=high]_&]:border-2">
            <p className="flex items-center gap-1.5 text-sm font-bold text-fg">
              <BarChart3 className="h-4 w-4 text-success" aria-hidden /> Progress diperbarui
            </p>
            <p className="mt-1 text-sm text-fg-muted">Penguasaan {CATEGORY_TITLE[quiz.category]}</p>
            <p className="text-2xl font-extrabold tabular-nums text-fg">
              {before}% <ArrowRight className="inline h-5 w-5 text-fg-muted" aria-label="menjadi" />{" "}
              <span className={after >= before ? "text-success" : "text-fg"}>{after}%</span>
            </p>
            <ProgressBar value={after} label={`Penguasaan ${CATEGORY_TITLE[quiz.category]}`} tone="success" className="mt-2" />
            <p className="mt-2 text-xs text-fg-muted">Digital Safety Score: {stats.score}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Topik yang sudah dikuasai" icon={<CheckCircle2 className="h-5 w-5" />} />
          <CardContent>
            {attempt.masteredTopics.length ? (
              <ul className="space-y-2">
                {attempt.masteredTopics.map((t) => (
                  <li key={t} className="flex items-center gap-2 text-fg">
                    <CheckCircle2 className="h-4 w-4 text-success" aria-hidden /> {t}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-fg-muted">Belum ada — tetap semangat!</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Topik yang perlu dipelajari lagi" icon={<Target className="h-5 w-5" />} />
          <CardContent>
            {attempt.reviewTopics.length ? (
              <ul className="space-y-2">
                {attempt.reviewTopics.map((t) => (
                  <li key={t} className="flex items-center gap-2 text-fg">
                    <Target className="h-4 w-4 text-warning" aria-hidden /> {t}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-fg-muted">Tidak ada. Semua topik sudah kamu kuasai! 🎉</p>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="card flex flex-col gap-4 border-accent/30 bg-accent-soft/60 p-5 sm:flex-row sm:items-center">
        <Sparkles className="h-6 w-6 shrink-0 text-accent" aria-hidden />
        <div className="flex-1">
          <p className="font-bold text-fg">Recommended Lesson</p>
          <p className="text-sm text-fg-muted">
            {recommended.title} · {recommended.durationMin} menit
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/learning/${recommended.slug}`}>
            <BookOpen className="h-4 w-4" aria-hidden /> Lanjutkan Belajar
          </ButtonLink>
          <ButtonLink href="/progress" variant="outline">
            <BarChart3 className="h-4 w-4" aria-hidden /> Lihat Progress
          </ButtonLink>
          <Button variant="ghost" onClick={onRetry}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Ulangi
          </Button>
        </div>
      </section>
    </div>
  );
}

function QuizRunner({ quiz }: { quiz: Quiz }) {
  const recordQuizAttempt = useAppStore((s) => s.recordQuizAttempt);
  const stats = useLearningStats();
  const [run, setRun] = useState(0);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [before, setBefore] = useState(0);
  const q = quiz.questions[index];
  const answeredCurrent = q && answers[q.id] !== undefined;
  const correctSoFar = useMemo(() => Object.values(answers).filter(Boolean).length, [answers]);

  function finish() {
    setBefore(stats.mastery.find((m) => m.category === quiz.category)?.score ?? 0);
    const correct = quiz.questions.filter((x) => answers[x.id]).length;
    const total = quiz.questions.length;
    const topics = Array.from(new Set(quiz.questions.map((x) => x.topic)));
    const mastered = topics.filter((t) => quiz.questions.filter((x) => x.topic === t).every((x) => answers[x.id]));
    const a = recordQuizAttempt(
      {
        quizId: quiz.id,
        category: quiz.category,
        correct,
        total,
        score: Math.round((correct / total) * 100),
        masteredTopics: mastered,
        reviewTopics: topics.filter((t) => !mastered.includes(t)),
      },
      quiz.title,
    );
    setAttempt(a);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (attempt) {
    return (
      <QuizResult
        quiz={quiz}
        attempt={attempt}
        before={before}
        onRetry={() => {
          setAttempt(null);
          setAnswers({});
          setIndex(0);
          setRun((r) => r + 1);
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/quiz" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-fg-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Semua quiz
      </Link>
      <div className="mb-5">
        <Badge tone="primary">{CATEGORY_TITLE[quiz.category]}</Badge>
        <h1 className="mt-2 text-2xl font-extrabold text-fg sm:text-3xl">{quiz.title}</h1>
      </div>
      <Card>
        <CardContent className="p-5 sm:p-8">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-fg" aria-live="polite">
                Pertanyaan {index + 1} dari {quiz.questions.length}
              </span>
              <span className="flex items-center gap-2 text-fg-muted">
                <Badge>{TYPE_LABEL[q.type]}</Badge>
                <span className="tabular-nums">{correctSoFar} benar</span>
              </span>
            </div>
            <ProgressBar value={((index + (answeredCurrent ? 1 : 0)) / quiz.questions.length) * 100} label="Kemajuan quiz" />
          </div>
          <QuestionCard
            key={`${run}-${q.id}`}
            question={q}
            onAnswered={(correct) => setAnswers((a) => ({ ...a, [q.id]: correct }))}
            after={
              index < quiz.questions.length - 1 ? (
                <Button onClick={() => setIndex(index + 1)} autoFocus>
                  Pertanyaan berikutnya <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              ) : (
                <Button onClick={finish} autoFocus>
                  <ListChecks className="h-4 w-4" aria-hidden /> Selesai & lihat hasil
                </Button>
              )
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const quiz = contentRepository.getQuiz(id);
  if (!quiz) {
    return (
      <EmptyState
        titleAs="h1"
        icon={<ListChecks className="h-6 w-6" />}
        title="Quiz tidak ditemukan"
        action={<ButtonLink href="/quiz">Lihat semua quiz</ButtonLink>}
      />
    );
  }
  return <QuizRunner quiz={quiz} />;
}
