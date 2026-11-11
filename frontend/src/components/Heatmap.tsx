import React, { useState } from 'react';

interface HeatmapCell {
  date: string;
  commits: number;
  solves: number;
  codingMinutes: number;
  score: number;
  intensity: number;
}

interface HeatmapProps {
  data: HeatmapCell[];
}

export const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  const [hovered, setHovered] = useState<HeatmapCell | null>(null);

  const getCellColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500 hover:bg-emerald-400 shadow-sm';
    if (score >= 55) return 'bg-emerald-600/80 hover:bg-emerald-500';
    if (score >= 30) return 'bg-emerald-700/60 dark:bg-emerald-800/80 hover:bg-emerald-600';
    if (score > 0) return 'bg-emerald-200 dark:bg-emerald-950 hover:bg-emerald-300 dark:hover:bg-emerald-900';
    return 'bg-slate-200 dark:bg-gray-800/60 hover:bg-slate-300 dark:hover:bg-gray-700';
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-1">
        {data.map((day, idx) => (
          <div
            key={day.date || idx}
            onMouseEnter={() => setHovered(day)}
            onMouseLeave={() => setHovered(null)}
            className={`w-4 h-4 rounded-[4px] transition-all duration-150 cursor-pointer ${getCellColor(day.score)}`}
          />
        ))}
      </div>

      {hovered && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-xs px-3.5 py-2 rounded-xl shadow-2xl pointer-events-none z-20 whitespace-nowrap">
          <div className="font-extrabold text-slate-900 dark:text-gray-100">{hovered.date} (Score: {Math.round(hovered.score)}/100)</div>
          <div className="text-slate-500 dark:text-gray-400 text-[11px] flex items-center gap-3 mt-0.5">
            <span>🔥 {hovered.solves} solves</span>
            <span>📦 {hovered.commits} commits</span>
            <span>⏱ {hovered.codingMinutes}m coding</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-gray-400 mt-3 pt-2 border-t border-slate-200 dark:border-gray-800">
        <span className="font-medium">30-Day Activity Window</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <span className="w-3 h-3 rounded-[3px] bg-slate-200 dark:bg-gray-800" />
          <span className="w-3 h-3 rounded-[3px] bg-emerald-200 dark:bg-emerald-950" />
          <span className="w-3 h-3 rounded-[3px] bg-emerald-400/60 dark:bg-emerald-800" />
          <span className="w-3 h-3 rounded-[3px] bg-emerald-500 dark:bg-emerald-600" />
          <span className="w-3 h-3 rounded-[3px] bg-emerald-600 dark:bg-emerald-500" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
