"use client";

import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}

/**
 * Accessible tabs (WAI-ARIA tabs pattern): arrow keys move between tabs,
 * Home/End jump to first/last. Panels are rendered by the parent through
 * `panelId(tab)` so content can live anywhere.
 */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  label,
  className,
  size = "md",
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const baseId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const enabled = items.filter((i) => !i.disabled);

  function onKeyDown(e: KeyboardEvent) {
    const idx = enabled.findIndex((i) => i.id === value);
    let next = -1;
    if (e.key === "ArrowRight") next = (idx + 1) % enabled.length;
    if (e.key === "ArrowLeft") next = (idx - 1 + enabled.length) % enabled.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = enabled.length - 1;
    if (next >= 0) {
      e.preventDefault();
      const target = enabled[next];
      onChange(target.id);
      refs.current[items.indexOf(target)]?.focus();
    }
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        "flex w-full gap-1 overflow-x-auto rounded-xl border-(length:--border-w) border-border bg-surface-2 p-1 [scrollbar-width:none]",
        className,
      )}
    >
      {items.map((item, i) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`${baseId}-tab-${item.id}`}
            role="tab"
            type="button"
            aria-selected={selected}
            // Only the active panel is rendered, so only the selected tab references it.
            aria-controls={selected ? tabPanelId(item.id) : undefined}
            tabIndex={selected ? 0 : -1}
            disabled={item.disabled}
            onClick={() => onChange(item.id)}
            className={cn(
              "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-semibold transition-colors",
              size === "sm" ? "h-8 px-3 text-xs" : "h-10 flex-1 px-3 text-sm",
              selected
                ? "bg-surface text-primary shadow-sm [[data-contrast=high]_&]:outline [[data-contrast=high]_&]:outline-2"
                : "text-fg-muted hover:text-fg",
              item.disabled && "opacity-50",
            )}
          >
            {item.icon}
            {item.label}
            {item.badge}
          </button>
        );
      })}
    </div>
  );
}

export function tabPanelId(id: string) {
  return `tabpanel-${id}`;
}
