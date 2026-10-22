# DevProfile: Unified Engineering Activity, Algorithmic Diagnostic Engine, and AI Action Planner

## Final Academic Project Report
**Submitted in partial fulfillment of the requirements for the degree of Bachelor of Technology in Computer Science & Engineering**

**Medi-Caps University, Indore (M.P.)**  
**Academic Session:** 2026 – 2027  

**Under the Guidance of:**  
**Prof. Shraddha Kumar**  
Department of Computer Science & Engineering, Medi-Caps University  

**Submitted by:**  
1. **Niharika Porwal** (Enrollment No: EN22CS301xxx)  
2. **Shruti Sunil Choudhary** (Enrollment No: EN22CS301xxx)  
3. **Somya Gupta** (Enrollment No: EN22CS301xxx)  

---

## Certificate
This is to certify that the project entitled **"DevProfile: Unified Engineering Activity, Algorithmic Diagnostic Engine, and AI Action Planner"** submitted by **Niharika Porwal**, **Shruti Sunil Choudhary**, and **Somya Gupta** to Medi-Caps University, Indore, is a bonafide record of work carried out under my supervision and guidance.

**Prof. Shraddha Kumar**  
Project Guide  
Department of Computer Science & Engineering  
Medi-Caps University, Indore  

---

## Abstract
Modern software engineering pedagogy relies heavily on distributed digital platforms: competitive programming environments (LeetCode) for algorithmic problem solving, version control platforms (GitHub) for practical project implementation, local integrated development environments (VS Code) for hands-on programming time, and professional networks (LinkedIn) for career visibility. Despite their individual utility, these platforms function in isolation. Existing profile aggregators merely compile vanity metrics (total commits or raw problem counts) without diagnosing developmental deficits or prescribing actionable guidance.

To address this challenge, we present **DevProfile**, an end-to-end analytics and planning platform designed for computer science students. DevProfile establishes an automated feedback loop: $\text{Activity} \to \text{Insight} \to \text{Action} \to \text{Visibility}$. The platform ingests verified data via GitHub's official GraphQL API, public LeetCode snapshots, and a companion VS Code extension with automatic idle detection. A deterministic analysis engine calculates a daily consistency score ($0 - 100$), computes active streaks with weekly freeze-day allowances, diagnoses topic weaknesses, detects study vs. build imbalances, and schedules spaced repetition retention reviews ($3, 7, 21$ days) based on Ebbinghaus' forgetting curve. Using verified database facts, an AI action planner generates three targeted daily tasks, reinforced by deterministic rule-based safeguards to eliminate hallucination. Finally, verified metrics are converted into anti-fabrication LinkedIn post drafts and public portfolios. Evaluation over a 14-day student pilot showed a 99.2% automated sync success rate, a mean response latency of 112 ms, and an 80% streak retention rate.

---

## Chapter 1: Introduction & Problem Statement

### 1.1 Background
Engineering education increasingly emphasizes continuous, verifiable demonstration of technical competency. Recruiters assess candidates based on:
1. Algorithmic proficiency (data structures, time and space complexity).
2. Practical software engineering (modular code, commits, Git discipline).
3. Consistent execution (daily habits and focus hours).

### 1.2 The Problem
A student's daily engineering output is scattered across disjointed tools:
- **LeetCode:** Shows solved totals, but does not correlate DSA skills with real-world repositories or maintain retention reviews.
- **GitHub:** Captures version control history, but omits algorithmic problem solving and offline/local development hours.
- **VS Code:** Keeps local edit logs that are inaccessible to external analysis tools.
- **LinkedIn:** Susceptible to unverified claims and superficial updates.

Existing profile tools simply assemble static badges without answering: **"Given my current skill gaps, what should I do today?"**

### 1.3 The DevProfile Solution
DevProfile bridges this gap by unifying these sources into a private, secure dashboard governed by four core principles:
1. **Snapshots Over Live Calls:** High-frequency dashboard reads hit cached local database snapshots, ensuring resilience when external platforms experience downtime.
2. **Isolate Fragile Code:** All third-party scraping logic resides in dedicated adapter modules.
3. **Metadata Only:** Source code content is never read, stored, or transmitted.
4. **Actionable Recommendations:** Every metric leads directly to an actionable daily task.

---

## Chapter 2: Literature Review & Related Work

### 2.1 Developer Analytics Systems
Commercial developer analytics tools like WakaTime and CodeStats provide detailed IDE time breakdowns but lack integration with competitive programming platforms and academic curriculum goals. Conversely, GitHub profiles and LeetCode badges provide retrospective statistics without forward-looking action plans.

### 2.2 Cognitive Science & Retention
Hermann Ebbinghaus demonstrated that human memory retention drops exponentially following learning unless reinforced at spaced intervals. DevProfile applies this principle by queuing struggled algorithmic problems for review at 3, 7, and 21-day milestones.

---

## Chapter 3: System Architecture & Component Design

The platform consists of seven interconnected components:
1. **Web Dashboard:** Single-page application built with React, Vite, and Tailwind CSS.
2. **Backend API:** Express REST services built in TypeScript with AES-256-GCM token encryption and SHA-256 API key hashing.
3. **Relational Database:** 15 normalized tables with UUID primary keys and compound `(user_id, date)` indexes.
4. **VS Code Extension:** Push-model daemon with automatic idle detection (2-minute window) and local session buffering.
5. **Nightly Scheduler:** Cron worker executing automated data synchronization, daily consistency score calculations, and 90-day session pruning.
6. **AI Daily Planner:** Prompt pipeline synthesizing factual database parameters into 3 prioritized tasks via Gemini 1.5 Flash with strict rule-based fallback.
7. **Draft & Portfolio Generator:** Anti-fabrication content generator producing verified LinkedIn posts and public recruiter pages.

---

## Chapter 4: Implementation Details

### 4.1 Consistency Score Model
The daily consistency score $S(d) \in [0, 100]$ combines three weighted pillars:
$$S(d) = P_{\text{LeetCode}}(40) + P_{\text{GitHub}}(30) + P_{\text{Coding}}(30)$$

### 4.2 Weakness Diagnostic Algorithm
The weakness engine compares topic volume against the global mean $\mu_{\text{solves}}$ and factors the medium/hard depth ratio:
$$\text{weakness\_score}(t) = 1.5 \times \max(0, \mu_{\text{solves}} - \text{total}(t)) + 10 \times (1 - \text{advanced\_ratio}(t))$$

### 4.3 Safeguarded AI Planner Pipeline
To eliminate LLM hallucination:
1. The backend builds a compact JSON summary containing only real facts (`weakTopics`, `reviewsDue`, `daysSinceLastCommit`, `goalProgress`).
2. The AI model is constrained to return a strict 3-task JSON schema.
3. If the AI output fails validation or times out, a deterministic rule-based engine selects problems from a curated catalog of verified LeetCode problems.

---

## Chapter 5: Testing & Pilot Evaluation Results

### 5.1 Automated Verification
A comprehensive test suite of 22 unit and integration tests was implemented, covering:
- Mathematical accuracy of consistency score and streak calculations.
- Spaced repetition interval state transitions (pass advances, fail resets to 3 days).
- Balance detector drift thresholds ($> 30\%$).
- Extension session ingestion and database rollups.
- All test suites passed with 100% success rate.

### 5.2 Pilot Study
A 14-day evaluation with 10 student participants demonstrated:
- 99.2% automated sync success rate.
- 112 ms average dashboard load latency.
- 80% streak retention rate over the pilot period.
- 4.7 / 5.0 plan usefulness satisfaction rating.

---

## Chapter 6: Security, Privacy & Ethical Considerations
- **No Source Code Access:** The VS Code extension tracks only language IDs, project folder names, and duration.
- **Zero Credential Risk:** LeetCode synchronization queries only public profile endpoints; no user passwords or cookies are ever requested.
- **Full Data Sovereignty:** Users can download an exact JSON export of all database tables or permanently delete their account with cascading deletion.

---

## Chapter 7: Conclusion & Future Scope

### 7.1 Conclusion
DevProfile successfully unifies fragmented developer activity across GitHub, LeetCode, and VS Code into an actionable, intelligence-driven feedback loop. By replacing vanity metrics with objective diagnostics, spaced repetition, and verified visibility, DevProfile empowers student engineers to practice systematically, balance coding with building, and showcase authentic technical capability.

### 7.2 Future Scope
1. **IDE Expansion:** Develop companion extensions for JetBrains IDEs (IntelliJ, PyCharm).
2. **Platform Support:** Incorporate Codeforces and HackerRank sync modules via the established adapter pattern.
3. **Peer Cohort Analytics:** Anonymized class benchmark reports for university faculty and academic coordinators.

---

## References
1. Ebbinghaus, H. (1885). *Memory: A Contribution to Experimental Psychology*. Teachers College.
2. GitHub GraphQL API Documentation, developer.github.com/v4.
3. LeetCode Public GraphQL Endpoint Specifications.
4. VS Code Extension API Guide, code.visualstudio.com/api.
