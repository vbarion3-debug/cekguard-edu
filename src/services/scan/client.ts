import type { AnalysisResult, TutorContext, TutorReply } from "@/types";

/** Browser-side API client. No secrets live here — all AI calls go through API routes. */

async function post<T>(path: string, body: BodyInit, json = true): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      body,
      headers: json ? { "Content-Type": "application/json" } : undefined,
    });
  } catch {
    throw new Error("Tidak dapat terhubung ke server. Periksa koneksi internet kamu.");
  }
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Analisis gagal. Silakan periksa input dan coba lagi.");
  return data;
}

export async function scanJudol(url: string): Promise<AnalysisResult> {
  return (await post<{ result: AnalysisResult }>("/api/scan/judol", JSON.stringify({ url }))).result;
}

export async function scanLink(url: string): Promise<AnalysisResult> {
  return (await post<{ result: AnalysisResult }>("/api/scan/link", JSON.stringify({ url }))).result;
}

export async function scanText(text: string): Promise<AnalysisResult> {
  return (await post<{ result: AnalysisResult }>("/api/scan/text", JSON.stringify({ text }))).result;
}

export async function scanImage(file: File, dims?: { width: number; height: number }): Promise<AnalysisResult> {
  const form = new FormData();
  form.append("file", file);
  if (dims) {
    form.append("width", String(dims.width));
    form.append("height", String(dims.height));
  }
  return (await post<{ result: AnalysisResult }>("/api/scan/image", form, false)).result;
}

export async function askTutor(
  message: string,
  context: TutorContext,
  history: { role: "user" | "tutor"; content: string }[],
): Promise<TutorReply> {
  return (await post<{ reply: TutorReply }>("/api/tutor", JSON.stringify({ message, context, history }))).reply;
}

/** Ensures loading animations are visible long enough to be understood. */
export async function withMinimumDuration<T>(promise: Promise<T>, ms: number): Promise<T> {
  const [result] = await Promise.all([promise, new Promise((r) => setTimeout(r, ms))]);
  return result;
}
