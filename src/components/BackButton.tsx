"use client";

import Link from "next/link";

export default function BackButton() {
  return (
    <Link
      href="./"
      className="mt-8 inline-block px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-xl hover:bg-white/20 transition text-sm font-medium text-center"
    >
      ⬅ Back to Home
    </Link>
  );
}
