import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface TokenSwatchProps {
  varName: string;
  label:   string;
  size?:   "sm" | "md" | "lg";
}

/**
 * Renders a live color swatch for a CSS custom property.
 * Reads the resolved value via getComputedStyle so it reflects runtime theme changes.
 */
export function TokenSwatch({ varName, label, size = "md" }: TokenSwatchProps) {
  const [copied, setCopied] = useState(false);

  // Read live resolved value
  const resolved = typeof window !== "undefined"
    ? getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
    : "";

  const hslValue = resolved ? `hsl(${resolved})` : "transparent";

  const copy = () => {
    navigator.clipboard.writeText(`hsl(var(${varName}))`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const swatchSize = { sm: "w-8 h-8", md: "w-12 h-12", lg: "w-16 h-16" }[size];
  const textSize   = { sm: "text-[9px]", md: "text-[10px]", lg: "text-xs" }[size];

  return (
    <div className="flex flex-col items-center gap-1.5 group">
      {/* Color circle */}
      <button
        onClick={copy}
        title={`Copy ${varName}`}
        className={`${swatchSize} rounded-full border-2 border-white shadow-sm relative overflow-hidden transition-transform hover:scale-105`}
        style={{ background: hslValue }}
      >
        {copied && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
            <Check className="w-3 h-3 text-white" />
          </span>
        )}
        {!copied && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors rounded-full">
            <Copy className="w-3 h-3 text-white/0 group-hover:text-white/70 transition-colors" />
          </span>
        )}
      </button>

      {/* Label */}
      <div className="text-center">
        <p className={`${textSize} font-medium text-foreground leading-none`}>{label}</p>
        <p className={`${textSize} text-muted-foreground/60 font-mono mt-0.5 leading-none`}>
          {resolved || "—"}
        </p>
      </div>
    </div>
  );
}
