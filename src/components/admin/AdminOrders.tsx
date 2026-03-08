import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Search, Eye, Truck, CheckCircle, Clock, Package, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface Order {
  id: string;
  customer: string;
  email: string;
  product: string;
  amount: string;
  date: string;
  status: "processing" | "shipping" | "delivered" | "cancelled";
  statusText: string;
  address: string;
  trackingCode: string;
}

const initialOrders: Order[] = [
  { id: "#1234", customer: "Ahmet Yılmaz", email: "ahmet@mail.com", product: "Botanik Yaprak", amount: "₺180", date: "25 Oca 2024", status: "processing", statusText: "Hazırlanıyor", address: "Kadıköy, İstanbul", trackingCode: "" },
  { id: "#1233", customer: "Elif Kaya", email: "elif@mail.com", product: "Art Deco", amount: "₺220", date: "24 Oca 2024", status: "shipping", statusText: "Kargoda", address: "Çankaya, Ankara", trackingCode: "YK-7382910456" },
  { id: "#1232", customer: "Mehmet Aydın", email: "mehmet@mail.com", product: "Mandala Serisi", amount: "₺210", date: "23 Oca 2024", status: "delivered", statusText: "Teslim Edildi", address: "Alsancak, İzmir", trackingCode: "AR-9281034567" },
  { id: "#1231", customer: "Zeynep Baran", email: "zeynep@mail.com", product: "Minimal Dalga", amount: "₺160", date: "22 Oca 2024", status: "processing", statusText: "Hazırlanıyor", address: "Nilüfer, Bursa", trackingCode: "" },
  { id: "#1230", customer: "Can Demir", email: "can@mail.com", product: "Vintage Çiçek", amount: "₺190", date: "21 Oca 2024", status: "delivered", statusText: "Teslim Edildi", address: "Muratpaşa, Antalya", trackingCode: "YK-1234567890" },
  { id: "#1229", customer: "Selin Öz", email: "selin@mail.com", product: "Etnik Motif", amount: "₺195", date: "20 Oca 2024", status: "shipping", statusText: "Kargoda", address: "Çankaya, Ankara", trackingCode: "AR-5678901234" },
  { id: "#1228", customer: "Burak Tan", email: "burak@mail.com", product: "Geometrik Desen", amount: "₺150", date: "19 Oca 2024", status: "cancelled", statusText: "İptal Edildi", address: "Beşiktaş, İstanbul", trackingCode: "" },
];

type FilterType = "all" | "processing" | "shipping" | "delivered" | "cancelled";
const filters: { value: FilterType; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "processing", label: "Hazırlanıyor" },
  { value: "shipping", label: "Kargoda" },
  { value: "delivered", label: "Teslim Edildi" },
  { value: "cancelled", label: "İptal" },
];

const statusConfig: Record<string, { icon: typeof Clock; color: string }> = {
  processing: { icon: Clock, color: "bg-amber-100 text-amber-700" },
  shipping: { icon: Truck, color: "bg-blue-100 text-blue-700" },
  delivered: { icon: CheckCircle, color: "bg-green-100 text-green-700" },
  cancelled: { icon: X, color: "bg-red-100 text-red-700" },
};

export const AdminOrders = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState("");

  const filtered = orders
    .filter((o) => activeFilter === "all" || o.status === activeFilter)
    .filter((o) => o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search) || o.product.toLowerCase().includes(search.toLowerCase()));

  const updateStatus = (id: string, status: Order["status"], statusText: string) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status, statusText } : o));
    if (detailOrder?.id === id) setDetailOrder((prev) => prev ? { ...prev, status, statusText } : null);
    toast.success(`Sipariş durumu "${statusText}" olarak güncellendi`);
  };

  const addTracking = (id: string) => {
    if (!trackingInput) { toast.error("Takip kodu girin"); return; }
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, trackingCode: trackingInput, status: "shipping", statusText: "Kargoda" } : o));
    if (detailOrder?.id === id) setDetailOrder((prev) => prev ? { ...prev, trackingCode: trackingInput, status: "shipping", statusText: "Kargoda" } : null);
    setTrackingInput("");
    toast.success("Kargo takip kodu eklendi");
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-2xl">Siparişler</h1>
          <p className="text-sm text-muted-foreground">{orders.length} sipariş</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Sipariş, müşteri, ürün ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-72" />
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button key={f.value} onClick={() => setActiveFilter(f.value)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeFilter === f.value ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="px-5 py-3 font-medium">Sipariş</th>
                <th className="px-5 py-3 font-medium">Müşteri</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Ürün</th>
                <th className="px-5 py-3 font-medium">Tutar</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">Tarih</th>
                <th className="px-5 py-3 font-medium">Durum</th>
                <th className="px-5 py-3 font-medium text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const config = statusConfig[order.status];
                return (
                  <tr key={order.id} className="border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-3 font-medium">{order.id}</td>
                    <td className="px-5 py-3">{order.customer}</td>
                    <td className="px-5 py-3 hidden md:table-cell text-muted-foreground">{order.product}</td>
                    <td className="px-5 py-3">{order.amount}</td>
                    <td className="px-5 py-3 hidden sm:table-cell text-muted-foreground">{order.date}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${config.color}`}>{order.statusText}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => { setDetailOrder(order); setTrackingInput(order.trackingCode); }}>
                        <Eye className="w-3.5 h-3.5" /> Detay
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!detailOrder} onOpenChange={() => setDetailOrder(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Sipariş {detailOrder?.id}</DialogTitle></DialogHeader>
          {detailOrder && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Müşteri</p><p className="text-sm font-medium">{detailOrder.customer}</p></div>
                <div><p className="text-xs text-muted-foreground">E-posta</p><p className="text-sm font-medium">{detailOrder.email}</p></div>
                <div><p className="text-xs text-muted-foreground">Ürün</p><p className="text-sm font-medium">{detailOrder.product}</p></div>
                <div><p className="text-xs text-muted-foreground">Tutar</p><p className="text-sm font-medium">{detailOrder.amount}</p></div>
                <div><p className="text-xs text-muted-foreground">Tarih</p><p className="text-sm font-medium">{detailOrder.date}</p></div>
                <div><p className="text-xs text-muted-foreground">Adres</p><p className="text-sm font-medium">{detailOrder.address}</p></div>
              </div>

              {/* Tracking */}
              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground mb-2">Kargo Takip Kodu</p>
                <div className="flex gap-2">
                  <Input value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)} placeholder="Takip kodu girin" />
                  <Button size="sm" onClick={() => addTracking(detailOrder.id)}>Kaydet</Button>
                </div>
              </div>

              {/* Status Update */}
              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground mb-2">Durumu Güncelle</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant={detailOrder.status === "processing" ? "default" : "outline"} onClick={() => updateStatus(detailOrder.id, "processing", "Hazırlanıyor")}>Hazırlanıyor</Button>
                  <Button size="sm" variant={detailOrder.status === "shipping" ? "default" : "outline"} onClick={() => updateStatus(detailOrder.id, "shipping", "Kargoda")}>Kargoda</Button>
                  <Button size="sm" variant={detailOrder.status === "delivered" ? "default" : "outline"} onClick={() => updateStatus(detailOrder.id, "delivered", "Teslim Edildi")}>Teslim Edildi</Button>
                  <Button size="sm" variant="destructive" onClick={() => updateStatus(detailOrder.id, "cancelled", "İptal Edildi")}>İptal Et</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
