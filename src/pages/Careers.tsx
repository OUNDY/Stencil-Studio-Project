import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, Briefcase, MapPin, Clock, Heart, Coffee, Users } from "lucide-react";
import { Navbar, GlobalWidgets } from "@/components/navigation";
import { Footer } from "@/components/sections";
import { Button } from "@/components/ui/button";

const positions = [
  {
    title: "Ürün Tasarımcısı (Stencil Motif)",
    location: "İstanbul / Hibrit",
    type: "Tam zamanlı",
    desc: "Yeni motif koleksiyonlarımızı tasarlayacak, üretim için hazırlayacak bir tasarımcı arıyoruz.",
  },
  {
    title: "E-ticaret Operasyon Uzmanı",
    location: "İstanbul",
    type: "Tam zamanlı",
    desc: "Sipariş, kargo ve müşteri deneyimi süreçlerini iyileştirecek detaycı bir takım arkadaşı.",
  },
  {
    title: "İçerik & Topluluk Editörü",
    location: "Uzaktan",
    type: "Yarı zamanlı",
    desc: "Blog yazıları, sosyal medya ve topluluk etkileşimini yönetecek üretken bir kalem.",
  },
  {
    title: "Frontend Developer (React)",
    location: "İstanbul / Uzaktan",
    type: "Tam zamanlı",
    desc: "Stencil Studio'nun web deneyimini birlikte geliştirecek, detayları seven bir geliştirici.",
  },
];

const perks = [
  { icon: Heart, title: "Sağlık", desc: "Özel sağlık sigortası" },
  { icon: Coffee, title: "Esnek Çalışma", desc: "Hibrit veya tam uzaktan" },
  { icon: Users, title: "Atölye Günleri", desc: "Aylık yaratıcı atölye" },
  { icon: Briefcase, title: "Eğitim Bütçesi", desc: "Yıllık kişisel gelişim" },
];

const Careers = () => (
  <div className="min-h-screen bg-background">
    <Navbar isHeroComplete={true} />
    <GlobalWidgets />

    <main className="pt-16">
      <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
        <div className="container mx-auto px-6 py-12 lg:py-16">
          <nav aria-label="breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Ana Sayfa</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">Kariyer</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 backdrop-blur mb-4">
              <Briefcase className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary/80">bize katıl</span>
            </div>
            <h1 className="font-serif text-4xl lg:text-5xl text-foreground tracking-tight">
              Birlikte güzel şeyler yapalım.
            </h1>
            <p className="mt-4 text-base lg:text-lg text-muted-foreground">
              Stencil Studio; tasarım, zanaat ve teknolojiyi bir araya getiren küçük ama tutkulu bir takımız.
              Sıradanın dışına çıkmaya istekli, detaycı insanlarla tanışmak istiyoruz.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Perks */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-6">
          <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-8">Burada çalışmak nasıl?</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="rounded-2xl border border-border bg-card p-5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open positions */}
      <section className="pb-16 lg:pb-24">
        <div className="container mx-auto px-6">
          <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-8">Açık Pozisyonlar</h2>
          <div className="space-y-3">
            {positions.map((pos, i) => (
              <motion.div
                key={pos.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group rounded-2xl border border-border bg-card p-5 lg:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-serif text-xl text-foreground group-hover:text-primary transition-colors">{pos.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{pos.desc}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {pos.location}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {pos.type}</span>
                  </div>
                </div>
                <Button asChild variant="outline" className="rounded-full self-start lg:self-center">
                  <a href="mailto:kariyer@stencilstudio.com?subject=Başvuru: {pos.title}">
                    Başvur
                  </a>
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-border bg-muted/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Listede uygun bir pozisyon yok mu? Yine de yazabilirsin —{" "}
              <a href="mailto:kariyer@stencilstudio.com" className="text-primary hover:underline">
                kariyer@stencilstudio.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default Careers;
