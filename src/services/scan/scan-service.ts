import "server-only";
import { validateContentUrl } from "@/lib/validation/url";
import { getAIService } from "@/services/ai";
import { getCommentSource } from "@/services/database/repository";
import type { AnalysisResult } from "@/types";

/**
 * CekJudol pipeline:
 * Validate URL → Fetch (demo) content → Classify comments → Risk analysis
 * → Explanation → Learning recommendation.
 */
export async function runJudolScan(rawUrl: string): Promise<AnalysisResult> {
  const v = validateContentUrl(rawUrl);
  if (!v.ok) throw new ScanInputError(v.error);

  const source = getCommentSource();
  const content = await source.fetchComments(v.url, v.platform ?? "Platform");
  return getAIService().analyzeCommentThread({
    url: v.normalized,
    platform: content.platform,
    title: content.title,
    comments: content.comments,
    isDemoSource: content.isDemo,
  });
}

export class ScanInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScanInputError";
  }
}
