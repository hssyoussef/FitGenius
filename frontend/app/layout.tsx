import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../lib/context/AuthContext";

export const metadata: Metadata = {
  title: "FitGenius AI — AI Workout & Fitness Platform",
  description: "Personalized AI-generated workout plans, real-time exercise logging, intelligent progression, and advanced fitness dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased selection:bg-emerald-500 selection:text-white" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
