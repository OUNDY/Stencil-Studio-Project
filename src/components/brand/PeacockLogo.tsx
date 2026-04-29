import { cn } from "@/lib/utils";
import emblemUrl from "@/assets/peacock-emblem.png";

interface PeacockLogoProps {
  className?: string;
  title?: string;
}

/**
 * Stencil Studio peacock emblem.
 *
 * Uses the original peacock silhouette as a CSS mask so the shape stays
 * identical to the brand reference, while the color is driven by the
 * current text color (e.g. `text-primary`, `text-foreground`) — keeping
 * it in sync with the active theme and dark mode.
 */
export const PeacockLogo = ({ className, title = "Stencil Studio" }: PeacockLogoProps) => (
  <span
    role="img"
    aria-label={title}
    title={title}
    className={cn("inline-block bg-current align-middle", className)}
    style={{
      WebkitMaskImage: `url(${emblemUrl})`,
      maskImage: `url(${emblemUrl})`,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      WebkitMaskSize: "contain",
      maskSize: "contain",
    }}
  />
);

export default PeacockLogo;
