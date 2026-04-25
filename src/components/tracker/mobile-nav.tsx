"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MobileNav({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white p-4 md:hidden">
        <div className="flex items-center gap-3">
          <BrandLogo size={32} tone="muted" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-[#4d1c49]">
              Meraki Workspace
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="text-zinc-600"
        >
          <Menu className="size-6" />
        </Button>
      </div>

      {/* Mobile Drawer Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-zinc-950/20 backdrop-blur-sm transition-opacity md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Drawer Content */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] bg-white transition-transform md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <BrandLogo size={32} tone="muted" />
              <p className="text-sm font-semibold text-[#4d1c49]">Meraki</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-zinc-500"
            >
              <X className="size-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto" onClick={() => setIsOpen(false)}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
