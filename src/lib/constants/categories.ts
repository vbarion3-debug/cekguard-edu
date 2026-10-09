import type { LearningLevel, LearningModule, RiskCategory } from "@/types";

export const CATEGORIES: LearningModule[] = [
  { id: "judol", title: "Judi Online", description: "Mengenali promosi dan jebakan judi online di media sosial." },
  { id: "phishing", title: "Phishing", description: "Mengenali pesan dan situs palsu yang mencuri data pribadi." },
  { id: "deepfake", title: "Deepfake", description: "Memverifikasi foto, video, dan audio yang mungkin dimanipulasi." },
  { id: "scam", title: "Scam", description: "Mengenali modus penipuan online dan social engineering." },
  { id: "cyberbullying", title: "Cyberbullying", description: "Merespons perundungan digital dengan aman dan suportif." },
  { id: "misinformation", title: "Misinformasi", description: "Memeriksa kebenaran informasi sebelum membagikannya." },
];

export const CATEGORY_TITLE: Record<RiskCategory, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.title]),
) as Record<RiskCategory, string>;

export const LEVELS: { id: LearningLevel; label: string; description: string }[] = [
  { id: "pemula", label: "Pemula", description: "Bahasa sederhana dengan contoh sehari-hari." },
  { id: "menengah", label: "Menengah", description: "Mulai mengenal istilah dan teknik serangan." },
  { id: "lanjutan", label: "Lanjutan", description: "Istilah teknis dan analisis pola serangan." },
];

export const LEVEL_LABEL: Record<LearningLevel, string> = {
  pemula: "Pemula",
  menengah: "Menengah",
  lanjutan: "Lanjutan",
};
