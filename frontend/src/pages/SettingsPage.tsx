import React, { useState } from 'react';
import {
  Sliders,
  Shield,
  Download,
  Trash2,
  Key,
  Check,
  Copy,
  Save,
  Globe,
  AlertTriangle
} from 'lucide-react';
import { api } from '../api/client';
import { UserProfile, ConnectedSources } from '../types';

interface SettingsPageProps {
  user: UserProfile;
  connectedSources: ConnectedSources;
  onUserUpdated: () => void;
  onLogout: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  connectedSources,
  onUserUpdated,
  onLogout
}) => {
  const [isPublic, setIsPublic] = useState(user.isPublic);
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  // Goals state
  const [dailyLc, setDailyLc] = useState(2);
  const [dailyCommits, setDailyCommits] = useState(3);
  const [dailyCodingMin, setDailyCodingMin] = useState(60);
  const [savingGoals, setSavingGoals] = useState(false);
  const [goalSuccess, setGoalSuccess] = useState(false);

  // API key regeneration
  const [newKey, setNewKey] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Delete account confirmation
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleTogglePrivacy = async () => {
    try {
      setSavingPrivacy(true);
      const res = await api.updatePrivacy(!isPublic);
      setIsPublic(res.isPublic);
      onUserUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPrivacy(false);
    }
  };

  const handleSaveGoals = async () => {
    try {
      setSavingGoals(true);
      await api.updateGoal('daily_leetcode', dailyLc, 'daily');
      await api.updateGoal('daily_commits', dailyCommits, 'daily');
      await api.updateGoal('daily_coding_min', dailyCodingMin, 'daily');
      setGoalSuccess(true);
      setTimeout(() => setGoalSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingGoals(false);
    }
  };

  const handleRegenerateKey = async () => {
    if (!window.confirm('Regenerating your key will invalidate existing VS Code extensions using the previous key. Continue?')) {
      return;
    }
    try {
      setRegenerating(true);
      const res = await api.regenerateApiKey();
      setNewKey(res.apiKey);
    } catch (err) {
      console.error(err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      await api.deleteAccount();
      localStorage.removeItem('devprofile_token');
      onLogout();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <span>Account Settings &amp; Data Rights (Section 8 &amp; 9)</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Manage platform links, privacy settings, daily goals, data export, and extension credentials.
        </p>
      </div>

      <div className="space-y-6">
        {/* Connected Sources Status */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="font-bold text-sm text-white mb-4">Connected Integrations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-white block">GitHub</span>
                <span className="text-[11px] text-gray-400">
                  {connectedSources.github.connected ? `@${connectedSources.github.username}` : 'Not connected'}
                </span>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                connectedSources.github.connected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-800 text-gray-500'
              }`}>
                {connectedSources.github.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-white block">LeetCode</span>
                <span className="text-[11px] text-gray-400">
                  {connectedSources.leetcode.connected ? `@${connectedSources.leetcode.username}` : 'Not connected'}
                </span>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                connectedSources.leetcode.connected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-800 text-gray-500'
              }`}>
                {connectedSources.leetcode.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Daily Goals Configuration */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="font-bold text-sm text-white mb-1">Target Goals (Daily Score Basis)</h3>
          <p className="text-xs text-gray-400 mb-4">Used by the consistency score and goal progress rings.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-[11px] font-semibold text-gray-400 block mb-1">LeetCode Solves / Day</label>
              <input
                type="number"
                min="1"
                max="20"
                value={dailyLc}
                onChange={(e) => setDailyLc(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-400 block mb-1">GitHub Commits / Day</label>
              <input
                type="number"
                min="1"
                max="30"
                value={dailyCommits}
                onChange={(e) => setDailyCommits(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-400 block mb-1">Coding Minutes / Day</label>
              <input
                type="number"
                min="15"
                max="600"
                step="15"
                value={dailyCodingMin}
                onChange={(e) => setDailyCodingMin(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveGoals}
              disabled={savingGoals}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingGoals ? 'Saving...' : 'Save Goals'}</span>
            </button>
            {goalSuccess && (
              <span className="text-xs text-emerald-400 font-medium">✓ Targets updated!</span>
            )}
          </div>
        </div>

        {/* Privacy & Public Portfolio Toggle */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <span>Public Portfolio Visibility</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                When enabled, your public slug (<code className="text-indigo-300 font-mono">/portfolio/{user.publicSlug}</code>) can be shared with recruiters.
              </p>
            </div>

            <button
              onClick={handleTogglePrivacy}
              disabled={savingPrivacy}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                isPublic ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {isPublic ? 'Publicly Visible' : 'Private'}
            </button>
          </div>
        </div>

        {/* VS Code Extension Key Regeneration */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <span>Extension Key Management</span>
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            If you lose your key or need to revoke it from another machine, regenerate it below.
          </p>

          {newKey ? (
            <div className="p-3.5 rounded-xl bg-gray-950 border border-amber-500/30 flex items-center justify-between font-mono text-xs text-amber-300">
              <span>{newKey}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(newKey);
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleRegenerateKey}
              disabled={regenerating}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold border border-gray-700 transition"
            >
              {regenerating ? 'Regenerating...' : 'Regenerate API Key'}
            </button>
          )}
        </div>

        {/* Data Export & Account Deletion (Section 9) */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="font-bold text-sm text-white mb-1">User Rights &amp; Data Minimization</h3>
            <p className="text-xs text-gray-400">Download everything we have on file or delete your records permanently.</p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="/api/export"
              target="_blank"
              download
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold border border-gray-700 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export All Data (JSON)</span>
            </a>

            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-900/50 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account &amp; Data</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition"
                >
                  {deleting ? 'Deleting...' : 'Confirm Permanent Deletion'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-2 rounded-xl bg-gray-800 text-gray-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
