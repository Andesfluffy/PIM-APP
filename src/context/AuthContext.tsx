"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/services/firebase";

const AuthContext = createContext({
  user: null,
  loading: true,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          // Set a session cookie; in dev over http, omit `secure` so the cookie is set on localhost
          const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
          const isProd = process.env.NODE_ENV === "production";
          const secureAttr = isHttps || isProd ? "; secure" : "";
          // Be strict in prod, a bit looser in dev to avoid cookie drops
          const sameSiteAttr = isProd ? "; samesite=strict" : "; samesite=lax";
          document.cookie = `firebase-auth-token=${token}; path=/${sameSiteAttr}${secureAttr}`;

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

          setUser(userData as any);
        } catch (error) {
          console.error("Error getting ID token:", error);
          setUser(null);
        }
      } else {
        document.cookie =
          "firebase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // End session on tab close: clear cookie and sign out
  useEffect(() => {
    if (!auth) return;
    const handleUnload = () => {
      try {
        // Clear the auth cookie immediately
        document.cookie =
          "firebase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; samesite=strict";
        // Best effort sign-out; may not complete before unload, but persistence is per-tab
        signOut(auth).catch(() => {});
      } catch {}
    };
    window.addEventListener("pagehide", handleUnload);
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("pagehide", handleUnload);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  const logout = async () => {
    try {
      if (!auth) {
        setUser(null);
        return;
      }

      await signOut(auth);
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
