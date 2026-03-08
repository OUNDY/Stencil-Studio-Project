import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Sparkles, Package, Download, Palette } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Özgün Tasarımlar",
    description:
      "Her şablon, elinizde bir sanat eseri tutma hissi verecek şekilde özenle tasarlandı.",
    color: "bg-accent",
  },
  {
    icon: Package,
    title: "Fiziksel Şablonlar",
    description:
      "Premium malzemelerden üretilmiş, tekrar tekrar kullanabileceğiniz dayanıklı şablonlar.",
    color: "bg-secondary",
  },
  {
    icon: Download,
    title: "Dijital Dosyalar",
    description:
      "Anında indirin, istediğiniz boyutta bastırın. SVG, AI ve PDF formatlarında.",
    color: "bg-accent",
  },
  {
    icon: Palette,
    title: "Özel Tasarım",
    description:
      "Hayalinizdeki deseni bize anlatın, sizin için özel bir şablon oluşturalım.",
    color: "bg-secondary",
  },
];

export const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      id="how-it-works"
      className="py-14 lg:py-20 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-accent/20 rounded-organic blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-secondary/30 rounded-organic blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16 lg:mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-sans mb-4">
            Neden Stencil Studio?
          </span>
          <h2 className="text-4xl lg:text-5xl font-serif text-foreground mb-6">
            Yaratıcılığınızı <br className="hidden lg:block" />
            serbest bırakın
          </h2>
          <p className="text-lg text-muted-foreground font-sans">
            Profesyonel tasarımlar, kolay uygulama, sınırsız olasılıklar.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group relative"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="h-full p-8 rounded-3xl bg-card border border-border shadow-organic transition-all duration-300 group-hover:shadow-organic-elevated group-hover:-translate-y-1">
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110`}
                >
                  <feature.icon className="w-6 h-6 text-foreground" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-serif text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground font-sans text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
