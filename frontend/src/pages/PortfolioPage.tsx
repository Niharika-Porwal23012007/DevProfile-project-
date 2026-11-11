import React, { useEffect, useState } from 'react';
import {
  Code,
  Flame,
  GitCommit,
  Clock,
  Star,
  ExternalLink,
  ShieldCheck,
  Award,
  Layers
} from 'lucide-react';
import { api } from '../api/client';
import { GitHubIcon, LeetCodeIcon, GlobalBadge } from '../components/BrandIcons';

interface PortfolioPageProps {
  publicSlug: string;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ publicSlug }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getPublicPortfolio(publicSlug);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Portfolio not found or set to private.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [publicSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-700 dark:text-gray-100 flex items-center justify-center text-xs">
        <div className="animate-spin mr-2 w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
        <span>Loading verified student portfolio...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-700 dark:text-gray-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Portfolio Unavailable</h2>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-2 max-w-sm">{error}</p>
        <a href="/" className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition">
          Return to DevProfile Home
        </a>
      </div>
    );
  }

  const { user, verifiedStats, topRepositories, verifiedSkills } = data;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-gray-100 p-6 md:p-12 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="app-card bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/70 dark:from-gray-900 dark:via-gray-900/90 dark:to-indigo-950/40 border border-slate-200 dark:border-gray-800 rounded-3xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-2xl text-white shadow-xl shadow-indigo-600/30 uppercase">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{user.name}</h1>
                <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-500 dark:text-emerald-400" title="Verified DevProfile">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <GlobalBadge className="w-4 h-4 rounded-full" />
                <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Full-Stack Software Engineer &bull; Verified Portfolio</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-gray-400 mt-2 font-mono">
                {user.githubUsername && (
                  <span className="flex items-center gap-1.5">
                    <GitHubIcon className="w-3.5 h-3.5 text-slate-700 dark:text-gray-300" />
                    <span>@{user.githubUsername}</span>
                  </span>
                )}
                {user.leetcodeUsername && (
                  <span className="flex items-center gap-1.5">
                    <LeetCodeIcon className="w-3.5 h-3.5" />
                    <span>@{user.leetcodeUsername}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-xs">
            <Award className="w-4 h-4 text-indigo-500" />
            <span>DevProfile Verified Credentials</span>
          </div>
        </div>

        {/* 4 Verified Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="app-card p-5 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-center shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 block">LeetCode Solved</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block">{verifiedStats.totalSolves}</span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 block font-medium">
              {verifiedStats.solvedBreakdown.medium} Med • {verifiedStats.solvedBreakdown.hard} Hard
            </span>
          </div>

          <div className="app-card p-5 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-center shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 block">GitHub Commits</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block">{verifiedStats.totalCommits}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block font-medium">Across active repos</span>
          </div>

          <div className="app-card p-5 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-center shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 block">VS Code Focus</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block">{verifiedStats.totalCodingHours}h</span>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1 block font-medium">Tracked active time</span>
          </div>

          <div className="app-card p-5 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-center shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 block">Active Streak</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block">{verifiedStats.currentStreakDays}d</span>
            <span className="text-[10px] text-orange-600 dark:text-orange-400 mt-1 block font-medium">Daily discipline</span>
          </div>
        </div>

        {/* Top Repositories */}
        <div className="app-card bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <GitHubIcon className="w-5 h-5 text-slate-800 dark:text-slate-200" />
            <span>Featured Open-Source Projects</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topRepositories.map((repo: any) => (
              <div key={repo.repo_name} className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800 space-y-2 hover:border-indigo-400 dark:hover:border-gray-700 transition">
                <div className="flex items-center justify-between">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
                  >
                    <span>{repo.repo_name}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 dark:text-gray-500" />
                  </a>
                  <div className="flex items-center gap-1 text-xs text-amber-500 dark:text-amber-400 font-mono">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{repo.stars}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-300 font-mono text-[10px] border border-slate-200 dark:border-gray-700">
                    {repo.primary_language}
                  </span>
                  <span className="text-slate-500 dark:text-gray-500 text-[11px]">
                    Last updated {new Date(repo.pushed_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Algorithmic Skills */}
        <div className="app-card bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Verified Algorithmic &amp; Engineering Skills</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 mb-4">
            Topics actively demonstrated through solved LeetCode problems and production code commits.
          </p>

          <div className="flex flex-wrap gap-2">
            {verifiedSkills.map((skill: string) => (
              <span
                key={skill}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-xs font-semibold text-slate-700 dark:text-gray-200 shadow-2xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
