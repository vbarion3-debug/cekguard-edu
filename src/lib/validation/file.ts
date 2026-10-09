export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type FileValidation = { ok: true } | { ok: false; error: string };

export function validateImageMeta(file: { type: string; size: number }): FileValidation {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return { ok: false, error: "Format tidak didukung. Gunakan gambar JPG, PNG, atau WebP." };
  }
  if (file.size === 0) return { ok: false, error: "File kosong. Pilih gambar lain." };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: "Ukuran gambar maksimal 5 MB." };
  return { ok: true };
}

/** Verifies the file's magic bytes match the declared image type (server-side). */
export function sniffImageType(bytes: Uint8Array): (typeof ALLOWED_IMAGE_TYPES)[number] | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  const riff = String.fromCharCode(...bytes.slice(0, 4));
  const webp = String.fromCharCode(...bytes.slice(8, 12));
  if (riff === "RIFF" && webp === "WEBP") return "image/webp";
  return null;
}
