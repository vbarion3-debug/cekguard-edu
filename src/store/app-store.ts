"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_ACCESSIBILITY, createSeedLearningState } from "@/data/demo/seed-user";
import { getLessonById } from "@/data/demo/lessons";
import { MODULE_HREF, MODULE_NAME } from "@/lib/constants/modules";
import { RISK_META } from "@/lib/constants/risk";
import { dayKey, daysBetween } from "@/lib/utils/format";
import { createId } from "@/lib/utils/id";
import { digitalSafetyScore } from "@/services/learning/progress";
import type {
  AccessibilityPreference,
  Activity,
  AnalysisResult,
  FeedbackItem,
  KnowledgeEntry,
  LearningLevel,
  LessonProgress,
  Profile,
  QuizAttempt,
  ScanModule,
  ScanRecord,
  Session,
  TutorMessage,
} from "@/types";

/**
 * Client-side application state, persisted to localStorage so the demo
 * behaves like a real app (progress survives reloads). In production this
 * would sync with the API / PostgreSQL via the same actions.
 */

interface AppState {
  session: Session | null;
  profile: Profile;
  accessibility: AccessibilityPreference;
  lessonProgress: Record<string, LessonProgress>;
  quizAttempts: QuizAttempt[];
  scans: ScanRecord[];
  activities: Activity[];
  scoreHistory: { date: string; score: number }[];
  streak: { count: number; lastActive: string };
  lastResults: Partial<Record<ScanModule, AnalysisResult>>;
  feedback: FeedbackItem[];
  knowledgeAdditions: KnowledgeEntry[];
  tutorMessages: TutorMessage[];

  login: (session: Session) => void;
  logout: () => void;
  setProfile: (patch: Partial<Profile>) => void;
  setLevel: (level: LearningLevel) => void;
  setAccessibility: (patch: Partial<AccessibilityPreference>) => void;
  resetAccessibility: () => void;
  updateLessonStep: (lessonId: string, step: number, totalSteps: number) => void;
  completeLesson: (lessonId: string, totalSteps: number) => void;
  recordQuizAttempt: (attempt: Omit<QuizAttempt, "id" | "completedAt">, title: string) => QuizAttempt;
  recordScan: (result: AnalysisResult) => void;
  clearResult: (module: ScanModule) => void;
  addFeedback: (item: Omit<FeedbackItem, "id" | "createdAt" | "status">) => void;
  updateFeedbackStatus: (id: string, status: FeedbackItem["status"]) => void;
  addKnowledge: (entry: Omit<KnowledgeEntry, "id" | "updatedAt" | "version">) => void;
  addTutorMessage: (m: Omit<TutorMessage, "id" | "createdAt">) => void;
  clearTutor: () => void;
  resetDemo: () => void;
}

function freshLearningState() {
  return { ...createSeedLearningState(), lastResults: {}, feedback: [], knowledgeAdditions: [], tutorMessages: [] };
}

function bumpStreak(streak: { count: number; lastActive: string }) {
  const today = dayKey();
  if (streak.lastActive === today) return streak;
  const gap = daysBetween(streak.lastActive, today);
  return { count: gap === 1 ? streak.count + 1 : 1, lastActive: today };
}

function withActivity(list: Activity[], a: Omit<Activity, "id" | "createdAt">): Activity[] {
  return [{ ...a, id: createId("act"), createdAt: new Date().toISOString() }, ...list].slice(0, 30);
}

/** Records today's safety score after any learning event. */
function snapshotScore(state: Pick<AppState, "lessonProgress" | "quizAttempts" | "scoreHistory">) {
  const score = digitalSafetyScore(state);
  const today = dayKey();
  const rest = state.scoreHistory.filter((h) => h.date !== today);
  return [...rest, { date: today, score }].slice(-30);
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      session: null,
      accessibility: DEFAULT_ACCESSIBILITY,
      ...freshLearningState(),

      login: (session) => set({ session }),
      logout: () => set({ session: null }),

      setProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      setLevel: (level) => set((s) => ({ profile: { ...s.profile, level } })),

      setAccessibility: (patch) => set((s) => ({ accessibility: { ...s.accessibility, ...patch } })),
      resetAccessibility: () => set({ accessibility: DEFAULT_ACCESSIBILITY }),

      updateLessonStep: (lessonId, step, totalSteps) =>
        set((s) => {
          const prev = s.lessonProgress[lessonId];
          if (prev?.completed || (prev && prev.step >= step)) return s;
          return {
            lessonProgress: {
              ...s.lessonProgress,
              [lessonId]: { lessonId, step, totalSteps, completed: false, updatedAt: new Date().toISOString() },
            },
          };
        }),

      completeLesson: (lessonId, totalSteps) =>
        set((s) => {
          const already = s.lessonProgress[lessonId]?.completed;
          const lessonProgress = {
            ...s.lessonProgress,
            [lessonId]: { lessonId, step: totalSteps, totalSteps, completed: true, updatedAt: new Date().toISOString() },
          };
          const lesson = getLessonById(lessonId);
          return {
            lessonProgress,
            streak: bumpStreak(s.streak),
            scoreHistory: snapshotScore({ ...s, lessonProgress }),
            activities: already
              ? s.activities
              : withActivity(s.activities, {
                  type: "lesson",
                  title: lesson?.title ?? "Pelajaran",
                  detail: "Pelajaran selesai",
                  href: lesson ? `/learning/${lesson.slug}` : "/learning",
                }),
          };
        }),

      recordQuizAttempt: (attempt, title) => {
        const full: QuizAttempt = { ...attempt, id: createId("qa"), completedAt: new Date().toISOString() };
        set((s) => {
          const quizAttempts = [full, ...s.quizAttempts];
          return {
            quizAttempts,
            streak: bumpStreak(s.streak),
            scoreHistory: snapshotScore({ ...s, quizAttempts }),
            activities: withActivity(s.activities, {
              type: "quiz",
              title,
              detail: `Skor ${full.score}%`,
              href: `/quiz/${full.quizId}`,
            }),
          };
        });
        return full;
      },

      recordScan: (result) =>
        set((s) => ({
          lastResults: { ...s.lastResults, [result.module]: result },
          scans: [
            {
              id: result.id,
              module: result.module,
              input: result.input,
              riskLevel: result.riskLevel,
              riskScore: result.riskScore,
              category: result.category,
              createdAt: result.createdAt,
            },
            ...s.scans,
          ].slice(0, 50),
          streak: bumpStreak(s.streak),
          activities: withActivity(s.activities, {
            type: "scan",
            title: MODULE_NAME[result.module],
            detail: `${RISK_META[result.riskLevel].label} — ${result.summary}`,
            riskLevel: result.riskLevel,
            href: MODULE_HREF[result.module],
          }),
        })),

      clearResult: (module) =>
        set((s) => {
          const next = { ...s.lastResults };
          delete next[module];
          return { lastResults: next };
        }),

      addFeedback: (item) =>
        set((s) => ({
          feedback: [{ ...item, id: createId("fb"), createdAt: new Date().toISOString(), status: "baru" as const }, ...s.feedback],
        })),
      updateFeedbackStatus: (id, status) =>
        set((s) => ({ feedback: s.feedback.map((f) => (f.id === id ? { ...f, status } : f)) })),

      addKnowledge: (entry) =>
        set((s) => ({
          knowledgeAdditions: [
            { ...entry, id: createId("kb"), version: 1, updatedAt: new Date().toISOString() },
            ...s.knowledgeAdditions,
          ],
        })),

      addTutorMessage: (m) =>
        set((s) => ({
          tutorMessages: [...s.tutorMessages, { ...m, id: createId("msg"), createdAt: new Date().toISOString() }].slice(-40),
        })),
      clearTutor: () => set({ tutorMessages: [] }),

      resetDemo: () => {
        const { session, accessibility } = get();
        set({ ...freshLearningState(), session, accessibility });
      },
    }),
    {
      name: "cekguard-edu-state-v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
