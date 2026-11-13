"use client";

import { DemoProvider } from "@/features/demo/DemoContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <DemoProvider>{children}</DemoProvider>;
}