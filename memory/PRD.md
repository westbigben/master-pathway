# Chess Master Journey — PRD

## Original problem
Build a responsive web + mobile-friendly Chess Tutor App for a motivated 13-year-old moving from novice++ to tournament strength. Must feel like a personal coach — structured, rigorous, inspiring, never childish. Pedagogy priority: tactics → calculation → endgames → strategy → openings (later).

## Users
- **Student (primary)** — 13-year-old learner, serious, wants real skill growth.
- **Parent** — wants visible progress, streaks, accuracy, common mistakes, and an encouragement note.

## User choices (MVP)
- In-browser chess engine (custom JS minimax AI, adjustable depth).
- AI coach via Claude Sonnet 4.5 (Emergent Universal Key).
- JWT email/password auth (parent + student roles).
- ~40 curated seed puzzles covering all motifs + endgames.
- Core flow first: roadmap, daily plan, tactics, lessons, play, parent, coach.

## Architecture
- **Backend:** FastAPI + Motor (MongoDB), uuid string ids, bcrypt + JWT httpOnly cookies.
- **Frontend:** React 19 + Tailwind + shadcn, react-router v7, react-chessboard v5 + chess.js, framer-motion, recharts, sonner toasts, lucide-react icons.
- **AI coach:** emergentintegrations `LlmChat` → Anthropic `claude-sonnet-4-5-20250929`.
- **Design language:** "The Grandmaster's Study" — Cormorant Garamond serif, IBM Plex Sans/Mono, parchment+forest (light) / obsidian+gold (dark).

## Implemented (2026-04-23)
- Auth: register/login/logout/me + parent→student linking with `/api/auth/link-student`.
- Roadmap: 4 stages with milestones and target ratings.
- Tactics trainer: motif filter, hint, retry, next, solution playback, rating deltas + title promotions.
- Lessons: 10 lessons with board demo + key points + complete (+XP).
- Daily plan: adaptive block generation (tactics/endgame/lesson/play/reflect) seeded by user+date.
- Session complete: streak math with previous-day continuity.
- Play vs AI: 5 engine levels (level 1 random, 2-5 alpha-beta minimax + PSTs + top-k noise), new game, resign, move list.
- Post-game analysis via Claude — 6 structured sections.
- Coach chat: real-time Claude conversation with persistent history.
- Parent dashboard: streak, 14-day minutes + bar chart, tactical accuracy, common mistake motifs, lessons/games/XP, encouragement note.
- Tournament prep: 4 drill cards + time management + emotional readiness tips.
- Theme toggle (light/dark), responsive mobile nav, data-testids on every interactive element.

## P0 backlog (next)
- Server-side puzzle solution validation (currently trust-the-client).
- Idempotent test-user seeding on FastAPI startup.
- Rate limit /coach/chat and /coach/analyze-game per user.

## P1 backlog
- Spaced-repetition review queue (puzzle revisits based on success/failure history).
- Notifications/reminders (browser push or email).
- Opening repertoire builder (Stage III+).
- Full Lichess puzzle DB import.
- Replace JS minimax with Stockfish WASM web worker for stronger AI + numerical analysis.
- Weekly parent email digest.

## P2 backlog
- Multi-student parent accounts.
- Friend matches / puzzle battles.
- Badge/achievements gallery visualization.
- PGN upload & external game import.
- Mobile PWA install + offline daily plan.

## Test credentials
See `/app/memory/test_credentials.md`.
