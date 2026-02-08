import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import Index from "./pages/Index";
import Collection from "./pages/Collection";
import HowItWorks from "./pages/HowItWorks";
import CustomDesign from "./pages/CustomDesign";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/koleksiyon" element={<Collection />} />
            <Route path="/nasil-calisir" element={<HowItWorks />} />
            <Route path="/ozel-tasarim" element={<CustomDesign />} />
            <Route path="/hakkimizda" element={<About />} />
            <Route path="/giris" element={<Login />} />
            <Route path="/kayit" element={<Register />} />
            <Route path="/odeme" element={<Checkout />} />
            <Route path="/profil" element={<Profile />} />
            <Route path="/siparislerim" element={<Orders />} />
            <Route path="/favorilerim" element={<Favorites />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
