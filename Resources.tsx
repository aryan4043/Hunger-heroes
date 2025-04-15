import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, FileText, Link as LinkIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ResourcesProps {
  isUserLoggedIn: boolean;
  userType: string | null;
  onLogout: () => void;
}

export default function Resources({ isUserLoggedIn, userType, onLogout }: ResourcesProps) {
  return (
    <PageLayout 
      title="Resources" 
      description="Helpful resources for donors and recipients in our food sharing network"
      isUserLoggedIn={isUserLoggedIn}
      userType={userType}
      onLogout={onLogout}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Educational Resources
            </CardTitle>
            <CardDescription>Learn about food donation best practices</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li>
                <div className="font-medium">Food Safety Guidelines</div>
                <p className="text-sm text-gray-600 mb-2">
                  Learn how to safely handle, store, and transport donated food
                </p>
                <Button variant="link" className="h-8 p-0 text-primary flex items-center">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  <span>Access Guidelines</span>
                </Button>
              </li>
              <Separator className="my-2" />
              <li>
                <div className="font-medium">Food Waste Reduction Tips</div>
                <p className="text-sm text-gray-600 mb-2">
                  Strategies to minimize food waste in your organization
                </p>
                <Button variant="link" className="h-8 p-0 text-primary flex items-center">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  <span>Read Tips</span>
                </Button>
              </li>
              <Separator className="my-2" />
              <li>
                <div className="font-medium">Donation Tax Benefits</div>
                <p className="text-sm text-gray-600 mb-2">
                  Information about tax deductions for food donations
                </p>
                <Button variant="link" className="h-8 p-0 text-primary flex items-center">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  <span>Learn More</span>
                </Button>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2 text-primary" />
              Downloadable Templates
            </CardTitle>
            <CardDescription>Forms and checklists for your donation process</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li>
                <div className="font-medium">Donation Inventory Template</div>
                <p className="text-sm text-gray-600 mb-2">
                  Track your donations with this spreadsheet template
                </p>
                <Button variant="link" className="h-8 p-0 text-primary flex items-center">
                  <Download className="h-4 w-4 mr-1" />
                  <span>Download (.xlsx)</span>
                </Button>
              </li>
              <Separator className="my-2" />
              <li>
                <div className="font-medium">Food Safety Checklist</div>
                <p className="text-sm text-gray-600 mb-2">
                  Printable checklist for ensuring food safety standards
                </p>
                <Button variant="link" className="h-8 p-0 text-primary flex items-center">
                  <Download className="h-4 w-4 mr-1" />
                  <span>Download (.pdf)</span>
                </Button>
              </li>
              <Separator className="my-2" />
              <li>
                <div className="font-medium">Donation Receipt Template</div>
                <p className="text-sm text-gray-600 mb-2">
                  Standardized receipt for tax deduction purposes
                </p>
                <Button variant="link" className="h-8 p-0 text-primary flex items-center">
                  <Download className="h-4 w-4 mr-1" />
                  <span>Download (.pdf)</span>
                </Button>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <LinkIcon className="h-5 w-5 mr-2 text-primary" />
            External Resources
          </CardTitle>
          <CardDescription>Links to partner organizations and government resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Government Resources</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
                  <a href="https://fssai.gov.in/cms/food-safety-and-standards-regulations.php" target="_blank" className="text-primary hover:underline">
                    FSSAI Food Safety Guidelines
                  </a>
                </li>
                <li className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
                  <a href="https://main.mohfw.gov.in/" target="_blank" className="text-primary hover:underline">
                    Ministry of Health and Family Welfare
                  </a>
                </li>
                <li className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
                  <a href="https://fssai.gov.in/upload/uploadfiles/files/Guidance_Note_Transport_03_05_2018_Revised.pdf" target="_blank" className="text-primary hover:underline">
                    Food Transport Regulations
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Partner Organizations</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
                  <a href="https://www.feedingindia.org/" target="_blank" className="text-primary hover:underline">
                    Feeding India
                  </a>
                </li>
                <li className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
                  <a href="https://www.nofoodwaste.in/" target="_blank" className="text-primary hover:underline">
                    No Food Waste
                  </a>
                </li>
                <li className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
                  <a href="https://www.indiafoodbanking.org/" target="_blank" className="text-primary hover:underline">
                    Food Banking Network India
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mt-6" id="educational-videos">
        <CardHeader>
          <CardTitle className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 text-primary">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
            </svg>
            Educational Videos
          </CardTitle>
          <CardDescription>Informative videos for donors and recipients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">For Donors</h3>
              <ul className="space-y-4">
                <li>
                  <div className="font-medium">Reducing Food Waste in Restaurants</div>
                  <p className="text-sm text-gray-600 mb-2">
                    Learn practical strategies for minimizing food waste in commercial kitchens
                  </p>
                  <a href="https://www.youtube.com/watch?v=QN-VXefHiUA" target="_blank" className="text-primary hover:underline flex items-center">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    <span>Watch Video</span>
                  </a>
                </li>
                <li>
                  <div className="font-medium">Safe Food Donation Practices</div>
                  <p className="text-sm text-gray-600 mb-2">
                    Guidelines for ensuring food safety when donating meals and groceries
                  </p>
                  <a href="https://www.youtube.com/watch?v=zpFmzH85d8U" target="_blank" className="text-primary hover:underline flex items-center">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    <span>Watch Video</span>
                  </a>
                </li>
                <li>
                  <div className="font-medium">Food Storage Best Practices</div>
                  <p className="text-sm text-gray-600 mb-2">
                    Proper techniques for storing different food types to maximize shelf life
                  </p>
                  <a href="https://www.youtube.com/watch?v=tJJzS4uHQfE" target="_blank" className="text-primary hover:underline flex items-center">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    <span>Watch Video</span>
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">For Recipients</h3>
              <ul className="space-y-4">
                <li>
                  <div className="font-medium">Food Bank Operations Guide</div>
                  <p className="text-sm text-gray-600 mb-2">
                    How to effectively operate a food bank or community kitchen
                  </p>
                  <a href="https://www.youtube.com/watch?v=j-ZfUqRXz9w" target="_blank" className="text-primary hover:underline flex items-center">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    <span>Watch Video</span>
                  </a>
                </li>
                <li>
                  <div className="font-medium">Inventory Management for Food Pantries</div>
                  <p className="text-sm text-gray-600 mb-2">
                    Systems for tracking and managing food donations effectively
                  </p>
                  <a href="https://www.youtube.com/watch?v=zpFmzH85d8U" target="_blank" className="text-primary hover:underline flex items-center">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    <span>Watch Video</span>
                  </a>
                </li>
                <li>
                  <div className="font-medium">Community Distribution Methods</div>
                  <p className="text-sm text-gray-600 mb-2">
                    Efficient ways to distribute food to those in need in your community
                  </p>
                  <a href="https://www.youtube.com/watch?v=L2UY_-pxY4U" target="_blank" className="text-primary hover:underline flex items-center">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    <span>Watch Video</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}