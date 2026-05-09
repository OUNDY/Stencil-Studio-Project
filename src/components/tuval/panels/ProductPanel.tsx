import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useTuval } from "../store/TuvalContext";
import { resolveMotifImage } from "../store/motifResolver";
import { products } from "@/data/products";
import { Input } from "@/components/ui/input";

function makeId() { return `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

export function ProductPanel() {
  const { dispatch } = useTuval();
  const [q, setQ] = useState("");

  const list = useMemo(
    () => products.filter(p => (p.image || p.motifId) && p.name.toLowerCase().includes(q.toLowerCase())),
    [q]
  );

  const addProduct = (motifId: string | undefined, image: string | undefined, name: string) => {
    let url = image;
    if (motifId) {
      const r = resolveMotifImage(motifId);
      if (r) url = r.url;
    }
    if (!url) return;
    dispatch({
      type: "ADD_MOTIF",
      motif: {
        id: makeId(),
        sourceId: motifId ?? `prod-${Date.now()}`,
        name,
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
  };

  return (
    <div className="flex flex-col gap-3 p-4 h-full overflow-hidden">
      <div>
        <h3 className="font-serif text-lg text-foreground">Ürünler</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Kataloğdan stencil seç ve dene</p>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ürün ara…" className="pl-8 h-9" />
      </div>

      <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1 -mr-1 flex-1">
        {list.map(p => (
          <button
            key={p.id}
            onClick={() => addProduct(p.motifId, p.image, p.name)}
            className="rounded-lg border border-border bg-card overflow-hidden hover:border-primary/60 transition-colors text-left"
          >
            <div className="aspect-square bg-muted/40 p-3 flex items-center justify-center">
              {p.image ? (
                <div
                  className="w-full h-full"
                  style={{
                    backgroundColor: "hsl(var(--foreground))",
                    WebkitMaskImage: `url(${p.image})`,
                    maskImage: `url(${p.image})`,
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                  }}
                />
              ) : (
                <span className="text-3xl">{p.emoji}</span>
              )}
            </div>
            <div className="px-2 py-1.5">
              <div className="text-[11px] text-foreground truncate">{p.name}</div>
              <div className="text-[10px] text-muted-foreground">{p.price}₺</div>
            </div>
          </button>
        ))}
        {list.length === 0 && (
          <p className="col-span-2 text-xs text-muted-foreground text-center py-6">Sonuç yok</p>
        )}
      </div>
    </div>
  );
}
