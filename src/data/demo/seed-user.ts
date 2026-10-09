import { dayKey } from "@/lib/utils/format";
import type {
  AccessibilityPreference,
  Activity,
  LessonProgress,
  Profile,
  QuizAttempt,
  RiskCategory,
  ScanRecord,
} from "@/types";

/**
 * Seed state for the demo student account. Timestamps are generated relative
 * to "now" so the demo always looks fresh (e.g. "2 jam lalu").
 */

/** Placement assessment results used before a learner has taken a quiz. */
export const BASELINE_ASSESSMENT: Record<RiskCategory, number> = {
  judol: 75,
  phishing: 70,
  deepfake: 58,
  scam: 60,
  cyberbullying: 67,
  misinformation: 83,
};

export const DEFAULT_ACCESSIBILITY: AccessibilityPreference = {
  fontSize: "normal",
  contrast: "standard",
  theme: "light",
  tts: true,
  reading: false,
  simplified: false,
  keyboard: false,
};

export const DEMO_ACCOUNTS = [
  {
    userId: "u-student",
    role: "STUDENT" as const,
    name: "Nadia Rahma",
    title: "Siswa",
    description: "Cek risiko, belajar, quiz, progress, dan AI Tutor.",
  },
  {
    userId: "u-teacher",
    role: "TEACHER" as const,
    name: "Budi Santoso, S.Pd.",
    title: "Guru",
    description: "Pantau perkembangan literasi digital kelas.",
  },
  {
    userId: "u-admin",
    role: "ADMIN" as const,
    name: "Admin Yayasan Nusantara",
    title: "Admin Institusi",
    description: "Ringkasan program, peserta, dan knowledge base.",
  },
];

const HOUR = 3600_000;
const DAY = 24 * HOUR;

export function createSeedLearningState(now: number = Date.now()) {
  const iso = (msAgo: number) => new Date(now - msAgo).toISOString();

  const profile: Profile = {
    name: "Nadia Rahma",
    level: "pemula",
    institution: "SMA Nusantara (Demo)",
    className: "XI IPA 2",
  };

  const lessonProgress: Record<string, LessonProgress> = {
    "l-phishing-1": { lessonId: "l-phishing-1", step: 4, totalSteps: 6, completed: false, updatedAt: iso(1 * DAY) },
    "l-phishing-2": { lessonId: "l-phishing-2", step: 6, totalSteps: 6, completed: true, updatedAt: iso(2 * DAY) },
    "l-deepfake-2": { lessonId: "l-deepfake-2", step: 6, totalSteps: 6, completed: true, updatedAt: iso(4 * DAY) },
    "l-scam-1": { lessonId: "l-scam-1", step: 6, totalSteps: 6, completed: true, updatedAt: iso(6 * DAY) },
  };

  const quizAttempts: QuizAttempt[] = [
    {
      id: "qa-seed-1",
      quizId: "quiz-phishing",
      category: "phishing",
      correct: 4,
      total: 5,
      score: 80,
      masteredTopics: ["Permintaan OTP", "Membaca URL", "Impersonation", "Urgensi"],
      reviewTopics: ["HTTPS"],
      completedAt: iso(1 * DAY + 3 * HOUR),
    },
    {
      id: "qa-seed-2",
      quizId: "quiz-scam",
      category: "scam",
      correct: 2,
      total: 5,
      score: 40,
      masteredTopics: ["Hadiah palsu", "Emosi"],
      reviewTopics: ["File APK", "Investasi bodong", "Cek rekening"],
      completedAt: iso(5 * DAY),
    },
  ];

  const scans: ScanRecord[] = [
    {
      id: "scan-seed-1",
      module: "ceklink",
      input: "http://bank-nusantara-login-security.demo-example.com/verifikasi?akun=blokir",
      riskLevel: "high",
      riskScore: 97,
      category: "phishing",
      createdAt: iso(2 * HOUR),
    },
  ];

  const activities: Activity[] = [
    {
      id: "act-seed-1",
      type: "scan",
      title: "CekLink",
      detail: "Risiko Tinggi — tautan menyerupai bank",
      riskLevel: "high",
      href: "/ceklink",
      createdAt: iso(2 * HOUR),
    },
    {
      id: "act-seed-2",
      type: "quiz",
      title: "Quiz Phishing",
      detail: "Skor 80%",
      href: "/quiz/quiz-phishing",
      createdAt: iso(1 * DAY + 3 * HOUR),
    },
    {
      id: "act-seed-3",
      type: "lesson",
      title: "Memeriksa Tautan Sebelum Mengklik",
      detail: "Pelajaran selesai",
      href: "/learning/memeriksa-tautan-mencurigakan",
      createdAt: iso(2 * DAY),
    },
    {
      id: "act-seed-4",
      type: "quiz",
      title: "Quiz Penipuan Online",
      detail: "Skor 40%",
      href: "/quiz/quiz-scam",
      createdAt: iso(5 * DAY),
    },
  ];

  const scoreHistory = [
    { date: dayKey(new Date(now - 28 * DAY)), score: 34 },
    { date: dayKey(new Date(now - 21 * DAY)), score: 41 },
    { date: dayKey(new Date(now - 14 * DAY)), score: 45 },
    { date: dayKey(new Date(now - 7 * DAY)), score: 49 },
  ];

  return {
    profile,
    lessonProgress,
    quizAttempts,
    scans,
    activities,
    scoreHistory,
    streak: { count: 5, lastActive: dayKey(new Date(now - DAY)) },
  };
}
