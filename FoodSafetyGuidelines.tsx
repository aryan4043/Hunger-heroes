import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, ThermometerSnowflake, Clock, Truck, Info } from "lucide-react";

interface FoodSafetyGuidelinesProps {
  isUserLoggedIn: boolean;
  userType: string | null;
  onLogout: () => void;
}

export default function FoodSafetyGuidelines({ isUserLoggedIn, userType, onLogout }: FoodSafetyGuidelinesProps) {
  return (
    <PageLayout 
      title="Food Safety Guidelines" 
      description="Essential guidance for safe food handling, storage, and transportation during the donation process"
      isUserLoggedIn={isUserLoggedIn}
      userType={userType}
      onLogout={onLogout}
    >
      <Alert className="my-6 border-amber-300 bg-amber-50">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <AlertTitle className="text-amber-800">Important Notice</AlertTitle>
        <AlertDescription className="text-amber-700">
          Food safety is a critical responsibility for all participants in the food donation process. 
          Please follow these guidelines carefully to ensure the health and safety of recipients.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="general" className="mt-6">
        <TabsList className="w-full grid grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="general">General Guidelines</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="transport">Transportation</TabsTrigger>
          <TabsTrigger value="handling">Food Handling</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Food Safety Guidelines</CardTitle>
              <CardDescription>Basic principles for all food donation participants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Food Quality Standards</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Donate only food that you would consume yourself</li>
                  <li>Ensure packaging is intact and undamaged</li>
                  <li>Check that all food is within its shelf life or expiration date</li>
                  <li>Never donate food that shows signs of spoilage, mold, or unusual odors</li>
                  <li>Verify that temperature-sensitive foods have been properly stored</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Food Types Suitable for Donation</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Non-perishable items (canned goods, dry grains, etc.)</li>
                  <li>Fresh produce with no signs of spoilage</li>
                  <li>Prepared foods that have been properly stored and handled</li>
                  <li>Packaged foods in original, unopened containers</li>
                  <li>Frozen foods that have remained consistently frozen</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Record Keeping</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Document food source, preparation date, and handling procedures</li>
                  <li>Keep records of temperature monitoring for refrigerated/frozen items</li>
                  <li>Maintain contact information for all parties involved in the donation chain</li>
                  <li>Record any potential allergens or special dietary considerations</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="storage" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ThermometerSnowflake className="h-5 w-5 mr-2 text-primary" />
                Storage Guidelines
              </CardTitle>
              <CardDescription>Proper storage temperatures and conditions for food safety</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Temperature Control</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Cold foods: Maintain temperatures at or below 5°C (41°F)</li>
                  <li>Frozen foods: Store at -18°C (0°F) or below</li>
                  <li>Hot foods: Keep at 60°C (140°F) or above until ready for transport</li>
                  <li>Use thermometers to regularly verify storage temperatures</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Storage Conditions</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Store food in clean, sanitized containers with secure lids</li>
                  <li>Use food-grade containers appropriate for the type of food</li>
                  <li>Store raw and ready-to-eat foods separately to prevent cross-contamination</li>
                  <li>Keep food storage areas clean, dry, and pest-free</li>
                  <li>Store food off the floor on shelves or pallets</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Shelf Life Guidelines</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Label all stored food with receiving date and expiration date</li>
                  <li>Follow FIFO principle (First In, First Out) for stock rotation</li>
                  <li>Regularly inspect stored food for quality and signs of spoilage</li>
                  <li>Discard any food that has exceeded its safe storage period</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transport" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="h-5 w-5 mr-2 text-primary" />
                Transportation Guidelines
              </CardTitle>
              <CardDescription>Safe practices for transporting donated food</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Vehicle Requirements</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Ensure vehicles are clean and free from contaminants</li>
                  <li>Use insulated containers or refrigerated vehicles for temperature-sensitive foods</li>
                  <li>Separate raw foods from ready-to-eat items during transport</li>
                  <li>Protect food from potential contaminants during loading and unloading</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Temperature Maintenance</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Use coolers with ice packs for refrigerated items when refrigerated transport is unavailable</li>
                  <li>Monitor food temperatures at pickup and delivery points</li>
                  <li>Minimize transport time to reduce temperature fluctuations</li>
                  <li>Keep transport vehicles out of direct sunlight when possible</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Loading and Unloading</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Minimize the time food spends in the "temperature danger zone" (5°C-60°C or 41°F-140°F)</li>
                  <li>Load vehicles just before departure and unload promptly upon arrival</li>
                  <li>Verify food quality and temperature at both pickup and delivery</li>
                  <li>Have a contingency plan for unexpected delays or vehicle breakdowns</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="handling" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="h-5 w-5 mr-2 text-primary" />
                Food Handling Guidelines
              </CardTitle>
              <CardDescription>Proper personal hygiene and food handling practices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Personal Hygiene</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Wash hands thoroughly before handling food</li>
                  <li>Wear clean clothing when handling food</li>
                  <li>Use gloves when handling ready-to-eat foods</li>
                  <li>Avoid handling food when ill</li>
                  <li>Tie back long hair and remove jewelry when handling food</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Cross-Contamination Prevention</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Use separate utensils and cutting boards for different food types</li>
                  <li>Clean and sanitize all food contact surfaces regularly</li>
                  <li>Store raw and ready-to-eat foods separately</li>
                  <li>Change gloves between handling different food types</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Special Considerations</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Clearly label all known allergens in prepared foods</li>
                  <li>Provide ingredient lists for all prepared or repackaged foods</li>
                  <li>Follow specific handling requirements for high-risk foods</li>
                  <li>Ensure adequate cooling of hot foods before refrigeration</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            Time and Temperature Control
          </CardTitle>
          <CardDescription>
            Critical time and temperature guidelines for food safety
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Food Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maximum Time in Danger Zone
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Safe Storage Temperature
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maximum Storage Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Hot Prepared Foods
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2 hours
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Above 60°C (140°F)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    4 hours
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Cold Prepared Foods
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2 hours
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Below 5°C (41°F)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    3 days
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Fresh Produce
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    4 hours
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Below 5°C (41°F)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    3-7 days
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Frozen Foods
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2 hours
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Below -18°C (0°F)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    1-3 months
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Dairy Products
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    1 hour
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Below 5°C (41°F)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    5-7 days
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}