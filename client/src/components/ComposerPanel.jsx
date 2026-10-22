import React, { useRef } from 'react';
import { 
  Send, 
  Clock, 
  FileEdit, 
  Paperclip, 
  Users, 
  X, 
  Sparkles, 
  Check, 
  Trash2, 
  FileText, 
  ShieldCheck, 
  Layers,
  ArrowRight,
  Download,
  AlertCircle
} from 'lucide-react';

export default function ComposerPanel({
  draft,
  onDraftChange,
  selectedTo = [],
  selectedCc = [],
  onOpenRecipientModal,
  onSaveDraft,
  onSendDirect,
  onOpenScheduleModal,
  isSending,
  isSavingDraft,
  attachments = [],
  onFileUpload,
  onRemoveAttachment,
  onClearComposer
}) {
  const fileInputRef = useRef(null);

  const handleRemoveTo = (id) => {
    const updated = selectedTo.filter(c => c.id !== id);
    onDraftChange({ ...draft, to: updated });
  };

  const handleRemoveCc = (id) => {
    const updated = selectedCc.filter(c => c.id !== id);
    onDraftChange({ ...draft, cc: updated });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      
      {/* Header */}
      <div className="px-6 py-3.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sky-400">
            <FileEdit className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Outlook Email Composer</h2>
            <p className="text-[11px] text-slate-400">Review, select recipients, and choose dispatch action</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onClearComposer}
            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center space-x-1"
            title="Reset Composer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Recipient Selection Rows */}
      <div className="p-4 bg-slate-950/40 border-b border-slate-800 space-y-3">
        
        {/* TO Row */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
          <div className="flex items-center justify-between sm:w-24 flex-shrink-0">
            <span className="text-xs font-semibold text-slate-300">TO:</span>
            <button
              onClick={() => onOpenRecipientModal('to')}
              className="px-2 py-0.5 rounded-md bg-blue-600/20 hover:bg-blue-600/30 text-sky-400 border border-blue-500/30 text-[10px] font-semibold flex items-center space-x-1 transition-all"
            >
              <Check className="w-2.5 h-2.5" />
              <span>Tick Marks ({selectedTo.length})</span>
            </button>
          </div>

          <div className="flex-1 flex flex-wrap gap-1.5 min-h-[32px] p-1.5 bg-slate-900/80 rounded-xl border border-slate-800/80 items-center">
            {selectedTo.length === 0 ? (
              <span 
                onClick={() => onOpenRecipientModal('to')}
                className="text-xs text-slate-500 italic cursor-pointer hover:text-slate-400 px-2"
              >
                No recipients selected. Click 'Tick Marks' to select colleagues...
              </span>
            ) : (
              selectedTo.map(c => (
                <div
                  key={c.id}
                  className="flex items-center space-x-1.5 pl-1.5 pr-1 py-0.5 rounded-lg bg-blue-600/15 border border-blue-500/30 text-xs text-slate-200"
                >
                  <img src={c.avatar} alt={c.name} className="w-4 h-4 rounded-full object-cover" />
                  <span className="font-medium text-[11px]">{c.name}</span>
                  <button
                    onClick={() => handleRemoveTo(c.id)}
                    className="p-0.5 text-slate-400 hover:text-rose-400 rounded transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CC Row */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
          <div className="flex items-center justify-between sm:w-24 flex-shrink-0">
            <span className="text-xs font-semibold text-slate-400">CC:</span>
            <button
              onClick={() => onOpenRecipientModal('cc')}
              className="px-2 py-0.5 rounded-md bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 text-[10px] font-semibold flex items-center space-x-1 transition-all"
            >
              <Check className="w-2.5 h-2.5" />
              <span>Tick Marks ({selectedCc.length})</span>
            </button>
          </div>

          <div className="flex-1 flex flex-wrap gap-1.5 min-h-[32px] p-1.5 bg-slate-900/80 rounded-xl border border-slate-800/80 items-center">
            {selectedCc.length === 0 ? (
              <span 
                onClick={() => onOpenRecipientModal('cc')}
                className="text-xs text-slate-500 italic cursor-pointer hover:text-slate-400 px-2"
              >
                No CC recipients selected. Click 'Tick Marks' to select...
              </span>
            ) : (
              selectedCc.map(c => (
                <div
                  key={c.id}
                  className="flex items-center space-x-1.5 pl-1.5 pr-1 py-0.5 rounded-lg bg-indigo-600/15 border border-indigo-500/30 text-xs text-slate-200"
                >
                  <img src={c.avatar} alt={c.name} className="w-4 h-4 rounded-full object-cover" />
                  <span className="font-medium text-[11px]">{c.name}</span>
                  <button
                    onClick={() => handleRemoveCc(c.id)}
                    className="p-0.5 text-slate-400 hover:text-rose-400 rounded transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Subject Row */}
        <div className="flex items-center space-x-3 pt-1">
          <span className="text-xs font-semibold text-slate-300 w-24 flex-shrink-0 hidden sm:block">Subject:</span>
          <div className="flex-1 relative">
            <input
              type="text"
              value={draft?.subject || ''}
              onChange={(e) => onDraftChange({ ...draft, subject: e.target.value })}
              placeholder="Email subject (auto-generated by AI based on your prompt)..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

      </div>

      {/* Email Body Textarea */}
      <div className="flex-1 p-4 flex flex-col overflow-hidden bg-slate-950/20">
        <textarea
          value={draft?.body || ''}
          onChange={(e) => onDraftChange({ ...draft, body: e.target.value })}
          placeholder="Draft email body will appear here once generated by the AI assistant. You can also write or edit directly..."
          className="w-full flex-1 bg-transparent text-xs text-slate-200 font-sans leading-relaxed focus:outline-none resize-none p-1 placeholder-slate-600"
        />

        {/* Attachments Section if any exist */}
        {attachments.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2 flex items-center">
              <Paperclip className="w-3 h-3 mr-1 text-sky-400" /> Attached Files ({attachments.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {attachments.map(att => (
                <div
                  key={att.id}
                  className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200"
                >
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <div className="truncate max-w-[150px]">
                    <p className="text-[11px] font-medium truncate">{att.original_name}</p>
                    <p className="text-[9px] text-slate-400">{formatBytes(att.size)}</p>
                  </div>
                  <button
                    onClick={() => onRemoveAttachment(att.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions Bar: The 3 Core Options */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Left: Attach File Quick Button & Word Count */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700"
          >
            <Paperclip className="w-3.5 h-3.5 text-sky-400" />
            <span>Attach File</span>
          </button>

          <span className="text-[11px] text-slate-500">
            {draft?.body ? draft.body.split(/\s+/).filter(Boolean).length : 0} words
          </span>
        </div>

        {/* Right: The 3 Core Dispatch Actions */}
        <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
          
          {/* Action 1: Add to Outlook Draft */}
          <button
            onClick={onSaveDraft}
            disabled={isSavingDraft || (!draft?.subject && !draft?.body)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Saves into your Outlook Drafts folder to review later"
          >
            <FileText className="w-3.5 h-3.5 text-slate-300" />
            <span>{isSavingDraft ? 'Saving Draft...' : '1. Add to Draft'}</span>
          </button>

          {/* Action 2: Schedule with Timer (6:30 PM) */}
          <button
            onClick={onOpenScheduleModal}
            disabled={selectedTo.length === 0}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Set a timer (e.g. 6:30 PM) to dispatch automatically"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>2. Schedule Timer</span>
          </button>

          {/* Action 3: Send Directly Now */}
          <button
            onClick={onSendDirect}
            disabled={isSending || selectedTo.length === 0}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Sends immediately from your Outlook account"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? 'Sending via Outlook...' : '3. Send Now'}</span>
          </button>

        </div>

      </div>

    </div>
  );
}
