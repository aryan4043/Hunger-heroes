import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | number): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

// Calculate distance between two points in kilometers
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function formatDistanceToNow(date: Date | string | number): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  
  // Convert milliseconds to different time units
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

// Default coordinates for SRM Chennai
export const DEFAULT_COORDINATES = {
  latitude: 12.8230, 
  longitude: 80.0444,
  name: "SRM Chennai"
};

// List of dynamic locations in Chennai to use as fallback
export const CHENNAI_LOCATIONS = [
  { latitude: 12.8230, longitude: 80.0444, name: "SRM Chennai" },
  { latitude: 13.0827, longitude: 80.2707, name: "Chennai Central" },
  { latitude: 13.0569, longitude: 80.2425, name: "T. Nagar" },
  { latitude: 12.9026, longitude: 80.0829, name: "Tambaram" },
  { latitude: 13.1067, longitude: 80.2912, name: "Anna Nagar" }
];

// Get a random location from the list of Chennai locations
function getRandomChennaiLocation() {
  // Get a random index from the CHENNAI_LOCATIONS array
  const randomIndex = Math.floor(Math.random() * CHENNAI_LOCATIONS.length);
  return CHENNAI_LOCATIONS[randomIndex];
}

// Save last used location to localStorage
function saveLastLocation(location: {latitude: number, longitude: number, name: string}) {
  try {
    localStorage.setItem('lastUsedLocation', JSON.stringify(location));
  } catch (error) {
    console.error('Error saving location to localStorage:', error);
  }
}

// Get last used location from localStorage
function getLastLocation(): {latitude: number, longitude: number, name: string} | null {
  try {
    const savedLocation = localStorage.getItem('lastUsedLocation');
    if (savedLocation) {
      return JSON.parse(savedLocation);
    }
  } catch (error) {
    console.error('Error getting location from localStorage:', error);
  }
  return null;
}

// Create a geolocation position object from coordinates
function createPositionFromCoordinates(coordinates: {latitude: number, longitude: number, name: string}): GeolocationPosition {
  // Save this location for future use
  saveLastLocation(coordinates);
  
  return {
    coords: {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      accuracy: 1000,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      // Add required toJSON method
      toJSON: function() {
        return {
          latitude: this.latitude,
          longitude: this.longitude,
          accuracy: this.accuracy,
          altitude: this.altitude,
          altitudeAccuracy: this.altitudeAccuracy,
          heading: this.heading,
          speed: this.speed
        };
      }
    },
    timestamp: Date.now()
  } as GeolocationPosition;
}

// Get user's current position as a Promise
export function getCurrentPosition(options?: {
  useDefaultOnError?: boolean,
  useDynamicDefault?: boolean
}): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      if (options?.useDefaultOnError) {
        // Try to get the last used location first
        const lastLocation = getLastLocation();
        
        // If we have a last location and we're using dynamic defaults, use that
        if (lastLocation && options?.useDynamicDefault) {
          resolve(createPositionFromCoordinates(lastLocation));
          return;
        }
        
        // If we want a dynamic default, get a random Chennai location
        if (options?.useDynamicDefault) {
          const randomLocation = getRandomChennaiLocation();
          resolve(createPositionFromCoordinates(randomLocation));
          return;
        }
        
        // Otherwise use the static default
        resolve(createPositionFromCoordinates(DEFAULT_COORDINATES));
      } else {
        reject(new Error("Geolocation is not supported by your browser"));
      }
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Success! Save this as last used location
          saveLastLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            name: "Your Location"
          });
          resolve(position);
        }, 
        (error) => {
          if (options?.useDefaultOnError) {
            // Try to get the last used location first
            const lastLocation = getLastLocation();
            
            // If we have a last location and we're using dynamic defaults, use that
            if (lastLocation && options?.useDynamicDefault) {
              resolve(createPositionFromCoordinates(lastLocation));
              return;
            }
            
            // If we want a dynamic default, get a random Chennai location
            if (options?.useDynamicDefault) {
              const randomLocation = getRandomChennaiLocation();
              resolve(createPositionFromCoordinates(randomLocation));
              return;
            }
            
            // Otherwise use the static default
            resolve(createPositionFromCoordinates(DEFAULT_COORDINATES));
          } else {
            reject(error);
          }
        },
        // Timeout after 5 seconds, ask for high accuracy
        { timeout: 5000, enableHighAccuracy: true, maximumAge: 0 }
      );
    }
  });
}

// Check if browser has network connection
export function isOnline(): boolean {
  return navigator.onLine;
}

// Store data in localStorage with expiry
export function setWithExpiry(key: string, value: any, ttl: number): void {
  const now = new Date();
  const item = {
    value,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

// Get data from localStorage and check expiry
export function getWithExpiry(key: string): any {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;
  
  const item = JSON.parse(itemStr);
  const now = new Date();
  
  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  
  return item.value;
}
