# System Design Document (SDD)
## Project: DevProfile — Unified Developer Analytics Platform
**Document Version:** 1.0  
**Authors:** Niharika Porwal, Shruti Sunil Choudhary, Somya Gupta  
**Department:** Computer Science & Engineering, Medi-Caps University, Indore  
**Guide:** Prof. Shraddha Kumar  

---

## 1. System Architecture Overview

DevProfile utilizes a modular, decoupled architecture consisting of a client dashboard, background editor daemon, central REST API, asynchronous cron worker, and persistent relational storage.

```mermaid
graph TD
    subgraph Clients
        FE["Web Frontend (React / Vite / Tailwind)"]
        EXT["VS Code Extension (TypeScript)"]
        PUB["Recruiters / Peers (Public Portfolio)"]
    end

    subgraph Backend Services
        API["Express API Server (Node.js / TS)"]
        SCHED["Cron Scheduler (Nightly Sync & Rollup)"]
        AUTH["Auth & Crypto Service (AES-256 / JWT)"]
        ANALYSIS["Analysis & Diagnostics Engine"]
        PLANNER["AI Daily Planner & Draft Service"]
    end

    subgraph External Platforms
        GH["GitHub API (GraphQL / OAuth)"]
        LC["LeetCode Public GraphQL"]
        AI["Gemini LLM API"]
    end

    subgraph Storage
        DB[("PostgreSQL / SQLite Database")]
    end

    EXT -->|"POST /api/sessions (Bearer API Key)"| API
    EXT -->|"POST /api/problem-times"| API
    FE -->|"REST + JWT"| API
    PUB -->|"GET /api/portfolio/:slug"| API

    API --> AUTH
    API --> ANALYSIS
    API --> PLANNER
    SCHED -->|"Nightly Trigger"| API

    API -->|"GraphQL"| GH
    API -->|"GraphQL"| LC
    PLANNER -->|"JSON Prompt"| AI
    API --> DB
```

---

## 2. Use-Case Model

```mermaid
flowchart LR
    Student((Student User))
    Recruiter((Recruiter / Peer))
    Cron((Cron Scheduler))
    Extension((VS Code Extension))

    subgraph DevProfile System
        UC1[Authenticate with GitHub]
        UC2[View Unified Dashboard & Heatmap]
        UC3[Inspect Weak Topics & Balance]
        UC4[Execute AI Daily Plan Tasks]
        UC5[Review Spaced Repetition Cards]
        UC6[Generate Verified LinkedIn Drafts]
        UC7[Export / Delete Personal Data]
        UC8[Track Active Coding Sessions]
        UC9[Record Problem Solve Duration]
        UC10[Perform Nightly Sync & Pruning]
        UC11[View Public Portfolio]
    end

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC5
    Student --> UC6
    Student --> UC7

    Extension --> UC8
    Extension --> UC9

    Cron --> UC10

    Recruiter --> UC11
```

---

## 3. Data-Flow Diagrams (DFD)

### 3.1 Level 0 DFD (Context Diagram)

```mermaid
flowchart TD
    User["Student User"]
    Ext["VS Code Extension"]
    GH["GitHub Platform"]
    LC["LeetCode Platform"]
    AI["Gemini LLM"]
    System["DevProfile Unified System (Process 0)"]
    Portfolio["Public Recruiter"]

    User -->|"OAuth Credentials, Goals, Notes"| System
    System -->|"Dashboards, Plans, LinkedIn Drafts"| User

    Ext -->|"Batched Sessions, Problem Timers"| System
    System -->|"Sync Ack, Extension Keys"| Ext

    System -->|"Authenticated GraphQL Queries"| GH
    GH -->|"Commit Calendar, Repos, PRs"| System

    System -->|"Public GraphQL Queries"| LC
    LC -->|"Solved Counts, Topics, Calendar"| System

    System -->|"Factual JSON Summary"| AI
    AI -->|"Structured 3-Task Action Plan"| System

    System -->|"Verified Public Portfolio View"| Portfolio
```

### 3.2 Level 1 DFD (Decomposed System Architecture)

```mermaid
flowchart TD
    User["Student User"]
    Ext["VS Code Extension"]
    
    P1["1.0 Authentication & Session Management"]
    P2["2.0 Data Synchronization (GitHub & LeetCode)"]
    P3["3.0 Session Ingestion & Rollup"]
    P4["4.0 Analysis & Scoring Engine"]
    P5["5.0 AI Planner & Draft Generator"]
    P6["6.0 Spaced Repetition Manager"]

    D1[("Users & Keys")]
    D2[("Daily Activity & Repos")]
    D3[("LeetCode Snapshots & Solves")]
    D4[("Coding Sessions & Daily Rollup")]
    D5[("Scores, Reviews & Notes")]
    D6[("Generated Plans & Posts")]

    User -->|"Login / OAuth"| P1
    P1 <-->|"Read/Write User & Key"| D1

    P2 -->|"Nightly / Manual Sync"| D2
    P2 -->|"Snapshot Storage"| D3

    Ext -->|"POST /api/sessions"| P3
    P3 -->|"Raw Sessions"| D4
    P3 -->|"Immediate Daily Rollup"| D4

    D2 & D3 & D4 -->|"Aggregated Activity"| P4
    P4 -->|"Store Scores & Streak"| D5

    D3 & D5 -->|"Struggled Problems"| P6
    P6 -->|"Due Reviews"| D5

    D2 & D3 & D5 -->|"Factual DB Metrics"| P5
    P5 -->|"Store Daily Tasks & Drafts"| D6

    P4 & P5 & P6 -->|"JSON Dashboard Payload"| User
```

---

## 4. Sequence Diagrams

### 4.1 GitHub OAuth Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Student
    participant Browser as Client Browser
    participant API as DevProfile Backend
    participant GH as GitHub OAuth / API
    participant DB as Database

    User->>Browser: Click "Login with GitHub"
    Browser->>API: GET /api/auth/github
    API->>API: Generate cryptographic random state
    API-->>Browser: Return GitHub authorize URL with state
    Browser->>GH: Redirect to github.com/login/oauth/authorize
    User->>GH: Grant authorization permissions
    GH-->>Browser: Redirect to callback URL with ?code=...&state=...
    Browser->>API: GET /api/auth/github/callback?code=...&state=...
    API->>API: Validate state token (anti-CSRF)
    API->>GH: POST /login/oauth/access_token (code, client_secret)
    GH-->>API: Return access_token
    API->>GH: GET /user (Bearer access_token)
    GH-->>API: Return user profile (id, login, email)
    API->>API: Encrypt access_token with AES-256-GCM
    API->>DB: Upsert user record with encrypted token
    API->>API: Sign JWT session token
    API-->>Browser: Redirect to dashboard with JWT session cookie
    Browser->>User: Display authenticated dashboard
```

### 4.2 Nightly Synchronization & Consistency Score Flow

```mermaid
sequenceDiagram
    autonumber
    participant Cron as Cron Scheduler (00:05 AM)
    participant API as Backend Services
    participant GH as GitHub GraphQL
    participant LC as LeetCode GraphQL
    participant DB as Database

    Cron->>API: Trigger runNightlyJobs()
    API->>DB: Fetch active users with tokens/usernames
    loop For each registered user
        API->>GH: Query contributionsCollection & repositories
        GH-->>API: Commit counts, PRs, issues, repo stats
        API->>DB: Upsert github_daily & github_repos
        API->>API: Respect polite delay (1000ms)
        API->>LC: Query matchedUser submitStats, tags & calendar
        LC-->>API: Solved counts (E/M/H), topic tags, calendar JSON
        API->>DB: Upsert leetcode_snapshots & solved_problems
        API->>DB: Fetch today's solves, commits, and coding seconds
        API->>API: Calculate Consistency Score (LC 40, GH 30, Coding 30)
        API->>DB: Insert daily_scores record
    end
    API->>DB: Prune coding_sessions older than 90 days
    API-->>Cron: Nightly job complete confirmation
```

### 4.3 VS Code Session Tracking & Idle Timeout Flow

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Student Developer
    participant VS as VS Code Editor
    participant Ext as DevProfile Extension
    participant API as DevProfile Backend
    participant DB as Database

    Dev->>VS: Type code / edit document
    VS->>Ext: workspace.onDidChangeTextDocument
    Ext->>Ext: Check project against ignored list
    alt Active session exists and gap < 2 mins
        Ext->>Ext: Add elapsed gap to current session duration
    else Gap > 2 minutes or context changed
        Ext->>Ext: Close active session and push to local buffer
        Ext->>Ext: Start new session for current file/language
    end

    loop Every 3 minutes (Interval Flush)
        Ext->>Ext: Merge adjacent sessions on same project/file
        Ext->>API: POST /api/sessions (Bearer API Key, JSON payload)
        API->>DB: Validate api_key_hash
        API->>DB: Insert into coding_sessions
        API->>DB: Atomically roll up into coding_daily (total_sec, by_lang, by_project)
        API-->>Ext: Ingestion acknowledgement (200 OK)
    end
```

### 4.4 AI Daily Planner Generation Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Student
    participant UI as Dashboard UI
    participant API as Backend Router
    participant DB as Database
    participant AI as Gemini 1.5 Flash API

    User->>UI: Navigate to "AI Daily Plan" tab
    UI->>API: GET /api/plan/today
    API->>DB: Check if plan already exists for today
    alt Plan exists in database
        DB-->>API: Return cached plan_json & followed_json
        API-->>UI: Return tasks
    else Plan not generated yet
        API->>DB: Query weakest topics (LeetCode snapshot)
        API->>DB: Query reviews due today (reviews table)
        API->>DB: Query days since last commit per repo (github_repos)
        API->>DB: Query today's goal progress & current streak
        API->>API: Assemble compact factual JSON payload
        alt LLM API Key Available
            API->>AI: POST generateContent (Factual summary + strict JSON instruction)
            alt AI responds with valid 3-task schema
                AI-->>API: Return tasks JSON
            else AI call fails, times out or schema invalid
                API->>API: Fall back to deterministic rule-based planner (curated catalog)
            end
        else No LLM API Key Configured
            API->>API: Execute deterministic rule-based planner
        end
        API->>DB: Store generated plan in plans table
        API-->>UI: Return structured 3 tasks with verified reasons
    end
    UI->>User: Render interactive checklist
```

---

## 5. Extension Activity State Diagram

```mermaid
stateDiagram-v2
    [*] --> Idle: Extension Activated
    Idle --> Tracking: onDidChangeTextDocument
    Tracking --> Tracking: Keystroke detected within 2 mins
    Tracking --> Idle: Inactivity > 2 minutes (Idle Timeout)
    Tracking --> Idle: Window lost focus
    Tracking --> FileSwitched: Editor switched file/project
    FileSwitched --> Tracking: Close previous session & start new
    Tracking --> Paused: User clicked Status Bar Toggle
    Paused --> Idle: User resumed tracking
    Tracking --> [*]: VS Code Closed (Flush buffer to disk/API)
```
