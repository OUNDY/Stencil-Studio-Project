import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  User,
  Package,
  Heart,
  Settings,
  MapPin,
  CreditCard,
  Bell,
  LogOut,
  ChevronRight,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar, GlobalWidgets } from "@/components/navigation";
import { Footer } from "@/components/sections";

const menuSections = [
  {
    title: "Siparişler",
    items: [
      { icon: Package, label: "Siparişlerim", href: "/siparislerim", badge: "2" },
      { icon: Heart, label: "Favorilerim", href: "/favorilerim", badge: "5" },
    ],
  },
  {
    title: "Hesap",
    items: [
      { icon: User, label: "Profil Bilgileri", href: "/profil/bilgiler" },
      { icon: MapPin, label: "Adreslerim", href: "/profil/adresler" },
      { icon: CreditCard, label: "Kayıtlı Kartlarım", href: "/profil/kartlar" },
    ],
  },
  {
    title: "Ayarlar",
    items: [
      { icon: Bell, label: "Bildirim Tercihleri", href: "/profil/bildirimler" },
      { icon: Settings, label: "Hesap Ayarları", href: "/profil/ayarlar" },
    ],
  },
];

const Profile = () => {
  const [isLoggedIn] = useState(false); // Mock state - would be replaced with real auth

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isHeroComplete={true} />
        <GlobalWidgets />

        <main className="pt-32 pb-20">
          <div className="container mx-auto px-6">
            <motion.div
              className="max-w-md mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-primary" />
              </div>
              <h1 className="font-serif text-3xl mb-4">Hoş Geldiniz</h1>
              <p className="text-muted-foreground mb-8">
                Siparişlerinizi takip etmek, favorilerinizi kaydetmek ve daha
                fazlası için giriş yapın.
              </p>
              <div className="flex flex-col gap-3">
                <Link to="/giris">
                  <Button className="w-full">Giriş Yap</Button>
                </Link>
                <Link to="/kayit">
                  <Button variant="outline" className="w-full">
                    Hesap Oluştur
                  </Button>
                </Link>
              </div>
            </motion.div>
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
        <div className="container mx-auto px-6">
          {/* Profile header */}
          <motion.div
            className="bg-card border border-border rounded-2xl p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="font-serif text-2xl">Kullanıcı Adı</h1>
                <p className="text-sm text-muted-foreground">
                  kullanici@email.com
                </p>
              </div>
              <Button variant="ghost" size="icon">
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Menu sections */}
          <div className="space-y-6">
            {menuSections.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
              >
                <h2 className="font-medium text-sm text-muted-foreground mb-3 px-1">
                  {section.title}
                </h2>
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  {section.items.map((item, itemIndex) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors ${
                        itemIndex > 0 ? "border-t border-border" : ""
                      }`}
                    >
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <span className="flex-1 font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Logout button */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              variant="ghost"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
