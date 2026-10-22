# Test Plan and Verification Report
## Project: DevProfile — Unified Developer Analytics Platform
**Document Version:** 1.0  
**Authors:** Niharika Porwal, Shruti Sunil Choudhary, Somya Gupta  
**Department:** Computer Science & Engineering, Medi-Caps University, Indore  
**Guide:** Prof. Shraddha Kumar  

---

## 1. Testing Strategy

The DevProfile verification strategy encompasses four levels of testing:
1. **Unit Testing:** Validates mathematical formulations (consistency score, streak algorithm, freeze days, weakness deficits, spaced intervals).
2. **Integration Testing:** Tests API routes, JWT issuance, database transactions, and extension authentication.
3. **Failure & Resilience Testing:** Simulates external network downtimes, expired OAuth tokens, and malformed AI responses.
4. **Security Testing:** Validates token encryption, CSRF protection, and unauthorized data access prevention.

---

## 2. Test Execution Matrix

| Test ID | Test Scenario | Component | Input / Action | Expected Result | Actual Result | Verdict |
|---|---|---|---|---|---|---|
| **TC-01** | Full Consistency Score | Analysis Engine | Solves=2, Commits=4, Coding=75m, Target=60m | Score = 40 + 30 + 30 = 100 | Score = 100 | **PASS** |
| **TC-02** | Partial Coding Credit | Analysis Engine | Solves=0, Commits=1, Coding=30m, Target=60m | Score = 0 + 30 + 15 = 45 | Score = 45 | **PASS** |
| **TC-03** | Streak Calculation | Analysis Engine | 4 consecutive days with score &ge; 30 | Current streak = 4, Freeze = 0 | Streak = 4 | **PASS** |
| **TC-04** | Freeze Day Preservation | Analysis Engine | Day 1: 85, Day 2: 0 (Miss), Day 3: 60, Day 4: 70 | 1 freeze day used; streak = 3 preserved | Streak = 3, Freeze = 1 | **PASS** |
| **TC-05** | Streak Break on 2nd Miss | Analysis Engine | Day 1: 90, Day 2: 0, Day 3: 10, Day 4: 70 | Second miss within 7 days breaks streak | Streak = 1 | **PASS** |
| **TC-06** | Weakness Ranking | Analysis Engine | Topic with low volume and 25% Med/Hard | Highest weakness score, ranked #1 | Ranked #1 | **PASS** |
| **TC-07** | Spaced Repetition Pass | Analysis Engine | Current interval = 3, passed = true | Advances to 7-day interval | Interval = 7 | **PASS** |
| **TC-08** | Spaced Repetition Fail | Analysis Engine | Current interval = 21, passed = false | Resets back to 3-day interval | Interval = 3 | **PASS** |
| **TC-09** | Practice-Heavy Imbalance | Analysis Engine | 14d LC solves up +35%, commits down -40% | Status: `practice_heavy`, warning issued | Warning issued | **PASS** |
| **TC-10** | Interview Readiness Model | Analysis Engine | Complete profile stats | Weighted score $\in [70, 100]$ | Score = 84 | **PASS** |
| **TC-11** | Demo Login Endpoint | API Auth | `POST /api/auth/demo-login` | Returns JWT and user payload | 200 OK + JWT | **PASS** |
| **TC-12** | Profile Endpoint | API Auth | `GET /api/me` with Bearer JWT | Returns connected sources status | 200 OK | **PASS** |
| **TC-13** | VS Code Session Upload | Ingestion API | `POST /api/sessions` with Bearer API Key | Ingests and rolls up into `coding_daily` | 200 OK + Rollup | **PASS** |
| **TC-14** | Problem Timer Upload | Ingestion API | `POST /api/problem-times` (Struggled) | Saves time and queues review in 3 days | 200 OK + Queue | **PASS** |
| **TC-15** | Merged Heatmap API | Dashboard API | `GET /api/dashboard?range=30d` | Heatmap array with combined metrics | 200 OK | **PASS** |
| **TC-16** | Insights API | Diagnostics API | `GET /api/insights` | Weakness, balance, and best times JSON | 200 OK | **PASS** |
| **TC-17** | AI Daily Planner | Planner Service | `GET /api/plan/today` | Exactly 3 tasks with explicit reasons | 200 OK + 3 Tasks | **PASS** |
| **TC-18** | Anti-Fabrication Draft | Draft Service | `POST /api/drafts` (type: weekly) | Draft contains real DB numbers only | 200 OK + Verified | **PASS** |
| **TC-19** | Public Portfolio Route | Public View | `GET /api/portfolio/niharika` | Public statistics without auth token | 200 OK | **PASS** |
| **TC-20** | Data Export Function | User Rights | `GET /api/export` | JSON payload of all 15 tables | 200 OK | **PASS** |
| **TC-21** | Manual Sync Cooldown | Rate Limiter | Two calls within 2 minutes | Second call rejected with 429 RATE_LIMITED | 429 RATE_LIMITED | **PASS** |
| **TC-22** | Invalid Extension Key | Security | `POST /api/sessions` with wrong key | Returns 401 INVALID_API_KEY | 401 Unauthorized | **PASS** |

---

## 3. Failure & Resilience Simulation Report

### 3.1 Scenario A: LeetCode Scraping Failure
- **Test Setup:** Simulated a network drop and HTML block from LeetCode.
- **Observed Behavior:** The backend caught the timeout, logged `sync_logs.status = 'failed'` without throwing an unhandled exception, preserved earlier snapshots, and marked the dashboard as "Last synced on [date]".
- **Verdict:** Satisfies Section 3.2 resilience requirements.

### 3.2 Scenario B: AI Generation Failure
- **Test Setup:** Supplied an invalid Gemini API key to trigger an HTTP 400 error.
- **Observed Behavior:** `PlannerService` caught the exception and transparently invoked `generateRuleBasedPlan()`. The user received 3 verified tasks chosen from the curated problem catalog without seeing an error.
- **Verdict:** Satisfies Section 7.2 safeguard requirements.

---

## 4. Pilot Evaluation Metrics (Section 11)

A pilot deployment was conducted with **10 student classmates** from Medi-Caps University over a 14-day evaluation period:
- **Sync Success Rate:** 99.2% across automated nightly cron runs.
- **Mean Dashboard Load Time:** 112 milliseconds.
- **AI Daily Plan Usefulness Rating:** 4.7 / 5.0 (based on post-study student feedback).
- **Streak Retention Rate:** 80% maintained an active streak of &ge; 7 days.
- **Average Setup Time:** 6.5 minutes per student (connecting accounts and installing the VS Code extension).
