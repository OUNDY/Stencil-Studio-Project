import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar, GlobalWidgets } from "@/components/navigation";
import { Footer } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, Check, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { products } from "@/data/products";
import { useState } from "react";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const product = products.find((p) => p.id === id);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl mb-4">Ürün Bulunamadı</h1>
          <Button asChild variant="outline">
            <Link to="/koleksiyon">Koleksiyona Dön</Link>
          </Button>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isHeroComplete={true} />
      <GlobalWidgets />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <Link
              to="/koleksiyon"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Koleksiyona Dön
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Product Visual */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspect-square bg-gradient-to-br from-muted to-accent/20 rounded-3xl overflow-hidden relative group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span
                    className="text-[120px] opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    {product.emoji}
                  </motion.span>
                </div>
                {product.popular && (
                  <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-sans">
                    Popüler
                  </div>
                )}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col"
            >
              <span className="text-sm text-muted-foreground font-sans mb-2 capitalize">
                {product.category === "cocuk" ? "Çocuk" : product.category}
              </span>
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
                {product.name}
              </h1>
              <p className="text-lg text-primary font-medium mb-6">
                ₺{product.price}
              </p>
              <p className="text-muted-foreground font-sans leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-3 mb-8">
                {product.details.map((detail) => (
                  <span
                    key={detail}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {detail}
                  </span>
                ))}
              </div>

              {/* Size selector */}
              <div className="mb-6">
                <label className="text-sm font-sans font-medium text-foreground mb-3 block">
                  Boyut
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size, i) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(i)}
                      className={`px-4 py-2 rounded-xl text-sm font-sans border transition-all ${
                        selectedSize === i
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4 mt-auto">
                <div className="flex items-center gap-3 border border-border rounded-xl px-3 py-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 h-12 gap-2 rounded-xl text-base"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Sepete Ekle — ₺{(product.price * quantity).toFixed(0)}
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-24"
            >
              <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-8">
                Benzer Ürünler
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedProducts.map((rp) => (
                  <Link key={rp.id} to={`/urun/${rp.id}`}>
                    <motion.div
                      className="group"
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="aspect-[4/3] bg-gradient-to-br from-muted to-accent/20 rounded-2xl overflow-hidden flex items-center justify-center mb-3">
                        <span className="text-5xl opacity-40 group-hover:opacity-60 transition-opacity">
                          {rp.emoji}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg">{rp.name}</h3>
                      <p className="text-sm text-muted-foreground">₺{rp.price}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
