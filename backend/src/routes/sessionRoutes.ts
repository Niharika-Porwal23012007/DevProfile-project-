import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { db } from '../db/database';
import { randomUUID } from 'crypto';
import { AppError } from '../middleware/errorHandler';

export const sessionRouter = Router();

/**
 * POST /api/sessions
 * Upload VS Code sessions (authenticated via Bearer API key or JWT)
 */
sessionRouter.post('/sessions', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  const { sessions } = req.body;
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return next(new AppError('BAD_REQUEST', 'Request body must contain a "sessions" array.', 400));
  }

  const userId = req.user!.id;
  const insertSession = db.prepare(`
    INSERT INTO coding_sessions (id, user_id, project, repo_url, language, file, start_time, duration_sec)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const selectDaily = db.prepare('SELECT total_sec, by_language_json, by_project_json FROM coding_daily WHERE user_id = ? AND date = ?');
  const upsertDaily = db.prepare(`
    INSERT INTO coding_daily (id, user_id, date, total_sec, by_language_json, by_project_json)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, date) DO UPDATE SET
      total_sec = excluded.total_sec,
      by_language_json = excluded.by_language_json,
      by_project_json = excluded.by_project_json
  `);

  let addedCount = 0;

  db.transaction(() => {
    for (const s of sessions) {
      if (!s.project || !s.language || typeof s.durationSec !== 'number') continue;

      const durationSec = Math.max(1, Math.round(s.durationSec));
      const startTime = s.start || new Date().toISOString();
      const dateStr = startTime.split('T')[0];

      insertSession.run(
        randomUUID(),
        userId,
        s.project,
        s.repoUrl || null,
        s.language,
        s.file || null,
        startTime,
        durationSec
      );
      addedCount++;

      // Roll up to coding_daily
      const existing = selectDaily.get(userId, dateStr) as any;
      let totalSec = durationSec;
      let langMap: Record<string, number> = { [s.language]: durationSec };
      let projMap: Record<string, number> = { [s.project]: durationSec };

      if (existing) {
        totalSec += existing.total_sec || 0;
        try {
          const prevLang = JSON.parse(existing.by_language_json || '{}');
          prevLang[s.language] = (prevLang[s.language] || 0) + durationSec;
          langMap = prevLang;
        } catch (e) {}

        try {
          const prevProj = JSON.parse(existing.by_project_json || '{}');
          prevProj[s.project] = (prevProj[s.project] || 0) + durationSec;
          projMap = prevProj;
        } catch (e) {}
      }

      upsertDaily.run(
        randomUUID(),
        userId,
        dateStr,
        totalSec,
        JSON.stringify(langMap),
        JSON.stringify(projMap)
      );
    }
  })();

  res.json({
    message: `Successfully ingested and rolled up ${addedCount} coding sessions.`
  });
});

/**
 * POST /api/problem-times
 * Upload problem timer result from VS Code extension
 */
sessionRouter.post('/problem-times', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  const { problem, durationSec, difficultyFeeling } = req.body;

  if (!problem || typeof durationSec !== 'number') {
    return next(new AppError('BAD_REQUEST', 'Fields "problem" and "durationSec" are required.', 400));
  }

  const userId = req.user!.id;
  const problemSlug = String(problem).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  const duration = Math.round(durationSec);
  const feeling = difficultyFeeling || 'Medium';

  db.prepare(`
    INSERT INTO problem_times (id, user_id, problem_slug, duration_sec, felt_difficulty)
    VALUES (?, ?, ?, ?, ?)
  `).run(randomUUID(), userId, problemSlug, duration, feeling);

  // If struggled (felt difficulty = 'Struggled' or duration > 40 minutes = 2400s), schedule spaced repetition review
  const isStruggled = feeling.toLowerCase() === 'struggled' || duration > 2400;

  if (isStruggled) {
    const due = new Date();
    due.setDate(due.getDate() + 3);
    const dueDateStr = due.toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO reviews (id, user_id, problem_slug, due_date, interval_days)
      VALUES (?, ?, ?, ?, 3)
    `).run(randomUUID(), userId, problemSlug, dueDateStr);
  }

  res.json({
    message: 'Problem time recorded.',
    spacedRepetitionScheduled: isStruggled
  });
});
