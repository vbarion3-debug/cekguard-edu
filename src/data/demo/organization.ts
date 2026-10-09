import type { RiskCategory } from "@/types";

/**
 * Demo data for teacher and institution dashboards.
 * All names and figures are fictional and labelled "Data Demo" in the UI.
 */

export interface DemoStudent {
  id: string;
  name: string;
  scores: Record<RiskCategory, number>;
  lessonsCompleted: number;
  quizzesCompleted: number;
  lastActiveDaysAgo: number;
}

const NAMES = [
  "Adinda Kirana", "Bayu Prasetyo", "Clara Anjani", "Daffa Ramadhan", "Elsa Fitriani", "Farhan Akbar",
  "Gita Permata", "Hafiz Maulana", "Indah Sari", "Joko Susilo", "Karin Oktavia", "Luthfi Hakim",
  "Maya Safitri", "Naufal Rizki", "Olivia Tan", "Pandu Wirawan", "Qonita Zahra", "Reza Firmansyah",
  "Sinta Melati", "Taufik Hidayat", "Umi Kalsum", "Vino Aditya", "Winda Lestari", "Yusuf Ibrahim",
  "Zahra Amelia", "Andi Saputra", "Bunga Citra", "Cahyo Nugroho", "Dian Pertiwi", "Evan Setiawan", "Fira Nuraini",
];

/** Base averages per topic chosen to tell a clear story (cyberbullying lowest). */
const TOPIC_BASE: Record<RiskCategory, number> = {
  judol: 83,
  phishing: 78,
  deepfake: 61,
  scam: 70,
  cyberbullying: 49,
  misinformation: 66,
};

function seeded(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export const DEMO_CLASS = {
  name: "XI IPA 2",
  school: "SMA Nusantara (Demo)",
  teacher: "Budi Santoso, S.Pd.",
  activeModules: 6,
};

export const DEMO_STUDENTS: DemoStudent[] = NAMES.map((name, i) => {
  const scores = Object.fromEntries(
    (Object.keys(TOPIC_BASE) as RiskCategory[]).map((cat, k) => {
      const v = TOPIC_BASE[cat] + Math.round((seeded(i, k) - 0.5) * 36);
      return [cat, Math.max(15, Math.min(100, v))];
    }),
  ) as Record<RiskCategory, number>;
  return {
    id: `s${i + 1}`,
    name,
    scores,
    lessonsCompleted: 2 + Math.floor(seeded(i, 9) * 8),
    quizzesCompleted: 1 + Math.floor(seeded(i, 11) * 6),
    lastActiveDaysAgo: Math.floor(seeded(i, 13) * 9),
  };
});

export interface DemoProgram {
  id: string;
  name: string;
  description: string;
  participants: number;
  progress: number;
  status: "Berjalan" | "Selesai" | "Direncanakan";
}

export const DEMO_INSTITUTION = {
  name: "Yayasan Pendidikan Nusantara (Demo)",
  schools: [
    { name: "SMA Nusantara", participants: 612, avgLiteracy: 71, participation: 88 },
    { name: "SMK Nusantara", participants: 438, avgLiteracy: 66, participation: 81 },
    { name: "SMP Nusantara", participants: 384, avgLiteracy: 62, participation: 76 },
  ],
  programs: [
    {
      id: "p1",
      name: "Gerakan Anti Judi Online Pelajar",
      description: "Modul CekJudol + quiz untuk seluruh kelas X dan XI.",
      participants: 840,
      progress: 74,
      status: "Berjalan",
    },
    {
      id: "p2",
      name: "Literasi Phishing untuk MPLS",
      description: "Pengenalan phishing bagi siswa baru.",
      participants: 410,
      progress: 100,
      status: "Selesai",
    },
    {
      id: "p3",
      name: "Verifikasi Media Digital",
      description: "Pelatihan deepfake dan cek fakta untuk tim jurnalistik sekolah.",
      participants: 96,
      progress: 52,
      status: "Berjalan",
    },
    {
      id: "p4",
      name: "Sekolah Ramah Digital (Anti-Cyberbullying)",
      description: "Program bersama guru BK untuk semester genap.",
      participants: 0,
      progress: 0,
      status: "Direncanakan",
    },
  ] satisfies DemoProgram[],
};
