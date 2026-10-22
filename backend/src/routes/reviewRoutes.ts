import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { db } from '../db/database';
import { AnalysisService } from '../services/analysisService';
import { AppError } from '../middleware/errorHandler';
import { randomUUID } from 'crypto';

export const reviewRouter = Router();

/**
 * GET /api/reviews/today
 * Problems due for spaced repetition review
 */
reviewRouter.get('/reviews/today', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const today = new Date().toISOString().split('T')[0];

  const dueReviews = db.prepare(`
    SELECT r.id, r.problem_slug, r.due_date, r.interval_days,
           pn.note_text, pn.pattern_tag,
           sp.title, sp.difficulty
    FROM reviews r
    LEFT JOIN problem_notes pn ON pn.user_id = r.user_id AND pn.problem_slug = r.problem_slug
    LEFT JOIN leetcode_solved_problems sp ON sp.user_id = r.user_id AND sp.slug = r.problem_slug
    WHERE r.user_id = ? AND r.done_at IS NULL AND r.due_date <= ?
    ORDER BY r.due_date ASC
  `).all(userId, today) as any[];

  // Also include upcoming reviews for visibility
  const upcomingReviews = db.prepare(`
    SELECT r.id, r.problem_slug, r.due_date, r.interval_days,
           pn.pattern_tag, sp.title, sp.difficulty
    FROM reviews r
    LEFT JOIN problem_notes pn ON pn.user_id = r.user_id AND pn.problem_slug = r.problem_slug
    LEFT JOIN leetcode_solved_problems sp ON sp.user_id = r.user_id AND sp.slug = r.problem_slug
    WHERE r.user_id = ? AND r.done_at IS NULL AND r.due_date > ?
    ORDER BY r.due_date ASC
    LIMIT 10
  `).all(userId, today);

  res.json({
    dueToday: dueReviews,
    upcoming: upcomingReviews
  });
});

/**
 * POST /api/reviews/:id/done
 * Mark a review done and schedule the next spaced repetition interval
 */
reviewRouter.post('/reviews/:id/done', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { passed = true } = req.body;
  const userId = req.user!.id;

  const review = db.prepare('SELECT * FROM reviews WHERE id = ? AND user_id = ?').get(id, userId) as any;
  if (!review) {
    return next(new AppError('NOT_FOUND', 'Review record not found.', 404));
  }

  const nowStr = new Date().toISOString();
  db.prepare('UPDATE reviews SET done_at = ? WHERE id = ?').run(nowStr, id);

  // Calculate next interval (3 -> 7 -> 21) or reset to 3 if failed
  const nextInterval = AnalysisService.getNextReviewInterval(review.interval_days, passed);

  // If passed and under 30 days, schedule next interval
  if (passed && review.interval_days < 21) {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + nextInterval);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO reviews (id, user_id, problem_slug, due_date, interval_days)
      VALUES (?, ?, ?, ?, ?)
    `).run(randomUUID(), userId, review.problem_slug, nextDateStr, nextInterval);
  } else if (!passed) {
    // Reset to 3 days
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 3);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO reviews (id, user_id, problem_slug, due_date, interval_days)
      VALUES (?, ?, ?, ?, 3)
    `).run(randomUUID(), userId, review.problem_slug, nextDateStr, 3);
  }

  res.json({
    message: passed ? 'Review completed! Progressed to next interval.' : 'Review marked as struggled. Scheduled for redo in 3 days.',
    nextInterval
  });
});

/**
 * GET & POST /api/notes/:problemId
 * Personal notes and algorithmic pattern tags per problem
 */
reviewRouter.get('/notes/:problemId', requireAuth, (req: Request, res: Response) => {
  const { problemId } = req.params;
  const note = db.prepare('SELECT * FROM problem_notes WHERE user_id = ? AND problem_slug = ?').get(req.user!.id, problemId);
  res.json({ note: note || null });
});

reviewRouter.post('/notes/:problemId', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  const { problemId } = req.params;
  const { noteText, patternTag } = req.body;

  if (typeof noteText !== 'string') {
    return next(new AppError('BAD_REQUEST', '"noteText" is required.', 400));
  }

  db.prepare(`
    INSERT INTO problem_notes (id, user_id, problem_slug, note_text, pattern_tag, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, problem_slug) DO UPDATE SET
      note_text = excluded.note_text,
      pattern_tag = excluded.pattern_tag,
      updated_at = datetime('now')
  `).run(randomUUID(), req.user!.id, problemId, noteText, patternTag || null);

  res.json({ message: 'Problem note saved successfully' });
});
