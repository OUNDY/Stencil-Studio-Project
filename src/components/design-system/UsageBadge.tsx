import { useState } from "react";
import { Globe } from "lucide-react";

interface UsageBadgeProps {
  count: number;
  pages: string[];
}

/**
 * Shows how many pages use a component, with a hover tooltip listing the routes.
 */
export function UsageBadge({ count, pages }: UsageBadgeProps) {
  const [open, setOpen] = useState(false);

  if (count === 0) {
    return (
      <span className="flex items-center gap-1 text-[10px] text-muted-foreground/40 italic">
        unused
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium hover:bg-primary/20 transition-colors"
      >
        <Globe className="w-2.5 h-2.5" />
        {count} page{count !== 1 ? "s" : ""}
      </button>

      {open && pages.length > 0 && (
        <div className="absolute bottom-full left-0 mb-1.5 z-50 w-48 bg-popover border border-border rounded-xl shadow-organic-elevated text-xs overflow-hidden">
          <div className="px-3 py-2 border-b border-border">
            <p className="font-medium text-foreground">Used on</p>
          </div>
          <ul className="py-1.5 max-h-36 overflow-y-auto">
            {pages.map((p) => (
              <li key={p} className="px-3 py-1 font-mono text-[10px] text-muted-foreground hover:bg-accent/50">
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
