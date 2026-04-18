import { motion } from "framer-motion";
import { Navbar, GlobalWidgets } from "@/components/navigation";
import TuvalCanvas from "@/components/hero/TuvalCanvas";
import { Footer } from "@/components/sections";

const Tuval = () => (
  <div className="min-h-screen bg-background">
    <Navbar isHeroComplete={true} />
    <GlobalWidgets />

    <main className="pt-16">
      <motion.div
        className="py-8 text-center px-4"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <p className="text-xs font-medium uppercase tracking-widest text-primary/70">
          stencil studio
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Tuval Alanı
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Bir motif seç, rengi ayarla, tuval üzerine uygula ve boya.
        </p>
      </motion.div>

      <TuvalCanvas embedded />
    </main>

    <Footer />
  </div>
);

export default Tuval;
