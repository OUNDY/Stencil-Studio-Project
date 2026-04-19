import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronDown, Search, HelpCircle } from "lucide-react";
import { Navbar, GlobalWidgets } from "@/components/navigation";
import { Footer } from "@/components/sections";

const faqs = [
  {
    category: "Sipariş",
    items: [
      { q: "Siparişim ne zaman kargoya verilir?", a: "Stoktaki ürünler 1-2 iş günü içinde kargoya verilir. Özel tasarım siparişler için hazırlık süresi 5-7 iş günüdür." },
      { q: "Siparişimi nasıl takip ederim?", a: "Sipariş kargoya verildiğinde size bir takip numarası ile birlikte e-posta gönderilir. Hesabım > Siparişlerim sayfasından da takip edebilirsiniz." },
      { q: "Siparişimi iptal edebilir miyim?", a: "Sipariş kargoya verilmeden önce hesabınızdan iptal edebilirsiniz. Kargoya çıktıysa iade prosedürünü uygulamanız gerekir." },
    ],
  },
  {
    category: "Ürün & Kullanım",
    items: [
      { q: "Şablonlar tek kullanımlık mı?", o: "Hayır.", a: "Polyester (mylar) şablonlarımız uygun bakımla onlarca kez kullanılabilir. Her kullanım sonrası ılık suyla temizleyip düz şekilde saklayın." },
      { q: "Hangi yüzeylere uygulanabilir?", a: "Boyanabilen tüm düz yüzeylerde (duvar, ahşap, beton, kumaş, cam) kullanılabilir. Pürüzlü yüzeylerde önce astar uygulanması önerilir." },
      { q: "Hangi boyayı kullanmalıyım?", a: "Akrilik veya su bazlı duvar boyaları en iyi sonucu verir. Sprey boya kullanıyorsanız çok katmanlı, ince püskürtmeler tercih edin." },
    ],
  },
  {
    category: "Ödeme & Kargo",
    items: [
      { q: "Hangi ödeme yöntemleri kabul ediliyor?", a: "Kredi/banka kartı, havale/EFT, kapıda ödeme ve taksit seçenekleri sunuyoruz." },
      { q: "Kargo ücreti ne kadar?", a: "300 TL ve üzeri siparişlerde kargo ücretsizdir. Daha düşük tutarlı siparişlerde sabit 39 TL kargo ücreti uygulanır." },
      { q: "Yurt dışına gönderim yapıyor musunuz?", a: "Evet, AB ülkeleri ve seçili ülkelere uluslararası kargo ile gönderim yapıyoruz. Kargo ücreti çıkışta hesaplanır." },
    ],
  },
  {
    category: "İade & Değişim",
    items: [
      { q: "İade süresi ne kadar?", a: "Ürünü teslim aldıktan sonra 14 gün içinde iade talebi oluşturabilirsiniz. Detaylar için İade Politikası sayfamızı ziyaret edin." },
      { q: "Dijital ürünler iade edilebilir mi?", a: "Hayır. Dijital indirilebilir ürünler indirme gerçekleştikten sonra iade kabul edilmez." },
      { q: "Hasarlı ürün geldi, ne yapmalıyım?", a: "Teslim alırken hasar tespit ederseniz kargoyu kabul etmeyin. Kabul ettikten sonra fark ettiyseniz 24 saat içinde fotoğrafla bize bildirin; ücretsiz değişim yaparız." },
    ],
  },
];

const FAQ = () => {
  const [search, setSearch] = useState("");
  const [openIdx, setOpenIdx] = useState<string | null>(null);

  const filtered = faqs
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (it) =>
          it.q.toLowerCase().includes(search.toLowerCase()) ||
          it.a.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar isHeroComplete={true} />
      <GlobalWidgets />

      <main className="pt-16">
        <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
          <div className="container mx-auto px-6 py-12 lg:py-16 max-w-4xl">
            <nav aria-label="breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Ana Sayfa</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground">SSS</span>
            </nav>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 backdrop-blur mb-4">
                <HelpCircle className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary/80">Yardım merkezi</span>
              </div>
              <h1 className="font-serif text-4xl lg:text-5xl text-foreground tracking-tight">
                Sıkça Sorulan Sorular
              </h1>
              <p className="mt-3 text-base lg:text-lg text-muted-foreground max-w-2xl">
                Aklındaki soruyu burada bulamazsan <Link to="/iletisim" className="text-primary hover:underline">bize ulaş</Link>.
              </p>
            </motion.div>

            {/* Search */}
            <div className="mt-8 relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Soru ara..."
                className="w-full pl-11 pr-4 py-3 rounded-full bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-6 max-w-4xl space-y-10">
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-12">
                "{search}" için sonuç bulunamadı.
              </p>
            )}
            {filtered.map((cat) => (
              <div key={cat.category}>
                <h2 className="font-serif text-2xl text-foreground mb-4">{cat.category}</h2>
                <div className="space-y-2">
                  {cat.items.map((it, i) => {
                    const id = `${cat.category}-${i}`;
                    const open = openIdx === id;
                    return (
                      <div key={id} className="rounded-2xl border border-border bg-card overflow-hidden">
                        <button
                          onClick={() => setOpenIdx(open ? null : id)}
                          className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                        >
                          <span className="font-medium text-foreground">{it.q}</span>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
                        </button>
                        {open && (
                          <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                            {it.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
