import { useState } from "react";
import { Search, Upload } from "lucide-react";
import { useTuval } from "../store/TuvalContext";
import { PRESET_MOTIFS, resolveMotifImage, svgToDataUrl } from "../store/motifResolver";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function makeId() { return `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

export function MotifPanel() {
  const { state, dispatch } = useTuval();
  const [q, setQ] = useState("");
  const list = PRESET_MOTIFS.filter(m =>
    m.name.toLowerCase().includes(q.toLowerCase())
  );

  const addMotif = (sourceId: string) => {
    const r = resolveMotifImage(sourceId);
    if (!r) return;
    dispatch({
      type: "ADD_MOTIF",
      motif: {
        id: makeId(),
        sourceId,
        name: r.name,
        imageUrl: r.url,
        x: 0.5, y: 0.5,
        scale: 0.3,
        rotation: 0,
        color: "#3d3530",
        opacity: 0.9,
        visible: true,
        locked: false,
      },
    });
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const isSvg = f.type === "image/svg+xml" || f.name.toLowerCase().endsWith(".svg");
    let url: string;
    if (isSvg) {
      const text = await f.text();
      url = svgToDataUrl(text);
    } else {
      url = await new Promise<string>((res) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result as string);
        fr.readAsDataURL(f);
      });
    }
    dispatch({
      type: "ADD_MOTIF",
      motif: {
        id: makeId(),
        sourceId: `custom-${Date.now()}`,
        name: f.name.replace(/\.[^.]+$/, ""),
        imageUrl: url,
        x: 0.5, y: 0.5,
        scale: 0.3,
        rotation: 0,
        color: "#3d3530",
        opacity: 0.9,
        visible: true,
        locked: false,
      },
    });
    e.target.value = "";
  };

  const setGridSource = (sourceId: string) => {
    const r = resolveMotifImage(sourceId);
    if (!r) return;
    dispatch({ type: "SET_GRID", patch: { enabled: true, sourceId, imageUrl: r.url } });
  };

  return (
    <div className="flex flex-col gap-3 p-4 h-full overflow-hidden">
      <div>
        <h3 className="font-serif text-lg text-foreground">Motifler</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Tıkla ekle veya grid olarak uygula</p>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Motif ara…"
          className="pl-8 h-9"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1 -mr-1 flex-1">
        {list.map(m => {
          const r = resolveMotifImage(m.id)!;
          const isGrid = state.gridMode.enabled && state.gridMode.sourceId === m.id;
          return (
            <div key={m.id} className="rounded-lg border border-border bg-card overflow-hidden group">
              <button
                onClick={() => addMotif(m.id)}
                className="w-full aspect-square bg-muted/40 p-3 flex items-center justify-center hover:bg-muted transition-colors"
                title="Tuvale ekle"
              >
                <div
                  className="w-full h-full"
                  style={{
                    backgroundColor: "hsl(var(--foreground))",
                    WebkitMaskImage: `url(${r.url})`,
                    maskImage: `url(${r.url})`,
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                  }}
                />
              </button>
              <div className="px-2 py-1.5 flex items-center justify-between gap-1">
                <span className="text-[11px] text-foreground truncate">{m.name}</span>
                <button
                  onClick={() => setGridSource(m.id)}
                  className={`text-[10px] px-1.5 py-0.5 rounded ${isGrid ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  title="Grid olarak uygula"
                >
                  grid
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <label className="block">
        <input type="file" accept="image/*,.svg" onChange={onUpload} className="hidden" />
        <Button asChild variant="outline" size="sm" className="w-full">
          <span className="cursor-pointer"><Upload className="h-3.5 w-3.5" /> SVG/PNG yükle</span>
        </Button>
      </label>
    </div>
  );
}
