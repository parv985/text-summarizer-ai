/**
 * Downloads text as a plain text (.txt) file.
 */
export const downloadAsTxt = (title, content, originalText = "") => {
  const fileTitle = title ? title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'summora_summary';
  
  let exportContent = `==========================================================\n`;
  exportContent += `SUMMORA AI TEXT SUMMARIZER - SUMMARY REPORT\n`;
  exportContent += `Generated Date: ${new Date().toLocaleString()}\n`;
  exportContent += `==========================================================\n\n`;
  exportContent += `SUMMARY:\n`;
  exportContent += `----------------------------------------------------------\n`;
  exportContent += `${content}\n\n`;

  if (originalText) {
    exportContent += `----------------------------------------------------------\n`;
    exportContent += `ORIGINAL TEXT:\n`;
    exportContent += `----------------------------------------------------------\n`;
    exportContent += `${originalText}\n`;
  }

  const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileTitle}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Downloads text as a formatted printable Document / PDF view.
 */
export const downloadAsPdf = (title, content, stats = null) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const docTitle = title || 'Summora Summary Report';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${docTitle}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #1e293b;
            line-height: 1.6;
          }
          .header {
            border-bottom: 2px solid #0c8df2;
            padding-bottom: 15px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #0c8df2;
            margin: 0 0 5px 0;
            font-size: 24px;
          }
          .meta {
            color: #64748b;
            font-size: 13px;
          }
          .summary-box {
            background-color: #f8fafc;
            border-left: 4px solid #0c8df2;
            padding: 20px;
            border-radius: 4px;
            margin-bottom: 30px;
            font-size: 15px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .stat-card {
            background: #f1f5f9;
            padding: 12px;
            border-radius: 6px;
            text-align: center;
          }
          .stat-val {
            font-weight: bold;
            font-size: 18px;
            color: #0f172a;
          }
          .stat-lbl {
            font-size: 12px;
            color: #475569;
          }
          .footer {
            margin-top: 50px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            font-size: 12px;
            color: #94a3b8;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Summora AI Summary Report</h1>
          <div class="meta">Generated on ${new Date().toLocaleString()}</div>
        </div>

        ${stats ? `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-val">${stats.original_word_count || 0}</div>
            <div class="stat-lbl">Original Words</div>
          </div>
          <div class="stat-card">
            <div class="stat-val">${stats.summary_word_count || 0}</div>
            <div class="stat-lbl">Summary Words</div>
          </div>
          <div class="stat-card">
            <div class="stat-val">${stats.compression_ratio || 'N/A'}</div>
            <div class="stat-lbl">Compression Ratio</div>
          </div>
          <div class="stat-card">
            <div class="stat-val">${stats.reading_time_reduction || '0 min'}</div>
            <div class="stat-lbl">Time Saved</div>
          </div>
        </div>
        ` : ''}

        <div class="summary-box">
          <h3 style="margin-top:0; color:#0f172a;">Generated Summary</h3>
          <p>${content.replace(/\n/g, '<br/>')}</p>
        </div>

        <div class="footer">
          Generated using Summora AI Text Summarizer Platform (BART / TextRank Transformer Engine)
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
};
