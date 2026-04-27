import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Navbar, GlobalWidgets } from "@/components/navigation";
import { Footer } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Upload, X, ExternalLink } from "lucide-react";

const MIN_WIDTH = 30;
const MAX_WIDTH = 200;
const MIN_HEIGHT = 30;
const MAX_HEIGHT = 200;

const CustomDesign = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(60);
  const [height, setHeight] = useState<number>(60);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
              Özel Tasarım
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Hayalinizdeki deseni gerçeğe dönüştürün. Size özel stencil tasarımları oluşturuyoruz.
            </p>
            
            {/* Subtle e-commerce link for experienced users */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer group"
            >
              <Link to="/koleksiyon" className="flex items-center gap-1">
                <span className="border-b border-transparent group-hover:border-muted-foreground/50 transition-colors">
                  hazır desenlere göz at
                </span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-card rounded-3xl p-8 md:p-12 shadow-organic">
              <h2 className="font-serif text-2xl text-foreground mb-8 text-center">
                Tasarım Talebi
              </h2>
              <form className="space-y-8">
                {/* Image Upload Section */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-foreground">
                    Desen Görseli
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
                      uploadedImage 
                        ? "border-primary/50 bg-primary/5" 
                        : "border-border hover:border-primary/30 hover:bg-accent/50"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    {uploadedImage ? (
                      <div className="relative p-4">
                        <img
                          src={uploadedImage}
                          alt="Yüklenen desen"
                          className="max-h-48 mx-auto rounded-xl object-contain"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage();
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="py-12 px-6 text-center">
                        <Upload className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-sm text-muted-foreground">
                          Görseli yüklemek için tıklayın
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          PNG, JPG veya SVG
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dimensions Section */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">
                        Genişlik
                      </label>
                      <span className="text-sm font-mono text-primary">{width} cm</span>
                    </div>
                    <Slider
                      value={[width]}
                      onValueChange={(value) => setWidth(value[0])}
                      min={MIN_WIDTH}
                      max={MAX_WIDTH}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Min: {MIN_WIDTH} cm</span>
                      <span>Max: {MAX_WIDTH} cm</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">
                        Yükseklik
                      </label>
                      <span className="text-sm font-mono text-primary">{height} cm</span>
                    </div>
                    <Slider
                      value={[height]}
                      onValueChange={(value) => setHeight(value[0])}
                      min={MIN_HEIGHT}
                      max={MAX_HEIGHT}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Min: {MIN_HEIGHT} cm</span>
                      <span>Max: {MAX_HEIGHT} cm</span>
                    </div>
                  </div>
                </div>

                {/* Preview Box */}
                <div className="bg-muted/30 rounded-xl p-4 flex items-center justify-center">
                  <div 
                    className="border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center text-xs text-muted-foreground"
                    style={{ 
                      width: `${Math.min(width * 1.5, 280)}px`, 
                      height: `${Math.min(height * 1.5, 280)}px` 
                    }}
                  >
                    {width} x {height} cm
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    İsim
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Adınız ve soyadınız"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="email@ornek.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tasarım Açıklaması
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    placeholder="Hayalinizdeki deseni detaylı olarak anlatın..."
                  />
                </div>
                <Button className="w-full py-6 text-lg">
                  Talep Gönder
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomDesign;
