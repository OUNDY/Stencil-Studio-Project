import { Eye, EyeOff, Lock, LockOpen, Trash2, ChevronUp, ChevronDown, Copy } from "lucide-react";
import { useTuval } from "../store/TuvalContext";
import { cn } from "@/lib/utils";

export function LayersPanel() {
  const { state, dispatch } = useTuval();
  const ordered = [...state.motifs].slice().reverse(); // top of list = top z

  if (state.motifs.length === 0) {
    return (
      <div className="p-4">
        <h3 className="font-serif text-lg text-foreground">Katmanlar</h3>
        <p className="text-xs text-muted-foreground mt-2">Henüz katman yok. Bir motif ekle.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4 h-full overflow-hidden">
      <h3 className="font-serif text-lg text-foreground">Katmanlar</h3>
      <ul className="flex-1 overflow-y-auto space-y-1 -mr-2 pr-2">
        {ordered.map(m => {
          const sel = state.selectedId === m.id;
          return (
            <li
              key={m.id}
              onClick={() => dispatch({ type: "SELECT", id: m.id })}
              className={cn(
                "flex items-center gap-2 rounded-md border p-2 cursor-pointer transition-colors",
                sel ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
              )}
            >
              <div
                className="w-6 h-6 shrink-0 rounded bg-muted"
                style={{
                  backgroundColor: m.color,
                  WebkitMaskImage: `url(${m.imageUrl})`,
                  maskImage: `url(${m.imageUrl})`,
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                }}
              />
              <span className="flex-1 text-xs text-foreground truncate">{m.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); dispatch({ type: "REORDER", id: m.id, direction: "up" }); }}
                className="text-muted-foreground hover:text-foreground"
                title="Üste"
              ><ChevronUp className="h-3.5 w-3.5" /></button>
              <button
                onClick={(e) => { e.stopPropagation(); dispatch({ type: "REORDER", id: m.id, direction: "down" }); }}
                className="text-muted-foreground hover:text-foreground"
                title="Alta"
              ><ChevronDown className="h-3.5 w-3.5" /></button>
              <button
                onClick={(e) => { e.stopPropagation(); dispatch({ type: "UPDATE_MOTIF", id: m.id, patch: { visible: !m.visible } }); }}
                className="text-muted-foreground hover:text-foreground"
                title={m.visible ? "Gizle" : "Göster"}
              >{m.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}</button>
              <button
                onClick={(e) => { e.stopPropagation(); dispatch({ type: "UPDATE_MOTIF", id: m.id, patch: { locked: !m.locked } }); }}
                className="text-muted-foreground hover:text-foreground"
                title={m.locked ? "Kilidi aç" : "Kilitle"}
              >{m.locked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}</button>
              <button
                onClick={(e) => { e.stopPropagation(); dispatch({ type: "DUPLICATE_MOTIF", id: m.id, newId: `m-${Date.now()}` }); }}
                className="text-muted-foreground hover:text-foreground"
                title="Çoğalt"
              ><Copy className="h-3.5 w-3.5" /></button>
              <button
                onClick={(e) => { e.stopPropagation(); dispatch({ type: "REMOVE_MOTIF", id: m.id }); }}
                className="text-muted-foreground hover:text-destructive"
                title="Sil"
              ><Trash2 className="h-3.5 w-3.5" /></button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
