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
  AlertTriangle
} from 'lucide-react';
import { api } from '../api/client';
import { DashboardData } from '../types';
import { ConsistencyRing } from '../components/ConsistencyRing';
import { Heatmap } from '../components/Heatmap';
import { GoalCard } from '../components/GoalCard';

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
      <div className="flex items-center justify-center min-h-[400px] text-gray-500 text-sm">
        <div className="animate-spin mr-2 w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
        <span>Loading unified analytics...</span>
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
          {/* Streak Banner */}
          <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-gray-900 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    <Flame className="w-6 h-6 animate-pulse" />
                  </span>
                  <div>
                    <span className="text-3xl font-black tracking-tight text-white">{streak.currentStreak} Days</span>
                    <span className="text-xs font-semibold text-orange-400 block">Active Consistency Streak</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3 max-w-md">
                  Maintained with daily scores &ge; 30 points. Freeze day available: {1 - streak.freezeDaysUsedThisWeek} remaining this week.
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-400">Weekly Score Average</div>
                <div className="text-2xl font-extrabold text-indigo-400">{streak.weeklyAverageScore}/100</div>
                <div className="text-[11px] text-gray-500 mt-1">Longest: {streak.longestStreak} days</div>
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
              icon={<Code2 className="w-4 h-4" />}
              color="indigo"
            />
            <GoalCard
              title="GitHub Commits"
              current={goals.commits.current}
              target={goals.commits.target}
              unit="commits"
              icon={<GitCommit className="w-4 h-4" />}
              color="emerald"
            />
            <GoalCard
              title="VS Code Focus"
              current={goals.codingMin.current}
              target={goals.codingMin.target}
              unit="mins"
              icon={<Clock className="w-4 h-4" />}
              color="amber"
            />
          </div>
        </div>

        {/* Right Col: Consistency Score Breakdown */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">Daily Consistency</h3>
              <p className="text-[11px] text-gray-400">Algorithm formula (Section 6.1)</p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Today
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
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-1.5"
          >
            <span>View Today's AI Plan</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Merged Contribution Heatmap */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span>Merged Activity Matrix</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                GitHub + LeetCode + VS Code
              </span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Color intensity reflects overall verified daily consistency score.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-gray-800/80 p-1 rounded-lg border border-gray-700/60 text-xs">
            <button
              onClick={() => setRange('7d')}
              className={`px-2.5 py-1 rounded-md transition ${range === '7d' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              7D
            </button>
            <button
              onClick={() => setRange('30d')}
              className={`px-2.5 py-1 rounded-md transition ${range === '30d' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              30D
            </button>
            <button
              onClick={() => setRange('90d')}
              className={`px-2.5 py-1 rounded-md transition ${range === '90d' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
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
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-emerald-400" />
              <span>Active GitHub Repositories</span>
            </h3>
            <span className="text-xs text-gray-400">{recentRepositories.length} synced</span>
          </div>

          <div className="space-y-3">
            {recentRepositories.map((repo) => (
              <div
                key={repo.repo_name}
                className="p-3.5 rounded-xl bg-gray-800/40 border border-gray-800 hover:border-gray-700 transition flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-xs text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      {repo.repo_name}
                      <ExternalLink className="w-3 h-3 text-gray-500" />
                    </a>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">
                      {repo.primary_language}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    Last pushed: {new Date(repo.pushed_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-amber-400 font-mono">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{repo.stars}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent LeetCode Solves */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>Recent Algorithmic Solves</span>
            </h3>
            <span className="text-xs text-gray-400">{recentProblems.length} recent</span>
          </div>

          <div className="space-y-3">
            {recentProblems.map((prob) => {
              const diffColor =
                prob.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                prob.difficulty === 'Medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                'text-red-400 bg-red-500/10 border-red-500/20';

              return (
                <div
                  key={prob.slug}
                  className="p-3.5 rounded-xl bg-gray-800/40 border border-gray-800 hover:border-gray-700 transition flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-gray-200">{prob.title}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${diffColor}`}>
                        {prob.difficulty}
                      </span>
                      {prob.struggled === 1 && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>In Spaced Queue</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">
                      Tags: {prob.topicTags.join(', ')} • Solved {new Date(prob.solved_at).toLocaleDateString()}
                    </div>
                  </div>

                  <a
                    href={`https://leetcode.com/problems/${prob.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-500 hover:text-indigo-400 rounded-lg hover:bg-gray-800 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
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
