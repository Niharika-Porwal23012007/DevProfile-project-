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
      <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex items-center justify-center text-xs text-gray-500">
        <div className="animate-spin mr-2 w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
        <span>Loading verified student portfolio...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Portfolio Unavailable</h2>
        <p className="text-xs text-gray-400 mt-2 max-w-sm">{error}</p>
        <a href="/" className="mt-4 px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-gray-200">
          Return to DevProfile Home
        </a>
      </div>
    );
  }

  const { user, verifiedStats, topRepositories, verifiedSkills } = data;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-900/90 to-indigo-950/40 border border-gray-800 rounded-3xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-2xl text-white shadow-xl shadow-indigo-600/30 uppercase">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-white tracking-tight">{user.name}</h1>
                <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400" title="Verified DevProfile">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs text-indigo-400 mt-0.5">Software Engineering Student • Medi-Caps University</p>
              <div className="flex items-center gap-3 text-xs text-gray-400 mt-2 font-mono">
                {user.githubUsername && <span>gh/@{user.githubUsername}</span>}
                {user.leetcodeUsername && <span>lc/@{user.leetcodeUsername}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Award className="w-4 h-4" />
            <span>DevProfile Verified Credentials</span>
          </div>
        </div>

        {/* 4 Verified Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">LeetCode Solved</span>
            <span className="text-3xl font-black text-white mt-2 block">{verifiedStats.totalSolves}</span>
            <span className="text-[10px] text-indigo-400 mt-1 block">
              {verifiedStats.solvedBreakdown.medium} Med • {verifiedStats.solvedBreakdown.hard} Hard
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">GitHub Commits</span>
            <span className="text-3xl font-black text-white mt-2 block">{verifiedStats.totalCommits}</span>
            <span className="text-[10px] text-emerald-400 mt-1 block">Across active repos</span>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">VS Code Focus</span>
            <span className="text-3xl font-black text-white mt-2 block">{verifiedStats.totalCodingHours}h</span>
            <span className="text-[10px] text-amber-400 mt-1 block">Tracked active time</span>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Active Streak</span>
            <span className="text-3xl font-black text-white mt-2 block">{verifiedStats.currentStreakDays}d</span>
            <span className="text-[10px] text-orange-400 mt-1 block">Daily discipline</span>
          </div>
        </div>

        {/* Top Repositories */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-emerald-400" />
            <span>Featured Open-Source Projects</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topRepositories.map((repo: any) => (
              <div key={repo.repo_name} className="p-4 rounded-2xl bg-gray-800/40 border border-gray-800 space-y-2 hover:border-gray-700 transition">
                <div className="flex items-center justify-between">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-sm text-indigo-400 hover:underline flex items-center gap-1.5"
                  >
                    <span>{repo.repo_name}</span>
                    <ExternalLink className="w-3 h-3 text-gray-500" />
                  </a>
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-mono">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{repo.stars}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-mono text-[10px] border border-gray-700">
                    {repo.primary_language}
                  </span>
                  <span className="text-gray-500 text-[11px]">
                    Last updated {new Date(repo.pushed_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Algorithmic Skills */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <span>Verified Algorithmic &amp; Engineering Skills</span>
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Topics actively demonstrated through solved LeetCode problems and production code.
          </p>

          <div className="flex flex-wrap gap-2">
            {verifiedSkills.map((skill: string) => (
              <span
                key={skill}
                className="px-3.5 py-1.5 rounded-xl bg-gray-800 border border-gray-700 text-xs font-semibold text-gray-200"
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
