import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { db } from '../db/database';
import { AnalysisService } from '../services/analysisService';
import { AppError } from '../middleware/errorHandler';
import { randomUUID } from 'crypto';

export const dashboardRouter = Router();

/**
 * GET /api/dashboard?range=30d
 * Merged numbers, heatmap, streak, consistency score, goal rings
 */
dashboardRouter.get('/dashboard', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const rangeParam = (req.query.range as string) || '30d';
  const daysLimit = rangeParam === '90d' ? 90 : rangeParam === '7d' ? 7 : 30;

  const today = new Date().toISOString().split('T')[0];

  // 1. Today's counters
  const todaySolves = db.prepare("SELECT COUNT(*) as count FROM leetcode_solved_problems WHERE user_id = ? AND date(solved_at) = ?").get(userId, today) as any;
  const todayCommits = db.prepare("SELECT commits FROM github_daily WHERE user_id = ? AND date = ?").get(userId, today) as any;
  const todayCoding = db.prepare("SELECT total_sec FROM coding_daily WHERE user_id = ? AND date = ?").get(userId, today) as any;

  const solvesCount = todaySolves?.count || 0;
  const commitsCount = todayCommits?.commits || 0;
  const codingMinutes = Math.round((todayCoding?.total_sec || 0) / 60);

  // 2. Fetch goals
  const goalsRows = db.prepare("SELECT type, target_value, period FROM goals WHERE user_id = ?").all(userId) as any[];
  const goals: Record<string, number> = {
    daily_leetcode: 2,
    daily_commits: 3,
    daily_coding_min: 60,
    weekly_leetcode: 12
  };
  for (const g of goalsRows) {
    goals[g.type] = g.target_value;
  }

  // 3. Today's consistency score
  const todayScoreBreakdown = AnalysisService.calculateDailyScore(
    solvesCount,
    commitsCount,
    codingMinutes,
    goals.daily_coding_min
  );

  // 4. Past N days daily scores for streak & weekly average
  const dailyScores = db.prepare(`
    SELECT date, consistency_score as score, leetcode_pts, github_pts, coding_pts
    FROM daily_scores
    WHERE user_id = ?
    ORDER BY date DESC
    LIMIT ?
  `).all(userId, daysLimit) as any[];

  // If today's score is not in daily_scores table yet, prepend it for live accuracy
  if (!dailyScores.find(d => d.date === today)) {
    dailyScores.unshift({
      date: today,
      score: todayScoreBreakdown.totalScore,
      leetcode_pts: todayScoreBreakdown.leetcodePts,
      github_pts: todayScoreBreakdown.githubPts,
      coding_pts: todayScoreBreakdown.codingPts
    });
  }

  const streakInfo = AnalysisService.calculateStreak(dailyScores, 30);

  const recent7 = dailyScores.slice(0, 7);
  const weeklyAverageScore = recent7.length > 0
    ? Math.round(recent7.reduce((acc, d) => acc + (d.score || 0), 0) / recent7.length)
    : todayScoreBreakdown.totalScore;

  // 5. Merged Heatmap: combines commits, solves, and coding hours per day
  const heatmapRows = db.prepare(`
    SELECT
      d.date,
      COALESCE(gh.commits, 0) as commits,
      COALESCE(cd.total_sec, 0) as coding_sec,
      (SELECT COUNT(*) FROM leetcode_solved_problems sp WHERE sp.user_id = d.user_id AND date(sp.solved_at) = d.date) as solves,
      COALESCE(ds.consistency_score, 0) as score
    FROM (
      SELECT date, user_id FROM github_daily WHERE user_id = ?
      UNION
      SELECT date, user_id FROM coding_daily WHERE user_id = ?
      UNION
      SELECT date, user_id FROM daily_scores WHERE user_id = ?
    ) d
    LEFT JOIN github_daily gh ON gh.user_id = d.user_id AND gh.date = d.date
    LEFT JOIN coding_daily cd ON cd.user_id = d.user_id AND cd.date = d.date
    LEFT JOIN daily_scores ds ON ds.user_id = d.user_id AND ds.date = d.date
    ORDER BY d.date ASC
    LIMIT ?
  `).all(userId, userId, userId, daysLimit) as any[];

  // 6. Recent repositories
  const repos = db.prepare(`
    SELECT repo_name, url, primary_language, stars, pushed_at
    FROM github_repos
    WHERE user_id = ?
    ORDER BY pushed_at DESC
    LIMIT 5
  `).all(userId);

  // 7. Recent LeetCode problems
  const recentProblems = db.prepare(`
    SELECT slug, title, difficulty, topic_tags, solved_at, struggled
    FROM leetcode_solved_problems
    WHERE user_id = ?
    ORDER BY solved_at DESC
    LIMIT 6
  `).all(userId) as any[];

  res.json({
    today: {
      date: today,
      solvesCount,
      commitsCount,
      codingMinutes,
      consistencyScore: todayScoreBreakdown.totalScore,
      scoreBreakdown: todayScoreBreakdown
    },
    streak: {
      currentStreak: streakInfo.currentStreak,
      longestStreak: streakInfo.longestStreak,
      freezeDaysUsedThisWeek: streakInfo.freezeDaysUsedThisWeek,
      weeklyAverageScore
    },
    goals: {
      leetcode: { current: solvesCount, target: goals.daily_leetcode },
      commits: { current: commitsCount, target: goals.daily_commits },
      codingMin: { current: codingMinutes, target: goals.daily_coding_min }
    },
    heatmap: heatmapRows.map(r => ({
      date: r.date,
      commits: r.commits,
      solves: r.solves,
      codingMinutes: Math.round(r.coding_sec / 60),
      score: r.score,
      intensity: Math.min(4, Math.floor(r.score / 25))
    })),
    recentRepositories: repos,
    recentProblems: recentProblems.map(p => ({
      ...p,
      topicTags: JSON.parse(p.topic_tags || '[]')
    }))
  });
});

/**
 * GET /api/insights
 * Weak topics, balance detector, best times, skill gaps, interview readiness
 */
dashboardRouter.get('/insights', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;

  // 1. Weakness Analyzer: latest LeetCode snapshot
  const latestSnapshot = db.prepare(`
    SELECT topic_counts_json, easy, medium, hard
    FROM leetcode_snapshots
    WHERE user_id = ? AND sync_status = 'success'
    ORDER BY date DESC LIMIT 1
  `).get(userId) as any;

  let topicData: Record<string, any> = {};
  if (latestSnapshot?.topic_counts_json) {
    try {
      topicData = JSON.parse(latestSnapshot.topic_counts_json);
    } catch (e) {}
  }
  const weaknessResult = AnalysisService.analyzeWeaknesses(topicData);

  // 2. Balance Detector: last 42 days of activity
  const activityHistory = db.prepare(`
    SELECT
      gh.date,
      gh.commits,
      COALESCE(cd.total_sec, 0) as codingSec,
      (SELECT COUNT(*) FROM leetcode_solved_problems sp WHERE sp.user_id = ? AND date(sp.solved_at) = gh.date) as leetcodeSolves
    FROM github_daily gh
    LEFT JOIN coding_daily cd ON cd.user_id = gh.user_id AND cd.date = gh.date
    WHERE gh.user_id = ?
    ORDER BY gh.date DESC
    LIMIT 42
  `).all(userId, userId) as any[];

  const balanceResult = AnalysisService.detectBalance(activityHistory);

  // 3. Skill-Gap Map
  const repos = db.prepare('SELECT primary_language FROM github_repos WHERE user_id = ?').all(userId) as any[];
  const projectLanguages: Record<string, number> = {};
  for (const r of repos) {
    if (r.primary_language) {
      projectLanguages[r.primary_language] = (projectLanguages[r.primary_language] || 0) + 1;
    }
  }

  const editorSessions = db.prepare('SELECT by_language_json FROM coding_daily WHERE user_id = ?').all(userId) as any[];
  const editorTimeByLang: Record<string, number> = {};
  for (const row of editorSessions) {
    try {
      const parsed = JSON.parse(row.by_language_json || '{}');
      for (const lang of Object.keys(parsed)) {
        editorTimeByLang[lang] = (editorTimeByLang[lang] || 0) + parsed[lang];
      }
    } catch (e) {}
  }

  const topicSimpleCounts: Record<string, number> = {};
  for (const k of Object.keys(topicData)) {
    topicSimpleCounts[k] = topicData[k].total;
  }
  const skillGaps = AnalysisService.mapSkillGaps(topicSimpleCounts, projectLanguages, editorTimeByLang);

  // 4. Best-Time Insights
  const sessions = db.prepare(`
    SELECT start_time as timestamp, duration_sec as durationSec
    FROM coding_sessions
    WHERE user_id = ?
    ORDER BY start_time DESC
    LIMIT 100
  `).all(userId) as any[];

  const user = db.prepare('SELECT timezone FROM users WHERE id = ?').get(userId) as any;
  const bestTimes = AnalysisService.analyzeBestTimes(sessions, user?.timezone || 'Asia/Kolkata');

  // 5. Interview Readiness Score
  const streakScores = db.prepare('SELECT consistency_score as score FROM daily_scores WHERE user_id = ? ORDER BY date DESC LIMIT 30').all(userId) as any[];
  const streak = AnalysisService.calculateStreak(streakScores);
  const avgScore = streakScores.length > 0 ? streakScores.reduce((a, b) => a + b.score, 0) / streakScores.length : 50;
  const commitsTotal = db.prepare('SELECT SUM(commits) as total FROM github_daily WHERE user_id = ?').get(userId) as any;

  const interviewReadiness = AnalysisService.calculateInterviewReadiness({
    easyCount: latestSnapshot?.easy || 0,
    mediumCount: latestSnapshot?.medium || 0,
    hardCount: latestSnapshot?.hard || 0,
    topicsCount: Object.keys(topicData).length,
    streakDays: streak.currentStreak,
    avgConsistencyScore: avgScore,
    activeRepoCount: repos.length,
    totalCommits30d: commitsTotal?.total || 0
  });

  res.json({
    weaknesses: weaknessResult,
    balance: balanceResult,
    skillGaps,
    bestTimes,
    interviewReadiness
  });
});

/**
 * GET & POST /api/goals
 * Read and set daily/weekly targets
 */
dashboardRouter.get('/goals', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const rows = db.prepare('SELECT type, target_value, period FROM goals WHERE user_id = ?').all(userId);
  res.json({ goals: rows });
});

dashboardRouter.post('/goals', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  const { type, targetValue, period } = req.body;
  if (!type || typeof targetValue !== 'number' || !period) {
    return next(new AppError('BAD_REQUEST', 'Fields "type", "targetValue", and "period" are required.', 400));
  }

  db.prepare(`
    INSERT INTO goals (id, user_id, type, target_value, period)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, type, period) DO UPDATE SET
      target_value = excluded.target_value
  `).run(randomUUID(), req.user!.id, type, targetValue, period);

  res.json({ message: 'Goal updated successfully' });
});
