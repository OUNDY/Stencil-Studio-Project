import { useState, useRef, useEffect } from "react";
import { ShoppingBag, X, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// Mock cart data - would be replaced with real cart state
const mockCartItems: CartItem[] = [];

export const FloatingCart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems] = useState<CartItem[]>(mockCartItems);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-80 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-serif text-lg">Sepetiniz</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="max-h-64 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">Sepetiniz boş</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Koleksiyonumuzu keşfedin
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-muted rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} x ₺{item.price}
                        </p>
                      </div>
                      <button className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border space-y-3">
              {cartItems.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Toplam</span>
                  <span className="font-semibold">₺{totalPrice.toFixed(2)}</span>
                </div>
              )}
              <Button asChild className="w-full" size="lg">
                <Link to="/koleksiyon">
                  {cartItems.length > 0 ? "Sepete Git" : "Alışverişe Başla"}
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isOpen ? { rotate: 0 } : { rotate: 0 }}
      >
        <ShoppingBag className="w-6 h-6" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-medium">
            {totalItems}
          </span>
        )}
      </motion.button>
    </div>
  );
};
