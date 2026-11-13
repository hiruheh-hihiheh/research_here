"use client";

import { useState } from "react";
import { useDemo } from "@/features/demo/DemoContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Textarea } from "@/components/ui/Input";
import { Inbox, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminSubmissionsPage() {
  const { submissions, challenges, reviewSubmission } = useDemo();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const selected = submissions.find((s) => s.id === selectedId) ?? null;
  const ch = selected ? challenges.find((c) => c.id === selected.challengeId) : null;

  const handleReview = (approved: boolean) => {
    if (!selected) return;
    reviewSubmission(selected.id, approved, note.trim() || undefined);
    setNote("");
    setSelectedId(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Submission Review</h1>
        <p className="text-sm text-muted-foreground">Review farmer activity submissions.</p>
      </div>

      {submissions.length === 0 ? (
        <EmptyState title="No submissions" description="Farmer submissions will appear here." icon={Inbox} />
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => {
            const c = challenges.find((x) => x.id === s.challengeId);
            return (
              <Card key={s.id} className="p-4">
                <div className="flex items-start gap-3">
                  {s.imageDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.imageDataUrl} alt="evidence" className="h-16 w-16 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-sage text-muted-foreground">
                      <Inbox className="h-6 w-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{s.challengeTitle ?? c?.title ?? s.challengeId}</p>
                      <Badge variant={s.status === "approved" ? "success" : s.status === "rejected" ? "danger" : "amber"}>
                        {s.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{s.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(s.submittedAt).toLocaleString()}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setSelectedId(s.id)}>Review</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelectedId(null)} title="Submission details">
        {selected && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">{ch?.title}</p>
              <p className="text-xs text-muted-foreground">{ch?.category} · {ch?.difficulty}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Farmer description</p>
              <p className="text-sm text-muted-foreground">{selected.description}</p>
            </div>
            {selected.imageDataUrl && (
              <div className="overflow-hidden rounded-xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selected.imageDataUrl} alt="evidence" className="max-h-72 w-full object-cover" />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium">Review note (optional)</label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note..." />
            </div>
            {selected.status === "pending" ? (
              <div className="flex gap-2">
                <Button onClick={() => handleReview(true)} className="flex-1">
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </Button>
                <Button variant="danger" onClick={() => handleReview(false)} className="flex-1">
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
              </div>
            ) : (
              <div className="rounded-xl bg-sage/40 p-3 text-sm">
                Status: <span className="font-semibold">{selected.status}</span>
                {selected.reviewNote && <p className="mt-1 text-muted-foreground">{selected.reviewNote}</p>}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}