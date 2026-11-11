import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Brain,
  Scale,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Zap
} from 'lucide-react';
import { api } from '../api/client';
import { InsightsData } from '../types';

export const InsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'deficits' | 'all'>('deficits');

  useEffect(() => {
    api.getInsights().then(res => setInsights(res)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading || !insights) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 dark:text-gray-400 text-sm font-medium">
        <div className="animate-spin mr-3 w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
        <span>Computing algorithmic insights and skill gaps...</span>
      </div>
    );
  }

  const { weaknesses, balance, skillGaps, bestTimes, interviewReadiness } = insights;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          <span>Engineering Insights &amp; Skill Diagnostics</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
          Algorithmic analysis engine comparing your LeetCode patterns, Git activity, and VS Code coding windows.
        </p>
      </div>

      {/* Balance Detector Banner */}
      <div className={`p-6 rounded-3xl border transition shadow-sm ${
        balance.status === 'balanced'
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
          : balance.status === 'practice_heavy'
          ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-500/30 text-purple-800 dark:text-purple-300'
          : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300'
      }`}>
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-2xl bg-white dark:bg-gray-900 border border-current/20 shadow-sm">
            <Scale className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm tracking-tight capitalize">
                {balance.status === 'balanced' ? 'Balanced Growth Trajectory' : 'Activity Imbalance Detected'}
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white dark:bg-gray-900/60 border border-current/20 font-bold">
                14d vs 28d baseline
              </span>
            </div>
            <p className="text-xs mt-2 font-medium opacity-90 leading-relaxed">
              {balance.message}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-current/15 text-xs">
              <div>
                <span className="text-[10px] opacity-75 font-semibold block uppercase">LeetCode Solves Trend</span>
                <span className="font-extrabold flex items-center gap-1 mt-0.5">
                  {balance.details.leetCodeChangePct >= 0 ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />}
                  {balance.details.leetCodeChangePct}%
                </span>
              </div>
              <div>
                <span className="text-[10px] opacity-75 font-semibold block uppercase">Project Building Trend</span>
                <span className="font-extrabold flex items-center gap-1 mt-0.5">
                  {balance.details.buildChangePct >= 0 ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />}
                  {balance.details.buildChangePct}%
                </span>
              </div>
              <div>
                <span className="text-[10px] opacity-75 font-semibold block uppercase">Recent LC Daily Avg</span>
                <span className="font-extrabold block mt-0.5">{balance.details.recentLeetCodeAvg} problems</span>
              </div>
              <div>
                <span className="text-[10px] opacity-75 font-semibold block uppercase">Recent Build Daily Avg</span>
                <span className="font-extrabold block mt-0.5">{balance.details.recentBuildAvg} commits/hrs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Weakness Analyzer & Interview Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 6.2 Weakness Analyzer */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-500" />
                <span>Weakness Diagnostic Engine</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-gray-400">
                Topic mean: <strong className="text-slate-800 dark:text-gray-200">{weaknesses.averageSolved}</strong> solves • Ranked by Volume &amp; Depth Deficit
              </p>
            </div>

            {/* Toggle view between Top 3 Deficits and All Topics */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('deficits')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  viewMode === 'deficits'
                    ? 'bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Top 3 Deficits
              </button>
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  viewMode === 'all'
                    ? 'bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                All Topics ({weaknesses.topicStats?.length || 0})
              </button>
            </div>
          </div>

          {(!weaknesses.weakestTopics || weaknesses.weakestTopics.length === 0) ? (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800 text-center space-y-2">
              <Brain className="w-8 h-8 text-purple-400 mx-auto" />
              <h4 className="font-bold text-xs text-slate-800 dark:text-white">Establishing Topic Baseline</h4>
              <p className="text-[11px] text-slate-500 dark:text-gray-400 max-w-sm mx-auto">
                No problem volume recorded yet. Sync your LeetCode profile or log your first solved problem to begin diagnostic tracking.
              </p>
            </div>
          ) : viewMode === 'deficits' ? (
            <div className="space-y-3.5">
              {weaknesses.weakestTopics.map((topic, idx) => (
                <div key={topic.topic} className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 font-mono font-bold flex items-center justify-center text-[10px]">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{topic.topic}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        Deficit Score: {topic.weaknessScore}
                      </span>
                      <span className="font-mono text-purple-600 dark:text-purple-400 font-extrabold">
                        {topic.totalSolved} solved
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(5, (topic.totalSolved / (weaknesses.averageSolved * 1.5 || 1)) * 100))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-gray-400">
                    <span className="italic">&bull; {topic.reason}</span>
                    <span className="font-medium shrink-0 ml-2">
                      {topic.mediumCount} Med • {topic.hardCount} Hard • {topic.easyCount} Easy
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {(weaknesses.topicStats || []).map((topic, idx) => {
                const isWeak = idx < 3;
                return (
                  <div key={topic.topic} className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white truncate">{topic.topic}</span>
                        {isWeak && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-600 border border-amber-200 dark:border-amber-500/20">
                            Deficit
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">
                        {topic.mediumCount} Med • {topic.hardCount} Hard • {topic.easyCount} Easy
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-slate-900 dark:text-white block">{topic.totalSolved} solved</span>
                      <span className="text-[10px] text-slate-400 font-mono">Score: {topic.weaknessScore}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 6.7 Interview Readiness Score */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Interview Readiness Score</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-gray-400">4-pillar weighted evaluation model</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-amber-500">{interviewReadiness.overallScore}</span>
                <span className="text-xs text-slate-400 dark:text-gray-500 font-bold">/100</span>
              </div>
            </div>

            {/* 4 Pillars Breakdown */}
            <div className="grid grid-cols-2 gap-3 my-3">
              <div className="bg-slate-50 dark:bg-gray-800/40 p-3 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm">
                <div className="flex justify-between text-xs text-slate-500 dark:text-gray-400 font-medium">
                  <span>Difficulty Mix</span>
                  <span className="font-extrabold text-slate-900 dark:text-gray-200">{interviewReadiness.difficultyMixScore}/30</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(interviewReadiness.difficultyMixScore / 30) * 100}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-gray-800/40 p-3 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm">
                <div className="flex justify-between text-xs text-slate-500 dark:text-gray-400 font-medium">
                  <span>Topic Coverage</span>
                  <span className="font-extrabold text-slate-900 dark:text-gray-200">{interviewReadiness.topicCoverageScore}/25</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(interviewReadiness.topicCoverageScore / 25) * 100}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-gray-800/40 p-3 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm">
                <div className="flex justify-between text-xs text-slate-500 dark:text-gray-400 font-medium">
                  <span>Consistency</span>
                  <span className="font-extrabold text-slate-900 dark:text-gray-200">{interviewReadiness.consistencyScore}/25</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(interviewReadiness.consistencyScore / 25) * 100}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-gray-800/40 p-3 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm">
                <div className="flex justify-between text-xs text-slate-500 dark:text-gray-400 font-medium">
                  <span>Project Activity</span>
                  <span className="font-extrabold text-slate-900 dark:text-gray-200">{interviewReadiness.projectActivityScore}/20</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(interviewReadiness.projectActivityScore / 20) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-gray-800">
            <h4 className="text-[11px] font-extrabold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-2">Prescribed Next Steps:</h4>
            <ul className="space-y-1.5">
              {interviewReadiness.whatToImprove.map((item, i) => (
                <li key={i} className="text-xs text-slate-600 dark:text-gray-400 flex items-start gap-2 font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Skill Gap Map & Best Time Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 6.5 Skill-Gap Map */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Skill-Gap Cross Mapping</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">DSA vs Project Repos</span>
          </div>

          <div className="space-y-3">
            {skillGaps.map((gap, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">{gap.category}</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    gap.gapType === 'practice_without_project' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20' :
                    gap.gapType === 'project_without_practice' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' :
                    'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                  }`}>
                    {gap.gapType.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">{gap.message}</p>
                <div className="text-[11px] text-indigo-600 dark:text-indigo-300 font-semibold pt-1 border-t border-slate-200 dark:border-gray-700/50">
                  Tip: {gap.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6.6 Best-Time Insights */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>Best-Time Focus Windows</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">Asia/Kolkata</span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-indigo-50 dark:from-emerald-950/30 dark:to-indigo-950/20 border border-emerald-200 dark:border-emerald-500/20 mb-4 shadow-sm">
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              {bestTimes.summary}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-[11px] font-extrabold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">Peak Hours</h4>
              <div className="space-y-2">
                {bestTimes.peakHours.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800 font-medium">
                    <span className="text-slate-800 dark:text-gray-200">{h.label}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{Math.round(h.activeMinutes / 60)} hrs</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-extrabold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">Peak Days</h4>
              <div className="space-y-2">
                {bestTimes.peakDays.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800 font-medium">
                    <span className="text-slate-800 dark:text-gray-200">{d.dayName}</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{Math.round(d.activeMinutes / 60)} hrs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
