import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import ClubsSection from "@/components/ClubsSection";
import EventsSection from "@/components/EventsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Clubly - Where Real Communities Meet</title>
        <meta
          name="description"
          content="Clubly is a club-first, event-driven platform for creating meaningful connections. No algorithms. No endless scrolling. Just real interactions."
        />
        <meta name="keywords" content="community, clubs, events, social platform, meaningful connections" />
        <meta property="og:title" content="Clubly - Where Real Communities Meet" />
        <meta
          property="og:description"
          content="Build communities that actually matter. A club-first, event-driven platform for real interactions."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://clubly.app" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <HeroSection />
          <FeaturesSection />
          <ClubsSection />
          <EventsSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
