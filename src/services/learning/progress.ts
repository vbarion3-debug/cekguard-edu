import { BASELINE_ASSESSMENT } from "@/data/demo/seed-user";
import { LESSONS } from "@/data/demo/lessons";
import { CATEGORIES } from "@/lib/constants/categories";
import { dayKey, daysBetween } from "@/lib/utils/format";
import type { Achievement, Lesson, LessonProgress, QuizAttempt, RiskCategory, ScanRecord } from "@/types";

/**
 * Pure learning-analytics functions. UI reads derived values from here so
 * every page (dashboard, progress, profile, teacher) shows the same numbers.
 */

export interface LearningSnapshot {
  lessonProgress: Record<string, LessonProgress>;
  quizAttempts: QuizAttempt[];
  scans?: ScanRecord[];
  streak?: { count: number; lastActive: string };
  scoreHistory?: { date: string; score: number }[];
}

export function bestQuizScore(attempts: QuizAttempt[], category: RiskCategory): number | undefined {
  const scores = attempts.filter((a) => a.category === category).map((a) => a.score);
  return scores.length ? Math.max(...scores) : undefined;
}

export function lessonPercent(p?: LessonProgress): number {
  if (!p) return 0;
  if (p.completed) return 100;
  return Math.round((p.step / p.totalSteps) * 100);
}

/** Mastery = 40% lesson completion + 60% best quiz score (placement score before the first quiz). */
export function categoryMastery(s: LearningSnapshot, category: RiskCategory): number {
  const lessons = LESSONS.filter((l) => l.category === category);
  const lessonPart = lessons.length
    ? lessons.reduce((sum, l) => {
        const p = s.lessonProgress[l.id];
        if (!p) return sum;
        return sum + (p.completed ? 1 : (p.step / p.totalSteps) * 0.6);
      }, 0) / lessons.length
    : 0;
  const quizPart = bestQuizScore(s.quizAttempts, category) ?? BASELINE_ASSESSMENT[category];
  return Math.round(lessonPart * 40 + quizPart * 0.6);
}

export function allMastery(s: LearningSnapshot): { category: RiskCategory; title: string; score: number }[] {
  return CATEGORIES.map((c) => ({ category: c.id, title: c.title, score: categoryMastery(s, c.id) }));
}

export function digitalSafetyScore(s: LearningSnapshot): number {
  const m = allMastery(s);
  return Math.round(m.reduce((sum, x) => sum + x.score, 0) / m.length);
}

export function weakestCategory(s: LearningSnapshot) {
  return [...allMastery(s)].sort((a, b) => a.score - b.score)[0];
}

export function completedLessonIds(s: LearningSnapshot): string[] {
  return Object.values(s.lessonProgress)
    .filter((p) => p.completed)
    .map((p) => p.lessonId);
}

export function inProgressLessons(s: LearningSnapshot): { lesson: Lesson; percent: number }[] {
  return Object.values(s.lessonProgress)
    .filter((p) => !p.completed && p.step > 0)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .flatMap((p) => {
      const lesson = LESSONS.find((l) => l.id === p.lessonId);
      return lesson ? [{ lesson, percent: lessonPercent(p) }] : [];
    });
}

export function averageQuizScore(attempts: QuizAttempt[]): number {
  if (!attempts.length) return 0;
  return Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length);
}

/** A streak is only "alive" if the learner was active today or yesterday. */
export function currentStreak(streak?: { count: number; lastActive: string }): number {
  if (!streak) return 0;
  return daysBetween(streak.lastActive, dayKey()) <= 1 ? streak.count : 0;
}

export function weeklyDelta(history: { date: string; score: number }[] | undefined, current: number): number {
  if (!history?.length) return 0;
  const today = dayKey();
  const reference = [...history].reverse().find((h) => daysBetween(h.date, today) >= 7);
  return reference ? current - reference.score : 0;
}

export interface NextRecommendation {
  category: RiskCategory;
  title: string;
  score: number;
  lesson: Lesson;
  reason: string;
}

/** Recommend the first unfinished lesson in the weakest category. */
export function recommendNext(s: LearningSnapshot): NextRecommendation {
  const ranked = [...allMastery(s)].sort((a, b) => a.score - b.score);
  for (const r of ranked) {
    const lesson = LESSONS.find((l) => l.category === r.category && !s.lessonProgress[l.id]?.completed);
    if (lesson) {
      return { ...r, lesson, reason: `Pelajari ${r.title} karena skor pemahaman masih ${r.score}%.` };
    }
  }
  const first = ranked[0];
  const lesson = LESSONS.find((l) => l.category === first.category) ?? LESSONS[0];
  return { ...first, lesson, reason: `Ulangi materi ${first.title} untuk memperkuat pemahaman.` };
}

export function computeAchievements(s: LearningSnapshot): Achievement[] {
  const completed = completedLessonIds(s).length;
  const scans = s.scans?.length ?? 0;
  const best = Math.max(0, ...s.quizAttempts.map((a) => a.score));
  const streak = currentStreak(s.streak);
  const categoriesTouched = new Set(s.quizAttempts.map((a) => a.category)).size;
  const judolDone = !!s.lessonProgress["l-judol-1"]?.completed && (bestQuizScore(s.quizAttempts, "judol") ?? 0) >= 60;
  return [
    { id: "first-scan", title: "Pemeriksa Pertama", description: "Melakukan pemeriksaan risiko pertama.", unlocked: scans >= 1 },
    { id: "learner", title: "Pembelajar Tekun", description: "Menyelesaikan 3 pelajaran.", unlocked: completed >= 3 },
    { id: "quiz-master", title: "Quiz Master", description: "Mendapat skor 100% pada sebuah quiz.", unlocked: best >= 100 },
    { id: "streak-7", title: "Konsisten 7 Hari", description: "Belajar 7 hari berturut-turut.", unlocked: streak >= 7 },
    { id: "explorer", title: "Penjelajah Topik", description: "Mengerjakan quiz di 3 topik berbeda.", unlocked: categoriesTouched >= 3 },
    { id: "judol-guard", title: "Penjaga Anti-Judol", description: "Menyelesaikan pelajaran dan quiz judi online.", unlocked: judolDone },
  ];
}
