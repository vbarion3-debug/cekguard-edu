/**
 * Domain types for CekGuard Edu.
 * These mirror the PostgreSQL schema in `database/schema.sql` so the demo
 * data layer and a future production data layer share one contract.
 */

export type Role = "STUDENT" | "TEACHER" | "ADMIN";

export type LearningLevel = "pemula" | "menengah" | "lanjutan";

export type RiskLevel = "high" | "medium" | "low" | "safe";

export type RiskCategory =
  | "judol"
  | "phishing"
  | "deepfake"
  | "scam"
  | "cyberbullying"
  | "misinformation";

export type ScanModule = "cekjudol" | "ceklink" | "cekdeepfake" | "cekteks";

export type InputType = "url" | "text" | "image" | "video" | "audio";

export type LeveledText = Record<LearningLevel, string>;

/* ------------------------------------------------------------------ */
/* Analysis                                                            */
/* ------------------------------------------------------------------ */

export interface RiskIndicator {
  id: string;
  label: string;
  description: string;
  /** How many times the indicator was observed (optional). */
  count?: number;
}

export interface SafeAction {
  id: string;
  title: string;
  description: string;
}

export interface Recommendation {
  lessonSlug: string;
  lessonTitle: string;
  quizId: string;
  reason: string;
  prompt: string;
}

export interface CommentAnalysis {
  id: string;
  author: string;
  text: string;
  riskLevel: RiskLevel;
  label: string;
  matchedPatterns: string[];
  domains: string[];
  confidence: number;
}

export interface DetectedDomain {
  domain: string;
  mentions: number;
  riskLevel: RiskLevel;
  /** Mentions per time bucket (oldest → newest) for the activity chart. */
  activity: number[];
}

export interface JudolDetails {
  kind: "judol";
  contentTitle: string;
  platform: string;
  totalComments: number;
  flagged: number;
  highRisk: number;
  mediumRisk: number;
  normal: number;
  comments: CommentAnalysis[];
  domains: DetectedDomain[];
}

export interface LinkCheck {
  id: string;
  label: string;
  flagged: boolean;
  detail: string;
}

export interface LinkDetails {
  kind: "link";
  url: string;
  hostname: string;
  protocol: string;
  checks: LinkCheck[];
  impersonatedBrand?: string;
}

export interface DeepfakeDetails {
  kind: "deepfake";
  fileName: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  confidence: number;
  hasExif: boolean;
  checks: LinkCheck[];
}

export interface TextDetails {
  kind: "text";
  excerpt: string;
  matches: { phrase: string; indicator: string }[];
}

export type AnalysisDetails = JudolDetails | LinkDetails | DeepfakeDetails | TextDetails;

export interface AnalysisResult {
  id: string;
  module: ScanModule;
  inputType: InputType;
  input: string;
  category: RiskCategory;
  riskScore: number;
  riskLevel: RiskLevel;
  headline: string;
  summary: string;
  indicators: RiskIndicator[];
  explanations: LeveledText;
  safeActions: SafeAction[];
  recommendation: Recommendation;
  details: AnalysisDetails;
  /** True when the result comes from demo data / mock heuristics. */
  isDemo: boolean;
  provider: string;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Learning                                                            */
/* ------------------------------------------------------------------ */

export interface HighlightSegment {
  text: string;
  /** When present the segment is a clickable "red flag". */
  flag?: string;
}

export interface MiniQuestion {
  prompt: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
}

export type LessonStep =
  | { type: "concept"; title: string; body: LeveledText; keyPoints: string[] }
  | {
      type: "example";
      title: string;
      intro: string;
      source: string;
      segments: HighlightSegment[];
      altText: string;
    }
  | { type: "danger"; title: string; points: { title: string; body: string }[] }
  | { type: "recognize"; title: string; indicators: { label: string; hint: string }[] }
  | { type: "action"; title: string; steps: { title: string; body: string }[] }
  | { type: "quiz"; title: string; questions: MiniQuestion[] };

export interface Lesson {
  id: string;
  slug: string;
  category: RiskCategory;
  title: string;
  level: LearningLevel;
  durationMin: number;
  description: string;
  objectives: string[];
  quizId: string;
  steps: LessonStep[];
}

export interface LearningModule {
  id: RiskCategory;
  title: string;
  description: string;
}

export type QuestionType = "multiple" | "truefalse" | "scenario";

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  scenario?: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
  /** Sub-topic used for mastered / needs-review breakdown. */
  topic: string;
}

export interface Quiz {
  id: string;
  category: RiskCategory;
  title: string;
  description: string;
  questions: Question[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  category: RiskCategory;
  correct: number;
  total: number;
  score: number;
  masteredTopics: string[];
  reviewTopics: string[];
  completedAt: string;
}

export interface LessonProgress {
  lessonId: string;
  step: number;
  totalSteps: number;
  completed: boolean;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/* Knowledge base & feedback (sustainability loop)                     */
/* ------------------------------------------------------------------ */

export interface KnowledgeEntry {
  id: string;
  riskType: RiskCategory;
  indicator: string;
  pattern: string;
  example: string;
  action: string;
  lessonSlug: string;
  version: number;
  source: "curated" | "community" | "scan";
  updatedAt: string;
}

export interface FeedbackItem {
  id: string;
  kind: "accurate" | "false-positive" | "false-negative" | "new-pattern";
  module: ScanModule | "community";
  category: RiskCategory;
  note: string;
  status: "baru" | "ditinjau" | "ditambahkan";
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* User, activity & accessibility                                      */
/* ------------------------------------------------------------------ */

export interface Session {
  userId: string;
  role: Role;
  name: string;
}

export interface Profile {
  name: string;
  level: LearningLevel;
  institution: string;
  className: string;
}

export type FontSizePref = "normal" | "large" | "xl";

export interface AccessibilityPreference {
  fontSize: FontSizePref;
  contrast: "standard" | "high";
  theme: "light" | "dark";
  tts: boolean;
  reading: boolean;
  simplified: boolean;
  keyboard: boolean;
}

export type ActivityType = "scan" | "lesson" | "quiz";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  detail: string;
  riskLevel?: RiskLevel;
  href?: string;
  createdAt: string;
}

export interface ScanRecord {
  id: string;
  module: ScanModule;
  input: string;
  riskLevel: RiskLevel;
  riskScore: number;
  category: RiskCategory;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export interface TutorMessage {
  id: string;
  role: "user" | "tutor";
  content: string;
  recommendation?: { lessonSlug: string; lessonTitle: string };
  followUps?: string[];
  createdAt: string;
}

export interface TutorContext {
  level: LearningLevel;
  simplified: boolean;
  completedLessons: string[];
  weakestCategory?: RiskCategory;
  weakestScore?: number;
  currentTopic?: RiskCategory;
  lastScanSummary?: string;
}

export interface TutorReply {
  content: string;
  topic?: RiskCategory;
  recommendation?: { lessonSlug: string; lessonTitle: string };
  followUps: string[];
  provider: string;
}
