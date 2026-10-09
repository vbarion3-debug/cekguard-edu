import { cn } from "@/lib/utils/cn";

/**
 * Lightweight SVG charts. Each chart exposes a text alternative (aria-label
 * plus visible values) so information is never conveyed by color alone.
 */

const STROKE: Record<string, string> = {
  primary: "var(--primary)",
  danger: "var(--danger)",
  warning: "var(--warning)",
  success: "var(--success)",
  info: "var(--info)",
  accent: "var(--accent)",
  muted: "var(--border-strong)",
};

export function RadialScore({
  value,
  max = 100,
  tone = "primary",
  size = 168,
  label,
  caption,
}: {
  value: number;
  max?: number;
  tone?: keyof typeof STROKE;
  size?: number;
  label: string;
  caption?: string;
}) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label={label}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={STROKE[tone]}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center" aria-hidden>
        <div>
          <span className="text-4xl font-extrabold tabular-nums text-fg">{value}</span>
          <span className="text-base font-semibold text-fg-muted">/{max}</span>
          {caption && <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">{caption}</p>}
        </div>
      </div>
    </div>
  );
}

export function DonutChart({
  segments,
  size = 140,
  label,
  centerLabel,
  centerValue,
}: {
  segments: { label: string; value: number; tone: keyof typeof STROKE; pattern?: boolean }[];
  size?: number;
  label: string;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = 40;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label={label}>
        <defs>
          <pattern id="donut-stripes" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="4" height="4" fill="var(--danger)" />
            <line x1="0" y1="0" x2="0" y2="4" stroke="var(--surface)" strokeWidth="1.5" />
          </pattern>
        </defs>
        {segments.map((s) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={s.label}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={s.pattern ? "url(#donut-stripes)" : STROKE[s.tone]}
              strokeWidth="16"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      {centerValue && (
        <div className="absolute inset-0 grid place-items-center text-center" aria-hidden>
          <div>
            <p className="text-xl font-extrabold tabular-nums text-fg">{centerValue}</p>
            {centerLabel && <p className="text-[11px] font-medium text-fg-muted">{centerLabel}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export function ColumnChart({
  data,
  label,
  tone = "primary",
  height = 120,
  highlightLast,
}: {
  data: { label: string; value: number }[];
  label: string;
  tone?: keyof typeof STROKE;
  height?: number;
  highlightLast?: boolean;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <figure>
      <div className="flex items-end gap-2" style={{ height }} role="img" aria-label={label}>
        {data.map((d, i) => (
          <div key={`${d.label}-${i}`} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="text-xs font-semibold tabular-nums text-fg-muted">{d.value}</span>
            <div
              className={cn(
                "w-full max-w-10 rounded-t-md transition-[height] duration-700",
                highlightLast && i !== data.length - 1 && "opacity-55",
              )}
              style={{ height: `${(d.value / max) * 100}%`, minHeight: 4, background: STROKE[tone] }}
            />
          </div>
        ))}
      </div>
      <figcaption className="mt-2 flex gap-2" aria-hidden>
        {data.map((d, i) => (
          <span key={`${d.label}-${i}`} className="flex-1 text-center text-[11px] text-fg-muted">
            {d.label}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

export function LineChart({
  data,
  label,
  height = 140,
}: {
  data: { label: string; value: number }[];
  label: string;
  height?: number;
}) {
  if (data.length < 2) return null;
  const w = 300;
  const h = 100;
  const min = Math.max(0, Math.min(...data.map((d) => d.value)) - 10);
  const max = Math.min(100, Math.max(...data.map((d) => d.value)) + 10);
  const x = (i: number) => (i / (data.length - 1)) * (w - 20) + 10;
  const y = (v: number) => h - 12 - ((v - min) / Math.max(1, max - min)) * (h - 28);
  const path = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.value)}`).join(" ");
  return (
    <figure>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ height }} className="w-full" role="img" aria-label={label} preserveAspectRatio="none">
        <path d={`${path} L${x(data.length - 1)},${h} L${x(0)},${h} Z`} fill="var(--primary-soft)" />
        <path d={path} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(d.value)} r="3.5" fill="var(--surface)" stroke="var(--primary)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <text x={x(i)} y={y(d.value) - 8} textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--text)">
              {d.value}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-1 flex justify-between text-[11px] text-fg-muted" aria-hidden>
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </figcaption>
    </figure>
  );
}
