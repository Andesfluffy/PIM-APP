"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/services/firebase";

interface UserData {
  id: string;
  email?: string | null;
  name?: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  providerId?: string | null;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  logout: () => Promise<void> | void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get the ID token and set it as a cookie
          const token = await firebaseUser.getIdToken();
          document.cookie = `firebase-auth-token=${token}; path=/; max-age=3600; secure; samesite=strict`;

          // Create user object with the data you need
          const userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name:
              firebaseUser.displayName ||
              firebaseUser.email?.split("@")[0] ||
              "User",
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            metadata: {
              creationTime: firebaseUser.metadata.creationTime,
              lastSignInTime: firebaseUser.metadata.lastSignInTime,
            },
            providerId: firebaseUser.providerData[0]?.providerId,
          };

          setUser(userData);
        } catch (error) {
          console.error("Error getting ID token:", error);
          setUser(null);
        }
      } else {
        // Remove the cookie when user signs out
        document.cookie =
          "firebase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      // Cookie will be removed by the onAuthStateChanged listener
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
