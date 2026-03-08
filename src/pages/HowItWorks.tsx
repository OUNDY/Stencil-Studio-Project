import { motion } from "framer-motion";
import { Navbar, GlobalWidgets } from "@/components/navigation";
import { Footer } from "@/components/sections";
import howStep1 from "@/assets/how-step-1.jpg";
import howStep2 from "@/assets/how-step-2.jpg";
import howStep3 from "@/assets/how-step-3.jpg";
import howStep4 from "@/assets/how-step-4.jpg";

const steps = [
  {
    number: "01",
    title: "Desen Seçin",
    description: "Koleksiyonumuzdan size uygun deseni seçin veya özel tasarım talep edin.",
    image: howStep1,
  },
  {
    number: "02",
    title: "Duvarınızı Hazırlayın",
    description: "Duvarınızın temiz ve kuru olduğundan emin olun. Stencil'i istediğiniz konuma yerleştirin.",
    image: howStep2,
  },
  {
    number: "03",
    title: "Boyama Yapın",
    description: "Rulo veya fırça ile boyayı stencil üzerinden uygulayın. Eşit baskı uygulayın.",
    image: howStep3,
  },
  {
    number: "04",
    title: "Stencil'i Kaldırın",
    description: "Boya kurumadan stencil'i dikkatlice kaldırın. Muhteşem sonucun tadını çıkarın!",
    image: howStep4,
  },
];

const HowItWorks = () => {
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
                <div className="flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden shadow-md">
                  <motion.img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover"
                    initial={{ scale: 1.15 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
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
