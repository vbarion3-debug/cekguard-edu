import type {
  AnalysisResult,
  LearningLevel,
  Quiz,
  Recommendation,
  RiskCategory,
  TutorContext,
  TutorReply,
} from "@/types";

export interface ImageInput {
  bytes: Uint8Array;
  fileName: string;
  mimeType: string;
  width?: number;
  height?: number;
}

export interface CommentInput {
  id: string;
  author: string;
  text: string;
  day: number;
}

export interface ThreadInput {
  url: string;
  platform: string;
  title: string;
  comments: CommentInput[];
  isDemoSource: boolean;
}

/**
 * Provider-agnostic AI contract. Every provider (mock, Gemini, …) implements
 * the same interface, selected with the AI_PROVIDER environment variable.
 */
export interface AIService {
  readonly name: string;
  analyzeText(input: string): Promise<AnalysisResult>;
  analyzeURL(url: string): Promise<AnalysisResult>;
  analyzeCommentThread(thread: ThreadInput): Promise<AnalysisResult>;
  analyzeImage(file: ImageInput): Promise<AnalysisResult>;
  analyzeVideo(file: ImageInput): Promise<AnalysisResult>;
  generateExplanation(result: AnalysisResult, level: LearningLevel): Promise<string>;
  generateLearningRecommendation(result: AnalysisResult): Promise<Recommendation>;
  generateQuiz(topic: RiskCategory, level?: LearningLevel): Promise<Quiz>;
  tutor(message: string, context: TutorContext, history: { role: "user" | "tutor"; content: string }[]): Promise<TutorReply>;
}

export class AIUnsupportedError extends Error {
  constructor(feature: string) {
    super(`${feature} belum tersedia pada prototipe ini.`);
    this.name = "AIUnsupportedError";
  }
}
