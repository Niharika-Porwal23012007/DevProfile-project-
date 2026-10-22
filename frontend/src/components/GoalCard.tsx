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
      bar: 'bg-indigo-500',
      text: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20'
    },
    emerald: {
      bar: 'bg-emerald-500',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    amber: {
      bar: 'bg-amber-500',
      text: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20'
    }
  }[color];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col justify-between hover:border-gray-700 transition">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg border ${colorStyles.bg} ${colorStyles.text}`}>
          {icon}
        </div>
      </div>

      <div className="my-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold text-white">{current}</span>
          <span className="text-sm font-medium text-gray-400">/ {target} {unit}</span>
        </div>
      </div>

      <div>
        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorStyles.bar} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-gray-500 mt-1.5">
          <span>{pct}% completed</span>
          <span>{current >= target ? 'Target Met! 🎉' : `${target - current} ${unit} remaining`}</span>
        </div>
      </div>
    </div>
  );
};
