import React, { useState } from 'react';
import { CheckCircle2, Copy, Globe, Download, X, ExternalLink, Sparkles, Check } from 'lucide-react';

export default function OutlookHelperModal({
  isOpen,
  onClose,
  subject,
  toRecipients = [],
  ccRecipients = [],
  htmlContent,
  plainTextContent,
  webOutlookUrl
}) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleCopyAgain = async () => {
    try {
      if (htmlContent && navigator.clipboard && window.ClipboardItem) {
        const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
        const textBlob = new Blob([plainTextContent || ''], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': textBlob
          })
        ]);
      } else if (plainTextContent) {
        await navigator.clipboard.writeText(plainTextContent);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    } catch (err) {
      console.warn('Copy error:', err);
    }
  };

  const handleDownloadEml = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch('/api/emails/download-draft-eml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toRecipients,
          ccRecipients,
          subject,
          body: plainTextContent,
          htmlBody: htmlContent
        })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Outlook_Draft_${Date.now()}.eml`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReopenOutlook = () => {
    if (webOutlookUrl) {
      window.open(webOutlookUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden font-sans">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0078d4] to-[#005a9e] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Draft Opened in Chrome Outlook!</h3>
              <p className="text-blue-100 text-xs">Ready to paste your exact bordered table into Outlook</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          
          {/* Quick Summary Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 text-slate-700">
            <div>
              <strong className="text-slate-900">TO: </strong>
              <span>{toRecipients.map(r => r.email).join(', ') || 'prasanna.gunji@nybinfotech.com, nafisa.khanam@nybinfotech.com'}</span>
            </div>
            <div>
              <strong className="text-slate-900">Subject: </strong>
              <span className="font-semibold text-slate-900">
                {subject || (() => {
                  const now = new Date();
                  const dd = String(now.getDate()).padStart(2, '0');
                  const mm = String(now.getMonth() + 1).padStart(2, '0');
                  return `Daily Status Report [${dd}-${mm}-${now.getFullYear()}]`;
                })()}
              </span>
            </div>
          </div>

          {/* Key Step: Visual Instructions Box */}
          <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Exact Formatted Table Copied to Your Clipboard!</span>
            </div>

            <p className="text-xs text-emerald-800 leading-relaxed">
              In the Outlook compose tab that just opened in your browser:
            </p>

            <ol className="list-decimal pl-5 text-xs text-emerald-950 font-medium space-y-1">
              <li>Click inside the email message area.</li>
              <li>Press <strong className="bg-emerald-200 px-1.5 py-0.5 rounded text-emerald-900 font-mono">Ctrl + V</strong> (or Right-Click &rarr; Paste).</li>
              <li>
                <strong>Done!</strong> The exact 2-column corporate table with solid borders, greeting, and signature appears in your email.
              </li>
            </ol>
          </div>

          {copied && (
            <div className="p-2.5 rounded-lg bg-emerald-100 border border-emerald-300 text-xs text-emerald-800 font-semibold flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>Table copied to clipboard again! Press Ctrl+V in Outlook.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyAgain}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '✓ Copied (Ctrl+V Ready)' : '📋 Copy Table Again'}</span>
              </button>

              <button
                type="button"
                onClick={handleReopenOutlook}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0078d4] hover:bg-[#106ebe] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>🌐 Re-Open Chrome Outlook</span>
              </button>
            </div>

            {/* Native .eml Draft Option */}
            <button
              type="button"
              onClick={handleDownloadEml}
              disabled={isDownloading}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              title="Opens natively in Microsoft Outlook with the rich HTML table already inside the email!"
            >
              <Download className="w-4 h-4 text-[#0078d4]" />
              <span>{isDownloading ? 'Preparing .eml Draft...' : '📥 Open in Native Outlook (.eml Draft with Table)'}</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
          >
            Got it, Close
          </button>
        </div>

      </div>
    </div>
  );
}
