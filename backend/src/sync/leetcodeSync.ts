import axios from 'axios';
import { db } from '../db/database';
import { randomUUID } from 'crypto';

export interface LeetCodeInternalProfile {
  username: string;
  totalSolved: number;
  easy: number;
  medium: number;
  hard: number;
  topicCounts: { [topic: string]: { total: number; medium: number; hard: number; easy: number } };
  calendar: { [timestampSec: string]: number };
  recentSubmissions: {
    title: string;
    slug: string;
    timestamp: string;
  }[];
  syncStatus: 'success' | 'failed';
  error?: string;
}

export interface ILeetCodeAdapter {
  fetch(username: string): Promise<LeetCodeInternalProfile>;
}

/**
 * Primary GraphQL adapter using public LeetCode GraphQL endpoint
 */
export class OfficialGraphQLAdapter implements ILeetCodeAdapter {
  private endpoint = 'https://leetcode.com/graphql';

  async fetch(username: string): Promise<LeetCodeInternalProfile> {
    const query = `
      query userProfileAndStats($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            ranking
            reputation
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
          tagProblemCounts {
            advanced {
              tagName
              tagSlug
              problemsSolved
            }
            intermediate {
              tagName
              tagSlug
              problemsSolved
            }
            fundamental {
              tagName
              tagSlug
              problemsSolved
            }
          }
          userCalendar {
            submissionCalendar
          }
        }
        recentAcSubmissionList(username: $username, limit: 15) {
          title
          titleSlug
          timestamp
        }
      }
    `;

    const response = await axios.post(
      this.endpoint,
      {
        query,
        variables: { username }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 12000
      }
    );

    const data = response.data?.data;
    if (!data || !data.matchedUser) {
      throw new Error(`LeetCode user '${username}' not found or profile is private`);
    }

    const matched = data.matchedUser;
    const acStats = matched.submitStatsGlobal?.acSubmissionNum || [];

    let easy = 0, medium = 0, hard = 0, totalSolved = 0;
    for (const item of acStats) {
      if (item.difficulty === 'All') totalSolved = item.count;
      else if (item.difficulty === 'Easy') easy = item.count;
      else if (item.difficulty === 'Medium') medium = item.count;
      else if (item.difficulty === 'Hard') hard = item.count;
    }

    const topicCounts: LeetCodeInternalProfile['topicCounts'] = {};
    const tags = matched.tagProblemCounts;
    if (tags) {
      const allTags = [
        ...(tags.fundamental || []),
        ...(tags.intermediate || []),
        ...(tags.advanced || [])
      ];

      for (const t of allTags) {
        const name = t.tagName;
        const count = t.problemsSolved || 0;
        // Estimate difficulty breakdown if not explicitly given by LeetCode
        topicCounts[name] = {
          total: count,
          easy: Math.round(count * 0.3),
          medium: Math.round(count * 0.55),
          hard: Math.round(count * 0.15)
        };
      }
    }

    let calendar: { [ts: string]: number } = {};
    if (matched.userCalendar?.submissionCalendar) {
      try {
        calendar = JSON.parse(matched.userCalendar.submissionCalendar);
      } catch (e) {
        calendar = {};
      }
    }

    const recentSubmissions = (data.recentAcSubmissionList || []).map((sub: any) => ({
      title: sub.title,
      slug: sub.titleSlug,
      timestamp: new Date(parseInt(sub.timestamp, 10) * 1000).toISOString()
    }));

    return {
      username,
      totalSolved,
      easy,
      medium,
      hard,
      topicCounts,
      calendar,
      recentSubmissions,
      syncStatus: 'success'
    };
  }
}

/**
 * Section 3.2: Keep all LeetCode code in leetcodeSync.ts with a single fetchProfile(username) function
 */
export class LeetCodeSync {
  private static adapter: ILeetCodeAdapter = new OfficialGraphQLAdapter();

  /**
   * Set custom adapter if switching data sources (e.g. community wrapper)
   */
  static setAdapter(adapter: ILeetCodeAdapter) {
    this.adapter = adapter;
  }

  /**
   * Single unified fetch function returning internal format
   */
  static async fetchProfile(username: string): Promise<LeetCodeInternalProfile> {
    try {
      return await this.adapter.fetch(username);
    } catch (err: any) {
      console.warn(`[LeetCodeSync] Live fetch failed for '${username}': ${err.message}.`);
      return {
        username,
        totalSolved: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        topicCounts: {},
        calendar: {},
        recentSubmissions: [],
        syncStatus: 'failed',
        error: err.message || 'LeetCode sync failed'
      };
    }
  }

  /**
   * Sync and store daily snapshot for a registered user
   */
  static async syncUser(userId: string): Promise<LeetCodeInternalProfile> {
    const user = db.prepare('SELECT id, leetcode_username FROM users WHERE id = ?').get(userId) as any;
    if (!user || !user.leetcode_username) {
      throw new Error('User has no LeetCode username connected');
    }

    const profile = await this.fetchProfile(user.leetcode_username);
    const today = new Date().toISOString().split('T')[0];

    if (profile.syncStatus === 'success') {
      // Upsert daily snapshot in leetcode_snapshots
      db.prepare(`
        INSERT INTO leetcode_snapshots (id, user_id, date, easy, medium, hard, topic_counts_json, calendar_json, sync_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'success')
        ON CONFLICT(user_id, date) DO UPDATE SET
          easy = excluded.easy,
          medium = excluded.medium,
          hard = excluded.hard,
          topic_counts_json = excluded.topic_counts_json,
          calendar_json = excluded.calendar_json,
          sync_status = 'success'
      `).run(
        randomUUID(),
        userId,
        today,
        profile.easy,
        profile.medium,
        profile.hard,
        JSON.stringify(profile.topicCounts),
        JSON.stringify(profile.calendar)
      );

      // Save recent solved problems
      const insertProblem = db.prepare(`
        INSERT INTO leetcode_solved_problems (id, user_id, slug, title, difficulty, topic_tags, solved_at, struggled)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
        ON CONFLICT(user_id, slug) DO UPDATE SET
          solved_at = excluded.solved_at
      `);

      for (const item of profile.recentSubmissions) {
        insertProblem.run(
          randomUUID(),
          userId,
          item.slug,
          item.title,
          'Medium', // Default difficulty when fetched from recent AC
          JSON.stringify(['Algorithm']),
          item.timestamp
        );
      }

      // Log success
      db.prepare(`
        INSERT INTO sync_logs (id, user_id, source, status, run_at)
        VALUES (?, ?, 'leetcode', 'success', datetime('now'))
      `).run(randomUUID(), userId);
    } else {
      // Record failure without deleting existing data
      db.prepare(`
        INSERT INTO leetcode_snapshots (id, user_id, date, easy, medium, hard, sync_status)
        VALUES (?, ?, ?, 0, 0, 0, 'failed')
        ON CONFLICT(user_id, date) DO UPDATE SET
          sync_status = 'failed'
      `).run(randomUUID(), userId, today);

      db.prepare(`
        INSERT INTO sync_logs (id, user_id, source, status, error, run_at)
        VALUES (?, ?, 'leetcode', 'failed', ?, datetime('now'))
      `).run(randomUUID(), userId, profile.error || 'Sync error');
    }

    return profile;
  }
}
