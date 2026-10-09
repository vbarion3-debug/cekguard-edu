"use client";

import {
  ArrowRight,
  BookOpen,
  FileText,
  Flame,
  Image as ImageIcon,
  Lightbulb,
  Link2,
  Mic,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Video,
} from "lucide-react";
import Link from "next/link";
import { ActivityList } from "@/components/dashboard/recent-activity";
import { ModuleCard } from "@/components/dashboard/module-card";
import { Badge, DemoBadge, RiskBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { useLearningStats } from "@/hooks/use-learning";
import { LEVEL_LABEL } from "@/lib/constants/categories";
import { RISK_MODULES } from "@/lib/constants/modules";
import { formatRelative } from "@/lib/utils/format";
import { useAppStore } from "@/store/app-store";

const QUICK_SCAN = [
  { label: "URL", href: "/scan?tab=url", icon: Link2, soon: false },
  { label: "Teks", href: "/scan?tab=text", icon: FileText, soon: false },
  { label: "Gambar", href: "/cekdeepfake", icon: ImageIcon, soon: false },
  { label: "Video", href: "/scan?tab=video", icon: Video, soon: true },
  { label: "Audio", href: "/scan?tab=audio", icon: Mic, soon: true },
];

const LOOP = [
  { icon: ScanSearch, title: "Detect", text: "AI mendeteksi indikasi risiko" },
  { icon: Lightbulb, title: "Explain", text: "Penjelasan mengapa berisiko" },
  { icon: BookOpen, title: "Learn", text: "Pelajaran & quiz dari kasus" },
  { icon: ShieldCheck, title: "Act", text: "Tindakan aman yang jelas" },
];

export default function DashboardPage() {
  const session = useAppStore((s) => s.session);
  const profile = useAppStore((s) => s.profile);
  const activities = useAppStore((s) => s.activities);
  const lastJudol = useAppStore((s) => s.lastResults.cekjudol);
  const stats = useLearningStats();
  const firstName = (session?.role === "STUDENT" ? profile.name : session?.name ?? "").split(" ")[0];
  const continueItem = stats.inProgress[0];

  return (
    <div className="space-y-6">
      {/* HERO */}
      <section
        aria-labelledby="hero-title"
        className="card relative overflow-hidden bg-gradient-to-br from-primary-soft via-surface to-surface p-6 sm:p-8"
      >
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10" />
        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-primary">Halo, {firstName} 👋 · Level {LEVEL_LABEL[profile.level]}</p>
            <h1 id="hero-title" className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-fg sm:text-4xl">
              Kenali Risiko Digital Sebelum Menjadi Korban
            </h1>
            <p className="mt-3 max-w-xl text-fg-muted sm:text-lg">
              Periksa konten digital, pahami risikonya, pelajari cara mengenalinya, lalu ambil tindakan yang lebih aman.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/scan" size="lg">
                <ScanSearch className="h-5 w-5" aria-hidden /> Mulai Cek Risiko
              </ButtonLink>
              <ButtonLink href={continueItem ? `/learning/${continueItem.lesson.slug}` : "/learning"} size="lg" variant="outline">
                <BookOpen className="h-5 w-5" aria-hidden /> Lanjutkan Belajar
              </ButtonLink>
            </div>
          </div>
          <ol className="grid grid-cols-2 gap-3" aria-label="Alur belajar CekGuard">
            {LOOP.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-border bg-surface/80 p-4">
                <span className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-on-primary" aria-hidden>
                    <s.icon className="h-4 w-4" />
                  </span>
                  <span className="font-bold text-fg">
                    <span className="sr-only">Langkah {i + 1}: </span>
                    {s.title}
                  </span>
                </span>
                <span className="mt-1.5 block text-sm text-fg-muted">{s.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* PROGRESS + QUICK SCAN */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Card>
          <CardHeader title="Learning Progress" description="Skor literasi keamanan digital kamu" icon={<TrendingUp className="h-5 w-5" />} />
          <CardContent>
            <p className="text-sm font-semibold text-fg-muted">Literasi Digital</p>
            <div className="mt-1 flex items-end gap-3">
              <span className="text-5xl font-extrabold tabular-nums text-fg">{stats.score}%</span>
              {stats.weeklyDelta !== 0 && (
                <Badge tone={stats.weeklyDelta > 0 ? "success" : "danger"} className="mb-2" icon={<TrendingUp className="h-3.5 w-3.5" aria-hidden />}>
                  {stats.weeklyDelta > 0 ? "+" : ""}
                  {stats.weeklyDelta}% minggu ini
                </Badge>
              )}
            </div>
            <ProgressBar value={stats.score} label="Skor literasi digital" size="lg" className="mt-4" />
            <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-surface-2 p-3">
                <dt className="text-xs text-fg-muted">Pelajaran</dt>
                <dd className="text-lg font-bold tabular-nums text-fg">{stats.completedLessons.length}</dd>
              </div>
              <div className="rounded-xl bg-surface-2 p-3">
                <dt className="text-xs text-fg-muted">Quiz</dt>
                <dd className="text-lg font-bold tabular-nums text-fg">{stats.quizzesCompleted}</dd>
              </div>
              <div className="rounded-xl bg-surface-2 p-3">
                <dt className="flex items-center justify-center gap-1 text-xs text-fg-muted">
                  <Flame className="h-3.5 w-3.5" aria-hidden /> Streak
                </dt>
                <dd className="text-lg font-bold tabular-nums text-fg">{stats.streak} hari</dd>
              </div>
            </dl>
            <Link href="/progress" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Lihat detail progress <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Quick Scan" description="Apa yang ingin diperiksa?" icon={<ScanSearch className="h-5 w-5" />} />
          <CardContent>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {QUICK_SCAN.map((q) => (
                <li key={q.label}>
                  <Link
                    href={q.href}
                    className="flex h-full flex-col items-center gap-2 rounded-2xl border-(length:--border-w) border-border bg-surface p-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary-soft"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary" aria-hidden>
                      <q.icon className="h-5 w-5" />
                    </span>
                    <span className="font-semibold text-fg">{q.label}</span>
                    {q.soon && <span className="text-[11px] font-medium text-fg-muted">Segera Hadir</span>}
                  </Link>
                </li>
              ))}
            </ul>
            {lastJudol && lastJudol.details.kind === "judol" ? (
              <Link
                href="/cekjudol"
                className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface-2 p-4 hover:border-primary/40"
              >
                <RiskBadge level={lastJudol.riskLevel} />
                <span className="min-w-0 flex-1 text-sm">
                  <span className="font-semibold text-fg">Temuan terakhir CekJudol:</span>{" "}
                  <span className="text-fg-muted">
                    {lastJudol.details.flagged} dari {lastJudol.details.totalComments} komentar terindikasi promosi judi online ·{" "}
                    {formatRelative(lastJudol.createdAt)}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 text-primary" aria-hidden />
              </Link>
            ) : (
              <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary-soft/50 p-4">
                <Sparkles className="h-5 w-5 text-primary" aria-hidden />
                <p className="min-w-0 flex-1 text-sm text-fg">
                  <span className="font-semibold">Coba demo CekJudol:</span> analisis komentar video untuk menemukan promosi judi online.
                </p>
                <ButtonLink href="/cekjudol" size="sm">
                  Coba sekarang
                </ButtonLink>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* MODULES */}
      <section aria-labelledby="modules-title">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="modules-title" className="text-lg font-bold text-fg">
              Modul Cek Risiko
            </h2>
            <p className="text-sm text-fg-muted">Setiap modul terhubung ke materi belajar, quiz, dan tindakan aman.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RISK_MODULES.map((m) => (
            <ModuleCard key={m.id} module={m} compact={m.status === "soon"} />
          ))}
        </div>
      </section>

      {/* CONTINUE + ACTIVITY */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Lanjutkan Belajar" description="Materi yang sedang kamu pelajari" icon={<BookOpen className="h-5 w-5" />} />
          <CardContent className="space-y-4">
            {continueItem ? (
              <div className="rounded-2xl border border-border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="primary">{LEVEL_LABEL[continueItem.lesson.level]}</Badge>
                  <span className="text-xs text-fg-muted">{continueItem.lesson.durationMin} menit</span>
                </div>
                <h3 className="mt-2 font-bold text-fg">{continueItem.lesson.title}</h3>
                <p className="mt-2 text-sm text-fg-muted">Progress {continueItem.percent}%</p>
                <ProgressBar value={continueItem.percent} label={`Progress ${continueItem.lesson.title}`} className="mt-1.5" />
                <ButtonLink href={`/learning/${continueItem.lesson.slug}`} className="mt-4" size="sm">
                  Lanjutkan <ArrowRight className="h-4 w-4" aria-hidden />
                </ButtonLink>
              </div>
            ) : (
              <p className="text-sm text-fg-muted">Belum ada pelajaran yang sedang berjalan.</p>
            )}
            <div className="flex items-start gap-3 rounded-2xl bg-accent-soft p-4">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-fg">Rekomendasi berikutnya</p>
                <p className="text-sm text-fg-muted">{stats.next.reason}</p>
                <Link href={`/learning/${stats.next.lesson.slug}`} className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
                  {stats.next.lesson.title} <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Aktivitas Terbaru"
            description="Riwayat pemeriksaan dan belajar"
            icon={<Flame className="h-5 w-5" />}
            action={<DemoBadge label="Data demo" />}
          />
          <CardContent className="pt-3">
            <ActivityList items={activities} limit={5} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
