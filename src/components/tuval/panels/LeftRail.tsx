import { Sparkles, ShoppingBag, Layers, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type RailTab = "motif" | "urun" | "zemin" | "katman";

const ITEMS: { id: RailTab; label: string; icon: typeof Sparkles }[] = [
  { id: "motif", label: "Motif", icon: Sparkles },
  { id: "urun", label: "Ürün", icon: ShoppingBag },
  { id: "zemin", label: "Zemin", icon: ImageIcon },
  { id: "katman", label: "Katman", icon: Layers },
];

export function LeftRail({ active, onChange }: { active: RailTab; onChange: (t: RailTab) => void }) {
  return (
    <nav className="flex md:flex-col gap-1 p-2 border-r border-border bg-card/50 shrink-0">
      {ITEMS.map(item => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-lg transition-all",
              isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            title={item.label}
          >
            <Icon className="h-4 w-4" />
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
