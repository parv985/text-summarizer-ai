import React, { useState } from 'react';
import { FiUser, FiGlobe, FiBriefcase, FiCalendar, FiDollarSign, FiTag } from 'react-icons/fi';

const LABEL_STYLES = {
  PERSON: { bg: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30', icon: FiUser, label: 'Person' },
  ORG: { bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', icon: FiBriefcase, label: 'Organization' },
  GPE: { bg: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30', icon: FiGlobe, label: 'Location/Geopolitical' },
  LOC: { bg: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30', icon: FiGlobe, label: 'Location' },
  DATE: { bg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30', icon: FiCalendar, label: 'Date' },
  MONEY: { bg: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30', icon: FiDollarSign, label: 'Money' },
  EVENT: { bg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30', icon: FiTag, label: 'Event' },
  WORK_OF_ART: { bg: 'bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/30', icon: FiTag, label: 'Work of Art' },
};

const DEFAULT_STYLE = { bg: 'bg-slate-200 dark:bg-slate-700/40 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600', icon: FiTag, label: 'Entity' };

const EntityHighlighter = ({ entities, entityCounts }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (!entities || entities.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs italic">
        No named entities detected in input text.
      </div>
    );
  }

  const filteredEntities = selectedCategory
    ? entities.filter((e) => e.label === selectedCategory)
    : entities;

  return (
    <div className="space-y-4 my-4">
      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">Filter NER:</span>
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
            selectedCategory === null
              ? 'bg-brand-600 text-white border-brand-500 shadow-md'
              : 'bg-slate-100 text-slate-600 border-slate-300 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:text-white'
          }`}
        >
          All ({entities.length})
        </button>

        {Object.entries(entityCounts || {}).map(([label, count]) => {
          const style = LABEL_STYLES[label] || DEFAULT_STYLE;
          const isSelected = selectedCategory === label;
          return (
            <button
              key={label}
              onClick={() => setSelectedCategory(isSelected ? null : label)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-brand-600 text-white border-brand-500 shadow-md'
                  : `${style.bg} hover:brightness-110`
              }`}
            >
              <span>{style.label}</span>
              <span className="opacity-75 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Entity Tag Badges Grid */}
      <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 max-h-60 overflow-y-auto">
        {filteredEntities.map((ent, idx) => {
          const style = LABEL_STYLES[ent.label] || DEFAULT_STYLE;
          const Icon = style.icon;
          return (
            <div
              key={idx}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 ${style.bg} transition-all hover:scale-105`}
              title={`${ent.label}: ${ent.explanation}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
              <span className="font-semibold text-slate-900 dark:text-slate-100">{ent.text}</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-200 dark:bg-black/30 opacity-80">
                {ent.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EntityHighlighter;
