import { motion } from "framer-motion";
import { Navbar, GlobalWidgets } from "@/components/navigation";
import { Footer } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

const products = [
  { id: "1", name: "Botanik Yaprak", price: 180 },
  { id: "2", name: "Geometrik Desen", price: 150 },
  { id: "3", name: "Art Deco", price: 220 },
  { id: "4", name: "Minimal Dalga", price: 160 },
  { id: "5", name: "Vintage Çiçek", price: 190 },
  { id: "6", name: "Modern Soyut", price: 175 },
];

const Collection = () => {
  const { addItem } = useCart();

  const handleAddToCart = (product: typeof products[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isHeroComplete={true} />
      <GlobalWidgets />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
              Koleksiyon
            </h1>
            <p className="text-lg text-muted-foreground">
              El yapımı stencil tasarımlarımızı keşfedin. Her desen, duvarlarınıza benzersiz bir karakter katar.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="aspect-square bg-muted rounded-2xl overflow-hidden relative">
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center transition-transform group-hover:scale-105">
                    <span className="text-muted-foreground font-serif text-2xl">
                      {product.name}
                    </span>
                  </div>
                  
                  {/* Overlay on hover */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center"
                  >
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Sepete Ekle
                    </Button>
                  </motion.div>
                </div>
                
                {/* Product info */}
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg text-foreground">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">Stencil Şablon</p>
                  </div>
                  <span className="font-medium text-primary">₺{product.price}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Collection;
