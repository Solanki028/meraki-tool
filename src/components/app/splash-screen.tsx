"use client";

import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";

export function SplashScreen({ fadingOut = false }: { fadingOut?: boolean }) {
  const [isSettled, setIsSettled] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsSettled(true));

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[linear-gradient(110deg,#955775_0%,#6c2a61_42%,#42113f_100%)] px-6 transition-opacity duration-500 motion-reduce:transition-none",
        fadingOut ? "pointer-events-none opacity-0" : "opacity-100",
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_34%)]" />

      <div
        className={cn(
          "relative z-10 flex w-full max-w-xl flex-col items-center text-center transition-all duration-700 ease-out motion-reduce:transition-none",
          isSettled ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-[0.985] opacity-0",
          fadingOut && "scale-[1.015] opacity-0",
        )}
      >
        <div className="mb-8 rounded-[30px] border border-white/14 bg-white/8 p-5 shadow-[0_24px_60px_rgba(11,8,28,0.35)] backdrop-blur-sm">
          <div className="rounded-[24px] bg-white/95 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
            <BrandLogo size={132} priority />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Meraki Innovative Solutions
          </p>
          <p className="text-base text-white/72 md:text-lg">
            Organize. Focus. Deliver.
          </p>
        </div>

        <div className="mt-10 w-full max-w-sm space-y-3">
          <div className="h-px overflow-hidden rounded-full bg-white/16">
            <div className="splash-progress-line h-full w-1/2 bg-white/88" />
          </div>
          <p className="text-sm text-white/68">Preparing your workspace...</p>
        </div>
      </div>
    </div>
  );
}
