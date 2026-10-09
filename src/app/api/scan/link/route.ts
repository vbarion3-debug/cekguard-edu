import { NextResponse } from "next/server";
import { apiError, logServerError } from "@/lib/api";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { urlScanSchema } from "@/lib/validation/schemas";
import { validateUrl } from "@/lib/validation/url";
import { getAIService } from "@/services/ai";

export async function POST(req: Request) {
  if (!rateLimit(clientKey(req, "scan-link"), 30)) return apiError("Terlalu banyak permintaan. Coba lagi sebentar.", 429);

  const body = await req.json().catch(() => null);
  const parsed = urlScanSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Input tidak valid.");

  const v = validateUrl(parsed.data.url);
  if (!v.ok) return apiError(v.error);

  try {
    // Static analysis only: the URL is never fetched.
    const result = await getAIService().analyzeURL(v.normalized);
    return NextResponse.json({ result });
  } catch (err) {
    logServerError("scan.link", err);
    return apiError("Analisis gagal. Silakan periksa input dan coba lagi.", 500);
  }
}
