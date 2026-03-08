import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Store, Truck, CreditCard, Bell, Palette, Save, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const AdminSettings = () => {
  const [store, setStore] = useState({
    name: "Stencil",
    email: "info@stencil.com",
    phone: "0212 345 67 89",
    address: "Kadıköy, İstanbul",
    currency: "TRY",
  });

  const [shipping, setShipping] = useState({
    freeShippingMin: 200,
    flatRate: 29.90,
    expressRate: 49.90,
    freeShippingEnabled: true,
  });

  const [notifications, setNotifications] = useState({
    newOrder: true,
    lowStock: true,
    newUser: false,
    newMessage: true,
  });

  const handleSaveStore = () => toast.success("Mağaza bilgileri kaydedildi");
  const handleSaveShipping = () => toast.success("Kargo ayarları kaydedildi");

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl">Ayarlar</h1>
        <p className="text-sm text-muted-foreground">Mağaza ve sistem ayarları</p>
      </div>

      <div className="space-y-6">
        {/* Store Info */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-medium flex items-center gap-2 mb-4"><Store className="w-4 h-4 text-muted-foreground" />Mağaza Bilgileri</h2>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
            <div><label className="text-xs text-muted-foreground mb-1.5 block">Mağaza Adı</label><Input value={store.name} onChange={(e) => setStore({ ...store, name: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground mb-1.5 block">E-posta</label><Input value={store.email} onChange={(e) => setStore({ ...store, email: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground mb-1.5 block">Telefon</label><Input value={store.phone} onChange={(e) => setStore({ ...store, phone: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground mb-1.5 block">Adres</label><Input value={store.address} onChange={(e) => setStore({ ...store, address: e.target.value })} /></div>
          </div>
          <Button className="mt-4 gap-2" onClick={handleSaveStore}><Save className="w-4 h-4" />Kaydet</Button>
        </motion.div>

        {/* Shipping */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-medium flex items-center gap-2 mb-4"><Truck className="w-4 h-4 text-muted-foreground" />Kargo Ayarları</h2>
          <div className="space-y-4 max-w-md">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">Ücretsiz Kargo</p><p className="text-xs text-muted-foreground">Minimum tutar üzeri ücretsiz kargo</p></div>
              <Switch checked={shipping.freeShippingEnabled} onCheckedChange={(v) => setShipping({ ...shipping, freeShippingEnabled: v })} />
            </div>
            {shipping.freeShippingEnabled && (
              <div><label className="text-xs text-muted-foreground mb-1.5 block">Minimum Tutar (₺)</label><Input type="number" value={shipping.freeShippingMin} onChange={(e) => setShipping({ ...shipping, freeShippingMin: Number(e.target.value) })} /></div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground mb-1.5 block">Standart Kargo (₺)</label><Input type="number" value={shipping.flatRate} onChange={(e) => setShipping({ ...shipping, flatRate: Number(e.target.value) })} /></div>
              <div><label className="text-xs text-muted-foreground mb-1.5 block">Hızlı Kargo (₺)</label><Input type="number" value={shipping.expressRate} onChange={(e) => setShipping({ ...shipping, expressRate: Number(e.target.value) })} /></div>
            </div>
          </div>
          <Button className="mt-4 gap-2" onClick={handleSaveShipping}><Save className="w-4 h-4" />Kaydet</Button>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-medium flex items-center gap-2 mb-4"><Bell className="w-4 h-4 text-muted-foreground" />Admin Bildirimleri</h2>
          <div className="space-y-4 max-w-md">
            {[
              { key: "newOrder" as const, label: "Yeni Sipariş", desc: "Yeni sipariş geldiğinde bildirim al" },
              { key: "lowStock" as const, label: "Düşük Stok", desc: "Stok azaldığında uyarı al" },
              { key: "newUser" as const, label: "Yeni Kullanıcı", desc: "Yeni kullanıcı kaydında bildirim al" },
              { key: "newMessage" as const, label: "Yeni Mesaj", desc: "Müşteri mesajı geldiğinde bildirim al" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                <Switch checked={notifications[item.key]} onCheckedChange={(v) => { setNotifications({ ...notifications, [item.key]: v }); toast.success("Bildirim tercihi güncellendi"); }} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Maintenance */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-medium flex items-center gap-2 mb-4"><Settings className="w-4 h-4 text-muted-foreground" />Bakım</h2>
          <div className="space-y-3 max-w-md">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">Bakım Modu</p><p className="text-xs text-muted-foreground">Siteyi geçici olarak kapatın</p></div>
              <Switch onCheckedChange={(v) => toast.success(v ? "Bakım modu açıldı" : "Bakım modu kapatıldı")} />
            </div>
            <div className="flex gap-2 pt-3 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => toast.success("Önbellek temizlendi")}>Önbellek Temizle</Button>
              <Button variant="outline" size="sm" onClick={() => toast.success("Rapor oluşturuluyor...")}>Rapor İndir</Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
