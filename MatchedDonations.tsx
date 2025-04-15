import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MatchingDonationsList } from "@/components/matching/MatchingDonationsList";
import { ArrowLeft, ArrowRight, ListFilterIcon, SlidersHorizontalIcon } from "lucide-react";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MatchedDonations() {
  const { user, userType } = useAuth();
  const recipientId = user?.id || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header isUserLoggedIn={!!user} userType={userType} onLogout={() => {}} />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button 
            variant="outline" 
            asChild
            className="mb-4 flex items-center gap-2"
          >
            <Link href="/recipient/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Personalized Matches</h1>
              <p className="text-muted-foreground">
                Food donations matched to your preferences and location
              </p>
            </div>
            
            <Button asChild className="self-start md:self-auto">
              <Link href="/recipient/preferences">
                <SlidersHorizontalIcon className="h-4 w-4 mr-2" />
                Manage Preferences
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">All Matches</TabsTrigger>
              <TabsTrigger value="excellent">Excellent Matches (80%+)</TabsTrigger>
              <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="mt-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>All Personalized Matches</CardTitle>
                <CardDescription>
                  Donations that match your food preferences and location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MatchingDonationsList
                  recipientId={recipientId}
                  showTitle={false}
                  enableFilters={true}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="excellent" className="mt-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Excellent Matches</CardTitle>
                <CardDescription>
                  Donations with 80% or higher match score based on your preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MatchingDonationsList
                  recipientId={recipientId}
                  showTitle={false}
                  enableFilters={true}
                  maxItems={Infinity}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="expiring" className="mt-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Expiring Today</CardTitle>
                <CardDescription>
                  Donations that will expire within the next 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MatchingDonationsList
                  recipientId={recipientId}
                  showTitle={false}
                  enableFilters={true}
                  maxItems={Infinity}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Understanding Match Scores</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span className="inline-flex items-center justify-center rounded-full bg-green-100 p-1 text-green-800">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                    Match Score Calculation
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Match scores are calculated based on:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Distance between you and the donor (40%)</li>
                    <li>Food preferences you've set (60%)</li>
                    <li>The importance values you've assigned</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span className="inline-flex items-center justify-center rounded-full bg-blue-100 p-1 text-blue-800">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                    How to Improve Your Matches
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    To get better matched donations:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Update your food preferences with accurate importance values</li>
                    <li>Set high importance (4-5) for must-have attributes</li>
                    <li>Set low importance (1-2) for nice-to-have attributes</li>
                    <li>Keep your location information up to date</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span className="inline-flex items-center justify-center rounded-full bg-purple-100 p-1 text-purple-800">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                    Match Quality Levels
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex gap-2 items-center">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="text-sm font-medium">80-100%: Excellent Match</span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-5">Highly recommended based on your preferences</p>
                    </div>
                    <div>
                      <div className="flex gap-2 items-center">
                        <div className="h-3 w-3 rounded-full bg-amber-500" />
                        <span className="text-sm font-medium">60-79%: Good Match</span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-5">Matches most of your important preferences</p>
                    </div>
                    <div>
                      <div className="flex gap-2 items-center">
                        <div className="h-3 w-3 rounded-full bg-orange-500" />
                        <span className="text-sm font-medium">40-59%: Fair Match</span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-5">Partially matches your preferences</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}