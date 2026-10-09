import { getLessonBySlug } from "@/data/demo/lessons";
import type { AnalysisResult, LearningLevel, Recommendation, RiskCategory, SafeAction } from "@/types";

/**
 * Educational templates used to turn a detection into an explanation,
 * a learning recommendation, and safe actions.
 */

export const LESSON_FOR_CATEGORY: Record<RiskCategory, string> = {
  judol: "mengenali-promosi-judi-online",
  phishing: "cara-mengenali-phishing",
  deepfake: "verifikasi-media-digital",
  scam: "modus-penipuan-online",
  cyberbullying: "merespons-cyberbullying",
  misinformation: "cek-fakta-sebelum-berbagi",
};

const PROMPT_FOR_CATEGORY: Record<RiskCategory, string> = {
  judol: "Ingin memahami cara mengenali promosi judi online?",
  phishing: "Ingin tahu cara mengenali phishing sebelum terjebak?",
  deepfake: "Ingin belajar cara memverifikasi media digital?",
  scam: "Ingin mengenali modus penipuan online lainnya?",
  cyberbullying: "Ingin tahu cara merespons cyberbullying dengan aman?",
  misinformation: "Ingin belajar cara cek fakta sebelum berbagi?",
};

export function buildRecommendation(category: RiskCategory, reason?: string): Recommendation {
  const slug = LESSON_FOR_CATEGORY[category];
  const lesson = getLessonBySlug(slug);
  return {
    lessonSlug: slug,
    lessonTitle: lesson?.title ?? "Pelajaran keamanan digital",
    quizId: lesson?.quizId ?? "quiz-phishing",
    prompt: PROMPT_FOR_CATEGORY[category],
    reason: reason ?? `Materi ini membahas indikator yang ditemukan pada hasil analisis.`,
  };
}

export const SAFE_ACTIONS: Record<RiskCategory, SafeAction[]> = {
  judol: [
    { id: "no-click", title: "Jangan klik tautan", description: "Tautan promosi dapat mengarah ke situs judi ilegal atau berbahaya." },
    { id: "no-data", title: "Jangan berikan data pribadi", description: "Jangan mendaftar atau memasukkan nomor HP/rekening." },
    { id: "report", title: "Laporkan konten", description: "Gunakan fitur Laporkan → Spam/Penipuan pada platform." },
    { id: "block", title: "Blokir akun", description: "Blokir akun penyebar agar tidak muncul lagi." },
    { id: "evidence", title: "Simpan bukti", description: "Ambil tangkapan layar bila ingin melapor ke pihak berwenang." },
  ],
  phishing: [
    { id: "no-click", title: "Jangan klik tautan", description: "Akses layanan dengan mengetik alamat resmi atau lewat aplikasi resmi." },
    { id: "no-data", title: "Jangan berikan data pribadi", description: "Jangan pernah membagikan OTP, PIN, atau kata sandi." },
    { id: "verify", title: "Verifikasi melalui sumber terpercaya", description: "Hubungi layanan melalui nomor resmi di situs/kartu resmi." },
    { id: "report", title: "Laporkan", description: "Laporkan pesan/tautan ke platform tempat kamu menerimanya." },
    { id: "evidence", title: "Simpan bukti", description: "Simpan tangkapan layar pesan dan tautan." },
  ],
  deepfake: [
    { id: "verify", title: "Verifikasi sumber dan konteks", description: "Cari unggahan asli dan bandingkan dengan media tepercaya." },
    { id: "reverse", title: "Lakukan pencarian gambar terbalik", description: "Temukan versi lain dari gambar untuk melihat perbedaannya." },
    { id: "no-share", title: "Jangan sebarkan dulu", description: "Tahan diri sampai keasliannya jelas." },
    { id: "report", title: "Laporkan jika merugikan", description: "Laporkan konten manipulatif yang merugikan seseorang." },
  ],
  scam: [
    { id: "no-transfer", title: "Jangan transfer uang", description: "Hadiah atau layanan resmi tidak meminta biaya di muka." },
    { id: "no-apk", title: "Jangan instal file dari pesan", description: "Unduh aplikasi hanya dari toko aplikasi resmi." },
    { id: "verify", title: "Verifikasi melalui sumber terpercaya", description: "Cek rekening dan reputasi pengirim di layanan resmi." },
    { id: "report", title: "Laporkan dan blokir", description: "Laporkan nomor/akun pelaku ke platform." },
  ],
  cyberbullying: [
    { id: "no-reply", title: "Jangan membalas dengan emosi", description: "Membalas dapat memperburuk situasi." },
    { id: "evidence", title: "Simpan bukti", description: "Tangkapan layar lengkap dengan tanggal dan nama akun." },
    { id: "block", title: "Blokir dan laporkan", description: "Gunakan fitur blokir dan laporkan di platform." },
    { id: "tell", title: "Cerita ke orang tepercaya", description: "Guru BK, wali kelas, atau orang tua dapat membantu." },
  ],
  misinformation: [
    { id: "check", title: "Cek sumber asli", description: "Cari informasi yang sama di media kredibel atau situs resmi." },
    { id: "factcheck", title: "Gunakan situs cek fakta", description: "Periksa apakah klaim sudah pernah dibantah." },
    { id: "no-share", title: "Jangan sebarkan dulu", description: "Jika ragu, berhenti di kamu." },
  ],
};

function list(labels: string[]): string {
  const l = labels.map((x) => x.toLowerCase());
  if (l.length <= 1) return l[0] ?? "";
  return `${l.slice(0, -1).join(", ")}, serta ${l[l.length - 1]}`;
}

/** Level-adaptive explanation generated from the analysis result (no LLM needed). */
export function templateExplanation(result: AnalysisResult, level: LearningLevel): string {
  const labels = result.indicators.slice(0, 4).map((i) => i.label);
  const found = list(labels);
  const d = result.details;

  if (result.riskLevel === "safe" || result.riskLevel === "low") {
    return {
      pemula: "Sistem tidak menemukan tanda bahaya yang kuat. Tetap berhati-hati dan jangan membagikan data pribadi kepada pihak yang tidak dikenal.",
      menengah: "Tidak ditemukan pola risiko yang signifikan. Meski demikian, hasil otomatis tidak menjamin keamanan; tetap verifikasi sumber dan konteks.",
      lanjutan: "Skor risiko rendah karena indikator utama tidak terpenuhi. Hasil ini bersifat probabilistik — false negative tetap mungkin terjadi, terutama untuk pola baru.",
    }[level];
  }

  switch (d.kind) {
    case "judol":
      return {
        pemula: `Ada ${d.flagged} dari ${d.totalComments} komentar yang mengajak orang bermain judi online. Komentar itu menjanjikan bonus dan uang cepat, lalu menyuruh membuka tautan. Jangan klik tautannya, ya.`,
        menengah: `Sistem menemukan beberapa pola yang umum digunakan dalam promosi judi online, seperti ${found}. Sebanyak ${d.flagged} komentar (${Math.round((d.flagged / d.totalComments) * 100)}%) mengarah ke ${d.domains.length} domain mencurigakan.`,
        lanjutan: `Terdeteksi kampanye spam terkoordinasi: ${d.highRisk} komentar risiko tinggi dan ${d.mediumRisk} risiko sedang dengan indikator ${found}. Pola rotasi ${d.domains.length} domain dan penyamaran leksikal menunjukkan upaya menghindari moderasi otomatis.`,
      }[level];
    case "link":
      return {
        pemula: `Tautan ini terlihat seperti milik ${d.impersonatedBrand ?? "layanan resmi"}, tapi sebenarnya bukan. Tautan seperti ini sering dipakai untuk mencuri kata sandi atau kode OTP.`,
        menengah: `URL ini menunjukkan tanda phishing: ${found}. Domain asli bukan milik ${d.impersonatedBrand ?? "layanan yang ditiru"}, sehingga data yang dimasukkan dapat jatuh ke tangan pelaku.`,
        lanjutan: `Analisis struktural menunjukkan pola ${found}. Kombinasi brand-in-subdomain dan kata kunci kredensial merupakan teknik credential harvesting yang umum.`,
      }[level];
    case "deepfake":
      return {
        pemula: `Gambar ini memiliki beberapa tanda yang mungkin menunjukkan editan atau buatan AI, seperti ${found}. Ini belum pasti palsu — cek dulu sumber aslinya.`,
        menengah: `Sistem menemukan indikasi manipulasi dengan tingkat keyakinan ${d.confidence}%: ${found}. Skor ini bukan kepastian; lakukan verifikasi sumber dan pencarian gambar terbalik.`,
        lanjutan: `Sinyal yang terdeteksi: ${found} (confidence ${d.confidence}%). Hasil bersifat probabilistik dan rentan false positive pada gambar terkompresi; triangulasi dengan analisis provenance dan OSINT.`,
      }[level];
    case "text":
      return {
        pemula: `Pesan ini punya tanda-tanda berbahaya, seperti ${found}. Jangan ikuti perintah di pesan ini sebelum memastikan kebenarannya.`,
        menengah: `Teks ini terindikasi berisiko karena mengandung ${found}. Pola tersebut umum dipakai dalam social engineering untuk memancing tindakan cepat.`,
        lanjutan: `Teks memuat indikator ${found}, konsisten dengan teknik social engineering (pretexting, urgency, authority). Skor ${result.riskScore}/100 berdasarkan bobot indikator.`,
      }[level];
  }
}
