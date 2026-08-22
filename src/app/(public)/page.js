import Navbar from "./_components/Navbar";
import Hero from "./_components/Hero";
import Story from "./_components/Story";
import Empowerment from "./_components/Empowerment";
import HowItWorks from "./_components/HowItWorks";
import KitchenSpotlight from "./_components/KitchenSpotlight";
import TrustBanner from "./_components/TrustBanner";
import Footer from "./_components/Footer";

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
