import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  CalendarCheck2,
  Brain,
  Share2,
  Sliders,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { GitHubLogo, LeetCodeLogo, VSCodeLogo } from './BrandIcons';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  reviewCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, reviewCount = 0 }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-indigo-500' },
    { id: 'insights', label: 'Insights & Gaps', icon: TrendingUp, color: 'text-emerald-500' },
    { id: 'planner', label: 'AI Daily Plan', icon: Sparkles, color: 'text-purple-500', badge: 'AI' },
    { id: 'reviews', label: 'Spaced Reviews', icon: Brain, color: 'text-amber-500', count: reviewCount },
    { id: 'drafts', label: 'LinkedIn Drafts', icon: Share2, color: 'text-blue-500' },
    { id: 'onboarding', label: 'Extension Setup', icon: BookOpen, color: 'text-pink-500' },
    { id: 'settings', label: 'Settings', icon: Sliders, color: 'text-slate-400' },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-gray-800 bg-slate-50/50 dark:bg-[#0B0F19] p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)] transition-colors">
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-gray-500">
          Analytics &amp; Planning
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-indigo-500/25'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100 hover:bg-slate-200/60 dark:hover:bg-gray-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                  {item.badge}
                </span>
              )}

              {typeof item.count === 'number' && item.count > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {item.count} due
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Connected Platforms Bar & Platform Status Footer */}
      <div className="space-y-3">
        <div className="p-3 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-2">
            Active Integrations
          </div>
          <div className="flex items-center justify-around text-xs">
            <span title="GitHub Integrated" className="p-1.5 rounded-lg bg-slate-100 dark:bg-gray-800 text-slate-800 dark:text-white">
              <GitHubLogo className="w-4 h-4" />
            </span>
            <span title="LeetCode Integrated" className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500">
              <LeetCodeLogo className="w-4 h-4" />
            </span>
            <span title="VS Code Integrated" className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-500">
              <VSCodeLogo className="w-4 h-4" />
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-indigo-50/50 to-purple-50/30 dark:from-gray-900 dark:to-gray-900/60 border border-indigo-100 dark:border-gray-800 text-xs shadow-sm">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-1">
            <CalendarCheck2 className="w-4 h-4" />
            <span>DevProfile Cloud</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-relaxed">
            Real-time developer telemetry, spaced repetition &amp; automated portfolio.
          </p>
        </div>
      </div>
    </aside>
  );
};
