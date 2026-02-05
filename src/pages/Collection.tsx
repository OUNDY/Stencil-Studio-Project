import { motion } from "framer-motion";
import { Navbar } from "@/components/navigation";
import { Footer } from "@/components/sections";

const Collection = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar isHeroComplete={true} />
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
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="aspect-square bg-muted rounded-2xl overflow-hidden group cursor-pointer"
              >
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center transition-transform group-hover:scale-105">
                  <span className="text-muted-foreground font-serif text-2xl">
                    Desen {item}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Collection;
