"use client";

import { Building2, CheckCircle2, Database, Inbox, Layers, Library, Percent, ShieldCheck, UsersRound } from "lucide-react";
import Link from "next/link";
import { RoleGuard } from "@/components/layout/role-guard";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState, PageHeader, StatCard } from "@/components/ui/feedback";
import { ProgressBar } from "@/components/ui/progress";
import { DEMO_INSTITUTION } from "@/data/demo/organization";
import { CATEGORIES, CATEGORY_TITLE } from "@/lib/constants/categories";
import { MODULE_NAME } from "@/lib/constants/modules";
import { formatNumber, formatRelative } from "@/lib/utils/format";
import { contentRepository } from "@/services/database/repository";
import { useAppStore } from "@/store/app-store";

const STATUS_TONE = { Berjalan: "primary", Selesai: "success", Direncanakan: "neutral" } as const;
const FEEDBACK_LABEL = {
  accurate: "Hasil sesuai",
  "false-positive": "Laporan salah deteksi",
  "false-negative": "Risiko terlewat",
  "new-pattern": "Pola baru",
} as const;

function InstitutionDashboard() {
  const feedback = useAppStore((s) => s.feedback);
  const updateStatus = useAppStore((s) => s.updateFeedbackStatus);
  const addKnowledge = useAppStore((s) => s.addKnowledge);
  const additions = useAppStore((s) => s.knowledgeAdditions);
  const { schools, programs, name } = DEMO_INSTITUTION;

  const participants = schools.reduce((s, x) => s + x.participants, 0);
  const weighted = (key: "avgLiteracy" | "participation") =>
    Math.round(schools.reduce((s, x) => s + x[key] * x.participants, 0) / participants);
  const lessons = contentRepository.listLessons();
  const quizzes = contentRepository.listQuizzes();
  const kb = contentRepository.listKnowledge();

  return (
    <div className="space-y-6">
      <PageHeader icon={<Building2 className="h-6 w-6" />} title="Dashboard Institusi" description={name} eyebrow={<DemoBadge label="Data Demo Institusi" />} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Participants" value={formatNumber(participants)} icon={<UsersRound className="h-5 w-5" />} />
        <StatCard label="Active Programs" value={programs.filter((p) => p.status === "Berjalan").length} hint={`${programs.length} program total`} icon={<Layers className="h-5 w-5" />} tone="accent" />
        <StatCard label="Average Digital Literacy" value={`${weighted("avgLiteracy")}%`} icon={<ShieldCheck className="h-5 w-5" />} tone="success" />
        <StatCard label="Participation Rate" value={`${weighted("participation")}%`} icon={<Percent className="h-5 w-5" />} tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader title="Program Progress" description="Program literasi digital yang dikelola institusi" />
          <CardContent>
            <ul className="space-y-5">
              {programs.map((p) => (
                <li key={p.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-fg">{p.name}</p>
                    <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
                  </div>
                  <p className="mb-2 text-sm text-fg-muted">
                    {p.description} · {formatNumber(p.participants)} peserta
                  </p>
                  <ProgressBar value={p.progress} label={`Progress ${p.name}`} tone={p.progress === 100 ? "success" : "primary"} showValue />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Sekolah" description="Partisipasi per unit" />
          <CardContent>
            <ul className="divide-y divide-border">
              {schools.map((s) => (
                <li key={s.name} className="py-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-fg">{s.name}</p>
                    <span className="text-sm text-fg-muted">{formatNumber(s.participants)} peserta</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-fg-muted">
                    <div>
                      Literasi {s.avgLiteracy}%
                      <ProgressBar value={s.avgLiteracy} label={`Literasi ${s.name}`} size="sm" className="mt-1" />
                    </div>
                    <div>
                      Partisipasi {s.participation}%
                      <ProgressBar value={s.participation} label={`Partisipasi ${s.name}`} size="sm" tone="success" className="mt-1" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Konten pembelajaran"
            description="Ringkasan konten per topik"
            icon={<Database className="h-5 w-5" />}
            action={
              <Link href="/knowledge" className="text-sm font-semibold text-primary hover:underline">
                Kelola Knowledge Base
              </Link>
            }
          />
          <CardContent>
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Jumlah pelajaran, quiz, dan entri knowledge base per topik</caption>
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-fg-muted">
                  <th scope="col" className="py-2">Topik</th>
                  <th scope="col" className="py-2">Pelajaran</th>
                  <th scope="col" className="py-2">Quiz</th>
                  <th scope="col" className="py-2">Pola KB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {CATEGORIES.map((c) => (
                  <tr key={c.id}>
                    <th scope="row" className="py-2.5 font-semibold text-fg">{c.title}</th>
                    <td className="py-2.5 tabular-nums">{lessons.filter((l) => l.category === c.id).length}</td>
                    <td className="py-2.5 tabular-nums">{quizzes.filter((q) => q.category === c.id).reduce((s, q) => s + q.questions.length, 0)} soal</td>
                    <td className="py-2.5 tabular-nums">{[...kb, ...additions].filter((k) => k.riskType === c.id).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-fg-muted">Pengguna demo: 1.434 siswa · 58 guru · 3 admin.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Masukan pengguna" description="Laporan dari hasil analisis untuk peningkatan knowledge base" icon={<Inbox className="h-5 w-5" />} />
          <CardContent>
            {feedback.length === 0 ? (
              <EmptyState
                icon={<Inbox className="h-6 w-6" />}
                title="Belum ada masukan"
                description="Masukan dari tombol “Apakah hasil analisis ini membantu?” akan muncul di sini."
              />
            ) : (
              <ul className="divide-y divide-border">
                {feedback.slice(0, 6).map((f) => (
                  <li key={f.id} className="py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={f.kind === "accurate" ? "success" : "warning"}>{FEEDBACK_LABEL[f.kind]}</Badge>
                      <span className="text-xs text-fg-muted">
                        {f.module === "community" ? "Komunitas" : MODULE_NAME[f.module]} · {CATEGORY_TITLE[f.category]} · {formatRelative(f.createdAt)}
                      </span>
                      <Badge className="ml-auto">{f.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-fg">{f.note}</p>
                    {f.status === "baru" && f.kind !== "accurate" && (
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => updateStatus(f.id, "ditinjau")}>
                          Tandai ditinjau
                        </Button>
                        <Button
                          size="sm"
                          variant="soft"
                          onClick={() => {
                            addKnowledge({
                              riskType: f.category,
                              indicator: f.kind === "new-pattern" ? "Pola baru dari komunitas" : "Koreksi deteksi",
                              pattern: f.note,
                              example: f.note,
                              action: "Ditinjau tim konten",
                              lessonSlug: lessons.find((l) => l.category === f.category)?.slug ?? lessons[0].slug,
                              source: "community",
                            });
                            updateStatus(f.id, "ditambahkan");
                          }}
                        >
                          <Library className="h-4 w-4" aria-hidden /> Tambah ke KB
                        </Button>
                      </div>
                    )}
                    {f.status === "ditambahkan" && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Ditambahkan ke Knowledge Base
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function InstitutionPage() {
  return (
    <RoleGuard roles={["ADMIN"]}>
      <InstitutionDashboard />
    </RoleGuard>
  );
}
