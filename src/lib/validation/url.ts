/**
 * URL validation helpers.
 *
 * CekGuard Edu never fetches arbitrary user-supplied URLs. Content URLs for
 * CekJudol must belong to an allow-listed platform, and CekLink only performs
 * static (structural) analysis of the URL string.
 */

export const MAX_URL_LENGTH = 2048;

export const SUPPORTED_CONTENT_PLATFORMS: { host: string; name: string }[] = [
  { host: "youtube.com", name: "YouTube" },
  { host: "youtu.be", name: "YouTube" },
  { host: "tiktok.com", name: "TikTok" },
  { host: "instagram.com", name: "Instagram" },
  { host: "facebook.com", name: "Facebook" },
  { host: "x.com", name: "X" },
  { host: "twitter.com", name: "X" },
];

export type UrlValidation =
  | { ok: true; url: URL; normalized: string }
  | { ok: false; error: string };

const PRIVATE_HOST =
  /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.0\.0\.0|\[?::1\]?$|172\.(1[6-9]|2\d|3[01])\.)/i;

export function normalizeUrlInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  return /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function validateUrl(raw: string): UrlValidation {
  const input = normalizeUrlInput(raw);
  if (!input) return { ok: false, error: "URL tidak boleh kosong." };
  if (input.length > MAX_URL_LENGTH) return { ok: false, error: "URL terlalu panjang (maksimal 2048 karakter)." };
  if (/\s/.test(input)) return { ok: false, error: "URL tidak boleh mengandung spasi." };

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return { ok: false, error: "Format URL tidak valid. Contoh: https://contoh.com/halaman" };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, error: "Hanya URL dengan http:// atau https:// yang dapat diperiksa." };
  }
  if (!url.hostname || (!url.hostname.includes(".") && !url.hostname.startsWith("["))) {
    return { ok: false, error: "Nama domain tidak valid." };
  }
  if (PRIVATE_HOST.test(url.hostname)) {
    return { ok: false, error: "Alamat jaringan lokal/privat tidak dapat diperiksa." };
  }
  return { ok: true, url, normalized: url.toString() };
}

export function matchContentPlatform(url: URL): { host: string; name: string } | undefined {
  const host = url.hostname.toLowerCase().replace(/^www\.|^m\./, "");
  return SUPPORTED_CONTENT_PLATFORMS.find((p) => host === p.host || host.endsWith(`.${p.host}`));
}

export function validateContentUrl(raw: string): UrlValidation & { platform?: string } {
  const base = validateUrl(raw);
  if (!base.ok) return base;
  const platform = matchContentPlatform(base.url);
  if (!platform) {
    return {
      ok: false,
      error:
        "CekJudol saat ini mendukung tautan konten dari YouTube, TikTok, Instagram, Facebook, dan X. Untuk memeriksa tautan lain, gunakan CekLink.",
    };
  }
  return { ...base, platform: platform.name };
}
