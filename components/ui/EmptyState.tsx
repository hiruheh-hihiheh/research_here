import React from "react";
import { cn } from "@/lib/utils";

export function EmptyState({ title, description, icon: Icon, className }: { title: string; description?: string; icon?: React.ComponentType<{ className?: string }>; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center", className)}>
      {Icon && <Icon className="mb-3 h-10 w-10 text-muted-foreground" />}
      <p className="font-semibold text-foreground">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}