import React, { useState, useEffect } from 'react';
import { FiClock, FiSearch, FiTrash2, FiFileText, FiEye, FiX, FiCheck, FiCopy } from 'react-icons/fi';
import { fetchHistory, deleteHistoryItem } from '../services/api';
import ExportButtons from '../components/ExportButtons';

const History = () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchHistory();
      setHistoryItems(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load summary history:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this summary history entry?")) return;

    try {
      await deleteHistoryItem(id);
      setHistoryItems(historyItems.filter(item => item.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    } catch (err) {
      alert("Failed to delete history item");
    }
  };

  const filteredItems = historyItems.filter((item) =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.original_text?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <FiClock className="text-brand-600 dark:text-brand-400" /> Summary History Archive
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Access past generated summaries, review original source texts, and export reports.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved summaries..."
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* History Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400 text-sm">
          Loading summary history records...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel p-12 text-center space-y-3">
          <FiFileText className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-300">No History Records Found</h3>
          <p className="text-xs text-slate-500">
            {searchQuery ? 'No summaries match your search query.' : 'Generate summaries in the Summarizer tab to automatically save history.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const summaryText = item.abstractive_summary || item.extractive_summary || '';
            const typeLabel = item.abstractive_summary ? 'BART Abstractive' : 'TextRank Extractive';
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="glass-card flex flex-col justify-between cursor-pointer hover:border-brand-500/60 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 text-[10px] font-bold uppercase tracking-wider">
                      {typeLabel}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 line-clamp-2 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {summaryText}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono">{item.word_count_summary} words ({item.compression_ratio})</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      title="Delete History Entry"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                    <span className="text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-1">
                      View <FiEye className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6 border-brand-500/30">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedItem.title}</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Saved on {new Date(selectedItem.timestamp).toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                  Generated Summary ({selectedItem.abstractive_summary ? 'BART Abstractive' : 'TextRank Extractive'})
                </h4>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(selectedItem.abstractive_summary || selectedItem.extractive_summary)}
                    className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5"
                  >
                    {copied ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <ExportButtons
                    summaryText={selectedItem.abstractive_summary || selectedItem.extractive_summary}
                    originalText={selectedItem.original_text}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {selectedItem.abstractive_summary || selectedItem.extractive_summary}
              </div>
            </div>

            {/* Original Text Content */}
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Original Text Source ({selectedItem.word_count_original} words)
              </h4>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-h-48 overflow-y-auto">
                {selectedItem.original_text}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
