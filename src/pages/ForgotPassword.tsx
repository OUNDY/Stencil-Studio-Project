import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/navigation";
import { Footer } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Lütfen e-posta adresinizi girin.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
      toast.success("Sıfırlama bağlantısı gönderildi.");
    }, 900);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar isHeroComplete={true} />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-3xl p-6 sm:p-8 md:p-10 shadow-organic border border-border">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                {submitted ? (
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                ) : (
                  <Mail className="w-8 h-8 text-primary" />
                )}
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl text-foreground mb-2">
                {submitted ? "E-posta Gönderildi" : "Şifrenizi mi Unuttunuz?"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {submitted
                  ? `${email} adresine sıfırlama bağlantısı gönderdik.`
                  : "Kayıtlı e-postanı yaz, sana sıfırlama bağlantısı gönderelim."}
              </p>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    E-posta
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full rounded-xl" size="lg" disabled={isLoading}>
                  {isLoading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground bg-muted/40 border border-border rounded-xl p-4">
                  E-postayı bulamadıysan spam klasörüne bakmayı dene. Bağlantı 30 dakika geçerlidir.
                </p>
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail("");
                  }}
                >
                  Farklı bir e-posta dene
                </Button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-border text-center">
              <Link
                to="/giris"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Girişe geri dön
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
