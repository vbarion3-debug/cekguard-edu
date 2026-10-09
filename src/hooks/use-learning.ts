"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  allMastery,
  averageQuizScore,
  completedLessonIds,
  currentStreak,
  digitalSafetyScore,
  inProgressLessons,
  recommendNext,
  weakestCategory,
  weeklyDelta,
} from "@/services/learning/progress";
import { useAppStore } from "@/store/app-store";
import type { LearningLevel } from "@/types";

/** Derived learning analytics shared by dashboard, progress, profile and tutor. */
export function useLearningStats() {
  const snapshot = useAppStore(
    useShallow((s) => ({
      lessonProgress: s.lessonProgress,
      quizAttempts: s.quizAttempts,
      scans: s.scans,
      streak: s.streak,
      scoreHistory: s.scoreHistory,
    })),
  );

  return useMemo(() => {
    const score = digitalSafetyScore(snapshot);
    return {
      snapshot,
      score,
      mastery: allMastery(snapshot),
      weakest: weakestCategory(snapshot),
      completedLessons: completedLessonIds(snapshot),
      inProgress: inProgressLessons(snapshot),
      quizzesCompleted: snapshot.quizAttempts.length,
      averageQuiz: averageQuizScore(snapshot.quizAttempts),
      streak: currentStreak(snapshot.streak),
      weeklyDelta: weeklyDelta(snapshot.scoreHistory, score),
      next: recommendNext(snapshot),
    };
  }, [snapshot]);
}

/** The literacy level used for explanations (simplified language forces "pemula"). */
export function useEffectiveLevel(): LearningLevel {
  const level = useAppStore((s) => s.profile.level);
  const simplified = useAppStore((s) => s.accessibility.simplified);
  return simplified ? "pemula" : level;
}
