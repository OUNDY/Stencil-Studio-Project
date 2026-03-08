import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  User,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { Navbar, GlobalWidgets } from "@/components/navigation";
import { Footer } from "@/components/sections";
import { useAuth } from "@/context/AuthContext";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Genel Bakış", href: "/hesabim" },
  { icon: Package, label: "Siparişlerim", href: "/hesabim/siparisler" },
  { icon: Heart, label: "Favorilerim", href: "/hesabim/favoriler" },
  { icon: MapPin, label: "Adreslerim", href: "/hesabim/adresler" },
  { icon: User, label: "Profil Bilgileri", href: "/hesabim/profil" },
  { icon: Bell, label: "Bildirimler", href: "/hesabim/bildirimler" },
  { icon: Settings, label: "Hesap Ayarları", href: "/hesabim/ayarlar" },
];

interface AccountLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const AccountLayout = ({ children, title, subtitle }: AccountLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // If not logged in, redirect hint
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isHeroComplete={true} />
        <GlobalWidgets />
        <main className="pt-24 pb-20 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-serif text-2xl mb-2">Giriş Yapın</h1>
            <p className="text-muted-foreground text-sm mb-6">Hesabınıza erişmek için giriş yapmanız gerekiyor.</p>
            <Link
              to="/giris"
              className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              Giriş Yap
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isHeroComplete={true} />
      <GlobalWidgets />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 lg:px-6">
          {location.pathname !== "/hesabim" && (
            <Link
              to="/hesabim"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 lg:hidden"
            >
              <ChevronLeft className="w-4 h-4" />
              Hesabım
            </Link>
          )}

          <div className="flex gap-8">
            {/* Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block w-64 flex-shrink-0"
            >
              <div className="sticky top-28">
                <div className="bg-card border border-border rounded-2xl p-5 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-medium">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-serif text-base font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <nav className="bg-card border border-border rounded-2xl overflow-hidden">
                  {sidebarLinks.map((link, index) => {
                    const isActive = location.pathname === link.href ||
                      (link.href !== "/hesabim" && location.pathname.startsWith(link.href));
                    return (
                      <Link
                        key={link.href}
                        to={link.href}
                        className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                          index > 0 ? "border-t border-border" : ""
                        } ${
                          isActive
                            ? "bg-primary/5 text-primary font-medium"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        }`}
                      >
                        <link.icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                    );
                  })}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-sm w-full border-t border-border text-destructive hover:bg-destructive/5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Çıkış Yap
                  </button>
                </nav>
              </div>
            </motion.aside>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 min-w-0"
            >
              <div className="mb-6">
                <h1 className="font-serif text-2xl lg:text-3xl">{title}</h1>
                {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
              </div>
              {children}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
