import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, ShoppingCart, Eye, ArrowUpRight, ArrowDownRight } from "lucide-react";

const monthlyData = [
  { month: "Ağu", revenue: 12400, orders: 68 },
  { month: "Eyl", revenue: 15800, orders: 82 },
  { month: "Eki", revenue: 18200, orders: 95 },
  { month: "Kas", revenue: 16500, orders: 88 },
  { month: "Ara", revenue: 22100, orders: 120 },
  { month: "Oca", revenue: 24580, orders: 156 },
];

const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

const trafficSources = [
  { source: "Organik Arama", value: 42, color: "bg-primary" },
  { source: "Doğrudan", value: 28, color: "bg-blue-500" },
  { source: "Sosyal Medya", value: 18, color: "bg-amber-500" },
  { source: "Referans", value: 12, color: "bg-emerald-500" },
];

const topPages = [
  { page: "/koleksiyon", views: 3240, change: "+18%" },
  { page: "/urun/botanik-yaprak", views: 1850, change: "+12%" },
  { page: "/urun/art-deco", views: 1420, change: "+8%" },
  { page: "/nasil-calisir", views: 980, change: "-3%" },
  { page: "/ozel-tasarim", views: 730, change: "+25%" },
];

export const AdminAnalytics = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl">Analitik</h1>
        <p className="text-sm text-muted-foreground">Son 6 aylık performans</p>
      </div>

      {/* Revenue Chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h2 className="font-medium mb-6">Aylık Gelir</h2>
        <div className="flex items-end gap-3 h-48">
          {monthlyData.map((d, i) => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-medium">₺{(d.revenue / 1000).toFixed(1)}k</span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="w-full bg-primary/80 rounded-t-lg min-h-[8px]"
              />
              <span className="text-xs text-muted-foreground">{d.month}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Traffic Sources */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-medium mb-4">Trafik Kaynakları</h2>
          <div className="space-y-4">
            {trafficSources.map((source) => (
              <div key={source.source}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{source.source}</span>
                  <span className="font-medium">%{source.value}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${source.value}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full rounded-full ${source.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Pages */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-medium mb-4">En Çok Ziyaret Edilen Sayfalar</h2>
          <div className="space-y-3">
            {topPages.map((page, i) => (
              <div key={page.page} className="flex items-center gap-3">
                <span className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-[10px] font-medium text-muted-foreground">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium font-mono truncate">{page.page}</p>
                </div>
                <span className="text-sm text-muted-foreground">{page.views.toLocaleString()}</span>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${page.change.startsWith("+") ? "text-green-600" : "text-destructive"}`}>
                  {page.change.startsWith("+") ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {page.change}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Conversion Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Dönüşüm Oranı", value: "%3.2", change: "+0.5%", up: true },
          { label: "Ort. Sipariş Değeri", value: "₺185", change: "+₺12", up: true },
          { label: "Sepet Terk Oranı", value: "%68", change: "-2%", up: true },
          { label: "Müşteri Geri Dönüş", value: "%41", change: "+5%", up: true },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }} className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className="font-serif text-xl">{stat.value}</p>
            <span className={`text-xs font-medium ${stat.up ? "text-green-600" : "text-destructive"}`}>{stat.change}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
