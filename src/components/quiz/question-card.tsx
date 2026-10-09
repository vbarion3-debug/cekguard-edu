"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/ui/speak-button";
import { cn } from "@/lib/utils/cn";

export interface QuestionLike {
  id?: string;
  prompt: string;
  scenario?: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
}

/**
 * Interactive question: native radio inputs (keyboard + screen-reader
 * friendly), explicit "Jawab" submit, and feedback that uses icons + text,
 * not color alone.
 */
export function QuestionCard({
  question,
  onAnswered,
  after,
  heading,
}: {
  question: QuestionLike;
  onAnswered?: (correct: boolean, selectedId: string) => void;
  /** Rendered after the learner submits (e.g. "Lanjut" button). */
  after?: ReactNode;
  heading?: ReactNode;
}) {
  const name = useId();
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const correct = submitted && selected === question.correctId;
  const letters = "ABCDEFG";

  return (
    <div>
      {heading}
      {question.scenario && (
        <div className="reading mb-4 rounded-2xl border-l-4 border-primary bg-primary-soft/60 p-4 text-fg">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-primary">Skenario</p>
          {question.scenario}
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <p id={`${name}-q`} className="reading text-lg font-bold text-fg">
          {question.prompt}
        </p>
        <SpeakButton
          id={`q-${question.id ?? question.prompt}`}
          text={`${question.scenario ?? ""} ${question.prompt} ${question.options.map((o, i) => `Pilihan ${letters[i]}. ${o.text}`).join(". ")}`}
        />
      </div>

      <fieldset className="mt-4" disabled={submitted}>
        <legend className="sr-only">{question.prompt}</legend>
        <div className="space-y-2.5">
          {question.options.map((o, i) => {
            const isSelected = selected === o.id;
            const isCorrect = o.id === question.correctId;
            const state = !submitted ? (isSelected ? "selected" : "idle") : isCorrect ? "correct" : isSelected ? "wrong" : "dim";
            return (
              <label
                key={o.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border-(length:--border-w) p-3.5 transition-all has-[:focus-visible]:ring-[length:var(--focus-w)] has-[:focus-visible]:ring-ring",
                  state === "idle" && "border-border bg-surface hover:border-border-strong hover:bg-surface-2",
                  state === "selected" && "border-primary bg-primary-soft ring-2 ring-primary/30",
                  state === "correct" && "border-success bg-success-soft animate-pop",
                  state === "wrong" && "border-danger bg-danger-soft",
                  state === "dim" && "border-border opacity-60",
                  submitted && "cursor-default",
                )}
              >
                <input
                  type="radio"
                  name={name}
                  value={o.id}
                  checked={isSelected}
                  onChange={() => setSelected(o.id)}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold",
                    state === "selected" ? "bg-primary text-on-primary" : state === "correct" ? "bg-success text-white" : state === "wrong" ? "bg-danger text-white" : "bg-surface-2 text-fg-muted",
                  )}
                >
                  {letters[i]}
                </span>
                <span className="reading flex-1 text-fg">{o.text}</span>
                {state === "correct" && (
                  <span className="flex items-center gap-1 text-sm font-semibold text-success">
                    <CheckCircle2 className="h-5 w-5" aria-hidden /> Jawaban benar
                  </span>
                )}
                {state === "wrong" && (
                  <span className="flex items-center gap-1 text-sm font-semibold text-danger">
                    <XCircle className="h-5 w-5" aria-hidden /> Pilihanmu
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>

      {!submitted ? (
        <Button
          className="mt-5"
          size="lg"
          disabled={!selected}
          onClick={() => {
            if (!selected) return;
            setSubmitted(true);
            onAnswered?.(selected === question.correctId, selected);
          }}
        >
          Jawab
        </Button>
      ) : (
        <div
          role="status"
          className={cn(
            "mt-5 animate-fade-up rounded-2xl border-(length:--border-w) p-4",
            correct ? "border-success/40 bg-success-soft" : "border-warning/40 bg-warning-soft",
          )}
        >
          <p className={cn("flex items-center gap-2 text-lg font-bold", correct ? "text-success" : "text-warning")}>
            {correct ? <CheckCircle2 className="h-6 w-6" aria-hidden /> : <XCircle className="h-6 w-6" aria-hidden />}
            {correct ? "Benar!" : "Kurang tepat"}
          </p>
          <p className="reading mt-1 text-fg">{question.explanation}</p>
          {after && <div className="mt-4">{after}</div>}
        </div>
      )}
    </div>
  );
}
