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

  // Note editor modal/drawer state
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
      <div className="flex items-center justify-center min-h-[400px] text-gray-500 text-sm">
        <div className="animate-spin mr-2 w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
        <span>Loading spaced-repetition queue...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400" />
          <span>Spaced Repetition &amp; Problem Notes (Section 6.3)</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          When problems are struggled, DevProfile automatically schedules retention reviews after 3, 7, and 21 days to prevent forgetting.
        </p>
      </div>

      {/* Main Grid: Queue and Note Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Queues */}
        <div className="lg:col-span-2 space-y-6">
          {/* Due Today */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span>Due Today for Review ({dueToday.length})</span>
              </h3>
              <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                Active Queue
              </span>
            </div>

            {dueToday.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-gray-800 rounded-xl text-gray-500 text-xs">
                No problems due for review today. Great work staying on top of spaced repetition!
              </div>
            ) : (
              <div className="space-y-3">
                {dueToday.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl bg-gray-800/40 border border-gray-800 hover:border-gray-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{rev.title || rev.problem_slug}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {rev.interval_days}d interval
                        </span>
                        {rev.pattern_tag && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-800 text-indigo-300 border border-gray-700 flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />
                            <span>{rev.pattern_tag}</span>
                          </span>
                        )}
                      </div>

                      {rev.note_text && (
                        <p className="text-xs text-gray-400 mt-2 line-clamp-1 italic">
                          "{rev.note_text}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenNote(rev.problem_slug)}
                        className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-gray-800 rounded-lg transition"
                        title="View / Edit Note"
                      >
                        <FileEdit className="w-4 h-4" />
                      </button>

                      <a
                        href={`https://leetcode.com/problems/${rev.problem_slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-gray-800 rounded-lg transition"
                        title="Open on LeetCode"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => handleDone(rev.id, true)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Solved</span>
                      </button>

                      <button
                        onClick={() => handleDone(rev.id, false)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1 transition"
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
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Upcoming Scheduled Reviews ({upcoming.length})</span>
            </h3>

            <div className="space-y-2">
              {upcoming.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-gray-800/30 border border-gray-800/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-200 font-medium">{item.title || item.problem_slug}</span>
                    {item.pattern_tag && (
                      <span className="text-[10px] text-gray-400">({item.pattern_tag})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-gray-500">
                    <span>Due: {item.due_date}</span>
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                      {item.interval_days}d
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Problem Note Editor */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-purple-400" />
                <span>Pattern Note Scratchpad</span>
              </h3>
            </div>

            {selectedSlug ? (
              <div className="space-y-4">
                <div className="text-xs">
                  <span className="text-gray-400">Target Problem: </span>
                  <span className="font-mono font-bold text-indigo-400">{selectedSlug}</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Algorithmic Pattern Tag (e.g. Monotonic Stack, Sliding Window, DP)
                  </label>
                  <input
                    type="text"
                    value={patternTag}
                    onChange={(e) => setPatternTag(e.target.value)}
                    placeholder="e.g. Dynamic Programming / Knapsack"
                    className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Key Insights, Pitfalls &amp; Edge Cases
                  </label>
                  <textarea
                    rows={8}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Write key memoization state transition, cycle detection trick, or optimal complexity notes..."
                    className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed resize-none"
                  />
                </div>

                <button
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingNote ? 'Saving...' : 'Save Problem Note'}</span>
                </button>

                {saveSuccess && (
                  <div className="text-xs text-emerald-400 text-center font-medium animate-fade-in">
                    ✓ Note and pattern tag saved successfully!
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 text-xs border border-dashed border-gray-800 rounded-xl">
                Click the edit note icon on any problem on the left to write or review personal pattern notes.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
