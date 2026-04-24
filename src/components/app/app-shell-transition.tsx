"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { SplashScreen } from "@/components/app/splash-screen";
import { cn } from "@/lib/utils";

const SPLASH_VISIBLE_MS = 1700;
const SPLASH_FADE_MS = 450;

export function AppShellTransition({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [phase, setPhase] = useState<"splash" | "fading" | "ready">("splash");

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setPhase("fading"), SPLASH_VISIBLE_MS);
    const readyTimer = window.setTimeout(
      () => setPhase("ready"),
      SPLASH_VISIBLE_MS + SPLASH_FADE_MS,
    );

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(readyTimer);
    };
  }, []);

  const showSplash = phase !== "ready";

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,#f2e6ef,transparent_30%)]">
      {showSplash ? <SplashScreen fadingOut={phase === "fading"} /> : null}

      <div
        className={cn(
          "min-h-screen transition-all duration-700 ease-out motion-reduce:transition-none",
          phase === "ready"
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-2 scale-[0.995] opacity-0",
        )}
      >
        {children}
      </div>
    </div>
  );
}
