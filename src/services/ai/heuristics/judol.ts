import type { CommentAnalysis, RiskIndicator, RiskLevel } from "@/types";

/**
 * Rule-based gambling-promotion classifier.
 *
 * Used by MockAIService and as a deterministic fallback for production
 * providers. Each pattern group maps to an educational indicator so every
 * classification can be explained to the learner.
 */

export interface PatternGroup {
  id: string;
  label: string;
  description: string;
  regex: RegExp;
}

export const JUDOL_PATTERNS: PatternGroup[] = [
  {
    id: "ajakan-bermain",
    label: "Ajakan bermain",
    description: "Kalimat yang mengajak orang mendaftar, bergabung, atau langsung bermain.",
    regex: /\b(daftar|gabung|main|buruan|klik|kepoin|tanya aku)\b/i,
  },
  {
    id: "klaim-bonus",
    label: "Klaim bonus",
    description: "Janji bonus, cashback, freebet, atau saldo gratis untuk menarik korban.",
    regex: /\b(bonus|cashback|freebet|freespin|saldo gratis|rollingan|claim)\b/i,
  },
  {
    id: "istilah-judi",
    label: "Istilah judi",
    description: "Istilah khas judi online seperti slot, gacor, maxwin, JP, RTP, atau togel.",
    regex: /\b(slot|s\.l\.o\.t|gacor|g4c0r|maxwin|jp|jackpot|rtp|scatter|togel|zeus|olympus|angka jitu|situs)\b/i,
  },
  {
    id: "janji-uang",
    label: "Janji uang cepat",
    description: "Klaim modal kecil menghasilkan uang besar dalam waktu singkat.",
    regex: /\b(depo|deposit|wd|withdraw|cuan|jutaan|modal receh|modal \d+rb|cair|dibayar|uang jajan)\b|\d+\s?(rb|k)\b/i,
  },
  {
    id: "tautan-mencurigakan",
    label: "Tautan mencurigakan",
    description: "Tautan atau domain asing yang diarahkan ke situs promosi.",
    regex: /\b[a-z0-9-]+\.(com|net|org|example|test|invalid)\b/i,
  },
  {
    id: "pengalihan-profil",
    label: "Pengalihan ke profil/DM",
    description: "Mengarahkan ke bio, profil, atau pesan pribadi untuk menghindari filter.",
    regex: /\b(cek bio|di bio|link di profil|cek profil|profilku|kepoin profil|di dm|link di bio)\b/i,
  },
  {
    id: "penyamaran-teks",
    label: "Penyamaran teks",
    description: "Ejaan disamarkan (mis. g4c0r, s.l.o.t) agar lolos dari moderasi otomatis.",
    regex: /\b(g4c0r|s\.l\.o\.t|m4xwin|sl0t)\b/i,
  },
];

const DOMAIN_REGEX = /\b([a-z0-9-]+\.(?:com|net|org|example|test|invalid))\b/gi;

export function extractDomains(text: string): string[] {
  return Array.from(new Set(Array.from(text.matchAll(DOMAIN_REGEX), (m) => m[1].toLowerCase())));
}

export interface CommentClassification {
  riskLevel: RiskLevel;
  matched: PatternGroup[];
  domains: string[];
  confidence: number;
}

export function classifyComment(text: string): CommentClassification {
  const matched = JUDOL_PATTERNS.filter((p) => p.regex.test(text));
  const ids = new Set(matched.map((m) => m.id));
  const domains = extractDomains(text);
  const core = ["klaim-bonus", "istilah-judi", "janji-uang"].filter((id) => ids.has(id)).length;

  let riskLevel: RiskLevel = "safe";
  if (domains.length > 0 && core >= 1) riskLevel = "high";
  else if (core >= 1 && (ids.has("pengalihan-profil") || core >= 2)) riskLevel = "medium";
  else if (core >= 1) riskLevel = "low";

  const confidence =
    riskLevel === "safe"
      ? 0.9 + Math.min(0.08, text.length / 2000)
      : Math.min(0.98, 0.6 + matched.length * 0.07 + (domains.length ? 0.1 : 0));

  return { riskLevel, matched, domains, confidence: Math.round(confidence * 100) / 100 };
}

export function toCommentAnalysis(
  c: { id: string; author: string; text: string },
  cls: CommentClassification,
): CommentAnalysis {
  const flagged = cls.riskLevel === "high" || cls.riskLevel === "medium";
  return {
    id: c.id,
    author: c.author,
    text: c.text,
    riskLevel: flagged ? cls.riskLevel : "safe",
    label: flagged ? "Promosi judi" : "Normal",
    matchedPatterns: flagged ? cls.matched.map((m) => m.label) : [],
    domains: cls.domains,
    confidence: cls.confidence,
  };
}

/** Aggregates indicator counts across flagged comments. */
export function aggregateIndicators(comments: CommentAnalysis[]): RiskIndicator[] {
  return JUDOL_PATTERNS.map((p) => ({
    id: p.id,
    label: p.label,
    description: p.description,
    count: comments.filter((c) => c.matchedPatterns.includes(p.label)).length,
  }))
    .filter((i) => (i.count ?? 0) > 0)
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
}

/**
 * Overall risk score for a comment thread: proportion of promotional
 * comments, weighted by severity and the number of distinct domains.
 */
export function threadRiskScore(total: number, high: number, medium: number, domainCount: number): number {
  if (total === 0) return 0;
  const ratio = (high + medium * 0.6) / total;
  const score = 26 + ratio * 100 * 1.25 + Math.min(domainCount, 10) * 3.4;
  return Math.max(0, Math.min(100, Math.round(high + medium === 0 ? ratio * 100 : score)));
}
