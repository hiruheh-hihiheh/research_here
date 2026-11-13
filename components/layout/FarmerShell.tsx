"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useDemo } from "@/features/demo/DemoContext";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  Home,
  Target,
  BookOpen,
  Trophy,
  UploadCloud,
  BarChart3,
  ListChecks,
  MoreHorizontal,
  X,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/farmer/dashboard", label: "Home", icon: Home },
  { href: "/farmer/challenges", label: "Challenges", icon: Target },
  { href: "/farmer/learning", label: "Learn", icon: BookOpen },
  { href: "/farmer/activities", label: "Activities", icon: UploadCloud },
  { href: "/farmer/achievements", label: "Badges", icon: Trophy },
  { href: "/farmer/leaderboard", label: "Leaderboard", icon: ListChecks },
  { href: "/farmer/reports", label: "Reports", icon: BarChart3 },
];

const PRIMARY_MOBILE = NAV.slice(0, 4);

export function FarmerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { farmer, levelInfo } = useDemo();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col md:border-r md:border-border md:bg-card">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">A</div>
          <div>
            <p className="font-semibold text-foreground">AgriQuest</p>
            <p className="text-xs text-muted-foreground">Farmer Demo</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-sage text-primary-dark" : "text-muted-foreground hover:bg-sage/50 hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <Avatar initials={farmer.avatar} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{farmer.name}</p>
              <p className="truncate text-xs text-muted-foreground">{levelInfo.name} · Lv {levelInfo.level}</p>
            </div>
          </div>
          <Link href="/admin/dashboard" className="mt-3 block">
            <Button variant="outline" size="sm" fullWidth>
              <Settings2 className="h-4 w-4" /> Switch to Admin
            </Button>
          </Link>
        </div>
      </aside>

      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur md:ml-64">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">A</div>
            <span className="font-semibold">AgriQuest</span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm text-muted-foreground">Demo Environment · Illustrative data</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="md:hidden">
              <Button variant="outline" size="sm">Admin</Button>
            </Link>
            <Avatar initials={farmer.avatar} size="sm" />
          </div>
        </div>
      </header>

      <main className="pb-20 md:ml-64 md:pb-8">
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-6">{children}</div>
      </main>

      {/* Bottom nav mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card md:hidden">
        <div className="flex items-center justify-around px-1 py-1.5">
          {PRIMARY_MOBILE.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={cn("flex flex-1 flex-col items-center gap-0.5 py-1 text-[10px]", active ? "text-primary" : "text-muted-foreground")}>
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn("flex flex-1 flex-col items-center gap-0.5 py-1 text-[10px]", moreOpen ? "text-primary" : "text-muted-foreground")}
            aria-label="More navigation"
          >
            <MoreHorizontal className="h-5 w-5" />
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* More drawer */}
      {moreOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-card p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold">More</p>
              <button onClick={() => setMoreOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {NAV.slice(4).map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-medium",
                      active ? "bg-sage text-primary-dark" : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/admin/dashboard"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground"
              >
                <Settings2 className="h-4 w-4" />
                Switch to Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}