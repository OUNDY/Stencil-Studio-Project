import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  Heart,
  Truck,
  Clock,
  CheckCircle,
  MapPin,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { AccountLayout } from "@/components/account/AccountLayout";

const stats = [
  { icon: Package, label: "Toplam Sipariş", value: "12", color: "text-primary bg-primary/10" },
  { icon: Truck, label: "Kargoda", value: "1", color: "text-blue-600 bg-blue-500/10" },
  { icon: Heart, label: "Favoriler", value: "5", color: "text-rose-500 bg-rose-500/10" },
  { icon: CheckCircle, label: "Teslim Edilen", value: "10", color: "text-emerald-600 bg-emerald-500/10" },
];

const recentOrders = [
  {
    id: "ORD-2024-003",
    date: "25 Ocak 2024",
    status: "processing",
    statusText: "Hazırlanıyor",
    total: "189.00",
    itemName: "Art Deco Çerçeve",
  },
  {
    id: "ORD-2024-002",
    date: "20 Ocak 2024",
    status: "shipping",
    statusText: "Kargoda",
    total: "458.00",
    itemName: "Botanik Yaprak Seti",
  },
  {
    id: "ORD-2024-001",
    date: "15 Ocak 2024",
    status: "delivered",
    statusText: "Teslim Edildi",
    total: "299.00",
    itemName: "Geometrik Mandala Şablonu",
  },
];

const statusConfig: Record<string, { icon: typeof Clock; color: string }> = {
  processing: { icon: Clock, color: "text-amber-500 bg-amber-500/10" },
  shipping: { icon: Truck, color: "text-blue-500 bg-blue-500/10" },
  delivered: { icon: CheckCircle, color: "text-emerald-600 bg-emerald-500/10" },
};

const quickLinks = [
  { icon: Package, label: "Siparişlerimi Gör", href: "/hesabim/siparisler" },
  { icon: Heart, label: "Favorilerim", href: "/hesabim/favoriler" },
  { icon: MapPin, label: "Adreslerim", href: "/hesabim/adresler" },
  { icon: ShoppingBag, label: "Alışverişe Başla", href: "/koleksiyon" },
];

const AccountDashboard = () => {
  return (
    <AccountLayout title="Genel Bakış" subtitle="Hesabınızın özet bilgileri">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-2xl p-4"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="font-serif text-2xl">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg">Son Siparişler</h2>
          <Link
            to="/hesabim/siparisler"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Tümünü Gör <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {recentOrders.map((order, index) => {
            const config = statusConfig[order.status];
            const StatusIcon = config.icon;

            return (
              <Link
                key={order.id}
                to={`/hesabim/siparisler/${order.id}`}
                className={`flex items-center gap-4 p-4 hover:bg-accent/30 transition-colors ${
                  index > 0 ? "border-t border-border" : ""
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  <StatusIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{order.itemName}</p>
                  <p className="text-xs text-muted-foreground">{order.id} · {order.date}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium">{order.total} ₺</p>
                  <span className={`inline-flex items-center gap-1 text-xs ${config.color.split(" ")[0]}`}>
                    {order.statusText}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Links - Mobile */}
      <div className="lg:hidden">
        <h2 className="font-serif text-lg mb-4">Hızlı Erişim</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <Link
                to={link.href}
                className="flex flex-col items-center gap-2 bg-card border border-border rounded-2xl p-5 hover:bg-accent/30 transition-colors"
              >
                <link.icon className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium text-center">{link.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </AccountLayout>
  );
};

export default AccountDashboard;
