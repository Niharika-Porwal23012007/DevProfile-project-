import React, { useState } from 'react';
import { RefreshCw, Flame, ExternalLink, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  onLogout: () => void;
  onSyncComplete?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onSyncComplete }) => {
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const handleSync = async () => {
    try {
      setSyncing(true);
      setSyncError(null);
      setSyncMessage(null);
      const res = await api.syncNow();
      setSyncMessage('Synced successfully!');
      if (onSyncComplete) onSyncComplete();
      setTimeout(() => setSyncMessage(null), 3500);
    } catch (err: any) {
      setSyncError(err.message || 'Sync failed');
      setTimeout(() => setSyncError(null), 4500);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header className="h-16 border-b border-gray-800 bg-[#0B0F19]/90 backdrop-blur sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 font-mono font-bold text-white text-lg">
          DP
        </div>
        <div>
          <span className="font-bold text-base tracking-tight text-white flex items-center gap-2">
            DevProfile
            <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Medi-Caps
            </span>
          </span>
          <span className="text-xs text-gray-500 hidden sm:block">Unified Engineering Activity & AI Planner</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {syncMessage && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg animate-fade-in">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{syncMessage}</span>
          </div>
        )}

        {syncError && (
          <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{syncError}</span>
          </div>
        )}

        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition disabled:opacity-50"
          title="Manual sync with GitHub and LeetCode (cooldown: 2 mins)"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${syncing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{syncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>

        {user && (
          <a
            href={`/portfolio/${user.publicSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 transition"
          >
            <span>Public Portfolio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-gray-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-gray-200">{user.name}</div>
              <div className="text-[10px] text-gray-500">@{user.githubUsername || 'student'}</div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
