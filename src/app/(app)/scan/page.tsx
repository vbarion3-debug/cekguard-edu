"use client";

import { ArrowRight, Clock, FileText, Image as ImageIcon, Link2, Mic, ScanFace, ScanSearch, Video } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ModuleCard } from "@/components/dashboard/module-card";
import { AnalysisProgress } from "@/components/scan/analysis-progress";
import { StandardResult } from "@/components/scan/generic-result";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/feedback";
import { Segmented } from "@/components/ui/controls";
import { FieldError, FieldHint, Input, Label, Textarea } from "@/components/ui/input";
import { Tabs, tabPanelId } from "@/components/ui/tabs";
import { useScan } from "@/hooks/use-scan";
import { RISK_MODULES } from "@/lib/constants/modules";
import { MAX_TEXT_LENGTH } from "@/lib/validation/limits";
import { matchContentPlatform, validateUrl } from "@/lib/validation/url";
import { scanText } from "@/services/scan/client";

type Tab = "text" | "url" | "image" | "video" | "audio";

const TEXT_EXAMPLES = [
  { label: "Pesan phishing", text: "[Bank Nusantara] Akun Anda akan diblokir dalam 10 menit. Segera verifikasi data di tautan berikut dan kirimkan kode OTP Anda." },
  { label: "Komentar judol", text: "Slot gacor hari ini auto maxwin! Bonus new member 100%, daftar sekarang di demo-example.com" },
  { label: "Pesan berantai", text: "Air rebusan daun X dijamin 100% menyembuhkan flu dalam 1 jam! Info dari grup sebelah. Sebarkan ke 10 grup!" },
  { label: "Hadiah palsu", text: "Selamat! Nomor Anda terpilih memenangkan undian Rp10.000.000. Transfer biaya admin Rp250.000 lalu instal Formulir_Hadiah.apk" },
];

function TextScanner() {
  const scan = useScan("cekteks", 2800);
  const [text, setText] = useState("");

  if (scan.status === "loading")
    return <AnalysisProgress steps={["Membaca teks", "Mencocokkan pola risiko", "Menyusun penjelasan"]} title="Menganalisis teks..." />;
  if (scan.status === "success" && scan.result) return <StandardResult result={scan.result} onReset={scan.reset} />;

  return (
    <Card>
      <CardContent>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim().length < 5) return scan.setError("Masukkan minimal 5 karakter.");
            scan.run(() => scanText(text));
          }}
        >
          <Label htmlFor="scan-text">Tempel pesan, komentar, atau caption</Label>
          <Textarea
            id="scan-text"
            value={text}
            maxLength={MAX_TEXT_LENGTH}
            onChange={(e) => {
              setText(e.target.value);
              if (scan.error) scan.setError(null);
            }}
            placeholder="Contoh: Selamat! Anda memenangkan hadiah, klik link berikut..."
            aria-invalid={!!scan.error}
            aria-describedby="scan-text-hint scan-text-error"
          />
          <FieldHint id="scan-text-hint">
            {text.length}/{MAX_TEXT_LENGTH} karakter · Jangan tempel data pribadi seperti nomor rekening atau kata sandi.
          </FieldHint>
          <FieldError id="scan-text-error" message={scan.error} />
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-fg-muted">Coba contoh:</p>
            <div className="flex flex-wrap gap-2">
              {TEXT_EXAMPLES.map((ex) => (
                <Button key={ex.label} variant="outline" size="sm" onClick={() => setText(ex.text)}>
                  {ex.label}
                </Button>
              ))}
            </div>
          </div>
          <Button type="submit" size="lg" className="mt-5" disabled={!text.trim()}>
            <ScanSearch className="h-5 w-5" aria-hidden /> Mulai Analisis
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function UrlScanner() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const v = url.trim() ? validateUrl(url) : null;
  const isContent = v?.ok ? !!matchContentPlatform(v.url) : false;
  const [choice, setChoice] = useState<"auto" | "ceklink" | "cekjudol">("auto");
  const target = choice === "auto" ? (isContent ? "cekjudol" : "ceklink") : choice;

  return (
    <Card>
      <CardContent>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const r = validateUrl(url);
            if (!r.ok) return setError(r.error);
            if (target === "cekjudol" && !matchContentPlatform(r.url))
              return setError("CekJudol membutuhkan tautan konten YouTube, TikTok, Instagram, Facebook, atau X.");
            router.push(`/${target}?url=${encodeURIComponent(url.trim())}&auto=1`);
          }}
        >
          <Label htmlFor="scan-url">Masukkan URL</Label>
          <Input
            id="scan-url"
            type="url"
            inputMode="url"
            autoComplete="off"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            placeholder="https://..."
            aria-invalid={!!error}
            aria-describedby="scan-url-error"
          />
          <FieldError id="scan-url-error" message={error} />
          <p className="mb-2 mt-5 text-sm font-semibold text-fg">Pilih jenis pemeriksaan</p>
          <Segmented
            label="Jenis pemeriksaan URL"
            value={choice}
            onChange={setChoice}
            options={[
              { value: "auto", label: "Otomatis", description: v?.ok ? `Disarankan: ${isContent ? "CekJudol" : "CekLink"}` : "Dipilih sesuai URL" },
              { value: "ceklink", label: "CekLink", description: "Cek tautan phishing" },
              { value: "cekjudol", label: "CekJudol", description: "Analisis komentar konten" },
            ]}
          />
          <Button type="submit" size="lg" className="mt-5" disabled={!url.trim()}>
            <ScanSearch className="h-5 w-5" aria-hidden /> Periksa dengan {target === "cekjudol" ? "CekJudol" : "CekLink"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ScanHub() {
  const params = useSearchParams();
  const initial = (params.get("tab") as Tab) || "text";
  const [tab, setTab] = useState<Tab>(["text", "url", "image", "video", "audio"].includes(initial) ? initial : "text");

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<ScanSearch className="h-6 w-6" />}
        title="Cek Risiko"
        description="Masukkan konten digital untuk mengetahui risiko serta mempelajari cara mengenalinya."
        eyebrow={<DemoBadge label="Mode prototipe" />}
      />

      <section aria-labelledby="pick-module">
        <h2 id="pick-module" className="mb-3 text-lg font-bold text-fg">
          Pilih modul
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {RISK_MODULES.filter((m) => m.status === "available").map((m) => (
            <ModuleCard key={m.id} module={m} />
          ))}
        </div>
        <p className="mt-3 text-sm text-fg-muted">
          Segera hadir:{" "}
          {RISK_MODULES.filter((m) => m.status === "soon").map((m, i, arr) => (
            <span key={m.id}>
              <Badge className="mx-0.5">{m.name}</Badge>
              {i < arr.length - 1 ? "" : ""}
            </span>
          ))}
        </p>
      </section>

      <section aria-labelledby="quick-check">
        <h2 id="quick-check" className="mb-3 text-lg font-bold text-fg">
          Atau periksa langsung
        </h2>
        <Tabs
          label="Jenis konten"
          value={tab}
          onChange={setTab}
          items={[
            { id: "text", label: "Teks / Komentar", icon: <FileText className="h-4 w-4" aria-hidden /> },
            { id: "url", label: "URL", icon: <Link2 className="h-4 w-4" aria-hidden /> },
            { id: "image", label: "Gambar", icon: <ImageIcon className="h-4 w-4" aria-hidden /> },
            { id: "video", label: "Video", icon: <Video className="h-4 w-4" aria-hidden /> },
            { id: "audio", label: "Audio", icon: <Mic className="h-4 w-4" aria-hidden /> },
          ]}
        />
        <div id={tabPanelId(tab)} role="tabpanel" className="mt-5">
          {tab === "text" && <TextScanner />}
          {tab === "url" && <UrlScanner />}
          {tab === "image" && (
            <EmptyState
              icon={<ScanFace className="h-6 w-6" />}
              title="Periksa gambar dengan CekDeepfake"
              description="Unggah gambar untuk memeriksa indikasi manipulasi dan pelajari cara verifikasinya."
              action={
                <ButtonLink href="/cekdeepfake">
                  Buka CekDeepfake <ArrowRight className="h-4 w-4" aria-hidden />
                </ButtonLink>
              }
            />
          )}
          {(tab === "video" || tab === "audio") && (
            <EmptyState
              icon={<Clock className="h-6 w-6" />}
              title={tab === "video" ? "Analisis video segera hadir" : "Analisis audio segera hadir"}
              description={
                tab === "video"
                  ? "Sementara itu, ambil tangkapan layar dari video dan periksa sebagai gambar."
                  : "Fitur Speech-to-Text untuk menganalisis rekaman (mis. scam call) sedang dikembangkan. Sementara itu, tuliskan isi percakapan di tab Teks."
              }
              action={
                <Button onClick={() => setTab(tab === "video" ? "image" : "text")}>
                  {tab === "video" ? "Periksa sebagai gambar" : "Gunakan tab Teks"}
                </Button>
              }
            />
          )}
        </div>
      </section>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense>
      <ScanHub />
    </Suspense>
  );
}
