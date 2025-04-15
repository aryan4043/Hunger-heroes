import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import HowItWorks from "@/components/home/HowItWorks";
import Features from "@/components/home/Features";
import DonorRecipientTabs from "@/components/home/DonorRecipientTabs";
import DonationTypes from "@/components/home/DonationTypes";
import Impact from "@/components/home/Impact";
import FAQ from "@/components/home/FAQ";
import CTA from "@/components/home/CTA";
import Chatbot from "@/components/ui/chatbot";

interface HomeProps {
  isUserLoggedIn: boolean;
  userType: string | null;
  onLogout: () => void;
}

export default function Home({ isUserLoggedIn, userType, onLogout }: HomeProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header isUserLoggedIn={isUserLoggedIn} userType={userType} onLogout={onLogout} />
      <main className="flex-1">
        <Hero isUserLoggedIn={isUserLoggedIn} userType={userType} />
        <Stats />
        <HowItWorks />
        <Features />
        <DonorRecipientTabs />
        <DonationTypes />
        <Impact />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}
