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

  // Full navbar becomes visible after hero interaction or scroll
  const showFullNav = isHeroComplete || isScrolled;

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Background layer with smooth transition */}
      <motion.div
        className="absolute inset-0 bg-background/80 backdrop-blur-md shadow-organic"
        initial={{ opacity: 0 }}
        animate={{ opacity: showFullNav ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      />
      {/* Border layer separated for smooth animation */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-border"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: showFullNav ? 1 : 0, scaleX: showFullNav ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      />
      <nav className="container mx-auto px-6 relative z-10">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo - always visible */}
          <motion.div whileHover={{ scale: 1.02 }}>
            <Link to="/" className="flex items-center gap-2 z-10">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-organic">
                <span className="text-primary-foreground font-serif text-lg">S</span>
              </div>
              <span className="font-serif text-xl text-foreground">
                Stencil
              </span>
            </Link>
          </motion.div>

          {/* Desktop navigation - only visible after hero complete or scroll */}
          <AnimatePresence>
            {showFullNav && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="hidden lg:flex items-center gap-8"
              >
                <div className="flex items-center gap-6">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right side actions - only visible after hero complete or scroll */}
          <div className="flex items-center gap-2">
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
                    transition={{ delay: 0.05 }}
                    className="hidden lg:block"
                  >
                    <ProfileDropdown />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Mobile menu - only visible after hero complete or scroll */}
            <AnimatePresence>
              {showFullNav && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
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
    </motion.header>
  );
};
