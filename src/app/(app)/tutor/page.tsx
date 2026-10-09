"use client";

import { ArrowRight, BookOpen, Bot, Brain, Loader2, RotateCcw, Send, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/feedback";
import { RichText } from "@/components/ui/rich-text";
import { SpeakButton } from "@/components/ui/speak-button";
import { useLearningStats } from "@/hooks/use-learning";
import { CATEGORY_TITLE, LEVEL_LABEL } from "@/lib/constants/categories";
import { cn } from "@/lib/utils/cn";
import { askTutor } from "@/services/scan/client";
import { useAppStore } from "@/store/app-store";
import type { RiskCategory, TutorContext } from "@/types";

const SUGGESTED = [
  "Apa itu phishing?",
  "Bagaimana cara mengenali deepfake?",
  "Apa yang harus dilakukan jika menerima scam call?",
  "Mengapa komentar tersebut dianggap judi online?",
];

export default function TutorPage() {
  const messages = useAppStore((s) => s.tutorMessages);
  const addMessage = useAppStore((s) => s.addTutorMessage);
  const clearTutor = useAppStore((s) => s.clearTutor);
  const profile = useAppStore((s) => s.profile);
  const simplified = useAppStore((s) => s.accessibility.simplified);
  const lastJudol = useAppStore((s) => s.lastResults.cekjudol);
  const lastScan = useAppStore((s) => s.scans[0]);
  const stats = useLearningStats();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState<RiskCategory | undefined>(lastScan?.category);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, loading]);

  const context: TutorContext = {
    level: profile.level,
    simplified,
    completedLessons: stats.completedLessons,
    weakestCategory: stats.weakest.category,
    weakestScore: stats.weakest.score,
    currentTopic: topic,
    lastScanSummary:
      lastJudol && lastJudol.details.kind === "judol"
        ? `CekJudol: ${lastJudol.details.flagged} dari ${lastJudol.details.totalComments} komentar terindikasi promosi judi online`
        : undefined,
  };

  async function send(text: string) {
    const message = text.trim();
    if (!message || loading) return;
    setInput("");
    setError(null);
    const history = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));
    addMessage({ role: "user", content: message });
    setLoading(true);
    try {
      const reply = await askTutor(message, context, history);
      if (reply.topic) setTopic(reply.topic);
      addMessage({ role: "tutor", content: reply.content, recommendation: reply.recommendation, followUps: reply.followUps });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div>
      <PageHeader
        icon={<Bot className="h-6 w-6" />}
        title="AI Tutor"
        description="Tanyakan apa pun tentang keamanan digital."
        actions={
          messages.length > 0 && (
            <Button variant="outline" onClick={clearTutor}>
              <RotateCcw className="h-4 w-4" aria-hidden /> Percakapan baru
            </Button>
          )
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card className="flex min-h-[560px] flex-col overflow-hidden">
          <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6" role="log" aria-live="polite" aria-label="Percakapan dengan AI Tutor">
            {messages.length === 0 && (
              <div className="py-6 text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-primary-soft text-primary" aria-hidden>
                  <Sparkles className="h-8 w-8" />
                </span>
                <p className="mt-4 text-lg font-bold text-fg">Halo! Aku AI Tutor CekGuard.</p>
                <p className="mx-auto mt-1 max-w-md text-fg-muted">
                  Aku membantu kamu memahami risiko digital dengan bahasa yang sesuai level belajarmu ({LEVEL_LABEL[simplified ? "pemula" : profile.level]}).
                </p>
                <ul className="mx-auto mt-6 grid max-w-xl gap-2 sm:grid-cols-2">
                  {SUGGESTED.map((q) => (
                    <li key={q}>
                      <button
                        type="button"
                        onClick={() => send(q)}
                        className="h-full w-full rounded-xl border border-border bg-surface p-3 text-left text-sm font-medium text-fg transition-colors hover:border-primary/40 hover:bg-primary-soft"
                      >
                        {q}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={m.id} className={cn("flex animate-fade-up gap-3", m.role === "user" && "flex-row-reverse")}>
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-full",
                    m.role === "user" ? "bg-surface-2 text-fg-muted" : "bg-primary text-on-primary",
                  )}
                  aria-hidden
                >
                  {m.role === "user" ? <UserRound className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </span>
                <div className={cn("max-w-[85%] space-y-3", m.role === "user" && "text-right")}>
                  <p className="sr-only">{m.role === "user" ? "Kamu:" : "AI Tutor:"}</p>
                  <div
                    className={cn(
                      "inline-block rounded-2xl px-4 py-3 text-left",
                      m.role === "user"
                        ? "rounded-tr-sm bg-primary text-on-primary"
                        : "rounded-tl-sm border border-border bg-surface-2 text-fg",
                    )}
                  >
                    {m.role === "user" ? <p>{m.content}</p> : <RichText text={m.content} />}
                  </div>
                  {m.role === "tutor" && (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <SpeakButton id={`tutor-${m.id}`} text={m.content} />
                      </div>
                      {m.recommendation && (
                        <Link
                          href={`/learning/${m.recommendation.lessonSlug}`}
                          className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary-soft/60 p-3 text-left hover:bg-primary-soft"
                        >
                          <BookOpen className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-semibold text-primary">Recommended Lesson</span>
                            <span className="block font-semibold text-fg">{m.recommendation.lessonTitle}</span>
                          </span>
                          <ArrowRight className="h-4 w-4 text-primary" aria-hidden />
                        </Link>
                      )}
                      {i === messages.length - 1 && m.followUps && m.followUps.length > 0 && !loading && (
                        <div className="flex flex-wrap gap-2">
                          {m.followUps.map((f) => (
                            <button
                              key={f}
                              type="button"
                              onClick={() => send(f)}
                              className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-fg hover:border-primary/40 hover:bg-primary-soft"
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3" role="status">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-on-primary" aria-hidden>
                  <Bot className="h-4 w-4" />
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm text-fg-muted">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> AI Tutor sedang menyusun jawaban...
                </span>
              </div>
            )}
            {error && (
              <Alert tone="danger" live title="Gagal mengirim pertanyaan">
                {error}
              </Alert>
            )}
            <div ref={endRef} />
          </div>

          <form
            className="border-t border-border bg-surface p-3 sm:p-4"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <label htmlFor="tutor-input" className="sr-only">
              Tulis pertanyaan tentang keamanan digital
            </label>
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                id="tutor-input"
                rows={1}
                value={input}
                maxLength={1000}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Tulis pertanyaanmu... (Enter untuk kirim)"
                className="max-h-40 min-h-12 flex-1 resize-none rounded-xl border-(length:--border-w) border-border-strong bg-surface px-4 py-3 text-fg placeholder:text-fg-muted/80 focus:border-primary focus-visible:outline-none focus-visible:ring-[length:var(--focus-w)] focus-visible:ring-primary/30"
              />
              <Button type="submit" size="icon" className="h-12 w-12" disabled={!input.trim() || loading} aria-label="Kirim pertanyaan">
                <Send className="h-5 w-5" aria-hidden />
              </Button>
            </div>
          </form>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader title="Konteks belajarmu" description="AI Tutor menyesuaikan jawaban dengan data ini" icon={<Brain className="h-5 w-5" />} as="h2" />
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-fg-muted">Level</dt>
                  <dd className="font-semibold text-fg">
                    {LEVEL_LABEL[profile.level]}
                    {simplified && <Badge className="ml-2">Bahasa sederhana</Badge>}
                  </dd>
                </div>
                <div>
                  <dt className="text-fg-muted">Pelajaran selesai</dt>
                  <dd className="font-semibold text-fg">{stats.completedLessons.length} pelajaran</dd>
                </div>
                <div>
                  <dt className="text-fg-muted">Performa quiz</dt>
                  <dd className="font-semibold text-fg">Rata-rata {stats.averageQuiz}% dari {stats.quizzesCompleted} quiz</dd>
                </div>
                <div>
                  <dt className="text-fg-muted">Perlu diperkuat</dt>
                  <dd className="font-semibold text-fg">
                    {stats.weakest.title} ({stats.weakest.score}%)
                  </dd>
                </div>
                <div>
                  <dt className="text-fg-muted">Topik saat ini</dt>
                  <dd className="font-semibold text-fg">{topic ? CATEGORY_TITLE[topic] : "Belum ada"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          <p className="px-1 text-xs text-fg-muted">
            AI Tutor hanya membahas keamanan digital dan dapat keliru. Untuk keadaan darurat, hubungi layanan resmi terkait.
          </p>
        </aside>
      </div>
    </div>
  );
}
