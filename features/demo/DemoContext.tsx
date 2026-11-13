"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type {
  Challenge,
  ChallengeStatus,
  DemoRole,
  DemoState,
  FarmerProfile,
  Submission,
  SustainabilityCategory,
} from "./types";
import {
  BADGES,
  INITIAL_DEMO_STATE,
  INITIAL_CHALLENGES,
  STORAGE_KEY,
  OLD_STORAGE_KEY,
  levelForXp,
  nextLevelForXp,
} from "./mockData";
import { loadState, saveState } from "@/lib/storage";

interface DemoContextValue {
  ready: boolean;
  state: DemoState;
  role: DemoRole;
  setRole: (role: DemoRole) => void;
  resetDemo: () => void;
  farmer: FarmerProfile;
  challenges: Challenge[];
  submissions: Submission[];
  // farmer actions
  startChallenge: (id: string) => void;
  submitActivity: (payload: { challengeId: string; description: string; imageDataUrl: string | null }) => Submission;
  completeLesson: (lessonId: string, xpReward: number) => { awarded: boolean; xp: number };
  // admin actions
  reviewSubmission: (id: string, approved: boolean, note?: string) => void;
  addChallenge: (challenge: Omit<Challenge, "id" | "status"> & { status?: ChallengeStatus }) => Challenge;
  updateChallenge: (id: string, patch: Partial<Challenge>) => void;
  deleteChallenge: (id: string) => void;
  // derived
  levelInfo: ReturnType<typeof levelForXp>;
  nextLevel: ReturnType<typeof nextLevelForXp>;
  xpToNext: number;
  badges: typeof BADGES;
  earnedBadges: string[];
}

const DemoContext = createContext<DemoContextValue | null>(null);

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function seed(): DemoState {
  return clone(INITIAL_DEMO_STATE);
}

function unlockBadges(state: DemoState): string[] {
  const f = state.farmer;
  const badges = new Set<string>();
  const completedChallenges = f.completedChallenges
    .map((id) => state.challenges.find((c) => c.id === id) ?? INITIAL_CHALLENGES.find((c) => c.id === id))
    .filter((c): c is Challenge => Boolean(c));
  const waterDone = completedChallenges.some((c) => c.category === "Water conservation");
  const soilDone = completedChallenges.some((c) => c.category === "Soil health");
  const organicDone = completedChallenges.some((c) => c.category === "Organic farming");
  const bioDone = completedChallenges.some((c) => c.category === "Biodiversity");
  const cropDone = completedChallenges.some((c) => c.category === "Crop rotation");
  if (waterDone) badges.add("water-guardian");
  if (soilDone) badges.add("soil-guardian");
  if (organicDone) badges.add("organic-pioneer");
  if (bioDone) badges.add("biodiversity-protector");
  if (cropDone) badges.add("crop-rotator");
  const lvl = levelForXp(f.xp);
  if (lvl.level >= 5) badges.add("green-champion");
  if (state.completedLessons.length >= 3) badges.add("learning-master");
  if (f.completedChallenges.length >= 5) badges.add("sustainability-champion");
  return Array.from(badges);
}

const SUSTAINABILITY_CATEGORIES: SustainabilityCategory[] = [
  "Water conservation",
  "Soil health",
  "Crop diversity",
  "Integrated pest management",
  "Biodiversity",
  "Energy efficiency",
];

function normalizeNumber(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeState(loaded: unknown): DemoState {
  const seed = clone(INITIAL_DEMO_STATE);
  const next: DemoState = clone(seed);
  if (loaded && typeof loaded === "object") {
    const data = loaded as Record<string, unknown>;
    next.role = data.role === "admin" ? "admin" : "farmer";
    if (data.farmer && typeof data.farmer === "object") {
      next.farmer = { ...seed.farmer, ...(data.farmer as Record<string, unknown>) } as FarmerProfile;
    }
    if (Array.isArray(data.challenges)) next.challenges = data.challenges as Challenge[];
    if (Array.isArray(data.submissions)) next.submissions = data.submissions as Submission[];
    if (Array.isArray(data.completedLessons)) next.completedLessons = data.completedLessons as string[];
    if (Array.isArray(data.lessonXpAwarded)) next.lessonXpAwarded = data.lessonXpAwarded as string[];
  }

  // XP/level consistency
  next.farmer.xp = normalizeNumber(next.farmer.xp, seed.farmer.xp);
  next.farmer.level = levelForXp(next.farmer.xp).level;

  // sustainability progress completeness
  const sp = (next.farmer.sustainabilityProgress ?? {}) as Record<string, unknown>;
  const normalized: FarmerProfile["sustainabilityProgress"] = { ...seed.farmer.sustainabilityProgress };
  SUSTAINABILITY_CATEGORIES.forEach((cat) => {
    normalized[cat] = normalizeNumber(sp[cat], seed.farmer.sustainabilityProgress[cat] ?? 0);
  });
  next.farmer.sustainabilityProgress = normalized;
  next.farmer.sustainabilityScore = Math.round(
    Object.values(normalized).reduce((a, b) => a + b, 0) / Object.values(normalized).length
  );

  // reconcile lessons
  const lessons = new Set([...next.completedLessons, ...next.lessonXpAwarded]);
  next.completedLessons = Array.from(lessons);
  next.lessonXpAwarded = Array.from(lessons);
  next.farmer.completedLessons = Array.from(lessons);

  // reconcile completed challenges with challenge statuses
  const completedIds = new Set(next.farmer.completedChallenges);
  next.challenges.forEach((ch) => {
    if (ch.status === "completed") completedIds.add(ch.id);
  });
  completedIds.forEach((id) => {
    const ch = next.challenges.find((c) => c.id === id);
    if (ch) ch.status = "completed";
  });
  next.farmer.completedChallenges = Array.from(completedIds);
  next.farmer.inProgressChallenges = next.farmer.inProgressChallenges.filter((id) => !completedIds.has(id));

  return next;
}

function migrateOldState(old: unknown): DemoState {
  return normalizeState(old);
}

function applyUnlock(state: DemoState): DemoState {
  const next = clone(state);
  next.farmer.badges = unlockBadges(next);
  // sync sustainability score (illustrative) bump on completed challenges
  next.farmer.level = levelForXp(next.farmer.xp).level;
  return next;
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(seed);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      let loaded = loadState<DemoState>(STORAGE_KEY);
      if (!loaded) {
        const old = loadState<unknown>(OLD_STORAGE_KEY);
        if (old) {
          loaded = migrateOldState(old);
        }
      }
      if (loaded) {
        setState(() => applyUnlock(normalizeState(loaded)));
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) saveState(STORAGE_KEY, state);
  }, [state, ready]);

  const setRole = useCallback((role: DemoRole) => {
    setState((s) => ({ ...s, role }));
  }, []);

  const resetDemo = useCallback(() => {
    const fresh = seed();
    setState(fresh);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(OLD_STORAGE_KEY);
      } catch {}
    }
  }, []);

  const startChallenge = useCallback((id: string) => {
    setState((s) => {
      const next = clone(s);
      const ch = next.challenges.find((c) => c.id === id);
      if (ch && ch.status === "available") {
        ch.status = "in-progress";
        if (!next.farmer.inProgressChallenges.includes(id)) next.farmer.inProgressChallenges.push(id);
      }
      return applyUnlock(next);
    });
  }, []);

  const submitActivity = useCallback((payload: { challengeId: string; description: string; imageDataUrl: string | null }) => {
    const ch = state.challenges.find((c) => c.id === payload.challengeId);
    const submission: Submission = {
      id: `sub-${Date.now()}`,
      farmerId: "farmer-demo-1",
      challengeId: payload.challengeId,
      challengeTitle: ch?.title,
      description: payload.description,
      imageDataUrl: payload.imageDataUrl,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    setState((s) => {
      const next = clone(s);
      next.submissions = [submission, ...next.submissions];
      return applyUnlock(next);
    });
    return submission;
  }, [state.challenges]);

  const completeLesson = useCallback((lessonId: string, xpReward: number) => {
    const alreadyAwarded = state.lessonXpAwarded.includes(lessonId);
    setState((s) => {
      const next = clone(s);
      if (!next.completedLessons.includes(lessonId)) next.completedLessons.push(lessonId);
      if (!next.farmer.completedLessons.includes(lessonId)) next.farmer.completedLessons.push(lessonId);
      if (next.lessonXpAwarded.includes(lessonId)) {
        return next;
      }
      next.lessonXpAwarded.push(lessonId);
      next.farmer.xp += xpReward;
      return applyUnlock(next);
    });
    return { awarded: !alreadyAwarded, xp: xpReward };
  }, [state.lessonXpAwarded]);

  const reviewSubmission = useCallback((id: string, approved: boolean, note?: string) => {
    setState((s) => {
      const next = clone(s);
      const sub = next.submissions.find((x) => x.id === id);
      if (!sub || sub.status !== "pending") return s;
      sub.status = approved ? "approved" : "rejected";
      sub.reviewedAt = new Date().toISOString();
      sub.reviewNote = note ?? (approved ? "Approved by agricultural expert (demo)." : "Rejected: evidence insufficient (demo).");
      if (approved) {
        const ch = next.challenges.find((c) => c.id === sub.challengeId);
        if (ch) {
          const alreadyCompleted = next.farmer.completedChallenges.includes(ch.id);
          ch.status = "completed";
          if (!alreadyCompleted) {
            next.farmer.completedChallenges.push(ch.id);
            next.farmer.xp += ch.xpReward;
            const catMap: Record<string, keyof FarmerProfile["sustainabilityProgress"]> = {
              "Water conservation": "Water conservation",
              "Soil health": "Soil health",
              "Organic farming": "Soil health",
              "Crop rotation": "Crop diversity",
              "Integrated pest management": "Integrated pest management",
              "Biodiversity": "Biodiversity",
              "Energy efficiency": "Energy efficiency",
            };
            const key = catMap[ch.category];
            if (key) {
              next.farmer.sustainabilityProgress[key] = Math.min(100, next.farmer.sustainabilityProgress[key] + 8);
            }
            const vals = Object.values(next.farmer.sustainabilityProgress);
            next.farmer.sustainabilityScore = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
          }
          next.farmer.inProgressChallenges = next.farmer.inProgressChallenges.filter((x) => x !== ch.id);
        }
      }
      return applyUnlock(next);
    });
  }, []);

  const addChallenge = useCallback((challenge: Omit<Challenge, "id" | "status"> & { status?: ChallengeStatus }) => {
    const newCh: Challenge = {
      ...challenge,
      id: `ch-${Date.now()}`,
      status: challenge.status ?? "available",
    };
    setState((s) => {
      const next = clone(s);
      next.challenges = [newCh, ...next.challenges];
      return next;
    });
    return newCh;
  }, []);

  const updateChallenge = useCallback((id: string, patch: Partial<Challenge>) => {
    setState((s) => {
      const next = clone(s);
      const ch = next.challenges.find((c) => c.id === id);
      if (ch) Object.assign(ch, patch);
      return next;
    });
  }, []);

  const deleteChallenge = useCallback((id: string) => {
    setState((s) => {
      const next = clone(s);
      next.challenges = next.challenges.filter((c) => c.id !== id);
      return next;
    });
  }, []);

  const value = useMemo<DemoContextValue>(() => {
    const levelInfo = levelForXp(state.farmer.xp);
    const nextLevel = nextLevelForXp(state.farmer.xp);
    const xpToNext = nextLevel ? nextLevel.xpRequired - state.farmer.xp : 0;
    return {
      ready,
      state,
      role: state.role,
      setRole,
      resetDemo,
      farmer: state.farmer,
      challenges: state.challenges,
      submissions: state.submissions,
      startChallenge,
      submitActivity,
      completeLesson,
      reviewSubmission,
      addChallenge,
      updateChallenge,
      deleteChallenge,
      levelInfo,
      nextLevel,
      xpToNext,
      badges: BADGES,
      earnedBadges: state.farmer.badges,
    };
  }, [ready, state, setRole, resetDemo, startChallenge, submitActivity, completeLesson, reviewSubmission, addChallenge, updateChallenge, deleteChallenge]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}