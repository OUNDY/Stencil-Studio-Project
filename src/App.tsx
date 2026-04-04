import { type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Index from "./pages/Index";
import Collection from "./pages/Collection";
import ProductDetail from "./pages/ProductDetail";
import HowItWorks from "./pages/HowItWorks";
import CustomDesign from "./pages/CustomDesign";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";
import ComponentShowcase from "./pages/ComponentShowcase";
// Account pages
import AccountDashboard from "./pages/account/Dashboard";
import AccountOrders from "./pages/account/AccountOrders";
import OrderDetail from "./pages/account/OrderDetail";
import AccountFavorites from "./pages/account/AccountFavorites";
import Addresses from "./pages/account/Addresses";
import AccountProfile from "./pages/account/AccountProfile";
import Notifications from "./pages/account/Notifications";
import AccountSettings from "./pages/account/AccountSettings";

const queryClient = new QueryClient();

const ProtectedAdminRoute = ({ children }: { children: ReactNode }) => {
  const { isLoggedIn, user } = useAuth();
  if (!isLoggedIn || user?.role !== "admin") return <Navigate to="/admin-login" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/koleksiyon" element={<Collection />} />
              <Route path="/urun/:id" element={<ProductDetail />} />
              <Route path="/nasil-calisir" element={<HowItWorks />} />
              <Route path="/ozel-tasarim" element={<CustomDesign />} />
              <Route path="/hakkimizda" element={<About />} />
              <Route path="/giris" element={<Login />} />
              <Route path="/kayit" element={<Register />} />
              <Route path="/odeme" element={<Checkout />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />

              {/* User Account */}
              <Route path="/hesabim" element={<AccountDashboard />} />
              <Route path="/hesabim/siparisler" element={<AccountOrders />} />
              <Route path="/hesabim/siparisler/:orderId" element={<OrderDetail />} />
              <Route path="/hesabim/favoriler" element={<AccountFavorites />} />
              <Route path="/hesabim/adresler" element={<Addresses />} />
              <Route path="/hesabim/profil" element={<AccountProfile />} />
              <Route path="/hesabim/bildirimler" element={<Notifications />} />
              <Route path="/hesabim/ayarlar" element={<AccountSettings />} />

              {/* Legacy redirects */}
              <Route path="/profil" element={<AccountDashboard />} />
              <Route path="/siparislerim" element={<AccountOrders />} />
              <Route path="/favorilerim" element={<AccountFavorites />} />

              <Route path="/showcase" element={<ComponentShowcase />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;