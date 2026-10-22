# Student User Manual
## Project: DevProfile — Unified Developer Analytics Platform
**Document Version:** 1.0  
**Authors:** Niharika Porwal, Shruti Sunil Choudhary, Somya Gupta  
**Department:** Computer Science & Engineering, Medi-Caps University, Indore  
**Guide:** Prof. Shraddha Kumar  

---

## 1. Getting Started in 3 Steps

Welcome to **DevProfile**! Follow these steps to connect your developer footprint:

### Step 1: Sign In & Onboarding
1. Navigate to the DevProfile web portal (`http://localhost:5173` or your production domain).
2. Click **"Login with GitHub"** to authorize your profile (or click **"Demo Login"** for immediate sandbox exploration).
3. In the left navigation bar, open **"Extension Setup"**.

### Step 2: Connect LeetCode
1. Enter your public LeetCode username (e.g. `niharikaporwal`) and click **"Connect"**.
2. DevProfile pulls your solved counts, topic distributions, and calendar without asking for your password or cookies.

### Step 3: Install the VS Code Extension
1. Under "Extension Setup", click **"Generate Personal API Key"**.
2. Click **"Copy"** to copy your key (e.g. `devprof_...`).
3. In VS Code, open Settings (`Cmd+,` on Mac or `Ctrl+,` on Windows), search for **"DevProfile: Api Key"**, and paste your key.

---

## 2. Navigating the Dashboard

```
+---------------------------------------------------------------------------------+
| 🔥 Active Streak: 12 Days         Weekly Score Average: 88/100                 |
| Today's Score: 100/100 (LeetCode: 40/40 • GitHub: 30/30 • VS Code: 30/30)      |
+---------------------------------------------------------------------------------+
```

### 2.1 Consistency Score (0 - 100)
- **LeetCode (40 pts):** Earned by solving at least one problem today.
- **GitHub (30 pts):** Earned by pushing at least one commit to your repos.
- **VS Code Focus (30 pts):** Awarded proportionally as you approach your daily coding target (default: 60 minutes).
- **Weekly Average:** Average of the last 7 daily consistency scores.

### 2.2 Streak & Freeze Days
- **Active Day:** A day with a score of $\ge 30$ counts toward your streak.
- **Freeze Day:** You receive **1 rest day per week** that preserves your streak if college exams or travel prevent coding.

### 2.3 Merged Contribution Heatmap
Combines your Git commits, LeetCode submissions, and active IDE coding hours into a unified green matrix. Hover over any day to view detailed metrics.

---

## 3. Using the VS Code Extension

Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows) to open the Command Palette:

1. **`DevProfile: Start Problem`**  
   Prompts you for the problem slug (e.g. `coin-change`), launches a scratchpad file, and begins timing in your status bar (`$(watch) coin-change [04:15]`).

2. **`DevProfile: Mark Solved`**  
   Stops the timer, prompts for difficulty feeling (*Easy, Medium, Hard, or Struggled*), and records the session. If marked *Struggled* or taking over 40 minutes, it automatically queues the problem for spaced repetition!

3. **`DevProfile: Pomodoro Start/Stop`**  
   Starts a 25-minute focus interval followed by a 5-minute break.

4. **`DevProfile: Toggle Tracking`**  
   Click the status bar item to pause tracking when stepping away from your desk.

---

## 4. Following Today's AI Daily Plan

Navigate to the **"AI Daily Plan"** tab:
1. Each morning, DevProfile analyzes your database gaps to generate **exactly 3 tasks**:
   - **Practice Task:** Targets your weakest algorithmic topic.
   - **Project Task:** Highlights a repo that hasn't received commits in several days.
   - **Review Task:** Re-attempts a struggled problem whose retention interval is due.
2. Click the checkbox next to any task as you complete it. Your progress is saved automatically.

---

## 5. Spaced Repetition & Pattern Notes

Navigate to the **"Spaced Reviews"** tab:
1. Problems due for review appear in the **Due Today** queue.
2. Click **"Solve on LeetCode"** to re-attempt the problem.
3. If you solve it cleanly, click **"Solved"** &rarr; advances interval to 7 or 21 days.
4. If you struggle or need hints, click **"Struggled"** &rarr; resets interval to 3 days so you revisit it soon.
5. Click the **Note icon** to record key takeaways, state transitions, or pattern tags (e.g. *Two Pointers, Sliding Window*).

---

## 6. Sharing Verified LinkedIn Milestones

Navigate to the **"LinkedIn Drafts"** tab:
1. Select **Weekly Recap** or **Project Milestone**.
2. DevProfile compiles your verified numbers (commits, solves, hours, streak).
3. Click **"Copy Draft"**, open LinkedIn, paste the text, and publish your milestone with confidence!
