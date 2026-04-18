import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, Sparkles, MousePointerClick, Palette, Layers } from "lucide-react";
import { Navbar, GlobalWidgets } from "@/components/navigation";
import TuvalCanvas from "@/components/hero/TuvalCanvas";
import { Footer } from "@/components/sections";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: MousePointerClick,
    title: "Motif seç",
    desc: "Hazır motiflerden birini seç ya da kendi SVG/PNG'ni yükle.",
  },
  {
    icon: Palette,
    title: "Renk & zemin",
    desc: "Rengi belirle, duvar, ahşap veya beton zemine geç.",
  },
  {
    icon: Layers,
    title: "Yerleştir & boya",
    desc: "Grid ya da tekli olarak konumlandır, fırçayla katman katman boya.",
  },
];

const Tuval = () => (
  <div className="min-h-screen bg-background">
    <Navbar isHeroComplete={true} />
    <GlobalWidgets />

    <main className="pt-16">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-muted/40 to-background">
        <div className="container mx-auto px-6 py-12 lg:py-16">
          {/* Breadcrumb */}
          <motion.nav
            aria-label="breadcrumb"
            className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link to="/" className="transition-colors hover:text-foreground">
              Ana Sayfa
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Tuval Alanı</span>
          </motion.nav>

          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <motion.div
              className="lg:col-span-7"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary/80">
                  stencil studio
                </span>
              </div>

              <h1 className="mt-5 font-serif text-4xl leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Tuval Alanı
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Bir motif seç, rengi ayarla, yüzeyi belirle ve fırçanla
                kendi kompozisyonunu kur. Hata yok — sadece deneme.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/koleksiyon">Koleksiyona göz at</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link to="/tasarla">Özel tasarım iste</Link>
              </Button>
            </motion.div>
          </div>

          {/* Steps */}
          <motion.div
            className="mt-12 grid gap-3 sm:grid-cols-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="group rounded-2xl border border-border/70 bg-card/60 p-4 backdrop-blur transition-colors hover:border-primary/40 hover:bg-card"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-xs text-muted-foreground">
                          0{i + 1}
                        </span>
                        <h3 className="text-sm font-medium text-foreground">
                          {s.title}
                        </h3>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Canvas frame */}
      <section className="bg-gradient-to-b from-background to-muted/30 py-10 lg:py-14">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_60px_-20px_hsl(var(--foreground)/0.18)]"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <TuvalCanvas embedded />
          </motion.div>

          {/* Footnote */}
          <p className="mt-4 text-center text-xs text-muted-foreground">
            İpucu: Üst barda <span className="text-foreground">Gelişmiş</span> menüsünden zemin, fırça ve perspektif ayarlarına ulaşabilirsin.
          </p>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default Tuval;
