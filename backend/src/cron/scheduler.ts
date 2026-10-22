import cron from 'node-cron';
import { db } from '../db/database';
import { GitHubSync } from '../sync/githubSync';
import { LeetCodeSync } from '../sync/leetcodeSync';
import { AnalysisService } from '../services/analysisService';
import { randomUUID } from 'crypto';

/**
 * Executes all nightly jobs across all registered users:
 * 1. Nightly GitHub sync
 * 2. Nightly LeetCode sync
 * 3. Daily consistency score calculation
 * 4. Pruning coding_sessions older than 90 days (after rolling into coding_daily)
 */
export async function runNightlyJobs() {
  console.log('[Scheduler] Starting nightly data sync & calculation jobs...');
  const users = db.prepare('SELECT id, github_token_enc, leetcode_username FROM users').all() as any[];

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const targetDate = yesterday.toISOString().split('T')[0];

  for (const user of users) {
    try {
      // 1. Sync GitHub if token present
      if (user.github_token_enc) {
        await GitHubSync.syncUser(user.id);
      }

      // Add a polite delay between users to respect rate limits (Section 3.2)
      await new Promise(r => setTimeout(r, 1000));

      // 2. Sync LeetCode if username present
      if (user.leetcode_username) {
        await LeetCodeSync.syncUser(user.id);
      }

      // 3. Calculate and record yesterday's consistency score
      const solves = db.prepare("SELECT COUNT(*) as count FROM leetcode_solved_problems WHERE user_id = ? AND date(solved_at) = ?").get(user.id, targetDate) as any;
      const commits = db.prepare("SELECT commits FROM github_daily WHERE user_id = ? AND date = ?").get(user.id, targetDate) as any;
      const coding = db.prepare("SELECT total_sec FROM coding_daily WHERE user_id = ? AND date = ?").get(user.id, targetDate) as any;

      const solvedCount = solves?.count || 0;
      const commitCount = commits?.commits || 0;
      const codingMinutes = Math.round((coding?.total_sec || 0) / 60);

      const score = AnalysisService.calculateDailyScore(solvedCount, commitCount, codingMinutes);

      db.prepare(`
        INSERT INTO daily_scores (id, user_id, date, consistency_score, leetcode_pts, github_pts, coding_pts)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, date) DO UPDATE SET
          consistency_score = excluded.consistency_score,
          leetcode_pts = excluded.leetcode_pts,
          github_pts = excluded.github_pts,
          coding_pts = excluded.coding_pts
      `).run(randomUUID(), user.id, targetDate, score.totalScore, score.leetcodePts, score.githubPts, score.codingPts);

    } catch (err: any) {
      console.error(`[Scheduler] Error running nightly job for user ${user.id}:`, err.message);
    }
  }

  // 4. Section 5.1: Clean up raw sessions older than 90 days (rolled up into coding_daily already)
  try {
    const deleted = db.prepare("DELETE FROM coding_sessions WHERE start_time < datetime('now', '-90 days')").run();
    console.log(`[Scheduler] Pruned ${deleted.changes} coding_sessions older than 90 days.`);
  } catch (err: any) {
    console.error('[Scheduler] Error pruning old sessions:', err.message);
  }

  console.log('[Scheduler] Nightly jobs completed successfully.');
}

export function initScheduler() {
  // Run every night at 00:05 AM (0 5 0 * * *)
  cron.schedule('5 0 * * *', () => {
    runNightlyJobs();
  });
  console.log('[Scheduler] Cron scheduler registered (runs nightly at 00:05 AM).');
}
