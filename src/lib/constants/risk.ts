import type { RiskLevel } from "@/types";

export const RISK_META: Record<
  RiskLevel,
  { label: string; short: string; tone: "danger" | "warning" | "info" | "success" }
> = {
  high: { label: "Risiko Tinggi", short: "Tinggi", tone: "danger" },
  medium: { label: "Risiko Sedang", short: "Sedang", tone: "warning" },
  low: { label: "Risiko Rendah", short: "Rendah", tone: "info" },
  safe: { label: "Normal", short: "Normal", tone: "success" },
};

export function levelFromScore(score: number): RiskLevel {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  if (score >= 20) return "low";
  return "safe";
}
