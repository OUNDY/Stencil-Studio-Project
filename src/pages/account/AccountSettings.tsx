import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Globe, Palette, Trash2, Shield, CreditCard, FileText, Plus, Eye, EyeOff, Smartphone, Monitor, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PaymentCard {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  icon: typeof Monitor;
}

const AccountSettings = () => {
  const { user, logout } = useAuth();

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Preferences
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);

  // Payment cards
  const [cards, setCards] = useState<PaymentCard[]>([
    { id: "1", brand: "VISA", last4: "4242", expiry: "12/26", isDefault: true },
  ]);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [newCard, setNewCard] = useState({ number: "", name: "", expiry: "", cvv: "" });

  // Sessions
  const [sessions] = useState<Session[]>([
    { id: "1", device: "Windows PC", browser: "Chrome 120", location: "İstanbul, TR", lastActive: "Şu an aktif", isCurrent: true, icon: Monitor },
    { id: "2", device: "iPhone 15", browser: "Safari", location: "İstanbul, TR", lastActive: "2 saat önce", isCurrent: false, icon: Smartphone },
  ]);
  const [sessionsDialogOpen, setSessionsDialogOpen] = useState(false);

  // 2FA
  const [twoFADialogOpen, setTwoFADialogOpen] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");

  // Delete account
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Handlers
  const handlePasswordChange = () => {
    if (!currentPassword) { toast.error("Mevcut şifrenizi girin"); return; }
    if (newPassword.length < 6) { toast.error("Yeni şifre en az 6 karakter olmalı"); return; }
    if (newPassword !== confirmPassword) { toast.error("Yeni şifreler eşleşmiyor"); return; }
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    toast.success("Şifreniz başarıyla güncellendi");
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle("dark", checked);
    localStorage.setItem("stencil_theme", checked ? "dark" : "light");
    toast.success(checked ? "Karanlık mod açıldı" : "Aydınlık mod açıldı");
  };

  const handleAddCard = () => {
    if (!newCard.number || !newCard.name || !newCard.expiry || !newCard.cvv) {
      toast.error("Lütfen tüm kart bilgilerini doldurun"); return;
    }
    const card: PaymentCard = {
      id: Date.now().toString(),
      brand: newCard.number.startsWith("4") ? "VISA" : "MC",
      last4: newCard.number.slice(-4),
      expiry: newCard.expiry,
      isDefault: cards.length === 0,
    };
    setCards((prev) => [...prev, card]);
    setNewCard({ number: "", name: "", expiry: "", cvv: "" });
    setCardDialogOpen(false);
    toast.success("Kart başarıyla eklendi");
  };

  const removeCard = (id: string) => {
    setCards((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (filtered.length > 0 && !filtered.some((c) => c.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
    toast.success("Kart silindi");
  };

  const setDefaultCard = (id: string) => {
    setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
    toast.success("Varsayılan kart güncellendi");
  };

  const handleEndSession = (id: string) => {
    toast.success("Oturum sonlandırıldı");
  };

  const handleEnable2FA = () => {
    if (twoFACode.length !== 6) { toast.error("6 haneli doğrulama kodunu girin"); return; }
    setTwoFAEnabled(true);
    setTwoFADialogOpen(false);
    setTwoFACode("");
    toast.success("İki faktörlü doğrulama etkinleştirildi");
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== "HESABIMI SİL") { toast.error("Lütfen onay metnini doğru yazın"); return; }
    logout();
    toast.success("Hesabınız silindi");
    setDeleteDialogOpen(false);
  };

  return (
    <AccountLayout title="Hesap Ayarları" subtitle="Hesabınızın güvenlik ve tercihlerini yönetin">
      <div className="space-y-6">
        {/* Password */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-medium flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-muted-foreground" />
            Şifre Değiştir
          </h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Mevcut Şifre</label>
              <div className="relative">
                <Input type={showCurrentPw ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Yeni Şifre</label>
              <div className="relative">
                <Input type={showNewPw ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {newPassword && (
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${newPassword.length >= i * 3 ? (newPassword.length >= 10 ? "bg-emerald-500" : newPassword.length >= 6 ? "bg-amber-500" : "bg-destructive") : "bg-muted"}`} />
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Yeni Şifre (Tekrar)</label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-destructive mt-1">Şifreler eşleşmiyor</p>
              )}
            </div>
            <Button onClick={handlePasswordChange}>Şifreyi Güncelle</Button>
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-medium flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            Ödeme Yöntemleri
          </h2>
          <div className="space-y-3">
            {cards.map((card) => (
              <div key={card.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <div className={`w-10 h-7 rounded flex items-center justify-center ${card.brand === "VISA" ? "bg-gradient-to-r from-blue-600 to-blue-800" : "bg-gradient-to-r from-red-500 to-orange-500"}`}>
                  <span className="text-white text-[8px] font-bold">{card.brand}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">•••• •••• •••• {card.last4}</p>
                  <p className="text-xs text-muted-foreground">Son kullanma: {card.expiry}</p>
                </div>
                {card.isDefault ? (
                  <span className="text-xs text-primary font-medium">Varsayılan</span>
                ) : (
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setDefaultCard(card.id)}>Varsayılan Yap</Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeCard(card.id)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setCardDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Yeni Kart Ekle
            </Button>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-6">
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
              <Switch checked={darkMode} onCheckedChange={handleDarkModeToggle} />
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
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="bg-card border border-border rounded-2xl p-6">
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
              <Switch checked={marketingEmails} onCheckedChange={(v) => { setMarketingEmails(v); toast.success(v ? "Pazarlama e-postaları açıldı" : "Pazarlama e-postaları kapatıldı"); }} />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div>
                <p className="text-sm font-medium">Veri Paylaşımı</p>
                <p className="text-xs text-muted-foreground">Kullanım verilerini anonim olarak paylaş</p>
              </div>
              <Switch checked={dataSharing} onCheckedChange={(v) => { setDataSharing(v); toast.success(v ? "Veri paylaşımı açıldı" : "Veri paylaşımı kapatıldı"); }} />
            </div>
            <div className="pt-3 border-t border-border flex gap-3">
              <Button variant="link" size="sm" className="text-xs p-0 h-auto text-muted-foreground" onClick={() => toast.info("Kullanım koşulları sayfası açılacak")}>
                Kullanım Koşulları
              </Button>
              <Button variant="link" size="sm" className="text-xs p-0 h-auto text-muted-foreground" onClick={() => toast.info("Gizlilik politikası sayfası açılacak")}>
                Gizlilik Politikası
              </Button>
              <Button variant="link" size="sm" className="text-xs p-0 h-auto text-muted-foreground" onClick={() => toast.success("Verileriniz hazırlanıyor, e-posta ile gönderilecek")}>
                Verilerimi İndir
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-medium flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-muted-foreground" />
            Güvenlik
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">İki Faktörlü Doğrulama</p>
                <p className="text-xs text-muted-foreground">
                  {twoFAEnabled ? "Etkin — hesabınız ek güvenlik ile korunuyor" : "Hesabınıza ek güvenlik katmanı ekleyin"}
                </p>
              </div>
              <Button
                variant={twoFAEnabled ? "outline" : "default"}
                size="sm"
                onClick={() => {
                  if (twoFAEnabled) { setTwoFAEnabled(false); toast.success("İki faktörlü doğrulama devre dışı bırakıldı"); }
                  else setTwoFADialogOpen(true);
                }}
              >
                {twoFAEnabled ? "Devre Dışı Bırak" : "Etkinleştir"}
              </Button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <p className="text-sm font-medium">Oturum Yönetimi</p>
                <p className="text-xs text-muted-foreground">Aktif oturumlar: {sessions.length} cihaz</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSessionsDialogOpen(true)}>Oturumları Gör</Button>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-destructive/30 rounded-2xl p-6">
          <h2 className="font-medium flex items-center gap-2 mb-2 text-destructive">
            <Trash2 className="w-4 h-4" />
            Tehlikeli Bölge
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinir. Bu işlem geri alınamaz.
          </p>
          <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>Hesabımı Sil</Button>
        </motion.div>
      </div>

      {/* Add Card Dialog */}
      <Dialog open={cardDialogOpen} onOpenChange={setCardDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Kart Ekle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Kart Numarası</label>
              <Input placeholder="0000 0000 0000 0000" value={newCard.number} onChange={(e) => setNewCard({ ...newCard, number: e.target.value.replace(/\D/g, "").slice(0, 16) })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Kart Üzerindeki İsim</label>
              <Input placeholder="AD SOYAD" value={newCard.name} onChange={(e) => setNewCard({ ...newCard, name: e.target.value.toUpperCase() })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Son Kullanma</label>
                <Input placeholder="AA/YY" value={newCard.expiry} onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                  if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
                  setNewCard({ ...newCard, expiry: v });
                }} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">CVV</label>
                <Input type="password" placeholder="•••" value={newCard.cvv} onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCardDialogOpen(false)}>İptal</Button>
              <Button onClick={handleAddCard}>Kartı Ekle</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sessions Dialog */}
      <Dialog open={sessionsDialogOpen} onOpenChange={setSessionsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Aktif Oturumlar</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center border border-border">
                  <session.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{session.device} · {session.browser}</p>
                  <p className="text-xs text-muted-foreground">{session.location} · {session.lastActive}</p>
                </div>
                {session.isCurrent ? (
                  <span className="text-xs text-primary font-medium">Bu cihaz</span>
                ) : (
                  <Button variant="ghost" size="sm" className="text-xs text-destructive h-7" onClick={() => handleEndSession(session.id)}>
                    Sonlandır
                  </Button>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* 2FA Dialog */}
      <Dialog open={twoFADialogOpen} onOpenChange={setTwoFADialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>İki Faktörlü Doğrulama</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Authenticator uygulamanızla aşağıdaki QR kodu tarayın veya doğrulama kodunuzu girin.
            </p>
            <div className="w-40 h-40 bg-muted rounded-xl mx-auto flex items-center justify-center border border-border">
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className={`w-5 h-5 rounded-sm ${Math.random() > 0.4 ? "bg-foreground" : "bg-transparent"}`} />
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Doğrulama Kodu</label>
              <Input
                placeholder="000000"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-lg tracking-widest"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTwoFADialogOpen(false)}>İptal</Button>
              <Button onClick={handleEnable2FA}>Etkinleştir</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hesabınızı Silmek İstediğinize Emin Misiniz?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="block">Bu işlem geri alınamaz. Tüm verileriniz, siparişleriniz, favori listeniz ve adresleriniz kalıcı olarak silinecektir.</span>
              <span className="block text-sm font-medium text-foreground">Onaylamak için aşağıya <span className="text-destructive">HESABIMI SİL</span> yazın:</span>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="HESABIMI SİL"
                className="border-destructive/50"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmText("")}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteConfirmText !== "HESABIMI SİL"}
            >
              Hesabımı Kalıcı Olarak Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AccountLayout>
  );
};

export default AccountSettings;
