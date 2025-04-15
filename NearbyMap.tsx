import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";
import { useQuery } from "@tanstack/react-query";
import { calculateDistance, DEFAULT_COORDINATES, CHENNAI_LOCATIONS, getCurrentPosition } from "@/lib/utils";
import { Loader2, MapPin, Clock, Info, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet marker icon issue
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  });
}

// Custom marker icons based on organization type
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-icon",
    html: `<div style="background-color:${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const restaurantIcon = createCustomIcon("#4ade80"); // green
const supermarketIcon = createCustomIcon("#3b82f6"); // blue
const hotelIcon = createCustomIcon("#f59e0b"); // amber
const individualIcon = createCustomIcon("#8b5cf6"); // purple
const otherIcon = createCustomIcon("#ef4444"); // red

function getIconByType(type: string) {
  switch (type?.toLowerCase()) {
    case "restaurant":
      return restaurantIcon;
    case "supermarket":
      return supermarketIcon;
    case "hotel":
      return hotelIcon;
    case "individual":
      return individualIcon;
    default:
      return otherIcon;
  }
}

interface Donor {
  id: number;
  name: string;
  organizationType: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  distance?: number;
}

interface Donation {
  id: number;
  title: string;
  description: string;
  foodType: string;
  quantity: string;
  expiryDate: string;
  status: string;
  createdAt: string;
  donorId: number;
}

// Component to recenter map when user location changes
function LocationMarker({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, map.getZoom());
  }, [position, map]);
  return null;
}

export default function NearbyMap() {
  const { toast } = useToast();
  const [position, setPosition] = useState<[number, number]>([
    DEFAULT_COORDINATES.latitude,
    DEFAULT_COORDINATES.longitude
  ]);
  const [locationName, setLocationName] = useState<string>("Loading location...");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchRadius, setSearchRadius] = useState<number>(10);
  
  // Get nearby donors
  const {
    data: donors,
    isLoading: isLoadingDonors,
    error: donorsError,
    refetch: refetchDonors
  } = useQuery({
    queryKey: ["/api/donors/nearby", position, searchRadius],
    queryFn: async () => {
      if (!position[0] || !position[1]) return [];
      const response = await fetch(`/api/donors/nearby?latitude=${position[0]}&longitude=${position[1]}&radius=${searchRadius}`);
      if (!response.ok) {
        throw new Error("Failed to fetch nearby donors");
      }
      return response.json();
    },
    enabled: !!position[0] && !!position[1],
    select: (data: Donor[]) => {
      return data
        .filter(donor => donor.latitude !== null && donor.longitude !== null)
        .map(donor => {
          const distance = calculateDistance(
            position[0],
            position[1],
            donor.latitude!,
            donor.longitude!
          );
          return {
            ...donor,
            distance
          };
        })
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }
  });

  // Get available donations
  const {
    data: donations,
    isLoading: isLoadingDonations,
  } = useQuery({
    queryKey: ["/api/donations"],
    select: (data: Donation[]) => {
      return data.filter(donation => donation.status === "available");
    }
  });

  // Function to get donor's active donations
  const getDonorDonations = useCallback((donorId: number) => {
    if (!donations) return [];
    return donations.filter(donation => donation.donorId === donorId);
  }, [donations]);

  // Get user location
  useEffect(() => {
    const getPosition = async () => {
      try {
        // Use both useDefaultOnError and useDynamicDefault options
        const { coords } = await getCurrentPosition({ 
          useDefaultOnError: true,
          useDynamicDefault: true 
        });
        setPosition([coords.latitude, coords.longitude]);
        
        // Get the last location from localStorage to identify if it's from the dynamic list
        const lastLocation = localStorage.getItem('lastUsedLocation');
        
        if (lastLocation) {
          try {
            const location = JSON.parse(lastLocation);
            // If this is a saved location with a name
            if (location.name && location.name !== "Your Location") {
              setLocationName(`${location.name} (Default)`);
              toast({
                title: "Using saved location",
                description: `Using ${location.name} as your location`,
              });
              return;
            }
          } catch (e) {
            // If JSON parsing fails, continue with default behavior
            console.error("Error parsing last location:", e);
          }
        }
        
        // Check if we're using default coordinates
        if (coords.latitude === DEFAULT_COORDINATES.latitude && 
            coords.longitude === DEFAULT_COORDINATES.longitude) {
          setLocationName("SRM Chennai (Default)");
          toast({
            title: "Could not get your location",
            description: "Using SRM Chennai as default location",
            variant: "destructive",
          });
        } else {
          // Check if this is a location from our dynamic list
          const matchingLocation = CHENNAI_LOCATIONS.find(
            loc => loc.latitude === coords.latitude && loc.longitude === coords.longitude
          );
          
          if (matchingLocation) {
            setLocationName(`${matchingLocation.name} (Default)`);
            toast({
              title: "Using random Chennai location",
              description: `Using ${matchingLocation.name} as your location`,
              variant: "default",
            });
          } else {
            setLocationName("Your Location");
            toast({
              title: "Location found",
              description: "Using your current location",
            });
          }
        }
      } catch (error) {
        console.error("Error getting position:", error);
        toast({
          title: "Could not get your location",
          description: "Using a random Chennai location",
          variant: "destructive",
        });
        
        // Get a random location
        const randomLocation = CHENNAI_LOCATIONS[
          Math.floor(Math.random() * CHENNAI_LOCATIONS.length)
        ];
        
        setPosition([randomLocation.latitude, randomLocation.longitude]);
        setLocationName(`${randomLocation.name} (Default)`);
      }
    };
    
    getPosition();
  }, [toast]);

  // Filter donors by organization type and search radius
  const filteredDonors = donors?.filter(donor => {
    const isWithinRadius = (donor.distance || 0) <= searchRadius;
    const matchesFilter = selectedFilter === "all" || donor.organizationType === selectedFilter;
    return isWithinRadius && matchesFilter;
  });

  // Function to handle opening navigation in Google Maps
  const openNavigation = (latitude: number, longitude: number) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isUserLoggedIn={false} userType={null} onLogout={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-2xl flex items-center justify-between">
                  <span>Nearby Restaurant Donations</span>
                  <Badge variant="outline" className="text-xs font-normal flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {locationName}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Filter controls */}
                <div className="p-4 bg-gray-50 border-y relative z-10">
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                        <SelectTrigger className="w-full md:w-[180px]">
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="all">All types</SelectItem>
                            <SelectItem value="restaurant">Restaurants</SelectItem>
                            <SelectItem value="supermarket">Supermarkets</SelectItem>
                            <SelectItem value="hotel">Hotels</SelectItem>
                            <SelectItem value="individual">Individuals</SelectItem>
                            <SelectItem value="other">Others</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <Select 
                        value={searchRadius.toString()} 
                        onValueChange={(val) => {
                          const newRadius = parseInt(val);
                          setSearchRadius(newRadius);
                          // Refetch donors with new radius
                          refetchDonors();
                        }}
                      >
                        <SelectTrigger className="w-full md:w-[180px]">
                          <SelectValue placeholder="Search radius" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="5">Within 5 km</SelectItem>
                            <SelectItem value="10">Within 10 km</SelectItem>
                            <SelectItem value="15">Within 15 km</SelectItem>
                            <SelectItem value="25">Within 25 km</SelectItem>
                            <SelectItem value="50">Within 50 km</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {/* Map container */}
                <div className="h-[500px] w-full rounded-md overflow-hidden">
                  {position && (
                    <MapContainer
                      center={position}
                      zoom={12}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      
                      {/* User marker */}
                      <Marker position={position}>
                        <Popup>
                          <div className="text-center">
                            <strong>Your Location</strong>
                          </div>
                        </Popup>
                      </Marker>
                      
                      {/* Keep map centered on user position */}
                      <LocationMarker position={position} />
                      
                      {/* Donor markers */}
                      {filteredDonors?.map((donor) => (
                        <Marker
                          key={donor.id}
                          position={[donor.latitude!, donor.longitude!]}
                          icon={getIconByType(donor.organizationType)}
                        >
                          <Popup>
                            <div className="p-1">
                              <h3 className="font-bold">{donor.name}</h3>
                              <p className="text-sm text-gray-600">{donor.address}, {donor.city}</p>
                              
                              <div className="mt-2">
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                  {donor.organizationType}
                                </span>
                                <span className="ml-1 text-xs bg-green-100 px-2 py-1 rounded-full">
                                  {donor.distance?.toFixed(1)} km away
                                </span>
                              </div>
                              
                              {getDonorDonations(donor.id).length > 0 ? (
                                <div className="mt-2">
                                  <strong className="text-sm">Available donations:</strong>
                                  <ul className="mt-1 text-xs">
                                    {getDonorDonations(donor.id).slice(0, 3).map(donation => (
                                      <li key={donation.id} className="text-green-700">
                                        • {donation.title} ({donation.foodType})
                                      </li>
                                    ))}
                                    {getDonorDonations(donor.id).length > 3 && (
                                      <li className="text-gray-500">
                                        + {getDonorDonations(donor.id).length - 3} more items
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              ) : (
                                <p className="mt-2 text-xs text-gray-500">No active donations</p>
                              )}
                              
                              <div className="mt-3 pt-2 border-t border-gray-200 flex justify-end">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-xs"
                                  onClick={() => openNavigation(donor.latitude!, donor.longitude!)}
                                >
                                  Navigate
                                </Button>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  )}
                </div>
                
                <div className="p-3 bg-gray-50 border-t flex justify-between items-center text-xs text-gray-500">
                  <div>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Showing {filteredDonors?.length || 0} donors within {searchRadius} km
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                      Restaurant
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                      Supermarket
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Nearby Donors</CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                {isLoadingDonors ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                ) : donorsError ? (
                  <div className="p-4 text-center text-red-500">
                    <Info className="h-8 w-8 mx-auto mb-2" />
                    <p>Error loading donors</p>
                  </div>
                ) : filteredDonors?.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <MapPin className="h-8 w-8 mx-auto mb-2" />
                    <p>No donors found within {searchRadius} km</p>
                    <p className="text-sm mt-2">Try increasing the search radius or changing filters</p>
                  </div>
                ) : (
                  <div className="max-h-[600px] overflow-y-auto">
                    {filteredDonors?.map((donor, index) => (
                      <div key={donor.id} className="px-4">
                        <div className={`py-4 ${index !== 0 ? "border-t" : ""}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{donor.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {donor.address}, {donor.city}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {donor.organizationType}
                                </Badge>
                                <span className="text-xs text-gray-500 flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {donor.distance?.toFixed(1)} km
                                </span>
                              </div>
                            </div>
                            <div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs"
                                onClick={() => openNavigation(donor.latitude!, donor.longitude!)}
                              >
                                Navigate
                              </Button>
                            </div>
                          </div>
                          
                          {/* Donations by this donor */}
                          <div className="mt-3">
                            {getDonorDonations(donor.id).length > 0 ? (
                              <>
                                <p className="text-xs font-medium text-gray-700">Available Food Items:</p>
                                <ul className="mt-1 space-y-2">
                                  {getDonorDonations(donor.id).map(donation => (
                                    <li key={donation.id} className="text-sm bg-gray-50 p-2 rounded-md">
                                      <div className="font-medium">{donation.title}</div>
                                      <div className="text-xs text-gray-600 mt-1">{donation.description}</div>
                                      <div className="flex justify-between items-center mt-2 text-xs">
                                        <Badge variant="secondary" className="text-xs">
                                          {donation.foodType}
                                        </Badge>
                                        <span className="flex items-center text-gray-500">
                                          <Clock className="h-3 w-3 mr-1" />
                                          Expires: {new Date(donation.expiryDate).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </>
                            ) : (
                              <p className="text-xs text-gray-500 mt-2">No active donations from this donor</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}