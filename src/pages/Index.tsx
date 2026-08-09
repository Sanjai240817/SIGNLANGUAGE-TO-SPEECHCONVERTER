import { useRef } from "react";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import TranslatorSection from "@/components/TranslatorSection";
import Footer from "@/components/Footer";

const Index = () => {
  const translatorRef = useRef<HTMLDivElement>(null);

  const scrollToTranslator = () => {
    translatorRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection onGetStarted={scrollToTranslator} />

      {/* Features Section */}
      <FeaturesSection />

      {/* Translator Section */}
      <div ref={translatorRef}>
        <TranslatorSection />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;