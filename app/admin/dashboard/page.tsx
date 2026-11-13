"use client";

import { useDemo } from "@/features/demo/DemoContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  Users,
  Target,
  Inbox,
  CheckCircle2,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function AdminDashboardPage() {
  const { submissions, challenges, farmer, resetDemo } = useDemo();

  const totalFarmers = 128; // demo
  const activeChallenges = challenges.length;
  const pending = submissions.filter((s) => s.status === "pending").length;
  const approved = submissions.filter((s) => s.status === "approved").length;

  const participation = [
    { month: "Jan", farmers: 40 },
    { month: "Feb", farmers: 55 },
    { month: "Mar", farmers: 72 },
    { month: "Apr", farmers: 90 },
    { month: "May", farmers: 110 },
    { month: "Jun", farmers: 128 },
  ];

  const completion = [
    { category: "Water", completed: 34 },
    { category: "Soil", completed: 28 },
    { category: "Organic", completed: 22 },
    { category: "Crop", completed: 18 },
    { category: "IPM", completed: 15 },
    { category: "Bio", completed: 20 },
  ];

  const popular = [
    { name: "Water conservation", value: 42 },
    { name: "Soil health", value: 31 },
    { name: "Organic farming", value: 24 },
    { name: "Biodiversity", value: 19 },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Demo management console · Simulated data</p>
        </div>
        <Link href="/admin/submissions">
          <Button size="sm">Review submissions</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total demo farmers" value={totalFarmers} hint="Simulated" icon={Users} accent="bg-blue-100 text-blue-700" />
        <StatCard label="Active challenges" value={activeChallenges} hint="In catalogue" icon={Target} accent="bg-sage text-primary" />
        <StatCard label="Pending submissions" value={pending} hint="Awaiting review" icon={Inbox} accent="bg-amber-100 text-amber-700" />
        <StatCard label="Approved activities" value={approved + 47} hint="Demo total" icon={CheckCircle2} accent="bg-green-100 text-green-700" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <CardHeader className="p-0 pb-2">
            <CardTitle>Farmer participation</CardTitle>
            <CardDescription>Simulated monthly growth</CardDescription>
          </CardHeader>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={participation}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e9df" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="farmers" stroke="#2F6B45" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader className="p-0 pb-2">
            <CardTitle>Challenge completions</CardTitle>
            <CardDescription>By category (demo)</CardDescription>
          </CardHeader>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completion}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e9df" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="completed" fill="#2F6B45" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <CardHeader className="p-0 pb-2">
            <CardTitle>Most popular categories</CardTitle>
          </CardHeader>
          <ul className="space-y-2">
            {popular.map((p) => (
              <li key={p.name} className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2">
                <span className="text-sm font-medium">{p.name}</span>
                <Badge variant="default">{p.value} activities</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <CardHeader className="p-0 pb-2">
            <CardTitle>Recent submissions</CardTitle>
          </CardHeader>
          {submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No submissions yet.</p>
          ) : (
            <ul className="space-y-2">
              {submissions.slice(0, 5).map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.description.slice(0, 40)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(s.submittedAt).toLocaleString()}</p>
                  </div>
                  <Badge variant={s.status === "approved" ? "success" : s.status === "rejected" ? "danger" : "amber"}>
                    {s.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3">
            <Link href="/admin/submissions">
              <Button variant="outline" size="sm" fullWidth>View all submissions</Button>
            </Link>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Demo controls</p>
            <p className="text-xs text-muted-foreground">Reset all demo data to initial state.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { if (confirm("Reset demo data?")) resetDemo(); }}>Reset Demo Data</Button>
        </div>
      </Card>
    </div>
  );
}