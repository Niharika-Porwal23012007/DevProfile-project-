import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AnalysisService } from '../services/analysisService';

describe('AnalysisService Unit Tests (Section 6 & 11)', () => {
  describe('6.1 Consistency Score Formula', () => {
    it('calculates full points when all targets are satisfied', () => {
      // 1 solve (40 pts) + 1 commit (30 pts) + 60 mins coding target met (30 pts) = 100
      const score = AnalysisService.calculateDailyScore(2, 4, 75, 60);
      assert.strictEqual(score.leetcodePts, 40);
      assert.strictEqual(score.githubPts, 30);
      assert.strictEqual(score.codingPts, 30);
      assert.strictEqual(score.totalScore, 100);
    });

    it('gives partial credit proportional to coding target', () => {
      // 0 solve (0 pts) + 1 commit (30 pts) + 30 mins out of 60 mins target (15 pts) = 45
      const score = AnalysisService.calculateDailyScore(0, 1, 30, 60);
      assert.strictEqual(score.leetcodePts, 0);
      assert.strictEqual(score.githubPts, 30);
      assert.strictEqual(score.codingPts, 15);
      assert.strictEqual(score.totalScore, 45);
    });

    it('returns 0 when no activity occurred', () => {
      const score = AnalysisService.calculateDailyScore(0, 0, 0, 60);
      assert.strictEqual(score.totalScore, 0);
    });
  });

  describe('Streak Calculation with 1 Freeze Day', () => {
    it('maintains streak with continuous scores >= 30', () => {
      const days = [
        { date: '2026-10-22', score: 80 },
        { date: '2026-10-21', score: 70 },
        { date: '2026-10-20', score: 40 },
        { date: '2026-10-19', score: 90 }
      ];
      const result = AnalysisService.calculateStreak(days, 30);
      assert.strictEqual(result.currentStreak, 4);
      assert.strictEqual(result.freezeDaysUsedThisWeek, 0);
    });

    it('allows 1 freeze day per 7-day period without breaking streak', () => {
      const days = [
        { date: '2026-10-22', score: 85 },
        { date: '2026-10-21', score: 0 }, // Freeze day!
        { date: '2026-10-20', score: 60 },
        { date: '2026-10-19', score: 70 }
      ];
      const result = AnalysisService.calculateStreak(days, 30);
      assert.strictEqual(result.currentStreak, 3);
      assert.strictEqual(result.freezeDaysUsedThisWeek, 1);
    });

    it('breaks streak if more than 1 day drops below threshold in same week', () => {
      const days = [
        { date: '2026-10-22', score: 90 },
        { date: '2026-10-21', score: 0 }, // 1st freeze used
        { date: '2026-10-20', score: 10 }, // 2nd low day breaks streak
        { date: '2026-10-19', score: 70 }
      ];
      const result = AnalysisService.calculateStreak(days, 30);
      assert.strictEqual(result.currentStreak, 1);
    });
  });

  describe('6.2 Weakness Analyzer', () => {
    it('identifies under-practiced topics and low medium/hard share', () => {
      const topicData = {
        'Arrays': { total: 40, medium: 20, hard: 5, easy: 15 },
        'Dynamic Programming': { total: 4, medium: 1, hard: 0, easy: 3 },
        'Graphs': { total: 6, medium: 2, hard: 0, easy: 4 }
      };

      const analysis = AnalysisService.analyzeWeaknesses(topicData);
      assert.ok(analysis.weakestTopics.length > 0);
      assert.strictEqual(analysis.weakestTopics[0].topic, 'Dynamic Programming');
    });
  });

  describe('6.3 Spaced Repetition Scheduling', () => {
    it('progresses through 3 -> 7 -> 21 day intervals on pass', () => {
      assert.strictEqual(AnalysisService.getNextReviewInterval(3, true), 7);
      assert.strictEqual(AnalysisService.getNextReviewInterval(7, true), 21);
      assert.strictEqual(AnalysisService.getNextReviewInterval(21, true), 30);
    });

    it('resets interval to 3 days on failure/struggle', () => {
      assert.strictEqual(AnalysisService.getNextReviewInterval(7, false), 3);
      assert.strictEqual(AnalysisService.getNextReviewInterval(21, false), 3);
    });
  });

  describe('6.4 Balance Detector', () => {
    it('detects practice-heavy imbalance when solves rise and build drops > 30%', () => {
      const history: any[] = [];
      for (let i = 0; i < 14; i++) {
        history.push({ date: `2026-10-${i}`, leetcodeSolves: 5, commits: 0, codingSec: 300 });
      }
      for (let i = 14; i < 42; i++) {
        history.push({ date: `2026-09-${i}`, leetcodeSolves: 1, commits: 6, codingSec: 7200 });
      }

      const balance = AnalysisService.detectBalance(history);
      assert.strictEqual(balance.status, 'practice_heavy');
      assert.ok(balance.message.includes('practising a lot but building less'));
    });
  });

  describe('6.7 Interview Readiness Score', () => {
    it('calculates weighted score across all 4 pillars', () => {
      const readiness = AnalysisService.calculateInterviewReadiness({
        easyCount: 40,
        mediumCount: 70,
        hardCount: 15,
        topicsCount: 12,
        streakDays: 14,
        avgConsistencyScore: 85,
        activeRepoCount: 4,
        totalCommits30d: 35
      });

      assert.ok(readiness.overallScore >= 70);
      assert.ok(readiness.overallScore <= 100);
      assert.ok(readiness.difficultyMixScore > 0);
      assert.ok(readiness.topicCoverageScore > 0);
      assert.ok(readiness.consistencyScore > 0);
      assert.ok(readiness.projectActivityScore > 0);
    });
  });
});
