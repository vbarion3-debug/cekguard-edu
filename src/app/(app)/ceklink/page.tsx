"use client";

import { ArrowLeft, Info, Link2, ScanSearch, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { AnalysisProgress } from "@/components/scan/analysis-progress";
import { ChecksCard, StandardResult } from "@/components/scan/generic-result";
import { DemoBadge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/feedback";
import { FieldError, FieldHint, Input, Label } from "@/components/ui/input";
import { useScan } from "@/hooks/use-scan";
import { DEMO_PHISHING_URL } from "@/lib/constants/modules";
import { validateUrl } from "@/lib/validation/url";
import { scanLink } from "@/services/scan/client";
import type { LinkDetails } from "@/types";

const STEPS = ["Memvalidasi URL", "Menganalisis struktur domain", "Memeriksa peniruan layanan resmi", "Mencocokkan dengan basis data risiko (demo)"];

function CekLinkContent() {
  const params = useSearchParams();
  const scan = useScan("ceklink", 3000);
  const [url, setUrl] = useState(params.get("url") ?? "");

  // Arriving from the Cek Risiko hub with ?url=…&auto=1 starts the analysis immediately.
  const autoUrl = params.get("auto") === "1" ? params.get("url") : null;
  const { run } = scan;
  const autoStarted = useRef(false);
  useEffect(() => {
    if (!autoUrl || autoStarted.current || !validateUrl(autoUrl).ok) return;
    autoStarted.current = true;
    window.history.replaceState(null, "", window.location.pathname);
    run(() => scanLink(autoUrl));
  }, [autoUrl, run]);

  function submit() {
    const v = validateUrl(url);
    if (!v.ok) return scan.setError(v.error);
    scan.run(() => scanLink(url));
  }

  const d = scan.result?.details as LinkDetails | undefined;

  return (
    <div>
      <Link href="/scan" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-fg-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Cek Risiko
      </Link>
      <PageHeader
        icon={<Link2 className="h-6 w-6" />}
        eyebrow={
          <>
            <StatusBadge status="available" />
            <DemoBadge />
          </>
        }
        title="CekLink"
        description="Periksa struktur URL untuk menemukan indikasi phishing dan peniruan layanan resmi."
      />

      {scan.status === "loading" && <AnalysisProgress steps={STEPS} title="Menganalisis tautan..." />}

      {scan.status === "success" && scan.result && d && (
        <StandardResult
          result={scan.result}
          onReset={scan.reset}
          scoreExtra={
            <p className="mt-3 rounded-xl bg-surface-2 p-3 text-left text-sm">
              <span className="block text-xs font-semibold text-fg-muted">URL</span>
              <span className="break-all font-mono text-fg">{d.hostname}</span>
              {d.impersonatedBrand && <span className="mt-1 block text-danger">Menyerupai: {d.impersonatedBrand}</span>}
            </p>
          }
        >
          <ChecksCard checks={d.checks} />
        </StandardResult>
      )}

      {(scan.status === "idle" || scan.status === "error") && (
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Card>
            <CardContent>
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                <Label htmlFor="link-url">Masukkan URL mencurigakan</Label>
                <Input
                  id="link-url"
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (scan.error) scan.setError(null);
                  }}
                  placeholder="contoh: http://login-akun.contoh.com"
                  aria-invalid={!!scan.error}
                  aria-describedby="link-hint link-error"
                />
                <FieldHint id="link-hint">Tautan tidak akan dibuka. CekLink hanya menganalisis struktur alamatnya.</FieldHint>
                <FieldError id="link-error" message={scan.error} />
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button type="submit" size="lg" disabled={!url.trim()}>
                    <ScanSearch className="h-5 w-5" aria-hidden /> Mulai Analisis
                  </Button>
                  <Button
                    variant="soft"
                    size="lg"
                    onClick={() => {
                      setUrl(DEMO_PHISHING_URL);
                      scan.setError(null);
                    }}
                  >
                    <Sparkles className="h-5 w-5" aria-hidden /> Gunakan contoh
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          <Card className="bg-surface-2">
            <CardContent>
              <h2 className="flex items-center gap-2 font-bold text-fg">
                <Info className="h-5 w-5 text-primary" aria-hidden /> Yang diperiksa
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-fg-muted">
                <li>• Peniruan nama layanan resmi (impersonation)</li>
                <li>• Kata sensitif seperti “login”, “verifikasi”</li>
                <li>• Kata desakan (“blokir”, “segera”)</li>
                <li>• Struktur domain & subdomain</li>
                <li>• HTTPS dan indikasi pengalihan</li>
                <li>• Basis data risiko (demo)</li>
              </ul>
              <p className="mt-4 text-xs text-fg-muted">
                Analisis ini bersifat demo dan tidak melakukan pemeriksaan real-time ke internet.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function CekLinkPage() {
  return (
    <Suspense>
      <CekLinkContent />
    </Suspense>
  );
}
