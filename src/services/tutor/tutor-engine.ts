import { LESSONS } from "@/data/demo/lessons";
import { KNOWLEDGE_BASE } from "@/data/demo/knowledge-base";
import { CATEGORY_TITLE } from "@/lib/constants/categories";
import { LESSON_FOR_CATEGORY } from "@/services/ai/templates";
import type { Lesson, LessonStep, RiskCategory, TutorContext, TutorReply } from "@/types";

/**
 * Knowledge-grounded tutor used by MockAIService (and as a fallback).
 * It answers only digital-safety questions, adapts to the learner's level,
 * and always ends with a recommended lesson.
 */

const TOPIC_KEYWORDS: [RiskCategory, RegExp][] = [
  ["judol", /(judi|judol|slot|gacor|maxwin|togel|taruhan|bonus member)/i],
  ["phishing", /(phishing|fishing|otp|kata sandi|password|login palsu|link palsu|tautan|url|situs palsu|akun.*blokir)/i],
  ["deepfake", /(deepfake|deep fake|manipulasi|foto palsu|video palsu|suara tiruan|voice clon|editan|ai generat|media digital)/i],
  ["scam", /(scam|penipuan|tipu|apk|hadiah|undian|investasi|scam call|telepon penipu|transfer)/i],
  ["cyberbullying", /(bully|bullying|perundungan|dihina|diejek|dikucilkan|ancam)/i],
  ["misinformation", /(hoaks|hoax|misinformasi|disinformasi|berita palsu|cek fakta|pesan berantai)/i],
];

type Intent = "define" | "recognize" | "act" | "why" | "general";

function detectIntent(msg: string): Intent {
  if (/(mengapa|kenapa|alasan|dianggap)/i.test(msg)) return "why";
  if (/(apa yang harus|harus (apa|bagaimana)|sebaiknya|terlanjur|sudah (klik|kasih|memberi)|jika menerima|kalau (menerima|dapat)|langkah)/i.test(msg)) return "act";
  if (/(mengenali|ciri|tanda|membedakan|cara (tahu|cek)|bagaimana cara)/i.test(msg)) return "recognize";
  if (/(apa itu|apa sih|pengertian|maksud|arti|definisi|jelaskan)/i.test(msg)) return "define";
  return "general";
}

export function detectTopic(msg: string): RiskCategory | undefined {
  return TOPIC_KEYWORDS.find(([, re]) => re.test(msg))?.[0];
}

function step<T extends LessonStep["type"]>(lesson: Lesson, type: T) {
  return lesson.steps.find((s) => s.type === type) as Extract<LessonStep, { type: T }> | undefined;
}

const FOLLOW_UPS: Record<RiskCategory, string[]> = {
  judol: ["Mengapa komentar tersebut dianggap judi online?", "Apa yang harus dilakukan jika teman terjebak judi online?"],
  phishing: ["Bagaimana cara memeriksa tautan yang aman?", "Apa yang harus dilakukan jika sudah terlanjur memberi OTP?"],
  deepfake: ["Bagaimana cara mengenali deepfake?", "Apakah alat AI bisa memastikan gambar itu palsu?"],
  scam: ["Apa yang harus dilakukan jika menerima scam call?", "Bagaimana mengenali file APK berbahaya?"],
  cyberbullying: ["Apa yang bisa saya lakukan sebagai saksi?", "Bukti apa yang perlu disimpan?"],
  misinformation: ["Bagaimana cara cek fakta dengan cepat?", "Apa beda misinformasi dan disinformasi?"],
};

export function tutorRespond(message: string, ctx: TutorContext): TutorReply {
  const topic = detectTopic(message) ?? (/(itu|tersebut|ini)/i.test(message) ? ctx.currentTopic : undefined);
  const intent = detectIntent(message);
  const level = ctx.simplified ? "pemula" : ctx.level;

  if (!topic) {
    const offTopic = !/(aman|keamanan|digital|internet|online|akun|data|media sosial|hp|privasi)/i.test(message);
    const weak = ctx.weakestCategory
      ? `\n\nBerdasarkan progresmu, topik yang paling perlu diperkuat adalah **${CATEGORY_TITLE[ctx.weakestCategory]}** (${ctx.weakestScore}%).`
      : "";
    const content = offTopic
      ? `Aku adalah AI Tutor khusus **keamanan digital**, jadi aku fokus membantu topik seperti judi online, phishing, deepfake, penipuan, cyberbullying, dan misinformasi.${weak}\n\nCoba tanyakan misalnya: "Apa itu phishing?"`
      : `Keamanan digital dimulai dari tiga kebiasaan: **kenali** tanda bahaya, **pahami** cara kerjanya, dan **lindungi** diri dengan tindakan aman — misalnya tidak membagikan OTP, memeriksa tautan sebelum mengklik, dan memverifikasi informasi.${weak}`;
    const rec = ctx.weakestCategory ?? "phishing";
    const lesson = LESSONS.find((l) => l.slug === LESSON_FOR_CATEGORY[rec]);
    return {
      content,
      followUps: ["Apa itu phishing?", "Bagaimana cara mengenali deepfake?", "Apa yang harus dilakukan jika menerima scam call?"],
      recommendation: lesson ? { lessonSlug: lesson.slug, lessonTitle: lesson.title } : undefined,
      provider: "mock",
    };
  }

  const lesson = LESSONS.find((l) => l.slug === LESSON_FOR_CATEGORY[topic]) ?? LESSONS[0];
  const concept = step(lesson, "concept");
  const recognize = step(lesson, "recognize");
  const action = step(lesson, "action");
  const danger = step(lesson, "danger");
  const kb = KNOWLEDGE_BASE.filter((k) => k.riskType === topic).slice(0, 2);
  const parts: string[] = [];

  if (intent === "define" || intent === "general") {
    parts.push(concept?.body[level] ?? "");
    if (concept?.keyPoints.length) parts.push(`Poin penting:\n${concept.keyPoints.map((p) => `• ${p}`).join("\n")}`);
  }
  if (intent === "recognize" || intent === "general") {
    parts.push(
      `Cara mengenalinya:\n${(recognize?.indicators ?? [])
        .slice(0, level === "pemula" ? 4 : 5)
        .map((i) => `• **${i.label}** — ${i.hint}`)
        .join("\n")}`,
    );
  }
  if (intent === "why") {
    if (topic === "judol" && ctx.lastScanSummary) {
      parts.push(`Pada analisis terakhirmu (${ctx.lastScanSummary}), komentar ditandai karena memenuhi beberapa pola sekaligus:`);
    } else {
      parts.push(`Konten ${CATEGORY_TITLE[topic].toLowerCase()} dianggap berisiko karena polanya cocok dengan indikator di Knowledge Base CekGuard:`);
    }
    parts.push(kb.map((k) => `• **${k.indicator}** — ${k.pattern}. Contoh: ${k.example}`).join("\n"));
    if (danger) parts.push(`Dampaknya: ${danger.points.slice(0, 2).map((p) => p.body).join(" ")}`);
    parts.push("Catatan: sistem menilai berdasarkan pola, sehingga hasilnya berupa indikasi — bukan kepastian mutlak.");
  }
  if (intent === "act") {
    if (/terlanjur|sudah (klik|kasih|memberi)/i.test(message) && (topic === "phishing" || topic === "scam")) {
      parts.push(
        "Tetap tenang, lakukan langkah darurat ini secepatnya:\n• **Hubungi layanan resmi** (bank/e-wallet) melalui nomor resmi untuk memblokir akses.\n• **Ganti kata sandi** dan keluarkan semua perangkat yang login.\n• **Aktifkan verifikasi dua langkah**.\n• **Simpan bukti** percakapan dan laporkan ke platform.",
      );
    } else {
      parts.push(`Yang sebaiknya dilakukan:\n${(action?.steps ?? []).map((s) => `• **${s.title}** — ${s.body}`).join("\n")}`);
    }
  }

  const personal: string[] = [];
  if (ctx.completedLessons.includes(lesson.id)) {
    personal.push(`Kamu sudah menyelesaikan "${lesson.title}" — coba uji lagi pemahamanmu lewat quiz.`);
  } else {
    personal.push(`Untuk memahami lebih dalam, pelajari "${lesson.title}" (${lesson.durationMin} menit).`);
  }
  if (ctx.weakestCategory && ctx.weakestCategory !== topic) {
    personal.push(`Setelah itu, perkuat juga topik ${CATEGORY_TITLE[ctx.weakestCategory]} (skor ${ctx.weakestScore}%).`);
  }

  return {
    content: [...parts.filter(Boolean), personal.join(" ")].join("\n\n"),
    topic,
    recommendation: { lessonSlug: lesson.slug, lessonTitle: lesson.title },
    followUps: FOLLOW_UPS[topic].filter((f) => f.toLowerCase() !== message.trim().toLowerCase()),
    provider: "mock",
  };
}
