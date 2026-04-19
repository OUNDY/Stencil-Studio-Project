import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Navbar, GlobalWidgets } from "@/components/navigation";
import { Footer } from "@/components/sections";

interface LegalLayoutProps {
  title: string;
  subtitle?: string;
  updatedAt?: string;
  children: React.ReactNode;
}

export const LegalLayout = ({ title, subtitle, updatedAt, children }: LegalLayoutProps) => (
  <div className="min-h-screen bg-background">
    <Navbar isHeroComplete={true} />
    <GlobalWidgets />

    <main className="pt-16">
      <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
        <div className="container mx-auto px-6 py-12 lg:py-16 max-w-4xl">
          <motion.nav
            aria-label="breadcrumb"
            className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link to="/" className="hover:text-foreground transition-colors">
              Ana Sayfa
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">{title}</span>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-serif text-4xl lg:text-5xl text-foreground tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-3 text-base lg:text-lg text-muted-foreground max-w-2xl">
                {subtitle}
              </p>
            )}
            {updatedAt && (
              <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground/70">
                Son güncelleme: {updatedAt}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="container mx-auto px-6 max-w-4xl prose prose-neutral dark:prose-invert prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-li:text-muted-foreground"
        >
          {children}
        </motion.article>
      </section>
    </main>

    <Footer />
  </div>
);
