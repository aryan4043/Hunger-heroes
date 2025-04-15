import { Link } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LoginForm from "@/components/forms/LoginForm";
import Chatbot from "@/components/ui/chatbot";

interface LoginProps {
  onLogin: (user: any, userType: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header isUserLoggedIn={false} userType={null} onLogout={() => {}} />
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-600 mb-8">Log in to your Hunger Heroes account</p>
            <LoginForm onSuccess={onLogin} />
            <div className="mt-6 text-center">
              <p className="text-gray-600">Don't have an account yet?</p>
              <div className="flex space-x-4 mt-2 justify-center">
                <Link href="/donor/register" className="text-primary hover:underline">
                  Register as Donor
                </Link>
                <Link href="/recipient/register" className="text-primary hover:underline">
                  Register as Recipient
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}
