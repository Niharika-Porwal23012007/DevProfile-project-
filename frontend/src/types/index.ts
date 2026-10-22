export interface UserProfile {
  id: string;
  name: string;
  email: string;
  githubUsername?: string;
  leetcodeUsername?: string;
  publicSlug: string;
  isPublic: boolean;
  timezone: string;
  createdAt: string;
}

export interface ConnectedSources {
  github: {
    connected: boolean;
    username?: string;
    lastSynced?: string;
    syncStatus: string;
  };
  leetcode: {
    connected: boolean;
    username?: string;
    lastSynced?: string;
    syncStatus: string;
  };
  vscode: {
    connected: boolean;
  };
  linkedin: {
    connected: boolean;
    mode: string;
  };
}

export interface DashboardData {
  today: {
    date: string;
    solvesCount: number;
    commitsCount: number;
    codingMinutes: number;
    consistencyScore: number;
    scoreBreakdown: {
      leetcodePts: number;
      githubPts: number;
      codingPts: number;
      totalScore: number;
    };
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
    freezeDaysUsedThisWeek: number;
    weeklyAverageScore: number;
  };
  goals: {
    leetcode: { current: number; target: number };
    commits: { current: number; target: number };
    codingMin: { current: number; target: number };
  };
  heatmap: {
    date: string;
    commits: number;
    solves: number;
    codingMinutes: number;
    score: number;
    intensity: number;
  }[];
  recentRepositories: {
    repo_name: string;
    url: string;
    primary_language: string;
    stars: number;
    pushed_at: string;
  }[];
  recentProblems: {
    slug: string;
    title: string;
    difficulty: string;
    topicTags: string[];
    solved_at: string;
    struggled: number;
  }[];
}

export interface WeaknessTopic {
  topic: string;
  totalSolved: number;
  mediumCount: number;
  hardCount: number;
  easyCount: number;
  advancedRatio: number;
  weaknessScore: number;
  reason: string;
}

export interface InsightsData {
  weaknesses: {
    weakestTopics: WeaknessTopic[];
    topicStats: WeaknessTopic[];
    averageSolved: number;
  };
  balance: {
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
  };
  skillGaps: {
    category: string;
    practiceSide: string;
    buildSide: string;
    gapType: 'practice_without_project' | 'project_without_practice' | 'aligned';
    message: string;
    recommendation: string;
  }[];
  bestTimes: {
    peakHours: { hour: number; label: string; activeMinutes: number }[];
    peakDays: { dayIndex: number; dayName: string; activeMinutes: number }[];
    summary: string;
  };
  interviewReadiness: {
    overallScore: number;
    difficultyMixScore: number;
    topicCoverageScore: number;
    consistencyScore: number;
    projectActivityScore: number;
    whatToImprove: string[];
  };
}

export interface PlannerTask {
  type: 'practice' | 'project' | 'review' | 'learning';
  title: string;
  problemSlug?: string;
  minutes: number;
  reason: string;
  completed?: boolean;
}

export interface ReviewItem {
  id: string;
  problem_slug: string;
  due_date: string;
  interval_days: number;
  pattern_tag?: string;
  note_text?: string;
  title?: string;
  difficulty?: string;
}
