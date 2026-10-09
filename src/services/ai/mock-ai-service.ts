import { getQuizByCategory } from "@/data/demo/quizzes";
import { RISK_META, levelFromScore } from "@/lib/constants/risk";
import { createId } from "@/lib/utils/id";
import { validateUrl } from "@/lib/validation/url";
import { tutorRespond } from "@/services/tutor/tutor-engine";
import type {
  AnalysisResult,
  DetectedDomain,
  LearningLevel,
  LeveledText,
  Quiz,
  Recommendation,
  RiskCategory,
  TutorContext,
  TutorReply,
} from "@/types";
import { analyzeImageBytes } from "./heuristics/image";
import { aggregateIndicators, classifyComment, threadRiskScore, toCommentAnalysis } from "./heuristics/judol";
import { analyzeLinkStructure } from "./heuristics/link";
import { analyzeTextContent } from "./heuristics/text";
import { SAFE_ACTIONS, buildRecommendation, templateExplanation } from "./templates";
import { AIUnsupportedError, type AIService, type ImageInput, type ThreadInput } from "./types";

const LEVELS: LearningLevel[] = ["pemula", "menengah", "lanjutan"];

/**
 * MockAIService — deterministic, explainable rule engines with realistic
 * output. Used for demos and as the fallback when no AI provider is set.
 */
export class MockAIService implements AIService {
  readonly name: string = "mock";

  protected async finalize(partial: Omit<AnalysisResult, "explanations" | "recommendation">): Promise<AnalysisResult> {
    const base = { ...partial, explanations: { pemula: "", menengah: "", lanjutan: "" } } as AnalysisResult;
    base.recommendation = await this.generateLearningRecommendation(base);
    const texts = await Promise.all(LEVELS.map((l) => this.generateExplanation(base, l)));
    base.explanations = Object.fromEntries(LEVELS.map((l, i) => [l, texts[i]])) as LeveledText;
    return base;
  }

  async analyzeCommentThread(thread: ThreadInput): Promise<AnalysisResult> {
    const comments = thread.comments.map((c) => ({ raw: c, analysis: toCommentAnalysis(c, classifyComment(c.text)) }));
    const analyses = comments.map((c) => c.analysis);
    const high = analyses.filter((c) => c.riskLevel === "high").length;
    const medium = analyses.filter((c) => c.riskLevel === "medium").length;
    const flagged = high + medium;

    const domainMap = new Map<string, DetectedDomain>();
    for (const { raw, analysis } of comments) {
      if (analysis.riskLevel === "safe") continue;
      for (const d of analysis.domains) {
        const entry = domainMap.get(d) ?? { domain: d, mentions: 0, riskLevel: "medium", activity: Array(7).fill(0) };
        entry.mentions += 1;
        entry.activity[Math.min(6, Math.max(0, raw.day))] += 1;
        domainMap.set(d, entry);
      }
    }
    const domains = [...domainMap.values()]
      .map((d) => ({ ...d, riskLevel: d.mentions >= 4 ? ("high" as const) : ("medium" as const) }))
      .sort((a, b) => b.mentions - a.mentions);

    const riskScore = threadRiskScore(analyses.length, high, medium, domains.length);
    const riskLevel = levelFromScore(riskScore);

    return this.finalize({
      id: createId("scan"),
      module: "cekjudol",
      inputType: "url",
      input: thread.url,
      category: "judol",
      riskScore,
      riskLevel,
      headline: flagged > 0 ? RISK_META[riskLevel].label : "Tidak ditemukan indikasi judol",
      summary:
        flagged > 0
          ? `${flagged} komentar terindikasi promosi judi online`
          : "Tidak ditemukan komentar yang terindikasi promosi judi online",
      indicators: aggregateIndicators(analyses),
      safeActions: SAFE_ACTIONS.judol,
      details: {
        kind: "judol",
        contentTitle: thread.title,
        platform: thread.platform,
        totalComments: analyses.length,
        flagged,
        highRisk: high,
        mediumRisk: medium,
        normal: analyses.length - flagged,
        comments: analyses,
        domains,
      },
      isDemo: thread.isDemoSource || this.name === "mock",
      provider: this.name,
      createdAt: new Date().toISOString(),
    });
  }

  async analyzeURL(rawUrl: string): Promise<AnalysisResult> {
    const v = validateUrl(rawUrl);
    if (!v.ok) throw new Error(v.error);
    const link = analyzeLinkStructure(v.url);
    const category: RiskCategory = link.knownJudolDomain ? "judol" : "phishing";
    const riskLevel = levelFromScore(link.score);
    return this.finalize({
      id: createId("scan"),
      module: "ceklink",
      inputType: "url",
      input: v.normalized,
      category,
      riskScore: link.score,
      riskLevel,
      headline: RISK_META[riskLevel].label,
      summary:
        link.indicators.length > 0
          ? `${link.indicators.length} indikator risiko ditemukan pada struktur URL`
          : "Tidak ditemukan indikator risiko yang kuat pada struktur URL",
      indicators: link.indicators,
      safeActions: SAFE_ACTIONS[category],
      details: {
        kind: "link",
        url: v.normalized,
        hostname: v.url.hostname,
        protocol: v.url.protocol.replace(":", ""),
        checks: link.checks,
        impersonatedBrand: link.impersonatedBrand,
      },
      isDemo: true,
      provider: this.name,
      createdAt: new Date().toISOString(),
    });
  }

  async analyzeText(input: string): Promise<AnalysisResult> {
    const t = analyzeTextContent(input);
    const riskLevel = levelFromScore(t.score);
    return this.finalize({
      id: createId("scan"),
      module: "cekteks",
      inputType: "text",
      input: input.slice(0, 280),
      category: t.category,
      riskScore: t.score,
      riskLevel,
      headline: RISK_META[riskLevel].label,
      summary:
        t.indicators.length > 0
          ? `${t.indicators.length} indikator risiko ditemukan pada teks`
          : "Tidak ditemukan indikator risiko yang kuat pada teks",
      indicators: t.indicators,
      safeActions: SAFE_ACTIONS[t.category],
      details: { kind: "text", excerpt: input.slice(0, 600), matches: t.matches },
      isDemo: true,
      provider: this.name,
      createdAt: new Date().toISOString(),
    });
  }

  async analyzeImage(file: ImageInput): Promise<AnalysisResult> {
    const isDemoSample = file.fileName.startsWith("contoh-demo");
    const s = analyzeImageBytes(file.bytes, file.fileName, isDemoSample);
    const riskLevel = s.confidence >= 70 ? "high" : s.confidence >= 45 ? "medium" : "low";
    const indicators = s.checks.filter((c) => c.flagged).map((c) => ({ id: c.id, label: c.label, description: c.detail }));
    return this.finalize({
      id: createId("scan"),
      module: "cekdeepfake",
      inputType: "image",
      input: file.fileName,
      category: "deepfake",
      riskScore: s.confidence,
      riskLevel,
      headline:
        riskLevel === "high"
          ? "Potensi Manipulasi Terdeteksi"
          : riskLevel === "medium"
            ? "Ada Indikasi, Perlu Verifikasi"
            : "Tidak Ditemukan Indikasi Kuat",
      summary:
        riskLevel === "low"
          ? "Tidak ditemukan indikasi manipulasi yang kuat. Tetap verifikasi sumber gambar."
          : `Tingkat keyakinan indikasi manipulasi ${s.confidence}% — perlu verifikasi lanjutan`,
      indicators,
      safeActions: SAFE_ACTIONS.deepfake,
      details: {
        kind: "deepfake",
        fileName: file.fileName,
        fileSize: file.bytes.length,
        mimeType: file.mimeType,
        width: file.width,
        height: file.height,
        confidence: s.confidence,
        hasExif: s.hasExif,
        checks: s.checks,
      },
      isDemo: true,
      provider: this.name,
      createdAt: new Date().toISOString(),
    });
  }

  async analyzeVideo(): Promise<AnalysisResult> {
    throw new AIUnsupportedError("Analisis video");
  }

  async generateExplanation(result: AnalysisResult, level: LearningLevel): Promise<string> {
    return templateExplanation(result, level);
  }

  async generateLearningRecommendation(result: AnalysisResult): Promise<Recommendation> {
    const top = result.indicators[0]?.label.toLowerCase();
    return buildRecommendation(
      result.category,
      top ? `Hasil analisis menemukan indikator "${top}". Materi ini menjelaskan cara mengenalinya.` : undefined,
    );
  }

  async generateQuiz(topic: RiskCategory): Promise<Quiz> {
    const quiz = getQuizByCategory(topic);
    if (!quiz) throw new Error("Quiz untuk topik ini belum tersedia.");
    return quiz;
  }

  async tutor(
    message: string,
    context: TutorContext,
  ): Promise<TutorReply> {
    return tutorRespond(message, context);
  }
}
