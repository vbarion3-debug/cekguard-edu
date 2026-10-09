"use client";

import { useCallback, useState } from "react";
import { withMinimumDuration } from "@/services/scan/client";
import { useAppStore } from "@/store/app-store";
import type { AnalysisResult, ScanModule } from "@/types";

export type ScanStatus = "idle" | "loading" | "success" | "error";

/**
 * Shared scan state machine: idle → loading → success | error.
 * The latest result per module is kept in the store so returning from a
 * lesson shows the same result (consistent demo data).
 */
export function useScan(module: ScanModule, minimumMs = 3600) {
  const stored = useAppStore((s) => s.lastResults[module]);
  const recordScan = useAppStore((s) => s.recordScan);
  const clearResult = useAppStore((s) => s.clearResult);
  const [status, setStatus] = useState<ScanStatus>(stored ? "success" : "idle");
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (fn: () => Promise<AnalysisResult>) => {
      setStatus("loading");
      setError(null);
      try {
        const result = await withMinimumDuration(fn(), minimumMs);
        recordScan(result);
        setStatus("success");
        requestAnimationFrame(() => document.getElementById("main-content")?.scrollIntoView({ behavior: "smooth" }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analisis gagal. Silakan periksa input dan coba lagi.");
        setStatus("error");
      }
    },
    [minimumMs, recordScan],
  );

  const reset = useCallback(() => {
    clearResult(module);
    setStatus("idle");
    setError(null);
  }, [clearResult, module]);

  return { status, error, result: status === "success" ? stored : undefined, run, reset, setError };
}
