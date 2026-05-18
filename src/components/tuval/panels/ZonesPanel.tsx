import { useTuval } from "../store/TuvalContext";
import type { PaintZone } from "../store/types";
import { Plus, Trash2, Copy, Eye, EyeOff, Frame, Magnet, RectangleHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSnap, snapStore } from "../store/snapStore";
import { toast } from "sonner";

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

function makePerspZone(name: string): PaintZone {
  // Trapezoid that hints at perspective receding to the top
  return {
    ...makeRectZone(name),
    corners: [
      { x: 0.30, y: 0.30 },
      { x: 0.70, y: 0.30 },
      { x: 0.80, y: 0.78 },
      { x: 0.20, y: 0.78 },
    ],
  };
}

export function ZonesPanel() {
  const { state, dispatch } = useTuval();
  const snap = useSnap();

  const add = (preset: "rect" | "persp") => {
    const idx = state.zones.length + 1;
    const z = preset === "persp" ? makePerspZone(`Perspektif ${idx}`) : makeRectZone(`Alan ${idx}`);
    dispatch({ type: "ADD_ZONE", zone: z });
    toast.success(`${z.name} eklendi`, { description: "Köşeleri sürükleyerek perspektif ver." });
  };

  const duplicate = (id: string) => {
    dispatch({ type: "DUPLICATE_ZONE", id, newId: `z-${Date.now()}-${Math.random().toString(36).slice(2, 5)}` });
  };

  const remove = (z: PaintZone) => {
    const motifCount = state.motifs.filter(m => m.zoneId === z.id).length;
    const msg = motifCount > 0
      ? `${z.name} silinsin mi? ${motifCount} motif serbest moda dönecek.`
      : `${z.name} silinsin mi?`;
    if (!confirm(msg)) return;
    dispatch({ type: "REMOVE_ZONE", id: z.id });
  };

  return (
    <div className="flex flex-col gap-3 p-4 h-full overflow-y-auto">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg text-foreground">Boyama Alanları</h3>
          <span className="text-[10px] text-muted-foreground tabular-nums">{state.zones.length}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          4 köşeli bölgeler tanımla. Köşeleri sürükleyerek perspektif ver, içine motif veya grid uygula.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => add("rect")}
          className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-lg border border-dashed border-primary/40 text-primary hover:bg-primary/5 transition text-xs"
        >
          <RectangleHorizontal className="h-4 w-4" />
          Dikdörtgen
        </button>
        <button
          onClick={() => add("persp")}
          className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-lg border border-dashed border-primary/40 text-primary hover:bg-primary/5 transition text-xs"
        >
          <Frame className="h-4 w-4" />
          Perspektif
        </button>
      </div>

      <button
        onClick={() => snapStore.set(!snap)}
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs transition",
          snap ? "border-primary/40 bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/40"
        )}
        title="Köşe yapışma (Shift ile geçici tersle)"
      >
        <span className="flex items-center gap-2">
          <Magnet className="h-3.5 w-3.5" />
          Snap & hizalama
        </span>
        <span className={cn("h-1.5 w-1.5 rounded-full", snap ? "bg-primary" : "bg-muted-foreground/40")} />
      </button>

      {state.zones.length === 0 && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground text-center">
          <Frame className="h-6 w-6 mx-auto mb-2 opacity-50" />
          Henüz alan yok. Yukarıdan ilk bölgeni ekle.
        </div>
      )}

      <ul className="space-y-1.5">
        {state.zones.map(z => {
          const sel = state.selectedZoneId === z.id;
          const motifCount = state.motifs.filter(m => m.zoneId === z.id).length;
          return (
            <li
              key={z.id}
              className={cn(
                "rounded-lg border bg-card transition-colors",
                sel ? "border-primary" : "border-border hover:border-primary/40"
              )}
            >
              <button
                onClick={() => dispatch({ type: "SELECT_ZONE", id: z.id })}
                className="flex items-center gap-2 w-full px-2 pt-2 pb-1 text-left"
              >
                <Frame className={cn("h-4 w-4 shrink-0", sel ? "text-primary" : "text-muted-foreground")} />
                <span className="flex-1 text-xs truncate">{z.name}</span>
                {motifCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground tabular-nums">
                    {motifCount}
                  </span>
                )}
              </button>
              <div className="flex items-center justify-end gap-0.5 px-1 pb-1">
                <button
                  title={z.visible ? "Gizle" : "Göster"}
                  onClick={() => dispatch({ type: "UPDATE_ZONE", id: z.id, patch: { visible: !z.visible } })}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  {z.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
                <button
                  title="Kopyala"
                  onClick={() => duplicate(z.id)}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  title="Sil"
                  onClick={() => remove(z)}
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
