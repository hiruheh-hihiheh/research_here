"use client";

import { useState, useRef } from "react";
import { useDemo } from "@/features/demo/DemoContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { UploadCloud, Image as ImageIcon, CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ActivitiesPage() {
  const { challenges, submissions, submitActivity } = useDemo();
  const [challengeId, setChallengeId] = useState(challenges[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setImageDataUrl(url);
      setPreview(url);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    submitActivity({ challengeId, description, imageDataUrl });
    setDescription("");
    setImageDataUrl(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const statusBadge = (s: string) => {
    if (s === "approved") return <Badge variant="success">Approved</Badge>;
    if (s === "rejected") return <Badge variant="danger">Rejected</Badge>;
    return <Badge variant="amber">Pending</Badge>;
  };

  const statusIcon = (s: string) => {
    if (s === "approved") return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (s === "rejected") return <XCircle className="h-4 w-4 text-red-600" />;
    return <Clock className="h-4 w-4 text-amber-600" />;
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Activity Submission</h1>
        <p className="text-sm text-muted-foreground">Submit farming activity evidence for expert review.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit new activity</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Challenge</label>
              <Select value={challengeId} onChange={(e) => setChallengeId(e.target.value)}>
                {challenges.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what you did on your farm..." required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Photo evidence</label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
                <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
                  <UploadCloud className="h-4 w-4" /> Choose image
                </Button>
                {preview && (
                  <button type="button" onClick={() => { setPreview(null); setImageDataUrl(null); if (fileRef.current) fileRef.current.value = ""; }} className="text-xs text-muted-foreground hover:text-danger">
                    Remove
                  </button>
                )}
              </div>
              {preview && (
                <div className="mt-3 overflow-hidden rounded-xl border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Preview" className="max-h-60 w-full object-cover" />
                </div>
              )}
              {!preview && (
                <div className="mt-3 flex h-32 items-center justify-center rounded-xl border border-dashed border-border bg-background text-muted-foreground">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-8 w-8" />
                    <p className="text-xs">No image selected (demo preview only)</p>
                  </div>
                </div>
              )}
            </div>
            <Button type="submit" fullWidth disabled={!description.trim()}>Submit activity</Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Your submissions</h2>
        {submissions.length === 0 ? (
          <EmptyState title="No submissions yet" description="Submit your first farming activity." icon={UploadCloud} />
        ) : (
          <div className="space-y-3">
            {submissions.map((s) => {
              const ch = challenges.find((c) => c.id === s.challengeId);
              return (
                <Card key={s.id} className="p-4">
                  <div className="flex items-start gap-3">
                    {s.imageDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.imageDataUrl} alt="evidence" className="h-16 w-16 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-sage text-muted-foreground">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{ch?.title ?? s.challengeId}</p>
                        {statusBadge(s.status)}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{s.description}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{new Date(s.submittedAt).toLocaleString()}</p>
                      {s.reviewNote && <p className="mt-1 text-xs text-primary">{s.reviewNote}</p>}
                    </div>
                    <div>{statusIcon(s.status)}</div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}