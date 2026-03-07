import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Truck,
  Package,
  MapPin,
  Copy,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountLayout } from "@/components/account/AccountLayout";
import { toast } from "sonner";

// Mock order data
const orderData: Record<string, {
  id: string;
  date: string;
  status: string;
  total: string;
  cargoCompany: string;
  trackingCode: string;
  estimatedDelivery: string;
  address: string;
  items: { name: string; quantity: number; price: number; size: string }[];
  timeline: { step: string; date: string; completed: boolean; active?: boolean }[];
}> = {
  "ORD-2024-001": {
    id: "ORD-2024-001",
    date: "15 Ocak 2024",
    status: "delivered",
    total: "299.00",
    cargoCompany: "Yurtiçi Kargo",
    trackingCode: "YK-7382910456",
    estimatedDelivery: "18 Ocak 2024",
    address: "Atatürk Mah. Cumhuriyet Cad. No:42/5, Kadıköy, İstanbul",
    items: [
      { name: "Geometrik Mandala Şablonu", quantity: 1, price: 299, size: "70x70 cm" },
    ],
    timeline: [
      { step: "Sipariş Alındı", date: "15 Ocak 2024, 14:32", completed: true },
      { step: "Hazırlanıyor", date: "15 Ocak 2024, 16:00", completed: true },
      { step: "Kargoya Verildi", date: "16 Ocak 2024, 09:15", completed: true },
      { step: "Dağıtıma Çıktı", date: "18 Ocak 2024, 08:40", completed: true },
      { step: "Teslim Edildi", date: "18 Ocak 2024, 14:20", completed: true },
    ],
  },
  "ORD-2024-002": {
    id: "ORD-2024-002",
    date: "20 Ocak 2024",
    status: "shipping",
    total: "458.00",
    cargoCompany: "Aras Kargo",
    trackingCode: "AR-9281034567",
    estimatedDelivery: "24 Ocak 2024",
    address: "Bahçelievler Mah. 1234 Sk. No:8, Çankaya, Ankara",
    items: [
      { name: "Botanik Yaprak Seti", quantity: 2, price: 180, size: "50x50 cm" },
      { name: "Minimalist Dalga Şablonu", quantity: 1, price: 98, size: "30x30 cm" },
    ],
    timeline: [
      { step: "Sipariş Alındı", date: "20 Ocak 2024, 10:15", completed: true },
      { step: "Hazırlanıyor", date: "20 Ocak 2024, 14:30", completed: true },
      { step: "Kargoya Verildi", date: "21 Ocak 2024, 11:00", completed: true },
      { step: "Dağıtıma Çıktı", date: "", completed: false, active: true },
      { step: "Teslim Edildi", date: "", completed: false },
    ],
  },
  "ORD-2024-003": {
    id: "ORD-2024-003",
    date: "25 Ocak 2024",
    status: "processing",
    total: "189.00",
    cargoCompany: "—",
    trackingCode: "—",
    estimatedDelivery: "28 Ocak 2024",
    address: "Atatürk Mah. Cumhuriyet Cad. No:42/5, Kadıköy, İstanbul",
    items: [
      { name: "Art Deco Çerçeve", quantity: 1, price: 189, size: "70x70 cm" },
    ],
    timeline: [
      { step: "Sipariş Alındı", date: "25 Ocak 2024, 09:45", completed: true },
      { step: "Hazırlanıyor", date: "", completed: false, active: true },
      { step: "Kargoya Verildi", date: "", completed: false },
      { step: "Dağıtıma Çıktı", date: "", completed: false },
      { step: "Teslim Edildi", date: "", completed: false },
    ],
  },
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success("Takip kodu kopyalandı");
};

const OrderDetail = () => {
  const { orderId } = useParams();
  const order = orderData[orderId || ""];

  if (!order) {
    return (
      <AccountLayout title="Sipariş Bulunamadı">
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Bu sipariş bulunamadı.</p>
          <Link to="/hesabim/siparisler">
            <Button variant="outline">Siparişlere Dön</Button>
          </Link>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout title={`Sipariş ${order.id}`} subtitle={`${order.date} tarihli sipariş`}>
      <Link
        to="/hesabim/siparisler"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Siparişlere Dön
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Timeline + Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cargo Tracking Timeline */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-serif text-lg mb-6">Kargo Takibi</h2>

            <div className="relative">
              {order.timeline.map((step, index) => {
                const isLast = index === order.timeline.length - 1;

                return (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="flex gap-4 relative"
                  >
                    {/* Line */}
                    {!isLast && (
                      <div
                        className={`absolute left-[15px] top-8 w-0.5 h-full ${
                          step.completed ? "bg-primary" : "bg-border"
                        }`}
                      />
                    )}

                    {/* Dot */}
                    <div className="relative z-10 flex-shrink-0 mt-1">
                      {step.completed ? (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-primary-foreground" />
                        </div>
                      ) : step.active ? (
                        <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted border-2 border-border" />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`pb-8 ${!step.completed && !step.active ? "opacity-40" : ""}`}>
                      <p className={`text-sm font-medium ${step.active ? "text-primary" : ""}`}>
                        {step.step}
                      </p>
                      {step.date && (
                        <p className="text-xs text-muted-foreground mt-0.5">{step.date}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-serif text-lg mb-4">Sipariş Ürünleri</h2>

            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 ${
                    index > 0 ? "pt-4 border-t border-border" : ""
                  }`}
                >
                  <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.size} · Adet: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium text-sm flex-shrink-0">{item.price} ₺</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border flex justify-between">
              <span className="font-medium">Toplam</span>
              <span className="font-serif text-lg">{order.total} ₺</span>
            </div>
          </div>
        </div>

        {/* Right: Info Cards */}
        <div className="space-y-4">
          {/* Cargo Info */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-muted-foreground" />
              Kargo Bilgileri
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Kargo Firması</p>
                <p className="font-medium">{order.cargoCompany}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Takip Kodu</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono font-medium text-xs">{order.trackingCode}</p>
                  {order.trackingCode !== "—" && (
                    <button
                      onClick={() => copyToClipboard(order.trackingCode)}
                      className="p-1 hover:bg-accent rounded transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Tahmini Teslim</p>
                <p className="font-medium">{order.estimatedDelivery}</p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Teslimat Adresi
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{order.address}</p>
          </div>

          {/* Order Summary */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Sipariş Özeti
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ara Toplam</span>
                <span>{order.total} ₺</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kargo</span>
                <span className="text-emerald-600">Ücretsiz</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border font-medium">
                <span>Toplam</span>
                <span>{order.total} ₺</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
};

export default OrderDetail;
