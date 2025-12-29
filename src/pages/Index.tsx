import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import IntroSection from "@/components/IntroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import VideoSection from "@/components/VideoSection";
import TrustBadges from "@/components/TrustBadges";
import MarketsSection from "@/components/MarketsSection";
import StatsCounter from "@/components/StatsCounter";
import FeaturesSection from "@/components/FeaturesSection";
import ResultsSection from "@/components/ResultsSection";
import CertificatesSection from "@/components/CertificatesSection";
import EducationSection from "@/components/EducationSection";
import EARobotsSection from "@/components/EARobotsSection";
import SignupSection from "@/components/SignupSection";
import CustomerReviews from "@/components/CustomerReviews";
import ContactSection from "@/components/ContactSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import FloatingElements from "@/components/FloatingElements";

const Index = () => {
  return (
    <main className="min-h-screen bg-background relative">
      <FloatingElements />
      <Navbar />
      <HeroSection />
      <IntroSection />
      <AboutSection />
      <ServicesSection />
      <VideoSection />
      <TrustBadges />
      <MarketsSection />
      <StatsCounter />
      <FeaturesSection />
      <ResultsSection />
      <CertificatesSection />
      <EducationSection />
      <EARobotsSection />
      <SignupSection />
      <CustomerReviews />
      <ContactSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
};

export default Index;
