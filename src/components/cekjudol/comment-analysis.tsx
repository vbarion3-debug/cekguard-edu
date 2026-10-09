"use client";

import { MessageSquare, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, RiskBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { Tabs, tabPanelId } from "@/components/ui/tabs";
import type { CommentAnalysis } from "@/types";

type Filter = "all" | "high" | "medium" | "safe";
const PAGE = 8;

/** Highlights suspicious domains inside a comment. */
function Highlighted({ text, domains }: { text: string; domains: string[] }) {
  if (!domains.length) return <>{text}</>;
  const re = new RegExp(`(${domains.map((d) => d.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return (
    <>
      {text.split(re).map((part, i) =>
        domains.some((d) => d.toLowerCase() === part.toLowerCase()) ? (
          <mark key={i} className="rounded bg-danger-soft px-1 font-semibold text-danger underline decoration-dotted">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function CommentAnalysisList({ comments }: { comments: CommentAnalysis[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const counts = useMemo(
    () => ({
      all: comments.length,
      high: comments.filter((c) => c.riskLevel === "high").length,
      medium: comments.filter((c) => c.riskLevel === "medium").length,
      safe: comments.filter((c) => c.riskLevel === "safe").length,
    }),
    [comments],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Flagged comments first so the most relevant items are visible immediately.
    const order = { high: 0, medium: 1, low: 2, safe: 3 } as const;
    return comments
      .filter((c) => filter === "all" || c.riskLevel === filter)
      .filter((c) => !q || c.text.toLowerCase().includes(q) || c.author.toLowerCase().includes(q))
      .sort((a, b) => order[a.riskLevel] - order[b.riskLevel]);
  }, [comments, filter, query]);

  const tabs = [
    { id: "all" as const, label: "Semua", badge: <Badge className="ml-1">{counts.all}</Badge> },
    { id: "high" as const, label: "Risiko Tinggi", badge: <Badge tone="danger" className="ml-1">{counts.high}</Badge> },
    { id: "medium" as const, label: "Risiko Sedang", badge: <Badge tone="warning" className="ml-1">{counts.medium}</Badge> },
    { id: "safe" as const, label: "Normal", badge: <Badge tone="success" className="ml-1">{counts.safe}</Badge> },
  ];

  return (
    <Card>
      <CardHeader title="Analisis Komentar" description="Setiap komentar diklasifikasikan beserta pola yang ditemukan" icon={<MessageSquare className="h-5 w-5" />} />
      <CardContent className="space-y-4">
        <Tabs
          label="Filter tingkat risiko komentar"
          items={tabs}
          value={filter}
          onChange={(f) => {
            setFilter(f);
            setLimit(PAGE);
          }}
        />
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" aria-hidden />
          <label htmlFor="comment-search" className="sr-only">
            Cari komentar
          </label>
          <Input
            id="comment-search"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE);
            }}
            placeholder="Cari komentar..."
            className="pl-11"
          />
        </div>

        <div id={tabPanelId(filter)} role="tabpanel" aria-label={`Komentar: ${tabs.find((t) => t.id === filter)?.label}`}>
          <p className="mb-2 text-sm text-fg-muted" aria-live="polite">
            Menampilkan {Math.min(limit, filtered.length)} dari {filtered.length} komentar
          </p>
          {filtered.length === 0 ? (
            <EmptyState icon={<Search className="h-6 w-6" />} title="Tidak ada komentar yang cocok" description="Coba kata kunci atau filter lain." />
          ) : (
            <ul className="divide-y divide-border rounded-2xl border border-border">
              {filtered.slice(0, limit).map((c) => (
                <li key={c.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:gap-4">
                  <span className="hidden h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-bold text-fg-muted sm:grid" aria-hidden>
                    {c.author.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-fg-muted">@{c.author.toLowerCase().replace(/\s+/g, "")}</p>
                    <p className="reading mt-0.5 text-fg">
                      “<Highlighted text={c.text} domains={c.domains} />”
                    </p>
                    {c.matchedPatterns.length > 0 && (
                      <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Pola yang ditemukan">
                        {c.matchedPatterns.map((p) => (
                          <li key={p}>
                            <Badge tone="neutral">{p}</Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                    <RiskBadge level={c.riskLevel} />
                    <span className="text-xs font-medium text-fg-muted">
                      {c.label}
                      {c.riskLevel !== "safe" && ` · ${Math.round(c.confidence * 100)}%`}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {filtered.length > limit && (
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => setLimit((l) => l + PAGE * 2)}>
                Tampilkan lebih banyak
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
