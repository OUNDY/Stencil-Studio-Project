import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, Mail, Phone, MapPin, MessageCircle, Clock, Send } from "lucide-react";
import { Navbar, GlobalWidgets } from "@/components/navigation";
import { Footer } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Lütfen ad, e-posta ve mesaj alanlarını doldurun.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast.success("Mesajınız iletildi. En kısa sürede dönüş yapacağız.");
    }, 900);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isHeroComplete={true} />
      <GlobalWidgets />

      <main className="pt-16">
        <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
          <div className="container mx-auto px-6 py-12 lg:py-16">
            <nav aria-label="breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Ana Sayfa</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground">İletişim</span>
            </nav>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 backdrop-blur mb-4">
                <MessageCircle className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary/80">bize ulaş</span>
              </div>
              <h1 className="font-serif text-4xl lg:text-5xl text-foreground tracking-tight">
                İletişim
              </h1>
              <p className="mt-3 text-base lg:text-lg text-muted-foreground max-w-2xl">
                Soruların, önerilerin ya da özel tasarım talebin için buradayız.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-6 grid gap-10 lg:grid-cols-3">
            {/* Sol: kanallar */}
            <div className="lg:col-span-1 space-y-4">
              {[
                { icon: Mail, title: "E-posta", value: "merhaba@stencilstudio.com", note: "24 saat içinde dönüş" },
                { icon: Phone, title: "Telefon", value: "+90 (212) 555 00 00", note: "Hafta içi 09:00 — 18:00" },
                { icon: MapPin, title: "Atölye", value: "Karaköy, İstanbul", note: "Randevu ile ziyaret" },
                { icon: Clock, title: "Çalışma Saatleri", value: "Hafta içi 09:00 — 18:00", note: "Hafta sonu kapalı" },
              ].map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.title} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">{c.title}</p>
                      <p className="text-sm text-foreground font-medium mt-0.5">{c.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sağ: form */}
            <div className="lg:col-span-2">
              <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-6 lg:p-10 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Ad Soyad *</label>
                    <input value={form.name} onChange={update("name")} placeholder="Adınız"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">E-posta *</label>
                    <input type="email" value={form.email} onChange={update("email")} placeholder="ornek@email.com"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Konu</label>
                  <input value={form.subject} onChange={update("subject")} placeholder="Mesajınızın konusu"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Mesaj *</label>
                  <textarea value={form.message} onChange={update("message")} rows={6} placeholder="Sizi nasıl destekleyebiliriz?"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
                </div>
                <div className="flex items-center justify-between gap-3 pt-2">
                  <p className="text-xs text-muted-foreground">
                    Mesajını göndererek <Link to="/gizlilik-politikasi" className="text-primary hover:underline">Gizlilik Politikası</Link>'nı kabul etmiş sayılırsın.
                  </p>
                  <Button type="submit" disabled={loading} className="rounded-full px-6 flex-shrink-0">
                    {loading ? "Gönderiliyor..." : <>Gönder <Send className="w-4 h-4" /></>}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
