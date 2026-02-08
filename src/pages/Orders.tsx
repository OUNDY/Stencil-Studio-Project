import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Package, ChevronRight, Clock, CheckCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar, GlobalWidgets } from "@/components/navigation";
import { Footer } from "@/components/sections";

// Mock orders data
const orders = [
  {
    id: "ORD-2024-001",
    date: "15 Ocak 2024",
    status: "delivered",
    statusText: "Teslim Edildi",
    total: "299.00",
    items: [
      { name: "Geometrik Mandala Şablonu", quantity: 1, image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100" },
    ],
  },
  {
    id: "ORD-2024-002",
    date: "20 Ocak 2024",
    status: "shipping",
    statusText: "Kargoda",
    total: "458.00",
    items: [
      { name: "Botanik Yaprak Seti", quantity: 2, image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100" },
      { name: "Minimalist Dalga Şablonu", quantity: 1, image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100" },
    ],
  },
  {
    id: "ORD-2024-003",
    date: "25 Ocak 2024",
    status: "processing",
    statusText: "Hazırlanıyor",
    total: "189.00",
    items: [
      { name: "Art Deco Çerçeve", quantity: 1, image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100" },
    ],
  },
];

const statusIcons = {
  processing: Clock,
  shipping: Truck,
  delivered: CheckCircle,
};

const statusColors = {
  processing: "text-amber-500 bg-amber-500/10",
  shipping: "text-blue-500 bg-blue-500/10",
  delivered: "text-green-500 bg-green-500/10",
};

const Orders = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar isHeroComplete={true} />
      <GlobalWidgets />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-serif text-3xl mb-2">Siparişlerim</h1>
            <p className="text-muted-foreground">
              Tüm siparişlerinizi buradan takip edebilirsiniz.
            </p>
          </motion.div>

          {orders.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="font-serif text-xl mb-2">Henüz siparişiniz yok</h2>
              <p className="text-muted-foreground mb-6">
                Koleksiyonumuzu keşfederek ilk siparişinizi verebilirsiniz.
              </p>
              <Link to="/koleksiyon">
                <Button>Koleksiyonu Keşfet</Button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => {
                const StatusIcon = statusIcons[order.status as keyof typeof statusIcons];
                const statusColor = statusColors[order.status as keyof typeof statusColors];

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card border border-border rounded-2xl p-6 hover:shadow-organic transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium">{order.id}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                            <StatusIcon className="w-3 h-3" />
                            {order.statusText}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{order.total} ₺</p>
                        <p className="text-xs text-muted-foreground">
                          {order.items.length} ürün
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item, i) => (
                          <div
                            key={i}
                            className="w-10 h-10 rounded-lg border-2 border-background bg-muted overflow-hidden"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-10 h-10 rounded-lg border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      <p className="flex-1 text-sm text-muted-foreground truncate">
                        {order.items.map((i) => i.name).join(", ")}
                      </p>
                      <Button variant="ghost" size="sm" className="gap-1">
                        Detay
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
