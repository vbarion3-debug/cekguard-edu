import { NextResponse } from "next/server";
import { apiError, logServerError } from "@/lib/api";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { urlScanSchema } from "@/lib/validation/schemas";
import { ScanInputError, runJudolScan } from "@/services/scan/scan-service";

export async function POST(req: Request) {
  if (!rateLimit(clientKey(req, "scan-judol"), 20)) return apiError("Terlalu banyak permintaan. Coba lagi sebentar.", 429);

  const body = await req.json().catch(() => null);
  const parsed = urlScanSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Input tidak valid.");

  try {
    const result = await runJudolScan(parsed.data.url);
    return NextResponse.json({ result });
  } catch (err) {
    if (err instanceof ScanInputError) return apiError(err.message);
    logServerError("scan.judol", err);
    return apiError("Analisis gagal. Silakan periksa input dan coba lagi.", 500);
  }
}
