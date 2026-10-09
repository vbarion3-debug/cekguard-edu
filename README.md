# CekGuard Edu

**Kenali • Pahami • Lindungi**

Platform pendidikan keamanan digital berbasis AI yang mengubah ancaman digital menjadi pengalaman belajar:

```
DETECT → EXPLAIN → LEARN → ACT
```

Prototipe kompetisi Software Development. Semua angka dan data yang tampil adalah **data demo** dan diberi label di UI.

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000 dan pilih akun demo (Siswa / Guru / Admin Institusi). Tidak perlu kata sandi.

Konfigurasi opsional: salin `.env.example` ke `.env.local`. Dengan `AI_PROVIDER=gemini` dan `GEMINI_API_KEY`, penjelasan hasil analisis dan AI Tutor memakai Gemini (server-side). Tanpa itu, aplikasi memakai `MockAIService` yang deterministik.

## Alur demo utama (± 3 menit)

1. **Login** sebagai Siswa → **Dashboard**
2. **Cek Risiko → CekJudol** → *Gunakan contoh* → *Mulai Analisis*
3. Loading bertahap → **82/100 Risiko Tinggi, 37 dari 120 komentar** terindikasi, 6 domain
4. *Mengapa konten ini berisiko?* (bisa diganti Pemula / Menengah / Lanjutan, bisa didengarkan)
5. Analisis komentar (filter + cari) dan *Tautan yang Ditemukan*
6. **Pelajari Mengapa** → pelajaran 6 langkah (konsep, contoh interaktif "temukan tanda bahaya", bahaya, cara mengenali, tindakan, mini quiz) → *Selesai*
7. **Mulai Quiz** → 5 soal (pilihan ganda, benar/salah, skenario) → hasil + "Progress diperbarui"
8. **Progress** / Dashboard menunjukkan skor yang berubah (mis. Judi Online 45% → 80%)

Reset data demo: **Profil → Reset data demo**.

## Fitur

| Area | Isi |
| --- | --- |
| Detect | CekJudol (flagship), CekLink (analisis struktur URL, tanpa membuka tautan), CekDeepfake (upload gambar nyata, validasi magic-bytes, cek metadata EXIF/jejak software), Cek Teks |
| Explain | Skor risiko + label teks + ikon, indikator, penjelasan 3 level literasi, Text-to-Speech |
| Learn | 9 pelajaran di 6 kategori, rekomendasi berdasarkan skor terlemah |
| Quiz | 6 quiz × 5 soal, topik dikuasai vs perlu dipelajari |
| Act | Tindakan aman, panduan pelaporan, umpan balik hasil |
| AI Tutor | Jawaban berbasis knowledge base, kontekstual (level, pelajaran selesai, skor quiz, scan terakhir) |
| Ekosistem | Dashboard Guru, Dashboard Institusi, Knowledge Base + siklus berkelanjutan |
| Inklusif | Ukuran teks, kontras tinggi, mode gelap, TTS, bantuan membaca, bahasa sederhana, mode keyboard (Alt+1…8), HTML semantik, skip link, focus visible |

Modul **Segera Hadir** (tidak diklaim selesai): CekScam, CekCyberbully, CekInfo, analisis video & audio.

## Arsitektur

```
src/
├── app/                 # Next.js App Router: halaman (app)/* dan API routes api/*
├── components/          # ui (design system), layout, scan, cekjudol, learning, quiz, charts, …
├── services/
│   ├── ai/              # AIService interface, MockAIService, GeminiAIService, heuristics/
│   ├── scan/            # pipeline CekJudol (server) + API client (browser)
│   ├── learning/        # analitik progress (fungsi murni)
│   ├── tutor/           # tutor berbasis knowledge base
│   └── database/        # ContentRepository + CommentSource (demo → Postgres)
├── store/               # state klien (zustand, persist localStorage)
├── lib/                 # validation, constants, utils, rate-limit
├── types/               # kontrak domain (mirror skema DB)
└── data/demo/           # seed: komentar, pelajaran, quiz, knowledge base, organisasi
database/schema.sql      # skema PostgreSQL
```

- **AI provider dapat diganti** lewat `AI_PROVIDER`; semua provider mengimplementasikan `AIService`.
- **Deteksi tetap dapat dijelaskan**: klasifikasi memakai mesin pola yang setiap hasilnya dipetakan ke indikator edukatif; LLM dipakai untuk bahasa natural.
- **Data layer**: `ContentRepository` dan `CommentSource` memisahkan UI dari sumber data. Implementasi demo memakai seed dengan bentuk yang sama dengan `database/schema.sql`.

## Keamanan

- API key hanya di server (`server-only`), tidak pernah dikirim ke browser.
- Validasi input dengan zod; batas panjang teks/URL; rate limit per IP.
- CekJudol hanya menerima URL dari platform yang di-allowlist dan **tidak mengambil konten nyata** (sumber komentar demo). CekLink tidak membuka URL sama sekali. Alamat jaringan privat/lokal ditolak.
- Upload gambar: tipe & ukuran (≤ 5 MB) divalidasi di klien dan server, isi file dicek dengan magic bytes, gambar tidak disimpan.
- Output dirender sebagai teks (tanpa HTML injection); log server tidak memuat input pengguna.
- Domain demo memakai nama contoh/terpesan (`.example`, `.test`, `.invalid`, `demo-example.com`), bukan situs judi sungguhan.

## Skrip

```bash
npm run dev     # pengembangan
npm run build   # build produksi
npm run lint    # ESLint
npx tsx scripts/verify-demo.ts   # verifikasi angka demo (120/37/83/6, skor 82)
npx tsx scripts/contrast-audit.ts # audit kontras WCAG AA untuk 4 tema (light, dark, high-contrast, high-contrast dark)
```
