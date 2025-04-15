import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";
import Chatbot from "@/components/ui/chatbot";

interface AnalyticsProps {
  userId: number | null;
  userType: string | null;
  onLogout: () => void;
}

export default function Analytics({ userId, userType, onLogout }: AnalyticsProps) {
  const [, navigate] = useLocation();

  useEffect(() => {
    if (userId === null) {
      navigate("/login");
    }
  }, [userId, navigate]);

  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/donations'],
    staleTime: 60 * 1000, // 1 minute
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header isUserLoggedIn={true} userType={userType} onLogout={onLogout} />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Donation Analytics</h1>
            <p className="text-muted-foreground">
              Track the impact of food donations across the platform
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading analytics data...</p>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">
                  Could not load analytics data. Please try again later.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Donations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.totalDonations}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Active Donors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.totalDonors}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Recipient Organizations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.totalRecipients}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Estimated Meals Provided
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analyticsData.totalDonations * 5}+
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="charts">
                <TabsList>
                  <TabsTrigger value="charts">Donation Charts</TabsTrigger>
                  <TabsTrigger value="impact">Environmental Impact</TabsTrigger>
                </TabsList>
                <TabsContent value="charts">
                  <AnalyticsChart stats={analyticsData} />
                </TabsContent>
                <TabsContent value="impact">
                  <Card>
                    <CardHeader>
                      <CardTitle>Environmental Impact</CardTitle>
                      <CardDescription>
                        Positive impact of food donations on the environment
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                          <CardContent className="pt-6 text-center">
                            <h3 className="text-lg font-semibold mb-2">Reduced Food Waste</h3>
                            <p className="text-3xl font-bold text-primary mb-2">
                              {(analyticsData.totalDonations * 2.2).toFixed(1)} kg
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Amount of food diverted from landfills
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6 text-center">
                            <h3 className="text-lg font-semibold mb-2">CO₂ Emissions Saved</h3>
                            <p className="text-3xl font-bold text-primary mb-2">
                              {(analyticsData.totalDonations * 4.2).toFixed(1)} kg
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Greenhouse gas emissions prevented
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6 text-center">
                            <h3 className="text-lg font-semibold mb-2">Water Conserved</h3>
                            <p className="text-3xl font-bold text-primary mb-2">
                              {(analyticsData.totalDonations * 330).toFixed(0)} L
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Water saved from food production
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}
