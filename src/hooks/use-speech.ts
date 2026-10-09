"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";

/**
 * Text-to-speech via the browser's Web Speech API (Indonesian voice when
 * available). A shared store ensures only one passage is read at a time and
 * every button reflects the current state.
 */
interface SpeechState {
  speakingId: string | null;
  speak: (id: string, text: string) => void;
  stop: () => void;
}

const available = () => typeof window !== "undefined" && "speechSynthesis" in window;

export const useSpeechStore = create<SpeechState>((set, get) => ({
  speakingId: null,
  stop: () => {
    if (available()) window.speechSynthesis.cancel();
    set({ speakingId: null });
  },
  speak: (id, text) => {
    if (!available()) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text.replace(/\*\*/g, "").replace(/•/g, ""));
    utter.lang = "id-ID";
    utter.rate = 0.95;
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith("id"));
    if (voice) utter.voice = voice;
    utter.onend = () => {
      if (get().speakingId === id) set({ speakingId: null });
    };
    utter.onerror = () => set({ speakingId: null });
    set({ speakingId: id });
    window.speechSynthesis.speak(utter);
  },
}));

export function useSpeechSupported() {
  const [supported, setSupported] = useState(false);
  useEffect(() => setSupported(available()), []);
  return supported;
}
