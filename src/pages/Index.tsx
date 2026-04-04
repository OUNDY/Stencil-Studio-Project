import { motion } from "framer-motion";
import { Navbar, GlobalWidgets } from "@/components/navigation";
import { HeroPaintingCanvas } from "@/components/hero";
import {
  FeaturesSection,
  CollectionSection,
  TestimonialsSection,
  CTASection,
  Footer,
  HowItWorksSection,
} from "@/components/sections";

/* Micro-pause: breathing divider between sections */
const MicroPause = ({ children, delay = 0 }: { children?: React.ReactNode; delay?: number }) => (
  <motion.div
    className="relative py-2 flex flex-col items-center justify-center overflow-hidden"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.8, delay }}
  >
    <motion.div
      className="w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent"
      initial={{ height: 0 }}
      whileInView={{ height: 48 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
    />
    {children && (
      <motion.p
        className="text-sm text-muted-foreground/70 font-sans mt-3 tracking-widest uppercase"
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: delay + 0.6 }}
      >
        {children}
      </motion.p>
    )}
    <motion.div
      className="absolute w-32 h-32 rounded-full bg-primary/5 blur-2xl"
      animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
  </motion.div>
);

const Index = () => (
  <div className="min-h-screen bg-background scroll-smooth">
    {/* Navbar: always visible — no phase gating with new painting hero */}
    <Navbar isHeroComplete={true} />
    <GlobalWidgets />

    <main>
      {/* ── Hero: interactive stencil painting demo ──────── */}
      <section className="pt-20 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Eyebrow + headline */}
          <motion.div
            className="mb-6 text-center"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <p className="text-xs font-medium uppercase tracking-widest text-primary/70">
              stencil studio
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Boyamayı hemen dene
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Bir motif seç, rengi ayarla, tıkla ve sürükle.
            </p>
          </motion.div>

          {/* Interactive canvas — the star of the page */}
          <HeroPaintingCanvas />
        </div>
      </section>

      <MicroPause delay={0.1}>keşfet</MicroPause>
      <FeaturesSection />
      <MicroPause delay={0}>nasıl?</MicroPause>
      <HowItWorksSection />
      <MicroPause delay={0}>ilham al</MicroPause>
      <TestimonialsSection />
      <MicroPause delay={0} />
      <CTASection />
      <MicroPause delay={0} />
      <CollectionSection />
    </main>

    <Footer />
  </div>
);

export default Index;
