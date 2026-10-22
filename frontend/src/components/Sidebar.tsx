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

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  reviewCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, reviewCount = 0 }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'insights', label: 'Insights & Gaps', icon: TrendingUp },
    { id: 'planner', label: 'AI Daily Plan', icon: Sparkles, badge: 'AI' },
    { id: 'reviews', label: 'Spaced Reviews', icon: Brain, count: reviewCount },
    { id: 'drafts', label: 'LinkedIn Drafts', icon: Share2 },
    { id: 'onboarding', label: 'Extension Setup', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <aside className="w-64 border-r border-gray-800 bg-[#0B0F19] p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
          Core Workflows
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {item.badge}
                </span>
              )}

              {typeof item.count === 'number' && item.count > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {item.count} due
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-3.5 rounded-xl bg-gradient-to-b from-gray-900 to-gray-900/60 border border-gray-800 text-xs">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
          <CalendarCheck2 className="w-4 h-4" />
          <span>Academic Project</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Medi-Caps University • Major Project 2026. Guided by Prof. Shraddha Kumar.
        </p>
      </div>
    </aside>
  );
};
