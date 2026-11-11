import React from 'react';

interface ConsistencyRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  leetcodePts?: number;
  githubPts?: number;
  codingPts?: number;
}

export const ConsistencyRing: React.FC<ConsistencyRingProps> = ({
  score,
  size = 140,
  strokeWidth = 10,
  leetcodePts = 0,
  githubPts = 0,
  codingPts = 0
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return '#10B981'; // Emerald
    if (s >= 50) return '#6366F1'; // Indigo
    if (s >= 30) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-slate-200 dark:stroke-gray-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor(score)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{Math.round(score)}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-400">Score</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 w-full text-center text-xs">
        <div className="bg-slate-50 dark:bg-gray-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-gray-700/50 shadow-sm">
          <div className="text-indigo-600 dark:text-indigo-400 font-extrabold">{leetcodePts} / 40</div>
          <div className="text-[10px] font-medium text-slate-500 dark:text-gray-400">LeetCode</div>
        </div>
        <div className="bg-slate-50 dark:bg-gray-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-gray-700/50 shadow-sm">
          <div className="text-emerald-600 dark:text-emerald-400 font-extrabold">{githubPts} / 30</div>
          <div className="text-[10px] font-medium text-slate-500 dark:text-gray-400">GitHub</div>
        </div>
        <div className="bg-slate-50 dark:bg-gray-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-gray-700/50 shadow-sm">
          <div className="text-amber-600 dark:text-amber-400 font-extrabold">{codingPts} / 30</div>
          <div className="text-[10px] font-medium text-slate-500 dark:text-gray-400">VS Code</div>
        </div>
      </div>
    </div>
  );
};
