"use client";

import { AlertTriangle, CheckCircle2, Eye, Flag, MousePointerClick, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { QuestionCard } from "@/components/quiz/question-card";
import { Badge } from "@/components/ui/badge";
import { RichText } from "@/components/ui/rich-text";
import { SpeakButton } from "@/components/ui/speak-button";
import { cn } from "@/lib/utils/cn";
import type { LearningLevel, LessonStep } from "@/types";

type StepOf<T extends LessonStep["type"]> = Extract<LessonStep, { type: T }>;

export function stepSpeechText(step: LessonStep, level: LearningLevel): string {
  switch (step.type) {
    case "concept":
      return `${step.title}. ${step.body[level]} ${step.keyPoints.join(". ")}`;
    case "example":
      return `${step.title}. ${step.segments.map((s) => s.text).join("")}`;
    case "danger":
      return `${step.title}. ${step.points.map((p) => `${p.title}. ${p.body}`).join(" ")}`;
    case "recognize":
      return `${step.title}. ${step.indicators.map((i) => `${i.label}. ${i.hint}`).join(" ")}`;
    case "action":
      return `${step.title}. ${step.steps.map((s) => `${s.title}. ${s.body}`).join(" ")}`;
    case "quiz":
      return step.title;
  }
}

function ConceptStep({ step, level }: { step: StepOf<"concept">; level: LearningLevel }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-primary-soft/60 p-5 [[data-contrast=high]_&]:border-2">
        <RichText text={step.body[level]} className="text-lg text-fg" />
      </div>
      <div>
        <h3 className="mb-3 font-bold text-fg">Poin penting</h3>
        <ul className="grid gap-3 sm:grid-cols-3">
          {step.keyPoints.map((k, i) => (
            <li key={k} className="rounded-xl border border-border p-4">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-sm font-bold text-on-primary" aria-hidden>
                {i + 1}
              </span>
              <p className="reading mt-2 font-semibold text-fg">{k}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Interactive "spot the red flag" example. */
function ExampleStep({ step }: { step: StepOf<"example"> }) {
  const flags = step.segments.map((s, i) => ({ ...s, i })).filter((s) => s.flag);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const all = revealed.length === flags.length;

  return (
    <div className="space-y-4">
      <p className="flex items-center gap-2 text-fg-muted">
        <MousePointerClick className="h-5 w-5 text-primary" aria-hidden /> {step.intro}
      </p>
      <figure className="rounded-2xl border border-border bg-surface-2 p-5">
        <figcaption className="mb-3 text-xs font-semibold uppercase tracking-wide text-fg-muted">{step.source}</figcaption>
        <p className="reading text-lg leading-loose text-fg" aria-label={step.altText}>
          {step.segments.map((s, i) =>
            s.flag ? (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setActive(i);
                  setRevealed((r) => (r.includes(i) ? r : [...r, i]));
                }}
                aria-pressed={active === i}
                aria-label={`Tanda bahaya: ${s.text}`}
                className={cn(
                  "rounded-md px-1 py-0.5 font-semibold underline decoration-2 underline-offset-4 transition-colors",
                  revealed.includes(i)
                    ? "bg-danger-soft text-danger decoration-danger"
                    : "bg-warning-soft text-fg decoration-warning decoration-dashed hover:bg-warning/20",
                  active === i && "ring-2 ring-danger",
                )}
              >
                {s.text}
              </button>
            ) : (
              <span key={i}>{s.text}</span>
            ),
          )}
        </p>
      </figure>
      <p className="text-sm font-semibold text-fg-muted" aria-live="polite">
        Tanda bahaya ditemukan: {revealed.length} / {flags.length}
        {all && " — hebat, semua sudah ditemukan!"}
      </p>
      {active !== null && (
        <div className="flex animate-fade-up items-start gap-3 rounded-2xl border border-danger/30 bg-danger-soft p-4" role="status">
          <Flag className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden />
          <div>
            <p className="font-semibold text-fg">“{step.segments[active].text.trim()}”</p>
            <p className="reading text-fg">{step.segments[active].flag}</p>
          </div>
        </div>
      )}
      {all && (
        <ul className="space-y-2">
          {flags.map((f) => (
            <li key={f.i} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
              <span>
                <strong className="text-fg">{f.text.trim()}</strong> <span className="text-fg-muted">— {f.flag}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DangerStep({ step }: { step: StepOf<"danger"> }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {step.points.map((p) => (
        <li key={p.title} className="rounded-2xl border border-danger/25 bg-danger-soft/60 p-5 [[data-contrast=high]_&]:border-2">
          <AlertTriangle className="h-6 w-6 text-danger" aria-hidden />
          <p className="mt-2 font-bold text-fg">{p.title}</p>
          <p className="reading mt-1 text-fg-muted">{p.body}</p>
        </li>
      ))}
    </ul>
  );
}

/** Self-check: learner ticks off indicators they understand. */
function RecognizeStep({ step }: { step: StepOf<"recognize"> }) {
  const [checked, setChecked] = useState<string[]>([]);
  return (
    <div className="space-y-4">
      <p className="flex items-center gap-2 text-fg-muted">
        <Search className="h-5 w-5 text-primary" aria-hidden /> Centang setiap ciri yang sudah kamu pahami.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {step.indicators.map((ind) => {
          const on = checked.includes(ind.label);
          return (
            <li key={ind.label}>
              <label
                className={cn(
                  "flex h-full cursor-pointer items-start gap-3 rounded-2xl border-(length:--border-w) p-4 transition-colors has-[:focus-visible]:ring-[length:var(--focus-w)] has-[:focus-visible]:ring-ring",
                  on ? "border-success bg-success-soft" : "border-border hover:bg-surface-2",
                )}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => setChecked((c) => (on ? c.filter((x) => x !== ind.label) : [...c, ind.label]))}
                  className="mt-1 h-5 w-5 shrink-0 accent-[var(--success)]"
                />
                <span>
                  <span className="flex items-center gap-1.5 font-bold text-fg">
                    <Eye className="h-4 w-4 text-primary" aria-hidden /> {ind.label}
                  </span>
                  <span className="reading mt-0.5 block text-sm text-fg-muted">{ind.hint}</span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      <Badge tone={checked.length === step.indicators.length ? "success" : "neutral"} aria-live="polite">
        {checked.length} / {step.indicators.length} ciri dipahami
      </Badge>
    </div>
  );
}

function ActionStep({ step }: { step: StepOf<"action"> }) {
  return (
    <ol className="space-y-3">
      {step.steps.map((s, i) => (
        <li key={s.title} className="flex items-start gap-4 rounded-2xl border border-border p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-success text-white font-bold" aria-hidden>
            {i + 1}
          </span>
          <div>
            <p className="flex items-center gap-1.5 font-bold text-fg">
              <ShieldCheck className="h-4 w-4 text-success" aria-hidden /> {s.title}
            </p>
            <p className="reading mt-0.5 text-fg-muted">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function QuizStep({ step, onAllAnswered }: { step: StepOf<"quiz">; onAllAnswered: () => void }) {
  const [answered, setAnswered] = useState(0);
  return (
    <div className="space-y-8">
      {step.questions.map((q, i) => (
        <QuestionCard
          key={q.prompt}
          question={q}
          heading={step.questions.length > 1 ? <p className="mb-2 text-sm font-semibold text-fg-muted">Soal {i + 1}</p> : undefined}
          onAnswered={() => {
            const n = answered + 1;
            setAnswered(n);
            if (n >= step.questions.length) onAllAnswered();
          }}
        />
      ))}
    </div>
  );
}

export function LessonStepView({
  step,
  level,
  stepKey,
  onQuizDone,
}: {
  step: LessonStep;
  level: LearningLevel;
  stepKey: string;
  onQuizDone: () => void;
}) {
  return (
    <section aria-labelledby={`${stepKey}-title`} className="animate-fade-up">
      <div className="mb-5 flex items-start justify-between gap-3">
        <h2 id={`${stepKey}-title`} className="text-xl font-extrabold text-fg sm:text-2xl">
          {step.title}
        </h2>
        {step.type !== "quiz" && <SpeakButton id={stepKey} text={stepSpeechText(step, level)} />}
      </div>
      {step.type === "concept" && <ConceptStep step={step} level={level} />}
      {step.type === "example" && <ExampleStep step={step} />}
      {step.type === "danger" && <DangerStep step={step} />}
      {step.type === "recognize" && <RecognizeStep step={step} />}
      {step.type === "action" && <ActionStep step={step} />}
      {step.type === "quiz" && <QuizStep step={step} onAllAnswered={onQuizDone} />}
    </section>
  );
}
