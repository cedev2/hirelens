import CtaSection from "./components/CtaSection";
import FeaturedJobsSection from "./components/FeaturedJobsSection";
import Footer from "./components/Footer";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import ChatWidget from "./components/chat/ChatWidget";

export default function page() {
  return (
    <>
      <Header />
      <HeroSection />
      <FeaturedJobsSection />
      <CtaSection />
      <Footer />
      <ChatWidget />
    </>
  );
}
