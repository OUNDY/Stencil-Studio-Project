import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Ayşe Yılmaz",
    role: "İç Mimar",
    content:
      "Müşterilerime benzersiz duvar tasarımları sunabiliyorum. Kalite ve çeşitlilik gerçekten etkileyici.",
    rating: 5,
  },
  {
    id: 2,
    name: "Mehmet Kaya",
    role: "DIY Tutkunu",
    content:
      "İlk denememde bile profesyonel sonuç aldım. Geri dönüşüm politikaları da çok güven veriyor.",
    rating: 5,
  },
  {
    id: 3,
    name: "Zeynep Demir",
    role: "Cafe Sahibi",
    content:
      "Kafemizin duvarları artık müşterilerimizin en sevdiği fotoğraf noktası. Harika tasarımlar!",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="py-14 lg:py-20 bg-muted/30 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-primary/5 rounded-organic blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-sans mb-4">
            Müşteri Yorumları
          </span>
          <h2 className="text-4xl lg:text-5xl font-serif text-foreground mb-6">
            Mutlu müşterilerimiz
          </h2>
          <p className="text-lg text-muted-foreground font-sans">
            Binlerce kullanıcı Stencil Studio ile yaratıcılıklarını keşfetti
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="relative"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="h-full p-8 rounded-3xl bg-card border border-border shadow-organic">
                {/* Quote icon */}
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mb-6">
                  <Quote className="w-5 h-5 text-accent-foreground" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-primary text-primary"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-foreground font-sans leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-sm font-serif text-secondary-foreground">
                      {testimonial.name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-sans font-medium text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
