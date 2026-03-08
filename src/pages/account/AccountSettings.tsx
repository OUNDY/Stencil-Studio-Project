import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Globe, Palette, Trash2, Shield, CreditCard, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const AccountSettings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const { user } = useAuth();

  const handlePasswordChange = () => {
    toast.success("Şifre değiştirme bağlantısı e-posta adresinize gönderildi");
  };

  return (
    <AccountLayout title="Hesap Ayarları" subtitle="Hesabınızın güvenlik ve tercihlerini yönetin">
      <div className="space-y-6">
        {/* Password */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h2 className="font-medium flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-muted-foreground" />
            Şifre Değiştir
          </h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Mevcut Şifre</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Yeni Şifre</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Yeni Şifre (Tekrar)</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <Button onClick={handlePasswordChange}>Şifreyi Güncelle</Button>
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h2 className="font-medium flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            Ödeme Yöntemleri
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <div className="w-10 h-7 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">VISA</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">Son kullanma: 12/26</p>
              </div>
              <span className="text-xs text-primary font-medium">Varsayılan</span>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Yeni Kart Ekle
            </Button>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h2 className="font-medium flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4 text-muted-foreground" />
            Tercihler
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Karanlık Mod</p>
                <p className="text-xs text-muted-foreground">Koyu renk temasını kullan</p>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Dil
                </p>
                <p className="text-xs text-muted-foreground">Arayüz dili seçimi</p>
              </div>
              <span className="text-sm text-muted-foreground">Türkçe</span>
            </div>
          </div>
        </motion.div>

        {/* Privacy & Legal */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h2 className="font-medium flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Gizlilik ve Yasal
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Pazarlama E-postaları</p>
                <p className="text-xs text-muted-foreground">Kampanya ve indirim e-postaları alın</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div>
                <p className="text-sm font-medium">Veri Paylaşımı</p>
                <p className="text-xs text-muted-foreground">Kullanım verilerini anonim olarak paylaş</p>
              </div>
              <Switch />
            </div>
            <div className="pt-3 border-t border-border flex gap-3">
              <Button variant="link" size="sm" className="text-xs p-0 h-auto text-muted-foreground">
                Kullanım Koşulları
              </Button>
              <Button variant="link" size="sm" className="text-xs p-0 h-auto text-muted-foreground">
                Gizlilik Politikası
              </Button>
              <Button variant="link" size="sm" className="text-xs p-0 h-auto text-muted-foreground">
                Verilerimi İndir
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h2 className="font-medium flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-muted-foreground" />
            Güvenlik
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">İki Faktörlü Doğrulama</p>
                <p className="text-xs text-muted-foreground">Hesabınıza ek güvenlik katmanı ekleyin</p>
              </div>
              <Button variant="outline" size="sm">Etkinleştir</Button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <p className="text-sm font-medium">Oturum Yönetimi</p>
                <p className="text-xs text-muted-foreground">Aktif oturumlar: 1 cihaz</p>
              </div>
              <Button variant="outline" size="sm">Oturumları Gör</Button>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-destructive/30 rounded-2xl p-6"
        >
          <h2 className="font-medium flex items-center gap-2 mb-2 text-destructive">
            <Trash2 className="w-4 h-4" />
            Tehlikeli Bölge
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinir. Bu işlem geri alınamaz.
          </p>
          <Button variant="destructive" size="sm">Hesabımı Sil</Button>
        </motion.div>
      </div>
    </AccountLayout>
  );
};

export default AccountSettings;
