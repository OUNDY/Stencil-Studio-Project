import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BarChart3, Package, Users, ShoppingCart, TrendingUp, Eye, Settings, Bell, Search,
  ChevronRight, ArrowUpRight, ArrowDownRight, LayoutDashboard, FileText, Tag,
  MessageSquare, Image, LogOut, Menu, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

// Admin tab components
import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminCategories } from "@/components/admin/AdminCategories";
import { AdminMessages } from "@/components/admin/AdminMessages";
import { AdminMedia } from "@/components/admin/AdminMedia";
import { AdminPages } from "@/components/admin/AdminPages";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminSettings } from "@/components/admin/AdminSettings";

/* Mock data */
const stats = [
  { label: "Toplam Gelir", value: "₺24,580", change: "+12.5%", up: true, icon: TrendingUp },
  { label: "Siparişler", value: "156", change: "+8.2%", up: true, icon: ShoppingCart },
  { label: "Kullanıcılar", value: "1,240", change: "+15.3%", up: true, icon: Users },
  { label: "Sayfa Görüntüleme", value: "8,420", change: "-3.1%", up: false, icon: Eye },
];

const recentOrders = [
  { id: "#1234", customer: "Ahmet Y.", product: "Botanik Yaprak", amount: "₺180", status: "Hazırlanıyor" },
  { id: "#1233", customer: "Elif K.", product: "Art Deco", amount: "₺220", status: "Kargoda" },
  { id: "#1232", customer: "Mehmet A.", product: "Mandala Serisi", amount: "₺210", status: "Teslim Edildi" },
  { id: "#1231", customer: "Zeynep B.", product: "Minimal Dalga", amount: "₺160", status: "Hazırlanıyor" },
  { id: "#1230", customer: "Can D.", product: "Vintage Çiçek", amount: "₺190", status: "Teslim Edildi" },
];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Package, label: "Ürünler", id: "products" },
  { icon: ShoppingCart, label: "Siparişler", id: "orders" },
  { icon: Users, label: "Kullanıcılar", id: "users" },
  { icon: Tag, label: "Kategoriler", id: "categories" },
  { icon: MessageSquare, label: "Mesajlar", id: "messages", badge: 3 },
  { icon: Image, label: "Medya", id: "media" },
  { icon: FileText, label: "Sayfalar", id: "pages" },
  { icon: BarChart3, label: "Analitik", id: "analytics" },
  { icon: Settings, label: "Ayarlar", id: "settings" },
];

const topProducts = [
  { name: "Botanik Yaprak", sales: 45, revenue: "₺8,100" },
  { name: "Art Deco", sales: 38, revenue: "₺8,360" },
  { name: "Mandala Serisi", sales: 32, revenue: "₺6,720" },
  { name: "Vintage Çiçek", sales: 28, revenue: "₺5,320" },
];

const DashboardContent = ({ onNavigate }: { onNavigate: (tab: string) => void }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <h1 className="font-serif text-2xl lg:text-3xl mb-1">Dashboard</h1>
    <p className="text-sm text-muted-foreground mb-6">Genel bakış ve istatistikler</p>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
      {stats.map((stat, i) => (
        <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-2xl p-4 lg:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center"><stat.icon className="w-4 h-4 text-primary" /></div>
            <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.up ? "text-emerald-600" : "text-destructive"}`}>
              {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{stat.change}
            </span>
          </div>
          <p className="font-serif text-xl lg:text-2xl text-foreground">{stat.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
        </motion.div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
      <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-medium text-sm">Son Siparişler</h2>
          <button onClick={() => onNavigate("orders")} className="text-xs text-primary hover:underline flex items-center gap-1">Tümünü Gör <ChevronRight className="w-3 h-3" /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="px-5 py-3 font-medium">Sipariş</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">Müşteri</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Ürün</th>
                <th className="px-5 py-3 font-medium">Tutar</th>
                <th className="px-5 py-3 font-medium">Durum</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-3 font-medium">{order.id}</td>
                  <td className="px-5 py-3 hidden sm:table-cell text-muted-foreground">{order.customer}</td>
                  <td className="px-5 py-3 hidden md:table-cell text-muted-foreground">{order.product}</td>
                  <td className="px-5 py-3">{order.amount}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${order.status === "Teslim Edildi" ? "bg-emerald-500/10 text-emerald-700" : order.status === "Kargoda" ? "bg-blue-500/10 text-blue-700" : "bg-amber-500/10 text-amber-700"}`}>{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border"><h2 className="font-medium text-sm">En Çok Satan Ürünler</h2></div>
        <div className="p-4 space-y-4">
          {topProducts.map((product, i) => (
            <div key={product.name} className="flex items-center gap-3">
              <span className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs text-muted-foreground font-medium">{i + 1}</span>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{product.name}</p><p className="text-xs text-muted-foreground">{product.sales} satış</p></div>
              <span className="text-sm font-medium text-foreground">{product.revenue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { icon: Package, label: "Ürün Ekle", color: "bg-primary/10 text-primary", tab: "products" },
        { icon: Tag, label: "Kampanya Oluştur", color: "bg-emerald-500/10 text-emerald-700", tab: "categories" },
        { icon: FileText, label: "Rapor İndir", color: "bg-blue-500/10 text-blue-700", tab: "analytics" },
        { icon: MessageSquare, label: "Mesajları Gör", color: "bg-amber-500/10 text-amber-700", tab: "messages" },
      ].map((action) => (
        <button key={action.label} onClick={() => onNavigate(action.tab)} className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-organic transition-shadow">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}><action.icon className="w-5 h-5" /></div>
          <span className="text-xs font-medium">{action.label}</span>
        </button>
      ))}
    </div>
  </motion.div>
);

const tabComponents: Record<string, React.ComponentType<any>> = {
  products: AdminProducts,
  orders: AdminOrders,
  users: AdminUsers,
  categories: AdminCategories,
  messages: AdminMessages,
  media: AdminMedia,
  pages: AdminPages,
  analytics: AdminAnalytics,
  settings: AdminSettings,
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const TabComponent = tabComponents[activeTab];

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-card border-r border-border z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><span className="text-primary-foreground font-serif text-sm">S</span></div>
            <span className="font-serif text-lg">Stencil Admin</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${activeTab === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
            >
              <item.icon className="w-4 h-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && <span className="px-1.5 py-0.5 bg-destructive text-destructive-foreground text-[10px] rounded-full">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" /><span>Siteye Dön</span>
          </Link>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-background/90 backdrop-blur-lg border-b border-border flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-accent rounded-lg"><Menu className="w-5 h-5" /></button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Ara..." className="pl-10 pr-4 py-2 w-64 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" onClick={() => setActiveTab("messages")}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </Button>
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary text-xs font-medium">{user?.name?.charAt(0)?.toUpperCase() || "A"}</span>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          {activeTab === "dashboard" ? (
            <DashboardContent onNavigate={setActiveTab} />
          ) : TabComponent ? (
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <TabComponent />
            </motion.div>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
