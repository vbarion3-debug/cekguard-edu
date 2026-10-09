import type { RiskCategory, ScanModule } from "@/types";

export interface ModuleInfo {
  id: string;
  name: string;
  description: string;
  href?: string;
  status: "available" | "soon";
  category: RiskCategory;
  inputs: string[];
}

export const RISK_MODULES: ModuleInfo[] = [
  {
    id: "cekjudol",
    name: "CekJudol",
    description: "Analisis komentar untuk menemukan indikasi promosi judi online.",
    href: "/cekjudol",
    status: "available",
    category: "judol",
    inputs: ["URL konten"],
  },
  {
    id: "ceklink",
    name: "CekLink",
    description: "Periksa struktur URL untuk indikasi phishing dan peniruan layanan resmi.",
    href: "/ceklink",
    status: "available",
    category: "phishing",
    inputs: ["URL"],
  },
  {
    id: "cekdeepfake",
    name: "CekDeepfake",
    description: "Periksa indikasi manipulasi pada gambar dan pelajari cara verifikasinya.",
    href: "/cekdeepfake",
    status: "available",
    category: "deepfake",
    inputs: ["Gambar"],
  },
  {
    id: "cekscam",
    name: "CekScam",
    description: "Deteksi pola penipuan pada pesan dan tawaran online.",
    status: "soon",
    category: "scam",
    inputs: ["Teks"],
  },
  {
    id: "cekcyberbully",
    name: "CekCyberbully",
    description: "Kenali komentar bernada perundungan dan cara meresponsnya.",
    status: "soon",
    category: "cyberbullying",
    inputs: ["Teks"],
  },
  {
    id: "cekinfo",
    name: "CekInfo",
    description: "Bantu verifikasi klaim dan informasi yang beredar.",
    status: "soon",
    category: "misinformation",
    inputs: ["Teks", "URL"],
  },
];

export const MODULE_NAME: Record<ScanModule, string> = {
  cekjudol: "CekJudol",
  ceklink: "CekLink",
  cekdeepfake: "CekDeepfake",
  cekteks: "Cek Teks",
};

export const MODULE_HREF: Record<ScanModule, string> = {
  cekjudol: "/cekjudol",
  ceklink: "/ceklink",
  cekdeepfake: "/cekdeepfake",
  cekteks: "/scan?tab=text",
};

export const DEMO_JUDOL_URL = "https://youtube.com/watch?v=demo";
export const DEMO_PHISHING_URL = "http://bank-nusantara-login-security.demo-example.com/verifikasi?akun=blokir";
