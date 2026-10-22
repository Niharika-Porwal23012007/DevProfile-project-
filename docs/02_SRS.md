# Software Requirements Specification (SRS)
## Project: DevProfile — Unified Developer Analytics Platform
**Document Version:** 1.0  
**Authors:** Niharika Porwal, Shruti Sunil Choudhary, Somya Gupta  
**Department:** Computer Science & Engineering, Medi-Caps University, Indore  
**Guide:** Prof. Shraddha Kumar  

---

## 1. Introduction

### 1.1 Purpose
This document provides a formal and detailed description of the software requirements for the **DevProfile** system. It specifies functional and non-functional requirements, external interface definitions, data models, and constraints for developers, testers, and academic evaluators.

### 1.2 Scope
DevProfile is a web and desktop companion platform that aggregates, analyzes, and optimizes a student software engineer's activity across GitHub, LeetCode, and VS Code. The platform computes consistency scores, detects weak algorithmic topics, maintains spaced-repetition review queues, issues AI-driven daily action plans, and exports verified LinkedIn updates and public portfolios.

### 1.3 Definitions and Acronyms
- **DSA:** Data Structures and Algorithms
- **AES-256-GCM:** Advanced Encryption Standard with 256-bit key in Galois/Counter Mode
- **JWT:** JSON Web Token
- **DFD:** Data Flow Diagram
- **SRS:** Software Requirements Specification
- **AC Submission:** Accepted Submission on LeetCode
- **API Key:** A 64-character hashed personal bearer token used by the VS Code extension

---

## 2. Overall Description

### 2.1 Product Perspective
DevProfile operates as a self-contained hub communicating with three external ecosystems:
1. **GitHub Platform:** Pulls commits, repositories, stars, and pull requests via official GraphQL API.
2. **LeetCode Platform:** Pulls public problem solved counts, topic breakdowns, and calendar statistics via public GraphQL endpoints.
3. **VS Code Editor:** Receives push notifications of active programming time and per-problem solve timers.

### 2.2 User Classes
1. **Engineering Student:** Primary actor who authenticates, connects accounts, tracks work, reviews flashcards, and follows daily plans.
2. **Technical Recruiter / Peer:** External consumer accessing public candidate portfolios at `/portfolio/:slug`.
3. **Automated Scheduler:** Background system executing nightly cron synchronization, score rollups, and session pruning.

### 2.3 Operating Environment
- **Server:** Node.js v20+ / Express with TypeScript.
- **Database:** PostgreSQL / SQLite with WAL mode and foreign key constraints.
- **Client Web Browser:** Chrome 110+, Firefox 110+, Safari 16+, Edge.
- **Editor Extension:** VS Code version 1.80.0 or higher running on Windows, macOS, or Linux.

---

## 3. Functional Requirements

### 3.1 Authentication & User Management
- **FR-1:** The system shall authenticate users via GitHub OAuth 2.0 with minimal required scopes (`read:user`, `user:email`, `repo`).
- **FR-2:** The system shall provide a Demo Mode authentication endpoint for immediate evaluation without requiring third-party credentials.
- **FR-3:** The system shall encrypt all stored OAuth access tokens at rest using AES-256-GCM.
- **FR-4:** The system shall allow users to generate, view once, and regenerate hashed personal API keys for extension integration.

### 3.2 Platform Integrations
- **FR-5 (GitHub Sync):** The system shall pull daily commit contributions, total PRs, issues, and top 20 repositories via GitHub GraphQL.
- **FR-6 (LeetCode Sync):** The system shall fetch public profile counts (Easy, Medium, Hard), topic tags, and submission calendars without requesting user passwords or cookies.
- **FR-7 (Sync Isolation):** All LeetCode scraping logic shall be isolated in an independent adapter module (`leetcodeSync.ts`) so external schema alterations do not disrupt other components.
- **FR-8 (Manual Sync):** The system shall provide a manual "Sync Now" button protected by a 2-minute cooldown rate limiter.

### 3.3 VS Code Activity Tracking
- **FR-9 (Session Ingestion):** The backend shall accept batched JSON session payloads from the extension authenticated via `Authorization: Bearer <apiKey>`.
- **FR-10 (Idle Handling):** The extension shall close active sessions when user inactivity exceeds the configurable idle limit (default: 2 minutes) or when the window loses focus.
- **FR-11 (Privacy Filter):** Source code content shall never be read or transmitted. File path logging shall be disabled by default (sending only file extension unless explicitly enabled).
- **FR-12 (Problem Timer):** The extension shall provide `DevProfile: Start Problem` and `DevProfile: Mark Solved` commands to record solve duration and difficulty feeling.

### 3.4 Diagnostic Analysis Engine
- **FR-13 (Consistency Formula):** The system shall compute a daily score ($0-100$) based on:
  - LeetCode activity ($\ge 1$ solve) = 40 points
  - GitHub activity ($\ge 1$ commit) = 30 points
  - Coding time target met = 30 points (partial credit proportional to target)
- **FR-14 (Streak & Freeze Day):** The system shall calculate consecutive active days ($\text{score} \ge 30$) permitting at most 1 freeze day per 7-day rolling period.
- **FR-15 (Weakness Analyzer):** The system shall rank the top 3 weakest topics by comparing individual topic volumes against the overall topic mean and calculating the proportion of Medium/Hard solves.
- **FR-16 (Spaced Repetition Queue):** Solved problems marked as struggled shall be queued for review at intervals of 3, 7, and 21 days. Passing a review advances the interval; struggling resets the interval to 3 days.
- **FR-17 (Balance Detection):** The system shall analyze 14-day rolling activity against a 28-day baseline and flag imbalances exceeding a 30% differential between practice and project work.

### 3.5 Planning and Visibility
- **FR-18 (AI Daily Plan):** The system shall synthesize verified database facts and generate exactly 3 prioritized tasks (Practice, Project, Review) with explicit reasons. A deterministic rule-based fallback shall activate if the LLM fails.
- **FR-19 (LinkedIn Drafts):** The system shall generate weekly progress updates, project announcements, and profile checklists adhering strictly to the Anti-Fabrication Rule (zero invented metrics).
- **FR-20 (Data Rights):** The system shall allow users to download all stored records as a JSON export file and execute complete account and cascaded data deletion.

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements
- **NFR-1 (Dashboard Response Time):** Dashboard API responses (`GET /api/dashboard`) shall return within 200 milliseconds by reading pre-aggregated database snapshots rather than calling external APIs on-the-fly.
- **NFR-2 (Extension Footprint):** The VS Code extension shall consume less than 25 MB of memory and introduce zero noticeable typing latency (&lt; 5ms).

### 4.2 Security Requirements
- **NFR-3 (Confidentiality):** Client secrets, JWT keys, and LLM tokens shall exist exclusively within environment variables and never be committed to source control.
- **NFR-4 (CSRF Protection):** OAuth redirects shall enforce random `state` token verification.
- **NFR-5 (Least Privilege):** Extension API keys shall only access session ingestion and problem time routes, preventing administrative elevation.

### 4.3 Reliability & Availability
- **NFR-6 (Fault Isolation):** If GitHub or LeetCode rate limits or fails, the application shall preserve historical records and display clear "Last synced on [date]" indicators.
- **NFR-7 (Idempotence):** Nightly synchronization jobs shall be idempotent and safely re-runnable without duplicating records.

### 4.4 Usability & Design
- **NFR-8 (Responsive Dark UI):** The user interface shall provide native dark-mode styling, accessible contrast ratios (&ge; 4.5:1), and responsive layouts for mobile and desktop screens.

---

## 5. System Constraints and Platform Limits
1. **LinkedIn Policies:** LinkedIn's official API does not permit unauthorized feed reading or scraping. DevProfile operates strictly as an output-only draft generator with manual copy-to-clipboard.
2. **LeetCode GraphQL API:** LeetCode does not host a documented public API; therefore, the adapter queries public GraphQL fields, caches daily snapshots, and handles schema volatility.
3. **Editor Scope:** Activity tracking is strictly restricted to VS Code; browser-based editors or external IDEs are outside the project scope.
