"use client";

import { useState } from "react";
import { useDemo } from "@/features/demo/DemoContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LESSONS } from "@/features/demo/mockData";
import { BookOpen, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const PASS_THRESHOLD = 0.6;

export default function LearningPage() {
  const { farmer, completeLesson } = useDemo();
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, Record<string, number>>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [scores, setScores] = useState<Record<string, number>>({});
  const [xpNotice, setXpNotice] = useState<string | null>(null);

  const lesson = LESSONS.find((l) => l.id === openLesson);

  const lessonAnswers = openLesson ? answers[openLesson] ?? {} : {};

  const handleSelect = (qid: string, idx: number) => {
    if (!openLesson || submitted[openLesson]) return;
    setAnswers((a) => ({
      ...a,
      [openLesson]: { ...(a[openLesson] ?? {}), [qid]: idx },
    }));
  };

  const handleSubmitQuiz = () => {
    if (!lesson) return;
    const qs = lesson.quiz;
    let score = 0;
    qs.forEach((q) => {
      if (lessonAnswers[q.id] === q.correctIndex) score++;
    });
    const passed = score / qs.length >= PASS_THRESHOLD;
    setScores((s) => ({ ...s, [lesson.id]: score }));
    setSubmitted((s) => ({ ...s, [lesson.id]: true }));
    if (passed) {
      const result = completeLesson(lesson.id, lesson.xpReward);
      if (result.awarded) {
        setXpNotice(`+${lesson.xpReward} XP earned!`);
      } else {
        setXpNotice("Lesson already completed — no duplicate XP.");
      }
      setTimeout(() => setXpNotice(null), 3000);
    } else {
      setXpNotice(`Score ${score}/${qs.length}. Need at least ${Math.ceil(qs.length * PASS_THRESHOLD)} correct. Try again.`);
      setTimeout(() => setXpNotice(null), 4000);
    }
  };

  const handleRetry = () => {
    if (!lesson) return;
    setAnswers((a) => ({ ...a, [lesson.id]: {} }));
    setSubmitted((s) => ({ ...s, [lesson.id]: false }));
    setScores((s) => {
      const next = { ...s };
      delete next[lesson.id];
      return next;
    });
  };

  const open = (id: string) => {
    setOpenLesson(id);
    if (!answers[id]) setAnswers((a) => ({ ...a, [id]: {} }));
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
                    <Button size="sm" onClick={() => open(l.id)}>
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
                <p className={cn("text-sm font-medium", (scores[lesson.id] / lesson.quiz.length) >= PASS_THRESHOLD ? "text-primary" : "text-danger")}>
                  Score: {scores[lesson.id]}/{lesson.quiz.length} · {(scores[lesson.id] / lesson.quiz.length) >= PASS_THRESHOLD ? "Passed" : "Not passed"}
                </p>
              )}
              <div className="mt-2 space-y-3">
                {lesson.quiz.map((q, qi) => (
                  <div key={q.id} className="rounded-xl border border-border p-3">
                    <p className="text-sm font-medium">{qi + 1}. {q.question}</p>
                    <div className="mt-2 space-y-1.5">
                      {q.options.map((opt, idx) => {
                        const selected = lessonAnswers[q.id] === idx;
                        const isCorrect = submitted[lesson.id] && idx === q.correctIndex;
                        const isWrong = submitted[lesson.id] && selected && idx !== q.correctIndex;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelect(q.id, idx)}
                            disabled={submitted[lesson.id]}
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
              {!submitted[lesson.id] ? (
                <Button
                  className="mt-3"
                  onClick={handleSubmitQuiz}
                  disabled={lesson.quiz.some((q) => lessonAnswers[q.id] === undefined)}
                >
                  Submit quiz
                </Button>
              ) : (
                (scores[lesson.id] / lesson.quiz.length) < PASS_THRESHOLD && (
                  <Button className="mt-3" variant="secondary" onClick={handleRetry}>
                    Retry quiz
                  </Button>
                )
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}