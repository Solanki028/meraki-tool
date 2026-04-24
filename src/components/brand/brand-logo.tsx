import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
  tone?: "default" | "muted";
};

export function BrandLogo({
  size = 56,
  className,
  priority = false,
  tone = "default",
}: BrandLogoProps) {
  return (
    <div
      className={cn("relative shrink-0 overflow-hidden", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src="/Logo.png"
        alt="Meraki Innovative Solutions"
        fill
        priority={priority}
        sizes={`${size}px`}
        className={cn(
          "object-contain",
          tone === "muted" && "opacity-95 saturate-[0.96]",
        )}
      />
    </div>
  );
}
