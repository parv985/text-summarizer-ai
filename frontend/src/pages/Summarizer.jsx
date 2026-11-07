import React, { useState } from 'react';
import { 
  FiFileText, FiUploadCloud, FiSliders, FiCpu, 
  FiZap, FiTrash2, FiCopy, FiCheck, FiLoader, FiAlertCircle, FiTag
} from 'react-icons/fi';
import FileUpload from '../components/FileUpload';
import TextStatsCard from '../components/TextStatsCard';
import RougeProgress from '../components/RougeProgress';
import EntityHighlighter from '../components/EntityHighlighter';
import KeywordBadges from '../components/KeywordBadges';
import ExportButtons from '../components/ExportButtons';
import DocumentChat from '../components/DocumentChat';
import { summarizeText, summarizeExtractive, extractKeywords, detectEntities, evaluateSummary } from '../services/api';

const SAMPLE_TEXT = `Artificial Intelligence (AI) has experienced unprecedented growth in recent years, reshaping technology, industry, and daily life. At the forefront of this evolution are Transformer models, such as BART (Bidirectional and Auto-Regressive Transformers) and GPT, which have revolutionized Natural Language Processing (NLP). Developed by Meta AI research, facebook/bart-large-cnn is a sequence-to-sequence model pretrained on millions of articles and optimized specifically for news text summarization. Unlike traditional extractive techniques like TextRank which copy existing sentences, abstractive summarizers generate entirely new phrasing, maintaining narrative coherence and synthesizing complex ideas into concise bullet points or paragraphs. Organizations including Google, Microsoft, and OpenAI invest billions in scalable cloud infrastructure to serve real-time NLP requests to millions of users worldwide.`;

const Summarizer = () => {
  const [activeTab, setActiveTab] = useState('paste'); // 'paste' or 'pdf'
  const [text, setText] = useState('');
  const [pdfMeta, setPdfMeta] = useState(null);
  
  // Settings
  const [mode, setMode] = useState('abstractive'); // 'abstractive' or 'extractive'
  const [lengthPreset, setLengthPreset] = useState('medium'); // 'short', 'medium', 'long'
  const [maxTokens, setMaxTokens] = useState(150);
  const [extractiveSentences, setExtractiveSentences] = useState(3);

  // Results State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summaryResult, setSummaryResult] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [entitiesResult, setEntitiesResult] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleClear = () => {
    setText('');
    setPdfMeta(null);
    setSummaryResult(null);
    setKeywords([]);
    setEntitiesResult(null);
    setEvaluation(null);
    setError(null);
  };

  const handleSampleText = () => {
    setText(SAMPLE_TEXT);
    setActiveTab('paste');
  };

  const handlePdfExtracted = (extractedText, meta) => {
    setText(extractedText);
    setPdfMeta(meta);
  };

  const handleGenerateSummary = async () => {
    if (!text || text.trim().length < 10) {
      setError('Please enter or upload at least a few sentences (minimum 10 characters).');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      let mainSummary = '';
      let resSummary = null;

      if (mode === 'abstractive') {
        resSummary = await summarizeText({
          text,
          max_length: maxTokens,
          min_length: 30,
          length_preset: lengthPreset,
        });
        mainSummary = resSummary.summary;
        setSummaryResult(resSummary);
      } else {
        resSummary = await summarizeExtractive({
          text,
          sentence_count: extractiveSentences,
        });
        mainSummary = resSummary.summary;
        setSummaryResult(resSummary);
      }

      // Parallel extraction of Keywords, NER, and Evaluation metrics
      const [kwRes, entRes, evalRes] = await Promise.allSettled([
        extractKeywords({ text, top_n: 8 }),
        detectEntities({ text }),
        evaluateSummary({ original_text: text, summary_text: mainSummary })
      ]);

      if (kwRes.status === 'fulfilled') setKeywords(kwRes.value.keywords || []);
      if (entRes.status === 'fulfilled') setEntitiesResult(entRes.value);
      if (evalRes.status === 'fulfilled') setEvaluation(evalRes.value);

      setLoading(false);
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.detail || err.message || 'Error generating AI summary';
      setError(msg);
    }
  };

  const handleCopySummary = () => {
    if (!summaryResult?.summary) return;
    navigator.clipboard.writeText(summaryResult.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <FiCpu className="text-brand-600 dark:text-brand-400" /> AI Text Summarizer Workspace
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Transform long documents into concise abstractive or extractive summaries instantly.
          </p>
        </div>

        <button
          onClick={handleSampleText}
          className="px-4 py-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-600 dark:text-brand-400 text-xs font-semibold flex items-center gap-2 transition-all"
        >
          <FiZap className="w-4 h-4" /> Load Sample Text
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN - INPUT & SETTINGS */}
        <div className="lg:col-span-6 space-y-6">
          {/* Tab Selection */}
          <div className="glass-panel p-2 flex items-center gap-2">
            <button
              onClick={() => setActiveTab('paste')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'paste'
                  ? 'bg-brand-600 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
              }`}
            >
              <FiFileText className="w-4 h-4" /> Paste Text
            </button>

            <button
              onClick={() => setActiveTab('pdf')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'pdf'
                  ? 'bg-brand-600 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
              }`}
            >
              <FiUploadCloud className="w-4 h-4" /> Upload PDF
            </button>
          </div>

          {/* Text Editor OR PDF Upload */}
          {activeTab === 'pdf' ? (
            <FileUpload onTextExtracted={handlePdfExtracted} />
          ) : null}

          <div className="glass-panel p-4 space-y-3 relative">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="font-semibold text-slate-800 dark:text-slate-300">Input Document Text</span>
              <div className="flex items-center gap-4 font-mono">
                <span>{text.split(/\s+/).filter(Boolean).length} words</span>
                <span>{text.length} characters</span>
                {text && (
                  <button
                    onClick={handleClear}
                    className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 flex items-center gap-1 font-sans"
                    title="Clear input text"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your long article, research paper, report, or text here (minimum 10 characters)..."
              className="w-full h-64 bg-transparent border-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-0 text-sm leading-relaxed resize-y font-sans"
            />
          </div>

          {/* Settings Card */}
          <div className="glass-card space-y-4">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-sm border-b border-slate-200 dark:border-slate-700/60 pb-2">
              <FiSliders className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Summarization Parameters & Algorithms</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Algorithm Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">AI Algorithm</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-200 focus:border-brand-500 focus:outline-none"
                >
                  <option value="abstractive">BART Abstractive (Transformer)</option>
                  <option value="extractive">TextRank Extractive (Sumy)</option>
                </select>
              </div>

              {/* Length Preset or Sentence Count */}
              {mode === 'abstractive' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Length Preset</label>
                  <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-300 dark:border-slate-700">
                    {['short', 'medium', 'long'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setLengthPreset(p)}
                        className={`flex-1 py-1 rounded-lg text-xs capitalize font-medium transition-all ${
                          lengthPreset === p ? 'bg-brand-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Sentences to Extract ({extractiveSentences})</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={extractiveSentences}
                    onChange={(e) => setExtractiveSentences(Number(e.target.value))}
                    className="w-full accent-brand-500"
                  />
                </div>
              )}
            </div>

            {/* Token Limit Slider for Abstractive */}
            {mode === 'abstractive' && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span>Max Tokens Limit</span>
                  <span className="text-brand-600 dark:text-brand-400 font-mono">{maxTokens} tokens</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="10"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                  className="w-full accent-brand-500"
                />
              </div>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-3">
              <FiAlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleGenerateSummary}
            disabled={loading || !text.trim()}
            className="w-full gradient-btn py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-brand-500/20"
          >
            {loading ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                <span>Running Transformer Pipeline...</span>
              </>
            ) : (
              <>
                <FiZap className="w-5 h-5" />
                <span>Generate Summary ({mode === 'abstractive' ? 'BART' : 'TextRank'})</span>
              </>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN - SUMMARY RESULTS & RAG DOCUMENT CHAT */}
        <div className="lg:col-span-6 space-y-6">
          {!summaryResult && !loading && (
            <div className="glass-panel p-12 text-center space-y-4 border-dashed border-slate-300 dark:border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-800">
                <FiFileText className="w-8 h-8 opacity-60" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-300">Ready to Summarize & Chat</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                Paste your text or upload a PDF document on the left to generate AI summaries and enable <span className="text-brand-600 dark:text-brand-400 font-semibold">Chat with Document</span>.
              </p>
            </div>
          )}

          {/* Loading Skeleton Loader */}
          {loading && (
            <div className="glass-panel p-6 space-y-4 animate-pulse">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6" />
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-4/6" />
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-full" />
              </div>
            </div>
          )}

          {/* Generated Summary Card */}
          {summaryResult && !loading && (
            <div className="space-y-6">
              <div className="glass-panel p-6 space-y-4 border-brand-500/30">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 text-xs font-bold uppercase tracking-wider border border-brand-500/30">
                      {mode === 'abstractive' ? 'Abstractive (BART)' : 'Extractive (TextRank)'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {summaryResult.model_used || 'TextRank Engine'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopySummary}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all"
                      title="Copy Summary"
                    >
                      {copied ? <FiCheck className="w-4 h-4 text-emerald-500" /> : <FiCopy className="w-4 h-4" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <ExportButtons
                      summaryText={summaryResult.summary}
                      originalText={text}
                      stats={summaryResult}
                    />
                  </div>
                </div>

                {/* Summary Text Content */}
                <div className="text-slate-900 dark:text-slate-100 text-sm leading-relaxed whitespace-pre-line font-sans p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-900">
                  {summaryResult.summary}
                </div>
              </div>

              {/* Statistics Card */}
              <TextStatsCard stats={summaryResult} />

              {/* ROUGE Evaluation Card */}
              {evaluation?.rouge_scores && (
                <RougeProgress rougeScores={evaluation.rouge_scores} />
              )}

              {/* KeyBERT Keywords */}
              {keywords && keywords.length > 0 && (
                <KeywordBadges keywords={keywords} />
              )}

              {/* spaCy Named Entities */}
              {entitiesResult && (
                <div className="glass-card space-y-3">
                  <div className="flex items-center gap-2">
                    <FiTag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-200">spaCy Named Entity Recognition (NER)</h4>
                  </div>
                  <EntityHighlighter
                    entities={entitiesResult.entities}
                    entityCounts={entitiesResult.entity_counts}
                    text={text}
                  />
                </div>
              )}
            </div>
          )}

          {/* RAG Document Chat Section */}
          <DocumentChat 
            isIndexed={!!text || !!summaryResult || !!pdfMeta} 
            docName={pdfMeta?.filename || (text ? text.slice(0, 25) + '...' : '')} 
          />
        </div>
      </div>
    </div>
  );
};

export default Summarizer;
