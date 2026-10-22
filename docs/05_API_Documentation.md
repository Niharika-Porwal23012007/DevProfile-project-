# Backend API Specification
## Project: DevProfile — Unified Developer Analytics Platform
**Document Version:** 1.0  
**Authors:** Niharika Porwal, Shruti Sunil Choudhary, Somya Gupta  
**Department:** Computer Science & Engineering, Medi-Caps University, Indore  
**Guide:** Prof. Shraddha Kumar  

---

## 1. Overview
All responses are formatted in `application/json`. All routes except login and OAuth callbacks require authentication.

### Standard Error Format (Section 4)
```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Sync rate limit reached. Please wait 112 seconds before syncing again."
  }
}
```

Common Error Codes:
- `UNAUTHORIZED` (401): Missing or expired JWT / API key.
- `BAD_REQUEST` (400): Missing required query or body parameters.
- `RATE_LIMITED` (429): Action triggered before cooldown expiry.
- `NOT_FOUND` (404): Requested entity or portfolio does not exist.
- `INTERNAL_ERROR` (500): Unhandled exception.

---

## 2. Authentication Endpoints

### 2.1 Start GitHub OAuth
- **Route:** `GET /api/auth/github`
- **Auth:** Public
- **Description:** Generates a secure CSRF state token and returns GitHub's OAuth authorization URL.
- **Response:**
  ```json
  {
    "url": "https://github.com/login/oauth/authorize?client_id=...&scope=read:user%20user:email%20repo&state=...",
    "state": "8a3f9104b2c8901e"
  }
  ```

### 2.2 Finish GitHub OAuth Callback
- **Route:** `GET /api/auth/github/callback?code=...&state=...`
- **Auth:** Public
- **Description:** Verifies state, exchanges code for access token, encrypts token at rest, creates/updates user, and redirects to frontend with JWT.
- **Redirect:** `${FRONTEND_URL}/auth/callback?token=${jwtToken}&apiKey=${rawApiKey}`

### 2.3 Demo User Authentication
- **Route:** `POST /api/auth/demo-login`
- **Auth:** Public
- **Description:** Direct authentication for academic evaluation and presentation demo.
- **Response:**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_niharika_001",
      "name": "Niharika Porwal",
      "email": "niharika.porwal@medicaps.ac.in",
      "githubUsername": "niharikaporwal"
    }
  }
  ```

### 2.4 Get Current User Profile & Integration Status
- **Route:** `GET /api/me`
- **Auth:** Required (`Bearer <JWT>`)
- **Response:**
  ```json
  {
    "user": {
      "id": "usr_niharika_001",
      "name": "Niharika Porwal",
      "email": "niharika.porwal@medicaps.ac.in",
      "githubUsername": "niharikaporwal",
      "leetcodeUsername": "niharikaporwal",
      "publicSlug": "niharika",
      "isPublic": true,
      "timezone": "Asia/Kolkata",
      "createdAt": "2026-10-22T08:00:00Z"
    },
    "connectedSources": {
      "github": {
        "connected": true,
        "username": "niharikaporwal",
        "lastSynced": "2026-10-22T10:15:00Z",
        "syncStatus": "success"
      },
      "leetcode": {
        "connected": true,
        "username": "niharikaporwal",
        "lastSynced": "2026-10-22T10:15:00Z",
        "syncStatus": "success"
      },
      "vscode": { "connected": true },
      "linkedin": { "connected": false, "mode": "output_only" }
    }
  }
  ```

### 2.5 Regenerate Extension API Key
- **Route:** `POST /api/apikey/regenerate`
- **Auth:** Required (`Bearer <JWT>`)
- **Description:** Hashes and stores the new key in `users.api_key_hash`. Returns the raw key **only once**.
- **Response:**
  ```json
  {
    "message": "API key regenerated successfully. Store it safely in your VS Code extension settings; it will not be displayed again.",
    "apiKey": "devprof_91a0b3c4f9812e..."
  }
  ```

---

## 3. Synchronization Endpoints

### 3.1 Connect LeetCode Profile
- **Route:** `POST /api/connect/leetcode`
- **Auth:** Required (`Bearer <JWT>`)
- **Request Body:**
  ```json
  { "username": "niharikaporwal" }
  ```
- **Response:**
  ```json
  {
    "message": "LeetCode profile connected for @niharikaporwal",
    "profile": {
      "totalSolved": 156,
      "easy": 51,
      "medium": 89,
      "hard": 16,
      "syncStatus": "success"
    }
  }
  ```

### 3.2 Manual Sync Trigger
- **Route:** `POST /api/sync`
- **Auth:** Required (`Bearer <JWT>`)
- **Rate Limit:** Once every 2 minutes per user.
- **Response (Success):**
  ```json
  {
    "message": "Manual sync completed",
    "results": {
      "github": { "success": true, "dailyEntries": 365, "reposCount": 5 },
      "leetcode": { "syncStatus": "success", "totalSolved": 156 }
    },
    "todayScore": {
      "totalScore": 88,
      "leetcodePts": 40,
      "githubPts": 30,
      "codingPts": 18
    }
  }
  ```

---

## 4. Editor Extension & Tracking Endpoints

### 4.1 Ingest VS Code Coding Sessions
- **Route:** `POST /api/sessions`
- **Auth:** Required (`Bearer <apiKey>` or `<JWT>`)
- **Request Body:**
  ```json
  {
    "sessions": [
      {
        "project": "devprofile",
        "repoUrl": "https://github.com/niharikaporwal/devprofile",
        "language": "typescript",
        "file": "*.ts",
        "start": "2026-10-22T10:02:00Z",
        "durationSec": 1740
      }
    ]
  }
  ```
- **Response:**
  ```json
  {
    "message": "Successfully ingested and rolled up 1 coding sessions."
  }
  ```

### 4.2 Record LeetCode Problem Timer
- **Route:** `POST /api/problem-times`
- **Auth:** Required (`Bearer <apiKey>` or `<JWT>`)
- **Request Body:**
  ```json
  {
    "problem": "coin-change",
    "durationSec": 2520,
    "difficultyFeeling": "Struggled"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Problem time recorded.",
    "spacedRepetitionScheduled": true
  }
  ```

---

## 5. Dashboard, Insights & Goals Endpoints

### 5.1 Merged Dashboard Metrics
- **Route:** `GET /api/dashboard?range=30d`
- **Auth:** Required (`Bearer <JWT>`)
- **Query Params:** `range` (`7d`, `30d`, `90d`)
- **Response:**
  ```json
  {
    "today": {
      "date": "2026-10-22",
      "solvesCount": 2,
      "commitsCount": 4,
      "codingMinutes": 85,
      "consistencyScore": 100,
      "scoreBreakdown": {
        "leetcodePts": 40,
        "githubPts": 30,
        "codingPts": 30,
        "totalScore": 100
      }
    },
    "streak": {
      "currentStreak": 12,
      "longestStreak": 14,
      "freezeDaysUsedThisWeek": 0,
      "weeklyAverageScore": 88
    },
    "goals": {
      "leetcode": { "current": 2, "target": 2 },
      "commits": { "current": 4, "target": 3 },
      "codingMin": { "current": 85, "target": 60 }
    },
    "heatmap": [
      {
        "date": "2026-10-22",
        "commits": 4,
        "solves": 2,
        "codingMinutes": 85,
        "score": 100,
        "intensity": 4
      }
    ],
    "recentRepositories": [],
    "recentProblems": []
  }
  ```

### 5.2 Algorithmic Insights & Diagnostics
- **Route:** `GET /api/insights`
- **Auth:** Required (`Bearer <JWT>`)
- **Response:**
  ```json
  {
    "weaknesses": {
      "weakestTopics": [
        {
          "topic": "Dynamic Programming",
          "totalSolved": 16,
          "advancedRatio": 0.75,
          "reason": "Lacks depth: only 75% are Medium/Hard problems."
        }
      ],
      "averageSolved": 21.2
    },
    "balance": {
      "status": "balanced",
      "message": "Great balance between algorithmic practice and project building!",
      "details": {
        "leetCodeChangePct": 5,
        "buildChangePct": 12
      }
    },
    "skillGaps": [],
    "bestTimes": {
      "summary": "Your peak coding concentration occurs on Saturdays around 8:00 PM."
    },
    "interviewReadiness": {
      "overallScore": 84,
      "difficultyMixScore": 26,
      "topicCoverageScore": 22,
      "consistencyScore": 22,
      "projectActivityScore": 14,
      "whatToImprove": []
    }
  }
  ```

---

## 6. Spaced Repetition & Notes Endpoints

### 6.1 Problems Due for Review
- **Route:** `GET /api/reviews/today`
- **Auth:** Required (`Bearer <JWT>`)
- **Response:**
  ```json
  {
    "dueToday": [
      {
        "id": "rev_01",
        "problem_slug": "coin-change",
        "due_date": "2026-10-22",
        "interval_days": 3,
        "pattern_tag": "Dynamic Programming / Knapsack",
        "title": "Coin Change"
      }
    ],
    "upcoming": []
  }
  ```

### 6.2 Mark Review Done
- **Route:** `POST /api/reviews/:id/done`
- **Auth:** Required (`Bearer <JWT>`)
- **Request Body:**
  ```json
  { "passed": true }
  ```
- **Response:**
  ```json
  {
    "message": "Review completed! Progressed to next interval.",
    "nextInterval": 7
  }
  ```

### 6.3 Problem Notes & Pattern Tags
- **Route:** `GET /api/notes/:problemId` | `POST /api/notes/:problemId`
- **Auth:** Required (`Bearer <JWT>`)
- **Request Body (POST):**
  ```json
  {
    "noteText": "Unbounded knapsack: 1D tabulation dp[amount + 1].",
    "patternTag": "Dynamic Programming / Knapsack"
  }
  ```

---

## 7. AI Planner & Draft Endpoints

### 7.1 Today's AI Daily Plan
- **Route:** `GET /api/plan/today`
- **Auth:** Required (`Bearer <JWT>`)
- **Query Params:** `refresh=true` (forces re-generation)
- **Response:**
  ```json
  {
    "date": "2026-10-22",
    "tasks": [
      {
        "type": "practice",
        "title": "Solve Coin Change (Medium)",
        "minutes": 40,
        "reason": "DYNAMIC PROGRAMMING is your most under-practiced topic with the highest weakness score."
      },
      {
        "type": "project",
        "title": "Ship a commit to devprofile",
        "minutes": 30,
        "reason": "Continue feature development on devprofile."
      },
      {
        "type": "review",
        "title": "Redo course-schedule",
        "minutes": 20,
        "reason": "Scheduled spaced-repetition interval reached for this struggled problem."
      }
    ],
    "source": "ai"
  }
  ```

### 7.2 Generate LinkedIn Progress Draft
- **Route:** `POST /api/drafts`
- **Auth:** Required (`Bearer <JWT>`)
- **Request Body:**
  ```json
  { "type": "weekly" }
  ```
- **Response:**
  ```json
  {
    "id": "draft_01",
    "type": "weekly",
    "text": "🚀 Weekly Dev & DSA Progress Update...",
    "posted": false
  }
  ```

---

## 8. Portfolio, Export & Account Endpoints

### 8.1 Public Portfolio
- **Route:** `GET /api/portfolio/:publicSlug`
- **Auth:** Public
- **Response:** Public stats, top repositories, and verified skills.

### 8.2 Download JSON Export
- **Route:** `GET /api/export`
- **Auth:** Required (`Bearer <JWT>`)
- **Response:** JSON attachment containing all 15 tables for the user.

### 8.3 Permanent Account Deletion
- **Route:** `DELETE /api/account`
- **Auth:** Required (`Bearer <JWT>`)
- **Response:**
  ```json
  { "message": "Account and all associated records have been permanently deleted." }
  ```
