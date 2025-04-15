import { Link, useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SimpleRecipientRegistrationForm from "@/components/forms/SimpleRecipientRegistrationForm";
import Chatbot from "@/components/ui/chatbot";

interface RecipientRegistrationProps {
  onLogin: (user: any, userType: string) => void;
}

export default function RecipientRegistration({ onLogin }: RecipientRegistrationProps) {
  const [, navigate] = useLocation();

  const handleSuccess = (user: any) => {
    // We now have direct navigation in the form component
    // This is now just a fallback
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header isUserLoggedIn={false} userType={null} onLogout={() => {}} />
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-8">
            <h1 className="text-3xl font-bold mb-2">Register as a Recipient Organization</h1>
            <p className="text-gray-600 mb-8">Create an account to receive food donations</p>
            <SimpleRecipientRegistrationForm onSuccess={handleSuccess} />
            <div className="mt-6 text-center">
              <p className="text-gray-600">Already have an account?</p>
              <Link href="/login" className="text-primary hover:underline mt-2 inline-block">
                Log in
              </Link>
              <p className="mt-4 text-gray-600">Want to donate food instead?</p>
              <Link href="/donor/register" className="text-primary hover:underline mt-2 inline-block">
                Register as Donor
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}
