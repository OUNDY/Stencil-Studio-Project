import { motion } from "framer-motion";
import { Navbar } from "@/components/navigation";
import { Footer } from "@/components/sections";

const steps = [
  {
    number: "01",
    title: "Desen Seçin",
    description: "Koleksiyonumuzdan size uygun deseni seçin veya özel tasarım talep edin.",
  },
  {
    number: "02",
    title: "Duvarınızı Hazırlayın",
    description: "Duvarınızın temiz ve kuru olduğundan emin olun. Stencil'i istediğiniz konuma yerleştirin.",
  },
  {
    number: "03",
    title: "Boyama Yapın",
    description: "Rulo veya fırça ile boyayı stencil üzerinden uygulayın. Eşit baskı uygulayın.",
  },
  {
    number: "04",
    title: "Stencil'i Kaldırın",
    description: "Boya kurumadan stencil'i dikkatlice kaldırın. Muhteşem sonucun tadını çıkarın!",
  },
];

const HowItWorks = () => {
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
              Nasıl Çalışır
            </h1>
            <p className="text-lg text-muted-foreground">
              Stencil ile duvarlarınızı dönüştürmek çok kolay. Sadece dört adımda profesyonel sonuçlar elde edin.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-serif text-2xl text-primary">{step.number}</span>
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
