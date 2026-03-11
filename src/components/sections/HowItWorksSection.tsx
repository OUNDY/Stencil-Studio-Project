import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Paintbrush, Ruler, Sparkles, CheckCircle2 } from "lucide-react";
import stepChoose from "@/assets/step-choose-pattern.png";
import stepPrepare from "@/assets/step-prepare-wall.png";
import stepPaint from "@/assets/step-paint.png";
import stepEnjoy from "@/assets/step-enjoy-result.png";

const steps = [
  {
    number: "01",
    icon: Ruler,
    title: "Desen Seçin",
    description: "Koleksiyonumuzdan size uygun deseni seçin veya özel tasarım talep edin.",
    color: "from-primary/20 to-primary/5",
    image: stepChoose,
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Duvarınızı Hazırlayın",
    description: "Duvarınızın temiz ve kuru olduğundan emin olun. Stencil'i konumlandırın.",
    color: "from-secondary/30 to-secondary/10",
    image: stepPrepare,
  },
  {
    number: "03",
    icon: Paintbrush,
    title: "Boyama Yapın",
    description: "Rulo veya fırça ile boyayı stencil üzerinden eşit şekilde uygulayın.",
    color: "from-accent/30 to-accent/10",
    image: stepPaint,
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Tadını Çıkarın",
    description: "Boya kurumadan stencil'i dikkatlice kaldırın. Muhteşem sonuç!",
    color: "from-primary/20 to-accent/10",
    image: stepEnjoy,
  },
];

export const HowItWorksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      id="how-it-works"
      className="py-14 lg:py-20 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-sans mb-4">
            Adım Adım
          </span>
          <h2 className="text-4xl lg:text-5xl font-serif text-foreground mb-6">
            Nasıl Çalışır?
          </h2>
          <p className="text-lg text-muted-foreground font-sans">
            Dört kolay adımda duvarlarınızı dönüştürün. Profesyonel sonuçlar, 
            sıfır deneyim gereksinimi.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group"
            >
              <div className="relative h-full">
                <div className="h-full bg-card border border-border rounded-3xl overflow-hidden shadow-organic transition-all duration-300 group-hover:shadow-organic-elevated group-hover:-translate-y-1">
                  {/* Image area */}
                  <div className={`aspect-video bg-gradient-to-br ${step.color} relative overflow-hidden`}>
                    <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center border border-border z-10">
                      <span className="font-serif text-lg text-foreground">{step.number}</span>
                    </div>
                    
                    <motion.img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-contain p-6"
                      animate={{
                        y: [0, -8, 0],
                        scale: [1, 1.02, 1],
                      }}
                      transition={{
                        duration: 5 + index * 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      whileHover={{ scale: 1.08 }}
                    />

                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-1 bg-primary/30"
                      initial={{ scaleX: 0 }}
                      animate={isInView ? { scaleX: 1 } : {}}
                      transition={{ duration: 1, delay: 0.5 + index * 0.2 }}
                      style={{ transformOrigin: "left" }}
                    />
                  </div>

                  <div className="p-6 lg:p-8">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                        <step.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-xl lg:text-2xl font-serif text-foreground">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground font-sans leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {index < steps.length - 1 && index % 2 === 0 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-0.5 bg-border" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="text-muted-foreground mb-4">
            Hazır mısınız?
          </p>
          <a
            href="/koleksiyon"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            Koleksiyonu Keşfet
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};
