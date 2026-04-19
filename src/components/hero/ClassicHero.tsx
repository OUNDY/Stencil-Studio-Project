import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import wallPainted from "@/assets/wall-painted.png";

export const ClassicHero = () => (
  <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
    {/* Background image */}
    <div className="absolute inset-0 -z-10">
      <img
        src={wallPainted}
        alt="Stencil ile boyanmış duvar"
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
    </div>

    <div className="container mx-auto px-6 lg:px-12 py-12 flex justify-center">
      <div className="max-w-2xl w-full text-center mx-auto">
        <motion.p
          className="text-xs font-medium uppercase tracking-[0.25em] text-primary/80"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          stencil studio
        </motion.p>

        <motion.h1
          className="mt-5 font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Duvarlarına bir
          <span className="block italic text-primary">hikâye</span>
          ekle.
        </motion.h1>

        <motion.p
          className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          Özenle tasarlanmış stencil koleksiyonumuzla mekânına karakter kat.
          Sade motiflerden cesur kompozisyonlara — sana en yakışanı seç.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap gap-3 justify-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/koleksiyon">Koleksiyonu Keşfet</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-8">
            <Link to="/tuval">Tuval Alanı</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  </section>
);

export default ClassicHero;
