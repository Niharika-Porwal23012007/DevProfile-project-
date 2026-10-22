# Final Presentation Deck & Live Demo Script
## Project: DevProfile — Unified Developer Analytics Platform
**Institution:** Medi-Caps University, Indore | Department of Computer Science & Engineering  
**Academic Session:** 2026 – 2027  
**Team Members:** Niharika Porwal, Shruti Sunil Choudhary, Somya Gupta  
**Project Guide:** Prof. Shraddha Kumar  

---

## 1. Slide-by-Slide Presentation Structure (12 Slides)

### Slide 1: Title & Team
- **Title:** DevProfile — Unified Engineering Analytics, Algorithmic Diagnostic Engine, and AI Action Planner
- **Subtitle:** Closing the Loop: Activity &rarr; Insight &rarr; Action &rarr; Visibility
- **Team:** Niharika Porwal, Shruti Sunil Choudhary, Somya Gupta
- **Guide:** Prof. Shraddha Kumar | Medi-Caps University

### Slide 2: The Problem: The Fragmented Student Footprint
- Student work is scattered across LeetCode, GitHub, VS Code, and LinkedIn.
- Existing aggregators only show vanity statistics; they don't say **"What should I do today?"**
- Imbalance trap: Students practice DSA for weeks without building, or build without practicing.
- Forgetting curve: Struggled problems are quickly forgotten without spaced reviews.

### Slide 3: The Solution: The Closed-Loop Architecture
- Diagram showing: Activity &rarr; Diagnostic Insights &rarr; AI Daily Action &rarr; Verified Visibility.
- Buildable sources: GitHub GraphQL (commits/repos), LeetCode GraphQL (topic stats), VS Code Extension (active minutes/timers).

### Slide 4: System Architecture & Design Principles
- Components: Web UI (React/Vite), Backend (Node/Express), Database (15 tables, compound indexes), VS Code Extension, Nightly Cron Scheduler, LLM Planner.
- Key principles: Snapshots over live calls (speed & resilience), Isolated adapter pattern, Metadata only (no source code read), Strict anti-fabrication rule.

### Slide 5: Platform Integrations in Depth
- **GitHub:** OAuth 2.0, tokens encrypted at rest via AES-256-GCM, GraphQL contribution collections.
- **LeetCode:** Public GraphQL adapter; zero session cookies or passwords required.
- **VS Code Extension:** Push model, idle timeout logic (2 mins), personal API keys hashed via SHA-256.

### Slide 6: Diagnostic Algorithms (The Intelligence Layer)
- **Consistency Score ($0-100$):** 40 LeetCode + 30 GitHub + 30 Coding Time.
- **Streak & Freeze Day:** 1 rest day per week preserved.
- **Weakness Analyzer:** Topic volume deficit vs average + medium/hard depth ratio.
- **Balance Detector:** 14-day rolling activity vs 28-day baseline ($>30\%$ differential detection).

### Slide 7: Spaced Repetition Engine (Combating Forgetting)
- Automatically triggered when problems are marked *Struggled* or solve duration $>40$ mins.
- Intervals: 3 days &rarr; 7 days &rarr; 21 days &rarr; Mastery.
- Failure reset: Struggling on a review resets interval to 3 days.
- Pattern tag scratchpad (Two Pointers, Sliding Window, Monotonic Stack).

### Slide 8: AI Daily Planner with Safeguards
- Anonymized factual JSON summary sent to Gemini 1.5 Flash.
- Strict 3-task schema: 1 Practice + 1 Project + 1 Review.
- Deterministic fallback: Curated catalog used if AI fails or times out. Zero hallucination.

### Slide 9: Professional Visibility & Anti-Fabrication Rule
- Output-only LinkedIn draft generator.
- Anti-fabrication rule: Drafts use only verified numbers from the database.
- Recruiter-ready Public Portfolio page (`/portfolio/:slug`).

### Slide 10: Security, Privacy & Data Sovereignty
- No source code content ever tracked. File path anonymization.
- Full data export (JSON) and permanent account deletion under GDPR user rights.

### Slide 11: Testing & Pilot Evaluation
- 22 automated unit and integration tests passing at 100%.
- 14-day pilot with 10 Medi-Caps classmates: 99.2% sync success, 112ms load latency, 80% streak retention.

### Slide 12: Conclusion & Future Scope
- Summary of impact and contributions.
- Future roadmap: JetBrains extension, Codeforces adapter, faculty cohort reports.
- Q&A session.

---

## 2. Live Demo Script (Step-by-Step Walkthrough)

### Time Allocation: 5 to 7 Minutes

#### Step 1: Introduction & Instant Demo Login (1 Minute)
1. **Presenter:** "Good afternoon, respected evaluators and guide. Let's start with our landing page."
2. **Action:** Open `http://localhost:5173`. Point out the core loop banner.
3. **Action:** Click **"Demo Login (Instant)"**.
4. **Talking Point:** "In one click, our JWT authentication initializes the authenticated student session for Niharika Porwal."

#### Step 2: Home Dashboard & Merged Heatmap (1.5 Minutes)
1. **Action:** Highlight the **Active Streak banner (12 Days)** and weekly consistency score average (88/100).
2. **Action:** Explain the **Daily Consistency Score Ring**:
   - 40/40 for LeetCode solves
   - 30/30 for GitHub commits
   - 30/30 for VS Code coding minutes
3. **Action:** Hover over the **Merged Contribution Heatmap**:
   - Show how hover tooltips combine commits, solves, and active coding hours on each individual day.
4. **Action:** Show the **Active Repositories** list (`devprofile`, `algo-visualizer`) and recent LeetCode problems with the `In Spaced Queue` badge.

#### Step 3: Diagnostic Insights & Skill Gaps (1.5 Minutes)
1. **Action:** Click the **"Insights & Gaps"** tab in the sidebar.
2. **Talking Point:**
   - Point out the **Balance Detector Banner**: "Our rolling baseline detector confirms whether study and building are in equilibrium."
   - Show the **Weakness Analyzer**: "Notice Dynamic Programming is ranked #1 weakest because volume is below average and medium/hard ratio is under-represented."
   - Show the **Interview Readiness Breakdown**: Difficulty mix, topic breadth, consistency, and project cadence.
   - Show the **Best-Time Concentration Insights**: "Peak coding concentration occurs on Saturdays around 8:00 PM in Indian Standard Time."

#### Step 4: AI Daily Action Plan (1 Minute)
1. **Action:** Click the **"AI Daily Plan"** tab.
2. **Talking Point:** "Instead of wondering what to study, DevProfile prescribes 3 prioritized tasks each morning."
3. **Action:** Walk through the 3 tasks:
   - Practice: Solve Coin Change (targeting the weakest topic)
   - Project: Commit to devprofile (re-activating stalest repo)
   - Review: Redo Course Schedule (due retention checkpoint)
4. **Action:** Click the checkbox on Task 1. Show the live completion counter update ($1 \to 2$ of 3 tasks finished).
5. **Action:** Click **"Refresh Plan"** to demonstrate live regeneration.

#### Step 5: Spaced Repetition & VS Code Extension (1 Minute)
1. **Action:** Click the **"Spaced Reviews"** tab.
2. **Talking Point:** "Here is our active retention queue. When a student marks a problem as struggled, our algorithm schedules reviews at 3, 7, and 21 days."
3. **Action:** Click the note icon to open the **Pattern Note Scratchpad**. Show how notes and pattern tags (`Dynamic Programming / Knapsack`) are saved.
4. **Action:** Click **"Solved"** on a review card &rarr; demonstrate that it progresses to the next interval.

#### Step 6: Verified LinkedIn Drafts & Public Portfolio (1 Minute)
1. **Action:** Click the **"LinkedIn Drafts"** tab.
2. **Talking Point:** "Notice our Anti-Fabrication Rule: every metric in this draft is pulled directly from our database. No exaggeration."
3. **Action:** Click **"Copy Draft"** (show green copied confirmation).
4. **Action:** Click the top navigation link **"Public Portfolio"** &rarr; opens `/portfolio/niharika`.
5. **Talking Point:** "This public portfolio can be pinned on resumes or LinkedIn profiles for recruiters to independently verify the student's metrics."

---

## 3. Backup Demo Video Plan
In case of projector resolution issues or internet instability during evaluation:
- High-definition MP4 recording (`docs/demo_backup.mp4`) captured at 1080p 60fps covering the full 5-minute walkthrough.
- Local SQLite database pre-seeded with complete 35-day data requiring zero external internet connection to run smoothly.
