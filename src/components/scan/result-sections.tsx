"use client";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Flag,
  GraduationCap,
  Lightbulb,
  ListChecks,
  MessageSquareText,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";
import { RadialScore } from "@/components/charts/charts";
import { Alert } from "@/components/ui/alert";
import { DemoBadge, RiskBadge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Segmented } from "@/components/ui/controls";
import { Textarea, Label } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { SpeakButton } from "@/components/ui/speak-button";
import { useEffectiveLevel } from "@/hooks/use-learning";
import { LEVELS } from "@/lib/constants/categories";
import { RISK_META } from "@/lib/constants/risk";
import { useAppStore } from "@/store/app-store";
import type { AnalysisResult, LearningLevel } from "@/types";

const TONE_STROKE = { danger: "danger", warning: "warning", info: "info", success: "success" } as const;

/** Header strip: success message + demo/provider transparency. */
export function ResultBanner({ result, onReset }: { result: AnalysisResult; onReset: () => void }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Alert tone="success" live className="flex-1" title="Analisis selesai.">
        Hasil di bawah ini adalah <strong>indikasi</strong> berdasarkan pola, bukan kepastian mutlak.
      </Alert>
      <div className="flex items-center gap-2">
        {result.isDemo && <DemoBadge />}
        <Button variant="outline" onClick={onReset}>
          Periksa konten lain
        </Button>
      </div>
    </div>
  );
}

export function RiskScoreCard({ result, children }: { result: AnalysisResult; children?: React.ReactNode }) {
  const meta = RISK_META[result.riskLevel];
  return (
    <Card className="animate-pop">
      <CardContent className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <RadialScore
          value={result.riskScore}
          tone={TONE_STROKE[meta.tone]}
          label={`Skor risiko ${result.riskScore} dari 100 — ${meta.label}`}
          caption="skor risiko"
        />
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-sm font-semibold text-fg-muted">Hasil Analisis</p>
          <div className="mt-2">
            <RiskBadge level={result.riskLevel} size="lg" />
          </div>
          <p className="mt-3 text-xl font-extrabold text-fg sm:text-2xl">{result.summary}</p>
          <p className="mt-1 font-semibold tabular-nums text-fg-muted">
            {result.riskScore}/100 — {result.module === "cekdeepfake" ? result.headline : meta.label}
          </p>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

/** "Mengapa konten ini berisiko?" — level-adaptive explanation with indicators. */
export function ExplanationCard({ result }: { result: AnalysisResult }) {
  const effective = useEffectiveLevel();
  const simplified = useAppStore((s) => s.accessibility.simplified);
  const [level, setLevel] = useState<LearningLevel>(effective);
  const text = result.explanations[level];
  const safe = result.riskLevel === "safe" || result.riskLevel === "low";

  return (
    <Card>
      <CardHeader
        title={safe ? "Apa artinya hasil ini?" : "Mengapa konten ini berisiko?"}
        description="Penjelasan menyesuaikan tingkat literasi digital"
        icon={<Lightbulb className="h-5 w-5" />}
        action={<SpeakButton id={`explain-${result.id}`} text={text} />}
      />
      <CardContent className="space-y-5">
        {!simplified && (
          <Segmented
            label="Tingkat penjelasan"
            value={level}
            onChange={setLevel}
            options={LEVELS.map((l) => ({ value: l.id, label: l.label }))}
          />
        )}
        <p className="reading rounded-2xl bg-surface-2 p-4 text-fg sm:text-lg" aria-live="polite">
          {text}
        </p>
        {result.indicators.length > 0 && (
          <div>
            <h3 className="mb-3 font-bold text-fg">Indikator yang ditemukan</h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {result.indicators.map((ind) => (
                <li key={ind.id} className="flex items-start gap-3 rounded-xl border border-border p-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden />
                  <div className="min-w-0">
                    <p className="font-semibold text-fg">
                      {ind.label}
                      {ind.count !== undefined && <span className="ml-1.5 text-sm font-medium text-fg-muted">({ind.count} komentar)</span>}
                    </p>
                    {!simplified && <p className="text-sm text-fg-muted">{ind.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** LEARN: bridge from detection to the relevant lesson and quiz. */
export function LearningConnection({ result }: { result: AnalysisResult }) {
  const rec = result.recommendation;
  return (
    <section
      aria-labelledby={`learn-${result.id}`}
      className="card relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary-soft to-surface p-6"
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary text-on-primary" aria-hidden>
          <GraduationCap className="h-7 w-7" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={`learn-${result.id}`} className="text-lg font-bold text-fg sm:text-xl">
            {rec.prompt}
          </h2>
          <p className="mt-1 text-fg-muted">{rec.reason}</p>
          <p className="mt-2 text-sm font-semibold text-primary">Pelajaran: {rec.lessonTitle}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
          <ButtonLink href={`/learning/${rec.lessonSlug}?from=${result.module}`} size="lg">
            <BookOpen className="h-5 w-5" aria-hidden /> Pelajari Mengapa
          </ButtonLink>
          <ButtonLink href={`/quiz/${rec.quizId}`} size="lg" variant="outline">
            <ListChecks className="h-5 w-5" aria-hidden /> Uji Pemahaman
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

/** ACT: safe actions + report guidance. */
export function SafeActionsCard({ result }: { result: AnalysisResult }) {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <CardHeader
        title="Tindakan aman yang dapat dilakukan"
        description="Langkah yang bisa langsung kamu lakukan"
        icon={<ShieldCheck className="h-5 w-5" />}
        action={
          <SpeakButton
            id={`act-${result.id}`}
            text={result.safeActions.map((a) => `${a.title}. ${a.description}`).join(" ")}
          />
        }
      />
      <CardContent>
        <ol className="grid gap-3 sm:grid-cols-2">
          {result.safeActions.map((a, i) => (
            <li key={a.id} className="flex items-start gap-3 rounded-xl bg-success-soft/60 p-3 [[data-contrast=high]_&]:border-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-success font-bold text-white text-sm" aria-hidden>
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-fg">{a.title}</p>
                <p className="text-sm text-fg-muted">{a.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <Button variant="soft" className="mt-4" onClick={() => setOpen(true)}>
          <Flag className="h-4 w-4" aria-hidden /> Panduan pelaporan
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Panduan pelaporan"
          description="CekGuard tidak menghapus konten di platform lain. Kamu dapat melapor melalui kanal resmi berikut."
          footer={<Button onClick={() => setOpen(false)}>Mengerti</Button>}
        >
          <ol className="reading space-y-4 text-sm">
            <li>
              <p className="font-semibold text-fg">1. Laporkan di platform</p>
              <p className="text-fg-muted">
                Ketuk ikon titik tiga pada komentar/akun → <strong>Laporkan</strong> → pilih <strong>Spam</strong> atau{" "}
                <strong>Penipuan</strong>. Moderator platform akan meninjau laporan.
              </p>
            </li>
            <li>
              <p className="font-semibold text-fg">2. Simpan bukti</p>
              <p className="text-fg-muted">Ambil tangkapan layar yang memuat nama akun, isi konten, dan tanggal.</p>
            </li>
            <li>
              <p className="font-semibold text-fg">3. Kanal aduan resmi</p>
              <p className="text-fg-muted">
                Konten negatif (termasuk judi online) dapat diadukan melalui kanal aduan konten pemerintah (aduankonten.id).
                Rekening yang dipakai penipuan dapat dicek/dilaporkan melalui cekrekening.id.
              </p>
            </li>
            <li>
              <p className="font-semibold text-fg">4. Ceritakan ke orang tepercaya</p>
              <p className="text-fg-muted">Guru, orang tua, atau konselor sekolah dapat membantu jika kamu merasa dirugikan.</p>
            </li>
          </ol>
        </Modal>
      </CardContent>
    </Card>
  );
}

/** Feedback feeds the knowledge base (sustainability loop). */
export function ResultFeedback({ result }: { result: AnalysisResult }) {
  const addFeedback = useAppStore((s) => s.addFeedback);
  const [state, setState] = useState<"idle" | "form" | "sent">("idle");
  const [note, setNote] = useState("");

  if (state === "sent") {
    return (
      <Alert tone="success" live title="Terima kasih atas masukanmu!">
        Masukan akan ditinjau dan membantu memperbarui Knowledge Base CekGuard.
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 font-semibold text-fg">
            <MessageSquareText className="h-5 w-5 text-primary" aria-hidden /> Apakah hasil analisis ini membantu?
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                addFeedback({ kind: "accurate", module: result.module, category: result.category, note: "Hasil sesuai" });
                setState("sent");
              }}
            >
              <ThumbsUp className="h-4 w-4" aria-hidden /> Ya, sesuai
            </Button>
            <Button variant="outline" size="sm" onClick={() => setState("form")} aria-expanded={state === "form"}>
              <ThumbsDown className="h-4 w-4" aria-hidden /> Laporkan kesalahan
            </Button>
          </div>
        </div>
        {state === "form" && (
          <form
            className="animate-fade-in"
            onSubmit={(e) => {
              e.preventDefault();
              addFeedback({
                kind: "false-positive",
                module: result.module,
                category: result.category,
                note: note.trim() || "Tanpa catatan",
              });
              setState("sent");
            }}
          >
            <Label htmlFor={`fb-${result.id}`}>Apa yang kurang tepat? (opsional)</Label>
            <Textarea
              id={`fb-${result.id}`}
              value={note}
              maxLength={500}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: komentar nomor 5 sebenarnya bukan promosi."
              className="min-h-24"
            />
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setState("idle")}>
                Batal
              </Button>
              <Button type="submit">
                Kirim masukan <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
