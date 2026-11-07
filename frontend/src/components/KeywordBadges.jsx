import React, { useState } from 'react';
import { FiKey, FiCopy, FiCheck } from 'react-icons/fi';

const KeywordBadges = ({ keywords }) => {
  const [copiedKw, setCopiedKw] = useState(null);

  if (!keywords || keywords.length === 0) return null;

  const handleCopy = (word) => {
    navigator.clipboard.writeText(word);
    setCopiedKw(word);
    setTimeout(() => setCopiedKw(null), 2000);
  };

  return (
    <div className="glass-card my-4">
      <div className="flex items-center gap-2 mb-3">
        <FiKey className="w-4 h-4 text-brand-600 dark:text-brand-400" />
        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">KeyBERT Extracted Keyphrases</h4>
      </div>

      <div className="flex flex-wrap gap-2">
        {keywords.map((item, idx) => {
          const isCopied = copiedKw === item.keyword;
          return (
            <button
              key={idx}
              onClick={() => handleCopy(item.keyword)}
              className="group px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700/80 hover:border-brand-500/50 text-slate-800 dark:text-slate-200 text-xs font-medium flex items-center gap-2 transition-all hover:scale-105"
              title="Click to copy keyword"
            >
              <span className="font-semibold text-brand-600 dark:text-brand-300">{item.keyword}</span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-900/60 px-1.5 py-0.5 rounded">
                {(item.score * 100).toFixed(0)}%
              </span>
              {isCopied ? (
                <FiCheck className="w-3 h-3 text-emerald-500" />
              ) : (
                <FiCopy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default KeywordBadges;
