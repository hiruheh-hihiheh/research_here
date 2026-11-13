"use client";

import { useDemo } from "@/features/demo/DemoContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  Sprout,
  Zap,
  Target,
  BookOpen,
  Bell,
  Droplets,
  Leaf,
  Bug,
  RefreshCw,
  Wind,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { WEEKLY_ACTIVITY } from "@/features/demo/mockData";
import { SectionHeader } from "@/components/ui/SectionHeader";

const SUSTAINABILITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Water conservation": Droplets,
  "Soil health": Sprout,
  "Crop diversity": Leaf,
  "Integrated pest management": Bug,
  "Biodiversity": Wind,
  "Energy efficiency": Zap,
};

export default function FarmerDashboardPage() {
  const { farmer, levelInfo, nextLevel, xpToNext, challenges, submissions, resetDemo } = useDemo();

  const completedCount = farmer.completedChallenges.length;
  const inProgressCount = farmer.inProgressChallenges.length;
  const learningProgress = Math.round((farmer.completedLessons.length / 6) * 100);

  const featured = challenges.find((c) => c.status === "available") ?? challenges[0];

  const recentActivities: { text: string; icon: React.ComponentType<{ className?: string }>; time: string }[] = [];
  submissions.slice(0, 3).forEach((s) => {
    const ch = challenges.find((c) => c.id === s.challengeId);
    recentActivities.push({ text: `Submitted ${ch?.title ?? "activity"} (${s.status})`, icon: Target, time: new Date(s.submittedAt).toLocaleDateString() });
  });
  farmer.completedChallenges.slice(0, 3).forEach((id) => {
    const ch = challenges.find((c) => c.id === id);
    if (ch) recentActivities.push({ text: `Completed ${ch.title}`, icon: Sprout, time: "Recently" });
  });
  farmer.completedLessons.slice(0, 3).forEach((id) => {
    recentActivities.push({ text: `Completed lesson: ${id.replace(/-/g, " ")}`, icon: BookOpen, time: "Recently" });
  });
  if (recentActivities.length === 0) {
    recentActivities.push({ text: "No recent activity yet", icon: BookOpen, time: "Start learning or challenges" });
  }

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar initials={farmer.avatar} size="lg" />
              <div>
                <p className="text-xs text-muted-foreground">Welcome back</p>
                <h1 className="text-xl font-bold text-foreground">{farmer.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {farmer.farmName} · {farmer.location}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="sage">{farmer.season}</Badge>
              <button className="rounded-full p-2 hover:bg-sage" aria-label="Notifications">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Sustainability score" value={`${farmer.sustainabilityScore}/100`} hint="Illustrative gamification score" icon={Sprout} accent="bg-sage text-primary" />
        <StatCard label="Total XP" value={farmer.xp} hint="Earned through learning & activities" icon={Zap} accent="bg-amber-100 text-amber-700" />
        <StatCard label="Completed challenges" value={completedCount} hint={`${inProgressCount} in progress`} icon={Target} accent="bg-blue-100 text-blue-700" />
        <StatCard label="Learning progress" value={`${learningProgress}%`} hint={`${farmer.completedLessons.length} lessons done`} icon={BookOpen} accent="bg-purple-100 text-purple-700" />
      </div>

      {/* Level progression */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Level progression</p>
            <h2 className="text-lg font-semibold">{levelInfo.name}</h2>
            <p className="text-sm text-muted-foreground">Level {levelInfo.level} · {farmer.xp} XP</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Next level</p>
            <p className="font-semibold">{nextLevel ? nextLevel.name : "Max"}</p>
            {nextLevel && <p className="text-xs text-muted-foreground">{xpToNext} XP to go</p>}
          </div>
        </div>
        <div className="mt-3">
          <Progress value={nextLevel ? ((farmer.xp - levelInfo.xpRequired) / (nextLevel.xpRequired - levelInfo.xpRequired)) * 100 : 100} />
        </div>
      </Card>

      {/* Featured challenge + weekly chart */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-primary to-primary-dark p-5 text-white">
            <Badge variant="amber" className="bg-white/20 text-white">Featured challenge</Badge>
            <h3 className="mt-2 text-xl font-bold">{featured?.title}</h3>
            <p className="text-sm text-white/80">{featured?.category} · {featured?.difficulty}</p>
          </div>
          <CardContent>
            <p className="text-sm text-muted-foreground">{featured?.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-primary">+{featured?.xpReward} XP</span>
              <Link href="/farmer/challenges">
                <Button size="sm">Start Challenge</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="p-5">
          <CardHeader className="p-0 pb-2">
            <CardTitle>Weekly activity</CardTitle>
            <CardDescription>Illustrative farming activity over 7 days</CardDescription>
          </CardHeader>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_ACTIVITY}>
                <defs>
                  <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2F6B45" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2F6B45" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e9df" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="activities" stroke="#2F6B45" fill="url(#colorAct)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Sustainability categories */}
      <Card className="p-5">
        <SectionHeader title="Sustainability progress" description="Illustrative category progress" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(farmer.sustainabilityProgress).map(([cat, val]) => {
            const Icon = SUSTAINABILITY_ICONS[cat] ?? Sprout;
            return (
              <div key={cat} className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{cat}</span>
                  </div>
                  <span className="text-sm font-semibold">{val}%</span>
                </div>
                <div className="mt-2">
                  <Progress value={val} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Demo controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Demo controls</p>
            <p className="text-xs text-muted-foreground">Reset all demo data to initial state.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { if (confirm("Reset demo data?")) resetDemo(); }}>Reset Demo Data</Button>
        </div>
      </Card>

      {/* Recent activities */}
      <Card className="p-5">
        <SectionHeader title="Recent activities" />
        <ul className="space-y-3">
          {recentActivities.map((a, i) => {
            const Icon = a.icon;
            return (
              <li key={i} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

