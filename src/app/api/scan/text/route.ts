import { NextResponse } from "next/server";
import { apiError, logServerError } from "@/lib/api";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { textScanSchema } from "@/lib/validation/schemas";
import { getAIService } from "@/services/ai";

export async function POST(req: Request) {
  if (!rateLimit(clientKey(req, "scan-text"), 30)) return apiError("Terlalu banyak permintaan. Coba lagi sebentar.", 429);

  const body = await req.json().catch(() => null);
  const parsed = textScanSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Input tidak valid.");

  try {
    const result = await getAIService().analyzeText(parsed.data.text);
    return NextResponse.json({ result });
  } catch (err) {
    logServerError("scan.text", err);
    return apiError("Analisis gagal. Silakan periksa input dan coba lagi.", 500);
  }
}
