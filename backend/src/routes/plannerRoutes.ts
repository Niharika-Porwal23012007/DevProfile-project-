import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { db } from '../db/database';
import { PlannerService, PlannerInput } from '../services/plannerService';
import { AnalysisService } from '../services/analysisService';
import { randomUUID } from 'crypto';

export const plannerRouter = Router();

/**
 * GET /api/plan/today
 * Retrieve or generate AI daily plan based on verified facts
 */
plannerRouter.get('/plan/today', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user!.id;
  const today = new Date().toISOString().split('T')[0];

  // 1. Check if plan already generated for today
  const existingPlan = db.prepare('SELECT * FROM plans WHERE user_id = ? AND date = ?').get(userId, today) as any;
  if (existingPlan && !req.query.refresh) {
    try {
      const tasks = JSON.parse(existingPlan.plan_json);
      const followed = JSON.parse(existingPlan.followed_json || '[]');
      return res.json({
        date: today,
        tasks: tasks.map((t: any, idx: number) => ({
          ...t,
          completed: followed.includes(idx)
        })),
        source: 'cached'
      });
    } catch (e) {}
  }

  // 2. Gather verified facts from database
  // A. Weakest topics
  const latestSnapshot = db.prepare("SELECT topic_counts_json FROM leetcode_snapshots WHERE user_id = ? AND sync_status = 'success' ORDER BY date DESC LIMIT 1").get(userId) as any;
  let topicData: Record<string, any> = {};
  if (latestSnapshot?.topic_counts_json) {
    try { topicData = JSON.parse(latestSnapshot.topic_counts_json); } catch (e) {}
  }
  const weaknessResult = AnalysisService.analyzeWeaknesses(topicData);
  const weakTopics = weaknessResult.weakestTopics.map(w => w.topic);

  // B. Reviews due
  const dueReviews = db.prepare('SELECT problem_slug FROM reviews WHERE user_id = ? AND done_at IS NULL AND due_date <= ?').all(userId, today) as any[];
  const reviewsDue = dueReviews.map(r => r.problem_slug);

  // C. Days since last commit per repo
  const repos = db.prepare('SELECT repo_name, pushed_at FROM github_repos WHERE user_id = ?').all(userId) as any[];
  const daysSinceLastCommit: Record<string, number> = {};
  const nowMs = Date.now();
  for (const r of repos) {
    if (r.pushed_at) {
      const diffDays = Math.max(0, Math.floor((nowMs - new Date(r.pushed_at).getTime()) / (1000 * 3600 * 24)));
      daysSinceLastCommit[r.repo_name] = diffDays;
    } else {
      daysSinceLastCommit[r.repo_name] = 7;
    }
  }

  // D. Goal progress today
  const solves = db.prepare("SELECT COUNT(*) as count FROM leetcode_solved_problems WHERE user_id = ? AND date(solved_at) = ?").get(userId, today) as any;
  const commits = db.prepare("SELECT commits FROM github_daily WHERE user_id = ? AND date = ?").get(userId, today) as any;
  const coding = db.prepare("SELECT total_sec FROM coding_daily WHERE user_id = ? AND date = ?").get(userId, today) as any;

  // E. Streak
  const dailyScores = db.prepare('SELECT consistency_score as score FROM daily_scores WHERE user_id = ? ORDER BY date DESC LIMIT 30').all(userId) as any[];
  const streak = AnalysisService.calculateStreak(dailyScores);

  const input: PlannerInput = {
    weakTopics: weakTopics.length > 0 ? weakTopics : ['dynamic programming', 'graphs'],
    reviewsDue,
    daysSinceLastCommit,
    goalProgress: {
      leetcode: solves?.count || 0,
      commits: commits?.commits || 0,
      codingMin: Math.round((coding?.total_sec || 0) / 60)
    },
    availableMinutes: 90,
    streak: streak.currentStreak
  };

  const planResult = await PlannerService.generateDailyPlan(input);

  // Save to database
  db.prepare(`
    INSERT INTO plans (id, user_id, date, plan_json, followed_json)
    VALUES (?, ?, ?, ?, '[]')
    ON CONFLICT(user_id, date) DO UPDATE SET
      plan_json = excluded.plan_json
  `).run(randomUUID(), userId, today, JSON.stringify(planResult.tasks));

  res.json({
    date: today,
    tasks: planResult.tasks.map(t => ({ ...t, completed: false })),
    source: planResult.source,
    input
  });
});

/**
 * POST /api/plan/task/:index/toggle
 * Toggle completion of a task in today's plan
 */
plannerRouter.post('/plan/task/:index/toggle', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const index = parseInt(String(req.params.index), 10);
  const today = new Date().toISOString().split('T')[0];

  const plan = db.prepare('SELECT * FROM plans WHERE user_id = ? AND date = ?').get(userId, today) as any;
  if (!plan) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No plan found for today' } });
  }

  let followed: number[] = [];
  try {
    followed = JSON.parse(plan.followed_json || '[]');
  } catch (e) {}

  if (followed.includes(index)) {
    followed = followed.filter(i => i !== index);
  } else {
    followed.push(index);
  }

  db.prepare('UPDATE plans SET followed_json = ? WHERE id = ?').run(JSON.stringify(followed), plan.id);

  res.json({
    message: 'Task progress updated',
    completedIndices: followed
  });
});
