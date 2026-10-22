# Platform Integration Notes
## Project: DevProfile — Unified Developer Analytics Platform
**Document Version:** 1.0  
**Authors:** Niharika Porwal, Shruti Sunil Choudhary, Somya Gupta  
**Department:** Computer Science & Engineering, Medi-Caps University, Indore  
**Guide:** Prof. Shraddha Kumar  

---

## 1. GitHub Integration (Official & Resilient)

### 1.1 Purpose
Ingests daily verified commits, pull requests, issue contributions, and public repositories to populate `github_daily` and `github_repos`.

### 1.2 Authentication & Token Security
- **Protocol:** OAuth 2.0 Web Application Flow.
- **Scope Requested:** `read:user`, `user:email`, `repo`.
- **Anti-CSRF:** A 32-character cryptographically secure hex state is verified during the callback.
- **At-Rest Encryption:** Access tokens are encrypted using **AES-256-GCM** with an initialization vector (IV) and authentication tag prior to database storage. Plaintext tokens never touch persistent storage.

### 1.3 GraphQL Query Used
```graphql
query {
  viewer {
    login
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
    repositories(first: 20, orderBy: {field: PUSHED_AT, direction: DESC}, privacy: PUBLIC) {
      nodes {
        name
        url
        stargazerCount
        pushedAt
        primaryLanguage { name }
        languages(first: 5) { nodes { name } }
      }
    }
  }
}
```

### 1.4 Rate Limiting & Error Handling
- **Budget:** Authenticated GraphQL tokens provide an hourly quota of 5,000 points.
- **Failure on 401 Unauthorized:** If a token is revoked or expired, the backend flags `github_token_enc` as expired and prompts reconnection without deleting historical snapshots.
- **Backoff:** Nightly cron jobs execute sequentially with polite delays (1000ms) between users.

---

## 2. LeetCode Integration (Unofficial & Isolated)

### 2.1 Purpose
Pulls solved problem counts (Easy, Medium, Hard), topic categories, and the submission calendar to calculate weakness rankings and spaced-repetition triggers.

### 2.2 Connection Strategy (Zero Credential Risk)
- **No Passwords or Session Cookies:** DevProfile never requests the user's LeetCode password or session cookie (`LEETCODE_SESSION`), eliminating security vulnerabilities.
- **Public Profile Scrape:** The user connects their public LeetCode username.
- **Optional Verification Code:** The system generates a verification code (e.g. `DEVPROF-9812`) that the student temporarily places in their LeetCode summary to prevent username hijacking.

### 2.3 GraphQL Query
Endpoint: `https://leetcode.com/graphql`
```graphql
query userProfileAndStats($username: String!) {
  matchedUser(username: $username) {
    username
    submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
      }
    }
    tagProblemCounts {
      fundamental { tagName problemsSolved }
      intermediate { tagName problemsSolved }
      advanced { tagName problemsSolved }
    }
    userCalendar {
      submissionCalendar
    }
  }
  recentAcSubmissionList(username: $username, limit: 15) {
    title
    titleSlug
    timestamp
  }
}
```

### 2.4 Isolation & Adapter Pattern (Section 3.2)
All LeetCode network queries are isolated in `leetcodeSync.ts` implementing an `ILeetCodeAdapter` interface. If LeetCode alters their GraphQL schema:
1. Only `leetcodeSync.ts` requires updating.
2. The rest of the application (scores, planners, dashboard) remains untouched.
3. If an endpoint becomes temporarily unreachable, the last good cached snapshot in `leetcode_snapshots` is preserved and served to the user with a "Last synced on [date]" notice.

---

## 3. VS Code Extension (Push Model Companion)

### 3.1 Purpose
VS Code does not expose background APIs to external web services. Our lightweight extension runs directly within the editor to collect focus metadata and time problem solving.

### 3.2 Authentication
- Authenticated via personal API key (`Authorization: Bearer devprof_...`).
- Stored as a SHA-256 hash in `users.api_key_hash`. Keys can be regenerated or revoked anytime.

### 3.3 Event Listener Mapping
| Goal | VS Code Event API |
|---|---|
| Keystrokes & Typings | `workspace.onDidChangeTextDocument` |
| File Saves | `workspace.onDidSaveTextDocument` |
| Active Editor Switch | `window.onDidChangeActiveTextEditor` |
| Window Focus Change | `window.onDidChangeWindowState` |
| Detected Language | `document.languageId` |
| Workspace / Project | `workspace.name` |

### 3.4 Idle Gap & Merging Logic
1. **Activity Timestamp:** Every keystroke logs a timestamp.
2. **Idle Timeout:** If the interval between keystrokes exceeds 2 minutes or the window loses focus, the current session closes.
3. **Session Merging:** Finished sessions on the same file are coalesced to minimize payload size before batched transmission to `POST /api/sessions`.

### 3.5 Privacy Safeguards
- `trackFileNames`: Disabled by default; only the file extension (e.g. `*.ts`) is transmitted unless explicitly opted in.
- `ignoredProjects`: Pattern list (e.g. `node_modules`, `.git`, `dist`, `secret`) completely skipped.
- **Content Security:** Source code content is **never read or sent**.

---

## 4. LinkedIn Integration (Output-Only Rationale)

### 4.1 Legal & Terms of Service Compliance
- LinkedIn's Official API strictly restricts member feed writing and profile scraping to enterprise partners.
- Third-party scraping violates LinkedIn Section 8.2 terms and exposes user profiles to bans.
- Consequently, DevProfile intentionally implements an **output-only draft generator**.

### 4.2 Anti-Fabrication Guarantee
All generated post templates and resume bullets extract real numbers directly from `github_daily`, `coding_daily`, and `leetcode_snapshots`. The student clicks "Copy Draft", reviews the post in their browser, and pastes it manually with full verification.
