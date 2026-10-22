import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Paperclip, 
  FileText, 
  Trash2, 
  RefreshCw, 
  CornerDownLeft, 
  Check, 
  Bot, 
  User, 
  SlidersHorizontal,
  X,
  FileCheck
} from 'lucide-react';

export default function ChatAssistant({ 
  onGenerateDraft, 
  onRefineDraft, 
  currentDraft, 
  isGenerating, 
  uploadedAttachments, 
  onFileUpload, 
  onRemoveAttachment,
  chatMessages = [],
  onClearChat
}) {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [isRefining, setIsRefining] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    {
      title: 'Daily Evening EOD Status',
      text: 'Draft daily evening update: finished auth module integration, fixed 3 payment bugs, deployed to staging. Tomorrow starting export feature and QA review. Need CC to QA and Engineering leads.',
      icon: '🌅'
    },
    {
      title: 'Sprint Release for QA',
      text: 'Draft sprint release announcement: staging build v2.4 deployed. Regression testing needed for role permissions and scheduled timers. Sign-off requested by noon tomorrow.',
      icon: '🚀'
    },
    {
      title: 'Urgent System Advisory',
      text: 'Draft urgent incident update: transient API gateway latency observed during peak window. Mitigated by increasing cluster capacity. Monitoring closely.',
      icon: '⚠️'
    },
    {
      title: 'Client Deliverable Sync',
      text: 'Draft client progress update for David and stakeholders: Sprint 42 milestones completed on schedule. Attached roadmap and documentation. Requesting review call.',
      icon: '🤝'
    }
  ];

  const tones = [
    { id: 'professional', label: 'Professional', desc: 'Standard business tone' },
    { id: 'concise', label: 'Concise Bullets', desc: 'Punchy & fast to read' },
    { id: 'executive', label: 'Executive', desc: 'High-level C-Suite style' },
    { id: 'friendly', label: 'Friendly', desc: 'Warm & approachable' }
  ];

  const handleSendPrompt = (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    // If there's an existing draft and the prompt looks like a refinement command
    const isRefinementCommand = currentDraft?.body && (
      prompt.toLowerCase().includes('make') || 
      prompt.toLowerCase().includes('shorter') || 
      prompt.toLowerCase().includes('formal') || 
      prompt.toLowerCase().includes('add') || 
      prompt.toLowerCase().includes('change') || 
      prompt.toLowerCase().includes('subject:')
    );

    if (isRefinementCommand) {
      onRefineDraft(prompt);
    } else {
      onGenerateDraft(prompt, tone);
    }

    setPrompt('');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">AI Email Assistant</h2>
            <p className="text-[11px] text-slate-400">Natural language drafting & refinement</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {chatMessages.length > 0 && (
            <button
              onClick={onClearChat}
              className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
              title="Clear Chat History"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tone Selection Bar */}
      <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/80 flex items-center space-x-1.5 overflow-x-auto text-xs">
        <span className="text-[11px] text-slate-500 font-medium flex items-center mr-1">
          <SlidersHorizontal className="w-3 h-3 mr-1" /> Tone:
        </span>
        {tones.map(t => (
          <button
            key={t.id}
            onClick={() => setTone(t.id)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap ${
              tone === t.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Chat Messages / Interaction Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center mb-3 text-sky-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">How can I draft your email today?</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-5">
              Type your raw thoughts or quick notes. I will generate a polished subject, formatted body, and suggest your TO & CC list from the company directory.
            </p>

            {/* Quick Starters */}
            <div className="w-full space-y-2 text-left">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider px-1">
                Quick 1-Click Starters:
              </p>
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setPrompt(qp.text);
                    onGenerateDraft(qp.text, tone);
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all text-left flex items-start space-x-2.5 group"
                >
                  <span className="text-base">{qp.icon}</span>
                  <div className="flex-1 truncate">
                    <p className="text-xs font-medium text-slate-200 group-hover:text-sky-300">{qp.title}</p>
                    <p className="text-[11px] text-slate-400 truncate">{qp.text}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatMessages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400 flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* If assistant response generated a snapshot */}
                {msg.draft_snapshot && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-700/60">
                    <div className="flex items-center justify-between text-[11px] text-sky-400 font-medium mb-1">
                      <span>✓ Subject: {msg.draft_snapshot.subject}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 space-y-0.5">
                      <p>• TO: {msg.draft_snapshot.suggestedTo?.map(t => t.name).join(', ') || 'Selected'}</p>
                      <p>• CC: {msg.draft_snapshot.suggestedCc?.map(c => c.name).join(', ') || 'Selected'}</p>
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {isGenerating && (
          <div className="flex items-center space-x-3 text-xs text-sky-400 bg-slate-800/40 border border-sky-500/20 p-3 rounded-xl animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Analyzing prompt, mapping company directory & crafting draft...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Refine Suggestions (if draft exists) */}
      {currentDraft?.body && (
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto">
          <span className="text-[10px] text-slate-500 font-medium uppercase whitespace-nowrap">Refine:</span>
          <button
            onClick={() => onRefineDraft('Make it more concise and bulleted')}
            className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 whitespace-nowrap transition-colors"
          >
            ⚡ Make Concise
          </button>
          <button
            onClick={() => onRefineDraft('Elevate tone to formal executive style')}
            className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 whitespace-nowrap transition-colors"
          >
            👔 Make Executive
          </button>
          <button
            onClick={() => onRefineDraft('Add a reminder that team sync is scheduled for 10:00 AM tomorrow')}
            className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 whitespace-nowrap transition-colors"
          >
            + 10 AM Sync Reminder
          </button>
          <button
            onClick={() => onRefineDraft('Add note that staging deployment is locked until QA sign-off')}
            className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 whitespace-nowrap transition-colors"
          >
            + Staging Lock Note
          </button>
        </div>
      )}

      {/* Attachments Pending Chips */}
      {uploadedAttachments.length > 0 && (
        <div className="px-4 py-1.5 bg-slate-900/90 border-t border-slate-800 flex flex-wrap gap-1.5">
          {uploadedAttachments.map(att => (
            <div
              key={att.id}
              className="flex items-center space-x-1.5 px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-[11px] text-slate-300"
            >
              <FileCheck className="w-3 h-3 text-sky-400" />
              <span className="truncate max-w-[120px]">{att.original_name}</span>
              <button
                onClick={() => onRemoveAttachment(att.id)}
                className="text-slate-400 hover:text-rose-400 ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Composer Box */}
      <div className="p-3 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleSendPrompt} className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSendPrompt();
              }
            }}
            placeholder="E.g. Draft evening update: finished auth module, fixed 3 bugs, staging updated. CC QA leads and send at 6:30..."
            rows={3}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none pr-20"
          />

          <div className="absolute right-2.5 bottom-3.5 flex items-center space-x-1.5">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Attach File (PDF, DOCX, ZIP, etc.)"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                prompt.trim() && !isGenerating
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title="Send to AI Assistant (Ctrl+Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 px-1">
          <span>Tip: Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400">Ctrl+Enter</kbd> to submit</span>
          <span>Automatic directory match active</span>
        </div>
      </div>

    </div>
  );
}
