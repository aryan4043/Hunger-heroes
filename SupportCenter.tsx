import React, { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Search, 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  PhoneCall, 
  Clock,
  FileText,
  BookOpen,
  BookMarked,
  AlertCircle
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface SupportCenterProps {
  isUserLoggedIn: boolean;
  userType: string | null;
  onLogout: () => void;
}

export default function SupportCenter({ isUserLoggedIn, userType, onLogout }: SupportCenterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would send the form data to the server
    console.log("Contact form submitted:", contactForm);
    toast({
      title: "Message Sent",
      description: "We've received your message and will respond shortly.",
    });
    setContactForm({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };

  const commonIssues = [
    {
      id: "account",
      title: "Account Issues",
      issues: [
        {
          id: "reset-password",
          question: "How do I reset my password?",
          answer: "To reset your password, click on 'Login', then 'Forgot Password'. Enter your email address to receive a password reset link. Follow the instructions in the email to create a new password."
        },
        {
          id: "update-profile",
          question: "How do I update my profile information?",
          answer: "Log in to your account, go to your dashboard, and click on 'Profile' or 'Account Settings'. From there, you can edit your personal information, contact details, and preferences."
        },
        {
          id: "delete-account",
          question: "Can I delete my account?",
          answer: "Yes, you can delete your account by going to Account Settings and selecting 'Delete Account'. Please note that this action is permanent and will remove all your data from our system."
        }
      ]
    },
    {
      id: "donations",
      title: "Donation Process",
      issues: [
        {
          id: "donation-not-claimed",
          question: "What if my donation isn't claimed?",
          answer: "If your donation isn't claimed within 24 hours, our system will expand the search radius to notify more potential recipients. You'll also receive suggestions to adjust pickup times or donation details to increase chances of matching."
        },
        {
          id: "cancel-donation",
          question: "How do I cancel a donation?",
          answer: "You can cancel an unclaimed donation by going to your Donor Dashboard, finding the donation in the 'Active Donations' section, and clicking 'Cancel Donation'. For claimed donations, please contact the recipient directly to cancel."
        },
        {
          id: "track-donation",
          question: "How can I track my donation status?",
          answer: "All your donations can be tracked in real-time from your Donor Dashboard under 'My Donations'. Each donation will show its current status (available, claimed, in transit, completed) and the recipient information once claimed."
        }
      ]
    },
    {
      id: "technical",
      title: "Technical Support",
      issues: [
        {
          id: "browser-issues",
          question: "The website isn't working properly in my browser",
          answer: "FoodShare works best on recent versions of Chrome, Firefox, Safari, and Edge. Try clearing your browser cache and cookies, or use a different browser. If problems persist, please contact our support team with details about the issue."
        },
        {
          id: "notification-issues",
          question: "I'm not receiving notifications",
          answer: "Check your notification settings in your account preferences. Ensure you've allowed browser notifications and check your email spam folder. Verify that your contact information is correct in your profile."
        },
        {
          id: "location-issues",
          question: "The map or location services aren't working",
          answer: "Make sure you've allowed location access in your browser settings. Try refreshing the page or providing your location manually. If you're using a VPN, this might affect location accuracy."
        }
      ]
    }
  ];

  const filteredIssues = searchQuery 
    ? commonIssues.map(category => ({
        ...category,
        issues: category.issues.filter(issue => 
          issue.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          issue.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.issues.length > 0)
    : commonIssues;

  return (
    <PageLayout 
      title="Support Center" 
      description="Get help with using FoodShare and answers to your questions"
      isUserLoggedIn={isUserLoggedIn}
      userType={userType}
      onLogout={onLogout}
    >
      <div className="mt-6 space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for help with..."
                className="pl-10"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-gray-500">
                {filteredIssues.reduce((total, category) => total + category.issues.length, 0)} results for "{searchQuery}"
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                Help Center
              </CardTitle>
              <CardDescription>
                Find answers to common questions and issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="account">
                <TabsList className="w-full grid grid-cols-1 md:grid-cols-3 mb-4">
                  {commonIssues.map(category => (
                    <TabsTrigger key={category.id} value={category.id}>{category.title}</TabsTrigger>
                  ))}
                </TabsList>
                
                {commonIssues.map(category => (
                  <TabsContent key={category.id} value={category.id}>
                    <Accordion type="single" collapsible className="w-full">
                      {(searchQuery ? filteredIssues.find(c => c.id === category.id)?.issues : category.issues)?.map(issue => (
                        <AccordionItem key={issue.id} value={issue.id}>
                          <AccordionTrigger>{issue.question}</AccordionTrigger>
                          <AccordionContent>
                            <p className="text-gray-700">{issue.answer}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>
                ))}
              </Tabs>
              
              {searchQuery && filteredIssues.length === 0 && (
                <div className="text-center py-10">
                  <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No results found</h3>
                  <p className="text-gray-600 mb-4">
                    We couldn't find any help articles matching "{searchQuery}"
                  </p>
                  <Button onClick={() => setSearchQuery("")} variant="outline">
                    Clear Search
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-primary" />
                  Support Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="font-medium">Email Support:</p>
                <p className="text-gray-600 mb-2">24/7 (Response within 24 hours)</p>
                
                <p className="font-medium">Phone Support:</p>
                <p className="text-gray-600 mb-2">10:00 AM - 6:00 PM IST<br/>Monday - Friday</p>
                
                <p className="font-medium">Live Chat:</p>
                <p className="text-gray-600">9:00 AM - 8:00 PM IST<br/>Monday - Saturday</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-primary" />
                  Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-gray-500" />
                  <a href="/food-safety-guidelines" className="text-primary hover:underline">
                    Food Safety Guidelines
                  </a>
                </div>
                <div className="flex items-center">
                  <BookMarked className="h-4 w-4 mr-2 text-gray-500" />
                  <a href="/donation-best-practices" className="text-primary hover:underline">
                    Donation Best Practices
                  </a>
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-gray-500" />
                  <a href="/faqs" className="text-primary hover:underline">
                    Frequently Asked Questions
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-primary" />
              Contact Support
            </CardTitle>
            <CardDescription>
              Can't find what you're looking for? Get in touch with our support team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Email Us</h3>
                    <p className="text-sm text-gray-600">
                      For general inquiries and support:
                      <a href="mailto:support@foodshare.org" className="block text-primary hover:underline mt-1">
                        support@foodshare.org
                      </a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <PhoneCall className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Call Us</h3>
                    <p className="text-sm text-gray-600">
                      Our support team is available:
                      <a href="tel:+917037619952" className="block text-primary hover:underline mt-1">
                        +91 7037619952
                      </a>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <form onSubmit={handleContactFormSubmit}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input 
                          id="name" 
                          name="name" 
                          value={contactForm.name} 
                          onChange={handleContactFormChange} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          value={contactForm.email} 
                          onChange={handleContactFormChange} 
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input 
                        id="subject" 
                        name="subject" 
                        value={contactForm.subject} 
                        onChange={handleContactFormChange} 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message" 
                        name="message" 
                        rows={5} 
                        value={contactForm.message} 
                        onChange={handleContactFormChange} 
                        required 
                      />
                    </div>
                    
                    <Button type="submit">Send Message</Button>
                  </div>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>

        <Alert className="bg-primary/5 border-primary/20">
          <HelpCircle className="h-4 w-4 text-primary" />
          <AlertTitle>Need immediate assistance?</AlertTitle>
          <AlertDescription>
            Our support chatbot is available 24/7 to help with common issues. 
            Click the chat icon in the bottom right of your screen to get started.
          </AlertDescription>
        </Alert>
      </div>
    </PageLayout>
  );
}