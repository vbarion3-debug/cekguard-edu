/**
 * WCAG contrast audit for the design tokens in src/app/globals.css.
 * Run: npx tsx scripts/contrast-audit.ts
 */
import { readFileSync } from "node:fs";

const css = readFileSync("src/app/globals.css", "utf8");

function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`selector not found: ${selector}`);
  const body = css.slice(start, css.indexOf("}", start));
  return Object.fromEntries(Array.from(body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi), (m) => [m[1], m[2]]));
}

const light = block(":root");
const themes: Record<string, Record<string, string>> = {
  light,
  dark: { ...light, ...block('[data-theme="dark"]') },
  "high-contrast": { ...light, ...block('[data-contrast="high"]') },
  "high-contrast dark": {
    ...light,
    ...block('[data-theme="dark"]'),
    ...block('[data-contrast="high"]'),
    ...block('[data-theme="dark"][data-contrast="high"]'),
  },
};

function lum(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a: string, b: string) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

// [foreground, background, minimum] — 4.5 for body text, 3 for large text / UI components.
const PAIRS: [string, string, number][] = [
  ["text", "bg", 4.5],
  ["text", "surface", 4.5],
  ["text", "surface-2", 4.5],
  ["text-muted", "surface", 4.5],
  ["text-muted", "surface-2", 4.5],
  ["text-muted", "bg", 4.5],
  ["primary", "surface", 4.5],
  ["primary", "primary-soft", 4.5],
  ["on-primary", "primary", 4.5],
  ["danger", "surface", 4.5],
  ["danger", "danger-soft", 4.5],
  ["warning", "warning-soft", 4.5],
  ["success", "success-soft", 4.5],
  ["info", "info-soft", 4.5],
  ["accent", "accent-soft", 4.5],
  ["border-strong", "surface", 3],
];

let failures = 0;
for (const [name, t] of Object.entries(themes)) {
  const rows = PAIRS.map(([fg, bg, min]) => {
    const r = ratio(t[fg], t[bg]);
    if (r < min) failures++;
    return `${r < min ? "FAIL" : " ok "} ${r.toFixed(2).padStart(5)}  ${fg} on ${bg} (min ${min})`;
  });
  console.log(`\n== ${name} ==\n${rows.join("\n")}`);
}
console.log(`\n${failures === 0 ? "All pairs pass WCAG AA." : `${failures} pair(s) below WCAG AA.`}`);
process.exit(failures ? 1 : 0);
