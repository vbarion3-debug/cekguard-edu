import { NextResponse } from "next/server";
import { apiError, logServerError } from "@/lib/api";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { MAX_IMAGE_BYTES, sniffImageType, validateImageMeta } from "@/lib/validation/file";
import { getAIService } from "@/services/ai";

export async function POST(req: Request) {
  if (!rateLimit(clientKey(req, "scan-image"), 15)) return apiError("Terlalu banyak permintaan. Coba lagi sebentar.", 429);

  const length = Number(req.headers.get("content-length") ?? 0);
  if (length > MAX_IMAGE_BYTES + 64 * 1024) return apiError("Ukuran gambar maksimal 5 MB.", 413);

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return apiError("Pilih gambar terlebih dahulu.");

  const meta = validateImageMeta(file);
  if (!meta.ok) return apiError(meta.error);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const sniffed = sniffImageType(bytes);
  if (!sniffed || sniffed !== file.type) return apiError("Isi file tidak sesuai dengan format gambar yang didukung.");

  const width = Number(form?.get("width")) || undefined;
  const height = Number(form?.get("height")) || undefined;
  const fileName = file.name.replace(/[^\w.\- ]+/g, "").slice(0, 120) || "gambar";

  try {
    const result = await getAIService().analyzeImage({ bytes, fileName, mimeType: sniffed, width, height });
    return NextResponse.json({ result });
  } catch (err) {
    logServerError("scan.image", err);
    return apiError("Analisis gagal. Silakan periksa input dan coba lagi.", 500);
  }
}
