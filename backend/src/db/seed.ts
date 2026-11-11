import { db } from './database';
import { hashApiKey, encryptToken } from '../services/cryptoService';
import { AnalysisService } from '../services/analysisService';
import { randomUUID } from 'crypto';

export function runSeed() {
  console.log('[Seed] Seeding DevProfile database with realistic academic portfolio data...');

  // Clear existing data
  db.exec(`
    DELETE FROM sync_logs;
    DELETE FROM plans;
    DELETE FROM generated_posts;
    DELETE FROM problem_notes;
    DELETE FROM daily_scores;
    DELETE FROM goals;
    DELETE FROM reviews;
    DELETE FROM problem_times;
    DELETE FROM coding_daily;
    DELETE FROM coding_sessions;
    DELETE FROM leetcode_solved_problems;
    DELETE FROM leetcode_snapshots;
    DELETE FROM github_repos;
    DELETE FROM github_daily;
    DELETE FROM users;
  `);

  const userId = 'usr_niharika_001';
  const rawApiKey = 'devprof_seed_secret_key_123';
  const apiKeyHash = hashApiKey(rawApiKey);
  const dummyGhToken = encryptToken('ghp_mock_student_token_devprofile_2026');

  // 1. Create primary student user
  db.prepare(`
    INSERT INTO users (id, name, email, github_id, github_username, github_token_enc, leetcode_username, linkedin_sub, api_key_hash, public_slug, is_public, timezone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'Asia/Kolkata')
  `).run(
    userId,
    'Niharika Porwal',
    'niharika.porwal@devprofile.io',
    '8472910',
    'niharikaporwal',
    dummyGhToken,
    'niharikaporwal',
    'li_sub_928371',
    apiKeyHash,
    'niharika'
  );

  console.log(`[Seed] Created User: Niharika Porwal (API Key: ${rawApiKey})`);

  // 2. Insert GitHub Repositories
  const repos = [
    { name: 'devprofile', url: 'https://github.com/niharikaporwal/devprofile', lang: 'TypeScript', langs: ['TypeScript', 'React', 'CSS'], stars: 28, daysAgo: 0 },
    { name: 'algo-visualizer', url: 'https://github.com/niharikaporwal/algo-visualizer', lang: 'TypeScript', langs: ['TypeScript', 'Canvas', 'HTML'], stars: 19, daysAgo: 3 },
    { name: 'campus-connect', url: 'https://github.com/niharikaporwal/campus-connect', lang: 'JavaScript', langs: ['JavaScript', 'Node.js', 'Express'], stars: 14, daysAgo: 8 },
    { name: 'distributed-kv-store', url: 'https://github.com/niharikaporwal/distributed-kv-store', lang: 'Go', langs: ['Go', 'Raft', 'Protobuf'], stars: 11, daysAgo: 14 },
    { name: 'smart-attendance-system', url: 'https://github.com/niharikaporwal/smart-attendance-system', lang: 'Python', langs: ['Python', 'OpenCV'], stars: 22, daysAgo: 21 }
  ];

  const insertRepo = db.prepare(`
    INSERT INTO github_repos (id, user_id, repo_name, url, primary_language, languages_json, stars, pushed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const r of repos) {
    const pushedDate = new Date();
    pushedDate.setDate(pushedDate.getDate() - r.daysAgo);
    insertRepo.run(
      randomUUID(),
      userId,
      r.name,
      r.url,
      r.lang,
      JSON.stringify(r.langs),
      r.stars,
      pushedDate.toISOString()
    );
  }

  // 3. Generate 35 days of history for github_daily, coding_daily, and daily_scores
  const insertGhDaily = db.prepare(`
    INSERT INTO github_daily (id, user_id, date, commits, prs, issues, repos_touched)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertCodingDaily = db.prepare(`
    INSERT INTO coding_daily (id, user_id, date, total_sec, by_language_json, by_project_json)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertDailyScore = db.prepare(`
    INSERT INTO daily_scores (id, user_id, date, consistency_score, leetcode_pts, github_pts, coding_pts)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertCodingSession = db.prepare(`
    INSERT INTO coding_sessions (id, user_id, project, repo_url, language, file, start_time, duration_sec)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (let i = 34; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Activity distribution: higher on weekdays, moderate on weekends, 2 freeze/low days in past month
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const isLowDay = i === 18 || i === 4; // Simulated low or freeze days

    const commits = isLowDay ? 0 : isWeekend ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 5) + 2;
    const solves = isLowDay ? 0 : Math.floor(Math.random() * 3) + 1;
    const codingMins = isLowDay ? 15 : isWeekend ? 45 + Math.floor(Math.random() * 40) : 60 + Math.floor(Math.random() * 75);
    const totalSec = codingMins * 60;

    insertGhDaily.run(randomUUID(), userId, dateStr, commits, commits > 3 ? 1 : 0, 0, commits > 0 ? 1 : 0);

    const langJson = JSON.stringify({
      TypeScript: Math.round(totalSec * 0.6),
      Python: Math.round(totalSec * 0.25),
      Go: Math.round(totalSec * 0.15)
    });

    const projJson = JSON.stringify({
      devprofile: Math.round(totalSec * 0.65),
      'algo-visualizer': Math.round(totalSec * 0.35)
    });

    insertCodingDaily.run(randomUUID(), userId, dateStr, totalSec, langJson, projJson);

    // Calculate daily score
    const scoreBreakdown = AnalysisService.calculateDailyScore(solves, commits, codingMins, 60);
    insertDailyScore.run(
      randomUUID(),
      userId,
      dateStr,
      scoreBreakdown.totalScore,
      scoreBreakdown.leetcodePts,
      scoreBreakdown.githubPts,
      scoreBreakdown.codingPts
    );

    // Add recent raw coding sessions for the last 7 days
    if (i <= 7) {
      const start1 = new Date(d);
      start1.setHours(14, 15, 0);
      insertCodingSession.run(
        randomUUID(),
        userId,
        'devprofile',
        'https://github.com/niharikaporwal/devprofile',
        'TypeScript',
        'src/components/Dashboard.tsx',
        start1.toISOString(),
        Math.round(totalSec * 0.6)
      );

      const start2 = new Date(d);
      start2.setHours(20, 30, 0);
      insertCodingSession.run(
        randomUUID(),
        userId,
        'devprofile',
        'https://github.com/niharikaporwal/devprofile',
        'TypeScript',
        'src/sync/githubSync.ts',
        start2.toISOString(),
        Math.round(totalSec * 0.4)
      );
    }
  }

  // 4. LeetCode Snapshot
  const topicCounts = {
    'Dynamic Programming': { total: 16, easy: 4, medium: 10, hard: 2 },
    'Graphs': { total: 14, easy: 2, medium: 9, hard: 3 },
    'Trees': { total: 24, easy: 9, medium: 13, hard: 2 },
    'Two Pointers': { total: 28, easy: 10, medium: 16, hard: 2 },
    'Arrays': { total: 42, easy: 18, medium: 21, hard: 3 },
    'Binary Search': { total: 18, easy: 5, medium: 11, hard: 2 },
    'Sliding Window': { total: 8, easy: 2, medium: 5, hard: 1 },
    'Backtracking': { total: 6, easy: 1, medium: 4, hard: 1 }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  db.prepare(`
    INSERT INTO leetcode_snapshots (id, user_id, date, easy, medium, hard, topic_counts_json, calendar_json, sync_status)
    VALUES (?, ?, ?, 51, 89, 16, ?, '{}', 'success')
  `).run(randomUUID(), userId, todayStr, JSON.stringify(topicCounts));

  // 5. Solved Problems list
  const solvedList = [
    { slug: 'coin-change', title: 'Coin Change', diff: 'Medium', tags: ['Dynamic Programming'], struggled: 1, daysAgo: 3 },
    { slug: 'course-schedule', title: 'Course Schedule', diff: 'Medium', tags: ['Graphs', 'Topological Sort'], struggled: 1, daysAgo: 7 },
    { slug: 'number-of-islands', title: 'Number of Islands', diff: 'Medium', tags: ['Graphs', 'BFS', 'DFS'], struggled: 0, daysAgo: 1 },
    { slug: 'lowest-common-ancestor-of-a-binary-search-tree', title: 'Lowest Common Ancestor of a BST', diff: 'Medium', tags: ['Trees'], struggled: 0, daysAgo: 2 },
    { slug: '3sum', title: '3Sum', diff: 'Medium', tags: ['Two Pointers', 'Arrays'], struggled: 1, daysAgo: 12 },
    { slug: 'trapping-rain-water', title: 'Trapping Rain Water', diff: 'Hard', tags: ['Two Pointers', 'Monotonic Stack'], struggled: 1, daysAgo: 21 },
    { slug: 'longest-substring-without-repeating-characters', title: 'Longest Substring Without Repeating Characters', diff: 'Medium', tags: ['Sliding Window'], struggled: 0, daysAgo: 0 },
    { slug: 'climbing-stairs', title: 'Climbing Stairs', diff: 'Easy', tags: ['Dynamic Programming'], struggled: 0, daysAgo: 4 },
    { slug: 'invert-binary-tree', title: 'Invert Binary Tree', diff: 'Easy', tags: ['Trees'], struggled: 0, daysAgo: 5 }
  ];

  const insertSolved = db.prepare(`
    INSERT INTO leetcode_solved_problems (id, user_id, slug, title, difficulty, topic_tags, solved_at, struggled)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of solvedList) {
    const sDate = new Date();
    sDate.setDate(sDate.getDate() - item.daysAgo);
    insertSolved.run(
      randomUUID(),
      userId,
      item.slug,
      item.title,
      item.diff,
      JSON.stringify(item.tags),
      sDate.toISOString(),
      item.struggled
    );
  }

  // 6. Spaced Repetition Reviews
  const insertReview = db.prepare(`
    INSERT INTO reviews (id, user_id, problem_slug, due_date, interval_days, done_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Review 1: due today (Coin Change - interval 3 days)
  insertReview.run(randomUUID(), userId, 'coin-change', todayStr, 3, null);

  // Review 2: due today (Course Schedule - interval 7 days)
  insertReview.run(randomUUID(), userId, 'course-schedule', todayStr, 7, null);

  // Review 3: upcoming in 4 days (3Sum - interval 21 days)
  const upDate1 = new Date();
  upDate1.setDate(upDate1.getDate() + 4);
  insertReview.run(randomUUID(), userId, '3sum', upDate1.toISOString().split('T')[0], 21, null);

  // Review 4: completed review
  const doneDate = new Date();
  doneDate.setDate(doneDate.getDate() - 1);
  insertReview.run(randomUUID(), userId, 'number-of-islands', doneDate.toISOString().split('T')[0], 3, doneDate.toISOString());

  // 7. Problem Notes with Pattern Tags
  const insertNote = db.prepare(`
    INSERT INTO problem_notes (id, user_id, problem_slug, note_text, pattern_tag, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `);

  insertNote.run(
    randomUUID(),
    userId,
    'coin-change',
    'Unbounded Knapsack variation. Use dp[amount + 1] initialized to amount + 1. Base case dp[0] = 0. Iterate coins through amounts.',
    'Dynamic Programming / Knapsack'
  );

  insertNote.run(
    randomUUID(),
    userId,
    'course-schedule',
    'Detect cycle in directed graph using Kahn’s algorithm (in-degree array + BFS queue) or 3-color DFS (0=unvisited, 1=visiting, 2=visited).',
    'Graph / Topological Sort'
  );

  insertNote.run(
    randomUUID(),
    userId,
    'trapping-rain-water',
    'Two-pointer optimal approach: maintain left_max and right_max, increment the smaller pointer inward. O(1) extra space.',
    'Two Pointers'
  );

  // 8. Goals
  const insertGoal = db.prepare(`
    INSERT INTO goals (id, user_id, type, target_value, period)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertGoal.run(randomUUID(), userId, 'daily_leetcode', 2, 'daily');
  insertGoal.run(randomUUID(), userId, 'daily_commits', 3, 'daily');
  insertGoal.run(randomUUID(), userId, 'daily_coding_min', 60, 'daily');
  insertGoal.run(randomUUID(), userId, 'weekly_leetcode', 12, 'weekly');

  // 9. Initial Sync Logs
  const insertSyncLog = db.prepare(`
    INSERT INTO sync_logs (id, user_id, source, status, run_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `);
  insertSyncLog.run(randomUUID(), userId, 'github', 'success');
  insertSyncLog.run(randomUUID(), userId, 'leetcode', 'success');

  // 10. Pre-generate LinkedIn Draft
  db.prepare(`
    INSERT INTO generated_posts (id, user_id, type, text, posted)
    VALUES (?, ?, 'weekly', ?, 0)
  `).run(
    randomUUID(),
    userId,
    `🚀 Weekly Dev & DSA Progress Update

Consistent execution compounds over time. Here is my verified weekly breakdown:

• 🧠 Problem Solving: Solved 9 LeetCode problems (focused on Dynamic Programming & Graphs).
• 💻 Software Engineering: Shipped 23 commits to my repositories, actively developing "devprofile".
• ⏱ Focused Coding: Logged 16.5 hours of focused development tracked in VS Code.
• 🔥 Habit & Discipline: Current active streak at 12 days with a weekly consistency score of 88/100.

Key Takeaway: Overcoming the Coin Change subproblem state transition helped cement 1D tabulation!

#Coding #DSA #SoftwareEngineering #Consistency #DevProfile`
  );

  console.log('[Seed] Database seeded successfully with full 35-day dataset!');
}

if (require.main === module) {
  runSeed();
}
