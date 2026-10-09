import { hashString } from "@/lib/utils/id";
import type { LinkCheck } from "@/types";

/**
 * Image signals.
 *
 * Metadata checks (EXIF presence, editing-software / AI-generator markers,
 * content-credential markers) are real byte-level checks. Visual indicators
 * are simulated deterministically in demo mode — they are NOT a forensic
 * model, and the UI labels them as "Demo Analysis".
 */

const EDITOR_MARKERS = ["photoshop", "gimp", "snapseed", "picsart", "facetune", "faceapp"];
const AI_MARKERS = ["stable diffusion", "midjourney", "dall-e", "firefly", "novelai"];

function latin1(bytes: Uint8Array, limit = 131072): string {
  let s = "";
  const n = Math.min(bytes.length, limit);
  for (let i = 0; i < n; i++) s += String.fromCharCode(bytes[i]);
  return s;
}

export interface ImageSignals {
  hasExif: boolean;
  editor?: string;
  aiMarker?: string;
  hasContentCredentials: boolean;
  confidence: number;
  checks: LinkCheck[];
}

export function analyzeImageBytes(bytes: Uint8Array, fileName: string, isDemoSample: boolean): ImageSignals {
  const head = latin1(bytes);
  const lower = head.toLowerCase();
  const hasExif = head.includes("Exif\0\0") || head.includes("eXIf");
  const editor = EDITOR_MARKERS.find((m) => lower.includes(m));
  const aiMarker = AI_MARKERS.find((m) => lower.includes(m));
  const hasContentCredentials = lower.includes("c2pa") || lower.includes("jumbf");

  // Deterministic demo signal derived from the file content.
  const stride = Math.max(1, Math.floor(bytes.length / 512));
  let sample = "";
  for (let i = 0; i < bytes.length; i += stride) sample += bytes[i];
  const h = hashString(`${sample}:${fileName.length}`);
  const r = (shift: number) => ((h >>> shift) & 0xff) / 255;

  let confidence = isDemoSample ? 78 : Math.round(30 + r(0) * 55);
  if (aiMarker) confidence = Math.max(confidence, 88);
  else if (editor) confidence = Math.min(95, confidence + 8);
  const elevated = isDemoSample || confidence >= 70;

  const visual = (id: string, label: string, threshold: number, on: string, off: string, shift: number): LinkCheck => {
    const flagged = isDemoSample ? true : elevated ? r(shift) > threshold - 0.35 : r(shift) > threshold;
    return { id, label, flagged, detail: flagged ? on : off };
  };

  const checks: LinkCheck[] = [
    visual(
      "facial",
      "Ketidakkonsistenan area wajah",
      0.55,
      "Area tepi wajah dan rambut terlihat kurang menyatu dengan latar belakang.",
      "Tidak terlihat ketidakkonsistenan mencolok pada area wajah.",
      8,
    ),
    visual(
      "artifacts",
      "Artefak visual",
      0.5,
      "Terdapat pola blur/blok tidak wajar di beberapa area gambar.",
      "Tidak ditemukan artefak visual yang menonjol.",
      16,
    ),
    visual(
      "texture",
      "Tekstur tidak alami",
      0.6,
      "Tekstur kulit tampak terlalu halus dan seragam.",
      "Tekstur gambar terlihat wajar.",
      24,
    ),
    {
      id: "metadata",
      label: "Metadata kamera tidak ditemukan",
      flagged: !hasExif,
      detail: hasExif
        ? "Gambar memiliki metadata EXIF. Metadata membantu, tetapi bisa dipalsukan."
        : "Tidak ada metadata EXIF. Banyak gambar hasil edit, unduhan media sosial, atau AI tidak menyimpan metadata kamera.",
    },
    {
      id: "software",
      label: "Jejak perangkat lunak edit/AI",
      flagged: !!editor || !!aiMarker,
      detail: aiMarker
        ? `Ditemukan penanda generator AI ("${aiMarker}") di dalam file.`
        : editor
          ? `Ditemukan penanda perangkat lunak edit ("${editor}") di dalam file.`
          : "Tidak ditemukan penanda perangkat lunak edit atau generator AI.",
    },
    {
      id: "context",
      label: "Konteks/sumber perlu diverifikasi",
      flagged: !hasContentCredentials,
      detail: hasContentCredentials
        ? "File memuat Content Credentials (C2PA) yang dapat diperiksa asal-usulnya."
        : "Asal-usul gambar tidak dapat dipastikan dari file. Lakukan pencarian gambar terbalik dan cek sumber aslinya.",
    },
  ];

  return { hasExif, editor, aiMarker, hasContentCredentials, confidence, checks };
}
