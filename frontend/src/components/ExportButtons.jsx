import React from 'react';
import { FiFileText, FiPrinter } from 'react-icons/fi';
import { downloadAsTxt, downloadAsPdf } from '../utils/exportUtils';

const ExportButtons = ({ summaryText, originalText, title = 'Summary', stats = null }) => {
  if (!summaryText) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => downloadAsTxt(title, summaryText, originalText)}
        className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all hover:scale-105"
        title="Download summary as TXT file"
      >
        <FiFileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        Download TXT
      </button>

      <button
        onClick={() => downloadAsPdf(title, summaryText, stats)}
        className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all hover:scale-105"
        title="Export summary report as PDF"
      >
        <FiPrinter className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        Export PDF
      </button>
    </div>
  );
};

export default ExportButtons;
