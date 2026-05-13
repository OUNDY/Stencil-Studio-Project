import { useTuval } from "../store/TuvalContext";
import type { PaintZone } from "../store/types";
import { Plus, Trash2, Copy, Eye, EyeOff, Frame } from "lucide-react";
import { cn } from "@/lib/utils";

function makeRectZone(name: string): PaintZone {
  return {
    id: `z-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    corners: [
      { x: 0.25, y: 0.25 },
      { x: 0.75, y: 0.25 },
      { x: 0.75, y: 0.75 },
      { x: 0.25, y: 0.75 },
    ],
    fillColor: null,
    fillOpacity: 0.6,
    useGrid: false,
    visible: true,
  };
}

export function ZonesPanel() {
  const { state, dispatch } = useTuval();

  const add = () => {
    const idx = state.zones.length + 1;
    dispatch({ type: "ADD_ZONE", zone: makeRectZone(`Alan ${idx}`) });
  };

  return (
    <div className="flex flex-col gap-3 p-4 h-full overflow-y-auto">
      <div>
        <h3 className="font-serif text-lg text-foreground">Boyama Alanları</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Tuvalde 4 köşeli bölgeler tanımla. Köşeleri sürükleyerek perspektif ver, içine motif/grid uygula.
        </p>
      </div>

      <button
        onClick={add}
        className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-dashed border-primary/40 text-primary hover:bg-primary/5 transition"
      >
        <Plus className="h-4 w-4" /> Alan Ekle
      </button>

      {state.zones.length === 0 && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground text-center">
          <Frame className="h-6 w-6 mx-auto mb-2 opacity-50" />
          Henüz alan yok. Ekle butonuna basıp ilk bölgeni çiz.
        </div>
      )}

      <ul className="space-y-1.5">
        {state.zones.map(z => {
          const sel = state.selectedZoneId === z.id;
          return (
            <li
              key={z.id}
              className={cn(
                "group rounded-lg border bg-card transition-colors",
                sel ? "border-primary" : "border-border hover:border-primary/40"
              )}
            >
              <button
                onClick={() => dispatch({ type: "SELECT_ZONE", id: z.id })}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-left"
              >
                <Frame className={cn("h-4 w-4", sel ? "text-primary" : "text-muted-foreground")} />
                <span className="flex-1 text-xs truncate">{z.name}</span>
              </button>
              <div className="flex items-center justify-end gap-0.5 px-1 pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  title={z.visible ? "Gizle" : "Göster"}
                  onClick={() => dispatch({ type: "UPDATE_ZONE", id: z.id, patch: { visible: !z.visible } })}
                  className="p-1 rounded hover:bg-muted"
                >
                  {z.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
                <button
                  title="Kopyala"
                  onClick={() => dispatch({ type: "DUPLICATE_ZONE", id: z.id, newId: `z-${Date.now()}` })}
                  className="p-1 rounded hover:bg-muted"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  title="Sil"
                  onClick={() => dispatch({ type: "REMOVE_ZONE", id: z.id })}
                  className="p-1 rounded hover:bg-destructive/10 text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
