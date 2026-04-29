import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Instagram, Twitter, Youtube, Mail, MapPin, Phone } from "lucide-react";

const footerLinks = {
  products: [
    { label: "Koleksiyon", to: "/koleksiyon" },
    { label: "Tuval Alanı", to: "/tuval" },
    { label: "Özel Tasarım", to: "/ozel-tasarim" },
    { label: "Nasıl Çalışır", to: "/nasil-calisir" },
  ],
  company: [
    { label: "Hakkımızda", to: "/hakkimizda" },
    { label: "Blog", to: "/blog" },
    { label: "Kariyer", to: "/kariyer" },
    { label: "İletişim", to: "/iletisim" },
  ],
  support: [
    { label: "SSS", to: "/sss" },
    { label: "Kargo Bilgisi", to: "/kargo-bilgisi" },
    { label: "İade Politikası", to: "/iade-politikasi" },
    { label: "Gizlilik Politikası", to: "/gizlilik-politikasi" },
    { label: "Kullanım Koşulları", to: "/kullanim-kosullari" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Youtube, href: "https://youtube.com", label: "Youtube" },
];

export const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-6 py-16 lg:py-20">
        {/* Top section */}
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-8 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6 w-fit" aria-label="Stencil Studio anasayfa">
              <div className="w-10 h-10 flex items-center justify-center text-primary">
                <PeacockLogo className="w-10 h-10" />
              </div>
              <span className="font-serif text-xl text-foreground">Stencil Studio</span>
            </Link>
            <p className="text-muted-foreground font-sans text-sm leading-relaxed mb-6 max-w-sm">
              Yaratıcılığınızı duvarlarınıza taşıyın. Profesyonel şablonlar,
              kolay uygulama, sınırsız olasılıklar.
            </p>

            {/* Contact info */}
            <div className="space-y-3 text-sm text-muted-foreground">
              <a href="mailto:merhaba@stencilstudio.com" className="flex items-center gap-3 hover:text-foreground transition-colors">
                <Mail className="w-4 h-4" />
                <span>merhaba@stencilstudio.com</span>
              </a>
              <a href="tel:+902125550000" className="flex items-center gap-3 hover:text-foreground transition-colors">
                <Phone className="w-4 h-4" />
                <span>+90 (212) 555 00 00</span>
              </a>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4" />
                <span>İstanbul, Türkiye</span>
              </div>
            </div>
          </div>

          {/* Links columns */}
          <div>
            <h3 className="font-sans font-medium text-foreground mb-4">Ürünler</h3>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans font-medium text-foreground mb-4">Şirket</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans font-medium text-foreground mb-4">Destek</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-border">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground font-sans order-2 md:order-1">
            © {new Date().getFullYear()} Stencil Studio. Tüm hakları saklıdır.
          </p>

          {/* Social links */}
          <div className="flex items-center gap-4 order-1 md:order-2">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
