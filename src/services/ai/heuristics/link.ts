import { SUSPICIOUS_DOMAINS } from "@/data/demo/comments";
import type { LinkCheck, RiskIndicator } from "@/types";

/**
 * Static (structural) URL analysis. Nothing is fetched — the URL string itself
 * is inspected for patterns commonly used in phishing.
 */

const BRANDS: { token: string; name: string; official: string[] }[] = [
  { token: "bank-nusantara", name: "Bank Nusantara (contoh)", official: ["banknusantara.co.id"] },
  { token: "bca", name: "BCA", official: ["bca.co.id", "klikbca.com"] },
  { token: "bri", name: "BRI", official: ["bri.co.id"] },
  { token: "bni", name: "BNI", official: ["bni.co.id"] },
  { token: "mandiri", name: "Bank Mandiri", official: ["bankmandiri.co.id"] },
  { token: "paypal", name: "PayPal", official: ["paypal.com"] },
  { token: "google", name: "Google", official: ["google.com", "google.co.id"] },
  { token: "instagram", name: "Instagram", official: ["instagram.com"] },
  { token: "whatsapp", name: "WhatsApp", official: ["whatsapp.com"] },
  { token: "shopee", name: "Shopee", official: ["shopee.co.id"] },
  { token: "tokopedia", name: "Tokopedia", official: ["tokopedia.com"] },
  { token: "dana", name: "DANA", official: ["dana.id"] },
  { token: "gopay", name: "GoPay", official: ["gopay.co.id"] },
];

const SENSITIVE = /(login|log-in|signin|sign-in|verif|secure|security|update|akun|account|otp|password|sandi|konfirmasi|validasi)/i;
const URGENCY = /(blokir|suspend|segera|urgent|darurat|expired|kedaluwarsa|hadiah|gratis|menang|undian|terakhir)/i;
const SHORTENERS = ["bit.ly", "s.id", "tinyurl.com", "cutt.ly", "t.co", "rebrand.ly", "shorturl.at"];
const RISKY_TLDS = ["xyz", "top", "click", "online", "site", "icu", "buzz", "example", "test", "invalid"];

export interface LinkAnalysis {
  checks: LinkCheck[];
  indicators: RiskIndicator[];
  score: number;
  impersonatedBrand?: string;
  knownJudolDomain: boolean;
}

function registrableDomain(host: string): string {
  const parts = host.split(".");
  const sld = parts.slice(-2).join(".");
  // Handle ccSLDs such as co.id / ac.id / go.id
  if (/^(co|ac|go|or|sch|web|my)\.[a-z]{2}$/.test(sld) && parts.length >= 3) return parts.slice(-3).join(".");
  return sld;
}

export function analyzeLinkStructure(url: URL): LinkAnalysis {
  const host = url.hostname.toLowerCase();
  const full = url.toString().toLowerCase();
  const pathAndQuery = `${url.pathname}${url.search}`.toLowerCase();
  const labels = host.split(".");
  const tld = labels[labels.length - 1];
  const regDomain = registrableDomain(host);

  const brand = BRANDS.find(
    (b) => host.includes(b.token) && !b.official.some((o) => host === o || host.endsWith(`.${o}`)),
  );
  const lookalike = /[a-z][0-9][a-z]|0(?=[a-z])|rn(?=[a-z])/.test(labels.slice(0, -1).join(".")) && !!brand;
  const knownJudolDomain = SUSPICIOUS_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
  const hyphens = (host.match(/-/g) ?? []).length;
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);

  const checks: LinkCheck[] = [
    {
      id: "impersonation",
      label: "Menyerupai domain layanan resmi",
      flagged: !!brand,
      detail: brand
        ? `Domain memuat nama "${brand.name}", tetapi bukan domain resmi (${brand.official[0]}).`
        : "Tidak ditemukan nama layanan populer yang ditiru.",
    },
    {
      id: "sensitive-keyword",
      label: 'Menggunakan kata sensitif seperti "login" atau "verifikasi"',
      flagged: SENSITIVE.test(full),
      detail: SENSITIVE.test(full)
        ? `Ditemukan kata "${full.match(SENSITIVE)?.[0]}" yang sering dipakai untuk memancing pengisian data akun.`
        : "Tidak ada kata yang meminta login atau verifikasi data.",
    },
    {
      id: "urgency",
      label: "Mengandung kata desakan atau iming-iming",
      flagged: URGENCY.test(pathAndQuery) || URGENCY.test(host),
      detail:
        URGENCY.test(pathAndQuery) || URGENCY.test(host)
          ? `Ditemukan kata "${(pathAndQuery.match(URGENCY) ?? host.match(URGENCY))?.[0]}" yang menciptakan rasa panik atau tergesa-gesa.`
          : "Tidak ditemukan kata desakan pada alamat.",
    },
    {
      id: "structure",
      label: "Struktur domain mencurigakan",
      flagged: labels.length > 3 || hyphens >= 2 || host.length > 30 || isIp || host.includes("xn--") || lookalike,
      detail: isIp
        ? "Alamat menggunakan IP langsung, bukan nama domain."
        : host.includes("xn--")
          ? "Domain menggunakan karakter khusus (punycode) yang dapat meniru huruf biasa."
          : labels.length > 3 || hyphens >= 2 || host.length > 30
            ? `Domain asli adalah "${regDomain}". Bagian di depannya hanya subdomain yang dibuat agar terlihat resmi.`
            : "Struktur domain terlihat wajar.",
    },
    {
      id: "https",
      label: "Tidak menggunakan koneksi aman (HTTPS)",
      flagged: url.protocol !== "https:",
      detail:
        url.protocol !== "https:"
          ? "Data yang dikirim ke situs ini tidak terenkripsi."
          : "Menggunakan HTTPS. Catatan: situs phishing juga bisa memakai HTTPS, jadi ini bukan jaminan aman.",
    },
    {
      id: "redirect",
      label: "Indikasi pengalihan (redirect) tersembunyi",
      flagged: SHORTENERS.includes(host) || /[?&](url|redirect|next|goto)=https?/i.test(url.search) || url.username !== "",
      detail: SHORTENERS.includes(host)
        ? "Tautan pemendek menyembunyikan alamat tujuan sebenarnya."
        : url.username !== ""
          ? 'Ada karakter "@" di URL yang dapat menyamarkan alamat tujuan sebenarnya.'
          : /[?&](url|redirect|next|goto)=https?/i.test(url.search)
            ? "URL berisi parameter yang mengarahkan ke situs lain."
            : "Tidak ditemukan indikasi pengalihan pada struktur URL.",
    },
    {
      id: "tld",
      label: "Ekstensi domain berisiko",
      flagged: RISKY_TLDS.includes(tld),
      detail: RISKY_TLDS.includes(tld)
        ? `Ekstensi ".${tld}" sering dipakai untuk situs sementara atau tidak resmi.`
        : `Ekstensi ".${tld}" umum digunakan.`,
    },
    {
      id: "intel",
      label: "Tercatat di basis data risiko (demo)",
      flagged: knownJudolDomain || regDomain === "demo-example.com",
      detail:
        knownJudolDomain || regDomain === "demo-example.com"
          ? "Domain ini tercatat pada daftar domain berisiko di knowledge base demo CekGuard."
          : "Domain tidak ditemukan pada daftar risiko demo.",
    },
  ];

  const weights: Record<string, number> = {
    impersonation: 30,
    "sensitive-keyword": 15,
    urgency: 15,
    structure: 15,
    https: 8,
    redirect: 12,
    tld: 7,
    intel: 25,
  };
  const score = Math.min(
    97,
    checks.reduce((sum, c) => sum + (c.flagged ? weights[c.id] : 0), 0) + (brand && SENSITIVE.test(full) ? 5 : 0),
  );

  const indicators: RiskIndicator[] = checks
    .filter((c) => c.flagged)
    .map((c) => ({ id: c.id, label: c.label, description: c.detail }));

  return { checks, indicators, score, impersonatedBrand: brand?.name, knownJudolDomain };
}
