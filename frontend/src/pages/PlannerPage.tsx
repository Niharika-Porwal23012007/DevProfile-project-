import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Code2,
  FolderGit2,
  BrainCircuit,
  BookOpen
} from 'lucide-react';
import { api } from '../api/client';
import { PlannerTask } from '../types';
import { GeminiAILogo } from '../components/BrandIcons';

export const PlannerPage: React.FC = () => {
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [source, setSource] = useState<'ai' | 'rule-based-fallback' | 'cached'>('rule-based-fallback');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [date, setDate] = useState('');

  const loadPlan = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const res = await api.getDailyPlan(refresh);
      setTasks(res.tasks || []);
      setSource(res.source);
      setDate(res.date);
    } catch (err) {
      console.error('Failed to load plan:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, []);

  const toggleTask = async (idx: number) => {
    try {
      const updated = [...tasks];
      updated[idx].completed = !updated[idx].completed;
      setTasks(updated);
      await api.togglePlanTask(idx);
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'practice':
        return <Code2 className="w-5 h-5 text-indigo-500" />;
      case 'project':
        return <FolderGit2 className="w-5 h-5 text-emerald-500" />;
      case 'review':
        return <BrainCircuit className="w-5 h-5 text-purple-500" />;
      default:
        return <BookOpen className="w-5 h-5 text-amber-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 dark:text-gray-400 text-sm font-medium">
        <div className="animate-spin mr-3 w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
        <span>Synthesizing today's personalized engineering action plan with Gemini AI...</span>
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const totalMinutes = tasks.reduce((acc, t) => acc + t.minutes, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span>Today's AI Daily Action Plan</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            3 targeted tasks based strictly on your skill deficits and scheduled retention intervals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-sm ${
            source === 'ai'
              ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30'
              : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30'
          }`}>
            <GeminiAILogo className="w-3.5 h-3.5" />
            <span>{source === 'ai' ? 'Google Gemini 1.5 Flash' : 'Rule-Based Engine (Safeguard)'}</span>
          </span>

          <button
            onClick={() => loadPlan(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-800 dark:text-gray-200 border border-slate-200 dark:border-gray-700 transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Plan</span>
          </button>
        </div>
      </div>

      {/* Daily Progress Overview Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white shadow-xl shadow-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-white/80 font-bold uppercase tracking-wider">Date: {date}</div>
          <div className="text-2xl sm:text-3xl font-black mt-1">
            {completedCount} of 3 Tasks Finished
          </div>
          <div className="text-xs text-white/90 mt-1">
            Total planned focus duration: ~{totalMinutes} minutes
          </div>
        </div>

        <div className="w-full sm:w-44 bg-white/20 backdrop-blur h-3 rounded-full overflow-hidden p-0.5 border border-white/30">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Task Cards */}
      <div className="space-y-4">
        {tasks.map((task, idx) => {
          const isDone = task.completed;
          return (
            <div
              key={idx}
              className={`p-6 rounded-3xl border transition-all duration-200 shadow-sm ${
                isDone
                  ? 'bg-slate-100/60 dark:bg-gray-900/40 border-slate-200 dark:border-gray-800/60 opacity-60'
                  : 'bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleTask(idx)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-500 transition"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300 dark:text-gray-600 hover:text-indigo-500" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-xl bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700">
                        {getTaskIcon(task.type)}
                      </span>
                      <span className={`text-base font-extrabold tracking-tight ${isDone ? 'line-through text-slate-400 dark:text-gray-500' : 'text-slate-900 dark:text-white'}`}>
                        {task.title}
                      </span>
                    </div>

                    <p className="text-xs text-indigo-600 dark:text-indigo-300 mt-2.5 font-medium flex items-center gap-1.5">
                      <span className="font-bold text-slate-500 dark:text-gray-400">Why this task:</span>
                      <span>{task.reason}</span>
                    </p>

                    {task.problemSlug && (
                      <div className="mt-3 flex items-center gap-3">
                        <a
                          href={`https://leetcode.com/problems/${task.problemSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition shadow-sm"
                        >
                          <span>Solve Problem on LeetCode</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-gray-400 font-mono font-bold bg-slate-100 dark:bg-gray-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-gray-800 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{task.minutes} min</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safeguards Footnote */}
      <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-xs text-slate-600 dark:text-gray-400 flex items-start gap-3 shadow-sm">
        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900 dark:text-gray-200">Execution Safeguards:</span> The planning service receives strictly anonymized JSON summaries without private source code. If an upstream call times out or returns malformed schema, our deterministic engine picks verified problems from our curated catalog so your schedule is never interrupted.
        </div>
      </div>
    </div>
  );
};
