import React from 'react';
import { FiAward } from 'react-icons/fi';

const RougeProgress = ({ rougeScores }) => {
  if (!rougeScores) return null;

  const metrics = [
    {
      name: 'ROUGE-1',
      desc: 'Unigram Overlapping Accuracy',
      score: rougeScores.rouge1 || 0,
      color: 'from-blue-500 to-indigo-500',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      name: 'ROUGE-2',
      desc: 'Bigram Fluency & Coherence',
      score: rougeScores.rouge2 || 0,
      color: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      name: 'ROUGE-L',
      desc: 'Longest Common Subsequence',
      score: rougeScores.rougeL || 0,
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
  ];

  return (
    <div className="glass-card my-4">
      <div className="flex items-center gap-2 mb-4">
        <FiAward className="w-5 h-5 text-amber-500 dark:text-amber-400" />
        <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">ROUGE Evaluation Metrics</h4>
      </div>

      <div className="space-y-4">
        {metrics.map((m) => {
          const percent = Math.min(100, Math.round(m.score * 100));
          return (
            <div key={m.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className={`font-mono font-bold ${m.textColor}`}>{m.name}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">({m.desc})</span>
                </div>
                <span className="text-slate-800 dark:text-slate-200 font-mono font-bold">{m.score.toFixed(3)} ({percent}%)</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-300 dark:border-slate-800">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${m.color} transition-all duration-700 ease-out`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RougeProgress;
