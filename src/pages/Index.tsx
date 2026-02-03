import { useState } from "react";
import { Navbar } from "@/components/navigation";
import { HeroExperience } from "@/components/hero";
import {
  FeaturesSection,
  CollectionSection,
  TestimonialsSection,
  CTASection,
  Footer,
} from "@/components/sections";

const Index = () => {
  const [isHeroComplete, setIsHeroComplete] = useState(false);

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <Navbar isHeroComplete={isHeroComplete} />
      <main>
        <HeroExperience />
        <FeaturesSection />
        <CollectionSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
