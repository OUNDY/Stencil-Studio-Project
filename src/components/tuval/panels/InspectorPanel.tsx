import { useTuval } from "../store/TuvalContext";

const PALETTE = [
  "#3d3530", "#c8714e", "#e8c56a", "#7a9e7e",
  "#d4847a", "#4a6789", "#e8dcc8", "#f5f0e8",
  "#1a1a1a", "#ffffff",
];

export function InspectorPanel() {
  const { state, dispatch } = useTuval();
  const sel = state.motifs.find(m => m.id === state.selectedId);
  const grid = state.gridMode;

  // No selection — show grid controls if active, else hint
  if (!sel) {
    return (
      <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
        <div>
          <h3 className="font-serif text-lg text-foreground">Özellikler</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Bir katman seç veya grid'i ayarla</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-3 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-foreground">Grid (tekrar deseni)</label>
            <button
              onClick={() => dispatch({ type: "SET_GRID", patch: { enabled: !grid.enabled } })}
              className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${grid.enabled ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${grid.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </div>

          {grid.enabled && (
            <>
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Yoğunluk</span><span className="tabular-nums">{grid.density}</span></div>
                <input type="range" min={3} max={20} value={grid.density} onChange={(e) => dispatch({ type: "SET_GRID", patch: { density: Number(e.target.value) } })} className="w-full accent-primary" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Opaklık</span><span className="tabular-nums">{Math.round(grid.opacity * 100)}%</span></div>
                <input type="range" min={0} max={1} step={0.01} value={grid.opacity} onChange={(e) => dispatch({ type: "SET_GRID", patch: { opacity: Number(e.target.value) } })} className="w-full accent-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1.5">Renk</div>
                <div className="flex flex-wrap gap-1.5">
                  {PALETTE.map(c => (
                    <button key={c} onClick={() => dispatch({ type: "SET_GRID", patch: { color: c } })}
                      className={`h-6 w-6 rounded-full border-2 ${grid.color === c ? "border-foreground scale-110" : "border-transparent"}`}
                      style={{ background: c }} aria-label={c} />
                  ))}
                  <input type="color" value={grid.color} onChange={(e) => dispatch({ type: "SET_GRID", patch: { color: e.target.value } })} className="h-6 w-6 rounded cursor-pointer p-0 border-0" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const update = (patch: Partial<typeof sel>) => dispatch({ type: "UPDATE_MOTIF", id: sel.id, patch });

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      <div>
        <h3 className="font-serif text-lg text-foreground truncate">{sel.name}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Seçili katman ayarları</p>
      </div>

      <div>
        <div className="text-xs text-muted-foreground mb-1.5">Renk</div>
        <div className="flex flex-wrap gap-1.5">
          {PALETTE.map(c => (
            <button key={c} onClick={() => update({ color: c })}
              className={`h-7 w-7 rounded-full border-2 transition-transform ${sel.color === c ? "border-foreground scale-110" : "border-transparent hover:border-border"}`}
              style={{ background: c }} aria-label={c} />
          ))}
          <input type="color" value={sel.color} onChange={(e) => update({ color: e.target.value })} className="h-7 w-7 rounded cursor-pointer p-0 border-0" />
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Boyut</span><span className="tabular-nums">{Math.round(sel.scale * 100)}%</span></div>
        <input type="range" min={0.05} max={1} step={0.01} value={sel.scale} onChange={(e) => update({ scale: Number(e.target.value) })} className="w-full accent-primary" />
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Döndürme</span><span className="tabular-nums">{sel.rotation}°</span></div>
        <input type="range" min={-180} max={180} step={1} value={sel.rotation} onChange={(e) => update({ rotation: Number(e.target.value) })} className="w-full accent-primary" />
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Opaklık</span><span className="tabular-nums">{Math.round(sel.opacity * 100)}%</span></div>
        <input type="range" min={0} max={1} step={0.01} value={sel.opacity} onChange={(e) => update({ opacity: Number(e.target.value) })} className="w-full accent-primary" />
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2">
        <button onClick={() => update({ x: 0.5, y: 0.5 })} className="text-xs px-2 py-1.5 rounded border border-border hover:border-primary/40">Ortala</button>
        <button onClick={() => update({ rotation: 0 })} className="text-xs px-2 py-1.5 rounded border border-border hover:border-primary/40">Açıyı sıfırla</button>
      </div>
    </div>
  );
}
