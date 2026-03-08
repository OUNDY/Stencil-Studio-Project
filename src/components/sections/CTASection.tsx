import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
    }
  };

  return (
    <section
      ref={ref}
      className="py-14 lg:py-20 bg-background relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/20 rounded-organic blur-3xl animate-blob-morph" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Headline */}
          <h2 className="text-4xl lg:text-6xl font-serif text-foreground mb-6">
            Duvarlarınız <br className="hidden sm:block" />
            hikaye anlatmaya hazır
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground font-sans mb-10 max-w-xl mx-auto">
            İlham verici tasarımlar, özel teklifler ve yeni koleksiyonlardan
            haberdar olun.
          </p>

          {/* Newsletter form */}
          <motion.form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {!isSubmitted ? (
              <>
                <Input
                  type="email"
                  placeholder="E-posta adresiniz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 rounded-full px-6 bg-card border-border focus:border-primary"
                  required
                />
                <Button
                  type="submit"
                  className="h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-sans shadow-organic-glow group"
                >
                  Katıl
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-3 w-full py-3 px-6 rounded-full bg-secondary text-secondary-foreground"
              >
                <Check className="w-5 h-5" />
                <span className="font-sans">Teşekkürler! Sizi bilgilendireceğiz.</span>
              </motion.div>
            )}
          </motion.form>

          {/* Trust indicators */}
          <motion.div
            className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground font-sans"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              Spam yok
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              İstediğiniz zaman çıkın
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              Özel indirimler
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
