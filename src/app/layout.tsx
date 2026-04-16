"use client";

import type { Metadata } from "next";

import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "@/components/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM ISP Frontend",
  description: "Frontend-only CRM ISP demo built with Next.js, Tailwind, and shadcn-style UI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full bg-[var(--canvas)] text-[var(--foreground)]">
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
