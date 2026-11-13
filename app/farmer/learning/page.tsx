"use client";

import { useState } from "react";
import { useDemo } from "@/features/demo/DemoContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Progress } from "@/components/ui/Progress";
import { LESSONS } from "@/features/demo/mockData";
import { BookOpen, Clock, CheckCircle2, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LearningPage() {
  const { farmer, completeLesson } = useDemo();
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [scores, setScores] = useState<Record<string, number>>({});
  const [xpNotice, setXpNotice] = useState<string | null>(null);

  const lesson = LESSONS.find((l) => l.id === openLesson);

  const handleSelect = (qid: string, idx: number) => {
    if (submitted[openLesson!]) return;
    setAnswers((a) => ({ ...a, [qid]: idx }));
  };

  const handleSubmitQuiz = () => {
    if (!lesson) return;
    const qs = lesson.quiz;
    let score = 0;
    qs.forEach((q) => {
      if (answers[q.id] === q.correctIndex) score++;
    });
    setScores((s) => ({ ...s, [lesson.id]: score }));
    setSubmitted((s) => ({ ...s, [lesson.id]: true }));
    const result = completeLesson(lesson.id, lesson.xpReward);
    if (result.awarded) {
      setXpNotice(`+${lesson.xpReward} XP earned!`);
      setTimeout(() => setXpNotice(null), 3000);
    } else {
      setXpNotice("Lesson already completed — no duplicate XP.");
      setTimeout(() => setXpNotice(null), 3000);
    }
  };

  const resetQuiz = (id: string) => {
    // keep submitted state; allow re-open? no reset answers for completed
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Learning Centre</h1>
        <p className="text-sm text-muted-foreground">Interactive lessons on sustainable farming.</p>
      </div>

      {xpNotice && (
        <div className="rounded-xl bg-sage px-4 py-2 text-sm font-medium text-primary-dark">{xpNotice}</div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {LESSONS.map((l) => {
          const done = farmer.completedLessons.includes(l.id);
          return (
            <Card key={l.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage text-2xl">
                  {l.cover}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{l.title}</h3>
                    {done && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{l.category} · {l.readingTime}</p>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{l.objectives.join("; ")}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant="default">{l.xpReward} XP</Badge>
                    <Button size="sm" onClick={() => setOpenLesson(l.id)}>
                      {done ? "Review" : "Start lesson"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={!!lesson} onClose={() => setOpenLesson(null)} title={lesson?.title}>
        {lesson && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> {lesson.readingTime} · {lesson.category}
            </div>
            <div>
              <h4 className="font-semibold">Learning objectives</h4>
              <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                {lesson.objectives.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            </div>
            {lesson.sections.map((s, i) => (
              <div key={i}>
                <h4 className="font-semibold">{s.heading}</h4>
                <p className="text-sm text-muted-foreground">{s.body}</p>
                {s.example && <p className="mt-1 rounded-lg bg-sage/50 p-2 text-xs text-primary-dark">Example: {s.example}</p>}
              </div>
            ))}

            <div className="border-t border-border pt-3">
              <h4 className="font-semibold">Quiz</h4>
              {submitted[lesson.id] && (
                <p className="text-sm text-primary font-medium">
                  Score: {scores[lesson.id]}/{lesson.quiz.length} · {scores[lesson.id] === lesson.quiz.length ? "Excellent!" : "Keep learning"}
                </p>
              )}
              <div className="mt-2 space-y-3">
                {lesson.quiz.map((q, qi) => (
                  <div key={q.id} className="rounded-xl border border-border p-3">
                    <p className="text-sm font-medium">{qi + 1}. {q.question}</p>
                    <div className="mt-2 space-y-1.5">
                      {q.options.map((opt, idx) => {
                        const selected = answers[q.id] === idx;
                        const isCorrect = submitted[lesson.id] && idx === q.correctIndex;
                        const isWrong = submitted[lesson.id] && selected && idx !== q.correctIndex;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelect(q.id, idx)}
                            className={cn(
                              "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                              selected && !submitted[lesson.id] ? "border-primary bg-sage" : "border-border bg-card",
                              isCorrect ? "border-green-500 bg-green-50" : "",
                              isWrong ? "border-red-500 bg-red-50" : ""
                            )}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {submitted[lesson.id] && (
                      <p className="mt-2 text-xs text-muted-foreground">{q.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
              {!submitted[lesson.id] && (
                <Button className="mt-3" onClick={handleSubmitQuiz} disabled={lesson.quiz.some((q) => answers[q.id] === undefined)}>
                  Submit quiz
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}