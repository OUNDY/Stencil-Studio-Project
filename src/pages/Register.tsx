import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/navigation";
import { Footer } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const passwordRequirements = [
  { label: "En az 8 karakter", check: (p: string) => p.length >= 8 },
  { label: "Bir büyük harf", check: (p: string) => /[A-Z]/.test(p) },
  { label: "Bir rakam", check: (p: string) => /[0-9]/.test(p) },
];

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) return;
    setIsLoading(true);
    setTimeout(() => {
      login(email, name, "user");
      toast.success("Hesabınız oluşturuldu!");
      setIsLoading(false);
      navigate("/hesabim");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar isHeroComplete={true} />
      
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-3xl p-8 md:p-10 shadow-organic border border-border">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-serif text-2xl">S</span>
              </div>
              <h1 className="font-serif text-3xl text-foreground mb-2">Hesap Oluşturun</h1>
              <p className="text-sm text-muted-foreground">Yaratıcı yolculuğunuza bugün başlayın</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Ad Soyad</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Adınız Soyadınız" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">E-posta</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="email@ornek.com" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {password && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-1 pt-2">
                    {passwordRequirements.map((req) => (
                      <div key={req.label} className={`flex items-center gap-2 text-xs ${req.check(password) ? "text-primary" : "text-muted-foreground"}`}>
                        <Check className={`w-3 h-3 ${req.check(password) ? "opacity-100" : "opacity-30"}`} />
                        {req.label}
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              <div className="flex items-start gap-3">
                <button type="button" onClick={() => setAcceptTerms(!acceptTerms)} className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${acceptTerms ? "bg-primary border-primary" : "border-border hover:border-primary/50"}`}>
                  {acceptTerms && <Check className="w-3 h-3 text-primary-foreground" />}
                </button>
                <span className="text-xs text-muted-foreground leading-relaxed">
                  <Link to="/kullanim-kosullari" className="text-primary hover:underline">Kullanım Koşulları</Link>'nı ve{" "}
                  <Link to="/gizlilik-politikasi" className="text-primary hover:underline">Gizlilik Politikası</Link>'nı okudum ve kabul ediyorum.
                </span>
              </div>

              <Button type="submit" className="w-full py-6 text-base" disabled={isLoading || !acceptTerms}>
                {isLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                ) : (
                  <>Hesap Oluştur<ArrowRight className="w-5 h-5 ml-2" /></>
                )}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-4 text-muted-foreground">veya</span></div>
            </div>

            <div className="space-y-3">
              <button className="w-full py-3 px-4 border border-border rounded-xl flex items-center justify-center gap-3 hover:bg-accent transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-sm font-medium">Google ile kayıt ol</span>
              </button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8">
              Zaten hesabınız var mı?{" "}
              <Link to="/giris" className="text-primary font-medium hover:underline">Giriş yapın</Link>
            </p>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Register;
