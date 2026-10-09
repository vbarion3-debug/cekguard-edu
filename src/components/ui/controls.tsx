"use client";

import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/** Accessible on/off switch (role="switch"). */
export function Switch({
  checked,
  onChange,
  label,
  description,
  icon,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  icon?: ReactNode;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-fg-muted" aria-hidden>
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <label htmlFor={id} className="block cursor-pointer font-semibold text-fg">
            {label}
          </label>
          {description && (
            <p id={`${id}-desc`} className="text-sm text-fg-muted">
              {description}
            </p>
          )}
        </div>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? `${id}-desc` : undefined}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-(length:--border-w) transition-colors",
          checked ? "border-primary bg-primary" : "border-border-strong bg-surface-2",
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform [[data-contrast=high]_&]:outline [[data-contrast=high]_&]:outline-1 [[data-contrast=high]_&]:outline-black",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
        <span className="sr-only">{checked ? "Aktif" : "Nonaktif"}</span>
      </button>
    </div>
  );
}

/** Segmented control implemented as an ARIA radiogroup with arrow-key support. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; description?: string }[];
  label: string;
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: KeyboardEvent, i: number) {
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % options.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + options.length) % options.length;
    if (next >= 0) {
      e.preventDefault();
      onChange(options[next].value);
      refs.current[next]?.focus();
    }
  }

  return (
    <div role="radiogroup" aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {options.map((o, i) => {
        const checked = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "min-h-11 flex-1 rounded-xl border-(length:--border-w) px-4 py-2 text-left text-sm font-semibold transition-colors sm:flex-none",
              checked
                ? "border-primary bg-primary-soft text-primary ring-2 ring-primary/30"
                : "border-border-strong bg-surface text-fg hover:bg-surface-2",
            )}
          >
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className={cn(
                  "grid h-4 w-4 place-items-center rounded-full border-2",
                  checked ? "border-primary" : "border-border-strong",
                )}
              >
                {checked && <span className="h-2 w-2 rounded-full bg-primary" />}
              </span>
              {o.label}
            </span>
            {o.description && <span className="mt-0.5 block text-xs font-normal text-fg-muted">{o.description}</span>}
          </button>
        );
      })}
    </div>
  );
}
