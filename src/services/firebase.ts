import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isConfigValid = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && value.length > 0,
);

const app =
  isConfigValid && !getApps().length ? initializeApp(firebaseConfig) : isConfigValid ? getApp() : undefined;

export const auth = app ? getAuth(app) : undefined;
export const googleProvider = app ? new GoogleAuthProvider() : undefined;
export const firebaseReady = Boolean(app);
