import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PackagesSection from "@/components/PackagesSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background relative">
      <Navbar />
      <HeroSection />
      <PackagesSection />
      <ContactSection />
      <Footer />
    </main>
  );
};

export default Index;
