import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, Sparkles } from "lucide-react";
import { Navbar, GlobalWidgets } from "@/components/navigation";
import TuvalCanvas from "@/components/hero/TuvalCanvas";
import TuvalStudio from "@/components/tuval/TuvalStudio";
import { Footer } from "@/components/sections";
import TuvalShowcase from "@/components/sections/TuvalShowcase";
import { Button } from "@/components/ui/button";

const Tuval = () => {
  const [searchParams] = useSearchParams();
  const initialMotifId = searchParams.get("motif") ?? undefined;
  const isLegacy = searchParams.get("v") === "legacy";

  return (
    <div className="min-h-screen bg-background">
      <Navbar isHeroComplete={true} />
      <GlobalWidgets />

      <main className="pt-16">
        {/* Header */}
        <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-muted/40 to-background">
          <div className="container mx-auto px-6 py-10 lg:py-12">
            <motion.nav
              aria-label="breadcrumb"
              className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground"
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Link to="/" className="transition-colors hover:text-foreground">Ana Sayfa</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">Tuval Stüdyo</span>
            </motion.nav>

            <div className="flex flex-wrap items-end justify-between gap-6">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary/80">stencil studio</span>
                </div>
                <h1 className="mt-4 font-serif text-4xl leading-[1.1] tracking-tight text-foreground sm:text-5xl">
                  Tuval Stüdyo
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Motifleri yerleştir, rengi belirle, katmanlarla oyna. Her hareket geri alınabilir, çalışman otomatik kaydedilir.
                </p>
              </motion.div>

              <motion.div className="flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
              >
                <Button asChild variant="outline" className="rounded-full">
                  <Link to="/koleksiyon">Koleksiyona göz at</Link>
                </Button>
                <Button asChild className="rounded-full">
                  <Link to={isLegacy ? "/tuval" : "/tuval?v=legacy"}>
                    {isLegacy ? "Yeni stüdyoyu dene" : "Klasik (fırça) modu"}
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Editor */}
        <section className="bg-background">
          <div className="container mx-auto px-0 sm:px-4 lg:px-6 py-6 lg:py-8">
            <motion.div
              className="overflow-hidden rounded-none sm:rounded-2xl border-y sm:border border-border bg-card shadow-[0_20px_60px_-20px_hsl(var(--foreground)/0.18)]"
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              style={{ height: "min(82vh, 760px)" }}
            >
              {isLegacy ? (
                <TuvalCanvas embedded initialMotifId={initialMotifId} />
              ) : (
                <TuvalStudio initialMotifId={initialMotifId} />
              )}
            </motion.div>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              {isLegacy
                ? "Klasik fırça modunu görüyorsun. Yeni stüdyoya dönmek için üstteki butonu kullan."
                : "İpucu: ⌘/Ctrl+Z geri al · ⌘/Ctrl+Shift+Z ileri al · Delete katman sil · ⌘/Ctrl+D çoğalt"}
            </p>
          </div>
        </section>

        <TuvalShowcase />
      </main>

      <Footer />
    </div>
  );
};

export default Tuval;
