import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Globe, Palette, Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AccountLayout } from "@/components/account/AccountLayout";
import { toast } from "sonner";

const AccountSettings = () => {
  const [darkMode, setDarkMode] = useState(false);

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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">İki Faktörlü Doğrulama</p>
              <p className="text-xs text-muted-foreground">Hesabınıza ek güvenlik katmanı ekleyin</p>
            </div>
            <Button variant="outline" size="sm">Etkinleştir</Button>
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
