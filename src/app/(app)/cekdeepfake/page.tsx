"use client";

import { ArrowLeft, Clock, ImageUp, Info, ScanFace, ScanSearch, Sparkles, Video, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnalysisProgress } from "@/components/scan/analysis-progress";
import { ChecksCard, StandardResult } from "@/components/scan/generic-result";
import { Alert } from "@/components/ui/alert";
import { Badge, DemoBadge, StatusBadge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/feedback";
import { FieldError } from "@/components/ui/input";
import { Tabs, tabPanelId } from "@/components/ui/tabs";
import { useScan } from "@/hooks/use-scan";
import { formatBytes } from "@/lib/utils/format";
import { validateImageMeta } from "@/lib/validation/file";
import { scanImage } from "@/services/scan/client";
import type { DeepfakeDetails } from "@/types";

const STEPS = ["Memvalidasi file", "Memeriksa metadata & jejak perangkat lunak", "Menganalisis area wajah dan tekstur", "Menghitung tingkat keyakinan indikasi"];

/** Draws a stylised demo portrait so the demo works without bundling a real person's photo. */
async function createDemoImage(): Promise<File> {
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 640;
  const g = c.getContext("2d")!;
  const bg = g.createLinearGradient(0, 0, 640, 640);
  bg.addColorStop(0, "#c7d8f5");
  bg.addColorStop(1, "#6f8fc8");
  g.fillStyle = bg;
  g.fillRect(0, 0, 640, 640);
  g.fillStyle = "#2b3a55";
  g.beginPath();
  g.ellipse(320, 640, 230, 170, 0, Math.PI, 0);
  g.fill();
  g.fillStyle = "#e9b98f";
  g.beginPath();
  g.ellipse(320, 300, 130, 165, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#3b2a20";
  g.beginPath();
  g.ellipse(320, 190, 140, 85, 0, Math.PI, 0);
  g.fill();
  g.fillStyle = "#1f2937";
  [270, 370].forEach((x) => {
    g.beginPath();
    g.ellipse(x, 300, 14, 9, 0, 0, Math.PI * 2);
    g.fill();
  });
  g.strokeStyle = "#a0524a";
  g.lineWidth = 6;
  g.beginPath();
  g.arc(320, 365, 40, 0.15 * Math.PI, 0.85 * Math.PI);
  g.stroke();
  // Simulated blending seam around the face edge (a typical face-swap artefact).
  g.globalAlpha = 0.35;
  g.filter = "blur(6px)";
  g.strokeStyle = "#f5d7bd";
  g.lineWidth = 18;
  g.beginPath();
  g.ellipse(320, 300, 132, 167, 0, 0, Math.PI * 2);
  g.stroke();
  const blob = await new Promise<Blob>((res) => c.toBlob((b) => res(b!), "image/png"));
  return new File([blob], "contoh-demo-potret.png", { type: "image/png" });
}

function readDimensions(file: File): Promise<{ width: number; height: number; url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight, url });
    img.onerror = () => reject(new Error("Gambar tidak dapat dibaca."));
    img.src = url;
  });
}

function ImageScanner() {
  const scan = useScan("cekdeepfake", 3600);
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ url: string; width: number; height: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview.url);
    },
    [preview],
  );

  async function choose(f: File | undefined | null) {
    if (!f) return;
    const v = validateImageMeta(f);
    if (!v.ok) {
      scan.setError(v.error);
      return;
    }
    try {
      const dims = await readDimensions(f);
      scan.setError(null);
      setFile(f);
      setPreview(dims);
    } catch (e) {
      scan.setError((e as Error).message);
    }
  }

  function clear() {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const d = scan.result?.details as DeepfakeDetails | undefined;

  if (scan.status === "loading") return <AnalysisProgress steps={STEPS} title="Menganalisis gambar..." />;

  if (scan.status === "success" && scan.result && d) {
    return (
      <StandardResult
        result={scan.result}
        onReset={() => {
          clear();
          scan.reset();
        }}
        scoreExtra={
          <div className="mt-3 space-y-2 text-left">
            <p className="rounded-xl bg-surface-2 p-3 text-sm">
              <span className="font-semibold text-fg">Confidence: {d.confidence}%</span>
              <span className="block text-fg-muted">
                Skor menunjukkan tingkat keyakinan indikasi, <strong>bukan</strong> bukti bahwa gambar pasti palsu.
              </span>
            </p>
            <p className="text-xs text-fg-muted">
              {d.fileName} · {formatBytes(d.fileSize)}
              {d.width && d.height ? ` · ${d.width}×${d.height}px` : ""}
            </p>
          </div>
        }
      >
        {preview && (
          <Card>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview.url} alt={`Gambar yang dianalisis: ${d.fileName}`} className="h-40 w-40 rounded-xl object-cover" />
              <Alert tone="warning" title="Perlu verifikasi" className="flex-1">
                Sistem AI dapat keliru (false positive/negative). Lakukan pencarian gambar terbalik dan periksa sumber aslinya sebelum menyimpulkan.
              </Alert>
            </CardContent>
          </Card>
        )}
        <ChecksCard checks={d.checks} title="Possible Indicators" />
      </StandardResult>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <Card>
        <CardContent>
          {!file ? (
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                choose(e.dataTransfer.files?.[0]);
              }}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors has-[:focus-visible]:ring-[length:var(--focus-w)] has-[:focus-visible]:ring-ring ${
                dragging ? "border-primary bg-primary-soft" : "border-border-strong hover:bg-surface-2"
              }`}
            >
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary" aria-hidden>
                <ImageUp className="h-7 w-7" />
              </span>
              <span className="mt-4 font-bold text-fg">Upload Image</span>
              <span className="mt-1 text-sm text-fg-muted">Seret gambar ke sini atau klik untuk memilih. JPG, PNG, WebP — maks. 5 MB.</span>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                aria-describedby="deepfake-error"
                onChange={(e) => choose(e.target.files?.[0])}
              />
            </label>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview.url} alt={`Pratinjau gambar yang dipilih: ${file.name}`} className="h-36 w-36 rounded-xl object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-fg">{file.name}</p>
                <p className="text-sm text-fg-muted">
                  {formatBytes(file.size)}
                  {preview && ` · ${preview.width}×${preview.height}px`}
                </p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={clear}>
                  <X className="h-4 w-4" aria-hidden /> Ganti gambar
                </Button>
              </div>
            </div>
          )}
          <FieldError id="deepfake-error" message={scan.error} />
          <div className="mt-5 flex flex-wrap gap-3">
            <Button size="lg" disabled={!file} onClick={() => file && scan.run(() => scanImage(file, preview ?? undefined))}>
              <ScanSearch className="h-5 w-5" aria-hidden /> Mulai Analisis
            </Button>
            <Button variant="soft" size="lg" onClick={async () => choose(await createDemoImage())}>
              <Sparkles className="h-5 w-5" aria-hidden /> Gunakan contoh
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-surface-2">
        <CardContent>
          <h2 className="flex items-center gap-2 font-bold text-fg">
            <Info className="h-5 w-5 text-primary" aria-hidden /> Penting diketahui
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-fg-muted">
            <li>• Hasil berupa <strong className="text-fg">indikasi</strong> dengan tingkat keyakinan, bukan kepastian.</li>
            <li>• Pemeriksaan metadata (EXIF, jejak software edit/AI) dilakukan langsung pada file.</li>
            <li>• Indikator visual pada prototipe ini disimulasikan (Demo Analysis).</li>
            <li>• Gambar tidak disimpan setelah dianalisis.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CekDeepfakePage() {
  const [tab, setTab] = useState<"image" | "video">("image");
  return (
    <div>
      <Link href="/scan" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-fg-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Cek Risiko
      </Link>
      <PageHeader
        icon={<ScanFace className="h-6 w-6" />}
        eyebrow={
          <>
            <StatusBadge status="available" />
            <DemoBadge />
          </>
        }
        title="CekDeepfake"
        description="Periksa indikasi manipulasi pada media digital dan pelajari cara memverifikasinya."
      />
      <Tabs
        label="Jenis media"
        value={tab}
        onChange={setTab}
        className="mb-6 max-w-md"
        items={[
          { id: "image", label: "Upload Image", icon: <ImageUp className="h-4 w-4" aria-hidden /> },
          { id: "video", label: "Upload Video", icon: <Video className="h-4 w-4" aria-hidden />, badge: <Badge className="ml-1">Segera</Badge> },
        ]}
      />
      <div id={tabPanelId(tab)} role="tabpanel">
        {tab === "image" ? (
          <ImageScanner />
        ) : (
          <EmptyState
            icon={<Clock className="h-6 w-6" />}
            title="Analisis video segera hadir"
            description="Analisis video membutuhkan pemrosesan frame dan audio yang lebih berat. Sementara itu, ambil tangkapan layar dari video lalu periksa sebagai gambar, atau pelajari cara verifikasi video secara manual."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={() => setTab("image")}>Periksa sebagai gambar</Button>
                <ButtonLink href="/learning/verifikasi-media-digital" variant="outline">
                  Pelajari verifikasi media
                </ButtonLink>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}
