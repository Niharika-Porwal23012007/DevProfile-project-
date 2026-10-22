import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { db } from '../db/database';
import { LeetCodeSync } from '../sync/leetcodeSync';
import { GitHubSync } from '../sync/githubSync';
import { AnalysisService } from '../services/analysisService';
import { AppError } from '../middleware/errorHandler';

export const syncRouter = Router();

// In-memory rate limiting map for manual sync: userId -> lastSyncTimestamp
const lastManualSyncTimes = new Map<string, number>();
const SYNC_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes

/**
 * POST /api/connect/leetcode
 * Save and verify LeetCode username and perform initial snapshot pull
 */
syncRouter.post('/connect/leetcode', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  const { username } = req.body;
  if (!username || typeof username !== 'string') {
    return next(new AppError('BAD_REQUEST', 'LeetCode username is required.', 400));
  }

  const cleanUsername = username.trim();

  // Save username to user profile
  db.prepare('UPDATE users SET leetcode_username = ? WHERE id = ?').run(cleanUsername, req.user!.id);

  try {
    const profile = await LeetCodeSync.syncUser(req.user!.id);
    res.json({
      message: `LeetCode profile connected for @${cleanUsername}`,
      profile
    });
  } catch (err: any) {
    next(new AppError('LEETCODE_SYNC_FAILED', err.message || 'Could not verify LeetCode profile', 400));
  }
});

/**
 * POST /api/sync
 * Manual sync (rate limited)
 */
syncRouter.post('/sync', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user!.id;
  const now = Date.now();
  const lastSync = lastManualSyncTimes.get(userId) || 0;

  if (now - lastSync < SYNC_COOLDOWN_MS) {
    const waitSeconds = Math.ceil((SYNC_COOLDOWN_MS - (now - lastSync)) / 1000);
    return next(new AppError('RATE_LIMITED', `Sync rate limit reached. Please wait ${waitSeconds} seconds before syncing again.`, 429));
  }

  lastManualSyncTimes.set(userId, now);

  const results: { github?: any; leetcode?: any } = {};

  // Sync GitHub
  const user = db.prepare('SELECT github_token_enc, leetcode_username FROM users WHERE id = ?').get(userId) as any;
  if (user?.github_token_enc) {
    results.github = await GitHubSync.syncUser(userId);
  }

  // Sync LeetCode
  if (user?.leetcode_username) {
    results.leetcode = await LeetCodeSync.syncUser(userId);
  }

  // Recalculate today's score
  const today = new Date().toISOString().split('T')[0];
  const solves = db.prepare("SELECT COUNT(*) as count FROM leetcode_solved_problems WHERE user_id = ? AND date(solved_at) = ?").get(userId, today) as any;
  const commits = db.prepare("SELECT commits FROM github_daily WHERE user_id = ? AND date = ?").get(userId, today) as any;
  const coding = db.prepare("SELECT total_sec FROM coding_daily WHERE user_id = ? AND date = ?").get(userId, today) as any;

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
  `).run(
    crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    userId,
    today,
    score.totalScore,
    score.leetcodePts,
    score.githubPts,
    score.codingPts
  );

  res.json({
    message: 'Manual sync completed',
    results,
    todayScore: score
  });
});
