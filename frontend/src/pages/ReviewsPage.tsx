import React, { useEffect, useState } from 'react';
import {
  Brain,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Tag,
  FileEdit,
  Save,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { api } from '../api/client';
import { ReviewItem } from '../types';

export const ReviewsPage: React.FC = () => {
  const [dueToday, setDueToday] = useState<ReviewItem[]>([]);
  const [upcoming, setUpcoming] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [patternTag, setPatternTag] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.getTodayReviews();
      setDueToday(res.dueToday || []);
      setUpcoming(res.upcoming || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDone = async (reviewId: string, passed: boolean) => {
    try {
      await api.completeReview(reviewId, passed);
      await fetchReviews();
    } catch (err) {
      console.error('Failed to update review:', err);
    }
  };

  const handleOpenNote = async (slug: string) => {
    setSelectedSlug(slug);
    setSaveSuccess(false);
    try {
      const res = await api.getProblemNote(slug);
      setNoteText(res.note?.note_text || '');
      setPatternTag(res.note?.pattern_tag || '');
    } catch (err) {
      setNoteText('');
      setPatternTag('');
    }
  };

  const handleSaveNote = async () => {
    if (!selectedSlug) return;
    try {
      setSavingNote(true);
      await api.saveProblemNote(selectedSlug, noteText, patternTag);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      fetchReviews();
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 dark:text-gray-400 text-sm font-medium">
        <div className="animate-spin mr-3 w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
        <span>Loading spaced-repetition retention queue...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-500" />
          <span>Spaced Repetition &amp; Problem Review Queue</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
          When problems are struggled, DevProfile automatically schedules retention reviews after 3, 7, and 21 days to prevent forgetting.
        </p>
      </div>

      {/* Main Grid: Queue and Note Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Queues */}
        <div className="lg:col-span-2 space-y-6">
          {/* Due Today */}
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span>Due Today for Review ({dueToday.length})</span>
              </h3>
              <span className="text-xs text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2.5 py-0.5 rounded-full">
                Active Retention Queue
              </span>
            </div>

            {dueToday.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-gray-800 rounded-2xl text-slate-500 dark:text-gray-400 text-xs">
                No problems due for review today. Great work staying on top of spaced repetition!
              </div>
            ) : (
              <div className="space-y-3">
                {dueToday.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-gray-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">{rev.title || rev.problem_slug}</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                          {rev.interval_days}d interval
                        </span>
                        {rev.pattern_tag && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-gray-700 flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />
                            <span>{rev.pattern_tag}</span>
                          </span>
                        )}
                      </div>

                      {rev.note_text && (
                        <p className="text-xs text-slate-600 dark:text-gray-400 mt-2 line-clamp-1 italic">
                          "{rev.note_text}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenNote(rev.problem_slug)}
                        className="p-2 text-slate-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-gray-800 rounded-xl transition"
                        title="View / Edit Note"
                      >
                        <FileEdit className="w-4 h-4" />
                      </button>

                      <a
                        href={`https://leetcode.com/problems/${rev.problem_slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-gray-800 rounded-xl transition"
                        title="Open on LeetCode"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => handleDone(rev.id, true)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-600/20 hover:bg-emerald-100 dark:hover:bg-emerald-600/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-xs font-bold flex items-center gap-1 transition shadow-sm"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Solved</span>
                      </button>

                      <button
                        onClick={() => handleDone(rev.id, false)}
                        className="px-2.5 py-1.5 rounded-xl bg-red-50 dark:bg-red-600/20 hover:bg-red-100 dark:hover:bg-red-600/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30 text-xs font-bold flex items-center gap-1 transition shadow-sm"
                        title="Failed or struggled (resets interval to 3 days)"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Struggled</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Schedule */}
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>Upcoming Scheduled Reviews ({upcoming.length})</span>
            </h3>

            <div className="space-y-2">
              {upcoming.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-gray-800/30 border border-slate-200 dark:border-gray-800/60 flex items-center justify-between text-xs font-medium"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-800 dark:text-gray-200 font-bold">{item.title || item.problem_slug}</span>
                    {item.pattern_tag && (
                      <span className="text-[10px] text-slate-500 dark:text-gray-400">({item.pattern_tag})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 dark:text-gray-400">
                    <span>Due: {item.due_date}</span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 font-bold border border-slate-200 dark:border-gray-700">
                      {item.interval_days}d
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Problem Note Editor */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-purple-500" />
                <span>Pattern Note Scratchpad</span>
              </h3>
            </div>

            {selectedSlug ? (
              <div className="space-y-4">
                <div className="text-xs">
                  <span className="text-slate-500 dark:text-gray-400">Target Problem: </span>
                  <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400">{selectedSlug}</span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-gray-400 block mb-1">
                    Algorithmic Pattern Tag (e.g. Monotonic Stack, Sliding Window, DP)
                  </label>
                  <input
                    type="text"
                    value={patternTag}
                    onChange={(e) => setPatternTag(e.target.value)}
                    placeholder="e.g. Dynamic Programming / Knapsack"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-gray-400 block mb-1">
                    Key Insights, Pitfalls &amp; Edge Cases
                  </label>
                  <textarea
                    rows={8}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Write key memoization state transition, cycle detection trick, or optimal complexity notes..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed resize-none"
                  />
                </div>

                <button
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingNote ? 'Saving...' : 'Save Problem Note'}</span>
                </button>

                {saveSuccess && (
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 text-center font-bold animate-fade-in">
                    ✓ Note and pattern tag saved successfully!
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 dark:text-gray-500 text-xs border border-dashed border-slate-200 dark:border-gray-800 rounded-2xl">
                Click the edit note icon on any problem on the left to write or review personal pattern notes.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
