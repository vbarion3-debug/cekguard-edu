"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "./button";

/**
 * Modal built on the native <dialog> element: focus is trapped and Escape
 * closes it, with focus restored to the trigger by the browser.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-[min(100%-2rem,36rem)] rounded-2xl border-(length:--border-w) border-border bg-surface p-0 text-fg shadow-pop backdrop:bg-black/50 open:animate-pop",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border p-5">
        <div>
          <h2 id={titleId} className="text-lg font-bold">
            {title}
          </h2>
          {description && (
            <p id={descId} className="mt-1 text-sm text-fg-muted">
              {description}
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Tutup dialog">
          <X className="h-5 w-5" aria-hidden />
        </Button>
      </div>
      <div className="max-h-[65vh] overflow-y-auto p-5">{children}</div>
      {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-border p-4">{footer}</div>}
    </dialog>
  );
}
