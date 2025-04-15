import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { FoodPreferencesManager } from "@/components/FoodPreferencesManager";
import { Separator } from "@/components/ui/separator";

interface FoodAttribute {
  id: number;
  name: string;
  description: string | null;
  category: string;
  createdAt: string;
}

interface RecipientPreference {
  recipientId: number;
  attributeId: number;
  importance: number;
  createdAt: string;
  updatedAt: string;
  attribute: FoodAttribute;
}

export default function RecipientPreferences() {
  const { user, userType } = useAuth();
  const { toast } = useToast();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const recipientId = user?.id || 0;

  // Fetch food attributes
  const { data: attributes, isLoading: isLoadingAttributes } = useQuery<FoodAttribute[]>({
    queryKey: ['/api/food-attributes'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/food-attributes");
      return response.json();
    },
    enabled: !!recipientId,
  });

  // Fetch user's current preferences
  const { data: preferences, isLoading: isLoadingPreferences } = useQuery<RecipientPreference[]>({
    queryKey: ['/api/recipients', recipientId, 'preferences'],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/recipients/${recipientId}/preferences`);
      return response.json();
    },
    enabled: !!recipientId,
  });

  // Mutation for saving preferences
  const updatePreferenceMutation = useMutation({
    mutationFn: async ({ attributeId, importance }: { attributeId: number; importance: number; }) => {
      return apiRequest("PUT", `/api/recipients/${recipientId}/preferences/${attributeId}`, {
        importance
      });
    },
    onSuccess: () => {
      // Invalidate and refetch preferences
      queryClient.invalidateQueries({ queryKey: ['/api/recipients', recipientId, 'preferences'] });
      
      setSuccessMessage("Preference updated successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error: any) => {
      toast({
        title: "Error updating preference",
        description: error.message || "Failed to update your preference",
        variant: "destructive",
      });
    },
  });

  // Mutation for adding a new preference
  const addPreferenceMutation = useMutation({
    mutationFn: async ({ attributeId, importance }: { attributeId: number; importance: number; }) => {
      return apiRequest("POST", `/api/recipients/${recipientId}/preferences`, {
        attributeId,
        importance
      });
    },
    onSuccess: () => {
      // Invalidate and refetch preferences
      queryClient.invalidateQueries({ queryKey: ['/api/recipients', recipientId, 'preferences'] });
      
      setSuccessMessage("New preference added");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error: any) => {
      toast({
        title: "Error adding preference",
        description: error.message || "Failed to add your preference",
        variant: "destructive",
      });
    },
  });

  const handlePreferenceChange = (attributeId: number, importance: number) => {
    // Check if this is an existing preference or a new one
    const existingPref = preferences?.find(p => p.attributeId === attributeId);
    
    if (existingPref) {
      updatePreferenceMutation.mutate({ attributeId, importance });
    } else {
      addPreferenceMutation.mutate({ attributeId, importance });
    }
  };

  const getPreferenceImportance = (attributeId: number): number => {
    const preference = preferences?.find(p => p.attributeId === attributeId);
    return preference ? preference.importance : 0;
  };

  const groupAttributesByCategory = (attrs?: FoodAttribute[]) => {
    if (!attrs) return {};
    
    const grouped: Record<string, FoodAttribute[]> = {};
    
    attrs.forEach(attr => {
      if (!grouped[attr.category]) {
        grouped[attr.category] = [];
      }
      grouped[attr.category].push(attr);
    });
    
    return grouped;
  };

  const groupedAttributes = groupAttributesByCategory(attributes);
  const isLoading = isLoadingAttributes || isLoadingPreferences;
  const isMutating = updatePreferenceMutation.isPending || addPreferenceMutation.isPending;

  // Handle case where user is not a recipient
  if (userType !== 'recipient') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>This page is only available for food recipients.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/"}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => window.location.href = "/recipient/dashboard"}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Food Preferences</h1>
        <p className="text-muted-foreground">
          Set your food preferences to receive better matched donations.
          Higher importance values (closer to 5) mean you strongly prefer these attributes.
        </p>
      </div>

      {successMessage && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groupedAttributes).map(([category, attrs]) => (
            <Card key={category} className="overflow-hidden">
              <CardHeader className="bg-slate-50 pb-3">
                <CardTitle className="text-lg capitalize">{category.toLowerCase()} Preferences</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {attrs.map(attribute => (
                    <div key={attribute.id} className="space-y-2">
                      <div className="flex justify-between items-end mb-1">
                        <label className="text-sm font-medium">
                          {attribute.name}
                        </label>
                        <span className="text-sm text-muted-foreground">
                          Importance: {getPreferenceImportance(attribute.id)}
                        </span>
                      </div>
                      
                      <Slider
                        value={[getPreferenceImportance(attribute.id)]}
                        min={0}
                        max={5}
                        step={1}
                        disabled={isMutating}
                        onValueChange={(value) => {
                          handlePreferenceChange(attribute.id, value[0]);
                        }}
                        className="py-1"
                      />
                      <div className="mt-1 relative w-full bg-secondary/30 h-1 rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-primary/40 rounded-full"
                          style={{ width: `${(getPreferenceImportance(attribute.id) / 5) * 100}%` }}
                        />
                      </div>
                      
                      {attribute.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {attribute.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <Separator className="my-10" />
      
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-6">Your Matching Preferences</h2>
        <Card>
          <CardHeader>
            <CardTitle>Matching Preview</CardTitle>
            <CardDescription>
              See how your preferences affect donation matching. The weight of each attribute is 
              determined by its importance value.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recipientId ? (
              <FoodPreferencesManager recipientId={recipientId} />
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Unable to load preferences. Please try again later.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}