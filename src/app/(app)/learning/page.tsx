"use client";

import { BookOpen, Sparkles } from "lucide-react";
import { useState } from "react";
import { LessonCard } from "@/components/learning/lesson-card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/feedback";
import { Tabs, tabPanelId } from "@/components/ui/tabs";
import { useLearningStats } from "@/hooks/use-learning";
import { CATEGORIES, LEVEL_LABEL } from "@/lib/constants/categories";
import { contentRepository } from "@/services/database/repository";
import { lessonPercent } from "@/services/learning/progress";
import { useAppStore } from "@/store/app-store";
import type { RiskCategory } from "@/types";

type Filter = "all" | RiskCategory;

export default function LearningPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const progress = useAppStore((s) => s.lessonProgress);
  const level = useAppStore((s) => s.profile.level);
  const stats = useLearningStats();
  const lessons = contentRepository.listLessons(filter === "all" ? undefined : filter);
  const mastery = Object.fromEntries(stats.mastery.map((m) => [m.category, m.score]));

  return (
    <div>
      <PageHeader
        icon={<BookOpen className="h-6 w-6" />}
        title="Belajar"
        description="Pelajari risiko digital melalui contoh nyata, latihan interaktif, dan tindakan aman."
        eyebrow={<Badge tone="primary">Level kamu: {LEVEL_LABEL[level]}</Badge>}
      />

      <section className="card mb-6 flex flex-col gap-4 border-accent/30 bg-accent-soft/60 p-5 sm:flex-row sm:items-center">
        <Sparkles className="h-6 w-6 shrink-0 text-accent" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-fg">Rekomendasi belajar berikutnya</p>
          <p className="text-sm text-fg-muted">{stats.next.reason}</p>
        </div>
        <ButtonLink href={`/learning/${stats.next.lesson.slug}`} variant="primary">
          {stats.next.lesson.title}
        </ButtonLink>
      </section>

      <Tabs
        label="Kategori pembelajaran"
        value={filter}
        onChange={setFilter}
        items={[
          { id: "all", label: "Semua" },
          ...CATEGORIES.map((c) => ({
            id: c.id,
            label: c.title,
            badge: <span className="ml-1 text-xs font-medium text-fg-muted tabular-nums">{mastery[c.id]}%</span>,
          })),
        ]}
      />

      <div id={tabPanelId(filter)} role="tabpanel" className="mt-6">
        {filter !== "all" && (
          <p className="mb-4 text-fg-muted">{CATEGORIES.find((c) => c.id === filter)?.description}</p>
        )}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {lessons.map((l) => (
            <LessonCard key={l.id} lesson={l} percent={lessonPercent(progress[l.id])} completed={!!progress[l.id]?.completed} />
          ))}
        </div>
      </div>
    </div>
  );
}
