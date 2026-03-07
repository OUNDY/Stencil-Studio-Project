import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Clock, Truck, CheckCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountLayout } from "@/components/account/AccountLayout";

const orders = [
  {
    id: "ORD-2024-001",
    date: "15 Ocak 2024",
    status: "delivered",
    statusText: "Teslim Edildi",
    total: "299.00",
    items: [
      { name: "Geometrik Mandala Şablonu", quantity: 1, price: 299 },
    ],
  },
  {
    id: "ORD-2024-002",
    date: "20 Ocak 2024",
    status: "shipping",
    statusText: "Kargoda",
    total: "458.00",
    items: [
      { name: "Botanik Yaprak Seti", quantity: 2, price: 180 },
      { name: "Minimalist Dalga Şablonu", quantity: 1, price: 98 },
    ],
  },
  {
    id: "ORD-2024-003",
    date: "25 Ocak 2024",
    status: "processing",
    statusText: "Hazırlanıyor",
    total: "189.00",
    items: [
      { name: "Art Deco Çerçeve", quantity: 1, price: 189 },
    ],
  },
];

type FilterType = "all" | "processing" | "shipping" | "delivered";

const filters: { value: FilterType; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "processing", label: "Hazırlanıyor" },
  { value: "shipping", label: "Kargoda" },
  { value: "delivered", label: "Teslim Edildi" },
];

const statusConfig: Record<string, { icon: typeof Clock; color: string }> = {
  processing: { icon: Clock, color: "text-amber-500 bg-amber-500/10" },
  shipping: { icon: Truck, color: "text-blue-500 bg-blue-500/10" },
  delivered: { icon: CheckCircle, color: "text-emerald-600 bg-emerald-500/10" },
};

const AccountOrders = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filteredOrders = activeFilter === "all"
    ? orders
    : orders.filter((o) => o.status === activeFilter);

  return (
    <AccountLayout title="Siparişlerim" subtitle="Tüm siparişlerinizi buradan takip edebilirsiniz">
      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="font-serif text-xl mb-2">Bu kategoride sipariş yok</h2>
          <p className="text-muted-foreground mb-6">
            Filtre kriterlerine uyan sipariş bulunamadı.
          </p>
          <Link to="/koleksiyon">
            <Button>Alışverişe Başla</Button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order, index) => {
              const config = statusConfig[order.status];
              const StatusIcon = config.icon;

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/hesabim/siparisler/${order.id}`}
                    className="block bg-card border border-border rounded-2xl p-5 hover:shadow-organic transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{order.id}</span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {order.statusText}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{order.total} ₺</p>
                        <p className="text-xs text-muted-foreground">{order.items.length} ürün</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground truncate flex-1 mr-4">
                        {order.items.map((i) => i.name).join(", ")}
                      </p>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </AccountLayout>
  );
};

export default AccountOrders;
