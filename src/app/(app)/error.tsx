"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";

/** Route-level error boundary: keeps the shell and offers recovery instead of a blank page. */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[ui]", error.digest ?? error.message.slice(0, 200));
  }, [error]);

  return (
    <EmptyState
      titleAs="h1"
      icon={<TriangleAlert className="h-6 w-6" />}
      title="Terjadi kesalahan saat memuat halaman"
      description="Silakan coba lagi. Jika masalah berlanjut, kembali ke Dashboard."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Coba lagi
          </Button>
          <ButtonLink href="/dashboard" variant="outline">
            Ke Dashboard
          </ButtonLink>
        </div>
      }
    />
  );
}
