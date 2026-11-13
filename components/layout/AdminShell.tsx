"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  LayoutDashboard,
  Inbox,
  ListChecks,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox },
  { href: "/admin/challenges", label: "Challenges", icon: ListChecks },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col md:border-r md:border-border md:bg-card">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-dark text-white font-bold">A</div>
          <div>
            <p className="font-semibold text-foreground">AgriQuest</p>
            <p className="text-xs text-muted-foreground">Admin Console</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => {
            const active = pathname === item.href;
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
          <Link href="/farmer/dashboard">
            <Button variant="outline" size="sm" fullWidth>
              <ArrowLeft className="h-4 w-4" /> Back to Farmer
            </Button>
          </Link>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur md:ml-64">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-dark text-white font-bold">A</div>
            <span className="font-semibold">AgriQuest Admin</span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm text-muted-foreground">Demo Environment · Simulated data</p>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <Avatar initials="AD" size="sm" />
          </div>
        </div>
      </header>

      <main className="pb-20 md:ml-64 md:pb-8">
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-6">{children}</div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card md:hidden">
        <div className="flex items-center justify-around px-1 py-1.5">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={cn("flex flex-1 flex-col items-center gap-0.5 py-1 text-[10px]", active ? "text-primary" : "text-muted-foreground")}>
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}