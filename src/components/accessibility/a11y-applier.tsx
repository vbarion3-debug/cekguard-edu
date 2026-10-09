"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";

export const A11Y_STORAGE_KEY = "cekguard-edu-state-v1";

/** Mirrors accessibility preferences onto <html> data attributes used by the design tokens. */
export function A11yApplier() {
  const a = useAppStore((s) => s.accessibility);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = a.theme;
    root.dataset.contrast = a.contrast;
    root.dataset.font = a.fontSize;
    root.dataset.reading = a.reading ? "on" : "off";
    root.dataset.keyboard = a.keyboard ? "on" : "off";
    root.dataset.simplified = a.simplified ? "on" : "off";
  }, [a]);
  return null;
}

/**
 * Inline script that applies stored preferences before first paint to avoid
 * a flash of the wrong theme or text size.
 */
export const a11yBootScript = `(function(){try{var s=JSON.parse(localStorage.getItem('${A11Y_STORAGE_KEY}')||'{}');var a=(s.state||{}).accessibility;if(!a)return;var r=document.documentElement;r.dataset.theme=a.theme;r.dataset.contrast=a.contrast;r.dataset.font=a.fontSize;r.dataset.reading=a.reading?'on':'off';r.dataset.keyboard=a.keyboard?'on':'off';}catch(e){}})();`;
