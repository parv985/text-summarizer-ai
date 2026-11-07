import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiCpu, FiZap, FiLayers, FiCheckCircle, 
  FiArrowRight, FiBarChart2, FiUploadCloud, FiSearch 
} from 'react-icons/fi';

const Home = () => {
  const features = [
    {
      icon: FiCpu,
      title: 'BART Abstractive Summarizer',
      description: 'Generates human-like, coherent summaries using facebook/bart-large-cnn Seq2Seq Transformer model.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FiLayers,
      title: 'TextRank Extractive Engine',
      description: 'Identifies and extracts key pivotal sentences using Sumy graph-based sentence ranking algorithms.',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      icon: FiUploadCloud,
      title: 'PyMuPDF Document Reader',
      description: 'Upload PDF files directly. Pages are extracted and cleaned instantly for summarization.',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: FiSearch,
      title: 'spaCy NER Entity Tagging',
      description: 'Detects and highlights Persons, Organizations, Locations, Dates, Money, and Events automatically.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: FiZap,
      title: 'KeyBERT Keyphrase Extraction',
      description: 'Leverages BERT embeddings to isolate high-relevance domain keyphrases and topics.',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: FiBarChart2,
      title: 'ROUGE Evaluation Metrics',
      description: 'Calculates ROUGE-1, ROUGE-2, ROUGE-L precision metrics, reading time, and compression ratios.',
      color: 'from-sky-500 to-blue-600',
    },
  ];

  return (
    <div className="space-y-24 py-8">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16">
        {/* Glowing background blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold uppercase tracking-wider animate-pulse-slow">
            <FiZap className="w-3.5 h-3.5" />
            <span>Next-Generation Transformer NLP Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Summarize Any Text & PDF with <br />
            <span className="gradient-text">Production AI Intelligence</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Summora harnesses <span className="text-slate-900 dark:text-slate-200 font-medium">BART Large CNN</span>, <span className="text-slate-900 dark:text-slate-200 font-medium">TextRank</span>, <span className="text-slate-900 dark:text-slate-200 font-medium">KeyBERT</span>, and <span className="text-slate-900 dark:text-slate-200 font-medium">spaCy</span> to deliver instant abstractive summaries, entity detection, keyword extraction, and ROUGE evaluation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/app"
              className="gradient-btn px-8 py-4 rounded-2xl text-base font-bold flex items-center gap-3 w-full sm:w-auto justify-center shadow-xl shadow-brand-500/20 hover:scale-105 transition-all"
            >
              <span>Try Summarizer Now</span>
              <FiArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/compare"
              className="px-8 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-base font-semibold flex items-center gap-3 w-full sm:w-auto justify-center transition-all hover:scale-105"
            >
              <FiLayers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Compare Extractive vs Abstractive</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Full-Stack NLP Feature Suite</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl mx-auto">
            Built from scratch with zero placeholders. Designed for high accuracy and deep textual insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="glass-card flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} p-3 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-full h-full" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{feat.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* NLP COMPARISON HIGHLIGHT */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="glass-panel p-8 sm:p-12 relative overflow-hidden border-brand-500/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <span className="px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-mono uppercase font-bold">
                Dual NLP Algorithms
              </span>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                Extractive vs Abstractive Summarization
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Compare traditional graph-based sentence ranking with modern sequence-to-sequence neural transformers.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <FiCheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Extractive (TextRank)</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Selects and preserves exact pivotal sentences from original text without rewriting.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiCheckCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Abstractive (BART Large CNN)</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Understands semantic context and generates novel, human-like summaries.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link to="/compare" className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 text-sm font-semibold hover:underline">
                  Launch Comparative Lab <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 dark:bg-slate-950/80 border border-slate-800 space-y-4 font-mono text-xs text-slate-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-brand-400 font-bold">Summora AI Pipeline</span>
                <span className="text-[10px] text-slate-400">v1.0.0</span>
              </div>
              <div className="space-y-2">
                <p className="text-slate-400">// Pipeline Execution Flow</p>
                <p><span className="text-purple-400">Input</span> → Raw Text / PyMuPDF PDF Stream</p>
                <p><span className="text-indigo-400">Preprocessing</span> → Clean, Tokenize & Remove Stopwords</p>
                <p><span className="text-blue-400">BART Seq2Seq</span> → Deep Attention Abstractive Generation</p>
                <p><span className="text-emerald-400">TextRank Graph</span> → Sentence Centrality Ranking</p>
                <p><span className="text-amber-400">KeyBERT & spaCy</span> → Topic Vectors & Named Entities</p>
                <p><span className="text-sky-400">ROUGE Metric</span> → Precision, Recall, F1 Score Evaluation</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
