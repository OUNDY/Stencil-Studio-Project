import { useMemo, useState } from "react";
import { Search, X, Plus } from "lucide-react";
import { products, categories, type Product } from "@/data/products";

interface ProductPickerProps {
  open: boolean;
  onClose: () => void;
  onPick: (product: Product) => void;
}

/**
 * Tuval içinde "kategoriden ürün ekle" deneyimi.
 * Sadece görsel/motif taşıyan ürünler tuvale eklenebilir; diğerleri "yakında" rozetiyle gösterilir.
 */
export default function ProductPicker({ open, onClose, onPick }: ProductPickerProps) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    return products.filter((p) => {
      if (activeCat !== "all" && p.category !== activeCat) return false;
      if (!q) return true;
      return (
        p.name.toLocaleLowerCase("tr").includes(q) ||
        p.description.toLocaleLowerCase("tr").includes(q)
      );
    });
  }, [query, activeCat]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Ürün kütüphanesinden motif seç"
    >
      <div
        className="w-full max-w-3xl max-h-[85vh] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border">
          <div className="min-w-0">
            <h2 className="font-serif text-base sm:text-lg font-medium text-foreground">
              Ürün Kütüphanesi
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Kataloğundan bir ürün seç, tuvale anında ekle.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ürün ara…"
              className="w-full pl-9 pr-3 py-2 rounded-md bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Category chips */}
        <div className="px-5 py-3 flex gap-1.5 overflow-x-auto border-b border-border/60">
          {categories.map((c) => {
            const active = activeCat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-accent"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Eşleşen ürün bulunamadı.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filtered.map((p) => {
                const canUse = !!p.image;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      if (!canUse) return;
                      onPick(p);
                      onClose();
                    }}
                    disabled={!canUse}
                    title={canUse ? `${p.name} • ${p.price}₺` : "Bu ürün için stencil görseli henüz yok"}
                    className={`group relative flex flex-col rounded-xl border bg-background overflow-hidden text-left transition-all ${
                      canUse
                        ? "border-border hover:border-primary hover:shadow-md cursor-pointer"
                        : "border-border opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="aspect-square bg-muted/40 flex items-center justify-center overflow-hidden">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-contain p-3 transition-transform group-hover:scale-105"
                          style={{ filter: "brightness(0) saturate(100%) invert(var(--motif-invert, 0.15))" }}
                        />
                      ) : (
                        <span className="text-4xl opacity-60">{p.emoji}</span>
                      )}
                    </div>
                    <div className="px-2.5 py-2 border-t border-border">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-medium text-foreground truncate">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                          {p.price}₺
                        </span>
                      </div>
                      {!canUse && (
                        <span className="block mt-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                          Yakında
                        </span>
                      )}
                    </div>
                    {canUse && (
                      <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between gap-3">
          <span className="text-[11px] text-muted-foreground">
            {filtered.filter((p) => p.image).length} stencil hazır
          </span>
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
