import type { ReactNode } from "react";
import type { Metadata } from "next";
import { AppShellTransition } from "@/components/app/app-shell-transition";
import "./globals.css";

export const metadata: Metadata = {
  title: "Client Work Tracker by Meraki",
  description: "A focused internal tracker for client work, projects, and daily tasks.",
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
