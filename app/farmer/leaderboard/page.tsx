"use client";

import { useState } from "react";
import { useDemo } from "@/features/demo/DemoContext";
import { Card, CardContent } from "@/components/ui/Card";

import { Avatar } from "@/components/ui/Avatar";
import { LEADERBOARD } from "@/features/demo/mockData";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = ["Weekly", "Monthly", "Global"] as const;

export default function LeaderboardPage() {
  const { farmer } = useDemo();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Global");

  // Build list with current farmer updated
  const entries = LEADERBOARD.map((e) =>
    e.isCurrent
      ? { ...e, name: farmer.name, avatar: farmer.avatar, level: farmer.level, xp: farmer.xp, country: farmer.country }
      : e
  ).sort((a, b) => b.xp - a.xp);

  // Slight variation per tab (demo)
  const multiplier = tab === "Weekly" ? 0.15 : tab === "Monthly" ? 0.5 : 1;
  const display = entries.map((e) => ({ ...e, xp: Math.round(e.xp * (e.isCurrent ? 1 : multiplier)) })).sort((a, b) => b.xp - a.xp);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-sm text-muted-foreground">Simulated global rankings · Demo data</p>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              tab === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:bg-sage"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {display.map((e, idx) => {
              const isCurrent = e.isCurrent;
              return (
                <li
                  key={e.id}
                  className={cn("flex items-center gap-3 px-4 py-3", isCurrent ? "bg-sage/40" : "")}
                >
                  <span className={cn("w-6 text-center font-bold", idx < 3 ? "text-amber-600" : "text-muted-foreground")}>
                    {idx + 1}
                  </span>
                  <Avatar initials={e.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className={cn("truncate text-sm font-medium", isCurrent && "text-primary-dark")}>
                      {e.name} {isCurrent && "(You)"}
                    </p>
                    <p className="text-xs text-muted-foreground">{e.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">Lv {e.level}</p>
                    <p className="text-xs text-muted-foreground">{e.xp} XP</p>
                  </div>
                  {idx === 0 && <Trophy className="h-5 w-5 text-amber-500" />}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">Rankings are illustrative and based on demo XP values.</p>
    </div>
  );
}