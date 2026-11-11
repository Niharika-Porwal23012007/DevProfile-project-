import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Flame,
  ExternalLink,
  LogOut,
  CheckCircle,
  AlertCircle,
  Sun,
  Moon,
  Users,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { api } from '../api/client';
import { UserProfile } from '../types';
import { GitHubLogo, LeetCodeLogo, VSCodeLogo } from './BrandIcons';

interface NavbarProps {
  user: UserProfile | null;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onLogout: () => void;
  onSyncComplete?: () => void;
  onSwitchProfile?: (profile: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  theme,
  onToggleTheme,
  onLogout,
  onSyncComplete,
  onSwitchProfile
}) => {
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    api.getProfiles().then(res => setProfiles(res.profiles || [])).catch(() => {});
  }, [user]);

  const handleSync = async () => {
    try {
      setSyncing(true);
      setSyncError(null);
      setSyncMessage(null);
      const res = await api.syncNow();
      
      const ghStatus = res.results?.github?.success ? '✓ GitHub' : '';
      const lcStatus = res.results?.leetcode?.syncStatus === 'success' ? '✓ LeetCode' : '';
      const summary = [ghStatus, lcStatus].filter(Boolean).join(' & ');
      
      setSyncMessage(summary ? `Synced live: ${summary}` : 'Live sync completed');
      if (onSyncComplete) onSyncComplete();
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err: any) {
      setSyncError(err.message || 'Sync cooldown active');
      setTimeout(() => setSyncError(null), 4500);
    } finally {
      setSyncing(false);
    }
  };

  const handleSelectProfile = async (p: any) => {
    setShowProfileMenu(false);
    try {
      const res = await api.registerOrLogin({
        email: p.email,
        githubUsername: p.github_username,
        leetcodeUsername: p.leetcode_username
      });
      localStorage.setItem('devprofile_token', res.token);
      if (onSwitchProfile) onSwitchProfile(res.user);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-gray-800 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur sticky top-0 z-30 flex items-center justify-between px-6 transition-colors">
      {/* Brand Logo & College Badge */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-mono font-bold text-lg">
          DP
        </div>
        <div>
          <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            DevProfile
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              Pro
            </span>
          </span>
          <span className="text-xs text-slate-500 dark:text-gray-400 hidden sm:block">Unified Engineering Analytics &amp; Action Planner</span>
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-3">
        {syncMessage && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1.5 rounded-xl animate-fade-in font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{syncMessage}</span>
          </div>
        )}

        {syncError && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-1.5 rounded-xl font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{syncError}</span>
          </div>
        )}

        {/* Theme Toggle Button (Light / Dark) */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-700/60 transition shadow-sm"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* Sync Now Button */}
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-800 dark:text-gray-200 border border-slate-200 dark:border-gray-700 transition disabled:opacity-50 shadow-sm"
          title="Sync latest GitHub commits and LeetCode solves"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-500 ${syncing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{syncing ? 'Syncing...' : 'Sync Live'}</span>
        </button>

        {/* Public Portfolio Link */}
        {user && (
          <a
            href={`/portfolio/${user.publicSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-600/10 hover:bg-indigo-100 dark:hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 transition shadow-sm"
          >
            <span>Public Portfolio</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {/* Profile Switcher Dropdown & User Pill */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-800 transition"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white uppercase shadow-sm">
                {user.name.charAt(0)}
              </div>
              <div className="hidden lg:block text-left text-xs">
                <div className="font-bold text-slate-900 dark:text-gray-100">{user.name}</div>
                <div className="text-[10px] text-slate-500 dark:text-gray-400">@{user.githubUsername || user.leetcodeUsername || 'dev'}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
            </button>

            {/* Switch User Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in">
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 border-b border-slate-100 dark:border-gray-800">
                  Switch Active Developer ID
                </div>
                <div className="max-h-56 overflow-y-auto py-1 space-y-1">
                  {profiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProfile(p)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition ${
                        p.id === user.id
                          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-gray-800/80 text-slate-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-semibold truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-400 dark:text-gray-500 truncate">@{p.github_username || p.leetcode_username || 'dev'}</div>
                      </div>
                      {p.id === user.id && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-gray-800">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out or Add New ID</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
