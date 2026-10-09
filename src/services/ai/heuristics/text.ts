import type { RiskCategory, RiskIndicator } from "@/types";
import { classifyComment } from "./judol";

/**
 * Multi-category rule engine for free text (messages, comments, captions).
 * Returns the most likely risk category with matched phrases so the result
 * can be explained to the learner.
 */

interface TextRule {
  id: string;
  category: RiskCategory;
  label: string;
  description: string;
  regex: RegExp;
  weight: number;
}

const RULES: TextRule[] = [
  {
    id: "minta-otp",
    category: "phishing",
    label: "Meminta kode OTP / PIN / kata sandi",
    description: "Layanan resmi tidak pernah meminta OTP, PIN, atau kata sandi melalui pesan.",
    regex: /\b(otp|kode verifikasi|kode rahasia|pin|password|kata sandi)\b/i,
    weight: 30,
  },
  {
    id: "akun-diblokir",
    category: "phishing",
    label: "Ancaman akun diblokir",
    description: "Ancaman pemblokiran dipakai agar korban panik dan tidak berpikir panjang.",
    regex: /(akun\s+(anda|kamu)?\s*(akan\s+)?(di)?blokir|dinonaktifkan|ditangguhkan|suspend)/i,
    weight: 25,
  },
  {
    id: "verifikasi-data",
    category: "phishing",
    label: "Meminta verifikasi data melalui tautan",
    description: "Pelaku mengarahkan korban ke situs palsu untuk memasukkan data pribadi.",
    regex: /(verifikasi|konfirmasi|perbarui|update)\s+(data|akun|identitas)|klik (link|tautan)/i,
    weight: 20,
  },
  {
    id: "mengaku-resmi",
    category: "phishing",
    label: "Mengaku dari institusi resmi",
    description: "Pelaku meniru bank, kurir, atau instansi agar terlihat terpercaya.",
    regex: /\b(dari (pihak )?bank|customer service|cs resmi|petugas|admin resmi|kurir)\b/i,
    weight: 15,
  },
  {
    id: "hadiah",
    category: "scam",
    label: "Iming-iming hadiah atau undian",
    description: "Hadiah tak terduga adalah umpan klasik penipuan.",
    regex: /\b(selamat.{0,20}(menang|terpilih)|hadiah|undian|giveaway)\b/i,
    weight: 25,
  },
  {
    id: "biaya-admin",
    category: "scam",
    label: "Meminta transfer atau biaya di muka",
    description: "Permintaan biaya admin/pajak untuk mencairkan hadiah adalah ciri penipuan.",
    regex: /\b(transfer|biaya admin|biaya pengiriman|pajak hadiah|kirim pulsa|top ?up)\b/i,
    weight: 25,
  },
  {
    id: "untung-pasti",
    category: "scam",
    label: "Janji keuntungan pasti",
    description: "Investasi yang menjanjikan untung pasti dan cepat hampir selalu penipuan.",
    regex: /(untung pasti|profit \d+%|pasti cuan|tanpa risiko|balik modal)/i,
    weight: 25,
  },
  {
    id: "file-apk",
    category: "scam",
    label: "Meminta memasang file APK",
    description: "File APK dari pesan dapat berisi malware pencuri data.",
    regex: /\.apk\b|undangan digital|lihat foto paket/i,
    weight: 30,
  },
  {
    id: "desakan-waktu",
    category: "phishing",
    label: "Desakan waktu",
    description: "Batas waktu sangat singkat dibuat agar korban bertindak tanpa berpikir.",
    regex: /(segera|sekarang juga|dalam \d+ (menit|jam)|hari ini juga|batas waktu)/i,
    weight: 12,
  },
  {
    id: "hinaan",
    category: "cyberbullying",
    label: "Kata-kata merendahkan",
    description: "Kata-kata yang menghina atau merendahkan seseorang.",
    regex: /\b(bodoh|goblok|jelek|sampah|nggak guna|gak guna|culun|payah|norak)\b/i,
    weight: 30,
  },
  {
    id: "pengucilan",
    category: "cyberbullying",
    label: "Ajakan mengucilkan",
    description: "Mengajak orang lain menjauhi atau menyerang seseorang.",
    regex: /(jangan temenan|keluarin (aja )?dari grup|semua (pada )?block|serang (aja|bareng)|nggak ada yang suka)/i,
    weight: 30,
  },
  {
    id: "ancaman",
    category: "cyberbullying",
    label: "Ancaman atau intimidasi",
    description: "Ancaman menyebarkan foto/data atau menyakiti seseorang.",
    regex: /(awas (kamu|lo)|aku sebar|disebarin|tunggu (aja )?pembalasan)/i,
    weight: 35,
  },
  {
    id: "ajakan-sebar",
    category: "misinformation",
    label: "Desakan untuk menyebarkan",
    description: "Pesan berantai mendesak dibagikan tanpa sumber jelas.",
    regex: /(sebarkan|share (ke|sebanyak)|viralkan|bagikan ke \d+|broadcast)/i,
    weight: 25,
  },
  {
    id: "klaim-mutlak",
    category: "misinformation",
    label: "Klaim mutlak tanpa sumber",
    description: "Klaim 100% atau 'rahasia yang disembunyikan' tanpa rujukan tepercaya.",
    regex: /(dijamin 100%|100% (ampuh|terbukti)|rahasia yang (disembunyikan|tidak mau)|media tidak (memberitakan|mau))/i,
    weight: 25,
  },
  {
    id: "sumber-kabur",
    category: "misinformation",
    label: "Sumber tidak jelas",
    description: "Mengutip 'katanya' atau sumber anonim yang tidak dapat diverifikasi.",
    regex: /(katanya|dari grup sebelah|info dari teman|copas dari|sumber: (grup|wa))/i,
    weight: 15,
  },
];

export interface TextAnalysis {
  category: RiskCategory;
  score: number;
  indicators: RiskIndicator[];
  matches: { phrase: string; indicator: string }[];
}

export function analyzeTextContent(text: string): TextAnalysis {
  const judol = classifyComment(text);
  const scores: Partial<Record<RiskCategory, number>> = {};
  const indicators: RiskIndicator[] = [];
  const matches: { phrase: string; indicator: string }[] = [];

  for (const rule of RULES) {
    const m = text.match(rule.regex);
    if (!m) continue;
    scores[rule.category] = (scores[rule.category] ?? 0) + rule.weight;
    indicators.push({ id: rule.id, label: rule.label, description: rule.description });
    matches.push({ phrase: m[0], indicator: rule.label });
  }

  if (judol.riskLevel !== "safe") {
    scores.judol = judol.riskLevel === "high" ? 80 : judol.riskLevel === "medium" ? 55 : 30;
    for (const p of judol.matched) {
      const m = text.match(p.regex);
      indicators.push({ id: p.id, label: p.label, description: p.description });
      if (m) matches.push({ phrase: m[0], indicator: p.label });
    }
  }

  const ranked = (Object.entries(scores) as [RiskCategory, number][]).sort((a, b) => b[1] - a[1]);
  const [category, raw] = ranked[0] ?? ["phishing", 0];
  const score = Math.min(96, raw + Math.max(0, ranked.length - 1) * 5);
  return { category, score, indicators, matches };
}
