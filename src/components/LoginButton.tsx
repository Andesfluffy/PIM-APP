"use client";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/services/firebase";

export default function LoginButton() {
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <button
      onClick={signInWithGoogle}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 px-10 py-4 font-semibold text-rose-900 shadow-lg shadow-rose-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-rose-200"
    >
      <span className="relative z-10 flex items-center gap-3 text-lg">
        <span className="text-2xl">✨</span>
        Sign in with Google
      </span>
      <div className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-white/20 via-white/40 to-white/20 opacity-0 transition-all duration-700 group-hover:translate-x-[120%] group-hover:opacity-100" />
    </button>
  );
}
