import React, { useEffect, useState } from 'react';
import {
  Flame,
  GitCommit,
  Clock,
  Code2,
  Calendar,
  ExternalLink,
  ChevronRight,
  Shield,
  Star,
  CheckCircle,
  AlertTriangle,
  Award,
  Sparkles
} from 'lucide-react';
import { api } from '../api/client';
import { DashboardData } from '../types';
import { ConsistencyRing } from '../components/ConsistencyRing';
import { Heatmap } from '../components/Heatmap';
import { GoalCard } from '../components/GoalCard';
import { GitHubLogo, LeetCodeLogo, VSCodeLogo } from '../components/BrandIcons';

interface DashboardPageProps {
  onNavigateTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateTab }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard(range);
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [range]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 dark:text-gray-400 text-sm font-medium">
        <div className="animate-spin mr-3 w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
        <span>Loading unified developer analytics...</span>
      </div>
    );
  }

  const { today, streak, goals, heatmap, recentRepositories, recentProblems } = data;

  return (
    <div className="space-y-6">
      {/* Top Banner: Key Counters & Consistency Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Streak & Daily Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Streak Banner with Gradient */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-2xl bg-white/20 backdrop-blur text-white border border-white/30 shadow-inner">
                    <Flame className="w-7 h-7 animate-pulse text-amber-300" />
                  </span>
                  <div>
                    <span className="text-3xl sm:text-4xl font-black tracking-tight">{streak.currentStreak} Days</span>
                    <span className="text-xs font-bold text-amber-200 block uppercase tracking-wider">Active Consistency Streak</span>
                  </div>
                </div>
                <p className="text-xs text-white/90 mt-3 max-w-md leading-relaxed">
                  Daily discipline score &ge; 30 pts. Weekly freeze day available: {1 - streak.freezeDaysUsedThisWeek} remaining to protect your habit.
                </p>
              </div>

              <div className="sm:text-right bg-white/10 backdrop-blur px-4 py-3 rounded-2xl border border-white/20">
                <div className="text-[11px] text-white/80 font-bold uppercase tracking-wider">Weekly Score Average</div>
                <div className="text-3xl font-black text-white">{streak.weeklyAverageScore}<span className="text-sm font-semibold opacity-80">/100</span></div>
                <div className="text-[10px] text-white/70 mt-0.5">Longest streak: {streak.longestStreak} days</div>
              </div>
            </div>
          </div>

          {/* Daily Goal Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GoalCard
              title="LeetCode Practice"
              current={goals.leetcode.current}
              target={goals.leetcode.target}
              unit="problems"
              icon={<LeetCodeLogo className="w-5 h-5" />}
              color="indigo"
            />
            <GoalCard
              title="GitHub Commits"
              current={goals.commits.current}
              target={goals.commits.target}
              unit="commits"
              icon={<GitHubLogo className="w-5 h-5" />}
              color="emerald"
            />
            <GoalCard
              title="VS Code Focus"
              current={goals.codingMin.current}
              target={goals.codingMin.target}
              unit="mins"
              icon={<VSCodeLogo className="w-5 h-5" />}
              color="amber"
            />
          </div>
        </div>

        {/* Right Col: Consistency Score Breakdown */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Daily Consistency</h3>
              <p className="text-[11px] text-slate-500 dark:text-gray-400">Formula: LC 40 + GH 30 + VS 30</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              Live Today
            </span>
          </div>

          <div className="my-4">
            <ConsistencyRing
              score={today.consistencyScore}
              leetcodePts={today.scoreBreakdown.leetcodePts}
              githubPts={today.scoreBreakdown.githubPts}
              codingPts={today.scoreBreakdown.codingPts}
            />
          </div>

          <button
            onClick={() => onNavigateTab('planner')}
            className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-1.5"
          >
            <span>View Today's AI Action Plan</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Merged Contribution Heatmap */}
      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>Merged Activity Matrix</span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                GitHub + LeetCode + VS Code
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
              Color intensity represents overall verified daily score combining commits, solves, and active coding hours.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-gray-800/80 p-1 rounded-xl border border-slate-200 dark:border-gray-700/60 text-xs font-bold">
            <button
              onClick={() => setRange('7d')}
              className={`px-3 py-1 rounded-lg transition ${range === '7d' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              7D
            </button>
            <button
              onClick={() => setRange('30d')}
              className={`px-3 py-1 rounded-lg transition ${range === '30d' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              30D
            </button>
            <button
              onClick={() => setRange('90d')}
              className={`px-3 py-1 rounded-lg transition ${range === '90d' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              90D
            </button>
          </div>
        </div>

        <Heatmap data={heatmap} />
      </div>

      {/* Two Column Section: Repositories & Recent Problems */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent GitHub Repositories */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <GitHubLogo className="w-4 h-4 text-slate-900 dark:text-white" />
              <span>Active GitHub Repositories</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400">{recentRepositories.length} synced</span>
          </div>

          <div className="space-y-3">
            {recentRepositories.map((repo) => (
              <div
                key={repo.repo_name}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-gray-700 transition flex items-center justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      {repo.repo_name}
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-gray-700">
                      {repo.primary_language}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-gray-400 mt-1">
                    Pushed: {new Date(repo.pushed_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-amber-500 font-mono font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{repo.stars}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent LeetCode Solves */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <LeetCodeLogo className="w-4 h-4" />
              <span>Recent Algorithmic Solves</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400">{recentProblems.length} recent</span>
          </div>

          <div className="space-y-3">
            {recentProblems.map((prob) => {
              const diffColor =
                prob.difficulty === 'Easy' ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' :
                prob.difficulty === 'Medium' ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' :
                'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20';

              return (
                <div
                  key={prob.slug}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-gray-700 transition flex items-center justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-gray-200">{prob.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${diffColor}`}>
                        {prob.difficulty}
                      </span>
                      {prob.struggled === 1 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>Spaced Queue</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-gray-400 mt-1">
                      Tags: {prob.topicTags.join(', ')} &bull; {new Date(prob.solved_at).toLocaleDateString()}
                    </div>
                  </div>

                  <a
                    href={`https://leetcode.com/problems/${prob.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-slate-200 dark:hover:bg-gray-800 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
