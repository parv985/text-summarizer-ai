import React, { useState, useRef } from 'react';
import { FiUploadCloud, FiFile, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { uploadPdf } from '../services/api';

const FileUpload = ({ onTextExtracted }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a valid PDF file (.pdf)');
      return;
    }

    setError(null);
    setLoading(true);
    setFileInfo({ name: file.name, size: (file.size / 1024 / 1024).toFixed(2) + ' MB' });

    try {
      const data = await uploadPdf(file);
      setLoading(false);
      if (onTextExtracted) {
        onTextExtracted(data.extracted_text, data);
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.detail || err.message || 'Failed to parse PDF file';
      setError(msg);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
            : 'border-slate-300 hover:border-brand-500 bg-slate-50/80 hover:bg-slate-100 dark:border-slate-700/80 dark:hover:border-brand-500/60 dark:bg-slate-900/50 dark:hover:bg-slate-900/80'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="application/pdf"
          className="hidden"
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className={`p-4 rounded-2xl ${isDragging ? 'bg-brand-500/20 text-brand-600 dark:text-brand-400' : 'bg-slate-200 dark:bg-slate-800 text-brand-600 dark:text-brand-400'} transition-all`}>
            {loading ? (
              <FiLoader className="w-8 h-8 animate-spin text-brand-600 dark:text-brand-400" />
            ) : (
              <FiUploadCloud className="w-8 h-8" />
            )}
          </div>

          <div>
            <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              {loading ? 'Processing PDF Document...' : 'Upload PDF Document'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Drag & drop your PDF file here or <span className="text-brand-600 dark:text-brand-400 font-semibold">browse files</span>
            </p>
          </div>

          {fileInfo && !error && !loading && (
            <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <FiCheckCircle className="w-4 h-4" />
              <span>{fileInfo.name} ({fileInfo.size})</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
