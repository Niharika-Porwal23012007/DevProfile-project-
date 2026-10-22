import { db } from '../db/database';

export interface ConsistencyScoreBreakdown {
  date: string;
  leetcodePts: number;
  githubPts: number;
  codingPts: number;
  totalScore: number;
}

export interface WeaknessTopic {
  topic: string;
  totalSolved: number;
  mediumCount: number;
  hardCount: number;
  easyCount: number;
  advancedRatio: number;
  weaknessScore: number; // Higher means weaker
  reason: string;
}

export interface BalanceStatus {
  status: 'balanced' | 'practice_heavy' | 'build_heavy';
  message: string;
  details: {
    recentLeetCodeAvg: number;
    baselineLeetCodeAvg: number;
    recentBuildAvg: number;
    baselineBuildAvg: number;
    leetCodeChangePct: number;
    buildChangePct: number;
  };
}

export interface SkillGapItem {
  category: string;
  practiceSide: string;
  buildSide: string;
  gapType: 'practice_without_project' | 'project_without_practice' | 'aligned';
  message: string;
  recommendation: string;
}

export interface BestTimeInsight {
  peakHours: { hour: number; label: string; activeMinutes: number }[];
  peakDays: { dayIndex: number; dayName: string; activeMinutes: number }[];
  summary: string;
}

export interface InterviewReadiness {
  overallScore: number;
  difficultyMixScore: number;
  topicCoverageScore: number;
  consistencyScore: number;
  projectActivityScore: number;
  whatToImprove: string[];
}

export class AnalysisService {
  /**
   * 6.1 Calculate consistency score (0-100) for a given date
   * LeetCode (>=1 solve): 40 pts
   * GitHub (>=1 commit): 30 pts
   * Coding time target met: 30 pts (partial credit proportional to target)
   */
  static calculateDailyScore(
    solvedCount: number,
    commitsCount: number,
    codingMinutes: number,
    dailyCodingTargetMin = 60
  ): ConsistencyScoreBreakdown {
    const leetcodePts = solvedCount > 0 ? 40 : 0;
    const githubPts = commitsCount > 0 ? 30 : 0;
    const codingRatio = Math.min(1, dailyCodingTargetMin > 0 ? codingMinutes / dailyCodingTargetMin : 0);
    const codingPts = Math.round(codingRatio * 30 * 10) / 10;
    const totalScore = Math.min(100, Math.round((leetcodePts + githubPts + codingPts) * 10) / 10);

    return {
      date: new Date().toISOString().split('T')[0],
      leetcodePts,
      githubPts,
      codingPts,
      totalScore
    };
  }

  /**
   * Calculate current streak with 1 freeze day per 7-day rolling window
   * Streak threshold: score >= 30
   */
  static calculateStreak(scoresChronologicalDesc: { date: string; score: number }[], threshold = 30): {
    currentStreak: number;
    longestStreak: number;
    freezeDaysUsedThisWeek: number;
  } {
    if (!scoresChronologicalDesc.length) {
      return { currentStreak: 0, longestStreak: 0, freezeDaysUsedThisWeek: 0 };
    }

    let currentStreak = 0;
    let freezeDaysUsedThisWeek = 0;
    let daysExamined = 0;

    for (let i = 0; i < scoresChronologicalDesc.length; i++) {
      const day = scoresChronologicalDesc[i];
      daysExamined++;

      if (day.score >= threshold) {
        currentStreak++;
      } else {
        // Check if we can use our 1 freeze day per 7 days
        const currentWindowIndex = Math.floor(daysExamined / 7);
        if (freezeDaysUsedThisWeek === 0) {
          freezeDaysUsedThisWeek++;
          // Freeze day preserves streak without adding to it
        } else {
          // Cannot freeze again in same window
          break;
        }
      }
    }

    return {
      currentStreak,
      longestStreak: Math.max(currentStreak, scoresChronologicalDesc.filter(s => s.score >= threshold).length),
      freezeDaysUsedThisWeek
    };
  }

  /**
   * 6.2 Weakness Analyzer:
   * Compares solved counts per topic with average across topics.
   * Topics below average or with low medium/hard share ranked weakest.
   */
  static analyzeWeaknesses(topicData: { [topic: string]: { total: number; medium: number; hard: number; easy: number } }): {
    weakestTopics: WeaknessTopic[];
    topicStats: WeaknessTopic[];
    averageSolved: number;
  } {
    const topics = Object.keys(topicData);
    if (topics.length === 0) {
      return { weakestTopics: [], topicStats: [], averageSolved: 0 };
    }

    const totalAllSolves = topics.reduce((acc, t) => acc + topicData[t].total, 0);
    const averageSolved = totalAllSolves / topics.length;

    const list: WeaknessTopic[] = topics.map(topic => {
      const stat = topicData[topic];
      const advCount = stat.medium + stat.hard;
      const advancedRatio = stat.total > 0 ? advCount / stat.total : 0;

      // Weakness formula:
      // Volume deficit: (averageSolved - stat.total) normalized
      // Difficulty deficit: (1 - advancedRatio)
      const volumeDeficit = Math.max(0, averageSolved - stat.total);
      const weaknessScore = Math.round((volumeDeficit * 1.5 + (1 - advancedRatio) * 10) * 10) / 10;

      let reason = '';
      if (stat.total < averageSolved * 0.5) {
        reason = `Significantly under-practiced: only ${stat.total} solved vs ${Math.round(averageSolved)} average.`;
      } else if (advancedRatio < 0.3 && stat.total > 0) {
        reason = `Lacks depth: only ${Math.round(advancedRatio * 100)}% are Medium/Hard problems.`;
      } else {
        reason = `Moderate coverage with room for harder algorithmic variations.`;
      }

      return {
        topic,
        totalSolved: stat.total,
        mediumCount: stat.medium,
        hardCount: stat.hard,
        easyCount: stat.easy,
        advancedRatio: Math.round(advancedRatio * 100) / 100,
        weaknessScore,
        reason
      };
    });

    // Rank highest weakness score first
    list.sort((a, b) => b.weaknessScore - a.weaknessScore);

    return {
      weakestTopics: list.slice(0, 3),
      topicStats: list,
      averageSolved: Math.round(averageSolved * 10) / 10
    };
  }

  /**
   * 6.3 Spaced Repetition Scheduling
   * Intervals: 3, 7, 21 days.
   * If failed, reset to 3 days.
   */
  static getNextReviewInterval(currentInterval: number, passed: boolean): number {
    if (!passed) return 3;
    if (currentInterval <= 3) return 7;
    if (currentInterval <= 7) return 21;
    return 30; // Final retention checkpoint
  }

  /**
   * 6.4 Balance Detector
   * Compares last 2 weeks vs previous 4 weeks baseline.
   * Checks for >30% drift between practice (LeetCode) and building (GitHub commits + VS Code hours).
   */
  static detectBalance(
    dailyHistory: { date: string; leetcodeSolves: number; commits: number; codingSec: number }[]
  ): BalanceStatus {
    if (dailyHistory.length < 14) {
      return {
        status: 'balanced',
        message: 'Building baseline activity data...',
        details: {
          recentLeetCodeAvg: 0,
          baselineLeetCodeAvg: 0,
          recentBuildAvg: 0,
          baselineBuildAvg: 0,
          leetCodeChangePct: 0,
          buildChangePct: 0
        }
      };
    }

    const recent14 = dailyHistory.slice(0, 14);
    const baseline28 = dailyHistory.slice(14, 42);

    const calcAvgs = (slice: typeof dailyHistory) => {
      const len = Math.max(1, slice.length);
      const lcTotal = slice.reduce((acc, d) => acc + (d.leetcodeSolves || 0), 0);
      const buildTotal = slice.reduce((acc, d) => acc + (d.commits || 0) + (d.codingSec || 0) / 3600, 0);
      return { lcAvg: lcTotal / len, buildAvg: buildTotal / len };
    };

    const recent = calcAvgs(recent14);
    const baseline = calcAvgs(baseline28.length > 0 ? baseline28 : recent14);

    const leetCodeChangePct = baseline.lcAvg > 0
      ? Math.round(((recent.lcAvg - baseline.lcAvg) / baseline.lcAvg) * 100)
      : 0;

    const buildChangePct = baseline.buildAvg > 0
      ? Math.round(((recent.buildAvg - baseline.buildAvg) / baseline.buildAvg) * 100)
      : 0;

    if (leetCodeChangePct >= 25 && buildChangePct <= -30) {
      return {
        status: 'practice_heavy',
        message: 'You are practising a lot but building less. Consider shipping project features or committing your recent local code.',
        details: {
          recentLeetCodeAvg: Math.round(recent.lcAvg * 10) / 10,
          baselineLeetCodeAvg: Math.round(baseline.lcAvg * 10) / 10,
          recentBuildAvg: Math.round(recent.buildAvg * 10) / 10,
          baselineBuildAvg: Math.round(baseline.buildAvg * 10) / 10,
          leetCodeChangePct,
          buildChangePct
        }
      };
    }

    if (buildChangePct >= 25 && leetCodeChangePct <= -30) {
      return {
        status: 'build_heavy',
        message: 'You are building a lot but LeetCode practice has slowed down. Maintain your problem solving habit with 1 daily medium problem.',
        details: {
          recentLeetCodeAvg: Math.round(recent.lcAvg * 10) / 10,
          baselineLeetCodeAvg: Math.round(baseline.lcAvg * 10) / 10,
          recentBuildAvg: Math.round(recent.buildAvg * 10) / 10,
          baselineBuildAvg: Math.round(baseline.buildAvg * 10) / 10,
          leetCodeChangePct,
          buildChangePct
        }
      };
    }

    return {
      status: 'balanced',
      message: 'Great balance between algorithmic practice and project building!',
      details: {
        recentLeetCodeAvg: Math.round(recent.lcAvg * 10) / 10,
        baselineLeetCodeAvg: Math.round(baseline.lcAvg * 10) / 10,
        recentBuildAvg: Math.round(recent.buildAvg * 10) / 10,
        baselineBuildAvg: Math.round(baseline.buildAvg * 10) / 10,
        leetCodeChangePct,
        buildChangePct
      }
    };
  }

  /**
   * 6.5 Skill-Gap Map
   * Compare topics practiced (LeetCode) with languages/technologies used in repositories and VS Code.
   */
  static mapSkillGaps(
    leetcodeTopics: { [topic: string]: number },
    projectLanguages: { [lang: string]: number },
    editorTimeByLang: { [lang: string]: number }
  ): SkillGapItem[] {
    const gaps: SkillGapItem[] = [];

    // Check algorithmic topics without repository demonstration
    const dsaTopics = ['Graph', 'Dynamic Programming', 'Trie', 'Backtracking', 'Tree'];
    for (const dsa of dsaTopics) {
      const count = leetcodeTopics[dsa] || 0;
      if (count >= 8) {
        gaps.push({
          category: dsa,
          practiceSide: `${count} problems solved`,
          buildSide: 'No dedicated project implementation',
          gapType: 'practice_without_project',
          message: `Strong algorithmic mastery in ${dsa} (${count} problems), but no project repo showcases its real-world implementation.`,
          recommendation: `Build a small utility or visualization app implementing ${dsa} algorithms to showcase on GitHub.`
        });
      }
    }

    // Check project languages with zero practice problems
    const prominentBuildLangs = Object.keys(projectLanguages).filter(l => projectLanguages[l] > 1);
    for (const lang of prominentBuildLangs) {
      const editorSeconds = editorTimeByLang[lang] || 0;
      if (editorSeconds > 3600 * 5) {
        gaps.push({
          category: lang,
          practiceSide: 'Few or no LeetCode solutions in this language',
          buildSide: `${projectLanguages[lang]} repositories, ${Math.round(editorSeconds / 3600)}h in VS Code`,
          gapType: 'project_without_practice',
          message: `${lang} is heavily used in your projects (${Math.round(editorSeconds / 3600)} hrs), but LeetCode practice is mainly in other languages.`,
          recommendation: `Solve 3-5 standard data structure problems in ${lang} to ensure interview fluency in your primary build language.`
        });
      }
    }

    if (gaps.length === 0) {
      gaps.push({
        category: 'Full Stack DSA',
        practiceSide: 'Active LeetCode coverage',
        buildSide: 'Active project repositories',
        gapType: 'aligned',
        message: 'Your practical projects and algorithm practice are well synchronized.',
        recommendation: 'Continue building end-to-end features while maintaining streak.'
      });
    }

    return gaps;
  }

  /**
   * 6.6 Best-Time Insights
   * Group sessions and commit timestamps by hour and weekday (user timezone).
   */
  static analyzeBestTimes(
    sessionTimestamps: { timestamp: string; durationSec: number }[],
    timezone = 'Asia/Kolkata'
  ): BestTimeInsight {
    const hourBuckets = new Array(24).fill(0);
    const dayBuckets = new Array(7).fill(0);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (const s of sessionTimestamps) {
      try {
        const d = new Date(s.timestamp);
        // Normalize to hour and day in timezone
        const hour = d.getHours();
        const day = d.getDay();
        const minutes = Math.round(s.durationSec / 60);

        hourBuckets[hour] += minutes;
        dayBuckets[day] += minutes;
      } catch (err) {
        // Skip invalid date
      }
    }

    const peakHours = hourBuckets
      .map((min, hour) => {
        const h12 = hour % 12 === 0 ? 12 : hour % 12;
        const ampm = hour < 12 ? 'AM' : 'PM';
        return {
          hour,
          label: `${h12}:00 ${ampm}`,
          activeMinutes: min
        };
      })
      .sort((a, b) => b.activeMinutes - a.activeMinutes)
      .slice(0, 3);

    const peakDays = dayBuckets
      .map((min, dayIndex) => ({
        dayIndex,
        dayName: dayNames[dayIndex],
        activeMinutes: min
      }))
      .sort((a, b) => b.activeMinutes - a.activeMinutes)
      .slice(0, 3);

    const topHour = peakHours[0]?.label || 'Evening';
    const topDay = peakDays[0]?.dayName || 'Weekday';
    const summary = `Your peak coding concentration occurs on ${topDay}s around ${topHour}.`;

    return {
      peakHours,
      peakDays,
      summary
    };
  }

  /**
   * 6.7 Interview-Readiness Score (Estimate)
   * Formula:
   * Difficulty mix: 30%
   * Topic coverage: 25%
   * Consistency: 25%
   * Project activity: 20%
   */
  static calculateInterviewReadiness(stats: {
    easyCount: number;
    mediumCount: number;
    hardCount: number;
    topicsCount: number;
    streakDays: number;
    avgConsistencyScore: number;
    activeRepoCount: number;
    totalCommits30d: number;
  }): InterviewReadiness {
    const totalProblems = stats.easyCount + stats.mediumCount + stats.hardCount;

    // Difficulty mix (30 pts): target is healthy proportion of Medium (>=60%) and Hard (>=10%)
    const medHardTotal = stats.mediumCount + stats.hardCount * 2;
    const diffMixRatio = totalProblems > 0 ? Math.min(1, medHardTotal / Math.max(100, totalProblems)) : 0;
    const difficultyMixScore = Math.round(diffMixRatio * 30);

    // Topic coverage (25 pts): target is >=12 major DSA topics covered
    const topicRatio = Math.min(1, stats.topicsCount / 14);
    const topicCoverageScore = Math.round(topicRatio * 25);

    // Consistency (25 pts): streak + 30-day consistency
    const consistencyRatio = Math.min(1, (stats.avgConsistencyScore / 100) * 0.7 + (Math.min(30, stats.streakDays) / 30) * 0.3);
    const consistencyScore = Math.round(consistencyRatio * 25);

    // Project activity (20 pts): active repos and commits
    const projectRatio = Math.min(1, (Math.min(5, stats.activeRepoCount) / 5) * 0.5 + (Math.min(40, stats.totalCommits30d) / 40) * 0.5);
    const projectActivityScore = Math.round(projectRatio * 20);

    const overallScore = difficultyMixScore + topicCoverageScore + consistencyScore + projectActivityScore;

    const whatToImprove: string[] = [];
    if (difficultyMixScore < 20) {
      whatToImprove.push(`Increase Medium & Hard problem solves (currently ${stats.mediumCount} Med, ${stats.hardCount} Hard) to strengthen algorithmic depth.`);
    }
    if (topicCoverageScore < 18) {
      whatToImprove.push(`Broaden DSA topics (currently ${stats.topicsCount}/14 core topics touched). Expand into Dynamic Programming, Graphs, and Tries.`);
    }
    if (consistencyScore < 18) {
      whatToImprove.push(`Maintain daily consistency: aim for a 14+ day streak without relying on freeze days.`);
    }
    if (projectActivityScore < 14) {
      whatToImprove.push(`Ship regular commits to your GitHub projects (at least 3-4 commits per week across active repositories).`);
    }

    if (whatToImprove.length === 0) {
      whatToImprove.push('Outstanding profile metrics across all 4 pillars. Keep up the high standard!');
    }

    return {
      overallScore,
      difficultyMixScore,
      topicCoverageScore,
      consistencyScore,
      projectActivityScore,
      whatToImprove
    };
  }
}
