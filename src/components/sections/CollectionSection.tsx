import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const collections = [
  { id: "tropik-yapraklar", name: "Tropik Yapraklar", description: "Monstera, palmiye ve egzotik yapraklar", image: "🌿", itemCount: 3, popular: true },
  { id: "cicek-gul", name: "Çiçek & Gül", description: "Vintage güller, sakura ve yaban çiçekleri", image: "🌹", itemCount: 3, popular: true },
  { id: "art-deco", name: "Art Deco & Gatsby", description: "1920'lerin ihtişamlı geometrik motifleri", image: "✦", itemCount: 2, popular: false },
  { id: "boho-makrame", name: "Boho & Makrame", description: "Makrame düğümleri ve bohem ruh", image: "🪢", itemCount: 2, popular: true },
  { id: "mandala", name: "Mandala", description: "Lotus ve tavan mandalaları", image: "❀", itemCount: 2, popular: false },
  { id: "japon-zen", name: "Japon & Zen", description: "Enso dairesi ve Kanagawa dalgası", image: "🌊", itemCount: 2, popular: true },
  { id: "islami-geometri", name: "İslami Geometri", description: "Selçuklu yıldızları ve arabesk desenler", image: "✸", itemCount: 2, popular: false },
  { id: "hayvan-siluet", name: "Hayvan Silüetleri", description: "Kuşlar, kelebekler ve doğa", image: "🦋", itemCount: 2, popular: false },
  { id: "cocuk-uzay", name: "Çocuk: Uzay", description: "Roketler, gezegenler ve yıldızlar", image: "🚀", itemCount: 2, popular: true },
  { id: "modern-soyut", name: "Modern Soyut", description: "Matisse kesikleri ve akışkan formlar", image: "🎨", itemCount: 2, popular: false },
  { id: "kaligrafi", name: "Kaligrafi & Yazı", description: "Osmanlı hat sanatı ve modern tipografi", image: "✍", itemCount: 2, popular: false },
  { id: "bordur-cerceve", name: "Bordür & Çerçeve", description: "Defne dalı bordürleri ve Viktoryen çerçeveler", image: "🖼", itemCount: 2, popular: false },
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              className="group relative"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              onMouseEnter={() => setHoveredId(collection.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Link to="/koleksiyon">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-muted to-accent/30 border border-border shadow-organic transition-all duration-500 group-hover:shadow-organic-elevated">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                      className="text-6xl opacity-30 group-hover:opacity-50 transition-opacity"
                      animate={hoveredId === collection.id ? { scale: [1, 1.1, 1], rotate: [0, 5, 0] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {collection.image}
                    </motion.span>
                  </div>
                  {collection.popular && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-sans">
                      <Heart className="w-2.5 h-2.5 fill-current" />
                      Popüler
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-base font-serif text-foreground mb-0.5">
                      {collection.name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-sans mb-2 line-clamp-1">
                      {collection.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">
                        {collection.itemCount} şablon
                      </span>
                      <motion.span
                        className="flex items-center gap-1 text-xs text-primary font-sans"
                        whileHover={{ x: 5 }}
                      >
                        Keşfet
                        <ArrowRight className="w-3.5 h-3.5" />
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
