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

type Phase = "curiosity" | "relief" | "confidence";

const Index = () => {
  const [heroPhase, setHeroPhase] = useState<Phase>("curiosity");

  const isHeroComplete = heroPhase === "confidence";

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <Navbar isHeroComplete={isHeroComplete} />
      <main>
        <HeroExperience onPhaseChange={setHeroPhase} />
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
