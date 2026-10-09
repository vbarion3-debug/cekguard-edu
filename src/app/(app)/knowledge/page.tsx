"use client";

import { ArrowRight, BookOpen, Library, Plus, RefreshCw, Search, Send } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/feedback";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Tabs, tabPanelId } from "@/components/ui/tabs";
import { getLessonBySlug } from "@/data/demo/lessons";
import { CATEGORIES, CATEGORY_TITLE } from "@/lib/constants/categories";
import { formatRelative } from "@/lib/utils/format";
import { LESSON_FOR_CATEGORY } from "@/services/ai/templates";
import { contentRepository } from "@/services/database/repository";
import { useAppStore } from "@/store/app-store";
import type { RiskCategory } from "@/types";

const LOOP = ["Digital Case", "AI Analysis", "Risk Pattern", "Knowledge Base", "Learning Content", "Quiz", "User Feedback", "Knowledge Improvement"];
const SOURCE_LABEL = { curated: "Kurasi tim", community: "Komunitas", scan: "Dari hasil scan" } as const;

function EntryForm({ admin, onDone }: { admin: boolean; onDone: (msg: string) => void }) {
  const addKnowledge = useAppStore((s) => s.addKnowledge);
  const addFeedback = useAppStore((s) => s.addFeedback);
  const [riskType, setRiskType] = useState<RiskCategory>("judol");
  const [indicator, setIndicator] = useState("");
  const [pattern, setPattern] = useState("");
  const [example, setExample] = useState("");
  const [action, setAction] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      id="kb-form"
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (pattern.trim().length < 5) return setError("Jelaskan pola minimal 5 karakter.");
        if (admin) {
          addKnowledge({
            riskType,
            indicator: indicator.trim() || "Indikator baru",
            pattern: pattern.trim(),
            example: example.trim() || "-",
            action: action.trim() || "Ikuti tindakan aman pada pelajaran terkait",
            lessonSlug: LESSON_FOR_CATEGORY[riskType],
            source: "curated",
          });
          onDone("Pola baru ditambahkan ke Knowledge Base.");
        } else {
          addFeedback({ kind: "new-pattern", module: "community", category: riskType, note: `${pattern.trim()}${example.trim() ? ` — contoh: ${example.trim()}` : ""}` });
          onDone("Terima kasih! Laporan pola baru dikirim untuk ditinjau admin.");
        }
      }}
    >
      <div>
        <Label htmlFor="kb-type">Jenis risiko</Label>
        <select
          id="kb-type"
          value={riskType}
          onChange={(e) => setRiskType(e.target.value as RiskCategory)}
          className="h-12 w-full rounded-xl border-(length:--border-w) border-border-strong bg-surface px-4 text-fg"
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      {admin && (
        <div>
          <Label htmlFor="kb-indicator">Indikator</Label>
          <Input id="kb-indicator" value={indicator} maxLength={80} onChange={(e) => setIndicator(e.target.value)} placeholder="mis. Penyamaran emoji" />
        </div>
      )}
      <div>
        <Label htmlFor="kb-pattern">Pola yang ditemukan</Label>
        <Textarea
          id="kb-pattern"
          value={pattern}
          maxLength={300}
          onChange={(e) => {
            setPattern(e.target.value);
            setError(null);
          }}
          className="min-h-20"
          placeholder="Jelaskan pola atau modus baru yang kamu temukan"
          aria-invalid={!!error}
        />
        {error && (
          <p role="alert" className="mt-1 text-sm text-danger">
            {error}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="kb-example">Contoh (opsional)</Label>
        <Input id="kb-example" value={example} maxLength={200} onChange={(e) => setExample(e.target.value)} placeholder="Jangan sertakan data pribadi" />
      </div>
      {admin && (
        <div>
          <Label htmlFor="kb-action">Tindakan aman</Label>
          <Input id="kb-action" value={action} maxLength={120} onChange={(e) => setAction(e.target.value)} />
        </div>
      )}
    </form>
  );
}

export default function KnowledgePage() {
  const role = useAppStore((s) => s.session?.role);
  const additions = useAppStore((s) => s.knowledgeAdditions);
  const [filter, setFilter] = useState<"all" | RiskCategory>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const admin = role === "ADMIN";

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...additions, ...contentRepository.listKnowledge()]
      .filter((e) => filter === "all" || e.riskType === filter)
      .filter((e) => !q || `${e.indicator} ${e.pattern} ${e.example}`.toLowerCase().includes(q));
  }, [additions, filter, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Library className="h-6 w-6" />}
        title="Digital Safety Knowledge Base"
        description="Basis pengetahuan pola risiko yang menghubungkan deteksi, materi belajar, dan tindakan aman. Terus diperbarui mengikuti pola ancaman baru."
        actions={
          <Button onClick={() => setOpen(true)}>
            {admin ? <Plus className="h-4 w-4" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
            {admin ? "Tambah pola" : "Laporkan pola baru"}
          </Button>
        }
      />

      {notice && (
        <Alert tone="success" live title={notice} />
      )}

      <Card>
        <CardHeader title="Siklus berkelanjutan" description="Bagaimana CekGuard terus belajar dari kasus nyata" icon={<RefreshCw className="h-5 w-5" />} />
        <CardContent>
          <ol className="flex flex-wrap items-center gap-2">
            {LOOP.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-fg">
                  <span className="mr-1.5 text-primary">{i + 1}.</span>
                  {step}
                </span>
                {i < LOOP.length - 1 && <ArrowRight className="h-4 w-4 text-fg-muted" aria-hidden />}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <Tabs
          label="Filter jenis risiko"
          value={filter}
          onChange={setFilter}
          size="sm"
          className="lg:w-auto"
          items={[{ id: "all", label: "Semua" }, ...CATEGORIES.map((c) => ({ id: c.id, label: c.title }))]}
        />
        <div className="relative lg:ml-auto lg:w-72">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" aria-hidden />
          <label htmlFor="kb-search" className="sr-only">
            Cari pola
          </label>
          <Input id="kb-search" type="search" placeholder="Cari indikator atau pola..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-11" />
        </div>
      </div>

      <div id={tabPanelId(filter)} role="tabpanel">
        {entries.length === 0 ? (
          <EmptyState icon={<Search className="h-6 w-6" />} title="Tidak ada pola yang cocok" />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {entries.map((e) => {
              const lesson = getLessonBySlug(e.lessonSlug);
              return (
                <li key={e.id} className="card flex flex-col p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="primary">{CATEGORY_TITLE[e.riskType]}</Badge>
                    <Badge tone={e.source === "community" ? "accent" : e.source === "scan" ? "warning" : "neutral"}>{SOURCE_LABEL[e.source]}</Badge>
                    <span className="ml-auto text-xs text-fg-muted">v{e.version} · {formatRelative(e.updatedAt)}</span>
                  </div>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Indicator</dt>
                      <dd className="font-bold text-fg">{e.indicator}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Pattern</dt>
                      <dd className="text-fg">{e.pattern}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Example</dt>
                      <dd className="break-words italic text-fg-muted">{e.example}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Recommended Action</dt>
                      <dd className="text-fg">{e.action}</dd>
                    </div>
                  </dl>
                  {lesson && (
                    <Link href={`/learning/${lesson.slug}`} className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-primary hover:underline">
                      <BookOpen className="h-4 w-4" aria-hidden /> {lesson.title}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={admin ? "Tambah pola ke Knowledge Base" : "Laporkan pola baru"}
        description={admin ? "Pola baru langsung tersedia untuk pembelajaran dan AI Tutor." : "Laporanmu akan ditinjau admin sebelum ditambahkan."}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" form="kb-form">
              {admin ? "Simpan pola" : "Kirim laporan"}
            </Button>
          </>
        }
      >
        {open && (
          <EntryForm
            admin={admin}
            onDone={(msg) => {
              setOpen(false);
              setNotice(msg);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
