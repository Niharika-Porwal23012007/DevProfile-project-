# DevProfile — Formally Verified Use Case Specification

> **Status: FINAL — Verified against implemented source code**  
> All 20 use cases below conform strictly to the formal **Use Case Specification Standard** (Name of Use Case, Use Case ID, Actor, Pre Condition, Primary Flow of Events, Alternate Flow of Events, Post Condition, and Use Case Termination). Every use case is traced to implemented backend Express routes, VS Code extension commands, SQLite tables, and frontend React API client calls.

---

## 1. System Actors

| Actor ID | Actor Name | Role & Responsibility |
|:---------|:-----------|:----------------------|
| **A1** | **User (Engineering Student / Developer)** | Primary human user; logs in, connects platform profiles, views unified dashboard, solves reviews, tracks daily plans, and generates verified drafts |
| **A2** | **Recruiter / Peer** | External visitor; accesses developer's public portfolio (`/portfolio/:slug`) without login to evaluate verified skills and commit activity |
| **A3** | **VS Code Extension** | Automated IDE client; tracks active coding sessions, runs Pomodoro focus timer, and records problem solve timers |
| **A4** | **Cron Scheduler** | Automated system process; triggers nightly sync at 00:05 AM, calculates daily consistency scores, and prunes old session logs |
| **A5** | **GitHub OAuth Provider** | External authorization server; performs OAuth 2.0 user verification and access token issuance |

---

## 2. Verification Methodology & Codebase Traceability

Each use case specification is verified against the actual implemented source code:

| Component / Layer | Source File Path | Verified Responsibilities |
|:------------------|:-----------------|:--------------------------|
| Authentication & Profiles | `backend/src/routes/authRoutes.ts` | Multi-profile login, OAuth state validation, JWT generation, API key management |
| Data Synchronization | `backend/src/sync/githubSync.ts`, `leetcodeSync.ts`, `syncRoutes.ts` | Live GraphQL/REST data fetching, snapshot storage, 2-min rate limiting |
| Dashboard & Analytics | `backend/src/routes/dashboardRoutes.ts`, `analysisService.ts` | Merged heatmap aggregation, consistency score (0–100), streak freeze rules |
| Weakness & Readiness Engine | `backend/src/services/analysisService.ts` | Algorithmic deficit formula, practice vs. build balance (±25%), interview readiness |
| AI Action Planner | `backend/src/routes/plannerRoutes.ts` | Contextual daily task generation (deficits, due reviews, stale repos), interactive toggles |
| Spaced Repetition Queue | `backend/src/routes/reviewRoutes.ts` | Ebbinghaus review intervals (3→7→21→30 days), problem pattern notes |
| LinkedIn Post Synthesizer | `backend/src/routes/draftRoutes.ts`, `draftService.ts` | Anti-fabrication achievement posts derived exclusively from verified database rows |
| Extension Telemetry | `extension/src/extension.ts`, `backend/src/routes/sessionRoutes.ts` | Background keystroke tracking, solve duration timers, struggle detection (>40m) |
| User Rights & Portfolio | `backend/src/routes/portfolioRoutes.ts`, `userRoutes.ts` | Public slug resolution, privacy toggle, full JSON data export, cascading account deletion |
| Background Automation | `backend/src/cron/scheduler.ts` | 00:05 AM automated sync, yesterday's score calculation, 90-day session pruning |

---

## 3. Formal Use Case Specifications (UC-01 through UC-20)

---

### UC-01: Universal Login and Multi-Profile Registration

| Field | Specification |
|:------|:--------------|
| **Name of Use Case** | Universal Login and Multi-Profile Registration |
| **Use Case ID** | UC1 |
| **Actor** | User (Engineering Student / Developer) |
| **Pre Condition** | Application is launched and network connection to backend server is available. |
| **Primary Flow of Events** | 1. User opens the DevProfile application landing page.<br>2. User enters display name, email, GitHub username, and/or LeetCode username.<br>3. User submits the registration/login form.<br>4. System validates input and checks database for an existing user matching the email or handles.<br>5. System creates a new user record with unique UUID, generates API key hash, and issues signed JWT session token.<br>6. System initializes default goals (2 LeetCode solves/day, 3 commits/day, 60 coding min/day) and seeds 30-day baseline activity.<br>7. System triggers background multi-platform sync for connected handles.<br>8. System stores token in browser localStorage and redirects user to main dashboard. |
| **Alternate Flow of Events** | **Alternate Flow 1: Existing developer logs in**<br>1a. System detects matching email or GitHub handle in SQLite database.<br>1b. System updates user profile with any newly provided platform handles.<br>1c. System issues a fresh JWT session token and redirects directly to dashboard.<br><br>**Alternate Flow 2: Incomplete identifier submitted**<br>2a. User submits form without providing at least an email, GitHub username, or LeetCode handle.<br>2b. System returns HTTP 400 Bad Request error prompting user to supply at least one valid identifier.<br><br>**Alternate Flow 3: External platform sync timeout during registration**<br>3a. Live GitHub or LeetCode API is unreachable during initial registration.<br>3b. System catches network timeout, seeds baseline data buffer so dashboard loads instantly, and schedules background sync. |
| **Post Condition** | User account is authenticated with JWT; default goals and activity baselines are stored; dashboard view is accessible. |
| **Use Case Termination** | Ends when authentication succeeds and the user is redirected to the main dashboard. |
| **Technical Traceability** | **Endpoints:** `POST /api/auth/register-or-login`, `GET /api/auth/profiles`<br>**Frontend Call:** `api.registerOrLogin()`, `api.getProfiles()`<br>**Source Code:** `backend/src/routes/authRoutes.ts` (lines 36–160) |

---

### UC-02: GitHub OAuth Login

| Field | Specification |
|:------|:--------------|
| **Name of Use Case** | GitHub OAuth Authentication |
| **Use Case ID** | UC2 |
| **Actor** | User (Engineering Student / Developer), GitHub OAuth Provider |
| **Pre Condition** | Backend server is configured with valid `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. |
| **Primary Flow of Events** | 1. User clicks "Sign in with GitHub" on the authentication screen.<br>2. System generates a cryptographically secure random state parameter with 10-minute TTL to defend against CSRF attacks.<br>3. System redirects user's browser to GitHub OAuth authorization portal requesting `read:user` and `repo` scopes.<br>4. User grants permission on GitHub.<br>5. GitHub redirects user to `/api/auth/github/callback` with temporary authorization code and state token.<br>6. System validates state token against in-memory pending state store.<br>7. System exchanges authorization code for a GitHub access token.<br>8. System fetches user profile from GitHub API (`login`, `id`, `avatar_url`, `email`).<br>9. System creates or updates user account and encrypts GitHub access token with AES-256-GCM.<br>10. System issues JWT session token and redirects user to dashboard callback route. |
| **Alternate Flow of Events** | **Alternate Flow 1: User denies OAuth authorization**<br>1a. User clicks cancel on GitHub consent page.<br>1b. GitHub redirects back with `error=access_denied`.<br>1c. System logs authorization cancellation and redirects user to login screen with notice.<br><br>**Alternate Flow 2: State token mismatch (CSRF defense)**<br>2a. Callback contains invalid or expired state token.<br>2b. System aborts flow and returns HTTP 400 "Invalid OAuth State Token" security error.<br><br>**Alternate Flow 3: Token exchange failure**<br>3a. GitHub token exchange times out or fails.<br>3b. System displays an error toast prompting user to retry or log in with username. |
| **Post Condition** | User is authenticated; encrypted GitHub token is securely stored in SQLite; session JWT is issued. |
| **Use Case Termination** | Ends when OAuth handshake completes and dashboard is rendered. |
| **Technical Traceability** | **Endpoints:** `GET /api/auth/github`, `GET /api/auth/github/callback`<br>**Frontend Call:** `api.getGithubAuthUrl()`<br>**Source Code:** `backend/src/routes/authRoutes.ts` (lines 166–265) |

---

### UC-03: Platform Connection (GitHub & LeetCode)

| Field | Specification |
|:------|:--------------|
| **Name of Use Case** | Platform Connection (GitHub & LeetCode) |
| **Use Case ID** | UC3 |
| **Actor** | User (Engineering Student / Developer) |
| **Pre Condition** | User is authenticated with a valid JWT token. |
| **Primary Flow of Events** | 1. User navigates to Settings or Onboarding page.<br>2. User enters public GitHub username or repository URL and/or LeetCode profile URL.<br>3. User clicks "Connect Platform".<br>4. System sanitizes input (extracts pure usernames from full URLs or `@` handles).<br>5. System updates user record in `users` table with sanitized handles.<br>6. System triggers immediate live validation pull via `GitHubSync.syncUser()` and `LeetCodeSync.syncUser()`.<br>7. System stores ingested repositories and problem solve statistics.<br>8. System displays connection success toast and updates platform status indicators. |
| **Alternate Flow of Events** | **Alternate Flow 1: Platform username does not exist**<br>1a. GitHub REST API returns 404 Not Found or LeetCode GraphQL returns null user.<br>1b. System flags an error notice indicating the profile does not exist or is set to private.<br>1c. System preserves previously connected valid handles.<br><br>**Alternate Flow 2: External API rate limit reached**<br>2a. External platform responds with HTTP 429 Too Many Requests.<br>2b. System queues sync for the next background cycle and alerts user to wait before re-syncing. |
| **Post Condition** | Platform handles are bound to user profile; initial snapshots and repositories are populated. |
| **Use Case Termination** | Ends when connection confirmation is displayed and platform badges turn active. |
| **Technical Traceability** | **Endpoints:** `POST /api/connect/github`, `POST /api/connect/leetcode`<br>**Frontend Call:** `api.connectGitHub()`, `api.connectLeetCode()`<br>**Source Code:** `backend/src/routes/syncRoutes.ts` (lines 19–63) |

---

### UC-04: Manual Data Sync

| Field | Specification |
|:------|:--------------|
| **Name of Use Case** | Manual Data Synchronization |
| **Use Case ID** | UC4 |
| **Actor** | User (Engineering Student / Developer) |
| **Pre Condition** | User is authenticated; at least one platform (GitHub or LeetCode) is connected. |
| **Primary Flow of Events** | 1. User clicks the "Sync Now" button on the dashboard.<br>2. System checks timestamp of user's last manual sync to enforce 2-minute cooldown rule.<br>3. If cooldown has elapsed, system queries GitHub REST API for recent commits and updated repositories.<br>4. System queries LeetCode GraphQL API for recent accepted submissions, total solves, and topic tag counts.<br>5. System upserts fresh data into `github_daily`, `github_repos`, `leetcode_snapshots`, and `leetcode_solved_problems`.<br>6. System recalculates today's consistency score, streak status, and goal rings.<br>7. System returns refreshed data payload and displays updated sync timestamp. |
| **Alternate Flow of Events** | **Alternate Flow 1: Sync triggered during active cooldown (<2 minutes)**<br>1a. System calculates that less than 120 seconds have elapsed since last sync.<br>1b. System returns HTTP 429 error specifying remaining cooldown seconds.<br>1c. UI displays cooldown banner with countdown timer.<br><br>**Alternate Flow 2: One external platform fails while other succeeds**<br>2a. LeetCode GraphQL times out while GitHub REST succeeds.<br>2b. System persists successful GitHub commits, logs LeetCode failure in `sync_logs`, and recalculates score using available data without fabricating missing values. |
| **Post Condition** | Activity tables updated to latest external state; daily consistency score recalculated; sync log recorded. |
| **Use Case Termination** | Ends when updated statistics, heatmap, and timestamp are rendered. |
| **Technical Traceability** | **Endpoints:** `POST /api/sync`<br>**Frontend Call:** `api.syncNow()`<br>**Source Code:** `backend/src/routes/syncRoutes.ts` (lines 66–139) |

---

### UC-05: Review Unified Dashboard and Heatmap

| Field | Specification |
|:------|:--------------|
| **Name of Use Case** | Review Unified Dashboard |
| **Use Case ID** | UC5 |
| **Actor** | User (Engineering Student / Developer) |
| **Pre Condition** | User has accessed DevProfile (UC1). At least one activity source is connected or saved activity records are available. |
| **Primary Flow of Events** | 1. User opens the DevProfile dashboard.<br>2. System retrieves the latest available GitHub, LeetCode, and VS Code activity records and saved snapshots.<br>3. System combines available records into a unified dashboard.<br>4. System displays activity trends, heatmap or equivalent visualisation, streaks, consistency score, and goal progress where data is available.<br>5. User reviews the activity and progress indicators. |
| **Alternate Flow of Events** | **Alternate Flow 1: No account or source is connected**<br>1a. System displays instructions for connecting an activity source; unavailable metrics are not fabricated.<br><br>**Alternate Flow 2: Synchronisation fails**<br>2a. System retains previously saved snapshots where available.<br>2b. System displays an error or outdated-data status and shows the last available records.<br><br>**Alternate Flow 3: Some data is missing**<br>3a. System displays only metrics supported by the available data and marks unavailable metrics clearly. |
| **Post Condition** | The user can review consolidated activity and progress based on the latest available data. |
| **Use Case Termination** | Ends when the dashboard and its available progress indicators are displayed. |
| **Technical Traceability** | **Endpoints:** `GET /api/dashboard?range=` (7d, 30d, 90d filters)<br>**Frontend Call:** `api.getDashboard(range)`<br>**Source Code:** `backend/src/routes/dashboardRoutes.ts` (lines 14–153) |

---

### UC-06: Goal Setting and Progress Tracking

| Field | Specification |
|:------|:--------------|
| **Name of Use Case** | Goal Setting and Progress Tracking |
| **Use Case ID** | UC6 |
| **Actor** | User (Engineering Student / Developer) |
| **Pre Condition** | User is authenticated. |
| **Primary Flow of Events** | 1. User views current targets on dashboard goal rings or navigates to Settings.<br>2. User modifies target values for daily LeetCode solves, daily GitHub commits, or daily coding minutes.<br>3. User clicks "Save Targets".<br>4. System validates target numbers (must be non-negative integers).<br>5. System upserts records in `goals` table (`type`, `target_value`, `period`).<br>6. System recalculates today's goal completion percentages and updates circular SVG progress rings.<br>7. System displays a confirmation toast. |
| **Alternate Flow of Events** | **Alternate Flow 1: Invalid target value submitted**<br>1a. User inputs negative values or non-numeric characters.<br>1b. System rejects input, displays validation message, and retains existing target values.<br><br>**Alternate Flow 2: Default goals initialization**<br>2a. User has not configured custom goals.<br>2b. System automatically applies system defaults: 2 LeetCode solves, 3 commits, and 60 coding minutes daily. |
| **Post Condition** | Target goals are updated in database and reflected across all dashboard progress rings. |
| **Use Case Termination** | Ends when updated goal progress rings are rendered. |
| **Technical Traceability** | **Endpoints:** `GET /api/goals`, `POST /api/goals`<br>**Frontend Call:** `api.getGoals()`, `api.updateGoal()`<br>**Source Code:** `backend/src/routes/dashboardRoutes.ts` (lines 267–287) |

---

### UC-07: Weakness Diagnostic Engine

| Field | Specification |
|:------|:--------------|
| **Name of Use Case** | Weakness Diagnostic Engine |
| **Use Case ID** | UC7 |
| **Actor** | User (Engineering Student / Developer) |
| **Pre Condition** | User is authenticated and has at least one synchronized LeetCode snapshot or solved problem set. |
| **Primary Flow of Events** | 1. User navigates to the Insights page.<br>2. System queries database for user's topic counts, solved problems, solve durations, and spaced repetition review records.<br>3. System evaluates topic mastery using the multi-factor weakness formula: WeaknessScore = 1.5 × VolumeDeficit + 10 × (1 - AdvancedRatio) + StrugglePenalty.<br>4. System ranks all topics from highest deficit to highest mastery.<br>5. System isolates the top 3 critical weakness areas (e.g., Dynamic Programming, Trees, Graphs).<br>6. System renders diagnostic cards showing topic depth ratios, volume vs benchmark, and recommended drill strategies.<br>7. User reviews weakness diagnoses to guide daily problem practice. |
| **Alternate Flow of Events** | **Alternate Flow 1: Low problem volume history (<5 total solves)**<br>1a. System detects insufficient data to establish statistically robust topic averages.<br>1b. System displays an informational notice advising user to solve more problems to unlock high-confidence diagnostics.<br><br>**Alternate Flow 2: Struggle signals detected from VS Code**<br>2a. System identifies problems where solve duration exceeded 40 minutes or user flagged "Struggled".<br>2b. System applies struggle penalty weight (+2.5 per struggle event) to elevate those related topics in the weakness queue. |
| **Post Condition** | Weakness diagnostic report is generated and displayed with actionable drill recommendations. |
| **Use Case Termination** | Ends when weakness diagnostic cards and drill recommendations are displayed. |
| **Technical Traceability** | **Endpoints:** `GET /api/insights` (weaknesses payload)<br>**Frontend Call:** `api.getInsights()`<br>**Source Code:** `backend/src/services/analysisService.ts` (lines 200–360), `dashboardRoutes.ts` |

---

### UC-08: Practice vs. Build Balance Detection and Interview Readiness

| Field | Specification |
|:------|:--------------|
| **Name of Use Case** | Practice vs. Build Balance Detection and Interview Readiness |
| **Use Case ID** | UC8 |
| **Actor** | User (Engineering Student / Developer) |
| **Pre Condition** | User is authenticated and has activity recorded over a recent time window. |
| **Primary Flow of Events** | 1. User navigates to the Balance & Readiness section of Insights page.<br>2. System queries the last 42 days of daily commit counts and LeetCode problem solve counts.<br>3. System compares the recent 14-day ratio against the 28-day baseline ratio.<br>4. System evaluates drift against ±25% threshold to classify status: "Balanced", "Practice-Heavy (DSA Drift)", or "Build-Heavy (Project Drift)".<br>5. System calculates composite Interview Readiness Score (0–100) across 4 weighted pillars: Problem Volume & Depth (30%), Topic Breadth (25%), Consistency & Streak Health (25%), and Project Velocity & GitHub Activity (20%).<br>6. System analyzes coding time by hour of the day to identify peak focus windows.<br>7. System displays balance status badge, readiness score gauge, pillar breakdown, and optimal focus hours. |
| **Alternate Flow of Events** | **Alternate Flow 1: Unbalanced activity in single domain**<br>1a. User has only LeetCode activity and zero GitHub commits (or vice versa).<br>1b. System flags an extreme balance advisory recommending immediate rebalancing into project building.<br><br>**Alternate Flow 2: New account baseline (<14 days)**<br>2a. Account history is shorter than 14 days.<br>2b. System computes balance over available days and marks baseline confidence as preliminary. |
| **Post Condition** | Balance classification and interview readiness score are computed and displayed. |
| **Use Case Termination** | Ends when balance indicators and readiness gauge are rendered. |
| **Technical Traceability** | **Endpoints:** `GET /api/insights` (balance, interviewReadiness, bestTimes payloads)<br>**Frontend Call:** `api.getInsights()`<br>**Source Code:** `backend/src/services/analysisService.ts` (lines 60–190), `dashboardRoutes.ts` |

---

### UC-09: AI Daily Action Planner

| Field | Specification |
|:------|:--------------|
| **Name of Use Case** | AI Daily Action Planner |
| **Use Case ID** | UC9 |
| **Actor** | User (Engineering Student / Developer) |
| **Pre Condition** | User is authenticated. |
| **Primary Flow of Events** | 1. User navigates to the Daily Planner page.<br>2. System checks if a cached plan for today's date exists in `plans` table.<br>3. If cached, system retrieves plan JSON and task completion states (`followed_json`).<br>4. If not cached, system gathers contextual intelligence: top weak topics from Diagnostic Engine (UC-07), spaced repetition reviews due today (UC-10), repositories with highest days-since-last-commit, and active streak status.<br>5. System generates a 3-tier actionable daily schedule: Priority 1 (DSA drill targeting weakest topic), Priority 2 (due spaced repetition review), and Priority 3 (project building task for stale repository).<br>6. System saves plan to SQLite and displays task checklist.<br>7. User clicks a checkbox to toggle a task as completed.<br>8. System persists updated completion status immediately. |
| **Alternate Flow of Events** | **Alternate Flow 1: User forces plan regeneration**<br>1a. User clicks the "Refresh Plan" button.<br>1b. System recalculates fresh recommendations from current database metrics and overwrites today's cached plan.<br><br>**Alternate Flow 2: No weak topics or stale repositories identified**<br>2a. User has solved problems uniformly and committed recently to all repos.<br>2b. System supplies general maintenance tasks and streak preservation objectives. |
| **Post Condition** | Action plan is generated, persisted in SQLite, and interactive task checklist is available. |
| **Use Case Termination** | Ends when daily plan is displayed and task toggle interactions are recorded. |
| **Technical Traceability** | **Endpoints:** `GET /api/plan/today`, `POST /api/plan/task/:index/toggle`<br>**Frontend Call:** `api.getDailyPlan()`, `api.togglePlanTask()`<br>**Source Code:** `backend/src/routes/plannerRoutes.ts` (lines 14–129), `plannerService.ts` |

---

### UC-10: Spaced Repetition Review Queue

| Field | Specification |
|:------|:--------------|
| **Name of Use Case** | Spaced Repetition Review Queue |
| **Use Case ID** | UC10 |
| **Actor** | User (Engineering Student / Developer), VS Code Extension |
| **Pre Condition** | User is authenticated; at least one problem was flagged as struggled or scheduled for review. |
| **Primary Flow of Events** | 1. User navigates to the Reviews page.<br>2. System queries `reviews` table for items where `due_date <= today` and `done_at IS NULL`.<br>3. System displays queue of problems due for review today alongside upcoming pipeline reviews.<br>4. User re-solves a due problem and clicks "Complete Review".<br>5. User indicates result: "Passed" or "Failed".<br>6. System records `done_at = datetime('now')`.<br>7. If Passed, system advances interval (3 → 7 → 21 → 30 days) and schedules next review date.<br>8. If Failed, system resets interval to 3 days and schedules a new review.<br>9. System updates user retention statistics and removes problem from today's due list. |
| **Alternate Flow of Events** | **Alternate Flow 1: Automatic scheduling from VS Code extension**<br>1a. Developer marks a problem as "Struggled" or exceeds 40 minutes solve time in VS Code.<br>1b. Extension transmits solve report to `/api/problem-times`.<br>1c. System automatically enqueues problem into `reviews` with initial 3-day interval.<br><br>**Alternate Flow 2: User adds personal notes and pattern tags**<br>2a. User clicks "Add Notes" on a review card.<br>2b. User writes reflection notes and tags algorithmic patterns (e.g. "Sliding Window", "Monotonic Stack").<br>2c. System saves notes to `problem_notes` table for future review.<br><br>**Alternate Flow 3: No reviews due today**<br>3a. Review queue for today is empty.<br>3b. System displays a "Retention on Track" congratulatory card showing upcoming scheduled reviews. |
| **Post Condition** | Review attempt is logged; next interval scheduled or reset; retention rate updated. |
| **Use Case Termination** | Ends when updated review queue is rendered. |
| **Technical Traceability** | **Endpoints:** `GET /api/reviews/today`, `POST /api/reviews/:id/done`, `GET /api/notes/:id`, `POST /api/notes/:id`<br>**Frontend Call:** `api.getTodayReviews()`, `api.completeReview()`, `api.saveProblemNote()`<br>**Source Code:** `backend/src/routes/reviewRoutes.ts` (lines 14–123) |

---

### UC-11: Anti-Fabrication LinkedIn Draft Generator

| Field | Specification |
|:------|:--------------|
| **Name of Use Case** | Anti-Fabrication LinkedIn Draft Generator |
| **Use Case ID** | UC11 |
| **Actor** | User (Engineering Student / Developer) |
| **Pre Condition** | User is authenticated and has verifiable activity records in the database. |
| **Primary Flow of Events** | 1. User navigates to the LinkedIn Drafts page.<br>2. User selects post type: "Weekly Achievement Recap" or "Project Milestone".<br>3. User clicks "Generate Draft".<br>4. System fetches verified activity metrics from database (solves count, commits sum, hours, streak, repo languages).<br>5. System validates anti-fabrication rules: ensures generated text contains only true metrics and disallows simulated claims.<br>6. System structures a clean professional post draft formatted with markdown bullets and hashtags.<br>7. System saves draft in `generated_posts` and displays it in the editor.<br>8. User reviews text, clicks "Copy to Clipboard", and shares to LinkedIn.<br>9. User clicks "Mark as Posted" to log publication status. |
| **Alternate Flow of Events** | **Alternate Flow 1: Insufficient verified activity for weekly post**<br>1a. User has zero commits and zero solves in the past 7 days.<br>1b. System notifies user that an authentic recap requires at least one verified activity event.<br><br>**Alternate Flow 2: Weekly Progress Report export**<br>2a. User selects "Weekly Report" view.<br>2b. System returns structured audit summary of the week's output. |
| **Post Condition** | Verified post draft is generated, saved in database, and publication status updated. |
| **Use Case Termination** | Ends when draft is copied or marked as posted. |
| **Technical Traceability** | **Endpoints:** `POST /api/drafts`, `POST /api/drafts/:id/mark-posted`, `GET /api/report/weekly`<br>**Frontend Call:** `api.generateDraft()`, `api.markDraftPosted()`, `api.getWeeklyReport()`<br>**Source Code:** `backend/src/routes/draftRoutes.ts` (lines 15–186), `draftService.ts` |

---

### UC-12: VS Code Automatic Session Tracking

| Field | Specification |
|:------|:--------------|
| **Name of Use Case** | VS Code Automatic Session Tracking |
| **Use Case ID** | UC12 |
| **Actor** | VS Code Extension |
| **Pre Condition** | DevProfile VS Code extension is installed and configured with a valid API key. |
| **Primary Flow of Events** | 1. Developer opens a workspace and edits code in VS Code.<br>2. Extension listens to active editor events (`onDidChangeTextDocument`, `onDidSaveTextDocument`, focus changes).<br>3. Extension batches coding time, detecting programming language, active file name, project folder, and git repository URL.<br>4. Extension accumulates active typing duration (ignoring idle periods >2 minutes).<br>5. Extension flushes session batches periodically to backend via `POST /api/sessions` with API key authorization.<br>6. Backend validates API key hash, inserts raw session records into `coding_sessions`, and rolls up daily totals into `coding_daily`. |
| **Alternate Flow of Events** | **Alternate Flow 1: Network connectivity lost**<br>1a. Extension cannot reach backend server.<br>1b. Extension retains session buffer in local extension storage and retries on next flush cycle.<br><br>**Alternate Flow 2: Invalid or revoked API key**<br>2a. Backend returns HTTP 401 Unauthorized.<br>2b. Extension displays a status bar warning prompting developer to update their API key in Settings.<br><br>**Alternate Flow 3: Developer pauses tracking**<br>3a. Developer runs command `DevProfile: Pause Session Tracking`.<br>3b. Extension stops telemetry accumulation until manually resumed. |
| **Post Condition** | Coding session records are stored; `coding_daily` table is updated with language and project roll-ups. |
| **Use Case Termination** | Ends when session batch is successfully acknowledged by the backend. |
| **Technical Traceability** | **Endpoints:** `POST /api/sessions`<br>**Frontend Call:** Direct extension HTTP client<br>**Source Code:** `backend/src/routes/sessionRoutes.ts` (lines 13–92), `extension/src/extension.ts` |

---

### UC-13: VS Code Problem Solve Timer

| Field | Specification |
|:------|:--------------|
| **Name of Use Case** | VS Code Problem Solve Timer |
| **Use Case ID** | UC13 |
| **Actor** | User (Engineering Student / Developer), VS Code Extension |
| **Pre Condition** | Extension is active and developer is solving a problem in VS Code. |
| **Primary Flow of Events** | 1. Developer triggers command `DevProfile: Start Problem` from the VS Code command palette.<br>2. Developer enters the LeetCode problem slug or title.<br>3. Extension begins stopwatch timer and displays running solve time in the VS Code status bar.<br>4. When finished, developer runs command `DevProfile: Mark Solved`.<br>5. Extension prompts developer to select perceived difficulty: "Easy", "Medium", "Hard", or "Struggled".<br>6. Extension records final solve duration in seconds.<br>7. Extension transmits solve report to backend `POST /api/problem-times`.<br>8. Backend stores record in `problem_times`.<br>9. If difficulty was marked "Struggled" or solve duration exceeded 2400 seconds (40 min), backend automatically invokes Spaced Repetition Queue (UC-10). |
| **Alternate Flow of Events** | **Alternate Flow 1: Developer cancels timer**<br>1a. Developer aborts solve without saving.<br>1b. Extension resets timer without posting telemetry.<br><br>**Alternate Flow 2: Developer solves problem smoothly**<br>2a. Solve time is under 40 minutes and developer selects "Easy" or "Medium".<br>2b. Backend logs problem time without scheduling an urgent struggle review. |
| **Post Condition** | Problem solve duration and difficulty feeling are stored; struggle flags trigger spaced repetition. |
| **Use Case Termination** | Ends when solve metrics are transmitted and confirmed by status bar notification. |
| **Technical Traceability** | **Endpoints:** `POST /api/problem-times`<br>**Frontend Call:** Direct extension HTTP client<br>**Source Code:** `backend/src/routes/sessionRoutes.ts` (lines 98–133), `extension/src/extension.ts` |

---

### UC-14: VS Code Pomodoro Timer

| Field | Specification |
|:------|:--------------|
| **Name of Use Case** | VS Code Pomodoro Focus Timer |
| **Use Case ID** | UC14 |
| **Actor** | User (Engineering Student / Developer), VS Code Extension |
| **Pre Condition** | DevProfile extension is loaded in VS Code. |
| **Primary Flow of Events** | 1. Developer runs command `DevProfile: Toggle Pomodoro` from status bar or command palette.<br>2. Extension initializes a 25-minute focus countdown timer.<br>3. Extension updates the VS Code status bar every second with remaining time `[🍅 MM:SS]`.<br>4. When 25 minutes elapse, extension triggers a system notification chime prompting developer to take a 5-minute break.<br>5. Extension flushes accrued focus duration into the active coding session buffer. |
| **Alternate Flow of Events** | **Alternate Flow 1: Developer stops timer early**<br>1a. Developer toggles Pomodoro command while timer is running.<br>1b. Extension cancels countdown, flushes elapsed minutes, and resets status bar.<br><br>**Alternate Flow 2: Break timer completes**<br>2a. 5-minute break expires.<br>2b. Extension notifies developer to start next focus interval. |
| **Post Condition** | Focus interval completed; status bar reset; focus minutes attributed to active coding session. |
| **Use Case Termination** | Ends when the 25-minute focus block finishes or is manually cancelled. |
| **Technical Traceability** | **Endpoints:** Client-side extension command (`devprofile.togglePomodoro`)<br>**Source Code:** `extension/src/extension.ts` (line 64), `extension/src/pomodoro.ts` |

---

### UC-15: Verified Public Portfolio

| Field | Specification |
|:------|:--------------|
| **Name of Use Case** | Verified Public Portfolio Access |
| **Use Case ID** | UC15 |
| **Actor** | Recruiter / Peer (Public Visitor) |
| **Pre Condition** | Developer account exists and has set portfolio visibility to Public (`is_public = 1`). |
| **Primary Flow of Events** | 1. Recruiter or peer opens public URL `/portfolio/:publicSlug` in their web browser.<br>2. System receives request without requiring an authentication token.<br>3. System looks up developer by `public_slug` and checks `is_public == 1`.<br>4. System compiles verified portfolio package: real developer name, linked platform handles, total LeetCode problems solved with Easy/Medium/Hard breakdown, total GitHub commits, active repositories, star counts, coding hours, active streak, activity heatmap, and verified algorithmic skill badges.<br>5. System renders read-only public portfolio page.<br>6. Recruiter inspects authentic proof of work. |
| **Alternate Flow of Events** | **Alternate Flow 1: Developer set portfolio to Private**<br>1a. User profile has `is_public = 0`.<br>1b. System returns HTTP 404 with message: "This developer profile is currently private."<br><br>**Alternate Flow 2: Invalid or non-existent slug**<br>2a. Slug does not match any registered developer.<br>2b. System returns 404 Profile Not Found. |
| **Post Condition** | Verified proof-of-work portfolio is displayed to visitor without granting access to private credentials. |
| **Use Case Termination** | Ends when public portfolio page finishes loading. |
| **Technical Traceability** | **Endpoints:** `GET /api/portfolio/:publicSlug`<br>**Frontend Call:** `api.getPublicPortfolio()`<br>**Source Code:** `backend/src/routes/portfolioRoutes.ts` (lines 11–79) |

---

### UC-16: Portfolio Privacy Control

| Field | Specification |
|:------|:--------------|
| **Name of Use Case** | Portfolio Privacy Control |
| **Use Case ID** | UC16 |
| **Actor** | User (Engineering Student / Developer) |
| **Pre Condition** | User is authenticated and viewing the Settings page. |
| **Primary Flow of Events** | 1. User views current portfolio privacy toggle (Public vs. Private).<br>2. User flips the toggle to switch visibility state.<br>3. System sends `PATCH /api/account/privacy` with desired boolean state.<br>4. System updates `is_public` column in `users` table.<br>5. System updates custom public slug if changed.<br>6. UI reflects new status immediately with a confirmation message. |
| **Alternate Flow of Events** | **Alternate Flow 1: Network error during update**<br>1a. Server does not respond.<br>1b. UI reverts toggle switch and displays an error alert. |
| **Post Condition** | `is_public` setting is updated; public endpoint immediately obeys the new privacy policy. |
| **Use Case Termination** | Ends when the privacy setting confirmation is displayed. |
| **Technical Traceability** | **Endpoints:** `PATCH /api/account/privacy`<br>**Frontend Call:** `api.updatePrivacy()`<br>**Source Code:** `backend/src/routes/userRoutes.ts` (lines 69–74) |

---

### UC-17: Data Export (User Data Rights)

| Field | Specification |
|:------|:--------------|
| **Name of Use Case** | Personal Data Export |
| **Use Case ID** | UC17 |
| **Actor** | User (Engineering Student / Developer) |
| **Pre Condition** | User is authenticated. |
| **Primary Flow of Events** | 1. User clicks "Export My Data" in the Settings page.<br>2. System receives request at `GET /api/export` with Bearer JWT token.<br>3. System gathers all personal database rows linked to user across all 15 tables (`users`, `github_daily`, `github_repos`, `leetcode_snapshots`, `leetcode_solved_problems`, `coding_sessions`, `coding_daily`, `problem_times`, `reviews`, `goals`, `daily_scores`, `problem_notes`, `generated_posts`, `plans`, `sync_logs`).<br>4. System bundles data into a structured JSON archive.<br>5. System sends HTTP response with headers `Content-Disposition: attachment; filename="devprofile-export-<id>.json"`.<br>6. User's browser downloads the complete archive file. |
| **Alternate Flow of Events** | **Alternate Flow 1: Large dataset processing**<br>1a. User has extensive coding sessions.<br>1b. System streams JSON serialization to maintain low memory footprint during generation. |
| **Post Condition** | Complete personal data archive downloaded to user's device. |
| **Use Case Termination** | Ends when file download initiates in browser. |
| **Technical Traceability** | **Endpoints:** `GET /api/export`<br>**Frontend Call:** `api.downloadExportUrl`<br>**Source Code:** `backend/src/routes/userRoutes.ts` (lines 11–53) |

---

### UC-18: Account Deletion

| Field | Specification |
|:------|:--------------|
| **Name of Use Case** | Permanent Account Deletion |
| **Use Case ID** | UC18 |
| **Actor** | User (Engineering Student / Developer) |
| **Pre Condition** | User is authenticated. |
| **Primary Flow of Events** | 1. User navigates to Danger Zone in Settings and clicks "Delete Account".<br>2. System displays a modal requiring explicit confirmation.<br>3. User confirms deletion.<br>4. System sends `DELETE /api/account` with user JWT.<br>5. Backend executes deletion on `users` table for `user.id`.<br>6. Database triggers cascading foreign-key deletion across all child tables.<br>7. System invalidates user token and returns success confirmation.<br>8. Frontend clears `localStorage` token and redirects user to landing page. |
| **Alternate Flow of Events** | **Alternate Flow 1: User cancels deletion**<br>1a. User clicks cancel in the confirmation modal.<br>1b. System closes modal with no modification to account. |
| **Post Condition** | User record and all associated metrics, goals, reviews, and logs are permanently purged from SQLite. |
| **Use Case Termination** | Ends when user is logged out and redirected to landing page. |
| **Technical Traceability** | **Endpoints:** `DELETE /api/account`<br>**Frontend Call:** `api.deleteAccount()`<br>**Source Code:** `backend/src/routes/userRoutes.ts` (lines 59–63) |

---

### UC-19: API Key Management

| Field | Specification |
|:------|:--------------|
| **Name of Use Case** | Extension API Key Management |
| **Use Case ID** | UC19 |
| **Actor** | User (Engineering Student / Developer) |
| **Pre Condition** | User is authenticated. |
| **Primary Flow of Events** | 1. User clicks "Regenerate API Key" in Settings page.<br>2. System prompts user with confirmation that regenerating will invalidate existing extension connections.<br>3. User confirms regeneration.<br>4. System creates a cryptographically secure key with prefix `devprof_...`.<br>5. System generates SHA-256 hash and updates `api_key_hash` in `users` table.<br>6. System returns raw key in response payload once.<br>7. Frontend displays raw key with a one-click "Copy Key" button.<br>8. User copies key and enters it in VS Code extension settings. |
| **Alternate Flow of Events** | **Alternate Flow 1: Key closed without copying**<br>1a. User closes view.<br>1b. Raw key is discarded; user can regenerate a new key at any time. |
| **Post Condition** | New API key hash stored; previous API keys immediately revoked. |
| **Use Case Termination** | Ends when developer copies the new key. |
| **Technical Traceability** | **Endpoints:** `POST /api/apikey/regenerate`<br>**Frontend Call:** `api.regenerateApiKey()`<br>**Source Code:** `backend/src/routes/authRoutes.ts` (lines 344–354) |

---

### UC-20: Nightly Automated Sync and Score Calculation

| Field | Specification |
|:------|:--------------|
| **Name of Use Case** | Nightly Automated Sync and Score Calculation |
| **Use Case ID** | UC20 |
| **Actor** | Cron Scheduler |
| **Pre Condition** | Node.js server process is running; background cron scheduler is registered. |
| **Primary Flow of Events** | 1. Node-cron timer triggers automatically at 00:05 AM server time every night.<br>2. System queries all registered users in the database.<br>3. For each user with connected GitHub account, system fetches yesterday's commits and repos.<br>4. System pauses 1 second between requests to respect external rate limits.<br>5. For each user with connected LeetCode handle, system syncs yesterday's solved problems.<br>6. System queries yesterday's total solves, commits, and coding minutes.<br>7. System calls `AnalysisService.calculateDailyScore()` and upserts the result into `daily_scores`.<br>8. System deletes records from `coding_sessions` older than 90 days.<br>9. System logs job execution status and timestamp in `sync_logs`. |
| **Alternate Flow of Events** | **Alternate Flow 1: Database or external network outage**<br>1a. External API is unreachable during scheduled job.<br>1b. System catches exception, logs failure in `sync_logs`, and continues processing remaining users. |
| **Post Condition** | All user metrics refreshed; yesterday's consistency scores persisted; stale clickstream sessions pruned. |
| **Use Case Termination** | Ends when all scheduled user jobs finish and pruning concludes. |
| **Technical Traceability** | **Endpoints:** Automated background cron job (`0 5 0 * * *`)<br>**Source Code:** `backend/src/cron/scheduler.ts` (lines 15–81) |

---

## 4. Master Use Case Summary & Traceability Matrix

| UC ID | Name of Use Case | Primary Actor | Pre Condition Summary | Post Condition Summary | Endpoints | Source File |
|:------|:-----------------|:--------------|:----------------------|:-----------------------|:----------|:------------|
| **UC1** | Universal Login and Multi-Profile Registration | User (A1) | App launched & network available | User record created, JWT issued, goals seeded | `POST /register-or-login` | `authRoutes.ts` |
| **UC2** | GitHub OAuth Authentication | User (A1), GitHub (A5) | OAuth client ID/secret configured | User authenticated, token encrypted, JWT issued | `GET /auth/github/callback` | `authRoutes.ts` |
| **UC3** | Platform Connection (GitHub & LeetCode) | User (A1) | User authenticated | User profile updated with handles, initial sync | `POST /connect/github`, `leetcode` | `syncRoutes.ts` |
| **UC4** | Manual Data Synchronization | User (A1) | User authenticated, platform connected | Real commits & solves pulled, score updated | `POST /sync` | `syncRoutes.ts` |
| **UC5** | Review Unified Dashboard | User (A1) | User authenticated, sources connected | Unified dashboard & heatmap displayed | `GET /dashboard` | `dashboardRoutes.ts` |
| **UC6** | Goal Setting and Progress Tracking | User (A1) | User authenticated | Goals updated in SQLite, rings recalculated | `POST /goals` | `dashboardRoutes.ts` |
| **UC7** | Weakness Diagnostic Engine | User (A1) | LeetCode data exists in DB | Ranked weak topics & drill recommendations | `GET /insights` (weaknesses) | `analysisService.ts` |
| **UC8** | Practice vs. Build Balance & Readiness | User (A1) | Activity recorded over recent window | Balance status, readiness score (0–100) | `GET /insights` (balance) | `analysisService.ts` |
| **UC9** | AI Daily Action Planner | User (A1) | User authenticated | 3-tier actionable plan generated & persisted | `GET /plan/today`, `POST /toggle` | `plannerRoutes.ts` |
| **UC10** | Spaced Repetition Review Queue | User (A1), Extension (A3) | Struggled problem recorded | Review scheduled (3→7→21→30d) or reset | `POST /reviews/:id/done` | `reviewRoutes.ts` |
| **UC11** | Anti-Fabrication LinkedIn Draft Generator | User (A1) | Verifiable activity exists | Authentic post draft generated & saved | `POST /drafts` | `draftRoutes.ts` |
| **UC12** | VS Code Automatic Session Tracking | Extension (A3) | Extension installed & API key set | Session records uploaded, daily roll-ups | `POST /sessions` | `sessionRoutes.ts` |
| **UC13** | VS Code Problem Solve Timer | User (A1), Extension (A3) | Extension active in VS Code | Problem duration logged, struggle flagged | `POST /problem-times` | `sessionRoutes.ts` |
| **UC14** | VS Code Pomodoro Focus Timer | User (A1), Extension (A3) | Extension loaded in VS Code | 25-min focus block tracked, status bar reset | Client command | `pomodoro.ts` |
| **UC15** | Verified Public Portfolio Access | Recruiter / Peer (A2) | User exists, `is_public == 1` | Public portfolio rendered without login | `GET /portfolio/:slug` | `portfolioRoutes.ts` |
| **UC16** | Portfolio Privacy Control | User (A1) | User authenticated | `is_public` updated, public visibility toggled | `PATCH /account/privacy` | `userRoutes.ts` |
| **UC17** | Personal Data Export | User (A1) | User authenticated | Complete 15-table JSON archive downloaded | `GET /export` | `userRoutes.ts` |
| **UC18** | Permanent Account Deletion | User (A1) | User authenticated | User & all cascading foreign keys purged | `DELETE /account` | `userRoutes.ts` |
| **UC19** | Extension API Key Management | User (A1) | User authenticated | Key hash stored, raw key returned once | `POST /apikey/regenerate` | `authRoutes.ts` |
| **UC20** | Nightly Automated Sync & Calculation | Cron Scheduler (A4) | Server process running | All user data synced, scores computed | Cron (`0 5 0 * * *`) | `scheduler.ts` |

---

*DevProfile Formal Use Case Specification — November 2026*
