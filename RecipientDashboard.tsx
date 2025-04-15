import { useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RecipientDashboardComponent from "@/components/dashboard/RecipientDashboard";
import Chatbot from "@/components/ui/chatbot";

interface RecipientDashboardProps {
  userId: number | null;
  onLogout: () => void;
}

export default function RecipientDashboard({ userId, onLogout }: RecipientDashboardProps) {
  const [, navigate] = useLocation();

  useEffect(() => {
    if (userId === null) {
      navigate("/login");
    }
  }, [userId, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header isUserLoggedIn={true} userType="recipient" onLogout={onLogout} />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <RecipientDashboardComponent userId={userId} />
        </div>
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}
