import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Layers,
  Palette,
  Wand2,
  Keyboard,
  Heart,
  Download,
  Share2,
  ArrowRight,
  Brush,
  Square,
  Mountain,
  Hammer,
  Lightbulb,
  Quote,
} from "lucide-react";
import { motifs } from "@/components/hero/motifs";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ──────────────────────────────────────────────────────────────
   Tuval'e özgü ilham kompozisyonları
   ────────────────────────────────────────────────────────────── */
const compositions = [
  {
    id: "salon-fokus",
    title: "Salon · Tek Odak",
    motif: "Damask",
    color: "#c8714e",
    surface: "Mat duvar",
    desc: "Tek büyük damask, kanepe arkasında merkezi odak. 60×80 cm önerilir.",
    palette: ["#c8714e", "#e8dcc8", "#3d3530"],
  },
  {
    id: "yatak-odasi-ritim",
    title: "Yatak Odası · Ritim",
    motif: "Geometrik",
    color: "#7a9e7e",
    surface: "Kireç boyalı",
    desc: "Yastık formunda tekrar eden geometrik desen. Karyola başlığı genişliğinde grid.",
    palette: ["#7a9e7e", "#f5f0e8", "#4a6789"],
  },
  {
    id: "mutfak-serit",
    title: "Mutfak · Şerit",
    motif: "Mendil Bordürü",
    color: "#4a6789",
    surface: "Fayans arası",
    desc: "Tezgah üstü 15 cm yüksekliğinde sürekli bordür. Su geçirmez vernik şart.",
    palette: ["#4a6789", "#e8c56a", "#f5f0e8"],
  },
];

const surfaces = [
  {
    icon: Square,
    name: "Mat duvar boyası",
    tip: "İdeal yüzey. Akrilik tutar, kenarlar net çıkar.",
    grade: "★★★★★",
  },
  {
    icon: Mountain,
    name: "Kireç / mineral boya",
    tip: "Hafif emici. Fırçayı kuru tut, iki kat geç.",
    grade: "★★★★",
  },
  {
    icon: Hammer,
    name: "Ham ahşap",
    tip: "Önce şeffaf astar. Damarlar görünsün istiyorsan ince bırak.",
    grade: "★★★★",
  },
  {
    icon: Layers,
    name: "Beton / mikro beton",
    tip: "Toz al, primer sür. Sünger tampon en temiz sonucu verir.",
    grade: "★★★",
  },
];

const shortcuts = [
  { keys: ["B"], label: "Fırça modu" },
  { keys: ["G"], label: "Grid / Tekli" },
  { keys: ["[", "]"], label: "Fırça boyutu" },
  { keys: ["⌘", "Z"], label: "Geri al" },
  { keys: ["R"], label: "Tuvali sıfırla" },
  { keys: ["Space"], label: "Kaydır" },
];

const tips = [
  {
    icon: Brush,
    title: "Az boya, çok dokunuş",
    body: "Fırçayı yarım batır, kenarına tampon yap. Sızma %90 azalır.",
  },
  {
    icon: Palette,
    title: "Üç renk yeter",
    body: "Ana ton + bir vurgu + bir nötr. Dördüncüsü kompozisyonu yorar.",
  },
  {
    icon: Lightbulb,
    title: "Önce dene",
    body: "Karton üzerinde 1:1 prova. Duvar geri alınmaz, karton bedavadır.",
  },
];

const community = [
  { author: "Elif K.", room: "Çocuk odası", motif: "Tropikal" },
  { author: "Mert A.", room: "Hol", motif: "Mendil Bordürü" },
  { author: "Zeynep T.", room: "Çalışma odası", motif: "Geometrik" },
  { author: "Cem D.", room: "Kafe duvarı", motif: "Damask" },
];

const faqs = [
  {
    q: "Tuvalde yaptığım tasarımı sipariş edebilir miyim?",
    a: "Evet. Sağ üstteki Paylaş menüsünden 'Sipariş için kaydet' seçeneğiyle ekibimize iletebilirsin. 24 saat içinde dönüş yapıyoruz.",
  },
  {
    q: "Kendi motifimi yükleyebilir miyim?",
    a: "Gelişmiş menüsündeki 'Yüzey & motif' bölümünden SVG veya yüksek kontrastlı PNG yükleyebilirsin. En iyi sonuç için arka planı şeffaf bırak.",
  },
  {
    q: "Tuvaldeki çalışmam kayboluyor mu?",
    a: "Hayır. Renk, fırça ve son durum tarayıcına otomatik kaydedilir. Cihaz değiştirirsen 'Çalışmayı dışa aktar' ile PNG/JSON al.",
  },
  {
    q: "Ne kadar büyük basabilirim?",
    a: "Stencil üretiminde tek parça maksimum 80×120 cm. Daha büyük kompozisyonlar parçalı üretilir, ek yerleri görünmez.",
  },
];

/* ──────────────────────────────────────────────────────────────
   Bölüm
   ────────────────────────────────────────────────────────────── */

const sectionFade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
};

const TuvalShowcase = () => {
  return (
    <>
      {/* ───── Motif Kütüphanesi ───── */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="container mx-auto px-6 py-16 lg:py-20">
          <motion.div {...sectionFade} className="mb-10 flex items-end justify-between gap-6">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary/80">
                kütüphane
              </span>
              <h2 className="mt-2 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
                Hazır motif arşivi
              </h2>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                Tuvale tek tıkla taşı, rengini değiştir, dene. Hepsi vektörel —
                istediğin boyutta keskin kalır.
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/koleksiyon">
                Tüm koleksiyon <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {motifs.slice(0, 6).map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-[0_10px_30px_-15px_hsl(var(--primary)/0.4)]"
              >
                <div
                  className="aspect-square w-full text-foreground/80 transition-transform duration-500 group-hover:scale-110 group-hover:text-primary"
                  dangerouslySetInnerHTML={{ __html: m.svg }}
                />
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-foreground">{m.name}</h4>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                    {m.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── İlham Kompozisyonları ───── */}
      <section className="border-t border-border/60 bg-background">
        <div className="container mx-auto px-6 py-16 lg:py-20">
          <motion.div {...sectionFade} className="mb-10 max-w-2xl">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary/80">
              ilham
            </span>
            <h2 className="mt-2 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
              Hazır kompozisyonlar
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Mekana göre kürate edilmiş başlangıç noktaları. Birini seç,
              tuvalde aç, üzerinden kendi versiyonunu kur.
            </p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-3">
            {compositions.map((c, i) => (
              <motion.article
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_hsl(var(--foreground)/0.25)]"
              >
                <div
                  className="relative aspect-[4/3] overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${c.palette[1]} 0%, ${c.palette[0]}22 100%)`,
                  }}
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-70 transition-transform duration-700 group-hover:scale-110"
                    style={{ color: c.color }}
                    dangerouslySetInnerHTML={{
                      __html:
                        motifs.find((m) => m.name === c.motif)?.svg ?? motifs[0].svg,
                    }}
                  />
                  <div className="absolute right-3 top-3 flex gap-1">
                    {c.palette.map((p) => (
                      <span
                        key={p}
                        className="h-4 w-4 rounded-full border border-white/60 shadow-sm"
                        style={{ background: p }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {c.surface}
                  </div>
                  <h3 className="mt-1 font-serif text-xl text-foreground">
                    {c.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {c.desc}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4 self-start px-0 text-primary hover:bg-transparent hover:text-primary/80"
                  >
                    Tuvalde aç <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Yüzey Rehberi + İpuçları (split) ───── */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="container mx-auto grid gap-12 px-6 py-16 lg:grid-cols-5 lg:py-20">
          {/* Yüzey rehberi */}
          <motion.div {...sectionFade} className="lg:col-span-3">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary/80">
              yüzey rehberi
            </span>
            <h2 className="mt-2 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
              Hangi zemine ne yapışır?
            </h2>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">
              Tuvaldeki sonuç, gerçekteki yüzeye göre değişir. Aşağıdaki
              uyumluluk kısa ve dürüst.
            </p>

            <div className="mt-6 divide-y divide-border/70 rounded-2xl border border-border bg-card">
              {surfaces.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.name}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-medium text-foreground">
                          {s.name}
                        </h4>
                        <span className="font-mono text-[11px] tracking-wider text-primary">
                          {s.grade}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {s.tip}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* İpuçları */}
          <motion.div {...sectionFade} className="lg:col-span-2">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary/80">
              ustalardan
            </span>
            <h2 className="mt-2 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
              Üç altın kural
            </h2>

            <div className="mt-6 space-y-3">
              {tips.map((t) => {
                const Icon = t.icon;
                return (
                  <div
                    key={t.title}
                    className="rounded-2xl border border-border bg-card p-5"
                  >
                    <div className="flex items-center gap-2 text-primary">
                      <Icon className="h-4 w-4" />
                      <h4 className="text-sm font-medium text-foreground">
                        {t.title}
                      </h4>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {t.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── Klavye Kısayolları ───── */}
      <section className="border-t border-border/60 bg-background">
        <div className="container mx-auto px-6 py-16 lg:py-20">
          <motion.div {...sectionFade} className="mb-8 flex items-center gap-3">
            <Keyboard className="h-5 w-5 text-primary" />
            <h2 className="font-serif text-2xl tracking-tight text-foreground sm:text-3xl">
              Hızlı çalış — kısayollar
            </h2>
          </motion.div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {shortcuts.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
              >
                <span className="text-sm text-foreground">{s.label}</span>
                <div className="flex items-center gap-1">
                  {s.keys.map((k) => (
                    <kbd
                      key={k}
                      className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground shadow-[0_1px_0_hsl(var(--foreground)/0.1)]"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Topluluk Eserleri ───── */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="container mx-auto px-6 py-16 lg:py-20">
          <motion.div
            {...sectionFade}
            className="mb-10 flex flex-wrap items-end justify-between gap-6"
          >
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary/80">
                topluluk
              </span>
              <h2 className="mt-2 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
                Bu tuvalde doğanlar
              </h2>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                Kullanıcılarımızın kendi mekanlarına taşıdığı kompozisyonlar.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {community.map((p, i) => {
              const m = motifs.find((mm) => mm.name === p.motif) ?? motifs[0];
              return (
                <motion.div
                  key={p.author}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-background text-primary/60 transition-transform duration-700 group-hover:scale-110"
                    dangerouslySetInnerHTML={{ __html: m.svg }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/80 to-transparent p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-foreground">
                          {p.author}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {p.room} · {p.motif}
                        </div>
                      </div>
                      <button
                        aria-label="Beğen"
                        className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                      >
                        <Heart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── SSS ───── */}
      <section className="border-t border-border/60 bg-background">
        <div className="container mx-auto max-w-3xl px-6 py-16 lg:py-20">
          <motion.div {...sectionFade} className="mb-8 text-center">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary/80">
              tuval hakkında
            </span>
            <h2 className="mt-2 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
              Sık sorulanlar
            </h2>
          </motion.div>

          <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-2">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-border last:border-b-0"
              >
                <AccordionTrigger className="px-4 text-left text-sm font-medium text-foreground hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="px-4 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ───── Kapanış CTA ───── */}
      <section className="border-t border-border/60 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-6 py-20 lg:py-28">
          <motion.div
            {...sectionFade}
            className="mx-auto max-w-3xl text-center"
          >
            <Quote className="mx-auto h-8 w-8 text-primary/40" />
            <p className="mt-6 font-serif text-2xl leading-snug text-foreground sm:text-3xl">
              "Tuval, duvardaki cesaretsizliğin panzehiri. Önce burada
              yanıl — duvar bağışlamaz, ekran bağışlar."
            </p>
            <div className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              stencil studio · atölye notu
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/ozel-tasarim">
                  <Wand2 className="mr-2 h-4 w-4" />
                  Tasarımı sipariş et
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link to="/koleksiyon">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Hazır koleksiyona bak
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="rounded-full">
                <Link to="/iletisim">
                  <Share2 className="mr-2 h-4 w-4" />
                  Çalışmamı paylaş
                </Link>
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Download className="h-3.5 w-3.5" />
                Yüksek çözünürlük PNG / SVG
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-3.5 w-3.5" />
                Tuval otomatik kaydedilir
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                Sınırsız deneme
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default TuvalShowcase;
