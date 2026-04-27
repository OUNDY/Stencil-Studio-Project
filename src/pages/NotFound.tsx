import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Compass, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar, GlobalWidgets } from "@/components/navigation";
import { Footer } from "@/components/sections";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn("404 — bilinmeyen rota:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar isHeroComplete={true} />
      <GlobalWidgets />

      <main className="flex-1 pt-16 flex items-center justify-center px-6">
        <div className="max-w-2xl w-full text-center py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative inline-block"
          >
            <span className="font-serif text-[160px] sm:text-[200px] leading-none text-primary/15 select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full border border-primary/20 bg-card/80 backdrop-blur-sm px-5 py-2 shadow-sm">
                <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-primary/80">
                  sayfa bulunamadı
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6"
          >
            <h1 className="font-serif text-3xl sm:text-4xl text-foreground">
              Bu duvarda henüz bir desen yok
            </h1>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto leading-relaxed">
              Aradığın sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir.
              <br className="hidden sm:block" />
              Aşağıdan yolculuğuna devam edebilirsin.
            </p>
            {location.pathname && (
              <p className="mt-3 text-xs text-muted-foreground/70 font-mono">
                {location.pathname}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button asChild className="rounded-full">
              <Link to="/">
                <Home className="w-4 h-4 mr-1.5" />
                Ana sayfaya dön
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/koleksiyon">
                <Compass className="w-4 h-4 mr-1.5" />
                Koleksiyona göz at
              </Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-full">
              <Link to="/iletisim">
                <MessageCircle className="w-4 h-4 mr-1.5" />
                İletişime geç
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 pt-8 border-t border-border/60"
          >
            <p className="text-xs text-muted-foreground mb-3">Belki bunları arıyordun:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { to: "/tuval", label: "Tuval Alanı" },
                { to: "/ozel-tasarim", label: "Özel Tasarım" },
                { to: "/nasil-calisir", label: "Nasıl Çalışır" },
                { to: "/sss", label: "SSS" },
                { to: "/blog", label: "Blog" },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-card/60 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
