/**
 * Demo comment dataset for CekJudol.
 *
 * All domains use reserved / example names (RFC 2606 / RFC 6761) and are NOT
 * real gambling sites. The dataset intentionally contains 120 comments of
 * which 37 are gambling promotions (30 high risk, 7 medium risk) spread across
 * 6 suspicious domains — the same numbers used across the app.
 */

export interface RawComment {
  id: string;
  author: string;
  text: string;
  /** Day bucket (0 = 6 days ago … 6 = today) for the domain activity chart. */
  day: number;
}

export const DEMO_CONTENT = {
  title: "Tips Belajar Efektif Menjelang Ujian (Video Demo)",
  platform: "YouTube",
  channel: "Kanal Edukasi Demo",
};

export const SUSPICIOUS_DOMAINS = [
  "demo-example.com",
  "sample-domain.net",
  "example-test.org",
  "promo-demo.example",
  "hoki-sample.test",
  "link-contoh.invalid",
] as const;

const FIRST = ["Rizky", "Putri", "Bagas", "Salsa", "Fajar", "Nabila", "Dimas", "Aulia", "Raka", "Citra", "Yoga", "Intan", "Hana", "Galih", "Tiara", "Arif", "Laras", "Bima", "Dewi", "Kevin"];
const LAST = ["Pratama", "Lestari", "Saputra", "Wulan", "Nugroho", "Anggraini", "Hidayat", "Maharani", "Siregar", "Putra", "Kusuma", "Rahmawati"];

function author(i: number) {
  return `${FIRST[(i * 7) % FIRST.length]} ${LAST[(i * 5) % LAST.length]}`;
}

/** 30 high-risk promotions, each linking one of the suspicious domains. */
const HIGH_RISK: [string, number][] = [
  ["Bonus new member 100% langsung cair! Daftar sekarang di demo-example.com 🔥", 0],
  ["Slot gacor hari ini auto maxwin, gabung di demo-example.com", 0],
  ["claim bonus harian kamu di demo-example.com, depo 10rb bisa WD jutaan", 0],
  ["Lagi butuh tambahan uang jajan? main di demo-example.com auto JP 💰", 0],
  ["RTP tinggi hari ini!! cek demo-example.com buruan sebelum ditutup", 0],
  ["s.l.o.t g4c0r cuma di demo-example.com, scatter turun terus", 0],
  ["Depo pulsa tanpa potongan, daftar di demo-example.com gan", 0],
  ["Jackpot 25 juta barusan cair, link: demo-example.com", 0],
  ["Freebet 20rb untuk member baru di demo-example.com", 0],
  ["Yang mau maxwin langsung aja ke demo-example.com ya", 0],
  ["Daftar di sample-domain.net bonus deposit 50% 😍", 0],
  ["Gacor parah! Withdraw 5 juta dari sample-domain.net hari ini", 0],
  ["Main 1 jam langsung JP, gabung sample-domain.net sekarang", 0],
  ["Cashback 10% tiap minggu cuma di sample-domain.net", 0],
  ["Zeus lagi murah hati, cek sample-domain.net bosku", 0],
  ["depo 25k dapat bonus 25k, buruan klik sample-domain.net", 0],
  ["Akun pro rtp 98%, daftar di sample-domain.net", 0],
  ["Togel & slot lengkap di example-test.org, bonus member baru", 0],
  ["Claim freespin gratis sekarang di example-test.org", 0],
  ["Scatter hitam turun terus di example-test.org, auto cuan", 0],
  ["Modal receh hasil jutaan, gabung example-test.org 💸", 0],
  ["Link alternatif anti blokir situs slot: example-test.org daftar sekarang", 0],
  ["Promo deposit e-wallet bonus 30% di promo-demo.example", 0],
  ["Olympus lagi gacor, langsung main di promo-demo.example", 0],
  ["Daftar promo-demo.example dapat saldo gratis buat pemula", 0],
  ["Bonus rollingan harian, cek promo-demo.example sekarang", 0],
  ["JP terus tiap hari, situs hoki-sample.test terpercaya, daftar!", 0],
  ["Wd berapapun dibayar, gabung hoki-sample.test 🔥🔥", 0],
  ["Pola gacor terbaru ada di link-contoh.invalid, claim bonusnya", 0],
  ["Auto maxwin modal 5rb, daftar link-contoh.invalid", 0],
];

/** 7 medium-risk promotions: promotional language without an explicit link. */
const MEDIUM_RISK: string[] = [
  "Mau tau pola slot gacor? cek bio aku ya kak",
  "Yang butuh info situs JP hari ini, link di profil 😉",
  "Barusan maxwin 3x, rahasianya ada di bio",
  "Depo 10rb bisa jadi jutaan, tanya aku di DM",
  "Info rtp tertinggi update tiap jam, cek profilku",
  "Gabung grup prediksi angka jitu, link di bio!",
  "Bonus member baru tanpa syarat, kepoin profilku",
];

const NORMAL: string[] = [
  "Seru banget acaranya, penjelasannya mudah dipahami!",
  "Terima kasih kak, tips nomor 3 sangat membantu.",
  "Aku coba teknik pomodoro dan ternyata fokusnya naik.",
  "Video ini pas banget buat persiapan ujian semester.",
  "Bisa dibahas juga cara mencatat yang efektif?",
  "Makasih sudah berbagi, ditunggu video selanjutnya.",
  "Aku suka cara kakak menjelaskan pakai contoh.",
  "Sudah aku simpan videonya buat ditonton ulang.",
  "Belajar 25 menit lalu istirahat 5 menit ternyata efektif.",
  "Penjelasan soal manajemen waktu bagus sekali.",
  "Dari Bandung nonton bareng teman sekelas 👋",
  "Kak, rekomendasi aplikasi pengingat belajar apa ya?",
  "Mind map memang membantu banget buat hafalan.",
  "Ini sangat berguna untuk adikku yang mau ujian.",
  "Tolong bahas tips mengurangi rasa cemas sebelum ujian.",
  "Konten edukatif seperti ini harus lebih banyak.",
  "Aku jadi semangat belajar lagi setelah nonton ini.",
  "Bagian tentang tidur cukup itu penting banget.",
  "Guru aku merekomendasikan video ini di kelas.",
  "Teknik active recall bikin aku lebih cepat paham.",
  "Videonya singkat tapi padat, mantap!",
  "Bisa minta referensi buku tentang cara belajar?",
  "Semoga sukses ujiannya buat kita semua 🙏",
  "Aku coba praktikkan mulai hari ini.",
  "Penjelasan spaced repetition-nya jelas sekali.",
  "Kak, kalau belajar kelompok efektif nggak?",
  "Sangat membantu untuk mahasiswa baru seperti aku.",
  "Cara menyusun jadwal belajarnya mudah diikuti.",
  "Terima kasih, sekarang aku nggak sistem kebut semalam lagi.",
  "Visualnya rapi dan enak dilihat.",
  "Aku setuju, minum air putih juga bantu konsentrasi.",
  "Ternyata belajar sambil dengar musik bisa mengganggu ya.",
  "Konsep feynman technique-nya keren banget.",
  "Nonton ini sebelum belajar matematika, jadi lebih siap.",
  "Bermanfaat sekali, sudah aku bagikan ke grup kelas.",
  "Kapan-kapan bahas cara membaca cepat dong kak.",
  "Tipsnya realistis dan bisa dicoba siapa saja.",
  "Aku suka bagian tentang menetapkan target kecil.",
  "Kalimat penutupnya memotivasi banget.",
  "Mantap kak, lanjutkan kontennya!",
  "Aku baru tahu soal interleaving, terima kasih.",
  "Bisa bikin versi untuk persiapan UTBK?",
  "Penjelasannya runtut dari awal sampai akhir.",
  "Belajar di tempat yang rapi memang bikin fokus.",
  "Info yang sangat berguna untuk pelajar.",
  "Akhirnya nemu video belajar yang nggak membosankan.",
  "Sudah subscribe, ditunggu konten berikutnya.",
  "Aku praktikkan catatan cornell, hasilnya bagus.",
  "Kak, gimana cara tetap konsisten belajar?",
  "Video ini menyelamatkan minggu ujianku 😂",
  "Penting juga ya istirahat dari layar HP.",
  "Kombinasi olahraga ringan dan belajar ternyata cocok.",
  "Terima kasih atas ilmunya, sangat bermanfaat.",
  "Suka banget sama contoh jadwal mingguannya.",
  "Ini cocok untuk siswa SMA maupun mahasiswa.",
  "Sharing pengalaman: aku pakai flashcard tiap pagi.",
  "Gaya bicaranya santai jadi enak diikuti.",
  "Boleh minta template jadwal belajarnya kak?",
  "Pembahasannya relevan dengan kondisi pelajar sekarang.",
  "Aku jadi paham kenapa sering lupa setelah belajar.",
  "Semangat buat semua yang lagi persiapan ujian!",
  "Bagian akhir videonya bikin termotivasi.",
  "Informasinya akurat dan mudah dipraktikkan.",
  "Kakak keren, terus berkarya ya.",
  "Ternyata otak butuh jeda supaya ingatan kuat.",
  "Cara mengatur prioritas tugasnya membantu sekali.",
  "Video yang sangat inspiratif untuk pelajar.",
  "Akan aku coba sebelum ujian minggu depan.",
  "Teman-teman, jangan lupa sarapan sebelum ujian ya.",
  "Aku tonton dua kali biar benar-benar paham.",
  "Konten bermanfaat tanpa bertele-tele.",
  "Tips mengurangi distraksi HP itu ngena banget.",
  "Mohon dibuat seri lanjutan tentang motivasi belajar.",
  "Penjelasan tentang kurva lupa menarik sekali.",
  "Aku rangkum poin-poinnya di buku catatan.",
  "Video ini direkomendasikan teman, ternyata bagus.",
  "Sekarang aku belajar dengan target harian.",
  "Ilmunya bisa dipakai juga untuk kerja.",
  "Terima kasih kak sudah membuat konten positif.",
  "Belajar bareng teman via video call juga seru.",
  "Saran yang sederhana tapi berdampak besar.",
  "Aku jadi lebih percaya diri menghadapi ujian.",
  "Konten seperti ini layak ditonton semua pelajar.",
];

function build(): RawComment[] {
  const highs = HIGH_RISK.map(([text], i) => ({ text, day: i % 7 }));
  const mediums = MEDIUM_RISK.map((text, i) => ({ text, day: (i * 3 + 2) % 7 }));
  const normals = NORMAL.map((text, i) => ({ text, day: i % 7 }));

  // Interleave deterministically so promotions are scattered through the thread.
  const flagged = [...highs, ...mediums];
  const out: { text: string; day: number }[] = [];
  let f = 0;
  let n = 0;
  for (let i = 0; out.length < flagged.length + normals.length; i++) {
    const takeFlagged = f < flagged.length && (i % 3 === 1 || n >= normals.length);
    if (takeFlagged) out.push(flagged[f++]);
    else if (n < normals.length) out.push(normals[n++]);
  }
  return out.map((c, i) => ({ id: `c${String(i + 1).padStart(3, "0")}`, author: author(i), ...c }));
}

export const DEMO_COMMENTS: RawComment[] = build();
