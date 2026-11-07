import React from 'react';
import { FiAlignLeft, FiHash, FiClock, FiPercent } from 'react-icons/fi';

const TextStatsCard = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      label: 'Original Words',
      value: stats.original_word_count || stats.word_count_original || 0,
      icon: FiAlignLeft,
      color: 'from-blue-500/10 to-blue-600/5 border-blue-500/30 text-blue-600 dark:text-blue-400 dark:from-blue-500/20 dark:to-blue-600/10',
    },
    {
      label: 'Summary Words',
      value: stats.summary_word_count || stats.word_count_summary || 0,
      icon: FiHash,
      color: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 dark:from-emerald-500/20 dark:to-emerald-600/10',
    },
    {
      label: 'Compression Ratio',
      value: stats.compression_ratio_percent ? `${stats.compression_ratio_percent}%` : (stats.compression_ratio || 'N/A'),
      icon: FiPercent,
      color: 'from-purple-500/10 to-purple-600/5 border-purple-500/30 text-purple-600 dark:text-purple-400 dark:from-purple-500/20 dark:to-purple-600/10',
    },
    {
      label: 'Reading Time Saved',
      value: stats.reading_time_saved_percent ? `${stats.reading_time_saved_percent}%` : (stats.reading_time_reduction || '0 min'),
      icon: FiClock,
      color: 'from-amber-500/10 to-amber-600/5 border-amber-500/30 text-amber-600 dark:text-amber-400 dark:from-amber-500/20 dark:to-amber-600/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4">
      {cards.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className={`p-4 rounded-xl border bg-gradient-to-br ${item.color} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                {item.label}
              </span>
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {item.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TextStatsCard;
