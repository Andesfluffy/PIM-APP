import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import BackButton from "@/components/BackButton";

<BackButton />;

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PIM App",
  description: "Manage Notes, Contacts and Tasks in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gradient-to-br from-indigo-500 to-purple-600 min-h-screen text-white`}
      >
        {children}
      </body>
    </html>
  );
}
