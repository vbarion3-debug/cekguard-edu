"use client";

import { ArrowLeft, Info, Link2, MessageSquareWarning, ScanSearch, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { DonutChart } from "@/components/charts/charts";
import { CommentAnalysisList } from "@/components/cekjudol/comment-analysis";
import { DomainIntelligence } from "@/components/cekjudol/domain-intelligence";
import { AnalysisProgress } from "@/components/scan/analysis-progress";
import {
  ExplanationCard,
  LearningConnection,
  ResultBanner,
  ResultFeedback,
  RiskScoreCard,
  SafeActionsCard,
} from "@/components/scan/result-sections";
import { DemoBadge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/feedback";
import { FieldError, FieldHint, Input, Label } from "@/components/ui/input";
import { useScan } from "@/hooks/use-scan";
import { DEMO_JUDOL_URL } from "@/lib/constants/modules";
import { formatNumber } from "@/lib/utils/format";
import { validateContentUrl } from "@/lib/validation/url";
import { scanJudol } from "@/services/scan/client";
import type { AnalysisResult, JudolDetails } from "@/types";

const STEPS = ["Memeriksa komentar", "Menganalisis pola bahasa", "Memeriksa tautan", "Mengidentifikasi indikasi risiko"];

function JudolStats({ d }: { d: JudolDetails }) {
  const stats = [
    { label: "Total komentar", value: d.totalComments, cls: "text-fg" },
    { label: "Terindikasi Judol", value: d.flagged, cls: "text-danger" },
    { label: "Normal", value: d.normal, cls: "text-success" },
    { label: "Domain mencurigakan", value: d.domains.length, cls: "text-warning" },
  ];
  return (
    <Card>
      <CardContent className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-surface-2 p-4">
              <dt className="text-sm text-fg-muted">{s.label}</dt>
              <dd className={`mt-1 text-3xl font-extrabold tabular-nums ${s.cls}`}>{formatNumber(s.value)}</dd>
            </div>
          ))}
        </dl>
        <div className="flex items-center gap-4">
          <DonutChart
            label={`Komposisi komentar: ${d.highRisk} risiko tinggi, ${d.mediumRisk} risiko sedang, ${d.normal} normal`}
            centerValue={`${Math.round((d.flagged / d.totalComments) * 100)}%`}
            centerLabel="terindikasi"
            segments={[
              { label: "Risiko tinggi", value: d.highRisk, tone: "danger", pattern: true },
              { label: "Risiko sedang", value: d.mediumRisk, tone: "warning" },
              { label: "Normal", value: d.normal, tone: "success" },
            ]}
          />
          <ul className="space-y-1.5 text-sm" aria-hidden>
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[repeating-linear-gradient(45deg,var(--danger)_0_2px,transparent_2px_4px)] ring-1 ring-danger" />
              Tinggi ({d.highRisk})
            </li>
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-warning" /> Sedang ({d.mediumRisk})
            </li>
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-success" /> Normal ({d.normal})
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function JudolResult({ result, onReset }: { result: AnalysisResult; onReset: () => void }) {
  const d = result.details as JudolDetails;
  return (
    <div className="space-y-6">
      <ResultBanner result={result} onReset={onReset} />
      <p className="text-sm text-fg-muted">
        Konten: <span className="font-semibold text-fg">{d.contentTitle}</span> · {d.platform} ·{" "}
        <span className="break-all font-mono text-xs">{result.input}</span>
      </p>
      <RiskScoreCard result={result} />
      <JudolStats d={d} />
      <ExplanationCard result={result} />
      <LearningConnection result={result} />
      <CommentAnalysisList comments={d.comments} />
      <DomainIntelligence domains={d.domains} />
      <SafeActionsCard result={result} />
      <ResultFeedback result={result} />
    </div>
  );
}

export default function CekJudolPage() {
  return (
    <Suspense>
      <CekJudolContent />
    </Suspense>
  );
}

function CekJudolContent() {
  const scan = useScan("cekjudol");
  const params = useSearchParams();
  const [url, setUrl] = useState(params.get("url") ?? "");

  // Arriving from the Cek Risiko hub with ?url=…&auto=1 starts the analysis immediately.
  const autoUrl = params.get("auto") === "1" ? params.get("url") : null;
  const { run } = scan;
  const autoStarted = useRef(false);
  useEffect(() => {
    if (!autoUrl || autoStarted.current || !validateContentUrl(autoUrl).ok) return;
    autoStarted.current = true;
    window.history.replaceState(null, "", window.location.pathname);
    run(() => scanJudol(autoUrl));
  }, [autoUrl, run]);

  function submit() {
    const v = validateContentUrl(url);
    if (!v.ok) {
      scan.setError(v.error);
      return;
    }
    scan.run(() => scanJudol(url));
  }

  return (
    <div>
      <Link href="/scan" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-fg-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Cek Risiko
      </Link>
      <PageHeader
        icon={<MessageSquareWarning className="h-6 w-6" />}
        eyebrow={
          <>
            <StatusBadge status="available" />
            <DemoBadge label="Sumber komentar: data demo" />
          </>
        }
        title="CekJudol"
        description="Analisis komentar untuk menemukan indikasi promosi judi online serta memahami pola yang digunakan."
      />

      {scan.status === "loading" && <AnalysisProgress steps={STEPS} />}

      {scan.status === "success" && scan.result && <JudolResult result={scan.result} onReset={scan.reset} />}

      {(scan.status === "idle" || scan.status === "error") && (
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Card>
            <CardContent>
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                <Label htmlFor="judol-url">Masukkan URL konten</Label>
                <div className="relative">
                  <Link2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-fg-muted" aria-hidden />
                  <Input
                    id="judol-url"
                    type="url"
                    inputMode="url"
                    autoComplete="off"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (scan.error) scan.setError(null);
                    }}
                    placeholder={DEMO_JUDOL_URL}
                    aria-invalid={!!scan.error}
                    aria-describedby="judol-url-hint judol-url-error"
                    className="pl-12"
                  />
                </div>
                <FieldHint id="judol-url-hint">Mendukung tautan YouTube, TikTok, Instagram, Facebook, dan X.</FieldHint>
                <FieldError id="judol-url-error" message={scan.error} />
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button type="submit" size="lg" disabled={!url.trim()}>
                    <ScanSearch className="h-5 w-5" aria-hidden /> Mulai Analisis
                  </Button>
                  <Button
                    variant="soft"
                    size="lg"
                    onClick={() => {
                      setUrl(DEMO_JUDOL_URL);
                      scan.setError(null);
                    }}
                  >
                    <Sparkles className="h-5 w-5" aria-hidden /> Gunakan contoh
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-surface-2">
            <CardContent>
              <h2 className="flex items-center gap-2 font-bold text-fg">
                <Info className="h-5 w-5 text-primary" aria-hidden /> Cara kerja CekJudol
              </h2>
              <ol className="mt-4 space-y-3 text-sm">
                {[
                  ["Validasi URL", "Hanya tautan dari platform yang didukung."],
                  ["Ambil komentar", "Prototipe memakai dataset komentar demo."],
                  ["Klasifikasi AI", "Setiap komentar dinilai berdasarkan pola promosi judi."],
                  ["Penjelasan & belajar", "Hasil dijelaskan, lalu terhubung ke materi dan quiz."],
                ].map(([t, d], i) => (
                  <li key={t} className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-on-primary" aria-hidden>
                      {i + 1}
                    </span>
                    <span>
                      <span className="font-semibold text-fg">{t}</span>
                      <span className="block text-fg-muted">{d}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs text-fg-muted">
                CekGuard tidak menghapus atau memoderasi konten di platform lain. Gunakan fitur laporan resmi platform.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
