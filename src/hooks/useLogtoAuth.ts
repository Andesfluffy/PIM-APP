// hooks/useLogtoAuth.ts
"use client";

import { useEffect } from "react";
import { useLogto } from "@logto/next/client";
import { useAuth } from "@/components/AuthProvider";

export function useLogtoAuth() {
  const {
    isAuthenticated,
    getAccessToken,
    claims,
    isLoading: logtoLoading,
  } = useLogto();
  const { setUser, setIsLoading, user } = useAuth();

  useEffect(() => {
    const initializeUser = async () => {
      setIsLoading(true);

      try {
        if (isAuthenticated && claims) {
          // Map Logto claims to your User interface
          const userData = {
            id: claims.sub || "",
            name: claims.name || claims.email || "Unknown User",
            email: claims.email || "",
            image: claims.picture || undefined,
          };

          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error initializing user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (!logtoLoading) {
      initializeUser();
    }
  }, [isAuthenticated, claims, logtoLoading, setUser, setIsLoading]);

  return {
    isAuthenticated,
    user,
    isLoading: logtoLoading,
    getAccessToken,
  };
}
