import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Package, Tag, MessageSquare, Mail } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { AccountLayout } from "@/components/account/AccountLayout";
import { toast } from "sonner";

interface NotificationPref {
  id: string;
  icon: typeof Bell;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
}

const initialPrefs: NotificationPref[] = [
  {
    id: "orders",
    icon: Package,
    title: "Sipariş Güncellemeleri",
    description: "Siparişlerinizin durumu değiştiğinde bildirim alın",
    email: true,
    push: true,
  },
  {
    id: "promotions",
    icon: Tag,
    title: "Kampanya ve İndirimler",
    description: "Özel teklifler ve indirimlerden haberdar olun",
    email: true,
    push: false,
  },
  {
    id: "newProducts",
    icon: Bell,
    title: "Yeni Ürünler",
    description: "Yeni koleksiyonlar eklendiğinde bildirim alın",
    email: false,
    push: true,
  },
  {
    id: "messages",
    icon: MessageSquare,
    title: "Mesajlar",
    description: "Destek ekibinden gelen yanıtlar",
    email: true,
    push: true,
  },
];

const Notifications = () => {
  const [prefs, setPrefs] = useState(initialPrefs);

  const togglePref = (id: string, channel: "email" | "push") => {
    setPrefs((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, [channel]: !p[channel] } : p
      )
    );
    toast.success("Bildirim tercihi güncellendi");
  };

  return (
    <AccountLayout title="Bildirimler" subtitle="Bildirim tercihlerinizi yönetin">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="grid grid-cols-[1fr,80px,80px] items-center px-5 py-3 border-b border-border text-xs text-muted-foreground font-medium">
          <span>Bildirim Türü</span>
          <span className="text-center flex items-center justify-center gap-1">
            <Mail className="w-3.5 h-3.5" /> E-posta
          </span>
          <span className="text-center flex items-center justify-center gap-1">
            <Bell className="w-3.5 h-3.5" /> Push
          </span>
        </div>

        {prefs.map((pref, index) => (
          <div
            key={pref.id}
            className={`grid grid-cols-[1fr,80px,80px] items-center px-5 py-4 ${
              index > 0 ? "border-t border-border" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                <pref.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{pref.title}</p>
                <p className="text-xs text-muted-foreground hidden sm:block">{pref.description}</p>
              </div>
            </div>
            <div className="flex justify-center">
              <Switch
                checked={pref.email}
                onCheckedChange={() => togglePref(pref.id, "email")}
              />
            </div>
            <div className="flex justify-center">
              <Switch
                checked={pref.push}
                onCheckedChange={() => togglePref(pref.id, "push")}
              />
            </div>
          </div>
        ))}
      </motion.div>
    </AccountLayout>
  );
};

export default Notifications;
