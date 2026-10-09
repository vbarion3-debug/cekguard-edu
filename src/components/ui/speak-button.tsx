"use client";

import { Square, Volume2 } from "lucide-react";
import { useSpeechStore, useSpeechSupported } from "@/hooks/use-speech";
import { cn } from "@/lib/utils/cn";
import { useAppStore } from "@/store/app-store";

/** Reads a passage aloud. Hidden when TTS is disabled in Accessibility settings. */
export function SpeakButton({ id, text, className, label = "Dengarkan" }: { id: string; text: string; className?: string; label?: string }) {
  const enabled = useAppStore((s) => s.accessibility.tts);
  const supported = useSpeechSupported();
  const speakingId = useSpeechStore((s) => s.speakingId);
  const speak = useSpeechStore((s) => s.speak);
  const stop = useSpeechStore((s) => s.stop);
  if (!enabled || !supported) return null;
  const speaking = speakingId === id;

  return (
    <button
      type="button"
      onClick={() => (speaking ? stop() : speak(id, text))}
      aria-pressed={speaking}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg border-(length:--border-w) border-border bg-surface px-2.5 text-xs font-semibold text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg",
        speaking && "border-primary bg-primary-soft text-primary",
        className,
      )}
    >
      {speaking ? <Square className="h-3.5 w-3.5" aria-hidden /> : <Volume2 className="h-3.5 w-3.5" aria-hidden />}
      {speaking ? "Berhenti" : label}
    </button>
  );
}
