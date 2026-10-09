import { Globe2 } from "lucide-react";
import { ColumnChart } from "@/components/charts/charts";
import { RiskBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { DetectedDomain } from "@/types";

const DAY_LABELS = ["H-6", "H-5", "H-4", "H-3", "H-2", "H-1", "Hari ini"];

export function DomainIntelligence({ domains }: { domains: DetectedDomain[] }) {
  const activity = DAY_LABELS.map((label, i) => ({ label, value: domains.reduce((s, d) => s + d.activity[i], 0) }));
  const maxMentions = Math.max(1, ...domains.map((d) => d.mentions));

  return (
    <Card>
      <CardHeader
        title="Tautan yang Ditemukan"
        description="Domain mencurigakan yang dipromosikan di kolom komentar"
        icon={<Globe2 className="h-5 w-5" />}
      />
      <CardContent className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Daftar domain mencurigakan, jumlah penyebutan, dan tingkat risiko</caption>
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-fg-muted">
                <th scope="col" className="py-2 pr-3 font-semibold">Domain</th>
                <th scope="col" className="px-3 py-2 font-semibold">Mention</th>
                <th scope="col" className="py-2 pl-3 font-semibold">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {domains.map((d) => (
                <tr key={d.domain}>
                  <th scope="row" className="py-3 pr-3 font-mono text-[13px] font-semibold text-fg">
                    {d.domain}
                  </th>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 tabular-nums font-semibold text-fg">{d.mentions}</span>
                      <span className="hidden h-2 flex-1 overflow-hidden rounded-full bg-surface-2 sm:block" aria-hidden>
                        <span className="block h-full rounded-full bg-danger/70" style={{ width: `${(d.mentions / maxMentions) * 100}%` }} />
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pl-3">
                    <RiskBadge level={d.riskLevel} short />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-fg-muted">
            Domain pada demo menggunakan nama contoh/terpesan (mis. .example, .test) dan bukan situs judi sungguhan.
          </p>
        </div>
        <div className="rounded-2xl bg-surface-2 p-4">
          <h3 className="font-bold text-fg">Domain Activity</h3>
          <p className="mb-4 text-sm text-fg-muted">Jumlah penyebutan domain per hari (7 hari terakhir)</p>
          <ColumnChart
            data={activity}
            tone="danger"
            label={`Aktivitas domain 7 hari terakhir: ${activity.map((a) => `${a.label} ${a.value}`).join(", ")}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
