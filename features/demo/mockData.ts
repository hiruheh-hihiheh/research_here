import type {
  Badge,
  Challenge,
  ChallengeCategory,
  DemoState,
  FarmerProfile,
  LeaderboardEntry,
  Lesson,
  LevelInfo,
} from "./types";

export const LEVELS: LevelInfo[] = [
  { level: 1, name: "Seedling", xpRequired: 0 },
  { level: 2, name: "Sprout", xpRequired: 200 },
  { level: 3, name: "Grower", xpRequired: 500 },
  { level: 4, name: "Cultivator", xpRequired: 900 },
  { level: 5, name: "Soil Guardian", xpRequired: 1400 },
  { level: 6, name: "Green Champion", xpRequired: 2000 },
  { level: 7, name: "Sustainability Champion", xpRequired: 2800 },
  { level: 8, name: "Eco Master", xpRequired: 3800 },
];

export function levelForXp(xp: number): LevelInfo {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.xpRequired) current = l;
    else break;
  }
  return current;
}

export function nextLevelForXp(xp: number): LevelInfo | null {
  const current = levelForXp(xp);
  const idx = LEVELS.findIndex((l) => l.level === current.level);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

export const BADGES: Badge[] = [
  { id: "water-guardian", name: "Water Guardian", description: "Complete a water conservation challenge.", icon: "Droplets", requirement: "Complete 1 water conservation challenge" },
  { id: "soil-guardian", name: "Soil Guardian", description: "Complete a soil health challenge.", icon: "Sprout", requirement: "Complete 1 soil health challenge" },
  { id: "organic-pioneer", name: "Organic Pioneer", description: "Complete an organic farming challenge.", icon: "Leaf", requirement: "Complete 1 organic farming challenge" },
  { id: "green-champion", name: "Green Champion", description: "Reach Level 5.", icon: "Trophy", requirement: "Reach farmer level 5" },
  { id: "biodiversity-protector", name: "Biodiversity Protector", description: "Complete a biodiversity challenge.", icon: "Bug", requirement: "Complete 1 biodiversity challenge" },
  { id: "learning-master", name: "Learning Master", description: "Complete 3 learning lessons.", icon: "GraduationCap", requirement: "Complete 3 lessons" },
  { id: "sustainability-champion", name: "Sustainability Champion", description: "Complete 5 sustainable farming activities.", icon: "Award", requirement: "Complete 5 approved activities" },
  { id: "crop-rotator", name: "Crop Rotator", description: "Complete a crop rotation challenge.", icon: "RefreshCw", requirement: "Complete 1 crop rotation challenge" },
];

export const INITIAL_FARMER: FarmerProfile = {
  id: "farmer-demo-1",
  name: "Ramesh Kumar",
  farmName: "Green Valley Farm",
  location: "Punjab, India",
  country: "India",
  avatar: "RK",
  season: "Rabi 2026",
  level: 3,
  xp: 420,
  sustainabilityScore: 68,
  sustainabilityProgress: {
    "Water conservation": 72,
    "Soil health": 60,
    "Crop diversity": 55,
    "Integrated pest management": 48,
    "Biodiversity": 64,
  },
  completedLessons: ["water-basics"],
  completedChallenges: ["water-drip-irrigation"],
  inProgressChallenges: ["soil-composting"],
  badges: ["water-guardian", "learning-master"],
};

export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: "water-drip-irrigation",
    title: "Install Drip Irrigation",
    description: "Switch a section of your field to drip irrigation to reduce water waste and improve crop yield.",
    category: "Water conservation",
    difficulty: "Intermediate",
    xpReward: 150,
    duration: "2-3 weeks",
    objectives: ["Install drip lines in at least one plot", "Document water usage before and after", "Share a photo of the installed system"],
    instructions: [
      "Identify a crop section suitable for drip irrigation.",
      "Lay out main and lateral drip lines with emitters.",
      "Test the system for leaks and uniform flow.",
      "Capture photo evidence of the installed system.",
      "Record estimated water savings in the submission notes.",
    ],
    status: "completed",
    region: "Arid and semi-arid regions",
  },
  {
    id: "water-rainwater-harvesting",
    title: "Rainwater Harvesting Setup",
    description: "Build a simple rainwater collection system to store water for dry-season irrigation.",
    category: "Water conservation",
    difficulty: "Beginner",
    xpReward: 100,
    duration: "1 week",
    objectives: ["Set up a collection tank or pond", "Connect roof or field runoff", "Document storage capacity"],
    instructions: ["Choose a collection point.", "Install gutters and a storage tank.", "Add a simple filter.", "Photograph the completed setup."],
    status: "available",
    region: "Monsoon and tropical regions",
  },
  {
    id: "soil-composting",
    title: "Farm Composting Practice",
    description: "Create a compost heap using crop residues and farm waste to improve soil organic matter.",
    category: "Soil health",
    difficulty: "Beginner",
    xpReward: 120,
    duration: "3-4 weeks",
    objectives: ["Build a compost pit or heap", "Add balanced green and brown material", "Turn and monitor moisture", "Document finished compost"],
    instructions: ["Select a shaded corner.", "Layer green and brown materials.", "Maintain moisture and aeration.", "Photograph progress weekly."],
    status: "in-progress",
    region: "All regions",
  },
  {
    id: "soil-cover-cropping",
    title: "Cover Cropping for Soil Health",
    description: "Plant a cover crop during the off-season to protect and enrich the soil.",
    category: "Soil health",
    difficulty: "Intermediate",
    xpReward: 140,
    duration: "4-6 weeks",
    objectives: ["Select a suitable cover crop", "Sow across a plot", "Document growth", "Terminate and incorporate"],
    instructions: ["Choose legume or grass cover crop.", "Prepare seedbed.", "Sow and irrigate lightly.", "Photograph growth stages."],
    status: "available",
    region: "Temperate and subtropical regions",
  },
  {
    id: "organic-natural-pesticide",
    title: "Natural Pest Control",
    description: "Prepare and apply a botanical pesticide using locally available plants.",
    category: "Organic farming",
    difficulty: "Beginner",
    xpReward: 110,
    duration: "1-2 weeks",
    objectives: ["Identify a pest problem", "Prepare a botanical spray", "Apply and monitor", "Document results"],
    instructions: ["Scout for pests.", "Prepare neem or garlic extract.", "Spray during cool hours.", "Photograph application and results."],
    status: "available",
    region: "All regions",
  },
  {
    id: "organic-vermicompost",
    title: "Vermicomposting Unit",
    description: "Set up a vermicompost unit to convert organic waste into nutrient-rich compost.",
    category: "Organic farming",
    difficulty: "Intermediate",
    xpReward: 130,
    duration: "3-4 weeks",
    objectives: ["Build a vermi bed", "Introduce earthworms", "Harvest vermicompost", "Apply to crops"],
    instructions: ["Prepare a shaded container.", "Add bedding and worms.", "Feed regularly.", "Harvest and photograph."],
    status: "available",
    region: "Tropical and subtropical regions",
  },
  {
    id: "crop-rotation-plan",
    title: "Three-Year Crop Rotation Plan",
    description: "Design and implement a crop rotation plan to reduce pest buildup and improve soil fertility.",
    category: "Crop rotation",
    difficulty: "Advanced",
    xpReward: 180,
    duration: "1 season",
    objectives: ["Map current crops", "Design rotation sequence", "Implement for one season", "Document outcomes"],
    instructions: ["Record current crops.", "Plan rotation with legumes and cereals.", "Implement in at least one plot.", "Photograph and note results."],
    status: "available",
    region: "All regions",
  },
  {
    id: "ipm-scouting",
    title: "Integrated Pest Management Scouting",
    description: "Conduct regular pest scouting and use thresholds before applying any control.",
    category: "Integrated pest management",
    difficulty: "Intermediate",
    xpReward: 120,
    duration: "2 weeks",
    objectives: ["Scout fields twice weekly", "Record pest counts", "Apply control only above threshold", "Document decisions"],
    instructions: ["Walk the field in a W pattern.", "Count pests on sample plants.", "Compare to thresholds.", "Photograph scouting notes."],
    status: "available",
    region: "All regions",
  },
  {
    id: "biodiversity-hedgerow",
    title: "Plant a Biodiversity Hedgerow",
    description: "Establish a native plant hedgerow to support pollinators and beneficial insects.",
    category: "Biodiversity",
    difficulty: "Intermediate",
    xpReward: 150,
    duration: "2-3 weeks",
    objectives: ["Select native species", "Plant a hedgerow border", "Document pollinator visits", "Maintain the strip"],
    instructions: ["Choose native flowering plants.", "Prepare border soil.", "Plant and water.", "Photograph the hedgerow."],
    status: "available",
    region: "Temperate regions",
  },
  {
    id: "energy-solar-pump",
    title: "Solar Water Pump Upgrade",
    description: "Replace a diesel pump with a solar pump for irrigation.",
    category: "Energy efficiency",
    difficulty: "Advanced",
    xpReward: 200,
    duration: "1 month",
    objectives: ["Assess pump requirements", "Install solar panels and pump", "Document energy savings", "Share photo evidence"],
    instructions: ["Size the solar system.", "Install panels and pump.", "Test irrigation flow.", "Photograph installation."],
    status: "available",
    region: "High solar radiation regions",
  },
];

export const LESSONS: Lesson[] = [
  {
    id: "water-basics",
    title: "Water-Smart Farming Basics",
    category: "Water management",
    cover: "💧",
    objectives: ["Understand crop water needs", "Identify sources of water loss", "Learn basic water-saving techniques"],
    readingTime: "6 min",
    sections: [
      { heading: "Why water efficiency matters", body: "Agriculture uses a large share of freshwater. Small improvements in irrigation timing and method can save significant water while maintaining yield.", example: "Switching from flood to drip irrigation can reduce water use by 30-50% in many crops." },
      { heading: "Reading soil moisture", body: "Soil moisture tells you when to irrigate. Simple methods include the feel-and-appearance test and tensiometers.", example: "If soil crumbles but does not form a ball, it may be time to irrigate." },
      { heading: "Irrigation scheduling", body: "Schedule irrigation based on crop stage, weather and soil type rather than fixed calendars." },
    ],
    quiz: [
      { id: "q1", question: "Which irrigation method generally saves the most water?", options: ["Flood irrigation", "Drip irrigation", "Sprinkler on windy days", "Continuous flooding"], correctIndex: 1, explanation: "Drip irrigation delivers water directly to roots, reducing evaporation and runoff." },
      { id: "q2", question: "What should irrigation scheduling consider?", options: ["Only the day of the week", "Crop stage, weather and soil", "Neighbour's schedule", "Random intervals"], correctIndex: 1, explanation: "Crop stage, weather and soil moisture together determine need." },
    ],
    xpReward: 60,
  },
  {
    id: "soil-health",
    title: "Building Healthy Soil",
    category: "Soil management",
    cover: "🌱",
    objectives: ["Understand soil organic matter", "Learn composting benefits", "Recognise soil degradation signs"],
    readingTime: "7 min",
    sections: [
      { heading: "Soil as a living system", body: "Healthy soil contains organic matter, microbes and balanced nutrients. It stores water and supports roots.", example: "Adding compost increases organic matter and water retention." },
      { heading: "Composting", body: "Composting recycles crop residues and manure into stable organic matter.", example: "A balanced compost heap needs both green (nitrogen) and brown (carbon) materials." },
      { heading: "Avoiding degradation", body: "Over-tillage, monocropping and overuse of chemicals degrade soil structure and biology." },
    ],
    quiz: [
      { id: "q1", question: "What does composting mainly add to soil?", options: ["Only water", "Organic matter and nutrients", "Synthetic chemicals", "Sand"], correctIndex: 1, explanation: "Compost adds organic matter and slow-release nutrients." },
      { id: "q2", question: "Which practice harms soil structure?", options: ["Cover cropping", "Adding compost", " Repeated deep tillage", "Mulching"], correctIndex: 2, explanation: "Repeated deep tillage breaks soil aggregates." },
    ],
    xpReward: 60,
  },
  {
    id: "organic-farming",
    title: "Introduction to Organic Farming",
    category: "Organic farming",
    cover: "🍃",
    objectives: ["Understand organic principles", "Learn natural pest control", "Recognise certification basics"],
    readingTime: "8 min",
    sections: [
      { heading: "Core principles", body: "Organic farming avoids synthetic inputs and focuses on ecological balance, soil health and biodiversity." },
      { heading: "Natural pest control", body: "Botanical extracts, beneficial insects and cultural practices reduce pest pressure.", example: "Neem extract disrupts pest feeding and reproduction." },
      { heading: "Transition period", body: "Converting to organic takes time; soil and ecosystems need seasons to adjust." },
    ],
    quiz: [
      { id: "q1", question: "Organic farming primarily avoids:", options: ["All water use", "Synthetic chemical inputs", "Sunlight", "Crop rotation"], correctIndex: 1, explanation: "Organic systems avoid synthetic fertilisers and pesticides." },
      { id: "q2", question: "A common organic pest control input is:", options: ["Neem extract", "Synthetic insecticide", "Plastic mulch only", "Diesel"], correctIndex: 0, explanation: "Neem extract is widely used as a botanical pesticide." },
    ],
    xpReward: 60,
  },
  {
    id: "crop-rotation",
    title: "Crop Rotation for Resilience",
    category: "Crop rotation",
    cover: "🔄",
    objectives: ["Understand rotation benefits", "Design a simple rotation", "Avoid pest buildup"],
    readingTime: "6 min",
    sections: [
      { heading: "Why rotate crops", body: "Rotating crops breaks pest and disease cycles and balances nutrient use." },
      { heading: "Simple rotation example", body: "Legume → cereal → vegetable → fallow/cover crop.", example: "Beans fix nitrogen for the following maize crop." },
      { heading: "Planning", body: "Consider market, climate and soil when designing rotations." },
    ],
    quiz: [
      { id: "q1", question: "A key benefit of crop rotation is:", options: ["Higher pesticide use", "Breaking pest cycles", " Removing all soil microbes", " Monoculture"], correctIndex: 1, explanation: "Rotation disrupts pest and disease cycles." },
    ],
    xpReward: 50,
  },
  {
    id: "ipm-basics",
    title: "Integrated Pest Management (IPM)",
    category: "Integrated pest management",
    cover: "🐛",
    objectives: ["Understand IPM principles", "Use scouting and thresholds", "Combine control methods"],
    readingTime: "7 min",
    sections: [
      { heading: "IPM approach", body: "IPM combines cultural, biological and chemical tools, using chemicals only when needed." },
      { heading: "Scouting", body: "Regular field scouting identifies pests early and informs decisions." },
      { heading: "Action thresholds", body: "Treat only when pest levels exceed economic thresholds." },
    ],
    quiz: [
      { id: "q1", question: "IPM recommends chemicals:", options: ["Always first", "Only when thresholds are exceeded", "Never", "Daily"], correctIndex: 1, explanation: "IPM uses chemicals as a last resort when thresholds are exceeded." },
    ],
    xpReward: 50,
  },
  {
    id: "climate-smart",
    title: "Climate-Smart Agriculture",
    category: "Climate-smart agriculture",
    cover: "🌍",
    objectives: ["Understand climate risks", "Adapt farming practices", "Build resilience"],
    readingTime: "8 min",
    sections: [
      { heading: "Climate risks", body: "Farmers face droughts, floods and heat. Adaptation reduces risk." },
      { heading: "Adaptation practices", body: "Diversified crops, water harvesting and soil conservation improve resilience." },
      { heading: "Mitigation", body: "Practices like composting and reduced tillage store carbon in soil." },
    ],
    quiz: [
      { id: "q1", question: "Climate-smart agriculture aims to:", options: [" Ignore climate change", " Increase emissions", " Adapt and mitigate while sustaining productivity", " Use more fossil fuels"], correctIndex: 2, explanation: "It aims to adapt, mitigate and sustain productivity." },
    ],
    xpReward: 50,
  },
];

export const LEADERBOARD: LeaderboardEntry[] = [
  { id: "lb1", name: "Amina Diallo", country: "Senegal", avatar: "AD", level: 7, xp: 3120 },
  { id: "lb2", name: "Chen Wei", country: "China", avatar: "CW", level: 6, xp: 2480 },
  { id: "lb3", name: "Maria Santos", country: "Brazil", avatar: "MS", level: 6, xp: 2310 },
  { id: "lb4", name: "John Okafor", country: "Nigeria", avatar: "JO", level: 5, xp: 1890 },
  { id: "lb5", name: "Fatima Al-Hassan", country: "Egypt", avatar: "FA", level: 5, xp: 1720 },
  { id: "lb6", name: "Ramesh Kumar", country: "India", avatar: "RK", level: 3, xp: 420, isCurrent: true },
  { id: "lb7", name: "Elena Popov", country: "Russia", avatar: "EP", level: 4, xp: 1200 },
  { id: "lb8", name: "James Miller", country: "USA", avatar: "JM", level: 4, xp: 1050 },
  { id: "lb9", name: "Priya Sharma", country: "India", avatar: "PS", level: 3, xp: 680 },
  { id: "lb10", name: "Carlos Mendez", country: "Mexico", avatar: "CM", level: 3, xp: 540 },
];

export const WEEKLY_ACTIVITY = [
  { day: "Mon", activities: 2 },
  { day: "Tue", activities: 1 },
  { day: "Wed", activities: 3 },
  { day: "Thu", activities: 2 },
  { day: "Fri", activities: 4 },
  { day: "Sat", activities: 1 },
  { day: "Sun", activities: 2 },
];

export const INITIAL_DEMO_STATE: DemoState = {
  role: "farmer",
  farmer: INITIAL_FARMER,
  challenges: INITIAL_CHALLENGES,
  submissions: [],
  completedLessons: INITIAL_FARMER.completedLessons,
  lessonXpAwarded: INITIAL_FARMER.completedLessons,
};

export const STORAGE_KEY = "agriquest-demo-state-v1";