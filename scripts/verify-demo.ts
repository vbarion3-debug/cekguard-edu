/**
 * Verifies that the demo dataset produces the numbers used across the app.
 * Run: npx tsx scripts/verify-demo.ts
 */
import { DEMO_COMMENTS } from "../src/data/demo/comments";
import { analyzeLinkStructure } from "../src/services/ai/heuristics/link";
import { MockAIService } from "../src/services/ai/mock-ai-service";
import type { JudolDetails } from "../src/types";

async function main() {
  const ai = new MockAIService();
  const r = await ai.analyzeCommentThread({
    url: "https://youtube.com/watch?v=demo",
    platform: "YouTube",
    title: "demo",
    comments: DEMO_COMMENTS,
    isDemoSource: true,
  });
  const d = r.details as JudolDetails;
  const actual = { total: d.totalComments, flagged: d.flagged, normal: d.normal, domains: d.domains.length, score: r.riskScore };
  const expected = { total: 120, flagged: 37, normal: 83, domains: 6, score: 82 };
  console.log("CekJudol", actual);

  const link = analyzeLinkStructure(new URL("http://bank-nusantara-login-security.demo-example.com/verifikasi?akun=blokir"));
  console.log("CekLink demo score", link.score);

  const ok = (Object.keys(expected) as (keyof typeof expected)[]).every((k) => actual[k] === expected[k]);
  if (!ok) {
    console.error("Mismatch! expected", expected);
    process.exit(1);
  }
  console.log("Demo data OK");
}

main();
