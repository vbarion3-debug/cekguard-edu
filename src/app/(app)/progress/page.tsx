"use client";

import { ArrowRight, Award, BarChart3, BookOpen, Flame, ListChecks, Lock, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { LineChart } from "@/components/charts/charts";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState, PageHeader, StatCard } from "@/components/ui/feedback";
import { ProgressBar, scoreLabel, scoreTone } from "@/components/ui/progress";
import { useLearningStats } from "@/hooks/use-learning";
import { CATEGORY_TITLE } from "@/lib/constants/categories";
import { formatRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { computeAchievements } from "@/services/learning/progress";
import { useAppStore } from "@/store/app-store";

export default function ProgressPage() {
  const stats = useLearningStats();
  const attempts = useAppStore((s) => s.quizAttempts);
  const history = useAppStore((s) => s.scoreHistory);
  const achievements = computeAchievements(stats.snapshot);
  const chart = history.map((h) => ({
    label: new Date(`${h.date}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
    value: h.score,
  }));
  if (!history.length || history[history.length - 1].score !== stats.score) chart.push({ label: "Sekarang", value: stats.score });

  return (
    <div className="space-y-6">
      <PageHeader icon={<BarChart3 className="h-6 w-6" />} title="Progress" description="Pantau perkembangan literasi keamanan digitalmu." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Digital Safety Score"
          value={stats.score}
          hint={stats.weeklyDelta ? `${stats.weeklyDelta > 0 ? "+" : ""}${stats.weeklyDelta} poin minggu ini` : "Belum ada perubahan minggu ini"}
          icon={<ShieldCheck className="h-5 w-5" />}
        />
        <StatCard label="Lessons Completed" value={stats.completedLessons.length} icon={<BookOpen className="h-5 w-5" />} tone="success" />
        <StatCard label="Quiz Completed" value={stats.quizzesCompleted} hint={`Rata-rata ${stats.averageQuiz}%`} icon={<ListChecks className="h-5 w-5" />} tone="accent" />
        <StatCard label="Learning Streak" value={`${stats.streak} hari`} icon={<Flame className="h-5 w-5" />} tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader title="Progress per kategori" description="Gabungan penyelesaian pelajaran (40%) dan skor quiz terbaik (60%)" />
          <CardContent>
            <ul className="space-y-4">
              {stats.mastery.map((m) => (
                <li key={m.category}>
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                    <span className="font-semibold text-fg">{m.title}</span>
                    <span className="flex items-center gap-2">
                      <Badge tone={scoreTone(m.score)}>{scoreLabel(m.score)}</Badge>
                      <span className="w-10 text-right font-bold tabular-nums text-fg">{m.score}%</span>
                    </span>
                  </div>
                  <ProgressBar value={m.score} label={`Penguasaan ${m.title}`} tone={scoreTone(m.score)} size="lg" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <section className="card border-accent/30 bg-accent-soft/60 p-5">
            <p className="flex items-center gap-2 font-bold text-fg">
              <Sparkles className="h-5 w-5 text-accent" aria-hidden /> Rekomendasi belajar berikutnya
            </p>
            <p className="reading mt-2 text-fg">{stats.next.reason}</p>
            <ButtonLink href={`/learning/${stats.next.lesson.slug}`} className="mt-4" size="sm">
              {stats.next.lesson.title} <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
          </section>
          <Card>
            <CardHeader title="Perkembangan skor" description="Digital Safety Score dari waktu ke waktu" />
            <CardContent>
              <LineChart data={chart} label={`Perkembangan skor: ${chart.map((c) => `${c.label} ${c.value}`).join(", ")}`} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Riwayat quiz" icon={<ListChecks className="h-5 w-5" />} />
          <CardContent>
            {attempts.length === 0 ? (
              <EmptyState icon={<ListChecks className="h-6 w-6" />} title="Belum ada quiz" action={<ButtonLink href="/quiz">Mulai quiz</ButtonLink>} />
            ) : (
              <ul className="divide-y divide-border">
                {attempts.slice(0, 8).map((a) => (
                  <li key={a.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <Link href={`/quiz/${a.quizId}`} className="font-semibold text-fg hover:underline">
                        Quiz {CATEGORY_TITLE[a.category]}
                      </Link>
                      <p className="text-xs text-fg-muted">
                        {a.correct}/{a.total} benar · {formatRelative(a.completedAt)}
                      </p>
                    </div>
                    <Badge tone={scoreTone(a.score)}>{a.score}%</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Pencapaian" icon={<Award className="h-5 w-5" />} />
          <CardContent>
            <ul className="grid gap-3 sm:grid-cols-2">
              {achievements.map((a) => (
                <li
                  key={a.id}
                  className={cn("flex items-start gap-3 rounded-xl border p-3", a.unlocked ? "border-success/40 bg-success-soft/50" : "border-border opacity-70")}
                >
                  <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", a.unlocked ? "bg-success text-white" : "bg-surface-2 text-fg-muted")} aria-hidden>
                    {a.unlocked ? <Award className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-fg">
                      {a.title}
                      <span className="sr-only">{a.unlocked ? " (tercapai)" : " (belum tercapai)"}</span>
                    </p>
                    <p className="text-xs text-fg-muted">{a.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
