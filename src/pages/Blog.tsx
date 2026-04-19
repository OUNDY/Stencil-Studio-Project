import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, BookOpen, ArrowRight, Clock } from "lucide-react";
import { Navbar, GlobalWidgets } from "@/components/navigation";
import { Footer } from "@/components/sections";

const posts = [
  {
    id: "1",
    title: "Stencil ile Duvar Boyamanın 7 Altın Kuralı",
    excerpt: "Profesyonel görünümlü sonuçlar elde etmek için doğru fırça, boya ve sıralama hakkında bilmen gereken her şey.",
    category: "Rehber",
    readTime: "6 dk",
    date: "12 Mart 2026",
    cover: "linear-gradient(135deg, hsl(var(--primary)/0.3), hsl(var(--accent)/0.4))",
  },
  {
    id: "2",
    title: "Küçük Mekânları Geometrik Motiflerle Genişletmek",
    excerpt: "Doğru desen seçimi ile dar koridorları, küçük yatak odalarını nasıl daha ferah gösterebilirsin.",
    category: "İlham",
    readTime: "4 dk",
    date: "5 Mart 2026",
    cover: "linear-gradient(135deg, hsl(var(--secondary)/0.4), hsl(var(--muted)))",
  },
  {
    id: "3",
    title: "Sürdürülebilir Boya ile Stencil Uygulaması",
    excerpt: "VOC oranı düşük, doğa dostu boyalarla nasıl güzel ve sağlıklı sonuçlar alabilirsin.",
    category: "Sürdürülebilirlik",
    readTime: "5 dk",
    date: "26 Şubat 2026",
    cover: "linear-gradient(135deg, hsl(155 45% 60% / 0.3), hsl(var(--accent)/0.3))",
  },
  {
    id: "4",
    title: "Kendi Motifini Tasarlamak: SVG'den Stencil'e",
    excerpt: "Illustrator veya Figma'da bir motifi nasıl üretime hazır şablona dönüştürürsün — adım adım.",
    category: "Atölye",
    readTime: "8 dk",
    date: "19 Şubat 2026",
    cover: "linear-gradient(135deg, hsl(265 50% 60% / 0.3), hsl(var(--primary)/0.3))",
  },
  {
    id: "5",
    title: "Çocuk Odasına Yaratıcı Stencil Fikirleri",
    excerpt: "Yaşa göre motif seçimi, güvenli boya tercihi ve kolay temizlenebilir uygulama önerileri.",
    category: "İlham",
    readTime: "5 dk",
    date: "10 Şubat 2026",
    cover: "linear-gradient(135deg, hsl(35 80% 70% / 0.4), hsl(var(--accent)/0.3))",
  },
  {
    id: "6",
    title: "Stencil Bakımı: Aynı Şablonu Yıllarca Kullanmak",
    excerpt: "Polyester şablonların ömrünü uzatmak için temizlik, kurutma ve saklama tüyoları.",
    category: "Rehber",
    readTime: "3 dk",
    date: "1 Şubat 2026",
    cover: "linear-gradient(135deg, hsl(var(--muted)), hsl(var(--primary)/0.2))",
  },
];

const Blog = () => (
  <div className="min-h-screen bg-background">
    <Navbar isHeroComplete={true} />
    <GlobalWidgets />

    <main className="pt-16">
      <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
        <div className="container mx-auto px-6 py-12 lg:py-16">
          <nav aria-label="breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Ana Sayfa</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">Blog</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 backdrop-blur mb-4">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary/80">stencil günlüğü</span>
            </div>
            <h1 className="font-serif text-4xl lg:text-5xl text-foreground tracking-tight">Blog</h1>
            <p className="mt-3 text-base lg:text-lg text-muted-foreground max-w-2xl">
              Atölyeden ilham, rehber ve hikâyeler — ellerinin yeni bir şeye dokunmasına yardımcı olsun diye.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group rounded-2xl overflow-hidden border border-border bg-card hover:shadow-lg transition-shadow flex flex-col"
            >
              <div className="aspect-[4/3] relative overflow-hidden" style={{ background: p.cover }}>
                <div className="absolute inset-0 flex items-end p-4">
                  <span className="text-[10px] uppercase tracking-widest font-medium px-2.5 py-1 rounded-full bg-card/90 text-foreground backdrop-blur">
                    {p.category}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <span>{p.date}</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {p.readTime}
                  </span>
                </div>
                <h2 className="font-serif text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                  {p.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{p.excerpt}</p>
                <button className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary self-start">
                  Devamını oku <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-10">
          Yeni yazılar için <Link to="/" className="text-primary hover:underline">bültenimize abone ol</Link>.
        </p>
      </section>
    </main>

    <Footer />
  </div>
);

export default Blog;
