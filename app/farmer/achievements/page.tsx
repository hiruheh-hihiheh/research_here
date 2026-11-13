"use client";

import { useDemo } from "@/features/demo/DemoContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { BADGES } from "@/features/demo/mockData";
import { Trophy, Lock, Zap } from "lucide-react";

export default function AchievementsPage() {
  const { farmer, levelInfo, nextLevel, xpToNext } = useDemo();
  const earned = new Set(farmer.badges);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Achievements</h1>
        <p className="text-sm text-muted-foreground">Your XP, level and earned badges.</p>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Current level</p>
            <h2 className="text-xl font-bold">{levelInfo.name}</h2>
            <p className="text-sm text-muted-foreground">Level {levelInfo.level} · {farmer.xp} XP</p>
          </div>
          <div className="text-right">
            <Zap className="ml-auto h-6 w-6 text-amber-500" />
            <p className="text-xs text-muted-foreground mt-1">{nextLevel ? `${xpToNext} XP to ${nextLevel.name}` : "Max level reached"}</p>
          </div>
        </div>
        <div className="mt-3">
          <Progress value={nextLevel ? ((farmer.xp - levelInfo.xpRequired) / (nextLevel.xpRequired - levelInfo.xpRequired)) * 100 : 100} />
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {BADGES.map((b) => {
          const isEarned = earned.has(b.id);
          return (
            <Card key={b.id} className={cnCard(isEarned)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cnIcon(isEarned)}>
                    {isEarned ? <Trophy className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{b.name}</h3>
                      <Badge variant={isEarned ? "success" : "muted"}>{isEarned ? "Earned" : "Locked"}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{b.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Requirement: {b.requirement}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function cnCard(earned: boolean) {
  return earned ? "border-primary/40 bg-sage/30" : "opacity-70";
}
function cnIcon(earned: boolean) {
  return earned
    ? "flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
    : "flex h-10 w-10 items-center justify-center rounded-xl bg-gray-200 text-gray-500";
}