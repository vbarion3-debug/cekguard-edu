import "server-only";
import { logServerError } from "@/lib/api";
import { CATEGORY_TITLE, LEVEL_LABEL } from "@/lib/constants/categories";
import { detectTopic, tutorRespond } from "@/services/tutor/tutor-engine";
import type { AnalysisResult, LearningLevel, TutorContext, TutorReply } from "@/types";
import { MockAIService } from "./mock-ai-service";

/**
 * GeminiAIService — uses Google Gemini for natural-language generation
 * (explanations and tutoring) while detection stays on the deterministic,
 * explainable rule engines inherited from MockAIService.
 *
 * Configure via .env.local:
 *   AI_PROVIDER=gemini
 *   GEMINI_API_KEY=...        (server-side only, never exposed to the browser)
 *   GEMINI_MODEL=gemini-2.5-flash
 *
 * Any provider error falls back to the mock output so the demo never breaks.
 */
export class GeminiAIService extends MockAIService {
  readonly name = "gemini";

  constructor(
    private readonly apiKey: string,
    private readonly model: string = "gemini-2.5-flash",
  ) {
    super();
  }

  private async generate(system: string, prompt: string, maxTokens = 600): Promise<string> {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": this.apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: maxTokens },
        }),
        signal: AbortSignal.timeout(15_000),
      },
    );
    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
    const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
    if (!text) throw new Error("Gemini returned empty response");
    return text;
  }

  async generateExplanation(result: AnalysisResult, level: LearningLevel): Promise<string> {
    try {
      const system =
        "Kamu adalah pendidik keamanan digital untuk pelajar Indonesia. Jelaskan hasil analisis secara jujur: gunakan kata 'indikasi' atau 'terindikasi', jangan pernah menyatakan kepastian mutlak. Maksimal 3 kalimat, tanpa markdown.";
      const prompt = `Tingkat literasi pembaca: ${LEVEL_LABEL[level]}.
Kategori risiko: ${CATEGORY_TITLE[result.category]}.
Skor risiko: ${result.riskScore}/100 (${result.headline}).
Ringkasan: ${result.summary}.
Indikator: ${result.indicators.map((i) => i.label).join(", ") || "tidak ada"}.
Tulis penjelasan "Mengapa konten ini berisiko?" sesuai tingkat literasi tersebut.`;
      return await this.generate(system, prompt, 300);
    } catch (err) {
      logServerError("gemini.explanation", err);
      return super.generateExplanation(result, level);
    }
  }

  async tutor(
    message: string,
    context: TutorContext,
    history: { role: "user" | "tutor"; content: string }[] = [],
  ): Promise<TutorReply> {
    const grounded = tutorRespond(message, context);
    try {
      const level = context.simplified ? "pemula" : context.level;
      const system = `Kamu adalah AI Tutor CekGuard Edu. Hanya jawab topik keamanan digital (judi online, phishing, deepfake, penipuan, cyberbullying, misinformasi). Tolak dengan sopan topik lain.
Sesuaikan bahasa untuk tingkat ${LEVEL_LABEL[level]}${context.simplified ? " dengan kalimat sangat sederhana" : ""}.
Konteks pelajar: pelajaran selesai = ${context.completedLessons.length}; topik terlemah = ${
        context.weakestCategory ? `${CATEGORY_TITLE[context.weakestCategory]} (${context.weakestScore}%)` : "-"
      }; topik saat ini = ${context.currentTopic ? CATEGORY_TITLE[context.currentTopic] : "-"}${
        context.lastScanSummary ? `; hasil scan terakhir = ${context.lastScanSummary}` : ""
      }.
Gunakan referensi berikut sebagai dasar jawaban:
${grounded.content}
Jawab dalam bahasa Indonesia, maksimal 180 kata, boleh memakai **tebal** dan daftar "• ". Jangan klaim kepastian mutlak.`;
      const convo = history
        .slice(-6)
        .map((h) => `${h.role === "user" ? "Pelajar" : "Tutor"}: ${h.content}`)
        .join("\n");
      const content = await this.generate(system, `${convo}\nPelajar: ${message}`, 700);
      return { ...grounded, content, topic: grounded.topic ?? detectTopic(message), provider: this.name };
    } catch (err) {
      logServerError("gemini.tutor", err);
      return grounded;
    }
  }
}
