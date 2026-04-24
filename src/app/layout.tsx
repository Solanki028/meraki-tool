import type { ReactNode } from "react";
import type { Metadata } from "next";
import { AppShellTransition } from "@/components/app/app-shell-transition";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meraki Workspace - Client Work Tracker",
  description: "A focused internal tracker for client work, projects, and daily tasks.",
  openGraph: {
    title: "Meraki Workspace",
    description: "A focused internal tracker for client work, projects, and daily tasks.",
    siteName: "Meraki Workspace",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meraki Workspace",
    description: "A focused internal tracker for client work, projects, and daily tasks.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">
        <AppShellTransition>{children}</AppShellTransition>
      </body>
    </html>
  );
}
