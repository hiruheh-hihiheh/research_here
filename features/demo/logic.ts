import type {
  Challenge,
  ChallengeStatus,
  DemoState,
  FarmerProfile,
  Submission,
  SustainabilityCategory,
} from "./types";
import {
  BADGES,
  INITIAL_CHALLENGES,
  INITIAL_DEMO_STATE,
  INITIAL_FARMER,
  levelForXp,
} from "./mockData";

export function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
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

export function unlockBadges(state: DemoState): string[] {
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

export function applyUnlock(state: DemoState): DemoState {
  const next = clone(state);
  next.farmer.badges = unlockBadges(next);
  next.farmer.level = levelForXp(next.farmer.xp).level;
  return next;
}

export function normalizeState(loaded: unknown): DemoState {
  const seed = clone(INITIAL_DEMO_STATE);
  const next: DemoState = clone(seed);
  if (loaded && typeof loaded === "object") {
    const data = loaded as Record<string, unknown>;
    next.role = data.role === "admin" ? "admin" : "farmer";
    if (data.farmer && typeof data.farmer === "object") {
      next.farmer = { ...seed.farmer, ...(data.farmer as Record<string, unknown>) } as FarmerProfile;
    }
    next.farmer.id = next.farmer.id || seed.farmer.id;
    next.farmer.name = next.farmer.name || seed.farmer.name;
    next.farmer.farmName = next.farmer.farmName || seed.farmer.farmName;
    next.farmer.location = next.farmer.location || seed.farmer.location;
    next.farmer.country = next.farmer.country || seed.farmer.country;
    next.farmer.avatar = next.farmer.avatar || seed.farmer.avatar;
    next.farmer.season = next.farmer.season || seed.farmer.season;

    // validate collection fields
    const completedChallenges = Array.isArray(data.completedChallenges) ? data.completedChallenges.filter((x) => typeof x === "string") : next.farmer.completedChallenges;
    const inProgressChallenges = Array.isArray(data.inProgressChallenges) ? data.inProgressChallenges.filter((x) => typeof x === "string") : next.farmer.inProgressChallenges;
    const completedLessons = Array.isArray(data.completedLessons) ? data.completedLessons.filter((x) => typeof x === "string") : next.completedLessons;
    const lessonXpAwarded = Array.isArray(data.lessonXpAwarded) ? data.lessonXpAwarded.filter((x) => typeof x === "string") : next.lessonXpAwarded;
    const badges = Array.isArray(data.badges) ? data.badges.filter((x) => typeof x === "string") : next.farmer.badges;

    next.farmer.completedChallenges = completedChallenges as string[];
    next.farmer.inProgressChallenges = inProgressChallenges as string[];
    next.completedLessons = completedLessons as string[];
    next.lessonXpAwarded = lessonXpAwarded as string[];
    next.farmer.badges = badges as string[];
    next.farmer.completedLessons = completedLessons as string[];

    if (Array.isArray(data.challenges)) {
      next.challenges = (data.challenges as unknown[]).filter((c) => c && typeof c === "object") as Challenge[];
    }
    if (Array.isArray(data.submissions)) {
      next.submissions = (data.submissions as unknown[]).filter((s) => s && typeof s === "object").map((s) => {
        const r = s as Record<string, unknown>;
        const safe: Submission = {
          id: typeof r.id === "string" ? r.id : `sub-${Math.random()}`,
          farmerId: typeof r.farmerId === "string" ? r.farmerId : "farmer-demo-1",
          challengeId: typeof r.challengeId === "string" ? r.challengeId : "",
          description: typeof r.description === "string" ? r.description : "",
          imageDataUrl: typeof r.imageDataUrl === "string" ? r.imageDataUrl : null,
          status: r.status === "approved" || r.status === "rejected" ? r.status : "pending",
          submittedAt: typeof r.submittedAt === "string" ? r.submittedAt : new Date().toISOString(),
          reviewedAt: typeof r.reviewedAt === "string" ? r.reviewedAt : undefined,
          reviewNote: typeof r.reviewNote === "string" ? r.reviewNote : undefined,
          challengeTitle: typeof r.challengeTitle === "string" ? r.challengeTitle : undefined,
        };
        if (!safe.challengeTitle) {
          const ch = next.challenges.find((c) => c.id === safe.challengeId) ?? INITIAL_CHALLENGES.find((c) => c.id === safe.challengeId);
          safe.challengeTitle = ch?.title;
        }
        return safe;
      });
    }
  }

  next.farmer.xp = normalizeNumber(next.farmer.xp, seed.farmer.xp);
  next.farmer.level = levelForXp(next.farmer.xp).level;

  const sp = (next.farmer.sustainabilityProgress ?? {}) as Record<string, unknown>;
  const normalized: FarmerProfile["sustainabilityProgress"] = { ...seed.farmer.sustainabilityProgress };
  SUSTAINABILITY_CATEGORIES.forEach((cat) => {
    normalized[cat] = normalizeNumber(sp[cat], seed.farmer.sustainabilityProgress[cat] ?? 0);
  });
  next.farmer.sustainabilityProgress = normalized;
  next.farmer.sustainabilityScore = Math.round(
    Object.values(normalized).reduce((a, b) => a + b, 0) / Object.values(normalized).length
  );

  const lessons = new Set([...next.completedLessons, ...next.lessonXpAwarded]);
  next.completedLessons = Array.from(lessons);
  next.lessonXpAwarded = Array.from(lessons);
  next.farmer.completedLessons = Array.from(lessons);

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

  return applyUnlock(next);
}

export type SubmitActivityResult =
  | { success: true; state: DemoState; submission: Submission }
  | { success: false; state: DemoState; error: string };

export function submitActivityState(
  state: DemoState,
  payload: { challengeId: string; description: string; imageDataUrl: string | null }
): SubmitActivityResult {
  const ch = state.challenges.find((c) => c.id === payload.challengeId);
  if (!ch) {
    return { success: false, state: clone(state), error: "Unknown challenge." };
  }
  if (ch.status !== "in-progress") {
    return { success: false, state: clone(state), error: "Activities can only be submitted for in-progress challenges." };
  }
  const submission: Submission = {
    id: `sub-${Date.now()}`,
    farmerId: "farmer-demo-1",
    challengeId: payload.challengeId,
    challengeTitle: ch.title,
    description: payload.description,
    imageDataUrl: payload.imageDataUrl,
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
  const next = clone(state);
  next.submissions = [submission, ...next.submissions];
  return { success: true, state: applyUnlock(next), submission };
}

export function startChallengeState(state: DemoState, id: string): DemoState {
  const next = clone(state);
  const ch = next.challenges.find((c) => c.id === id);
  if (
    ch &&
    ch.status === "available" &&
    !next.farmer.completedChallenges.includes(id) &&
    !next.farmer.inProgressChallenges.includes(id)
  ) {
    ch.status = "in-progress";
    if (!next.farmer.inProgressChallenges.includes(id)) next.farmer.inProgressChallenges.push(id);
  }
  return applyUnlock(next);
}

export function completeLessonState(state: DemoState, lessonId: string, xpReward: number): { state: DemoState; awarded: boolean } {
  const alreadyAwarded = state.lessonXpAwarded.includes(lessonId);
  const next = clone(state);
  if (!next.completedLessons.includes(lessonId)) next.completedLessons.push(lessonId);
  if (!next.farmer.completedLessons.includes(lessonId)) next.farmer.completedLessons.push(lessonId);
  let awarded = false;
  if (!next.lessonXpAwarded.includes(lessonId)) {
    next.lessonXpAwarded.push(lessonId);
    next.farmer.xp += xpReward;
    awarded = true;
  }
  return { state: applyUnlock(next), awarded: awarded && !alreadyAwarded };
}

export function reviewSubmissionState(
  state: DemoState,
  id: string,
  approved: boolean,
  note?: string
): DemoState {
  const sub = state.submissions.find((x) => x.id === id);
  if (!sub || sub.status !== "pending") return clone(state);
  const next = clone(state);
  const subNext = next.submissions.find((x) => x.id === id)!;
  subNext.status = approved ? "approved" : "rejected";
  subNext.reviewedAt = new Date().toISOString();
  subNext.reviewNote = note ?? (approved ? "Approved by agricultural expert (demo)." : "Rejected: evidence insufficient (demo).");
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
}

export function addChallengeState(state: DemoState, challenge: Omit<Challenge, "id" | "status"> & { status?: ChallengeStatus }): { state: DemoState; challenge: Challenge } {
  const newCh: Challenge = {
    ...challenge,
    id: `ch-${Date.now()}`,
    status: challenge.status ?? "available",
  };
  const next = clone(state);
  next.challenges = [newCh, ...next.challenges];
  return { state: next, challenge: newCh };
}

export function updateChallengeState(state: DemoState, id: string, patch: Partial<Challenge>): DemoState {
  const next = clone(state);
  const ch = next.challenges.find((c) => c.id === id);
  if (!ch) return next;
  const protectedStatus = ch.status === "in-progress" || ch.status === "completed";
  const safePatch: Partial<Challenge> = { ...patch };
  if (protectedStatus) {
    delete safePatch.status;
  }
  // archived/available transitions allowed
  Object.assign(ch, safePatch);
  return next;
}

export function deleteChallengeState(state: DemoState, id: string): { state: DemoState; deleted: boolean; reason?: string } {
  const ch = state.challenges.find((c) => c.id === id);
  if (!ch) {
    return { state: clone(state), deleted: false, reason: "Challenge not found." };
  }
  if (ch.status === "in-progress") {
    return { state: clone(state), deleted: false, reason: "In-progress challenges cannot be deleted." };
  }
  if (ch.status === "completed") {
    return { state: clone(state), deleted: false, reason: "Completed challenges cannot be deleted." };
  }
  const hasPending = state.submissions.some((s) => s.challengeId === id && s.status === "pending");
  if (hasPending) {
    return { state: clone(state), deleted: false, reason: "Pending submissions must be reviewed first." };
  }
  const next = clone(state);
  next.challenges = next.challenges.filter((c) => c.id !== id);
  return { state: next, deleted: true };
}

export function setRoleState(state: DemoState, role: DemoState["role"]): DemoState {
  const next = clone(state);
  next.role = role;
  return next;
}

export function resetState(): DemoState {
  return clone(INITIAL_DEMO_STATE);
}