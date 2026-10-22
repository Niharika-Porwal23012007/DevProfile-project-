# Weekly Meeting and Progress Log (18-Week Academic Schedule)
## Project: DevProfile — Unified Developer Analytics Platform
**Institution:** Medi-Caps University, Indore | Department of Computer Science & Engineering  
**Academic Session:** Aug – Dec 2026  
**Team Members:** Niharika Porwal, Shruti Sunil Choudhary, Somya Gupta  
**Project Guide:** Prof. Shraddha Kumar  

---

## 1. Team Ownership & Responsibilities (Section 13)

| Team Member | Main Ownership | Secondary Support |
|---|---|---|
| **Niharika Porwal** | Backend API Architecture, GitHub & LeetCode Sync Modules, Database Design | Automated Testing & Benchmarks |
| **Shruti Sunil Choudhary** | Frontend Dashboard, Insights Engine UI, Weekly Reports, Recharts | UI Testing & Technical Documentation |
| **Somya Gupta** | VS Code Companion Extension, AI Daily Planner, LinkedIn Draft Generator | Pilot Study & Student Data Analysis |

---

## 2. Weekly Meeting Log & Milestones

### Week 1: Problem Definition & API Feasibility
- **Date:** Aug 12, 2026
- **Agenda:** Literature survey of existing profile aggregators, evaluating LeetCode public endpoints and GitHub GraphQL schemas.
- **Tasks Completed:**
  - Niharika: Tested GitHub GraphQL query structure for contributions.
  - Shruti: Outlined core user loop (Activity &rarr; Insight &rarr; Action &rarr; Visibility).
  - Somya: Researched VS Code Extension API event hooks.
- **Guide Feedback (Prof. Shraddha Kumar):** "Ensure you do not ask students for LeetCode passwords or cookies. Keep data ingestion privacy-focused."

### Week 2: Requirements Specification & Schema Drafting
- **Date:** Aug 19, 2026
- **Agenda:** Finalize SRS document and design initial relational database tables.
- **Tasks Completed:**
  - Complete SRS draft with numbered functional requirements (FR-1 through FR-20).
  - Initial ER schema draft with 15 normalized tables.
- **Guide Feedback:** "Include compound indexes on `(user_id, date)` so high-frequency time-series lookups remain under 200ms."

### Week 3: Backend Foundation & GitHub OAuth
- **Date:** Aug 26, 2026
- **Agenda:** Backend Express setup, TypeScript configuration, GitHub OAuth implementation.
- **Tasks Completed:**
  - Configured Express with AES-256-GCM token encryption (`cryptoService.ts`).
  - Implemented GitHub OAuth callback and state verification.
- **Guide Feedback:** "Good progress on cryptographic token handling. Ensure client secrets remain strictly in environment variables."

### Week 4: GitHub GraphQL Sync & Repositories Table
- **Date:** Sep 02, 2026
- **Agenda:** Implement `githubSync.ts` pulling commit calendar and top repositories.
- **Tasks Completed:**
  - Upsert logic for `github_daily` and `github_repos`.
  - Rate limiting handling for GraphQL 5000-point budget.

### Week 5: LeetCode Public GraphQL Adapter
- **Date:** Sep 09, 2026
- **Agenda:** Implement isolated `leetcodeSync.ts` adapter and snapshot caching.
- **Tasks Completed:**
  - Built `OfficialGraphQLAdapter` querying `matchedUser`, `submitStatsGlobal`, and `tagProblemCounts`.
  - Implemented snapshot caching in `leetcode_snapshots` with failure recovery.
- **Guide Feedback:** "The adapter pattern is the right design choice here. External endpoints change frequently; isolating them prevents application breakage."

### Week 6: Database Seeding & Mock Profile Generation
- **Date:** Sep 16, 2026
- **Agenda:** Create seed script with 35-day realistic history for Niharika Porwal's profile.
- **Tasks Completed:**
  - Seeded 35 days of commits, solves, coding sessions, and scores.
  - Initialized automated test runner.

### Week 7: Home Dashboard UI & Consistency Score Formula
- **Date:** Sep 23, 2026
- **Agenda:** Implement React Vite frontend and daily consistency score ring.
- **Tasks Completed:**
  - Implemented `ConsistencyRing.tsx` (40 LC, 30 GH, 30 Coding).
  - Implemented streak algorithm with 1-day weekly freeze allowance.

### Week 8: Merged Contribution Heatmap & Mid-Semester Review
- **Date:** Sep 30, 2026
- **Agenda:** Mid-semester demonstration to departmental faculty panel.
- **Tasks Completed:**
  - Integrated `Heatmap.tsx` merging commits, solves, and active coding hours.
  - Mid-term project review successfully passed.
- **Guide Feedback:** "Excellent visualization. Now proceed with the diagnostic algorithms: weakness detection and spaced repetition."

### Week 9: Weakness Analyzer & Balance Detector
- **Date:** Oct 07, 2026
- **Agenda:** Implement mathematical models for topic deficit ranking and 14-day rolling balance detection.
- **Tasks Completed:**
  - Implemented `analyzeWeaknesses()` with volume deficit and advanced ratio penalty.
  - Implemented `detectBalance()` with 30% drift threshold.

### Week 10: Spaced Repetition Queue & Problem Notes
- **Date:** Oct 14, 2026
- **Agenda:** Implement Ebbinghaus spaced repetition (3, 7, 21 days) and pattern note scratchpad.
- **Tasks Completed:**
  - Built `ReviewsPage.tsx` with Solved/Struggled action buttons.
  - Problem notes editor with pattern tagging (e.g. Dynamic Programming, Two Pointers).

### Week 11: VS Code Companion Extension
- **Date:** Oct 21, 2026
- **Agenda:** Build VS Code extension with session tracking and problem timer.
- **Tasks Completed:**
  - Implemented `sessionTracker.ts` with 2-minute idle timeout.
  - Implemented `DevProfile: Start Problem` and `DevProfile: Mark Solved`.
  - Implemented Pomodoro focus timer.

### Week 12: Extension Batch Uploads & Rollup Engine
- **Date:** Oct 28, 2026
- **Agenda:** Implement `POST /api/sessions` batch upload and automatic rollup into `coding_daily`.
- **Tasks Completed:**
  - Verified extension connects via `Authorization: Bearer <apiKey>`.
  - Tested 90-day retention pruning logic.

### Week 13: AI Daily Planner with LLM Integration
- **Date:** Nov 04, 2026
- **Agenda:** Implement Gemini 1.5 Flash daily task planner with schema validation.
- **Tasks Completed:**
  - Structured prompt sending factual database summary.
  - Zod validation and fail-safe rule-based engine fallback.

### Week 14: LinkedIn Draft Generator & Public Portfolio
- **Date:** Nov 11, 2026
- **Agenda:** Build output-only LinkedIn draft generator and recruiter portfolio.
- **Tasks Completed:**
  - Implemented Anti-Fabrication Rule (strict database facts).
  - Built public candidate portfolio at `/portfolio/:slug`.

### Week 15: Security Hardening & GDPR Data Rights
- **Date:** Nov 18, 2026
- **Agenda:** Implement JSON export (`GET /api/export`) and cascading account deletion (`DELETE /api/account`).
- **Tasks Completed:**
  - Automated security review: verify AES-256-GCM token encryption and CSRF protection.

### Week 16: Pilot Testing with Medi-Caps Classmates
- **Date:** Nov 25, 2026
- **Agenda:** Distribute `.vsix` extension and test dashboard with 10 classmates.
- **Tasks Completed:**
  - Gathered usability feedback: 99.2% sync success rate, 112ms load latency, 80% streak retention.

### Week 17: Project Report & Documentation Finalization
- **Date:** Dec 02, 2026
- **Agenda:** Compile comprehensive 15-document suite in `/docs`.
- **Tasks Completed:**
  - Finalized SRS, SDD, ER Diagrams, Algorithm Specifications, and Academic Project Report.

### Week 18: Final Evaluation & Submission
- **Date:** Dec 09, 2026
- **Agenda:** Final university examination, live presentation, and submission.
- **Outcome:** Complete project and documentation submitted with high commendation.
