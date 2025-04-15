import { useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DonationFormComponent from "@/components/forms/DonationForm";
import Chatbot from "@/components/ui/chatbot";

interface DonationFormPageProps {
  userId: number | null;
  onLogout: () => void;
}

export default function DonationFormPage({ userId, onLogout }: DonationFormPageProps) {
  const [, navigate] = useLocation();

  useEffect(() => {
    if (userId === null) {
      navigate("/login");
    }
  }, [userId, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header isUserLoggedIn={true} userType="donor" onLogout={onLogout} />
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6 text-center">Create a Food Donation</h1>
          <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
            Fill out the form below to donate surplus food. All donations will be matched with nearby recipient organizations.
          </p>
          <DonationFormComponent donorId={userId} />
        </div>
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}
