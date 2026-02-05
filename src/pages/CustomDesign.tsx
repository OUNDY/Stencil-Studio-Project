import { motion } from "framer-motion";
import { Navbar } from "@/components/navigation";
import { Footer } from "@/components/sections";
import { Button } from "@/components/ui/button";

const CustomDesign = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar isHeroComplete={true} />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
              Özel Tasarım
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Hayalinizdeki deseni gerçeğe dönüştürün. Size özel stencil tasarımları oluşturuyoruz.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-card rounded-3xl p-8 md:p-12 shadow-organic">
              <h2 className="font-serif text-2xl text-foreground mb-6 text-center">
                Tasarım Talebi
              </h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    İsim
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Adınız ve soyadınız"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="email@ornek.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tasarım Açıklaması
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    placeholder="Hayalinizdeki deseni detaylı olarak anlatın..."
                  />
                </div>
                <Button className="w-full py-6 text-lg">
                  Talep Gönder
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomDesign;
