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
        return <Code2 className="w-5 h-5 text-indigo-400" />;
      case 'project':
        return <FolderGit2 className="w-5 h-5 text-emerald-400" />;
      case 'review':
        return <BrainCircuit className="w-5 h-5 text-purple-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-amber-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-500 text-sm">
        <div className="animate-spin mr-2 w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
        <span>Synthesizing today's personalized engineering action plan...</span>
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
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Today's AI Daily Action Plan</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Section 7: 3 targeted tasks based strictly on your database gaps and scheduled retention intervals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full border ${
            source === 'ai'
              ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
              : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
          }`}>
            {source === 'ai' ? '🤖 Gemini LLM' : '⚙️ Rule-Based Engine (Safeguard)'}
          </span>

          <button
            onClick={() => loadPlan(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Plan</span>
          </button>
        </div>
      </div>

      {/* Daily Progress Overview Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-gray-900 border border-indigo-500/30 flex items-center justify-between">
        <div>
          <div className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">Date: {date}</div>
          <div className="text-2xl font-black text-white mt-1">
            {completedCount} of 3 Tasks Finished
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Total planned focus duration: ~{totalMinutes} minutes
          </div>
        </div>

        <div className="w-32 bg-gray-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
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
              className={`p-5 rounded-2xl border transition-all duration-200 ${
                isDone
                  ? 'bg-gray-900/40 border-gray-800/60 opacity-60'
                  : 'bg-gray-900 border-gray-800 hover:border-gray-700 shadow-lg'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleTask(idx)}
                    className="mt-0.5 text-gray-400 hover:text-emerald-400 transition"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-600 hover:text-indigo-400" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-gray-800 border border-gray-700">
                        {getTaskIcon(task.type)}
                      </span>
                      <span className={`text-base font-bold tracking-tight ${isDone ? 'line-through text-gray-400' : 'text-white'}`}>
                        {task.title}
                      </span>
                    </div>

                    <p className="text-xs text-indigo-300 mt-2 font-medium flex items-center gap-1.5">
                      <span className="font-semibold text-gray-400">Why this task:</span>
                      <span>{task.reason}</span>
                    </p>

                    {task.problemSlug && (
                      <div className="mt-3 flex items-center gap-3">
                        <a
                          href={`https://leetcode.com/problems/${task.problemSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-medium transition"
                        >
                          <span>Solve Problem on LeetCode</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono bg-gray-800/60 px-3 py-1 rounded-lg border border-gray-800">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{task.minutes} min</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safeguards Footnote */}
      <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-400 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-gray-300">Section 7.2 Safeguards:</span> AI receives strictly anonymized JSON summaries without private code. If the AI call times out or returns malformed schema, our rule-based planner picks verified tasks from our curated catalog so your schedule is never interrupted.
        </div>
      </div>
    </div>
  );
};
