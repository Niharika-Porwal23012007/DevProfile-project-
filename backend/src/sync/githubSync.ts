import axios from 'axios';
import { db } from '../db/database';
import { decryptToken } from '../services/cryptoService';
import { randomUUID } from 'crypto';

export interface GitHubSyncResult {
  success: boolean;
  dailyEntries: number;
  reposCount: number;
  error?: string;
}

export class GitHubSync {
  /**
   * Pulls GitHub contribution stats and repositories via GraphQL API
   */
  static async syncUser(userId: string): Promise<GitHubSyncResult> {
    const user = db.prepare('SELECT id, github_token_enc, github_username FROM users WHERE id = ?').get(userId) as any;
    if (!user || !user.github_token_enc) {
      return { success: false, dailyEntries: 0, reposCount: 0, error: 'No GitHub token configured' };
    }

    let token = '';
    try {
      token = decryptToken(user.github_token_enc);
    } catch (err) {
      return { success: false, dailyEntries: 0, reposCount: 0, error: 'Failed to decrypt token' };
    }

    // GraphQL query as described in Section 3.1
    const query = `
      query {
        viewer {
          login
          contributionsCollection {
            totalCommitContributions
            totalPullRequestContributions
            totalIssueContributions
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
          repositories(first: 20, orderBy: {field: PUSHED_AT, direction: DESC}, privacy: PUBLIC) {
            nodes {
              name
              url
              isPrivate
              stargazerCount
              pushedAt
              updatedAt
              primaryLanguage {
                name
              }
              languages(first: 5) {
                nodes {
                  name
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await axios.post(
        'https://api.github.com/graphql',
        { query },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'User-Agent': 'DevProfile-App'
          },
          timeout: 10000
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0]?.message || 'GitHub GraphQL error');
      }

      const viewer = response.data?.data?.viewer;
      if (!viewer) {
        throw new Error('No viewer returned from GitHub');
      }

      const calendarWeeks = viewer.contributionsCollection?.contributionCalendar?.weeks || [];
      const totalPrs = viewer.contributionsCollection?.totalPullRequestContributions || 0;
      const totalIssues = viewer.contributionsCollection?.totalIssueContributions || 0;

      // Upsert daily contributions into github_daily
      const upsertDaily = db.prepare(`
        INSERT INTO github_daily (id, user_id, date, commits, prs, issues, repos_touched)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, date) DO UPDATE SET
          commits = excluded.commits,
          repos_touched = excluded.repos_touched
      `);

      let dailyCount = 0;
      for (const week of calendarWeeks) {
        for (const day of week.contributionDays) {
          upsertDaily.run(
            randomUUID(),
            userId,
            day.date,
            day.contributionCount,
            day.contributionCount > 0 ? 1 : 0,
            0,
            day.contributionCount > 0 ? 1 : 0
          );
          dailyCount++;
        }
      }

      // Upsert repositories into github_repos
      const repos = viewer.repositories?.nodes || [];
      const upsertRepo = db.prepare(`
        INSERT INTO github_repos (id, user_id, repo_name, url, primary_language, languages_json, stars, pushed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, repo_name) DO UPDATE SET
          url = excluded.url,
          primary_language = excluded.primary_language,
          languages_json = excluded.languages_json,
          stars = excluded.stars,
          pushed_at = excluded.pushed_at
      `);

      for (const repo of repos) {
        const languages = (repo.languages?.nodes || []).map((l: any) => l.name);
        upsertRepo.run(
          randomUUID(),
          userId,
          repo.name,
          repo.url,
          repo.primaryLanguage?.name || 'Unknown',
          JSON.stringify(languages),
          repo.stargazerCount || 0,
          repo.pushedAt
        );
      }

      // Record successful sync log
      db.prepare(`
        INSERT INTO sync_logs (id, user_id, source, status, run_at)
        VALUES (?, ?, 'github', 'success', datetime('now'))
      `).run(randomUUID(), userId);

      return {
        success: true,
        dailyEntries: dailyCount,
        reposCount: repos.length
      };
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'GitHub sync failed';

      // Log failure in sync_logs without deleting prior data
      db.prepare(`
        INSERT INTO sync_logs (id, user_id, source, status, error, run_at)
        VALUES (?, ?, 'github', 'failed', ?, datetime('now'))
      `).run(randomUUID(), userId, errMsg);

      return {
        success: false,
        dailyEntries: 0,
        reposCount: 0,
        error: errMsg
      };
    }
  }
}
