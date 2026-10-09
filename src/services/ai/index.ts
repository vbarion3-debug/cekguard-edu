import "server-only";
import { GeminiAIService } from "./gemini-ai-service";
import { MockAIService } from "./mock-ai-service";
import type { AIService } from "./types";

let instance: AIService | null = null;

/**
 * Returns the configured AI provider (server-side only).
 * AI_PROVIDER=mock (default) | gemini
 */
export function getAIService(): AIService {
  if (instance) return instance;
  const provider = (process.env.AI_PROVIDER ?? "mock").toLowerCase();
  if (provider === "gemini" && process.env.GEMINI_API_KEY) {
    instance = new GeminiAIService(process.env.GEMINI_API_KEY, process.env.GEMINI_MODEL || undefined);
  } else {
    instance = new MockAIService();
  }
  return instance;
}

export type { AIService } from "./types";
