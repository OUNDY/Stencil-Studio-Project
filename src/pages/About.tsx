import { motion } from "framer-motion";
import { Navbar } from "@/components/navigation";
import { Footer } from "@/components/sections";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar isHeroComplete={true} />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 text-center">
              Hakkımızda
            </h1>
            
            <div className="prose prose-lg mx-auto text-muted-foreground">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-lg leading-relaxed mb-6"
              >
                Stencil Studio, duvarlarınıza sanat katma tutkusuyla 2020 yılında kuruldu. 
                El yapımı stencil tasarımlarımızla evlere, ofislere ve kafelere benzersiz karakterler ekliyoruz.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg leading-relaxed mb-6"
              >
                Her tasarımımız, geleneksel el sanatları ile modern estetik anlayışını bir araya getiriyor. 
                Kaliteli malzemeler ve titiz işçilikle üretilen stencillerimiz, yıllarca dayanıklılığını korur.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-lg leading-relaxed"
              >
                Misyonumuz, herkesin kendi yaşam alanını kişiselleştirebilmesini sağlamak. 
                Koleksiyonumuzdaki desenlerden ilham alın veya size özel bir tasarım için bizimle iletişime geçin.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
            >
              <div className="p-6">
                <div className="font-serif text-4xl text-primary mb-2">500+</div>
                <div className="text-muted-foreground">Mutlu Müşteri</div>
              </div>
              <div className="p-6">
                <div className="font-serif text-4xl text-primary mb-2">100+</div>
                <div className="text-muted-foreground">Benzersiz Desen</div>
              </div>
              <div className="p-6">
                <div className="font-serif text-4xl text-primary mb-2">4+</div>
                <div className="text-muted-foreground">Yıllık Deneyim</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
