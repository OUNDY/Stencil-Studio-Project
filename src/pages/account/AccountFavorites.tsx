import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useCart } from "@/context/CartContext";

const initialFavorites = [
  { id: "1", name: "Geometrik Mandala", price: 149, category: "Mandala", emoji: "✿" },
  { id: "2", name: "Botanik Yaprak Seti", price: 189, category: "Botanik", emoji: "🌿" },
  { id: "3", name: "Art Deco Çerçeve", price: 229, category: "Art Deco", emoji: "✦" },
  { id: "5", name: "Tribal Motif Seti", price: 269, category: "Tribal", emoji: "◬" },
  { id: "4", name: "Minimalist Dalga", price: 119, category: "Minimalist", emoji: "〰" },
];

const AccountFavorites = () => {
  const [favorites, setFavorites] = useState(initialFavorites);
  const { addItem } = useCart();

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddToCart = (item: typeof initialFavorites[0]) => {
    addItem({ id: item.id, name: item.name, price: item.price });
  };

  return (
    <AccountLayout title="Favorilerim" subtitle="Beğendiğiniz şablonları burada saklayın">
      {favorites.length === 0 ? (
        <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="font-serif text-xl mb-2">Favorileriniz boş</h2>
          <p className="text-muted-foreground mb-6">
            Beğendiğiniz şablonları favorilere ekleyerek daha sonra kolayca bulabilirsiniz.
          </p>
          <Link to="/koleksiyon">
            <Button>Koleksiyonu Keşfet</Button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {favorites.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ delay: index * 0.04 }}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/urun/${item.id}`}
                    className="font-medium text-sm hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
                <p className="font-medium text-sm flex-shrink-0">{item.price} ₺</p>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddToCart(item)}
                    className="gap-1 h-9"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sepete Ekle</span>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFavorite(item.id)}
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </AccountLayout>
  );
};

export default AccountFavorites;
