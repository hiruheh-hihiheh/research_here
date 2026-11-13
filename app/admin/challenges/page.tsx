"use client";

import { useState } from "react";
import { useDemo } from "@/features/demo/DemoContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Plus, Pencil, Trash2, Target } from "lucide-react";
import { Challenge, ChallengeCategory, ChallengeDifficulty } from "@/features/demo/types";
import { cn } from "@/lib/utils";

const CATEGORIES: ChallengeCategory[] = ["Water conservation", "Soil health", "Organic farming", "Crop rotation", "Integrated pest management", "Biodiversity", "Energy efficiency"];

export default function AdminChallengesPage() {
  const { challenges, addChallenge, updateChallenge, deleteChallenge } = useDemo();
  const [editing, setEditing] = useState<Challenge | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Water conservation" as ChallengeCategory,
    difficulty: "Beginner" as ChallengeDifficulty,
    xpReward: 100,
    duration: "1 week",
    objectives: "",
    instructions: "",
    status: "available" as Challenge["status"],
  });

  const openCreate = () => {
    setForm({ title: "", description: "", category: "Water conservation", difficulty: "Beginner", xpReward: 100, duration: "1 week", objectives: "", instructions: "", status: "available" });
    setCreating(true);
  };

  const openEdit = (c: Challenge) => {
    setForm({
      title: c.title,
      description: c.description,
      category: c.category,
      difficulty: c.difficulty,
      xpReward: c.xpReward,
      duration: c.duration,
      objectives: c.objectives.join("\n"),
      instructions: c.instructions.join("\n"),
      status: c.status,
    });
    setEditing(c);
  };

  const handleSave = () => {
    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      difficulty: form.difficulty,
      xpReward: Number(form.xpReward),
      duration: form.duration,
      objectives: form.objectives.split("\n").filter(Boolean),
      instructions: form.instructions.split("\n").filter(Boolean),
      region: "All regions",
    };
    if (editing) {
      updateChallenge(editing.id, { ...payload, status: form.status });
      setEditing(null);
    } else {
      addChallenge({ ...payload, status: form.status });
      setCreating(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this demo challenge?")) deleteChallenge(id);
  };

  const modalOpen = creating || !!editing;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Challenge Management</h1>
          <p className="text-sm text-muted-foreground">Manage the demo challenge catalogue.</p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4" /> Add challenge
        </Button>
      </div>

      {challenges.length === 0 ? (
        <EmptyState title="No challenges" description="Add a demo challenge to get started." icon={Target} />
      ) : (
        <div className="space-y-3">
          {challenges.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{c.title}</p>
                    <Badge variant={c.status === "completed" ? "success" : c.status === "in-progress" ? "amber" : "default"}>{c.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-sage px-2 py-0.5">{c.category}</span>
                    <span>{c.difficulty}</span>
                    <span>{c.xpReward} XP</span>
                    <span>{c.duration}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <select
                    value={c.status === "archived" ? "archived" : "available"}
                    onChange={(e) => updateChallenge(c.id, { status: e.target.value as Challenge["status"] })}
                    className="h-9 rounded-lg border border-border bg-card px-2 text-xs"
                  >
                    <option value="available">available</option>
                    <option value="archived">archived</option>
                  </select>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setCreating(false); setEditing(null); }} title={editing ? "Edit challenge" : "Add challenge"}>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Category</label>
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ChallengeCategory })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Difficulty</label>
              <Select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as ChallengeDifficulty })}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">XP reward</label>
              <Input type="number" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: Number(e.target.value) })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Duration</label>
              <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Objectives (one per line)</label>
            <Textarea value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Instructions (one per line)</label>
            <Textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <Select value={form.status === "archived" ? "archived" : "available"} onChange={(e) => setForm({ ...form, status: e.target.value as Challenge["status"] })}>
              <option value="available">available</option>
              <option value="archived">archived</option>
            </Select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} fullWidth disabled={!form.title.trim()}>
              {editing ? "Save changes" : "Create challenge"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}