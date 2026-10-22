import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { db } from '../db/database';

export const userRouter = Router();

/**
 * GET /api/export
 * Download all user data across all tables (GDPR / User Rights per Section 9)
 */
userRouter.get('/export', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;

  const user = db.prepare('SELECT id, name, email, github_username, leetcode_username, public_slug, is_public, timezone, created_at FROM users WHERE id = ?').get(userId);
  const githubDaily = db.prepare('SELECT * FROM github_daily WHERE user_id = ?').all(userId);
  const githubRepos = db.prepare('SELECT * FROM github_repos WHERE user_id = ?').all(userId);
  const leetcodeSnapshots = db.prepare('SELECT * FROM leetcode_snapshots WHERE user_id = ?').all(userId);
  const leetcodeSolved = db.prepare('SELECT * FROM leetcode_solved_problems WHERE user_id = ?').all(userId);
  const codingSessions = db.prepare('SELECT * FROM coding_sessions WHERE user_id = ?').all(userId);
  const codingDaily = db.prepare('SELECT * FROM coding_daily WHERE user_id = ?').all(userId);
  const problemTimes = db.prepare('SELECT * FROM problem_times WHERE user_id = ?').all(userId);
  const reviews = db.prepare('SELECT * FROM reviews WHERE user_id = ?').all(userId);
  const goals = db.prepare('SELECT * FROM goals WHERE user_id = ?').all(userId);
  const dailyScores = db.prepare('SELECT * FROM daily_scores WHERE user_id = ?').all(userId);
  const problemNotes = db.prepare('SELECT * FROM problem_notes WHERE user_id = ?').all(userId);
  const generatedPosts = db.prepare('SELECT * FROM generated_posts WHERE user_id = ?').all(userId);
  const plans = db.prepare('SELECT * FROM plans WHERE user_id = ?').all(userId);
  const syncLogs = db.prepare('SELECT * FROM sync_logs WHERE user_id = ?').all(userId);

  const exportPayload = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    user,
    githubDaily,
    githubRepos,
    leetcodeSnapshots,
    leetcodeSolved,
    codingSessions,
    codingDaily,
    problemTimes,
    reviews,
    goals,
    dailyScores,
    problemNotes,
    generatedPosts,
    plans,
    syncLogs
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=devprofile-export-${userId}.json`);
  res.json(exportPayload);
});

/**
 * DELETE /api/account
 * Completely delete account and all cascaded data
 */
userRouter.delete('/account', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  res.json({ message: 'Account and all associated records have been permanently deleted.' });
});

/**
 * PATCH /api/account/privacy
 * Toggle public portfolio visibility
 */
userRouter.patch('/account/privacy', requireAuth, (req: Request, res: Response) => {
  const { isPublic } = req.body;
  const val = isPublic ? 1 : 0;
  db.prepare('UPDATE users SET is_public = ? WHERE id = ?').run(val, req.user!.id);
  res.json({ message: `Portfolio visibility set to ${isPublic ? 'Public' : 'Private'}`, isPublic: Boolean(val) });
});
