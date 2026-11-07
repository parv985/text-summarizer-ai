import React, { useState } from 'react';
import { FiLayers, FiZap, FiCheckCircle, FiCpu, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { summarizeText, summarizeExtractive } from '../services/api';

const SAMPLE_COMPARISON_TEXT = `Global climate change represents one of the most critical challenges facing human civilization in the 21st century. Rising global mean temperatures, fueled by rising greenhouse gas emissions from industrial operations and deforestation, have triggered extreme weather patterns across continents. Glaciers are melting at an accelerated velocity, leading to sea level rises that threaten coastal infrastructure and communities. According to reports by the Intergovernmental Panel on Climate Change (IPCC), urgent international policy shifts toward renewable energy sources—such as solar, wind, and hydroelectric power—are necessary to prevent irreversible ecological damage. Transitioning to zero-carbon economies requires substantial financial investment and technological innovation across clean energy sectors.`;

const Comparison = () => {
  const [text, setText] = useState(SAMPLE_COMPARISON_TEXT);
  const [loading, setLoading] = useState(false);
  const [abstractiveResult, setAbstractiveResult] = useState(null);
  const [extractiveResult, setExtractiveResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCompare = async () => {
    if (!text || text.trim().length < 10) {
      setError('Please provide at least a few sentences for comparison.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const [absRes, extRes] = await Promise.all([
        summarizeText({ text, length_preset: 'medium', max_length: 150 }),
        summarizeExtractive({ text, sentence_count: 3 }),
      ]);

      setAbstractiveResult(absRes);
      setExtractiveResult(extRes);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.detail || err.message || 'Comparison failed';
      setError(msg);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header Banner */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <FiLayers className="text-indigo-600 dark:text-indigo-400" /> Extractive vs Abstractive AI Comparison Lab
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-3xl">
          Evaluate side-by-side performance of graph-based sentence extraction (<span className="text-brand-600 dark:text-brand-400 font-semibold">TextRank</span>) against neural sequence-to-sequence generation (<span className="text-indigo-600 dark:text-indigo-400 font-semibold">BART Large CNN</span>).
        </p>
      </div>

      {/* Input Text Box */}
      <div className="glass-panel p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="font-semibold text-slate-800 dark:text-slate-300">Original Text Source</span>
          <span className="font-mono">{text.split(/\s+/).filter(Boolean).length} words</span>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="w-full bg-transparent border-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm leading-relaxed font-sans"
        />

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleCompare}
          disabled={loading || !text.trim()}
          className="gradient-btn px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              <span>Executing Dual NLP Engines...</span>
            </>
          ) : (
            <>
              <FiZap className="w-4 h-4" />
              <span>Compare Extractive vs Abstractive</span>
            </>
          )}
        </button>
      </div>

      {/* COMPARISON GRID */}
      {(abstractiveResult || extractiveResult) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* EXTRACTIVE COLUMN */}
          <div className="glass-panel p-6 space-y-4 border-purple-500/30">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                  <FiLayers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Extractive Summarization</h3>
                  <p className="text-[11px] text-purple-600 dark:text-purple-400 font-mono">Algorithm: Sumy TextRank</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 text-xs font-mono text-slate-600 dark:text-slate-400">
                {extractiveResult?.summary_word_count || 0} words
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-900 text-slate-900 dark:text-slate-200 text-sm leading-relaxed min-h-[140px]">
              {extractiveResult?.summary}
            </div>

            {/* Pros & Cons */}
            <div className="glass-card space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 dark:text-slate-300">Method Characteristics:</h4>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <FiCheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>100% factual fidelity (copies exact sentences)</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <FiCheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Extremely fast computation (graph matrix rank)</span>
                </li>
                <li className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <FiCheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>May retain wordy or non-concise phrasing</span>
                </li>
              </ul>
            </div>
          </div>

          {/* ABSTRACTIVE COLUMN */}
          <div className="glass-panel p-6 space-y-4 border-brand-500/30">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                  <FiCpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Abstractive Summarization</h3>
                  <p className="text-[11px] text-brand-600 dark:text-brand-400 font-mono">Model: facebook/bart-large-cnn</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 text-xs font-mono text-slate-600 dark:text-slate-400">
                {abstractiveResult?.summary_word_count || 0} words
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-900 text-slate-900 dark:text-slate-200 text-sm leading-relaxed min-h-[140px]">
              {abstractiveResult?.summary}
            </div>

            {/* Pros & Cons */}
            <div className="glass-card space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 dark:text-slate-300">Method Characteristics:</h4>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <FiCheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Generates fluent, human-sounding rephrasing</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <FiCheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Synthesizes complex ideas into tight paragraphs</span>
                </li>
                <li className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <FiCheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Uses Seq2Seq attention over 1024 token window</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comparison;
