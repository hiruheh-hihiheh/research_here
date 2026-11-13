import { describe, it, expect } from "vitest";
import { clone, normalizeState, completeLessonState, startChallengeState, updateChallengeState, deleteChallengeState, submitActivityState, reviewSubmissionState, validateChallengeInput, addChallengeState, countActiveChallenges, estimateDataUrlBytes, MAX_AGGREGATE_IMAGE_BYTES } from "./logic";
import { INITIAL_DEMO_STATE } from "./mockData";
import type { FarmerProfile, Challenge } from "./types";

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

  it("nested farmer collections null are safe", () => {
    const old = clone(INITIAL_DEMO_STATE);
    const farmer = old.farmer as unknown as Record<string, unknown>;
    farmer.completedChallenges = null;
    farmer.inProgressChallenges = null;
    farmer.badges = null;
    farmer.completedLessons = "bad" as unknown;
    const next = normalizeState(old);
    expect(Array.isArray(next.farmer.completedChallenges)).toBe(true);
    expect(Array.isArray(next.farmer.inProgressChallenges)).toBe(true);
    expect(Array.isArray(next.farmer.badges)).toBe(true);
    expect(Array.isArray(next.farmer.completedLessons)).toBe(true);
  });

  it("all four nested fields missing", () => {
    const old = clone(INITIAL_DEMO_STATE);
    const farmer = { ...old.farmer } as Record<string, unknown>;
    delete farmer.completedChallenges;
    delete farmer.inProgressChallenges;
    delete farmer.badges;
    delete farmer.completedLessons;
    old.farmer = farmer as unknown as FarmerProfile;
    const next = normalizeState(old);
    expect(Array.isArray(next.farmer.completedChallenges)).toBe(true);
    expect(Array.isArray(next.farmer.inProgressChallenges)).toBe(true);
    expect(Array.isArray(next.farmer.badges)).toBe(true);
    expect(Array.isArray(next.farmer.completedLessons)).toBe(true);
  });

  it("valid category preserved", () => {
    const old = clone(INITIAL_DEMO_STATE);
    old.challenges = [
      { id: "v", title: "V", category: "Soil health", difficulty: "Beginner", xpReward: 5, duration: "1w", objectives: [], instructions: [], status: "available" },
    ] as unknown as Challenge[];
    const next = normalizeState(old);
    expect(next.challenges.find((c) => c.id === "v")?.category).toBe("Soil health");
  });

  it("unsupported string category dropped", () => {
    const old = clone(INITIAL_DEMO_STATE);
    old.challenges = [
      { id: "u", title: "U", category: "Not a category", difficulty: "Beginner", xpReward: 5, duration: "1w", objectives: [], instructions: [], status: "available" },
    ] as unknown as Challenge[];
    const next = normalizeState(old);
    expect(next.challenges.find((c) => c.id === "u")).toBeUndefined();
  });

  it("missing category dropped", () => {
    const old = clone(INITIAL_DEMO_STATE);
    old.challenges = [
      { id: "m", title: "M", difficulty: "Beginner", xpReward: 5, duration: "1w", objectives: [], instructions: [], status: "available" },
    ] as unknown as Challenge[];
    const next = normalizeState(old);
    expect(next.challenges.find((c) => c.id === "m")).toBeUndefined();
  });

  it("non-string category dropped", () => {
    const old = clone(INITIAL_DEMO_STATE);
    old.challenges = [
      { id: "n", title: "N", category: 42, difficulty: "Beginner", xpReward: 5, duration: "1w", objectives: [], instructions: [], status: "available" },
    ] as unknown as Challenge[];
    const next = normalizeState(old);
    expect(next.challenges.find((c) => c.id === "n")).toBeUndefined();
  });

  it("malformed challenge records are dropped", () => {
    const old = clone(INITIAL_DEMO_STATE);
    old.challenges = [
      null,
      42,
      { id: "bad" },
      { id: "ok", title: "Ok", category: "Water conservation", difficulty: "Beginner", xpReward: 10, duration: "1w", objectives: ["a"], instructions: ["b"], status: "available" },
    ] as unknown as Challenge[];
    const next = normalizeState(old);
    expect(next.challenges.find((c) => c.id === "ok")).toBeTruthy();
    expect(next.challenges.find((c) => c.id === "bad")).toBeUndefined();
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

  it("sequential duplicate completion awards XP only once", () => {
    const fresh = clone(INITIAL_DEMO_STATE);
    fresh.completedLessons = [];
    fresh.lessonXpAwarded = [];
    fresh.farmer.completedLessons = [];
    fresh.farmer.xp = 0;
    const first = completeLessonState(fresh, "lesson-x", 10);
    expect(first.awarded).toBe(true);
    expect(first.state.farmer.xp).toBe(10);
    const second = completeLessonState(first.state, "lesson-x", 10);
    expect(second.awarded).toBe(false);
    expect(second.state.farmer.xp).toBe(10);
  });

  it("saved state does not grant XP again", () => {
    const fresh = clone(INITIAL_DEMO_STATE);
    fresh.completedLessons = [];
    fresh.lessonXpAwarded = [];
    fresh.farmer.completedLessons = [];
    fresh.farmer.xp = 0;
    const first = completeLessonState(fresh, "lesson-y", 15);
    const restored = normalizeState(first.state);
    const replay = completeLessonState(restored, "lesson-y", 15);
    expect(replay.awarded).toBe(false);
    expect(replay.state.farmer.xp).toBe(15);
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

describe("review lifecycle", () => {
  it("approving awards XP once", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const ch = state.challenges.find((c) => c.status === "available")!;
    const started = startChallengeState(state, ch.id);
    const beforeXp = started.farmer.xp;
    const subRes = submitActivityState(started, { challengeId: ch.id, description: "work", imageDataUrl: null });
    expect(subRes.success).toBe(true);
    if (!subRes.success) throw new Error(subRes.error);
    const subId = subRes.submission.id;
    const approved = reviewSubmissionState(subRes.state, subId, true);
    const approvedSub = approved.submissions.find((s) => s.id === subId)!;
    expect(approvedSub.status).toBe("approved");
    expect(approved.farmer.xp).toBe(beforeXp + ch.xpReward);
    const repeat = reviewSubmissionState(approved, subId, true);
    expect(repeat.farmer.xp).toBe(approved.farmer.xp);
  });

  it("rejected does not award XP", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const ch = state.challenges.find((c) => c.status === "available")!;
    const started = startChallengeState(state, ch.id);
    const beforeXp = started.farmer.xp;
    const subRes = submitActivityState(started, { challengeId: ch.id, description: "work", imageDataUrl: null });
    expect(subRes.success).toBe(true);
    if (!subRes.success) throw new Error(subRes.error);
    const rejected = reviewSubmissionState(subRes.state, subRes.submission.id, false);
    expect(rejected.farmer.xp).toBe(beforeXp);
    const rejectedSub = rejected.submissions.find((s) => s.id === subRes.submission.id)!;
    expect(rejectedSub.status).toBe("rejected");
  });

  it("approval updates sustainability and badge", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const ch = state.challenges.find((c) => c.id === "soil-composting")!;
    const beforeXp = state.farmer.xp;
    const beforeSoil = state.farmer.sustainabilityProgress["Soil health"];
    const subRes = submitActivityState(state, { challengeId: ch.id, description: "work", imageDataUrl: null });
    expect(subRes.success).toBe(true);
    if (!subRes.success) throw new Error("submission creation failed");
    const subId = subRes.submission.id;
    const approved = reviewSubmissionState(subRes.state, subId, true);
    const sub = approved.submissions.find((s) => s.id === subId)!;
    expect(sub.status).toBe("approved");
    expect(approved.farmer.xp).toBe(beforeXp + ch.xpReward);
    expect(approved.farmer.sustainabilityProgress["Soil health"]).toBe(Math.min(100, beforeSoil + 8));
    expect(approved.farmer.badges).toContain("soil-guardian");
    const repeat = reviewSubmissionState(approved, subId, true);
    expect(repeat.farmer.xp).toBe(approved.farmer.xp);
    expect(repeat.farmer.sustainabilityProgress["Soil health"]).toBe(approved.farmer.sustainabilityProgress["Soil health"]);
  });

  it("rejected submission awards no XP and no progress", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const ch = state.challenges.find((c) => c.id === "soil-composting")!;
    const beforeXp = state.farmer.xp;
    const beforeSoil = state.farmer.sustainabilityProgress["Soil health"];
    const subRes = submitActivityState(state, { challengeId: ch.id, description: "work", imageDataUrl: null });
    expect(subRes.success).toBe(true);
    if (!subRes.success) throw new Error("submission creation failed");
    const rejected = reviewSubmissionState(subRes.state, subRes.submission.id, false);
    expect(rejected.farmer.xp).toBe(beforeXp);
    expect(rejected.farmer.sustainabilityProgress["Soil health"]).toBe(beforeSoil);
    const rejectedSub = rejected.submissions.find((s) => s.id === subRes.submission.id)!;
    expect(rejectedSub.status).toBe("rejected");
  });
});

describe("challenge validation", () => {
  const valid = {
    title: "Test Challenge",
    description: "A sufficiently long description for validation.",
    category: "Soil health",
    difficulty: "Beginner",
    xpReward: 10,
    duration: "1 week",
    objectives: ["Do thing"],
    instructions: ["Step one"],
  };

  it("accepts valid challenge", () => {
    const res = validateChallengeInput(valid);
    expect(res.valid).toBe(true);
    const stateRes = addChallengeState(INITIAL_DEMO_STATE, valid as Parameters<typeof addChallengeState>[1]);
    expect(stateRes.challenge).not.toBeNull();
  });

  it("rejects invalid XP", () => {
    const res = validateChallengeInput({ ...valid, xpReward: 0 });
    expect(res.valid).toBe(false);
    const stateRes = addChallengeState(INITIAL_DEMO_STATE, { ...valid, xpReward: 0 } as Parameters<typeof addChallengeState>[1]);
    expect(stateRes.challenge).toBeNull();
  });

  it("rejects negative XP", () => {
    const res = validateChallengeInput({ ...valid, xpReward: -5 });
    expect(res.valid).toBe(false);
  });

  it("rejects missing objective", () => {
    const res = validateChallengeInput({ ...valid, objectives: [] });
    expect(res.valid).toBe(false);
  });

  it("counts only available and in-progress", () => {
    const chs = [
      { ...INITIAL_DEMO_STATE.challenges[0], status: "available" as const },
      { ...INITIAL_DEMO_STATE.challenges[0], id: "x", status: "completed" as const },
      { ...INITIAL_DEMO_STATE.challenges[0], id: "y", status: "archived" as const },
      { ...INITIAL_DEMO_STATE.challenges[0], id: "z", status: "in-progress" as const },
    ];
    expect(countActiveChallenges(chs)).toBe(2);
  });
});

describe("storage helpers", () => {
  it("estimates data URL size by encoded length", () => {
    const url = "data:image/png;base64,AAAA";
    expect(estimateDataUrlBytes(url)).toBe(url.length);
    expect(estimateDataUrlBytes(null)).toBe(0);
  });

  it("accepts aggregate budget", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const ip = state.challenges.find((c) => c.status === "in-progress")!;
    const small = "data:image/png;base64," + "A".repeat(100);
    const res = submitActivityState(state, { challengeId: ip.id, description: "work", imageDataUrl: small });
    expect(res.success).toBe(true);
  });

  it("rejects aggregate budget", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const ip = state.challenges.find((c) => c.status === "in-progress")!;
    const big = "data:image/png;base64," + "A".repeat(MAX_AGGREGATE_IMAGE_BYTES + 10);
    const res = submitActivityState(state, { challengeId: ip.id, description: "work", imageDataUrl: big });
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error).toContain("budget");
  });

  it("state unchanged on rejected submission", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const ip = state.challenges.find((c) => c.status === "in-progress")!;
    const before = state.submissions.length;
    const big = "data:image/png;base64," + "A".repeat(MAX_AGGREGATE_IMAGE_BYTES + 10);
    const res = submitActivityState(state, { challengeId: ip.id, description: "work", imageDataUrl: big });
    expect(res.success).toBe(false);
    expect(res.state.submissions.length).toBe(before);
  });
});

describe("challenge validation extra", () => {
  const valid = {
    title: "Test Challenge",
    description: "A sufficiently long description for validation.",
    category: "Soil health",
    difficulty: "Beginner",
    xpReward: 10,
    duration: "1 week",
    objectives: ["Do thing"],
    instructions: ["Step one"],
  };

  it("filters mixed objectives", () => {
    const input = { ...valid, objectives: ["  ok  ", 42, "", null] };
    const res = validateChallengeInput(input);
    expect(res.valid).toBe(true);
    const stateRes = addChallengeState(INITIAL_DEMO_STATE, input as Parameters<typeof addChallengeState>[1]);
    expect(stateRes.challenge?.objectives).toEqual(["ok"]);
  });

  it("filters mixed instructions", () => {
    const input = { ...valid, instructions: ["  step  ", 7, "   "] };
    const res = validateChallengeInput(input);
    expect(res.valid).toBe(true);
    const stateRes = addChallengeState(INITIAL_DEMO_STATE, input as Parameters<typeof addChallengeState>[1]);
    expect(stateRes.challenge?.instructions).toEqual(["step"]);
  });

  it("rejects whitespace-only objectives", () => {
    expect(validateChallengeInput({ ...valid, objectives: ["   "] }).valid).toBe(false);
  });

  it("rejects whitespace-only instructions", () => {
    expect(validateChallengeInput({ ...valid, instructions: ["   "] }).valid).toBe(false);
  });

  it("rejects invalid category and difficulty", () => {
    expect(validateChallengeInput({ ...valid, category: "Nope" }).valid).toBe(false);
    expect(validateChallengeInput({ ...valid, difficulty: "Hard" }).valid).toBe(false);
  });

  it("rejects invalid XP values", () => {
    expect(validateChallengeInput({ ...valid, xpReward: 1.5 }).valid).toBe(false);
    expect(validateChallengeInput({ ...valid, xpReward: NaN }).valid).toBe(false);
    expect(validateChallengeInput({ ...valid, xpReward: Infinity }).valid).toBe(false);
    expect(validateChallengeInput({ ...valid, xpReward: 0 }).valid).toBe(false);
    expect(validateChallengeInput({ ...valid, xpReward: -3 }).valid).toBe(false);
  });

  it("rejects invalid update", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const ch = state.challenges.find((c) => c.status === "available")!;
    const res = updateChallengeState(state, ch.id, { xpReward: 0 });
    expect(res.error).toBeTruthy();
  });

  it("valid edit preserves protected status", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const ip = state.challenges.find((c) => c.status === "in-progress")!;
    const res = updateChallengeState(state, ip.id, { title: "Updated Title Long Enough", status: "archived" });
    expect(res.error).toBeUndefined();
    const updated = res.state.challenges.find((c) => c.id === ip.id)!;
    expect(updated.title).toBe("Updated Title Long Enough");
    expect(updated.status).toBe("in-progress");
  });
});

describe("malformed state", () => {
    const old = clone(INITIAL_DEMO_STATE);
    (old as unknown as Record<string, unknown>).completedChallenges = "bad";
    (old as unknown as Record<string, unknown>).submissions = [{ foo: 1 }];
    (old as unknown as Record<string, unknown>).farmer = null;
    const next = normalizeState(old);
    expect(Array.isArray(next.farmer.completedChallenges)).toBe(true);
    expect(Array.isArray(next.submissions)).toBe(true);
    expect(next.farmer.name).toBeTruthy();
  });

  it("invalid submissions do not crash", () => {
    const old = clone(INITIAL_DEMO_STATE);
    (old as unknown as Record<string, unknown>).submissions = [null, 42, { challengeId: "x" }];
    const next = normalizeState(old);
    expect(Array.isArray(next.submissions)).toBe(true);
    next.submissions.forEach((s) => {
      expect(typeof s.id).toBe("string");
      expect(typeof s.status).toBe("string");
    });
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
    const next = updateChallengeState(state, ip.id, { status: "archived" }).state;
    const ch = next.challenges.find((c) => c.id === ip.id);
    expect(ch?.status).toBe("in-progress");
  });

  it("completed cannot be archived or reset", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const completed = state.challenges.find((c) => c.status === "completed")!;
    const next = updateChallengeState(state, completed.id, { status: "archived" }).state;
    const ch = next.challenges.find((c) => c.id === completed.id);
    expect(ch?.status).toBe("completed");
  });

  it("available and archived can transition", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const avail = state.challenges.find((c) => c.status === "available")!;
    const archived = updateChallengeState(state, avail.id, { status: "archived" }).state;
    expect(archived.challenges.find((c) => c.id === avail.id)?.status).toBe("archived");
    const restored = updateChallengeState(archived, avail.id, { status: "available" }).state;
    expect(restored.challenges.find((c) => c.id === avail.id)?.status).toBe("available");
  });
});

describe("activity submission", () => {
  it("valid in-progress submission", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const ip = state.challenges.find((c) => c.status === "in-progress")!;
    const res = submitActivityState(state, { challengeId: ip.id, description: "did work", imageDataUrl: null });
    expect(res.success).toBe(true);
    if (res.success) expect(res.submission.challengeId).toBe(ip.id);
  });

  it("rejects available", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const avail = state.challenges.find((c) => c.status === "available")!;
    const res = submitActivityState(state, { challengeId: avail.id, description: "x", imageDataUrl: null });
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error).toBeTruthy();
  });

  it("rejects archived", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const avail = state.challenges.find((c) => c.status === "available")!;
    const archivedState = updateChallengeState(state, avail.id, { status: "archived" }).state;
    const res = submitActivityState(archivedState, { challengeId: avail.id, description: "x", imageDataUrl: null });
    expect(res.success).toBe(false);
  });

  it("rejects completed", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const completed = state.challenges.find((c) => c.status === "completed")!;
    const res = submitActivityState(state, { challengeId: completed.id, description: "x", imageDataUrl: null });
    expect(res.success).toBe(false);
  });

  it("rejects unknown", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const res = submitActivityState(state, { challengeId: "nope", description: "x", imageDataUrl: null });
    expect(res.success).toBe(false);
  });
});

describe("deletion protection", () => {
  it("pending submissions prevent deletion", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const ch = state.challenges.find((c) => c.status === "available")!;
    state.submissions = [
      { id: "s1", farmerId: "f", challengeId: ch.id, description: "d", imageDataUrl: null, status: "pending", submittedAt: new Date().toISOString() },
    ];
    const res = deleteChallengeState(state, ch.id);
    expect(res.deleted).toBe(false);
    expect(res.reason).toContain("Pending");
    const stillThere = state.challenges.find((c) => c.id === ch.id);
    expect(stillThere).toBeTruthy();
  });

  it("archived challenge with pending legacy submission is protected", () => {
    const state = clone(INITIAL_DEMO_STATE);
    const ch = state.challenges.find((c) => c.status === "available")!;
    const archivedState = updateChallengeState(state, ch.id, { status: "archived" }).state;
    archivedState.submissions = [
      { id: "s-legacy", farmerId: "f", challengeId: ch.id, description: "d", imageDataUrl: null, status: "pending", submittedAt: new Date().toISOString() },
    ];
    const res = deleteChallengeState(archivedState, ch.id);
    expect(res.deleted).toBe(false);
    expect(res.reason).toContain("Pending");
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
    const archivedState = updateChallengeState(state, avail.id, { status: "archived" }).state;
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