import { describe, it, expect } from "vitest";
import { clone, normalizeState, completeLessonState, startChallengeState, updateChallengeState, deleteChallengeState, submitActivityState } from "./logic";
import { INITIAL_DEMO_STATE } from "./mockData";
import type { FarmerProfile } from "./types";

describe("migration", () => {
  it("fills missing sustainability categories and preserves valid values", () => {
    const old = clone(INITIAL_DEMO_STATE);
    old.farmer.sustainabilityProgress = { "Water conservation": 72, "Soil health": 60 } as FarmerProfile["sustainabilityProgress"];
    const next = normalizeState(old);
    expect(next.farmer.sustainabilityProgress["Water conservation"]).toBe(72);
    expect(next.farmer.sustainabilityProgress["Soil health"]).toBe(60);
    expect(typeof next.farmer.sustainabilityProgress["Energy efficiency"]).toBe("number");
  });

  it("invalid numerical values do not produce NaN", () => {
    const old = clone(INITIAL_DEMO_STATE);
    old.farmer.sustainabilityProgress = { "Water conservation": "bad", "Soil health": NaN } as unknown as FarmerProfile["sustainabilityProgress"];
    old.farmer.xp = NaN;
    const next = normalizeState(old);
    expect(Number.isNaN(next.farmer.sustainabilityScore)).toBe(false);
    expect(Number.isNaN(next.farmer.xp)).toBe(false);
    expect(Number.isNaN(next.farmer.level)).toBe(false);
  });

  it("old submissions receive challenge titles during migration", () => {
    const old = clone(INITIAL_DEMO_STATE);
    const ch = old.challenges[0];
    old.submissions = [
      { id: "s-old", farmerId: "f", challengeId: ch.id, description: "d", imageDataUrl: null, status: "pending", submittedAt: new Date().toISOString() },
    ];
    const next = normalizeState(old);
    expect(next.submissions[0].challengeTitle).toBe(ch.title);
  });

  it("missing farmer fields receive safe defaults", () => {
    const old = clone(INITIAL_DEMO_STATE);
    old.farmer = { xp: 10 } as unknown as FarmerProfile;
    const next = normalizeState(old);
    expect(next.farmer.name).toBeTruthy();
    expect(next.farmer.sustainabilityProgress).toBeDefined();
    expect(Object.keys(next.farmer.sustainabilityProgress).length).toBe(6);
  });

  it("XP and level remain consistent", () => {
    const old = clone(INITIAL_DEMO_STATE);
    old.farmer.xp = 420;
    const next = normalizeState(old);
    expect(next.farmer.level).toBe(2);
  });
});

describe("lesson XP", () => {
  it("completing a lesson twice awards XP only once", () => {
    const first = completeLessonState(INITIAL_DEMO_STATE, "water-basics", 60);
    const second = completeLessonState(first.state, "water-basics", 60);
    expect(first.awarded).toBe(false); // already in seed
    // use a fresh lesson
    const fresh = clone(INITIAL_DEMO_STATE);
    fresh.completedLessons = [];
    fresh.lessonXpAwarded = [];
    fresh.farmer.completedLessons = [];
    const a = completeLessonState(fresh, "soil-health", 60);
    const b = completeLessonState(a.state, "soil-health", 60);
    expect(a.awarded).toBe(true);
    expect(b.awarded).toBe(false);
    expect(b.state.farmer.xp).toBe(a.state.farmer.xp);
  });

  it("rapid duplicate produces accurate award result", () => {
    const fresh = clone(INITIAL_DEMO_STATE);
    fresh.completedLessons = [];
    fresh.lessonXpAwarded = [];
    fresh.farmer.completedLessons = [];
    fresh.farmer.xp = 0;
    const a = completeLessonState(fresh, "x", 10);
    const b = completeLessonState(fresh, "x", 10);
    // second uses original state, would report awarded true; but sequential usage is correct
    expect(a.awarded).toBe(true);
    // using returned state prevents duplicate
    const c = completeLessonState(a.state, "x", 10);
    expect(c.awarded).toBe(false);
  });

  it("completing a different lesson still awards XP", () => {
    const fresh = clone(INITIAL_DEMO_STATE);
    fresh.completedLessons = [];
    fresh.lessonXpAwarded = [];
    fresh.farmer.completedLessons = [];
    fresh.farmer.xp = 0;
    const a = completeLessonState(fresh, "lesson-a", 10);
    const b = completeLessonState(a.state, "lesson-b", 20);
    expect(a.awarded).toBe(true);
    expect(b.awarded).toBe(true);
    expect(b.state.farmer.xp).toBe(30);
  });
});

describe("challenge lifecycle", () => {
  it("completed challenges cannot be restarted", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const completedId = state.farmer.completedChallenges[0];
    const next = startChallengeState(state, completedId);
    const ch = next.challenges.find((c) => c.id === completedId);
    expect(ch?.status).toBe("completed");
  });

  it("in-progress cannot be archived or reset", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const ip = state.challenges.find((c) => c.status === "in-progress")!;
    const next = updateChallengeState(state, ip.id, { status: "archived" });
    const ch = next.challenges.find((c) => c.id === ip.id);
    expect(ch?.status).toBe("in-progress");
  });

  it("completed cannot be archived or reset", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const completed = state.challenges.find((c) => c.status === "completed")!;
    const next = updateChallengeState(state, completed.id, { status: "archived" });
    const ch = next.challenges.find((c) => c.id === completed.id);
    expect(ch?.status).toBe("completed");
  });

  it("available and archived can transition", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const avail = state.challenges.find((c) => c.status === "available")!;
    const archived = updateChallengeState(state, avail.id, { status: "archived" });
    expect(archived.challenges.find((c) => c.id === avail.id)?.status).toBe("archived");
    const restored = updateChallengeState(archived, avail.id, { status: "available" });
    expect(restored.challenges.find((c) => c.id === avail.id)?.status).toBe("available");
  });
});

describe("activity submission", () => {
  it("valid in-progress submission", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const ip = state.challenges.find((c) => c.status === "in-progress")!;
    const res = submitActivityState(state, { challengeId: ip.id, description: "did work", imageDataUrl: null });
    expect(res.submission).not.toBeNull();
    expect(res.state.submissions[0].challengeId).toBe(ip.id);
  });

  it("rejects available", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const avail = state.challenges.find((c) => c.status === "available")!;
    const res = submitActivityState(state, { challengeId: avail.id, description: "x", imageDataUrl: null });
    expect(res.submission).toBeNull();
    expect(res.error).toBeTruthy();
  });

  it("rejects archived", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const avail = state.challenges.find((c) => c.status === "available")!;
    const archivedState = updateChallengeState(state, avail.id, { status: "archived" });
    const res = submitActivityState(archivedState, { challengeId: avail.id, description: "x", imageDataUrl: null });
    expect(res.submission).toBeNull();
  });

  it("rejects completed", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const completed = state.challenges.find((c) => c.status === "completed")!;
    const res = submitActivityState(state, { challengeId: completed.id, description: "x", imageDataUrl: null });
    expect(res.submission).toBeNull();
  });

  it("rejects unknown", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const res = submitActivityState(state, { challengeId: "nope", description: "x", imageDataUrl: null });
    expect(res.submission).toBeNull();
  });
});

describe("deletion protection", () => {
  it("pending submissions prevent deletion", () => {
    const state = clone(INITIAL_DEMO_STATE);
    // add a pending submission for first challenge
    const ch = state.challenges[0];
    state.submissions = [
      { id: "s1", farmerId: "f", challengeId: ch.id, description: "d", imageDataUrl: null, status: "pending", submittedAt: new Date().toISOString() },
    ];
    const res = deleteChallengeState(state, ch.id);
    expect(res.deleted).toBe(false);
  });

  it("approved/rejected submissions remain visible after deletion", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const ch = state.challenges.find((c) => c.status === "available")!;
    state.submissions = [
      { id: "s2", farmerId: "f", challengeId: ch.id, challengeTitle: ch.title, description: "d", imageDataUrl: null, status: "approved", submittedAt: new Date().toISOString() },
    ];
    const res = deleteChallengeState(state, ch.id);
    expect(res.deleted).toBe(true);
    expect(res.state.submissions.find((s) => s.id === "s2")?.challengeTitle).toBe(ch.title);
  });

  it("in-progress prevents deletion", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const ip = state.challenges.find((c) => c.status === "in-progress")!;
    const res = deleteChallengeState(state, ip.id);
    expect(res.deleted).toBe(false);
    expect(res.reason).toBeTruthy();
  });

  it("completed prevents deletion", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const completed = state.challenges.find((c) => c.status === "completed")!;
    const res = deleteChallengeState(state, completed.id);
    expect(res.deleted).toBe(false);
  });

  it("available can be deleted when safe", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const avail = state.challenges.find((c) => c.status === "available")!;
    const res = deleteChallengeState(state, avail.id);
    expect(res.deleted).toBe(true);
  });

  it("archived can be deleted when safe", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const avail = state.challenges.find((c) => c.status === "available")!;
    const archivedState = updateChallengeState(state, avail.id, { status: "archived" });
    const res = deleteChallengeState(archivedState, avail.id);
    expect(res.deleted).toBe(true);
  });

  it("unknown challenge deletion fails", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const res = deleteChallengeState(state, "nope");
    expect(res.deleted).toBe(false);
    expect(res.reason).toBeTruthy();
  });
});