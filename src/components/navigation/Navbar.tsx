import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { SearchPopover } from "./SearchPopover";
import { ProfileDropdown } from "./ProfileDropdown";
import { DarkModeToggle } from "./DarkModeToggle";
import { PeacockLogo } from "@/components/brand/PeacockLogo";

interface NavbarProps {
  isHeroComplete?: boolean;
}

const navLinks = [
  { label: "Koleksiyon", href: "/koleksiyon" },
  { label: "Tuval", href: "/tuval" },
  { label: "Nasıl Çalışır", href: "/nasil-calisir" },
  { label: "Özel Tasarım", href: "/ozel-tasarim" },
  { label: "Hakkımızda", href: "/hakkimizda" },
];

export const Navbar = ({ isHeroComplete = false }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isVisible = isHeroComplete || isScrolled || isHovered;
  const showFullNav = isHeroComplete || isScrolled;

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: isVisible ? 0 : -100, opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        className="w-full border-b backdrop-blur-xl transition-all duration-500"
        animate={{
          backgroundColor: showFullNav
            ? "hsl(var(--background) / 0.9)"
            : "hsl(var(--background) / 0.6)",
          borderColor: showFullNav
            ? "hsl(var(--border) / 0.5)"
            : "hsl(var(--border) / 0)",
        }}
        transition={{ duration: 0.5 }}
      >
        <nav className="container mx-auto px-4 lg:px-6">
          <div className="relative flex items-center justify-between h-14 lg:h-16">
            {/* Logo */}
            <motion.div whileHover={{ scale: 1.02 }}>
              <Link to="/" className="flex items-center gap-2" aria-label="Stencil Studio anasayfa">
                <div className="h-10 flex items-center justify-center text-primary">
                  <PeacockLogo className="h-10 w-7" />
                </div>
                <span className="font-serif text-lg text-foreground">
                  Stencil
                </span>
              </Link>
            </motion.div>

            {/* Desktop navigation - absolute center */}
            <AnimatePresence>
              {showFullNav && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="hidden lg:flex items-center gap-6 absolute inset-0 justify-center pointer-events-none"
                >
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="pointer-events-auto"
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
            <div className="flex items-center gap-1">
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
                      transition={{ delay: 0.02 }}
                      className="hidden lg:block"
                    >
                      <DarkModeToggle />
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

              {/* Mobile: dark mode + menu */}
              <AnimatePresence>
                {showFullNav && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="lg:hidden"
                    >
                      <DarkModeToggle />
                    </motion.div>
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
                          <div className="mt-8 pt-6 border-t border-border space-y-4">
                            <Link
                              to="/giris"
                              onClick={() => setIsOpen(false)}
                              className="block w-full py-3 bg-primary text-primary-foreground text-center text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors"
                            >
                              Giriş Yap
                            </Link>
                            <Link
                              to="/kayit"
                              onClick={() => setIsOpen(false)}
                              className="block w-full py-3 border border-border text-center text-sm font-medium rounded-xl hover:bg-accent transition-colors"
                            >
                              Hesap Oluştur
                            </Link>
                          </div>
                        </SheetContent>
                      </Sheet>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </nav>
      </motion.div>
    </motion.header>
  );
};
