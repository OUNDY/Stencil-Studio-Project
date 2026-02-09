import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar, GlobalWidgets } from "@/components/navigation";
import { Footer } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { ShoppingCart, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { products, categories } from "@/data/products";

const priceRanges = [
  { id: "all", label: "Tümü", min: 0, max: Infinity },
  { id: "0-150", label: "₺0 - ₺150", min: 0, max: 150 },
  { id: "150-200", label: "₺150 - ₺200", min: 150, max: 200 },
  { id: "200+", label: "₺200+", min: 200, max: Infinity },
];

const sizeOptions = ["30x30 cm", "50x50 cm", "70x70 cm", "100x100 cm"];
const materialOptions = ["Mylar (0.25mm)", "PET Plastik (0.5mm)", "Karton (Tek kullanım)"];

const Collection = () => {
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "popular">("default");
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [priceRange, setPriceRange] = useState("all");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({
    category: true,
    price: true,
    size: false,
    material: false,
  });

  const toggleFilter = (key: string) =>
    setExpandedFilters((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleSize = (size: string) =>
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );

  const toggleMaterial = (mat: string) =>
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );

  const currentPriceRange = priceRanges.find((r) => r.id === priceRange) || priceRanges[0];

  const filtered = products
    .filter((p) => activeCategory === "all" || p.category === activeCategory)
    .filter((p) => p.price >= currentPriceRange.min && p.price <= currentPriceRange.max)
    .filter((p) => selectedSizes.length === 0 || p.sizes.some((s) => selectedSizes.includes(s)))
    .filter((p) => selectedMaterials.length === 0 || p.materials.some((m) => selectedMaterials.includes(m)))
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "popular") return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
      return 0;
    });

  const clearFilters = () => {
    setActiveCategory("all");
    setPriceRange("all");
    setSelectedSizes([]);
    setSelectedMaterials([]);
    setSortBy("default");
  };

  const hasActiveFilters =
    activeCategory !== "all" || priceRange !== "all" || selectedSizes.length > 0 || selectedMaterials.length > 0;

  /* Shared filter panel content */
  const FilterContent = () => (
    <div className="space-y-5">
      {/* Category */}
      <div>
        <button onClick={() => toggleFilter("category")} className="flex items-center justify-between w-full text-sm font-medium text-foreground mb-2">
          Kategori
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilters.category ? "rotate-180" : ""}`} />
        </button>
        {expandedFilters.category && (
          <div className="space-y-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div>
        <button onClick={() => toggleFilter("price")} className="flex items-center justify-between w-full text-sm font-medium text-foreground mb-2">
          Fiyat
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilters.price ? "rotate-180" : ""}`} />
        </button>
        {expandedFilters.price && (
          <div className="space-y-1">
            {priceRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setPriceRange(range.id)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  priceRange === range.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Size */}
      <div>
        <button onClick={() => toggleFilter("size")} className="flex items-center justify-between w-full text-sm font-medium text-foreground mb-2">
          Boyut
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilters.size ? "rotate-180" : ""}`} />
        </button>
        {expandedFilters.size && (
          <div className="space-y-1">
            {sizeOptions.map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedSizes.includes(size)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Material */}
      <div>
        <button onClick={() => toggleFilter("material")} className="flex items-center justify-between w-full text-sm font-medium text-foreground mb-2">
          Malzeme
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilters.material ? "rotate-180" : ""}`} />
        </button>
        {expandedFilters.material && (
          <div className="space-y-1">
            {materialOptions.map((mat) => (
              <button
                key={mat}
                onClick={() => toggleMaterial(mat)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedMaterials.includes(mat)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {mat}
              </button>
            ))}
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <button onClick={clearFilters} className="w-full py-2 text-sm text-destructive hover:underline">
          Filtreleri Temizle
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar isHeroComplete={true} />
      <GlobalWidgets />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 lg:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-2">
              Koleksiyon
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              El yapımı stencil tasarımlarımızı keşfedin.
            </p>
          </motion.div>

          {/* Mobile filter toggle + sort */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <button
              onClick={() => setShowMobileFilter(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtrele
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 rounded-xl bg-card border border-border text-sm"
            >
              <option value="default">Varsayılan</option>
              <option value="price-asc">Fiyat: Düşük → Yüksek</option>
              <option value="price-desc">Fiyat: Yüksek → Düşük</option>
              <option value="popular">Popüler</option>
            </select>
          </div>

          {/* Mobile filter sheet */}
          <AnimatePresence>
            {showMobileFilter && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
                  onClick={() => setShowMobileFilter(false)}
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="fixed left-0 top-0 bottom-0 w-[280px] bg-background border-r border-border z-50 p-5 overflow-y-auto lg:hidden"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-xl">Filtrele</h2>
                    <button onClick={() => setShowMobileFilter(false)} className="p-1.5 hover:bg-accent rounded-lg">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <FilterContent />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="flex gap-8">
            {/* Desktop sidebar filter */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-medium text-sm text-foreground">Filtrele</h2>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-xs text-primary hover:underline">
                      Temizle
                    </button>
                  )}
                </div>
                <FilterContent />
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Desktop sort */}
              <div className="hidden lg:flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  {filtered.length} ürün gösteriliyor
                </p>
                <div className="flex items-center gap-2">
                  {[
                    { key: "default", label: "Varsayılan" },
                    { key: "price-asc", label: "Fiyat ↑" },
                    { key: "price-desc", label: "Fiyat ↓" },
                    { key: "popular", label: "Popüler" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setSortBy(opt.key as typeof sortBy)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all ${
                        sortBy === opt.key
                          ? "bg-foreground text-background"
                          : "bg-card border border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile result count */}
              <p className="text-sm text-muted-foreground mb-4 lg:hidden">
                {filtered.length} ürün
              </p>

              {/* Product grid */}
              <motion.div
                layout
                className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-5"
              >
                <AnimatePresence mode="popLayout">
                  {filtered.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="group"
                    >
                      <Link to={`/urun/${product.id}`}>
                        <div className="aspect-square bg-gradient-to-br from-muted to-accent/20 rounded-2xl overflow-hidden relative">
                          <div className="w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                            <span className="text-4xl md:text-5xl opacity-35 group-hover:opacity-55 transition-opacity duration-300">
                              {product.emoji}
                            </span>
                          </div>
                          {product.popular && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-sans">
                              Popüler
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="mt-2.5 flex items-start justify-between gap-2">
                        <Link to={`/urun/${product.id}`} className="flex-1 min-w-0">
                          <h3 className="font-serif text-sm md:text-base text-foreground truncate">
                            {product.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                            {product.category === "cocuk" ? "Çocuk" : product.category}
                          </p>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            addItem({ id: product.id, name: product.name, price: product.price });
                          }}
                          className="w-8 h-8 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground flex items-center justify-center transition-all flex-shrink-0"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Collection;
