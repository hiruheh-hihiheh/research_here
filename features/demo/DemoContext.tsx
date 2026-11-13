"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type {
  Challenge,
  DemoRole,
  DemoState,
} from "./types";
import type { SubmitActivityResult } from "./logic";
import {
  BADGES,
  INITIAL_DEMO_STATE,
  STORAGE_KEY,
  OLD_STORAGE_KEY,
  levelForXp,
  nextLevelForXp,
} from "./mockData";
import {
  addChallengeState,
  clone,
  completeLessonState,
  deleteChallengeState,
  normalizeState,
  reviewSubmissionState,
  setRoleState,
  startChallengeState,
  submitActivityState,
  updateChallengeState,
} from "./logic";
import { loadState, saveState } from "@/lib/storage";

interface DemoContextValue {
  ready: boolean;
  state: DemoState;
  role: DemoRole;
  setRole: (role: DemoRole) => void;
  resetDemo: () => void;
  farmer: DemoState["farmer"];
  challenges: DemoState["challenges"];
  submissions: DemoState["submissions"];
  startChallenge: (id: string) => void;
  submitActivity: (payload: { challengeId: string; description: string; imageDataUrl: string | null }) => SubmitActivityResult;
  completeLesson: (lessonId: string, xpReward: number) => { awarded: boolean; xp: number };
  reviewSubmission: (id: string, approved: boolean, note?: string) => void;
  addChallenge: (challenge: Omit<Challenge, "id" | "status"> & { status?: Challenge["status"] }) => Challenge;
  updateChallenge: (id: string, patch: Partial<Challenge>) => void;
  deleteChallenge: (id: string) => { deleted: boolean; reason?: string };
  levelInfo: ReturnType<typeof import("./mockData").levelForXp>;
  nextLevel: ReturnType<typeof import("./mockData").nextLevelForXp>;
  xpToNext: number;
  badges: typeof import("./mockData").BADGES;
  earnedBadges: string[];
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(() => clone(INITIAL_DEMO_STATE));
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      let loaded = loadState<DemoState>(STORAGE_KEY);
      if (!loaded) {
        const old = loadState<unknown>(OLD_STORAGE_KEY);
        if (old) loaded = normalizeState(old);
      }
      if (loaded) {
        const normalized = normalizeState(loaded);
        stateRef.current = normalized;
        setState(normalized);
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) saveState(STORAGE_KEY, state);
  }, [state, ready]);

  const setRole = useCallback((role: DemoRole) => {
    const next = setRoleState(stateRef.current, role);
    stateRef.current = next;
    setState(next);
  }, []);

  const resetDemo = useCallback(() => {
    const fresh = clone(INITIAL_DEMO_STATE);
    stateRef.current = fresh;
    setState(fresh);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(OLD_STORAGE_KEY);
      } catch {}
    }
  }, []);

  const startChallenge = useCallback((id: string) => {
    const next = startChallengeState(stateRef.current, id);
    stateRef.current = next;
    setState(next);
  }, []);

  const submitActivity = useCallback((payload: { challengeId: string; description: string; imageDataUrl: string | null }) => {
    const result = submitActivityState(stateRef.current, payload);
    if (result.success) {
      stateRef.current = result.state;
      setState(result.state);
    }
    return result;
  }, []);

  const completeLesson = useCallback((lessonId: string, xpReward: number) => {
    const current = stateRef.current;
    const { state: next, awarded } = completeLessonState(current, lessonId, xpReward);
    stateRef.current = next;
    setState(next);
    return { awarded, xp: xpReward };
  }, []);

  const reviewSubmission = useCallback((id: string, approved: boolean, note?: string) => {
    const next = reviewSubmissionState(stateRef.current, id, approved, note);
    stateRef.current = next;
    setState(next);
  }, []);

  const addChallenge = useCallback((challenge: Omit<Challenge, "id" | "status"> & { status?: Challenge["status"] }) => {
    const { state: next, challenge: newCh } = addChallengeState(stateRef.current, challenge);
    stateRef.current = next;
    setState(next);
    return newCh;
  }, []);

  const updateChallenge = useCallback((id: string, patch: Partial<Challenge>) => {
    const next = updateChallengeState(stateRef.current, id, patch);
    stateRef.current = next;
    setState(next);
  }, []);

  const deleteChallenge = useCallback((id: string) => {
    const { state: next, deleted, reason } = deleteChallengeState(stateRef.current, id);
    if (deleted) {
      stateRef.current = next;
      setState(next);
    }
    return { deleted, reason };
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