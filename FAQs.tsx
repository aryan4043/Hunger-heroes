import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FAQsProps {
  isUserLoggedIn: boolean;
  userType: string | null;
  onLogout: () => void;
}

export default function FAQs({ isUserLoggedIn, userType, onLogout }: FAQsProps) {
  return (
    <PageLayout 
      title="Frequently Asked Questions" 
      description="Find answers to common questions about food donation and our platform"
      isUserLoggedIn={isUserLoggedIn}
      userType={userType}
      onLogout={onLogout}
    >
      <Tabs defaultValue="general" className="mt-6">
        <TabsList className="w-full grid grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="donors">For Donors</TabsTrigger>
          <TabsTrigger value="recipients">For Recipients</TabsTrigger>
          <TabsTrigger value="platform">Platform & Technical</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Questions</CardTitle>
              <CardDescription>Common questions about food donation and our service</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is FoodShare?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700">
                      FoodShare is a digital platform that connects food donors (such as restaurants, grocery stores, 
                      and individuals) with recipient organizations (such as food banks, shelters, and community centers) 
                      to facilitate efficient and safe food donation. Our platform helps reduce food waste while addressing 
                      food insecurity in communities.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>Is there a cost to use FoodShare?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700">
                      No, FoodShare is completely free for both donors and recipients. Our mission is to reduce food waste 
                      and increase access to nutritious food, so we do not charge any fees for using our platform.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>What types of food can be donated?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700">
                      A wide variety of foods can be donated, including:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                      <li>Fresh produce that is still in good condition</li>
                      <li>Packaged foods within their expiration dates</li>
                      <li>Prepared foods that have been properly stored and handled</li>
                      <li>Baked goods and bread products</li>
                      <li>Frozen foods that have remained consistently frozen</li>
                      <li>Canned and dry goods</li>
                    </ul>
                    <p className="mt-2 text-gray-700">
                      All donated food must meet food safety guidelines. Please refer to our Food Safety Guidelines page for more details.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>Are there legal protections for food donors?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700">
                      Yes, in many countries, including India, there are legal protections for food donors. 
                      In India, while there isn't a specific Good Samaritan law for food donation, donors 
                      who follow proper food safety guidelines and donate in good faith are generally protected 
                      from liability under common law principles.
                    </p>
                    <p className="mt-2 text-gray-700">
                      We recommend consulting with legal counsel for specific advice regarding food donation liability in your region.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger>How does FoodShare ensure food safety?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700">
                      FoodShare ensures food safety through several measures:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                      <li>Comprehensive food safety guidelines for all participants</li>
                      <li>Required quality checklists for all donations</li>
                      <li>User verification and rating systems</li>
                      <li>Training resources for proper food handling and transportation</li>
                      <li>Communication tools to coordinate timely pickups and deliveries</li>
                    </ul>
                    <p className="mt-2 text-gray-700">
                      Both donors and recipients share responsibility for ensuring food safety throughout the donation process.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="donors" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>For Donors</CardTitle>
              <CardDescription>Questions specifically for food donors</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I start donating food?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700">
                      Starting is simple:
                    </p>
                    <ol className="list-decimal pl-5 mt-2 space-y-1 text-gray-700">
                      <li>Register as a donor on the FoodShare platform</li>
                      <li>Complete your profile with contact information and location</li>
                      <li>Create your first donation listing with details about the food</li>
                      <li>Wait for a recipient to claim your donation, or use our matching system</li>
                      <li>Coordinate pickup/delivery and complete the donation</li>
                    </ol>
                    <p className="mt-2 text-gray-700">
                      Our platform will guide you through each step of the process.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>Can I get a tax deduction for my donations?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700">
                      Yes, in many cases food donations can be tax-deductible. In India, under Section 80G of the Income Tax Act, 
                      donations to registered charitable organizations may qualify for tax deductions. 
                    </p>
                    <p className="mt-2 text-gray-700">
                      FoodShare provides donation receipts that you can use for tax purposes. We recommend consulting with a tax 
                      professional for specific advice regarding your situation.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>How do I ensure my donated food remains safe?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700">
                      To ensure food safety:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                      <li>Follow all food safety guidelines on our platform</li>
                      <li>Maintain proper temperature control throughout storage</li>
                      <li>Package food appropriately in clean, food-grade containers</li>
                      <li>Label all items with contents, preparation date, and allergen information</li>
                      <li>Complete the quality checklist for each donation</li>
                      <li>Coordinate timely pickups to minimize time in the "temperature danger zone"</li>
                    </ul>
                    <p className="mt-2 text-gray-700">
                      For detailed guidance, please refer to our Food Safety Guidelines page.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>Can I choose who receives my donation?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700">
                      Yes, you have options for directing your donations:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                      <li>You can allow any verified recipient to claim your donation</li>
                      <li>You can specify preferred recipient types (e.g., shelters, food banks)</li>
                      <li>You can establish recurring donation relationships with specific organizations</li>
                      <li>You can use our matching system to find the most appropriate recipient</li>
                    </ul>
                    <p className="mt-2 text-gray-700">
                      While you have these options, we encourage flexibility to ensure food reaches those in need quickly.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger>What if no one claims my donation?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700">
                      If your donation isn't claimed within a specified timeframe:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                      <li>Our system will send alerts to nearby recipients to increase visibility</li>
                      <li>You'll receive notifications with suggestions to adjust pickup times or donation details</li>
                      <li>For time-sensitive items, our support team can help with emergency matching</li>
                      <li>You can extend the availability window if the food remains safe</li>
                    </ul>
                    <p className="mt-2 text-gray-700">
                      We work hard to ensure all viable donations find recipients, but we recommend having a backup plan for food that's approaching the end of its safe donation window.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recipients" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>For Recipients</CardTitle>
              <CardDescription>Questions specifically for recipient organizations</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Who can register as a recipient?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700">
                      The following types of organizations can register as recipients:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                      <li>Registered charitable organizations</li>
                      <li>Food banks and food pantries</li>
                      <li>Community kitchens and meal programs</li>
                      <li>Shelters and transitional housing facilities</li>
                      <li>Religious organizations providing community meals</li>
                      <li>Schools and educational institutions with food assistance programs</li>
                      <li>Other non-profit organizations serving vulnerable populations</li>
                    </ul>
                    <p className="mt-2 text-gray-700">
                      During registration, you'll need to provide documentation verifying your organization's status.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>How do I find available donations in my area?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700">
                      Finding nearby donations is easy:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                      <li>Log into your recipient dashboard</li>
                      <li>View the map of available donations in your area</li>
                      <li>Use filters to find specific food types or quantities</li>
                      <li>Enable notifications to be alerted when new donations become available</li>
                      <li>Set up saved searches for regularly needed items</li>
                    </ul>
                    <p className="mt-2 text-gray-700">
                      You can also specify your service radius to only see donations within a manageable distance.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>What should I do if received food doesn't meet safety standards?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700">
                      If you receive food that doesn't meet safety standards:
                    </p>
                    <ol className="list-decimal pl-5 mt-2 space-y-1 text-gray-700">
                      <li>Do not distribute the unsafe food</li>
                      <li>Document the issues with photos if possible</li>
                      <li>Report the problem through our platform immediately</li>
                      <li>Dispose of unsafe food properly</li>
                      <li>Work with our support team on next steps</li>
                    </ol>
                    <p className="mt-2 text-gray-700">
                      Food safety is our top priority. Reporting issues helps us maintain quality standards and provide guidance to donors.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>Can I request specific types of donations?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700">
                      Yes, you can request specific donations in several ways:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                      <li>Create a "Needs List" on your profile that donors can view</li>
                      <li>Post specific requests in the "Recipient Requests" section</li>
                      <li>Set up notification preferences for particular food categories</li>
                      <li>Connect directly with regular donors to communicate specific needs</li>
                    </ul>
                    <p className="mt-2 text-gray-700">
                      While we can't guarantee that all specific requests will be fulfilled, this feature helps donors understand what items are most needed.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger>What equipment do I need to receive donations?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700">
                      Depending on the types of donations you accept, helpful equipment includes:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                      <li>Refrigeration and freezer capacity for perishable items</li>
                      <li>Food-safe storage containers and shelving</li>
                      <li>Thermometers to verify food temperatures upon receipt</li>
                      <li>Transportation equipment such as insulated carriers or coolers</li>
                      <li>Basic food handling supplies (gloves, hairnets, etc.)</li>
                      <li>Scale for weighing and tracking donation amounts</li>
                    </ul>
                    <p className="mt-2 text-gray-700">
                      You can start with basic equipment and expand as your capacity grows. Our Resources page has information about grants and programs that may help with equipment costs.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="platform" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform & Technical</CardTitle>
              <CardDescription>Questions about using the FoodShare platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I create an account?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700">
                      To create an account:
                    </p>
                    <ol className="list-decimal pl-5 mt-2 space-y-1 text-gray-700">
                      <li>Click "Log In" at the top of the page</li>
                      <li>Select "Register as Donor" or "Register as Recipient"</li>
                      <li>Fill out the registration form with your information</li>
                      <li>Verify your email address via the confirmation link</li>
                      <li>Complete your profile with additional details</li>
                    </ol>
                    <p className="mt-2 text-gray-700">
                      For recipient organizations, you'll also need to provide documentation verifying your organization's status.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>Does FoodShare have a mobile app?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700">
                      Currently, FoodShare is available as a mobile-responsive web application that works well on smartphones and tablets. 
                      You can access all features through your mobile browser.
                    </p>
                    <p className="mt-2 text-gray-700">
                      For the best experience on mobile devices, we recommend:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                      <li>Adding the website to your home screen for quick access</li>
                      <li>Enabling notifications in your browser</li>
                      <li>Using a recent version of Chrome, Safari, or Firefox</li>
                    </ul>
                    <p className="mt-2 text-gray-700">
                      We are developing native mobile apps for iOS and Android, which will be available in the future.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>How does the location matching system work?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700">
                      Our location matching system works as follows:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                      <li>When donors and recipients register, they provide their location</li>
                      <li>Donors specify their location when creating donation listings</li>
                      <li>Recipients set their service radius (how far they can travel)</li>
                      <li>Our algorithm matches donations with nearby recipients</li>
                      <li>The platform calculates distance and travel time between locations</li>
                      <li>Matches are prioritized based on proximity and food type compatibility</li>
                    </ul>
                    <p className="mt-2 text-gray-700">
                      Location data is used only for matching purposes and is protected according to our privacy policy.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>What if I'm having technical issues with the platform?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700">
                      If you experience technical issues:
                    </p>
                    <ol className="list-decimal pl-5 mt-2 space-y-1 text-gray-700">
                      <li>Check our Support Center for known issues and solutions</li>
                      <li>Try refreshing the page or using a different browser</li>
                      <li>Clear your browser cache and cookies</li>
                      <li>Contact our support team through the "Help" button</li>
                      <li>Provide details about the issue, including screenshots if possible</li>
                    </ol>
                    <p className="mt-2 text-gray-700">
                      Our support team is available 7 days a week to help resolve technical issues.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger>Is my data secure on FoodShare?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700">
                      Yes, we take data security seriously:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                      <li>All data is encrypted in transit and at rest</li>
                      <li>We use secure authentication systems</li>
                      <li>Personal information is shared only as necessary for donation facilitation</li>
                      <li>We regularly audit our security measures</li>
                      <li>We never sell user data to third parties</li>
                    </ul>
                    <p className="mt-2 text-gray-700">
                      For more information, please review our Privacy Policy and Terms of Service.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}