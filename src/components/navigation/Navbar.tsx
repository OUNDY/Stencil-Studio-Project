import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { SearchPopover } from "./SearchPopover";
import { ProfileDropdown } from "./ProfileDropdown";

interface NavbarProps {
  isHeroComplete?: boolean;
}

const navLinks = [
  { label: "Koleksiyon", href: "/koleksiyon" },
  { label: "Nasıl Çalışır", href: "/nasil-calisir" },
  { label: "Özel Tasarım", href: "/ozel-tasarim" },
  { label: "Hakkımızda", href: "/hakkimizda" },
];

export const Navbar = ({ isHeroComplete = false }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showFullNav = isHeroComplete || isScrolled;

  return (
    <motion.header
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        className="relative rounded-2xl border border-border/60 bg-background/70 backdrop-blur-xl shadow-organic transition-shadow duration-300"
        animate={{
          backgroundColor: showFullNav
            ? "hsl(var(--background) / 0.85)"
            : "hsl(var(--background) / 0.5)",
          borderColor: showFullNav
            ? "hsl(var(--border) / 0.6)"
            : "hsl(var(--border) / 0.3)",
        }}
        transition={{ duration: 0.4 }}
      >
        <nav className="px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Logo */}
            <motion.div whileHover={{ scale: 1.02 }}>
              <Link to="/" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-organic">
                  <span className="text-primary-foreground font-serif text-base">S</span>
                </div>
                <span className="font-serif text-lg text-foreground">
                  Stencil
                </span>
              </Link>
            </motion.div>

            {/* Desktop navigation */}
            <AnimatePresence>
              {showFullNav && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="hidden lg:flex items-center gap-6"
                >
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <Link
                        to={link.href}
                        className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors relative group"
                      >
                        {link.label}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Right side */}
            <div className="flex items-center gap-1.5">
              <AnimatePresence>
                {showFullNav && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="hidden lg:block"
                    >
                      <SearchPopover />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: 0.04 }}
                      className="hidden lg:block"
                    >
                      <ProfileDropdown />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Mobile menu */}
              <AnimatePresence>
                {showFullNav && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                      <SheetTrigger asChild className="lg:hidden">
                        <Button variant="ghost" size="icon" className="relative w-9 h-9">
                          <Menu className="w-5 h-5" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-[300px] bg-background">
                        <SheetTitle className="font-serif text-xl mb-8">Menü</SheetTitle>
                        <nav className="flex flex-col gap-6">
                          {navLinks.map((link) => (
                            <Link
                              key={link.href}
                              to={link.href}
                              onClick={() => setIsOpen(false)}
                              className="text-lg font-sans text-foreground hover:text-primary transition-colors"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </nav>
                      </SheetContent>
                    </Sheet>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </nav>
      </motion.div>
    </motion.header>
  );
};
