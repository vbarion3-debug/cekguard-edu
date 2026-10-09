import { Fragment } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Safe renderer for the tiny markup used by explanations and the tutor:
 * **bold** and lines starting with "• ". Text is never injected as HTML.
 */
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-fg">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className={cn("reading space-y-3", className)}>
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        const bullets = lines.filter((l) => l.trim().startsWith("•"));
        const head = lines.filter((l) => !l.trim().startsWith("•"));
        return (
          <div key={bi}>
            {head.length > 0 && <p>{inline(head.join(" "))}</p>}
            {bullets.length > 0 && (
              <ul className="mt-1.5 space-y-1.5">
                {bullets.map((b, li) => (
                  <li key={li} className="flex gap-2">
                    <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{inline(b.replace(/^\s*•\s*/, ""))}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
