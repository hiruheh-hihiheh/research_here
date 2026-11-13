export type ChallengeCategory =
  | "Water conservation"
  | "Soil health"
  | "Organic farming"
  | "Crop rotation"
  | "Integrated pest management"
  | "Biodiversity"
  | "Energy efficiency";

export type ChallengeDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type ChallengeStatus = "available" | "in-progress" | "completed";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  xpReward: number;
  duration: string;
  objectives: string[];
  instructions: string[];
  status: ChallengeStatus;
  region?: string;
}

export type SustainabilityCategory =
  | "Water conservation"
  | "Soil health"
  | "Crop diversity"
  | "Integrated pest management"
  | "Biodiversity";

export interface FarmerProfile {
  id: string;
  name: string;
  farmName: string;
  location: string;
  country: string;
  avatar: string;
  season: string;
  level: number;
  xp: number;
  sustainabilityScore: number;
  sustainabilityProgress: Record<SustainabilityCategory, number>;
  completedLessons: string[];
  completedChallenges: string[];
  inProgressChallenges: string[];
  badges: string[];
}

export interface LessonSection {
  heading: string;
  body: string;
  example?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  category: string;
  cover: string;
  objectives: string[];
  readingTime: string;
  sections: LessonSection[];
  quiz: QuizQuestion[];
  xpReward: number;
}

export interface Submission {
  id: string;
  farmerId: string;
  challengeId: string;
  description: string;
  imageDataUrl: string | null;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  country: string;
  avatar: string;
  level: number;
  xp: number;
  isCurrent?: boolean;
}

export interface LevelInfo {
  level: number;
  name: string;
  xpRequired: number;
}

export type DemoRole = "farmer" | "admin";

export interface DemoState {
  role: DemoRole;
  farmer: FarmerProfile;
  challenges: Challenge[];
  submissions: Submission[];
  completedLessons: string[];
  lessonXpAwarded: string[];
}