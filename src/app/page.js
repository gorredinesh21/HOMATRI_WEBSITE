import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Story from "@/components/Story";
import Empowerment from "@/components/Empowerment";
import HowItWorks from "@/components/HowItWorks";
import KitchenSpotlight from "@/components/KitchenSpotlight";
import TrustBanner from "@/components/TrustBanner";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <Story />
      <Empowerment />
      <HowItWorks />
      <KitchenSpotlight />
      <TrustBanner />
      <Footer />
    </main>
  );
}
