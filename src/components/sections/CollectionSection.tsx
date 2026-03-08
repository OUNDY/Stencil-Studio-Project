import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const collections = [
  { id: "botanical", name: "Botanik Serisi", description: "Doğanın zarif çizgileri duvarlarınızda", image: "🌿", itemCount: 24, popular: true },
  { id: "geometric", name: "Geometrik", description: "Modern çizgiler, sonsuz kombinasyonlar", image: "◇", itemCount: 18, popular: false },
  { id: "mandala", name: "Mandala", description: "Meditasyonu duvarlarınıza taşıyın", image: "✿", itemCount: 15, popular: true },
  { id: "minimal", name: "Minimal", description: "Az çok demektir", image: "○", itemCount: 12, popular: false },
  { id: "ethnic", name: "Etnik Motifler", description: "Geleneksel desenler, modern yorumlar", image: "◬", itemCount: 20, popular: false },
  { id: "kids", name: "Çocuk Dünyası", description: "Küçük hayalperestler için", image: "★", itemCount: 30, popular: true },
];

export const CollectionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section ref={ref} id="collection" className="py-14 lg:py-20 bg-background relative">
      <div className="container mx-auto px-6">
        <motion.div
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 lg:mb-0">
            <span className="inline-block px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-sans mb-4">
              Koleksiyon
            </span>
            <h2 className="text-4xl lg:text-5xl font-serif text-foreground">
              Tarzınızı bulun
            </h2>
          </div>
          <Button
            variant="ghost"
            className="group self-start lg:self-auto text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link to="/koleksiyon">
              Tümünü gör
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              className="group relative"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              onMouseEnter={() => setHoveredId(collection.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Link to="/koleksiyon">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-muted to-accent/30 border border-border shadow-organic transition-all duration-500 group-hover:shadow-organic-elevated">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                      className="text-7xl opacity-30 group-hover:opacity-50 transition-opacity"
                      animate={hoveredId === collection.id ? { scale: [1, 1.1, 1], rotate: [0, 5, 0] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {collection.image}
                    </motion.span>
                  </div>
                  {collection.popular && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-sans">
                      <Heart className="w-3 h-3 fill-current" />
                      Popüler
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-serif text-foreground mb-1">
                      {collection.name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-sans mb-3">
                      {collection.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {collection.itemCount} şablon
                      </span>
                      <motion.span
                        className="flex items-center gap-1 text-sm text-primary font-sans"
                        whileHover={{ x: 5 }}
                      >
                        Keşfet
                        <ArrowRight className="w-4 h-4" />
                      </motion.span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
