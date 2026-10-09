import { z } from "zod";

import { MAX_TEXT_LENGTH } from "./limits";

export { MAX_TEXT_LENGTH };

const level = z.enum(["pemula", "menengah", "lanjutan"]);
const category = z.enum(["judol", "phishing", "deepfake", "scam", "cyberbullying", "misinformation"]);

export const urlScanSchema = z.object({
  url: z.string({ error: "URL wajib diisi." }).min(1, "URL wajib diisi.").max(2048),
});

export const textScanSchema = z.object({
  text: z
    .string({ error: "Teks wajib diisi." })
    .trim()
    .min(5, "Masukkan minimal 5 karakter.")
    .max(MAX_TEXT_LENGTH, `Teks maksimal ${MAX_TEXT_LENGTH} karakter.`),
});

export const tutorSchema = z.object({
  message: z.string({ error: "Pertanyaan tidak boleh kosong." }).trim().min(1, "Pertanyaan tidak boleh kosong.").max(1000),
  history: z
    .array(z.object({ role: z.enum(["user", "tutor"]), content: z.string().max(4000) }))
    .max(12)
    .default([]),
  context: z.object({
    level,
    simplified: z.boolean(),
    completedLessons: z.array(z.string().max(80)).max(100),
    weakestCategory: category.optional(),
    weakestScore: z.number().min(0).max(100).optional(),
    currentTopic: category.optional(),
    lastScanSummary: z.string().max(300).optional(),
  }),
});
