"use client";

import { Accessibility, BookOpenText, Contrast, Keyboard, MessageSquareText, Moon, RotateCcw, Type, Volume2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Segmented, Switch } from "@/components/ui/controls";
import { PageHeader } from "@/components/ui/feedback";
import { RiskBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { SpeakButton } from "@/components/ui/speak-button";
import { useSpeechSupported } from "@/hooks/use-speech";
import { useAppStore } from "@/store/app-store";

const PREVIEW_TEXT = {
  normal:
    "Phishing memanfaatkan teknik social engineering untuk mengarahkan korban menuju situs atau komunikasi yang menyerupai layanan resmi.",
  simple: "Phishing adalah penipuan yang mencoba membuat seseorang memberikan informasi pribadi melalui pesan atau situs palsu.",
};

export default function AccessibilityPage() {
  const a = useAppStore((s) => s.accessibility);
  const set = useAppStore((s) => s.setAccessibility);
  const reset = useAppStore((s) => s.resetAccessibility);
  const speech = useSpeechSupported();
  const previewText = a.simplified ? PREVIEW_TEXT.simple : PREVIEW_TEXT.normal;

  return (
    <div>
      <PageHeader
        icon={<Accessibility className="h-6 w-6" />}
        title="Aksesibilitas"
        description="Sesuaikan tampilan dan cara belajar agar nyaman untuk semua pengguna. Pengaturan langsung diterapkan dan tersimpan."
        actions={
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Kembalikan bawaan
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Tampilan" icon={<Type className="h-5 w-5" />} />
            <CardContent className="space-y-6">
              <div>
                <p id="font-label" className="mb-2 font-semibold text-fg">Text Size</p>
                <Segmented
                  label="Ukuran teks"
                  value={a.fontSize}
                  onChange={(v) => set({ fontSize: v })}
                  options={[
                    { value: "normal", label: "Normal" },
                    { value: "large", label: "Large" },
                    { value: "xl", label: "Extra Large" },
                  ]}
                />
              </div>
              <div>
                <p className="mb-2 flex items-center gap-2 font-semibold text-fg">
                  <Contrast className="h-4 w-4" aria-hidden /> Contrast
                </p>
                <Segmented
                  label="Kontras"
                  value={a.contrast}
                  onChange={(v) => set({ contrast: v })}
                  options={[
                    { value: "standard", label: "Standard" },
                    { value: "high", label: "High Contrast" },
                  ]}
                />
              </div>
              <div>
                <p className="mb-2 flex items-center gap-2 font-semibold text-fg">
                  <Moon className="h-4 w-4" aria-hidden /> Theme
                </p>
                <Segmented
                  label="Tema"
                  value={a.theme}
                  onChange={(v) => set({ theme: v })}
                  options={[
                    { value: "light", label: "Light" },
                    { value: "dark", label: "Dark" },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Bantuan belajar" icon={<BookOpenText className="h-5 w-5" />} />
            <CardContent className="divide-y divide-border pt-2">
              <Switch
                icon={<Volume2 className="h-4 w-4" />}
                label="Text-to-Speech"
                description={
                  speech
                    ? "Tampilkan tombol “Dengarkan” untuk membacakan materi, hasil analisis, dan jawaban AI Tutor."
                    : "Browser ini tidak mendukung Text-to-Speech."
                }
                checked={a.tts}
                onChange={(v) => set({ tts: v })}
              />
              <Switch
                icon={<BookOpenText className="h-4 w-4" />}
                label="Reading Assistance"
                description="Memperlebar jarak baris, huruf, dan kata agar teks lebih mudah dibaca."
                checked={a.reading}
                onChange={(v) => set({ reading: v })}
              />
              <Switch
                icon={<MessageSquareText className="h-4 w-4" />}
                label="Simplified Language"
                description="Penjelasan, materi, dan AI Tutor memakai bahasa paling sederhana (level Pemula)."
                checked={a.simplified}
                onChange={(v) => set({ simplified: v })}
              />
              <Switch
                icon={<Keyboard className="h-4 w-4" />}
                label="Keyboard Navigation"
                description="Fokus lebih tebal dan pintasan Alt+1…8 untuk berpindah halaman (Alt+/ untuk bantuan)."
                checked={a.keyboard}
                onChange={(v) => set({ keyboard: v })}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardHeader title="Pratinjau" description="Lihat efek pengaturan secara langsung" as="h2" />
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <RiskBadge level="high" />
                <RiskBadge level="medium" />
                <RiskBadge level="safe" />
              </div>
              <p className="reading text-fg">{previewText}</p>
              <SpeakButton id="a11y-preview" text={previewText} />
              <ProgressBar value={68} label="Contoh progress" showValue />
              <Button className="w-full">Contoh tombol</Button>
            </CardContent>
          </Card>
          <Alert tone="info" title="Dirancang inklusif">
            Status risiko selalu ditampilkan dengan ikon dan teks — tidak hanya warna. Semua fitur dapat digunakan dengan keyboard dan pembaca layar.
          </Alert>
        </div>
      </div>
    </div>
  );
}
