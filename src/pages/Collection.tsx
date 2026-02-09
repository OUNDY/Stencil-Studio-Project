import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar, GlobalWidgets } from "@/components/navigation";
import { Footer } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { ShoppingCart, SlidersHorizontal, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { products, categories } from "@/data/products";

const Collection = () => {
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "popular">("default");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = products
    .filter((p) => activeCategory === "all" || p.category === activeCategory)
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "popular") return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      <Navbar isHeroComplete={true} />
      <GlobalWidgets />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center mb-12"
          >
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
              Koleksiyon
            </h1>
            <p className="text-lg text-muted-foreground">
              El yapımı stencil tasarımlarımızı keşfedin.
            </p>
          </motion.div>

          {/* Filter bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col gap-4 mb-10"
          >
            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-sans whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}

              {/* Sort / filter toggle */}
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground hover:bg-accent text-sm font-sans transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Sırala
                </button>
              </div>
            </div>

            {/* Sort options */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { key: "default", label: "Varsayılan" },
                      { key: "price-asc", label: "Fiyat: Düşük → Yüksek" },
                      { key: "price-desc", label: "Fiyat: Yüksek → Düşük" },
                      { key: "popular", label: "Popüler Önce" },
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
                    <button
                      onClick={() => setShowFilters(false)}
                      className="ml-auto p-1.5 rounded-full hover:bg-accent transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-6">
            {filtered.length} ürün gösteriliyor
          </p>

          {/* Product grid */}
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6"
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
                        <span className="text-5xl md:text-6xl opacity-35 group-hover:opacity-55 transition-opacity duration-300">
                          {product.emoji}
                        </span>
                      </div>
                      {product.popular && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-sans">
                          Popüler
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <Link to={`/urun/${product.id}`} className="flex-1 min-w-0">
                      <h3 className="font-serif text-base text-foreground truncate">
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
                      className="w-9 h-9 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground flex items-center justify-center transition-all flex-shrink-0"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Collection;
