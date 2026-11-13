import React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "primary" | "sage" | "amber" | "success" | "muted" | "danger";

const variants: Record<Variant, string> = {
  default: "bg-sage text-primary-dark",
  primary: "bg-primary text-primary-foreground",
  sage: "bg-sage text-primary-dark",
  amber: "bg-amber-100 text-amber-800",
  success: "bg-green-100 text-green-800",
  muted: "bg-gray-100 text-gray-700",
  danger: "bg-red-100 text-red-800",
};

export function Badge({ className, variant = "default", children, ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}