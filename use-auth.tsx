import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: number;
  name: string;
  email: string;
  [key: string]: any;
};

type AuthContextType = {
  user: User | null;
  userType: 'donor' | 'recipient' | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (email: string, password: string, userType: 'donor' | 'recipient') => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [userType, setUserType] = useState<'donor' | 'recipient' | null>(() => {
    const storedType = localStorage.getItem('userType');
    return (storedType as 'donor' | 'recipient' | null) || null;
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('accessToken');
  });

  // Get user from storage on initial load
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User | null>({
    queryKey: userType ? [`/api/${userType}s/current`] : ['no-user'],
    queryFn: async () => {
      if (!userType) return null;
      try {
        // This endpoint would return the current logged-in user based on session
        // In a real app, this might use tokens stored in localStorage or cookies
        const storedUserId = localStorage.getItem('userId');
        if (!storedUserId) return null;
        
        const response = await apiRequest("GET", `/api/${userType}s/${storedUserId}`);
        return response.json();
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        return null;
      }
    },
    enabled: !!userType,
  });

  // Login function
  const login = async (email: string, password: string, type: 'donor' | 'recipient') => {
    try {
      const response = await apiRequest("POST", "/api/auth/secure-login", {
        email,
        password,
        userType: type,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
      
      const data = await response.json();
      
      // Update state
      setUserType(type);
      localStorage.setItem('userType', type);
      localStorage.setItem('userId', data.user.id.toString());
      
      // Store access and refresh tokens
      if (data.accessToken) {
        setAccessToken(data.accessToken);
        localStorage.setItem('accessToken', data.accessToken);
      }
      
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      // Refetch user data
      await refetch();
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.name}!`,
      });
      
      return data.user;
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Get refresh token if available to send to server
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Call logout endpoint with refresh token to properly invalidate it
      if (refreshToken) {
        await apiRequest("POST", "/api/auth/logout", { refreshToken });
      } else {
        await apiRequest("POST", "/api/auth/logout");
      }
      
      // Clear local storage
      localStorage.removeItem('userType');
      localStorage.removeItem('userId');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Clear user state
      setUserType(null);
      setAccessToken(null);
      
      // Clear cache
      queryClient.clear();
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      
      // Even if API call fails, clear local data
      localStorage.removeItem('userType');
      localStorage.removeItem('userId');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Clear user state
      setUserType(null);
      setAccessToken(null);
      
      // Clear cache
      queryClient.clear();
      
      toast({
        title: "Warning",
        description: "Logged out locally, but server session may still be active.",
        variant: "destructive",
      });
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!user && !!userType;

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        userType,
        isLoading,
        error: error as Error,
        login,
        logout,
        isAuthenticated,
        accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}