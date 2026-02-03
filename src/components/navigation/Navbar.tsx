import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

interface NavbarProps {
  isHeroComplete?: boolean;
}

const navLinks = [
  { label: "Koleksiyon", href: "#collection" },
  { label: "Nasıl Çalışır", href: "#how-it-works" },
  { label: "Özel Tasarım", href: "#custom" },
  { label: "Hakkımızda", href: "#about" },
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

  // Navbar becomes more visible after hero interaction or scroll
  const isActive = isHeroComplete || isScrolled;

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isActive
          ? "bg-background/80 backdrop-blur-md shadow-organic border-b border-border"
          : "bg-transparent"
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <nav className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.a
            href="/"
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-serif text-lg">S</span>
            </div>
            <span
              className={`font-serif text-xl transition-opacity duration-300 ${
                isActive ? "opacity-100" : "opacity-70"
              }`}
            >
              Stencil Studio
            </span>
          </motion.a>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-6"
                >
                  {navLinks.map((link, index) => (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors relative group"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {link.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                    </motion.a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <AnimatePresence>
              {isActive && (
                <>
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="hidden lg:flex w-10 h-10 items-center justify-center rounded-full hover:bg-accent transition-colors"
                  >
                    <Search className="w-5 h-5 text-muted-foreground" />
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: 0.05 }}
                    className="hidden lg:flex w-10 h-10 items-center justify-center rounded-full hover:bg-accent transition-colors relative"
                  >
                    <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      0
                    </span>
                  </motion.button>
                </>
              )}
            </AnimatePresence>

            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="relative">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-background">
                <SheetTitle className="font-serif text-xl mb-8">Menü</SheetTitle>
                <nav className="flex flex-col gap-6">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-sans text-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                  <hr className="border-border my-4" />
                  <div className="flex gap-4">
                    <Button variant="outline" size="icon">
                      <Search className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" size="icon" className="relative">
                      <ShoppingBag className="w-5 h-5" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                        0
                      </span>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </motion.header>
  );
};
