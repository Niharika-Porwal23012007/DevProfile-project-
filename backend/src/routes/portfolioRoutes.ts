import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { AnalysisService } from '../services/analysisService';

export const portfolioRouter = Router();

/**
 * GET /api/portfolio/:publicSlug
 * Public portfolio view (accessible by recruiters and classmates without login)
 */
portfolioRouter.get('/portfolio/:publicSlug', (req: Request, res: Response) => {
  const { publicSlug } = req.params;

  const user = db.prepare(`
    SELECT id, name, github_username, leetcode_username, public_slug, is_public, created_at
    FROM users WHERE LOWER(public_slug) = LOWER(?)
  `).get(publicSlug) as any;

  if (!user || user.is_public === 0) {
    return res.status(404).json({
      error: {
        code: 'PORTFOLIO_NOT_FOUND',
        message: 'This portfolio does not exist or has been made private by the user.'
      }
    });
  }

  // Fetch verified stats
  const latestSnapshot = db.prepare(`
    SELECT easy, medium, hard, topic_counts_json
    FROM leetcode_snapshots
    WHERE user_id = ? AND sync_status = 'success'
    ORDER BY date DESC LIMIT 1
  `).get(user.id) as any;

  const repos = db.prepare(`
    SELECT repo_name, url, primary_language, stars, pushed_at
    FROM github_repos
    WHERE user_id = ?
    ORDER BY stars DESC, pushed_at DESC
    LIMIT 6
  `).all(user.id);

  const commitsTotal = db.prepare('SELECT SUM(commits) as total FROM github_daily WHERE user_id = ?').get(user.id) as any;
  const codingTotal = db.prepare('SELECT SUM(total_sec) as total FROM coding_daily WHERE user_id = ?').get(user.id) as any;

  const streakScores = db.prepare('SELECT consistency_score as score FROM daily_scores WHERE user_id = ? ORDER BY date DESC LIMIT 30').all(user.id) as any[];
  const streak = AnalysisService.calculateStreak(streakScores);

  let topics: string[] = [];
  if (latestSnapshot?.topic_counts_json) {
    try {
      topics = Object.keys(JSON.parse(latestSnapshot.topic_counts_json)).slice(0, 8);
    } catch (e) {}
  }

  res.json({
    user: {
      name: user.name,
      githubUsername: user.github_username,
      leetcodeUsername: user.leetcode_username,
      publicSlug: user.public_slug,
      memberSince: user.created_at
    },
    verifiedStats: {
      totalSolves: (latestSnapshot?.easy || 0) + (latestSnapshot?.medium || 0) + (latestSnapshot?.hard || 0),
      solvedBreakdown: {
        easy: latestSnapshot?.easy || 0,
        medium: latestSnapshot?.medium || 0,
        hard: latestSnapshot?.hard || 0
      },
      totalCommits: commitsTotal?.total || 0,
      totalCodingHours: Math.round(((codingTotal?.total || 0) / 3600) * 10) / 10,
      currentStreakDays: streak.currentStreak
    },
    topRepositories: repos,
    verifiedSkills: topics
  });
});
