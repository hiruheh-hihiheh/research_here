# AgriQuest

**AgriQuest** is a gamified platform designed to promote sustainable farming practices. It is a college research prototype demonstrating how gamification can encourage farmers to learn about, adopt, and document sustainable agricultural practices.

> **Disclaimer:** This is a frontend-only research prototype. All data is simulated, all statistics are illustrative, and all persistence is browser-local. There is no backend, no real authentication, no real image recognition, and no real agricultural verification.

## Research Purpose

The project investigates how gamification can encourage farmers to learn about and adopt sustainable farming practices. It combines:

1. Educational gamification — interactive lessons, quizzes, points, badges, and experience levels.
2. Real-world farming activities — sustainable challenges, photo evidence submission, and simulated expert review.

## Target Users

- Farmers globally, across different regions, climates, and agricultural practices.
- Research supervisors and reviewers evaluating the gamification concept.

## Farmer Features

- Dashboard with XP, level, sustainability score, and progress.
- Challenge discovery with categories, filters, and search.
- Learning Centre with lessons and quizzes.
- Achievements and badges.
- Leaderboard (simulated).
- Activity submission with image evidence.
- Sustainability reports with illustrative charts.

## Admin Features

- Admin dashboard with simulated participation metrics.
- Submission review with approve/reject.
- Challenge catalogue management (availability only).
- Demo data reset.

## Gamification Workflow

1. Farmer learns through lessons and quizzes.
2. Quiz completion awards demo XP once per lesson.
3. Farmer starts challenges and submits evidence.
4. Admin approves or rejects submissions.
5. Approved activities award XP, update sustainability progress, and unlock badges.
6. Levels and badges update automatically.

## Technology Stack

- Next.js 16 (App Router)
- React 19
- TypeScript (strict)
- Tailwind CSS 4
- Lucide React icons
- Recharts
- Vitest

## Project Architecture

```
app/
  page.tsx                 # Demo entry screen
  farmer/                  # Farmer routes and layouts
  admin/                   # Admin routes and layouts
components/
  ui/                      # Reusable UI primitives
  layout/                  # Farmer and Admin shells
features/
  demo/                    # Types, mock data, context, business logic, tests
lib/
  storage.ts               # localStorage helpers
  utils.ts                 # Utility helpers
```

## Routes

Farmer:
- `/farmer/dashboard`
- `/farmer/challenges`
- `/farmer/learning`
- `/farmer/achievements`
- `/farmer/leaderboard`
- `/farmer/activities`
- `/farmer/reports`

Admin:
- `/admin/dashboard`
- `/admin/submissions`
- `/admin/challenges`

Entry:
- `/`

## Installation

```bash
npm install
```

## Local Development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Test, Lint and Build

```bash
npm test
npm run lint
npm run build
```

## Demo Instructions

1. Open the landing page and choose "Continue as Farmer".
2. Explore the dashboard, challenges, learning, and activities.
3. Start a challenge and submit an activity with an image.
4. Switch to Admin and approve or reject the submission.
5. Return to Farmer to see updated XP, progress, and badges.
6. Use "Reset Demo Data" to restore the original seed state.

## Disclaimer

This is a research demonstration prototype. It does not implement real farmer registration, real authentication, real agricultural verification, real environmental impact calculations, or production data storage. All metrics are illustrative demo data. State is stored in the browser's localStorage and can be reset at any time.