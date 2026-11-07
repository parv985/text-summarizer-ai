import React, { useState, useRef, useEffect } from 'react';
import { 
  FiMessageSquare, FiSend, FiUser, FiCpu, FiTrash2, 
  FiCopy, FiCheck, FiLoader, FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';
import { askDocument, getChatStatus, resetChatSession } from '../services/api';

const DocumentChat = ({ isIndexed = false, docName = '' }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Ask any question about your uploaded document. Answers are strictly grounded in document text with zero hallucination.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  // Real-time Status State
  const [statusInfo, setStatusInfo] = useState({
    status: 'idle', // idle, extracting, chunking, embedding, indexing, ready, error
    document_loaded: false,
    filename: docName || '',
    progress: 0,
    stage_message: 'No Document Loaded',
    error_detail: null,
    chunk_count: 0,
    ready: false
  });

  const chatContainerRef = useRef(null);
  const isFetchingRef = useRef(false);
  const timerRef = useRef(null);

  // Controlled status fetcher
  const pollStatus = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const data = await getChatStatus();
      if (data) {
        const isReady = (data.status === 'ready' || data.document_loaded === true) && (data.chunk_count > 0 || data.ready);
        const isProcessing = ['extracting', 'chunking', 'embedding', 'indexing'].includes(data.status);
        
        setStatusInfo({
          status: data.status,
          document_loaded: isReady,
          filename: data.filename || docName || 'Document',
          progress: data.progress || 0,
          stage_message: data.stage || 'No Document Loaded',
          error_detail: data.error_detail,
          chunk_count: data.chunk_count || 0,
          ready: isReady
        });

        // Continue polling if document is processing or if indexing has not reached ready state
        if (isProcessing || (isIndexed && !isReady && data.status !== 'error')) {
          timerRef.current = setTimeout(() => {
            isFetchingRef.current = false;
            pollStatus();
          }, 1000);
          return;
        }
      }
    } catch (err) {
      console.error("Failed to poll RAG chat status", err);
    } finally {
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (!isIndexed) {
      // Fresh page mount or browser refresh: reset backend document session completely
      resetChatSession()
        .then(() => {
          setStatusInfo({
            status: 'idle',
            document_loaded: false,
            filename: '',
            progress: 0,
            stage_message: 'No Document Loaded',
            error_detail: null,
            chunk_count: 0,
            ready: false
          });
        })
        .catch((err) => console.error("Session reset on refresh failed", err));
    } else {
      pollStatus();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isIndexed, docName]);

  // Scroll ONLY the internal chat container when NEW messages arrive. Never scroll the main window!
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages.length, loading]);

  const handleSend = async () => {
    if (!question.trim() || loading || !statusInfo.ready) return;

    const userQ = question.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newMessages = [
      ...messages,
      { sender: 'user', text: userQ, timestamp: timeStr }
    ];
    setMessages(newMessages);
    setQuestion('');
    setLoading(true);

    try {
      const res = await askDocument(userQ);
      setLoading(false);
      setMessages([
        ...newMessages,
        {
          sender: 'ai',
          text: res.answer,
          grounded: res.grounded,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.detail || err.message || 'Error processing question';
      setMessages([
        ...newMessages,
        {
          sender: 'ai',
          text: 'Error processing question. Please check backend connection or re-upload document.',
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        sender: 'ai',
        text: 'Conversation cleared. You can ask a new question about the active document.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const isProcessing = ['extracting', 'chunking', 'embedding', 'indexing'].includes(statusInfo.status);

  return (
    <div className="glass-panel my-6 border-brand-500/30 overflow-hidden shadow-lg">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <FiMessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Chat with Document <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/20 text-brand-600 dark:text-brand-400 font-mono">FAISS RAG</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ask questions strictly answered from document vector chunks (Zero Hallucination).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badges */}
          {isProcessing && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold animate-pulse">
              <FiLoader className="w-4 h-4 animate-spin text-amber-500" />
              <span>{statusInfo.stage_message} ({statusInfo.progress}%)</span>
            </div>
          )}

          {statusInfo.ready && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <FiCheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Document Loaded: {statusInfo.filename} ({statusInfo.chunk_count} chunks) - Index Ready</span>
            </div>
          )}

          {!isProcessing && !statusInfo.ready && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-medium">
              <span>No Document Loaded</span>
            </div>
          )}

          {messages.length > 1 && (
            <button
              onClick={handleClear}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Clear Chat History"
            >
              <FiTrash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar when Processing */}
      {isProcessing && (
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-brand-500 h-full transition-all duration-500 ease-out"
            style={{ width: `${statusInfo.progress}%` }}
          />
        </div>
      )}

      {/* Warning Notice if Idle or Error */}
      {!isProcessing && !statusInfo.ready && (
        <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2 px-6">
          <FiAlertCircle className="w-4 h-4 shrink-0" />
          <span>Please upload a PDF document or paste text above to start chat.</span>
        </div>
      )}

      {statusInfo.status === 'error' && (
        <div className="p-3 bg-rose-500/10 border-b border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2 px-6">
          <FiAlertCircle className="w-4 h-4 shrink-0" />
          <span>{statusInfo.error_detail || 'Failed to process document embeddings.'}</span>
        </div>
      )}

      {/* Messages Window - Scroll container */}
      <div 
        ref={chatContainerRef} 
        className="p-6 space-y-4 max-h-[420px] overflow-y-auto bg-slate-50/30 dark:bg-slate-950/40 font-sans scroll-smooth"
      >
        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          const isCopied = copiedIndex === idx;

          return (
            <div
              key={idx}
              className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start group`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  isUser
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-indigo-600 text-white shadow-md'
                }`}
              >
                {isUser ? <FiUser className="w-4 h-4" /> : <FiCpu className="w-4 h-4" />}
              </div>

              {/* Message Content Bubble */}
              <div className={`space-y-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    isUser
                      ? 'bg-brand-600 text-white rounded-tr-none shadow-md'
                      : msg.isError
                      ? 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-tl-none'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Footer Meta info */}
                <div className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span>{msg.timestamp}</span>
                  {!isUser && !msg.isError && (
                    <button
                      onClick={() => handleCopy(msg.text, idx)}
                      className="hover:text-brand-500 transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
                      title="Copy Response"
                    >
                      {isCopied ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {loading && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <FiCpu className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 shadow-sm rounded-tl-none">
              <FiLoader className="w-4 h-4 animate-spin text-brand-500" />
              <span>Searching FAISS vector index & generating grounded response...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box Bar */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading || !statusInfo.ready}
          placeholder={
            statusInfo.ready
              ? `Ask a question about ${statusInfo.filename}...`
              : isProcessing
              ? `Processing document (${statusInfo.stage_message})...`
              : 'Upload a document or paste text above to start chat...'
          }
          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 disabled:opacity-50"
        />

        <button
          onClick={handleSend}
          disabled={loading || !question.trim() || !statusInfo.ready}
          className="gradient-btn px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand-500/20"
        >
          {loading ? (
            <FiLoader className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Send</span>
              <FiSend className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DocumentChat;
