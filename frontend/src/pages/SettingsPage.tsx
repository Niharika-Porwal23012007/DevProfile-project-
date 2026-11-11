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
  AlertTriangle,
  Sun,
  Moon,
  Palette
} from 'lucide-react';
import { api } from '../api/client';
import { UserProfile, ConnectedSources } from '../types';
import { GitHubIcon, LeetCodeIcon } from '../components/BrandIcons';

interface SettingsPageProps {
  user: UserProfile;
  connectedSources: ConnectedSources;
  onUserUpdated: () => void;
  onLogout: () => void;
  theme?: 'dark' | 'light';
  onSetTheme?: (theme: 'dark' | 'light') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  connectedSources,
  onUserUpdated,
  onLogout,
  theme = 'dark',
  onSetTheme
}) => {
  const [isPublic, setIsPublic] = useState(user.isPublic);
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  // Live profile linking state
  const [githubInput, setGithubInput] = useState(user.githubUsername || '');
  const [leetcodeInput, setLeetcodeInput] = useState(user.leetcodeUsername || '');
  const [linkingGithub, setLinkingGithub] = useState(false);
  const [linkingLeetcode, setLinkingLeetcode] = useState(false);
  const [linkNotice, setLinkNotice] = useState<string | null>(null);

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

  const handleConnectGitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubInput.trim()) return;
    try {
      setLinkingGithub(true);
      setLinkNotice(null);
      await api.connectGitHub(githubInput.trim());
      setLinkNotice(`Connected & synced GitHub handle @${githubInput.trim()}!`);
      onUserUpdated();
      setTimeout(() => setLinkNotice(null), 4000);
    } catch (err: any) {
      setLinkNotice(`Error connecting GitHub: ${err.message}`);
    } finally {
      setLinkingGithub(false);
    }
  };

  const handleConnectLeetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leetcodeInput.trim()) return;
    try {
      setLinkingLeetcode(true);
      setLinkNotice(null);
      await api.connectLeetCode(leetcodeInput.trim());
      setLinkNotice(`Connected & synced LeetCode handle @${leetcodeInput.trim()}!`);
      onUserUpdated();
      setTimeout(() => setLinkNotice(null), 4000);
    } catch (err: any) {
      setLinkNotice(`Error connecting LeetCode: ${err.message}`);
    } finally {
      setLinkingLeetcode(false);
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
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-500" />
          <span>Account Settings &amp; Data Rights</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
          Manage platform links, privacy settings, daily goals, data export, and extension credentials.
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme & Visual Preferences */}
        <div className="app-card bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-500" />
                <span>Theme &amp; Visual Preferences</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                Customize your appearance mode. Preferences are saved automatically to your browser.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
              Active: {theme === 'dark' ? 'Dark Obsidian' : 'Clean Slate Light'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Light Mode Selector Card */}
            <button
              type="button"
              onClick={() => onSetTheme && onSetTheme('light')}
              className={`p-4 rounded-xl border text-left transition flex items-start gap-4 ${
                theme === 'light'
                  ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-slate-50 dark:bg-gray-800/40 border-slate-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                <Sun className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Light Theme</span>
                  {theme === 'light' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">Active</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1">
                  Crisp #F8FAFC canvas, high-contrast dark slate text, subtle borders, and soft shadows.
                </p>
              </div>
            </button>

            {/* Dark Mode Selector Card */}
            <button
              type="button"
              onClick={() => onSetTheme && onSetTheme('dark')}
              className={`p-4 rounded-xl border text-left transition flex items-start gap-4 ${
                theme === 'dark'
                  ? 'bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-slate-50 dark:bg-gray-800/40 border-slate-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-800/50 shadow-xs">
                <Moon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Dark Theme</span>
                  {theme === 'dark' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">Active</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1">
                  Midnight #0B0F19 obsidian, glowing indicators, reduced eye strain during late-night coding.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Connected Sources Status & Live Linking */}
        <div className="app-card bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Connected Live Integrations</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                Connect your real handles to sync live public metrics, commits, and DSA problem solves.
              </p>
            </div>
            {linkNotice && (
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                linkNotice.startsWith('Error') 
                  ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200'
                  : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200'
              }`}>
                {linkNotice}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* GitHub Card with Live Connect Input */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200/70 dark:bg-gray-800 flex items-center justify-center text-slate-800 dark:text-white">
                    <GitHubIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">GitHub Profile</span>
                    <span className="text-[11px] text-slate-500 dark:text-gray-400 font-mono">
                      {connectedSources.github.connected ? `@${connectedSources.github.username}` : 'Not connected'}
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                  connectedSources.github.connected ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-slate-200 dark:bg-gray-800 text-slate-500 dark:text-gray-400'
                }`}>
                  {connectedSources.github.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              <form onSubmit={handleConnectGitHub} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={githubInput}
                  onChange={(e) => setGithubInput(e.target.value)}
                  placeholder="e.g. torvalds"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={linkingGithub}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-gray-700 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {linkingGithub ? 'Connecting...' : connectedSources.github.connected ? 'Update' : 'Connect'}
                </button>
              </form>
            </div>

            {/* LeetCode Card with Live Connect Input */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200/70 dark:bg-gray-800 flex items-center justify-center">
                    <LeetCodeIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">LeetCode Profile</span>
                    <span className="text-[11px] text-slate-500 dark:text-gray-400 font-mono">
                      {connectedSources.leetcode.connected ? `@${connectedSources.leetcode.username}` : 'Not connected'}
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                  connectedSources.leetcode.connected ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-slate-200 dark:bg-gray-800 text-slate-500 dark:text-gray-400'
                }`}>
                  {connectedSources.leetcode.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              <form onSubmit={handleConnectLeetCode} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={leetcodeInput}
                  onChange={(e) => setLeetcodeInput(e.target.value)}
                  placeholder="e.g. neetcode"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={linkingLeetcode}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {linkingLeetcode ? 'Connecting...' : connectedSources.leetcode.connected ? 'Update' : 'Connect'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Daily Goals Configuration */}
        <div className="app-card bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Target Goals (Daily Score Basis)</h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mb-4">Used by the consistency score and goal progress rings.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-gray-400 block mb-1">LeetCode Solves / Day</label>
              <input
                type="number"
                min="1"
                max="20"
                value={dailyLc}
                onChange={(e) => setDailyLc(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-gray-400 block mb-1">GitHub Commits / Day</label>
              <input
                type="number"
                min="1"
                max="30"
                value={dailyCommits}
                onChange={(e) => setDailyCommits(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-gray-400 block mb-1">Coding Minutes / Day</label>
              <input
                type="number"
                min="15"
                max="600"
                step="15"
                value={dailyCodingMin}
                onChange={(e) => setDailyCodingMin(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveGoals}
              disabled={savingGoals}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingGoals ? 'Saving...' : 'Save Goals'}</span>
            </button>
            {goalSuccess && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">✓ Targets updated successfully!</span>
            )}
          </div>
        </div>

        {/* Privacy & Public Portfolio Toggle */}
        <div className="app-card bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-500" />
                <span>Public Portfolio Visibility</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                When enabled, your public slug (<code className="text-indigo-600 dark:text-indigo-300 font-mono font-semibold">/portfolio/{user.publicSlug}</code>) can be shared with recruiters.
              </p>
            </div>

            <button
              onClick={handleTogglePrivacy}
              disabled={savingPrivacy}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition shadow-xs ${
                isPublic ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-400 hover:bg-slate-300 dark:hover:bg-gray-700'
              }`}
            >
              {isPublic ? 'Publicly Visible' : 'Private'}
            </button>
          </div>
        </div>

        {/* VS Code Extension Key Regeneration */}
        <div className="app-card bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-500" />
            <span>Extension Key Management</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mb-4">
            If you lose your key or need to revoke it from another machine, regenerate it below.
          </p>

          {newKey ? (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-gray-950 border border-amber-300 dark:border-amber-500/30 flex items-center justify-between font-mono text-xs text-amber-800 dark:text-amber-300">
              <span>{newKey}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(newKey);
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }}
                className="flex items-center gap-1 text-xs text-amber-700 dark:text-gray-400 hover:text-amber-900 dark:hover:text-white"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleRegenerateKey}
              disabled={regenerating}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-800 dark:text-white text-xs font-semibold border border-slate-200 dark:border-gray-700 transition"
            >
              {regenerating ? 'Regenerating...' : 'Regenerate API Key'}
            </button>
          )}
        </div>

        {/* Data Export & Account Deletion */}
        <div className="app-card bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">User Rights &amp; Data Minimization</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400">Download everything we have on file or delete your records permanently.</p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="/api/export"
              target="_blank"
              download
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-800 dark:text-white text-xs font-semibold border border-slate-200 dark:border-gray-700 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span>Export All Data (JSON)</span>
            </a>

            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account &amp; Data</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition shadow-sm"
                >
                  {deleting ? 'Deleting...' : 'Confirm Permanent Deletion'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-xs"
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
