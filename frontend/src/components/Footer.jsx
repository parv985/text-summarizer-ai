import React from 'react';
import { FiCpu } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 text-slate-600 dark:text-slate-400 py-10 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-brand-600 text-white">
                <FiCpu className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-slate-900 dark:text-white">Summora<span className="text-brand-500">.ai</span></span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              Production-quality NLP & Deep Learning platform for Abstractive (BART), Extractive (TextRank), KeyBERT keyword extraction, and spaCy Named Entity Recognition.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
              <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">PyTorch</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">BART Large CNN</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">TextRank</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">spaCy</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">KeyBERT</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">FastAPI</span>
            </div>
          </div>

          {/* AI Engine Capabilities */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-200 text-sm mb-3">AI Engine Capabilities</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">BART Abstractive Model</span></li>
              <li><span className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">TextRank Extractive Graph</span></li>
              <li><span className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">PyMuPDF Document Extraction</span></li>
              <li><span className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">ROUGE Metric Evaluation</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Summora AI. Complete NLP Transformer Platform.</p>
          <div className="flex items-center gap-1">
            <span>Built with Transformer AI & Deep Learning</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
