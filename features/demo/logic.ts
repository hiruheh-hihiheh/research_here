import type {
  Challenge,
  ChallengeStatus,
  DemoState,
  FarmerProfile,
  Submission,
  SustainabilityCategory,
} from "./types";
import {
  INITIAL_CHALLENGES,
  INITIAL_DEMO_STATE,
  levelForXp,
} from "./mockData";

export function countActiveChallenges(challenges: Challenge[]): number {
  return challenges.filter((c) => c.status === "available" || c.status === "in-progress").length;
}

export function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export const MAX_AGGREGATE_IMAGE_BYTES = 4 * 1024 * 1024;

export function estimateDataUrlBytes(dataUrl: string | null): number {
  if (!dataUrl) return 0;
  const comma = dataUrl.indexOf(",");
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  return Math.ceil((base64.length * 3) / 4);
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

    const farmerData = (data.farmer && typeof data.farmer === "object" ? data.farmer : {}) as Record<string, unknown>;

    // validate collection fields from nested farmer
    const completedChallenges = Array.isArray(farmerData.completedChallenges)
      ? farmerData.completedChallenges.filter((x) => typeof x === "string")
      : Array.isArray(next.farmer.completedChallenges)
      ? next.farmer.completedChallenges
      : [];
    const inProgressChallenges = Array.isArray(farmerData.inProgressChallenges)
      ? farmerData.inProgressChallenges.filter((x) => typeof x === "string")
      : Array.isArray(next.farmer.inProgressChallenges)
      ? next.farmer.inProgressChallenges
      : [];
    const completedLessons = Array.isArray(data.completedLessons)
      ? data.completedLessons.filter((x) => typeof x === "string")
      : Array.isArray(farmerData.completedLessons)
      ? farmerData.completedLessons.filter((x) => typeof x === "string")
      : Array.isArray(next.completedLessons)
      ? next.completedLessons
      : [];
    const lessonXpAwarded = Array.isArray(data.lessonXpAwarded)
      ? data.lessonXpAwarded.filter((x) => typeof x === "string")
      : Array.isArray(next.lessonXpAwarded)
      ? next.lessonXpAwarded
      : [];
    const badges = Array.isArray(farmerData.badges)
      ? farmerData.badges.filter((x) => typeof x === "string")
      : Array.isArray(next.farmer.badges)
      ? next.farmer.badges
      : [];

    next.farmer.completedChallenges = completedChallenges as string[];
    next.farmer.inProgressChallenges = inProgressChallenges as string[];
    next.completedLessons = completedLessons as string[];
    next.lessonXpAwarded = lessonXpAwarded as string[];
    next.farmer.badges = badges as string[];
    next.farmer.completedLessons = completedLessons as string[];

    if (Array.isArray(data.challenges)) {
      const validStatuses: ChallengeStatus[] = ["available", "in-progress", "completed", "archived"];
      next.challenges = (data.challenges as unknown[])
        .map((raw) => {
          if (!raw || typeof raw !== "object") return null;
          const r = raw as Record<string, unknown>;
          const id = typeof r.id === "string" && r.id.trim() ? r.id : null;
          const title = typeof r.title === "string" && r.title.trim() ? r.title : null;
          const description = typeof r.description === "string" ? r.description : "";
          const SUPPORTED_CATEGORIES: Challenge["category"][] = ["Water conservation", "Soil health", "Organic farming", "Crop rotation", "Integrated pest management", "Biodiversity", "Energy efficiency"];
          const category = SUPPORTED_CATEGORIES.find((c) => c === r.category) ?? null;
          const difficulty = r.difficulty === "Beginner" || r.difficulty === "Intermediate" || r.difficulty === "Advanced" ? r.difficulty : "Beginner";
          const xpReward = typeof r.xpReward === "number" && Number.isFinite(r.xpReward) && r.xpReward >= 0 ? r.xpReward : 0;
          const duration = typeof r.duration === "string" ? r.duration : "1 week";
          const objectives = Array.isArray(r.objectives) ? r.objectives.filter((x) => typeof x === "string") : [];
          const instructions = Array.isArray(r.instructions) ? r.instructions.filter((x) => typeof x === "string") : [];
          const status = validStatuses.includes(r.status as ChallengeStatus) ? (r.status as ChallengeStatus) : "available";
          if (!id || !title || !category) return null;
          const challenge: Challenge = {
            id,
            title,
            description,
            category,
            difficulty,
            xpReward,
            duration,
            objectives,
            instructions,
            status,
            region: typeof r.region === "string" ? r.region : undefined,
          };
          return challenge;
        })
        .filter((c): c is Challenge => c !== null);
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
  if (payload.imageDataUrl) {
    const existingBytes = state.submissions.reduce((sum, s) => sum + estimateDataUrlBytes(s.imageDataUrl), 0);
    const newBytes = estimateDataUrlBytes(payload.imageDataUrl);
    if (existingBytes + newBytes > MAX_AGGREGATE_IMAGE_BYTES) {
      return { success: false, state: clone(state), error: "Evidence storage budget exceeded. Remove or compress images." };
    }
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

export interface ChallengeValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const VALID_CATEGORIES: Challenge["category"][] = ["Water conservation", "Soil health", "Organic farming", "Crop rotation", "Integrated pest management", "Biodiversity", "Energy efficiency"];

export function validateChallengeInput(input: {
  title?: unknown;
  description?: unknown;
  category?: unknown;
  difficulty?: unknown;
  xpReward?: unknown;
  duration?: unknown;
  objectives?: unknown;
  instructions?: unknown;
}): ChallengeValidationResult {
  const errors: string[] = [];
  const title = typeof input.title === "string" ? input.title.trim() : "";
  if (title.length < 3) errors.push("Title must be at least 3 characters.");
  const description = typeof input.description === "string" ? input.description.trim() : "";
  if (description.length < 10) errors.push("Description must be at least 10 characters.");
  if (typeof input.category !== "string" || !VALID_CATEGORIES.includes(input.category as Challenge["category"])) {
    errors.push("Category is invalid.");
  }
  if (typeof input.difficulty !== "string" || !VALID_DIFFICULTIES.includes(input.difficulty)) {
    errors.push("Difficulty is invalid.");
  }
  const xp = input.xpReward;
  if (typeof xp !== "number" || !Number.isFinite(xp) || !Number.isInteger(xp) || xp <= 0) {
    errors.push("XP reward must be a positive integer.");
  }
  const duration = typeof input.duration === "string" ? input.duration.trim() : "";
  if (duration.length < 2) errors.push("Duration is required.");
  const objectives = Array.isArray(input.objectives) ? input.objectives.filter((x) => typeof x === "string" && x.trim().length > 0) : [];
  if (objectives.length === 0) errors.push("At least one objective is required.");
  const instructions = Array.isArray(input.instructions) ? input.instructions.filter((x) => typeof x === "string" && x.trim().length > 0) : [];
  if (instructions.length === 0) errors.push("At least one instruction is required.");
  return { valid: errors.length === 0, errors };
}

export function addChallengeState(state: DemoState, challenge: Omit<Challenge, "id" | "status"> & { status?: Challenge["status"] }): { state: DemoState; challenge: Challenge | null; error?: string } {
  const validation = validateChallengeInput(challenge);
  if (!validation.valid) {
    return { state: clone(state), challenge: null, error: validation.errors.join(" ") };
  }
  const newCh: Challenge = {
    ...challenge,
    id: `ch-${Date.now()}`,
    status: challenge.status ?? "available",
    title: challenge.title.trim(),
    description: challenge.description.trim(),
    duration: challenge.duration.trim(),
    objectives: challenge.objectives.map((x) => x.trim()).filter(Boolean),
    instructions: challenge.instructions.map((x) => x.trim()).filter(Boolean),
  };
  const next = clone(state);
  next.challenges = [newCh, ...next.challenges];
  return { state: next, challenge: newCh };
}

export function updateChallengeState(state: DemoState, id: string, patch: Partial<Challenge>): { state: DemoState; error?: string } {
  const next = clone(state);
  const ch = next.challenges.find((c) => c.id === id);
  if (!ch) return { state: clone(state), error: "Challenge not found." };
  const protectedStatus = ch.status === "in-progress" || ch.status === "completed";
  const candidate = {
    title: patch.title ?? ch.title,
    description: patch.description ?? ch.description,
    category: patch.category ?? ch.category,
    difficulty: patch.difficulty ?? ch.difficulty,
    xpReward: patch.xpReward ?? ch.xpReward,
    duration: patch.duration ?? ch.duration,
    objectives: patch.objectives ?? ch.objectives,
    instructions: patch.instructions ?? ch.instructions,
  };
  const validation = validateChallengeInput(candidate);
  if (!validation.valid) {
    return { state: clone(state), error: validation.errors.join(" ") };
  }
  const safePatch: Partial<Challenge> = { ...patch };
  if (protectedStatus) {
    delete safePatch.status;
  }
  if (safePatch.title) safePatch.title = safePatch.title.trim();
  if (safePatch.description) safePatch.description = safePatch.description.trim();
  if (safePatch.duration) safePatch.duration = safePatch.duration.trim();
  if (safePatch.objectives) safePatch.objectives = safePatch.objectives.map((x) => x.trim()).filter(Boolean);
  if (safePatch.instructions) safePatch.instructions = safePatch.instructions.map((x) => x.trim()).filter(Boolean);
  Object.assign(ch, safePatch);
  return { state: next };
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