"use client";
import { useRouter } from "next/navigation";

export default function BackButton({ label = "← Back to Home" }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/")}
      className="text-white/70 hover:text-white underline text-sm mt-4"
    >
      {label}
    </button>
  );
}
