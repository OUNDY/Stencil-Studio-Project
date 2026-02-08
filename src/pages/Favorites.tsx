import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar, GlobalWidgets } from "@/components/navigation";
import { Footer } from "@/components/sections";
import { useCart } from "@/context/CartContext";

// Mock favorites data
const initialFavorites = [
  {
    id: "1",
    name: "Geometrik Mandala",
    price: 149,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
    category: "Mandala",
  },
  {
    id: "2",
    name: "Botanik Yaprak Seti",
    price: 189,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    category: "Botanik",
  },
  {
    id: "3",
    name: "Art Deco Çerçeve",
    price: 229,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400",
    category: "Art Deco",
  },
  {
    id: "4",
    name: "Minimalist Dalga",
    price: 119,
    image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=400",
    category: "Minimalist",
  },
  {
    id: "5",
    name: "Tribal Motif Seti",
    price: 269,
    image: "https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=400",
    category: "Tribal",
  },
];

const Favorites = () => {
  const [favorites, setFavorites] = useState(initialFavorites);
  const { addItem } = useCart();

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddToCart = (item: typeof initialFavorites[0]) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
  };

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
            <h1 className="font-serif text-3xl mb-2">Favorilerim</h1>
            <p className="text-muted-foreground">
              Beğendiğiniz şablonları burada saklayın ve kolayca satın alın.
            </p>
          </motion.div>

          {favorites.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="font-serif text-xl mb-2">Favorileriniz boş</h2>
              <p className="text-muted-foreground mb-6">
                Beğendiğiniz şablonları favorilere ekleyerek daha sonra kolayca
                bulabilirsiniz.
              </p>
              <Link to="/koleksiyon">
                <Button>Koleksiyonu Keşfet</Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {favorites.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-card border border-border rounded-2xl overflow-hidden"
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <button
                        onClick={() => removeFavorite(item.id)}
                        className="absolute top-3 right-3 w-9 h-9 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="p-4">
                      <span className="text-xs text-muted-foreground">
                        {item.category}
                      </span>
                      <h3 className="font-serif text-lg mt-1">{item.name}</h3>
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-medium">{item.price} ₺</span>
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(item)}
                          className="gap-1"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Sepete Ekle
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;
