import React from "react";
import { cn } from "@/lib/utils";

export function Avatar({ initials, className, size = "md" }: { initials: string; className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-lg" };
  return (
    <div
      className={cn("flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold", sizes[size], className)}
    >
      {initials}
    </div>
  );
}