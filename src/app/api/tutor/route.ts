import { NextResponse } from "next/server";
import { apiError, logServerError } from "@/lib/api";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { tutorSchema } from "@/lib/validation/schemas";
import { getAIService } from "@/services/ai";

export async function POST(req: Request) {
  if (!rateLimit(clientKey(req, "tutor"), 30)) return apiError("Terlalu banyak pertanyaan. Coba lagi sebentar.", 429);

  const body = await req.json().catch(() => null);
  const parsed = tutorSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Input tidak valid.");

  try {
    const { message, context, history } = parsed.data;
    const reply = await getAIService().tutor(message, context, history);
    return NextResponse.json({ reply });
  } catch (err) {
    logServerError("tutor", err);
    return apiError("AI Tutor sedang tidak dapat menjawab. Coba lagi.", 500);
  }
}
