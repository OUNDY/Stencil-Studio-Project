import { useState, useRef, useEffect } from "react";
import { User, Settings, Package, Heart, LogOut, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const menuItems = [
  { icon: Package, label: "Siparişlerim", href: "/hesabim/siparisler" },
  { icon: Heart, label: "Favorilerim", href: "/hesabim/favoriler" },
  { icon: Settings, label: "Hesap Ayarları", href: "/hesabim/ayarlar" },
];

export const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock user state - would be replaced with real auth
  const isLoggedIn = false;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <User className="w-5 h-5 text-muted-foreground" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 bg-background border border-border rounded-2xl shadow-xl overflow-hidden"
          >
            {isLoggedIn ? (
              <>
                {/* User Info */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Kullanıcı Adı</p>
                      <p className="text-xs text-muted-foreground">kullanici@email.com</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors group"
                    >
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm flex-1">{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>

                {/* Logout */}
                <div className="p-2 border-t border-border">
                  <button className="flex items-center gap-3 px-4 py-2.5 w-full hover:bg-destructive/10 rounded-lg transition-colors text-destructive">
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Çıkış Yap</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4 space-y-3">
                <div className="text-center pb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-serif text-lg">Hoş Geldiniz</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Siparişlerinizi takip edin ve favorilerinizi kaydedin
                  </p>
                </div>
                <Link
                  to="/giris"
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-2.5 bg-primary text-primary-foreground text-center text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/kayit"
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-2.5 border border-border text-center text-sm font-medium rounded-xl hover:bg-accent transition-colors"
                >
                  Hesap Oluştur
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
