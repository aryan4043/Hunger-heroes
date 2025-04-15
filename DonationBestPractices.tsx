import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Lightbulb, ShieldCheck, PackageCheck, Clock } from "lucide-react";

interface DonationBestPracticesProps {
  isUserLoggedIn: boolean;
  userType: string | null;
  onLogout: () => void;
}

export default function DonationBestPractices({ isUserLoggedIn, userType, onLogout }: DonationBestPracticesProps) {
  return (
    <PageLayout 
      title="Donation Best Practices" 
      description="Optimize your food donations with these guidelines for maximum impact and safety"
      isUserLoggedIn={isUserLoggedIn}
      userType={userType}
      onLogout={onLogout}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="md:col-span-3 bg-gradient-to-r from-primary/10 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <Lightbulb className="h-6 w-6 mr-2" />
              Why Best Practices Matter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Following donation best practices ensures that food reaches recipients in optimal condition, 
              reduces waste, maximizes nutritional value, and maintains safety throughout the process. 
              These guidelines help both donors and recipients make the most of every food donation.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-primary" />
              For Restaurants & Caterers
            </CardTitle>
            <CardDescription>
              Optimizing regular food donations from food service operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Planning for Donation</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Identify foods suitable for donation before they approach expiration</li>
                    <li>Designate specific staff responsible for managing donations</li>
                    <li>Schedule regular donation times to establish routine</li>
                    <li>Track inventory specifically for donation purposes</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Packaging Prepared Foods</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Use food-grade containers with secure, leak-proof lids</li>
                    <li>Package foods in portion-sized containers when possible</li>
                    <li>Label clearly with contents, preparation date, and allergen information</li>
                    <li>Rapid chill hot foods before packaging for donation</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Documentation</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Keep records of what was donated and when</li>
                    <li>Document temperature logs for temperature-sensitive items</li>
                    <li>Get receipts for tax deduction purposes</li>
                    <li>Maintain food safety compliance documentation</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PackageCheck className="h-5 w-5 mr-2 text-primary" />
              For Grocery Stores & Markets
            </CardTitle>
            <CardDescription>
              Managing bulk and varied food donations effectively
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Sorting & Selection</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Implement "approaching expiration" sorting systems</li>
                    <li>Inspect produce carefully and remove damaged items</li>
                    <li>Group similar items together for easier recipient processing</li>
                    <li>Prioritize nutrient-dense foods for maximum impact</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Storage Before Pickup</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Designate specific refrigerator/freezer space for donations</li>
                    <li>Keep donation items separate from regular inventory</li>
                    <li>Use color-coded containers or labels for easy identification</li>
                    <li>Maintain appropriate temperature logs</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Scheduling & Logistics</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Set up regular donation schedules with recipients</li>
                    <li>Prepare items in advance for quick loading</li>
                    <li>Have dedicated staff manage donation handovers</li>
                    <li>Provide delivery assistance for large donations when possible</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldCheck className="h-5 w-5 mr-2 text-primary" />
              For Individual Donors
            </CardTitle>
            <CardDescription>
              Guidelines for community members making personal donations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What to Donate</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Focus on non-perishable, nutritious items</li>
                    <li>Check expiration dates before donating</li>
                    <li>Ensure packaging is intact and undamaged</li>
                    <li>Consider cultural preferences of recipient communities</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Home-Prepared Foods</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Check local regulations about donating home-prepared foods</li>
                    <li>Package in clean, food-safe containers</li>
                    <li>Label with all ingredients, especially potential allergens</li>
                    <li>Include preparation date and suggested use-by timeline</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Transportation Tips</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Use coolers for temperature-sensitive items</li>
                    <li>Transport donations directly to destination without delays</li>
                    <li>Secure items to prevent damage during transport</li>
                    <li>Keep food separate from non-food items</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              Timing Is Everything: Donation Timeline Best Practices
            </CardTitle>
            <CardDescription>Optimal timing for food donation process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute top-0 bottom-0 left-8 w-1 bg-gray-200"></div>
              <div className="space-y-8 relative">
                <div className="ml-16 relative pt-2">
                  <div className="absolute -left-16 mt-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <h3 className="text-lg font-semibold">Assessment & Planning (1-2 days before)</h3>
                  <p className="text-gray-600 mt-1">
                    Identify potential donation items, verify quality and safety, and plan logistics
                  </p>
                </div>
                <div className="ml-16 relative">
                  <div className="absolute -left-16 mt-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <h3 className="text-lg font-semibold">Preparation (4-12 hours before)</h3>
                  <p className="text-gray-600 mt-1">
                    Package, label, and store donation items appropriately, prepare documentation
                  </p>
                </div>
                <div className="ml-16 relative">
                  <div className="absolute -left-16 mt-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <h3 className="text-lg font-semibold">Transportation (Minimize transit time)</h3>
                  <p className="text-gray-600 mt-1">
                    Use appropriate containers to maintain temperature, take direct routes, avoid delays
                  </p>
                </div>
                <div className="ml-16 relative">
                  <div className="absolute -left-16 mt-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-xs font-bold">4</span>
                  </div>
                  <h3 className="text-lg font-semibold">Handover & Verification</h3>
                  <p className="text-gray-600 mt-1">
                    Verify condition upon arrival, complete documentation, verify temperature for sensitive items
                  </p>
                </div>
                <div className="ml-16 relative">
                  <div className="absolute -left-16 mt-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-xs font-bold">5</span>
                  </div>
                  <h3 className="text-lg font-semibold">Follow-up (Within 24 hours)</h3>
                  <p className="text-gray-600 mt-1">
                    Confirm receipt, address any issues, file documentation for records
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert className="mt-8 border-primary/20 bg-primary/5">
        <CheckCircle className="h-5 w-5 text-primary" />
        <AlertDescription className="text-gray-700 mt-2">
          <span className="font-semibold block mb-1">Remember:</span>
          <span>Regular, consistent donations are often more valuable than occasional large ones. 
          Establish a routine that works for you and communicate clearly with recipient organizations 
          about what you'll be donating and when.</span>
        </AlertDescription>
      </Alert>
    </PageLayout>
  );
}