import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Brain,
  Scale,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  Zap
} from 'lucide-react';
import { api } from '../api/client';
import { InsightsData } from '../types';

export const InsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.getInsights();
        setInsights(res);
      } catch (err) {
        console.error('Failed to load insights:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !insights) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-500 text-sm">
        <div className="animate-spin mr-2 w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
        <span>Computing algorithmic insights and skill gaps...</span>
      </div>
    );
  }

  const { weaknesses, balance, skillGaps, bestTimes, interviewReadiness } = insights;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          <span>Engineering Insights &amp; Skill Diagnostics</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Algorithmic analysis engine comparing your LeetCode patterns, Git activity, and VS Code coding windows.
        </p>
      </div>

      {/* Balance Detector Banner (Section 6.4) */}
      <div className={`p-5 rounded-2xl border ${
        balance.status === 'balanced'
          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
          : balance.status === 'practice_heavy'
          ? 'bg-purple-950/30 border-purple-500/30 text-purple-300'
          : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
      }`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-gray-900 border border-current/20">
            <Scale className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm tracking-tight capitalize">
                {balance.status === 'balanced' ? 'Balanced Growth Trajectory' : 'Activity Imbalance Detected'}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-900/60 border border-current/20">
                14-day vs 28-day baseline
              </span>
            </div>
            <p className="text-xs mt-1.5 opacity-90 leading-relaxed">
              {balance.message}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-current/10 text-xs">
              <div>
                <span className="text-[10px] opacity-75 block">LeetCode Solves Trend</span>
                <span className="font-bold flex items-center gap-1">
                  {balance.details.leetCodeChangePct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {balance.details.leetCodeChangePct}%
                </span>
              </div>
              <div>
                <span className="text-[10px] opacity-75 block">Project Building Trend</span>
                <span className="font-bold flex items-center gap-1">
                  {balance.details.buildChangePct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {balance.details.buildChangePct}%
                </span>
              </div>
              <div>
                <span className="text-[10px] opacity-75 block">Recent LC Daily Avg</span>
                <span className="font-bold">{balance.details.recentLeetCodeAvg} problems</span>
              </div>
              <div>
                <span className="text-[10px] opacity-75 block">Recent Build Daily Avg</span>
                <span className="font-bold">{balance.details.recentBuildAvg} commits/hrs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Weakness Analyzer & Interview Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 6.2 Weakness Analyzer */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>Weakness Analyzer</span>
              </h3>
              <p className="text-[11px] text-gray-400">
                Average across all topics: {weaknesses.averageSolved} problems
              </p>
            </div>
            <span className="text-xs text-purple-400 font-semibold bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
              Top 3 Weakest
            </span>
          </div>

          <div className="space-y-4">
            {weaknesses.weakestTopics.map((topic, idx) => (
              <div key={topic.topic} className="p-4 rounded-xl bg-gray-800/40 border border-gray-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold flex items-center justify-center text-[10px]">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-white text-sm">{topic.topic}</span>
                  </div>
                  <span className="font-mono text-purple-400 font-semibold">
                    {topic.totalSolved} solved ({Math.round(topic.advancedRatio * 100)}% Med/Hard)
                  </span>
                </div>

                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${Math.min(100, (topic.totalSolved / (weaknesses.averageSolved * 1.5 || 1)) * 100)}%` }}
                  />
                </div>

                <p className="text-[11px] text-gray-400 italic">
                  &bull; {topic.reason}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 6.7 Interview Readiness Score */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Interview Readiness Score</span>
                </h3>
                <p className="text-[11px] text-gray-400">Weighted evaluation formula (Section 6.7)</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-amber-400">{interviewReadiness.overallScore}</span>
                <span className="text-xs text-gray-500">/100</span>
              </div>
            </div>

            {/* 4 Pillars Breakdown */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="bg-gray-800/40 p-3 rounded-xl border border-gray-800">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Difficulty Mix</span>
                  <span className="font-bold text-gray-200">{interviewReadiness.difficultyMixScore}/30</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(interviewReadiness.difficultyMixScore / 30) * 100}%` }} />
                </div>
              </div>

              <div className="bg-gray-800/40 p-3 rounded-xl border border-gray-800">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Topic Coverage</span>
                  <span className="font-bold text-gray-200">{interviewReadiness.topicCoverageScore}/25</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(interviewReadiness.topicCoverageScore / 25) * 100}%` }} />
                </div>
              </div>

              <div className="bg-gray-800/40 p-3 rounded-xl border border-gray-800">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Consistency</span>
                  <span className="font-bold text-gray-200">{interviewReadiness.consistencyScore}/25</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(interviewReadiness.consistencyScore / 25) * 100}%` }} />
                </div>
              </div>

              <div className="bg-gray-800/40 p-3 rounded-xl border border-gray-800">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Project Activity</span>
                  <span className="font-bold text-gray-200">{interviewReadiness.projectActivityScore}/20</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(interviewReadiness.projectActivityScore / 20) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Recommended Next Actions:</h4>
            <ul className="space-y-1.5">
              {interviewReadiness.whatToImprove.map((item, i) => (
                <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
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
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Skill-Gap Cross Mapping</span>
            </h3>
            <span className="text-xs text-gray-400">DSA vs Project Code</span>
          </div>

          <div className="space-y-3">
            {skillGaps.map((gap, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-gray-800/40 border border-gray-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{gap.category}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    gap.gapType === 'practice_without_project' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                    gap.gapType === 'project_without_practice' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {gap.gapType.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{gap.message}</p>
                <div className="text-[11px] text-indigo-300 font-medium pt-1 border-t border-gray-700/50">
                  Tip: {gap.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6.6 Best-Time Insights */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Best-Time Concentration Insights</span>
            </h3>
            <span className="text-xs text-gray-400">Asia/Kolkata</span>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 to-indigo-950/20 border border-emerald-500/20 mb-4">
            <p className="text-xs font-semibold text-emerald-300">
              {bestTimes.summary}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Peak Hours</h4>
              <div className="space-y-2">
                {bestTimes.peakHours.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-gray-800/40 border border-gray-800">
                    <span className="font-medium text-gray-200">{h.label}</span>
                    <span className="font-mono text-emerald-400 font-bold">{Math.round(h.activeMinutes / 60)} hrs</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Peak Days</h4>
              <div className="space-y-2">
                {bestTimes.peakDays.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-gray-800/40 border border-gray-800">
                    <span className="font-medium text-gray-200">{d.dayName}</span>
                    <span className="font-mono text-indigo-400 font-bold">{Math.round(d.activeMinutes / 60)} hrs</span>
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
