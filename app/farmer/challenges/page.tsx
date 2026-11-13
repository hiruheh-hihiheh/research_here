"use client";

import { useState, useMemo } from "react";
import { useDemo } from "@/features/demo/DemoContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Progress } from "@/components/ui/Progress";
import { Challenge } from "@/features/demo/types";
import Link from "next/link";
import { Target, Search, Clock, Zap, CheckCircle2, PlayCircle, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Water conservation", "Soil health", "Organic farming", "Crop rotation", "Integrated pest management", "Biodiversity", "Energy efficiency"];

const DIFFICULTY_VARIANT: Record<string, "default" | "primary" | "sage" | "amber" | "success" | "muted" | "danger"> = {
  Beginner: "success",
  Intermediate: "amber",
  Advanced: "danger",
};

export default function ChallengesPage() {
  const { challenges, startChallenge } = useDemo();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [tab, setTab] = useState<"available" | "in-progress" | "completed">("available");
  const [selected, setSelected] = useState<Challenge | null>(null);

  const filtered = useMemo(() => {
    return challenges.filter((c) => {
      if (c.status !== tab) return false;
      if (category !== "All" && c.category !== category) return false;
      if (query && !`${c.title} ${c.description} ${c.category}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [challenges, tab, category, query]);

  const statusTabs: { key: typeof tab; label: string }[] = [
    { key: "available", label: "Available" },
    { key: "in-progress", label: "In progress" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Challenges</h1>
        <p className="text-sm text-muted-foreground">Discover sustainable farming challenges for your region.</p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search challenges..." className="pl-9" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                category === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:bg-sage"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {statusTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors",
              tab === t.key ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState title="No challenges found" description="Try adjusting filters or search." icon={Target} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-foreground">{c.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                </div>
                <Badge variant={c.status === "completed" ? "success" : c.status === "in-progress" ? "amber" : "default"}>
                  {c.status}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-sage px-2 py-0.5">{c.category}</span>
                <Badge variant={DIFFICULTY_VARIANT[c.difficulty]}>{c.difficulty}</Badge>
                <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{c.xpReward} XP</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.duration}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setSelected(c)}>View details</Button>
                {c.status === "available" && (
                  <Button size="sm" onClick={() => startChallenge(c.id)}>Start</Button>
                )}
                {c.status === "in-progress" && (
                  <LinkButton href="/farmer/activities" label="Submit activity" />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title}>
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">{selected.category}</Badge>
              <Badge variant={DIFFICULTY_VARIANT[selected.difficulty]}>{selected.difficulty}</Badge>
              <Badge variant="amber">{selected.xpReward} XP</Badge>
              <Badge variant="muted">{selected.duration}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{selected.description}</p>
            {selected.region && <p className="text-xs text-muted-foreground">Region: {selected.region}</p>}
            <div>
              <h4 className="font-semibold">Objectives</h4>
              <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                {selected.objectives.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Instructions</h4>
              <ol className="mt-1 list-decimal pl-5 text-sm text-muted-foreground">
                {selected.instructions.map((o, i) => <li key={i}>{o}</li>)}
              </ol>
            </div>
            <div className="flex gap-2 pt-2">
              {selected.status === "available" && (
                <Button onClick={() => { startChallenge(selected.id); setSelected(null); }}>Start Challenge</Button>
              )}
              {selected.status === "in-progress" && (
                <Link href="/farmer/activities" className="flex-1">
                  <Button fullWidth>Submit Activity</Button>
                </Link>
              )}
              {selected.status === "completed" && (
                <Badge variant="success" className="px-3 py-1.5">Completed</Badge>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// small helper
function LinkButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href}>
      <Button size="sm" variant="secondary">{label}</Button>
    </Link>
  );
}