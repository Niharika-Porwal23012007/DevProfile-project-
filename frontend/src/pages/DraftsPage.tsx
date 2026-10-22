import React, { useEffect, useState } from 'react';
import {
  Linkedin,
  Copy,
  Check,
  Sparkles,
  ShieldAlert,
  FolderGit2,
  UserCheck,
  Calendar,
  Share2
} from 'lucide-react';
import { api } from '../api/client';

export const DraftsPage: React.FC = () => {
  const [draftType, setDraftType] = useState<'weekly' | 'project' | 'profile'>('weekly');
  const [generatedDraft, setGeneratedDraft] = useState<string>('');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isPosted, setIsPosted] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async (type: 'weekly' | 'project' | 'profile') => {
    try {
      setLoading(true);
      setDraftType(type);
      setCopied(false);
      const res = await api.generateDraft(type);
      setGeneratedDraft(res.text);
      setDraftId(res.id);
      setIsPosted(res.posted);
    } catch (err) {
      console.error('Failed to generate draft:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generate('weekly');
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleMarkPosted = async () => {
    if (!draftId) return;
    try {
      await api.markDraftPosted(draftId);
      setIsPosted(true);
    } catch (err) {
      console.error('Failed to mark posted:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Linkedin className="w-5 h-5 text-blue-400" />
          <span>LinkedIn Draft Generator &amp; Profile Optimizer (Section 3.4)</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Turn your verified weekly progress, project milestones, and DSA metrics into structured LinkedIn post drafts.
        </p>
      </div>

      {/* Anti-Fabrication Rule Banner */}
      <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs text-blue-300 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Section 3.4 Anti-Fabrication Guarantee:</span> Every post draft and profile bullet uses exclusively numbers that exist in your database. No exaggeration, no phantom metrics. DevProfile preserves authentic credibility.
        </div>
      </div>

      {/* Draft Type Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => generate('weekly')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            draftType === 'weekly'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Weekly Recap Post</span>
        </button>

        <button
          onClick={() => generate('project')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            draftType === 'project'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Project Milestone Post</span>
        </button>

        <button
          onClick={() => generate('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            draftType === 'profile'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Profile Checklist (About &amp; Skills)</span>
        </button>
      </div>

      {/* Draft Display Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="font-semibold text-xs text-gray-300">
              {draftType === 'weekly' ? 'Weekly Verified Progress Draft' : draftType === 'project' ? 'Project Release Milestone Draft' : 'Optimized Profile Copy'}
            </span>
            {isPosted && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Marked as Posted
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs font-semibold transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Draft'}</span>
            </button>

            {draftId && !isPosted && (
              <button
                onClick={handleMarkPosted}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition"
              >
                Mark as Posted
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="min-h-[220px] flex items-center justify-center text-gray-500 text-xs">
            <div className="animate-spin mr-2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span>Formulating draft from database records...</span>
          </div>
        ) : (
          <div className="bg-gray-950/80 p-5 rounded-xl border border-gray-800 font-sans text-xs leading-relaxed whitespace-pre-wrap text-gray-200 selection:bg-blue-600">
            {generatedDraft}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-[11px] text-gray-500">
          <span>Manual post model: Copy and paste into LinkedIn feed or profile editor. No automatic posting bot.</span>
          <a
            href="https://www.linkedin.com/feed/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Open LinkedIn</span>
            <Share2 className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
