"use client";

import { ReactNode } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/services/firebase";

type LoginButtonProps = {
  /**
   * Visual variant for the button. "solid" renders a filled style that is
   * perfect for primary call-to-action placements, while "outline" keeps the
   * lighter appearance used in secondary contexts.
   */
  variant?: "solid" | "outline";
  /**
   * When true the button expands to fill the width of its container.
   */
  fullWidth?: boolean;
  /**
   * Optional custom content. Defaults to "Sign in with Google" when omitted.
   */
  children?: ReactNode;
  /**
   * Additional classes for custom layout scenarios.
   */
  className?: string;
};

export default function LoginButton({
  variant = "outline",
  fullWidth = false,
  children,
  className = "",
}: LoginButtonProps) {
  const credentialsUnavailable = !auth || !googleProvider;

  const signInWithGoogle = async () => {
    if (credentialsUnavailable) {
      console.warn("Google sign-in is not configured. Skipping popup.");
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const baseClasses =
    "group relative flex items-center justify-center gap-3 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
  const variantClasses =
    variant === "solid"
      ? "bg-red-crayola-500 text-white shadow-[0_18px_35px_rgba(237,37,78,0.18)] hover:-translate-y-0.5 hover:shadow-[0_24px_45px_rgba(237,37,78,0.25)] focus-visible:outline-red-crayola-500"
      : "border border-charcoal-900 bg-white text-charcoal-600 shadow-sm hover:border-red-crayola-400 hover:text-red-crayola-500 focus-visible:outline-red-crayola-400";
  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = credentialsUnavailable
    ? "cursor-not-allowed opacity-60 hover:translate-y-0 hover:shadow-none"
    : "";

  return (
    <button
      type="button"
      onClick={signInWithGoogle}
      disabled={credentialsUnavailable}
      className={`${baseClasses} ${variantClasses} ${widthClass} ${disabledClass} ${className}`.trim()}
      title={
        credentialsUnavailable
          ? "Google sign-in is not available in this environment."
          : undefined
      }
    >
      <span className="flex items-center gap-3">
        <span className="flex h-5 w-5 items-center justify-center">
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5">
            <path
              fill="#4285F4"
              d="M21.6 12.23c0-.83-.07-1.63-.21-2.4H12v4.55h5.41c-.23 1.24-.95 2.28-2.01 2.98v2.48h3.25c1.9-1.75 2.95-4.33 2.95-7.61z"
            />
            <path
              fill="#34A853"
              d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.25-2.48c-.9.6-2.05.95-3.36.95-2.58 0-4.78-1.74-5.56-4.07H3.03v2.55A10 10 0 0012 22z"
            />
            <path
              fill="#FBBC05"
              d="M6.44 13.96a5.99 5.99 0 010-3.92V7.5H3.03a10 10 0 000 8.99l3.41-2.53z"
            />
            <path
              fill="#EA4335"
              d="M12 6.13c1.47 0 2.8.51 3.85 1.51l2.89-2.89C16.96 2.88 14.7 2 12 2 7.83 2 4.17 4.42 3.03 7.5l3.41 2.53C7.22 7.7 9.42 6.13 12 6.13z"
            />
          </svg>
        </span>
        <span>{children ?? "Sign in with Google"}</span>
      </span>
    </button>
  );
}
