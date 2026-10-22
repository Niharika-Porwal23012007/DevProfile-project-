# DevProfile: Unified Developer Analytics, Weakness Detection & AI Planner

[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Passing-emerald.svg)]()
[![Tests](https://img.shields.io/badge/Tests-22%20Passed-emerald.svg)]()
[![Platform](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20TypeScript%20%7C%20VS%20Code-blue.svg)]()

> **Final Year Major Project (2026)**  
> **Institution:** Department of Computer Science & Engineering, Medi-Caps University, Indore (M.P.)  
> **Team Members:** Niharika Porwal, Shruti Sunil Choudhary, Somya Gupta  
> **Project Guide:** Prof. Shraddha Kumar  

---

## 🌟 The Core Loop
$$\text{Activity} \longrightarrow \text{Insight} \longrightarrow \text{Action} \longrightarrow \text{Visibility}$$

A student's software engineering journey is typically fragmented across **LeetCode** (problem-solving), **GitHub** (project repositories), **VS Code** (hands-on coding time), and **LinkedIn** (career visibility). Existing profile aggregators merely display static vanity statistics without diagnosing developmental gaps or prescribing what to do next.

**DevProfile** unifies these buildable sources, calculates an objective daily consistency score, detects weak algorithmic topics, maintains an automated spaced-repetition retention queue, issues an AI-driven 3-task daily action plan, and formats verified LinkedIn progress drafts.

---

## 🚀 Key Features

1. **Merged Contribution Heatmap:**
   - Unifies GitHub commits, LeetCode solves, and VS Code coding hours into one truthful matrix.
2. **Consistency Score ($0 - 100$):**
   - LeetCode activity ($\ge 1$ solve) = 40 pts
   - GitHub activity ($\ge 1$ commit) = 30 pts
   - Coding time target met = 30 pts (partial credit proportional to daily target)
   - Active streaks maintained with **1 Freeze Day per week** allowance.
3. **Weakness Diagnostic Engine:**
   - Compares topic-wise volumes against the student's average and penalizes low medium/hard depth.
4. **Spaced Repetition & Pattern Notes:**
   - Ebbinghaus intervals ($3, 7, 21$ days) automatically scheduled when problems are struggled or take $>40$ mins.
   - Built-in pattern note scratchpad with algorithmic tagging (*Two Pointers, Dynamic Programming, Monotonic Stack*).
5. **Study vs. Build Balance Detector:**
   - Analyzes rolling 14-day activity against a 28-day baseline to flag when a student practices without building or builds without practicing.
6. **AI Daily Action Planner:**
   - Synthesizes database gaps into **exactly 3 tasks** (Practice, Project, Review) with verified reasons.
   - Protected by deterministic rule-based fallback and curated problem catalog to eliminate hallucination.
7. **Anti-Fabrication LinkedIn Drafts & Public Portfolio:**
   - Generates progress updates using strictly real database numbers (no inflated claims).
   - Public candidate page at `/portfolio/:slug` for recruiter verification.
8. **VS Code Companion Extension:**
   - Tracks active coding sessions with 2-minute idle detection.
   - Manual LeetCode problem timer with status bar updates and Pomodoro timer.
   - Respects user privacy: source code is **never** read or transmitted.

---

## 📂 Project Structure

```
├── backend/                  # Node.js + Express API in TypeScript
│   ├── src/
│   │   ├── config.ts         # Environment variables & configuration
│   │   ├── db/               # Relational database setup & seed script
│   │   ├── middleware/       # JWT auth, Bearer API key auth, error handling
│   │   ├── routes/           # 9 Express routers matching Section 4 API specs
│   │   ├── services/         # Scoring formulas, weakness, balance, AI planner, drafts
│   │   ├── sync/             # GitHub GraphQL sync & LeetCode adapter module
│   │   ├── cron/             # Nightly scheduler (00:05 AM sync & session pruning)
│   │   └── __tests__/        # 22 automated unit and integration tests
├── frontend/                 # React (Vite) + Tailwind CSS + Lucide + Recharts
│   ├── src/
│   │   ├── api/client.ts     # Typed API client with demo mode support
│   │   ├── components/       # Heatmap, ConsistencyRing, GoalCard, Navbar, Sidebar
│   │   └── pages/            # Dashboard, Insights, Planner, Reviews, Drafts, Settings
├── extension/                # VS Code Companion Extension (TypeScript)
│   ├── src/
│   │   ├── extension.ts      # Commands & status bar registration
│   │   ├── sessionTracker.ts # 2-minute idle timeout & batch buffer
│   │   ├── timerManager.ts   # LeetCode problem timer commands
│   │   └── pomodoro.ts       # 25-minute focus timer
└── docs/                     # Complete 15-document academic documentation suite
    ├── 01_Synopsis.md
    ├── 02_SRS.md
    ├── 03_System_Design_Document.md (Mermaid DFDs, Sequence, Use-Case)
    ├── 04_Database_Design.md (Mermaid ER diagram, 15 table schemas)
    ├── 05_API_Documentation.md
    ├── 06_Integration_Notes.md
    ├── 07_Algorithm_Specification.md (Formulas & Pseudocode)
    ├── 08_UI_Design.md (Wireframes & Screen Hierarchy)
    ├── 09_Test_Plan_and_Test_Report.md
    ├── 10_Security_and_Privacy_Note.md
    ├── 11_Deployment_Guide.md
    ├── 12_User_Manual.md
    ├── 13_Project_Report.md (Full Academic Thesis)
    ├── 14_Presentation_and_Demo_Script.md
    └── 15_Meeting_and_Progress_Log.md
```

---

## ⚡ Quickstart Guide

### 1. Install Dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install

# Extension
cd ../extension && npm install
```

### 2. Seed Database & Run Verification Tests
```bash
# Seed database with realistic 35-day academic dataset for Niharika Porwal
cd backend && npm run seed

# Run the automated test suite (22 tests)
npm test
```

### 3. Start the Application
From the repository root:
```bash
# Concurrently launches backend (port 5000) and frontend (port 5173):
npm run dev
```

Visit **`http://localhost:5173`** in your browser.  
Click **"Demo Login (Instant)"** to instantly access the full authenticated dashboard!

---

## 🧪 Verification & Test Results

The test suite exercises all core algorithmic formulations and API routes:
- `6.1 Consistency Score Formula` &bull; `Streak Calculation with 1 Freeze Day`
- `6.2 Weakness Analyzer Deficit Ranking` &bull; `6.3 Spaced Repetition Scheduling`
- `6.4 Balance Detector Rolling Baselines` &bull; `6.7 Interview Readiness Pillar Score`
- `POST /api/sessions Ingestion` &bull; `POST /api/problem-times Queueing`
- `GET /api/plan/today 3-Task Generation` &bull; `Anti-Fabrication Draft Generator`

```
▶ AnalysisService Unit Tests (Section 6 & 11)
  ✔ 6.1 Consistency Score Formula (1.33ms)
  ✔ Streak Calculation with 1 Freeze Day (0.28ms)
  ✔ 6.2 Weakness Analyzer (0.23ms)
  ✔ 6.3 Spaced Repetition Scheduling (0.15ms)
  ✔ 6.4 Balance Detector (0.20ms)
  ✔ 6.7 Interview Readiness Score (0.11ms)
▶ DevProfile Backend Integration Tests (Section 4 & 11)
  ✔ POST /api/auth/demo-login (12.27ms)
  ✔ GET /api/me (2.91ms)
  ✔ POST /api/sessions (10.64ms)
  ✔ POST /api/problem-times (1.37ms)
  ✔ GET /api/dashboard (1.78ms)
  ✔ GET /api/insights (1.49ms)
  ✔ GET /api/reviews/today and POST /api/reviews/:id/done (1.72ms)
  ✔ GET /api/plan/today (1.17ms)
  ✔ POST /api/drafts (1.19ms)
  ✔ GET /api/portfolio/:publicSlug (0.78ms)
  ✔ GET /api/export (1.18ms)
ℹ tests 22 | pass 22 | fail 0
```

---

## 🔒 Security & Privacy Guarantees
- **No Source Code Content:** The extension tracks exclusively active minutes, language IDs, and workspace folder names. File paths are anonymized by default.
- **No Passwords or Session Cookies:** LeetCode synchronization operates entirely against public endpoints.
- **AES-256-GCM:** Access tokens are encrypted at rest with per-record random initialization vectors.
- **Full Data Sovereignty:** Immediate one-click JSON data export and permanent cascaded account deletion under GDPR compliance.

---

## 📜 Academic Attribution
Developed at **Medi-Caps University, Indore (M.P.)** under the mentorship of **Prof. Shraddha Kumar**.  
Released under the MIT License.
