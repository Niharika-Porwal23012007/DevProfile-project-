# DevProfile: Project Synopsis

**Project Title:** DevProfile — Unified Developer Analytics, Weakness Detection, Spaced Repetition, and AI Action Planner  
**Institution:** Medi-Caps University, Indore (Department of Computer Science & Engineering)  
**Session:** Aug – Dec 2026  
**Team Members:**  
- Niharika Porwal (Enrollment: EN22CS301xxx) — Backend, GitHub/LeetCode Sync, Database Architecture  
- Shruti Sunil Choudhary (Enrollment: EN22CS301xxx) — Frontend Dashboard, Insights, Weekly Reports  
- Somya Gupta (Enrollment: EN22CS301xxx) — VS Code Extension, AI Planner, LinkedIn Draft Generator  
**Project Guide:** Prof. Shraddha Kumar  

---

## 1. Introduction
A student software engineer's learning journey is fragmented across disparate platforms:
1. **LeetCode** (problem-solving, algorithmic mastery)
2. **GitHub** (source code repositories, version control, collaboration)
3. **VS Code** (hands-on programming hours, language distribution)
4. **LinkedIn** (professional visibility, internship applications)

While each platform operates independently, no unified system aggregates this activity to provide actionable insights. Existing profile aggregators merely present static numbers (e.g. total commits or total problems solved) without answering the essential engineering question: **"What should I work on today to maximize my growth and interview readiness?"**

DevProfile addresses this fundamental gap by establishing a closed-loop system:  
$$\text{Activity} \longrightarrow \text{Insight} \longrightarrow \text{Action} \longrightarrow \text{Visibility}$$

---

## 2. Literature Review & Existing Solutions
1. **GitHub Contribution Graph:** Captures only Git commit activity; provides no insight into algorithmic problem solving or focused IDE time.
2. **LeetCode Profile:** Displays global counts by difficulty (Easy/Medium/Hard) and badges, but lacks retention scheduling, spaced repetition, or project correlations.
3. **WakaTime / CodeStats:** Tracks IDE metrics, but is detached from problem-solving platforms and curriculum preparation goals.
4. **Social Media Aggregators / Resumes:** Susceptible to self-reported hyperbole or phantom claims that recruiters cannot verify.

DevProfile overcomes these limitations by synchronizing verified data directly from buildable sources, calculating an objective consistency score, identifying algorithmic topic weaknesses, detecting study vs. build imbalances, generating AI daily tasks, and formatting anti-fabrication progress drafts.

---

## 3. Problem Statement
Engineering students frequently suffer from:
- **Algorithmic Blindspots:** Practicing comfortable topics (e.g., Arrays) while neglecting critical topics (e.g., Dynamic Programming, Graphs).
- **Activity Imbalance:** Weeks dedicated exclusively to solving DSA problems while abandoning software projects, or vice-versa.
- **Forgetting Curve:** Solved problems are quickly forgotten because no automated spaced repetition queue reminds students to re-attempt struggled problems.
- **Visibility Deficit:** Hesitation or lack of structure when posting genuine milestones to LinkedIn.

---

## 4. Objectives of the Project
1. **Unified Data Ingestion:**
   - Ingest GitHub commit calendars, PRs, issues, and repositories via GraphQL API.
   - Cache daily snapshots from LeetCode public GraphQL without asking for sensitive session cookies.
   - Track local development sessions via a dedicated VS Code extension.
2. **Deterministic Diagnostic Algorithms:**
   - Compute a daily consistency score ($0 - 100$) factoring LeetCode, GitHub, and IDE focus time.
   - Implement streak tracking with a 1-day weekly freeze allowance.
   - Detect weakness through topic volume and difficulty mix deficits.
   - Schedule spaced repetition intervals ($3, 7, 21$ days) for struggled problems.
   - Flag practice vs. build imbalances using rolling baseline comparisons.
3. **AI Daily Action Planner:**
   - Feed factual database metrics into an LLM to generate exactly 3 prioritized daily tasks (Practice, Project, Review).
   - Enforce schema validation and fail-safe rule-based fallback mechanisms.
4. **Professional Visibility:**
   - Generate LinkedIn post drafts adhering strictly to the Anti-Fabrication Rule (using only verified numbers from the database).
   - Provide a recruiter-facing public portfolio page.

---

## 5. Methodology & System Flow
1. **Data Ingestion Layer:**
   - OAuth 2.0 authorization with GitHub; tokens encrypted at rest with AES-256-GCM.
   - LeetCode public scraper adapter module with isolated snapshot caching.
   - VS Code extension pushing batched sessions with personal API key authentication.
2. **Storage Layer:**
   - Relational database schema with 15 normalized tables, foreign keys, and compound `(user_id, date)` indexes.
3. **Analysis Engine:**
   - Asynchronous nightly scheduler executing rollups, consistency calculations, and session pruning.
4. **Presentation Layer:**
   - Responsive dark-mode dashboard built with React, Vite, Tailwind CSS, and Recharts.

---

## 6. Expected Outcomes & Deliverables
- A production-ready web application hosting student dashboards, AI planners, and public portfolios.
- A functional VS Code extension packaged as a `.vsix` companion.
- Complete documentation suite (SRS, SDD, ER diagrams, test reports, and academic thesis).

---

## 7. References
1. Ebbinghaus, H. (1885). *Memory: A Contribution to Experimental Psychology*. Teachers College, Columbia University.
2. GitHub REST and GraphQL API Documentation (v4), developer.github.com.
3. LeetCode GraphQL Schema Reference & Community Wrappers.
4. Visual Studio Code Extension API Guide, code.visualstudio.com/api.
