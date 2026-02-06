import { useState } from "react";
import { Navbar, GlobalWidgets } from "@/components/navigation";
import { HeroExperience } from "@/components/hero";
import {
  FeaturesSection,
  CollectionSection,
  TestimonialsSection,
  CTASection,
  Footer,
  HowItWorksSection,
} from "@/components/sections";

type Phase = "curiosity" | "relief" | "confidence";

const Index = () => {
  const [heroPhase, setHeroPhase] = useState<Phase>("curiosity");

  const isHeroComplete = heroPhase === "confidence";

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <Navbar isHeroComplete={isHeroComplete} />
      <GlobalWidgets />
      <main>
        <HeroExperience onPhaseChange={setHeroPhase} />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CollectionSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
