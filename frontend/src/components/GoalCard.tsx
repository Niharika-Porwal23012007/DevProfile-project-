import React from 'react';

interface GoalCardProps {
  title: string;
  current: number;
  target: number;
  unit: string;
  icon: React.ReactNode;
  color: 'indigo' | 'emerald' | 'amber';
}

export const GoalCard: React.FC<GoalCardProps> = ({
  title,
  current,
  target,
  unit,
  icon,
  color
}) => {
  const pct = Math.min(100, Math.round((current / (target || 1)) * 100));

  const colorStyles = {
    indigo: {
      bar: 'bg-indigo-600 dark:bg-indigo-500',
      text: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20'
    },
    emerald: {
      bar: 'bg-emerald-600 dark:bg-emerald-500',
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
    },
    amber: {
      bar: 'bg-amber-600 dark:bg-amber-500',
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
    }
  }[color];

  return (
    <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-gray-700 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl border ${colorStyles.bg} ${colorStyles.text}`}>
          {icon}
        </div>
      </div>

      <div className="my-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{current}</span>
          <span className="text-xs font-semibold text-slate-400 dark:text-gray-400">/ {target} {unit}</span>
        </div>
      </div>

      <div>
        <div className="w-full bg-slate-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorStyles.bar} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-gray-400 mt-2 font-medium">
          <span>{pct}% completed</span>
          <span className={current >= target ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
            {current >= target ? 'Target Met! 🎉' : `${target - current} ${unit} remaining`}
          </span>
        </div>
      </div>
    </div>
  );
};
