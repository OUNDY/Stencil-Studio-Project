import { useTuval } from "../store/TuvalContext";
import type { PaintZone, MotifInstance } from "../store/types";

const PALETTE = [
  "#3d3530", "#c8714e", "#e8c56a", "#7a9e7e",
  "#d4847a", "#4a6789", "#e8dcc8", "#f5f0e8",
  "#1a1a1a", "#ffffff",
];

function ZoneInspector({ zone }: { zone: PaintZone }) {
  const { state, dispatch } = useTuval();
  const update = (patch: Partial<PaintZone>) => dispatch({ type: "UPDATE_ZONE", id: zone.id, patch });

  const resetRect = () => dispatch({
    type: "UPDATE_ZONE", id: zone.id, patch: {
      corners: [
        { x: 0.25, y: 0.25 },
        { x: 0.75, y: 0.25 },
        { x: 0.75, y: 0.75 },
        { x: 0.25, y: 0.75 },
      ],
    },
  });

  const fillEnabled = zone.fillColor !== null;
  const motifsHere = state.motifs.filter(m => m.zoneId === zone.id);

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      <div>
        <input
          value={zone.name}
          onChange={(e) => update({ name: e.target.value })}
          className="w-full bg-transparent font-serif text-lg text-foreground border-b border-transparent focus:border-border focus:outline-none px-0"
        />
        <p className="text-xs text-muted-foreground mt-0.5">Boyama alanı — köşeleri sürükle</p>
      </div>

      {/* Fill */}
      <div className="rounded-lg border border-border bg-card p-3 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-foreground">Düz boya</label>
          <button
            onClick={() => update({ fillColor: fillEnabled ? null : "#c8714e" })}
            className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${fillEnabled ? "bg-primary" : "bg-muted"}`}
          >
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${fillEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
        </div>
        {fillEnabled && (
          <>
            <div className="flex flex-wrap gap-1.5">
              {PALETTE.map(c => (
                <button key={c} onClick={() => update({ fillColor: c })}
                  className={`h-6 w-6 rounded-full border-2 ${zone.fillColor === c ? "border-foreground scale-110" : "border-transparent"}`}
                  style={{ background: c }} aria-label={c} />
              ))}
              <input type="color" value={zone.fillColor ?? "#c8714e"} onChange={(e) => update({ fillColor: e.target.value })} className="h-6 w-6 rounded cursor-pointer p-0 border-0" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Opaklık</span><span className="tabular-nums">{Math.round(zone.fillOpacity * 100)}%</span></div>
              <input type="range" min={0} max={1} step={0.01} value={zone.fillOpacity} onChange={(e) => update({ fillOpacity: Number(e.target.value) })} className="w-full accent-primary" />
            </div>
          </>
        )}
      </div>

      {/* Grid clip */}
      <div className="rounded-lg border border-border bg-card p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-medium text-foreground">Grid'i bu alana clip'le</label>
            <p className="text-[10px] text-muted-foreground">Tekrar deseni yalnız bu bölgeye uygulanır</p>
          </div>
          <button
            onClick={() => update({ useGrid: !zone.useGrid })}
            className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${zone.useGrid ? "bg-primary" : "bg-muted"}`}
          >
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${zone.useGrid ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
        </div>
        {zone.useGrid && !state.gridMode.enabled && (
          <p className="text-[10px] text-amber-600">Grid modu kapalı — sol panelden bir motif seçip etkinleştir.</p>
        )}
        {zone.useGrid && state.gridMode.enabled && (() => {
          const o = zone.gridOverride ?? {};
          const density = o.density ?? state.gridMode.density;
          const opacity = o.opacity ?? state.gridMode.opacity;
          const color = o.color ?? state.gridMode.color;
          const setOverride = (patch: Partial<typeof o>) => update({ gridOverride: { ...o, ...patch } });
          return (
            <div className="pt-2 space-y-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-foreground">Alana özel grid</span>
                {zone.gridOverride && (
                  <button onClick={() => update({ gridOverride: undefined })} className="text-[10px] text-muted-foreground hover:text-foreground">global'e dön</button>
                )}
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1"><span className="text-muted-foreground">Yoğunluk</span><span className="tabular-nums">{density}</span></div>
                <input type="range" min={3} max={20} value={density} onChange={(e) => setOverride({ density: Number(e.target.value) })} className="w-full accent-primary" />
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1"><span className="text-muted-foreground">Opaklık</span><span className="tabular-nums">{Math.round(opacity * 100)}%</span></div>
                <input type="range" min={0} max={1} step={0.01} value={opacity} onChange={(e) => setOverride({ opacity: Number(e.target.value) })} className="w-full accent-primary" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Renk</span>
                <input type="color" value={color} onChange={(e) => setOverride({ color: e.target.value })} className="h-6 w-8 rounded cursor-pointer p-0 border-0" />
              </div>
            </div>
          );
        })()}
      </div>

      {/* Motifs assigned */}
      <div className="rounded-lg border border-border bg-card p-3 space-y-2">
        <div className="text-xs font-medium text-foreground">İçindeki motifler</div>
        {motifsHere.length === 0 && (
          <p className="text-[10px] text-muted-foreground">Henüz motif yok. Bir motif seçip aşağıdan bu alana atayabilirsin.</p>
        )}
        {motifsHere.map(m => (
          <div key={m.id} className="flex items-center justify-between text-xs">
            <button onClick={() => dispatch({ type: "SELECT", id: m.id })} className="truncate text-left hover:text-primary">{m.name}</button>
            <button onClick={() => dispatch({ type: "UPDATE_MOTIF", id: m.id, patch: { zoneId: null } })} className="text-[10px] text-muted-foreground hover:text-destructive">çıkar</button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button onClick={resetRect} className="text-xs px-2 py-1.5 rounded border border-border hover:border-primary/40">Dikdörtgene sıfırla</button>
        <button onClick={() => dispatch({ type: "REMOVE_ZONE", id: zone.id })} className="text-xs px-2 py-1.5 rounded border border-destructive/40 text-destructive hover:bg-destructive/5">Alanı sil</button>
      </div>
    </div>
  );
}

function MotifInspector({ sel }: { sel: MotifInstance }) {
  const { state, dispatch } = useTuval();
  const update = (patch: Partial<MotifInstance>) => dispatch({ type: "UPDATE_MOTIF", id: sel.id, patch });

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      <div>
        <h3 className="font-serif text-lg text-foreground truncate">{sel.name}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Seçili katman ayarları</p>
      </div>

      {/* Zone assignment */}
      {state.zones.length > 0 && (
        <div>
          <div className="text-xs text-muted-foreground mb-1.5">Alan</div>
          <select
            value={sel.zoneId ?? ""}
            onChange={(e) => update({ zoneId: e.target.value || null })}
            className="w-full text-xs px-2 py-1.5 rounded border border-border bg-background"
          >
            <option value="">— Serbest (alan yok) —</option>
            {state.zones.map(z => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
          <p className="text-[10px] text-muted-foreground mt-1">Bir alana atanan motif o alanın perspektifinde eğilir.</p>
        </div>
      )}

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

      <div className="rounded-lg border border-border bg-card p-3 space-y-3">
        <div className="text-xs font-medium text-foreground">Perspektif & Eğim</div>
        <div>
          <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Yatay döndür (Y)</span><span className="tabular-nums">{sel.perspX ?? 0}°</span></div>
          <input type="range" min={-60} max={60} step={1} value={sel.perspX ?? 0} onChange={(e) => update({ perspX: Number(e.target.value) })} className="w-full accent-primary" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Dikey döndür (X)</span><span className="tabular-nums">{sel.perspY ?? 0}°</span></div>
          <input type="range" min={-60} max={60} step={1} value={sel.perspY ?? 0} onChange={(e) => update({ perspY: Number(e.target.value) })} className="w-full accent-primary" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Eğim X</span><span className="tabular-nums">{sel.skewX ?? 0}°</span></div>
          <input type="range" min={-45} max={45} step={1} value={sel.skewX ?? 0} onChange={(e) => update({ skewX: Number(e.target.value) })} className="w-full accent-primary" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Eğim Y</span><span className="tabular-nums">{sel.skewY ?? 0}°</span></div>
          <input type="range" min={-45} max={45} step={1} value={sel.skewY ?? 0} onChange={(e) => update({ skewY: Number(e.target.value) })} className="w-full accent-primary" />
        </div>
        <button onClick={() => update({ perspX: 0, perspY: 0, skewX: 0, skewY: 0 })} className="w-full text-xs px-2 py-1.5 rounded border border-border hover:border-primary/40">Perspektifi sıfırla</button>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2">
        <button onClick={() => update({ x: 0.5, y: 0.5 })} className="text-xs px-2 py-1.5 rounded border border-border hover:border-primary/40">Ortala</button>
        <button onClick={() => update({ rotation: 0 })} className="text-xs px-2 py-1.5 rounded border border-border hover:border-primary/40">Açıyı sıfırla</button>
      </div>
    </div>
  );
}

function GridInspector() {
  const { state, dispatch } = useTuval();
  const grid = state.gridMode;
  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      <div>
        <h3 className="font-serif text-lg text-foreground">Özellikler</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Bir katman/alan seç veya grid'i ayarla</p>
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

export function InspectorPanel() {
  const { state } = useTuval();
  const sel = state.motifs.find(m => m.id === state.selectedId);
  const zone = state.zones.find(z => z.id === state.selectedZoneId);

  if (zone) return <ZoneInspector zone={zone} />;
  if (sel) return <MotifInspector sel={sel} />;
  return <GridInspector />;
}
