"use client";

import { AlertTriangle, ArrowUpDown, BookOpen, GraduationCap, ListChecks, Search, ShieldCheck, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { RoleGuard } from "@/components/layout/role-guard";
import { Alert } from "@/components/ui/alert";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader, StatCard } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { ProgressBar, scoreLabel, scoreTone } from "@/components/ui/progress";
import { DEMO_CLASS, DEMO_STUDENTS } from "@/data/demo/organization";
import { useLearningStats } from "@/hooks/use-learning";
import { CATEGORIES, CATEGORY_TITLE } from "@/lib/constants/categories";
import { useAppStore } from "@/store/app-store";
import type { RiskCategory } from "@/types";

function avg(ns: number[]) {
  return ns.length ? Math.round(ns.reduce((a, b) => a + b, 0) / ns.length) : 0;
}

function TeacherDashboard() {
  const stats = useLearningStats();
  const studentName = useAppStore((s) => s.profile.name);
  const [query, setQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  // The demo student's live progress is part of the class, so the teacher sees real changes.
  const students = useMemo(() => {
    const live = {
      id: "live",
      name: `${studentName} (akun demo)`,
      scores: Object.fromEntries(stats.mastery.map((m) => [m.category, m.score])) as Record<RiskCategory, number>,
      lessonsCompleted: stats.completedLessons.length,
      quizzesCompleted: stats.quizzesCompleted,
      lastActiveDaysAgo: 0,
    };
    return [live, ...DEMO_STUDENTS].map((s) => ({ ...s, overall: avg(Object.values(s.scores)) }));
  }, [stats, studentName]);

  const topics = CATEGORIES.map((c) => ({ id: c.id, title: c.title, score: avg(students.map((s) => s.scores[c.id])) }));
  const lowest = [...topics].sort((a, b) => a.score - b.score)[0];
  const classScore = avg(students.map((s) => s.overall));
  const quizCompletion = Math.round((students.filter((s) => s.quizzesCompleted >= 3).length / students.length) * 100);
  const needAttention = students.filter((s) => s.overall < 60);

  const rows = students
    .filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => (sortAsc ? a.overall - b.overall : b.overall - a.overall));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<GraduationCap className="h-6 w-6" />}
        title="Dashboard Guru"
        description={`Kelas ${DEMO_CLASS.name} · ${DEMO_CLASS.school}`}
        eyebrow={<DemoBadge label="Data Demo Kelas" />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Students" value={students.length} icon={<UsersRound className="h-5 w-5" />} />
        <StatCard label="Average Digital Safety Score" value={classScore} icon={<ShieldCheck className="h-5 w-5" />} tone="success" />
        <StatCard label="Active Learning Modules" value={DEMO_CLASS.activeModules} icon={<BookOpen className="h-5 w-5" />} tone="accent" />
        <StatCard label="Quiz Completion" value={`${quizCompletion}%`} hint="siswa dengan ≥3 quiz" icon={<ListChecks className="h-5 w-5" />} tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader title="Progress by topic" description="Rata-rata penguasaan kelas per topik" />
          <CardContent>
            <ul className="space-y-4">
              {topics.map((t) => (
                <li key={t.id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-semibold text-fg">{t.title}</span>
                    <span className="flex items-center gap-2">
                      <Badge tone={scoreTone(t.score)}>{scoreLabel(t.score)}</Badge>
                      <span className="w-10 text-right font-bold tabular-nums">{t.score}%</span>
                    </span>
                  </div>
                  <ProgressBar value={t.score} label={`Rata-rata ${t.title}`} tone={scoreTone(t.score)} size="lg" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader title="Area yang membutuhkan perhatian" icon={<AlertTriangle className="h-5 w-5" />} />
            <CardContent className="space-y-3">
              <Alert tone="warning" title={`${lowest.title} memiliki rata-rata skor terendah (${lowest.score}%).`}>
                Pertimbangkan menugaskan pelajaran {CATEGORY_TITLE[lowest.id]} dan diskusi kelas minggu ini.
              </Alert>
              <Alert tone="info" title={`${needAttention.length} siswa memiliki skor di bawah 60.`}>
                {needAttention.length === 0
                  ? "Semua siswa berada di atas ambang batas."
                  : `${needAttention.slice(0, 4).map((s) => s.name).join(", ")}${needAttention.length > 4 ? ", dan lainnya." : "."}`}
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader title="Daftar siswa" description="Skor keseluruhan = rata-rata penguasaan semua topik" />
        <CardContent>
          <div className="relative mb-4 max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" aria-hidden />
            <label htmlFor="student-search" className="sr-only">
              Cari siswa
            </label>
            <Input id="student-search" type="search" placeholder="Cari siswa..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-11" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">Daftar siswa dengan skor, pelajaran, dan quiz</caption>
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-fg-muted">
                  <th scope="col" className="py-2 pr-3">Siswa</th>
                  <th scope="col" className="px-3 py-2" aria-sort={sortAsc ? "ascending" : "descending"}>
                    <button type="button" onClick={() => setSortAsc((s) => !s)} className="inline-flex items-center gap-1 uppercase hover:text-fg">
                      Skor <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />
                      <span className="sr-only">(urutkan {sortAsc ? "menurun" : "menaik"})</span>
                    </button>
                  </th>
                  <th scope="col" className="px-3 py-2">Topik terlemah</th>
                  <th scope="col" className="px-3 py-2">Pelajaran</th>
                  <th scope="col" className="px-3 py-2">Quiz</th>
                  <th scope="col" className="py-2 pl-3">Aktif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((s) => {
                  const weakest = (Object.entries(s.scores) as [RiskCategory, number][]).sort((a, b) => a[1] - b[1])[0];
                  return (
                    <tr key={s.id} className={s.id === "live" ? "bg-primary-soft/40" : undefined}>
                      <th scope="row" className="py-3 pr-3 font-semibold text-fg">
                        {s.name}
                      </th>
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-2">
                          <span className="w-8 font-bold tabular-nums">{s.overall}</span>
                          <Badge tone={scoreTone(s.overall)}>{scoreLabel(s.overall)}</Badge>
                        </span>
                      </td>
                      <td className="px-3 py-3 text-fg-muted">
                        {CATEGORY_TITLE[weakest[0]]} ({weakest[1]}%)
                      </td>
                      <td className="px-3 py-3 tabular-nums">{s.lessonsCompleted}</td>
                      <td className="px-3 py-3 tabular-nums">{s.quizzesCompleted}</td>
                      <td className="py-3 pl-3 text-fg-muted">{s.lastActiveDaysAgo === 0 ? "Hari ini" : `${s.lastActiveDaysAgo} hari lalu`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TeacherPage() {
  return (
    <RoleGuard roles={["TEACHER", "ADMIN"]}>
      <TeacherDashboard />
    </RoleGuard>
  );
}
