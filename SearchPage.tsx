import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/Header";
import { DonationSearch } from "@/components/search/DonationSearch";
import { DEFAULT_COORDINATES, getCurrentPosition } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function SearchPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { isAuthenticated, userType } = useAuth();
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);

  // Get user location
  useEffect(() => {
    const getPosition = async () => {
      try {
        const { coords } = await getCurrentPosition();
        setUserPosition([coords.latitude, coords.longitude]);
      } catch (error) {
        console.error("Error getting position:", error);
        // Fallback to default coordinates (Chennai, Tamil Nadu)
        setUserPosition([DEFAULT_COORDINATES.latitude, DEFAULT_COORDINATES.longitude]);
        toast({
          title: "Location access denied",
          description: "Using default location. Some features might be limited.",
          variant: "destructive",
        });
      }
    };
    
    getPosition();
  }, [toast]);

  const handleSelectDonation = (donation: any) => {
    // Navigate to donation details page
    setLocation(`/donations/${donation.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        isUserLoggedIn={isAuthenticated} 
        userType={userType} 
        onLogout={() => {}} 
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Find Food Donations</h1>
          
          <DonationSearch 
            userPosition={userPosition}
            onSelectDonation={handleSelectDonation}
          />
          
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Search Tips</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• Use the search bar to find donations by name, description, or donor details</li>
              <li>• Filter by food type to find specific categories of food</li>
              <li>• Enable location services for proximity-based searches</li>
              <li>• Look for the "Expiring Soon" badge for time-sensitive donations</li>
              <li>• Sort results by distance, expiry date, or recency based on your needs</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}