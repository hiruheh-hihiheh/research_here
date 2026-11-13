"use client";

import { useDemo } from "@/features/demo/DemoContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Leaf, Droplets, Sprout, Bug, Wind } from "lucide-react";

export default function ReportsPage() {
  const { farmer, challenges } = useDemo();

  const completedChallenges = challenges.filter((c) => c.status === "completed");

  const categoryData = Object.entries(farmer.sustainabilityProgress).map(([name, value]) => ({ name, value }));

  const weekly = [
    { week: "W1", activities: 2 },
    { week: "W2", activities: 3 },
    { week: "W3", activities: 4 },
    { week: "W4", activities: 5 },
  ];

  const COLORS = ["#2F6B45", "#4F8F63", "#7FB08F", "#A9CCB4", "#DCE9D8"];

  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    "Water conservation": Droplets,
    "Soil health": Sprout,
    "Crop diversity": Leaf,
    "Integrated pest management": Bug,
    "Biodiversity": Wind,
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Sustainability Report</h1>
        <p className="text-sm text-muted-foreground">Illustrative progress · Demo data</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <CardHeader className="p-0 pb-2">
            <CardTitle>Category progress</CardTitle>
            <CardDescription>Illustrative sustainability progress by category</CardDescription>
          </CardHeader>
          <div className="space-y-3">
            {categoryData.map((c) => {
              const Icon = icons[c.name] ?? Leaf;
              return (
                <div key={c.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" /> {c.name}
                    </span>
                    <span className="font-semibold">{c.value}%</span>
                  </div>
                  <Progress value={c.value} className="mt-1" />
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader className="p-0 pb-2">
            <CardTitle>Sustainability score</CardTitle>
            <CardDescription>Aggregated illustrative score</CardDescription>
          </CardHeader>
          <div className="flex items-center justify-center py-4">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-8 border-sage">
              <span className="text-3xl font-bold text-primary">{farmer.sustainabilityScore}</span>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground">Not a scientifically measured environmental impact score.</p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <CardHeader className="p-0 pb-2">
            <CardTitle>Monthly activity</CardTitle>
            <CardDescription>Completed sustainable practices per week</CardDescription>
          </CardHeader>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e9df" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="activities" fill="#2F6B45" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader className="p-0 pb-2">
            <CardTitle>Category distribution</CardTitle>
            <CardDescription>Share of progress across categories</CardDescription>
          </CardHeader>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={70} label>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <CardHeader className="p-0 pb-2">
          <CardTitle>Completed sustainable practices</CardTitle>
        </CardHeader>
        {completedChallenges.length === 0 ? (
          <p className="text-sm text-muted-foreground">No completed challenges yet.</p>
        ) : (
          <ul className="space-y-2">
            {completedChallenges.map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2">
                <span className="text-sm font-medium">{c.title}</span>
                <Badge variant="success">{c.category}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-5">
        <CardHeader className="p-0 pb-2">
          <CardTitle>Learning progress</CardTitle>
        </CardHeader>
        <p className="text-sm text-muted-foreground">{farmer.completedLessons.length} lessons completed</p>
        <Progress value={Math.round((farmer.completedLessons.length / 6) * 100)} className="mt-2" />
      </Card>
    </div>
  );
}