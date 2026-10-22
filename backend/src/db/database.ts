import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import path from 'path';
import { config } from '../config';

const dbPath = config.databaseFile;
export const db = new Database(dbPath);

// Enable WAL mode for high performance concurrent reads and writes, and enable foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    -- 1. users
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      github_id TEXT UNIQUE,
      github_username TEXT,
      github_token_enc TEXT,
      leetcode_username TEXT,
      linkedin_sub TEXT,
      api_key_hash TEXT UNIQUE,
      public_slug TEXT UNIQUE,
      is_public INTEGER DEFAULT 1,
      timezone TEXT DEFAULT 'Asia/Kolkata',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 2. github_daily
    CREATE TABLE IF NOT EXISTS github_daily (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      commits INTEGER NOT NULL DEFAULT 0,
      prs INTEGER NOT NULL DEFAULT 0,
      issues INTEGER NOT NULL DEFAULT 0,
      repos_touched INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, date)
    );
    CREATE INDEX IF NOT EXISTS idx_github_daily_user_date ON github_daily(user_id, date);

    -- 3. github_repos
    CREATE TABLE IF NOT EXISTS github_repos (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      repo_name TEXT NOT NULL,
      url TEXT NOT NULL,
      primary_language TEXT,
      languages_json TEXT DEFAULT '{}',
      stars INTEGER DEFAULT 0,
      pushed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, repo_name)
    );
    CREATE INDEX IF NOT EXISTS idx_github_repos_user ON github_repos(user_id);

    -- 4. leetcode_snapshots
    CREATE TABLE IF NOT EXISTS leetcode_snapshots (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      easy INTEGER NOT NULL DEFAULT 0,
      medium INTEGER NOT NULL DEFAULT 0,
      hard INTEGER NOT NULL DEFAULT 0,
      topic_counts_json TEXT DEFAULT '{}',
      calendar_json TEXT DEFAULT '{}',
      sync_status TEXT DEFAULT 'success',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, date)
    );
    CREATE INDEX IF NOT EXISTS idx_leetcode_snapshots_user_date ON leetcode_snapshots(user_id, date);

    -- 5. leetcode_solved_problems
    CREATE TABLE IF NOT EXISTS leetcode_solved_problems (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      topic_tags TEXT DEFAULT '[]',
      solved_at TEXT NOT NULL,
      struggled INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, slug)
    );
    CREATE INDEX IF NOT EXISTS idx_leetcode_solved_user ON leetcode_solved_problems(user_id);

    -- 6. coding_sessions
    CREATE TABLE IF NOT EXISTS coding_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      project TEXT NOT NULL,
      repo_url TEXT,
      language TEXT NOT NULL,
      file TEXT,
      start_time TEXT NOT NULL,
      duration_sec INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_coding_sessions_user_start ON coding_sessions(user_id, start_time);

    -- 7. coding_daily
    CREATE TABLE IF NOT EXISTS coding_daily (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      total_sec INTEGER NOT NULL DEFAULT 0,
      by_language_json TEXT DEFAULT '{}',
      by_project_json TEXT DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, date)
    );
    CREATE INDEX IF NOT EXISTS idx_coding_daily_user_date ON coding_daily(user_id, date);

    -- 8. problem_times
    CREATE TABLE IF NOT EXISTS problem_times (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      problem_slug TEXT NOT NULL,
      duration_sec INTEGER NOT NULL,
      felt_difficulty TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_problem_times_user ON problem_times(user_id);

    -- 9. reviews (spaced repetition: 3, 7, 21 days)
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      problem_slug TEXT NOT NULL,
      due_date TEXT NOT NULL,
      interval_days INTEGER NOT NULL DEFAULT 3,
      done_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_reviews_user_due ON reviews(user_id, due_date);

    -- 10. goals
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL, -- 'daily_leetcode', 'daily_commits', 'daily_coding_min', 'weekly_leetcode'
      target_value REAL NOT NULL,
      period TEXT NOT NULL, -- 'daily', 'weekly'
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, type, period)
    );

    -- 11. daily_scores
    CREATE TABLE IF NOT EXISTS daily_scores (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      consistency_score REAL NOT NULL,
      leetcode_pts REAL NOT NULL,
      github_pts REAL NOT NULL,
      coding_pts REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, date)
    );
    CREATE INDEX IF NOT EXISTS idx_daily_scores_user_date ON daily_scores(user_id, date);

    -- 12. problem_notes
    CREATE TABLE IF NOT EXISTS problem_notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      problem_slug TEXT NOT NULL,
      note_text TEXT NOT NULL,
      pattern_tag TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, problem_slug)
    );

    -- 13. generated_posts
    CREATE TABLE IF NOT EXISTS generated_posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL, -- 'weekly', 'project', 'profile'
      text TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      posted INTEGER DEFAULT 0
    );

    -- 14. plans
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      plan_json TEXT NOT NULL,
      followed_json TEXT DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, date)
    );
    CREATE INDEX IF NOT EXISTS idx_plans_user_date ON plans(user_id, date);

    -- 15. sync_logs
    CREATE TABLE IF NOT EXISTS sync_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      source TEXT NOT NULL, -- 'github', 'leetcode'
      status TEXT NOT NULL, -- 'success', 'failed'
      error TEXT,
      run_at TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

// Auto-initialize when module is loaded
initDatabase();
