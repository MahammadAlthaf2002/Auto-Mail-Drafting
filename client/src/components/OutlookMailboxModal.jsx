import React, { useState } from 'react';
import { 
  X, 
  Inbox, 
  Send, 
  FileText, 
  Clock, 
  Trash2, 
  ExternalLink, 
  Paperclip, 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCw,
  Edit3
} from 'lucide-react';

export default function OutlookMailboxModal({ 
  isOpen, 
  onClose, 
  mailboxData, 
  onLoadDraftIntoComposer, 
  onDeleteEmail, 
  onRefresh 
}) {
  const [selectedFolder, setSelectedFolder] = useState('drafts'); // 'drafts', 'sent', 'scheduled'
  const [selectedEmail, setSelectedEmail] = useState(null);

  if (!isOpen) return null;

  const drafts = mailboxData?.drafts || [];
  const sent = mailboxData?.sent || [];
  const scheduled = mailboxData?.scheduled || [];

  const getActiveList = () => {
    if (selectedFolder === 'drafts') return drafts;
    if (selectedFolder === 'sent') return sent;
    return scheduled;
  };

  const currentList = getActiveList();
  const activeEmail = selectedEmail || currentList[0] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-sky-400">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-semibold text-white">Outlook 365 Mailbox Monitor</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 flex items-center space-x-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Cloud Synced</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Connected Account: <strong className="text-slate-200">{mailboxData?.account?.email}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="Refresh Mailbox"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3-Column Outlook Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Column 1: Folders Sidebar */}
          <div className="w-52 bg-slate-950/60 border-r border-slate-800 p-3 space-y-1 flex-shrink-0">
            <p className="px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Outlook Folders
            </p>

            <button
              onClick={() => {
                setSelectedFolder('drafts');
                setSelectedEmail(drafts[0] || null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedFolder === 'drafts'
                  ? 'bg-blue-600/15 text-sky-300 border border-blue-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Drafts</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
                {drafts.length}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedFolder('sent');
                setSelectedEmail(sent[0] || null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedFolder === 'sent'
                  ? 'bg-blue-600/15 text-sky-300 border border-blue-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Send className="w-4 h-4 text-emerald-400" />
                <span>Sent Items</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
                {sent.length}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedFolder('scheduled');
                setSelectedEmail(scheduled[0] || null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedFolder === 'scheduled'
                  ? 'bg-blue-600/15 text-sky-300 border border-blue-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Scheduled Queue</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
                {scheduled.length}
              </span>
            </button>

            <div className="pt-4 mt-4 border-t border-slate-800/80 px-2 text-[11px] text-slate-500">
              <p className="font-semibold text-slate-400 mb-1">Exchange Server</p>
              <p className="truncate">outlook.office365.com</p>
              <p className="mt-1 text-[10px] text-emerald-400">Live Graph v1.0 Sync</p>
            </div>
          </div>

          {/* Column 2: Email List Pane */}
          <div className="w-72 sm:w-80 border-r border-slate-800 flex flex-col overflow-y-auto bg-slate-900/40 flex-shrink-0">
            {currentList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No items in this folder.
              </div>
            ) : (
              currentList.map(mail => (
                <div
                  key={mail.id}
                  onClick={() => setSelectedEmail(mail)}
                  className={`p-3.5 border-b border-slate-800/80 cursor-pointer transition-all ${
                    activeEmail?.id === mail.id
                      ? 'bg-slate-800/90 border-l-4 border-l-blue-500'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-200 truncate max-w-[140px]">
                      {mail.to_recipients?.[0]?.name || 'No Recipient'}
                    </span>
                    <span className="text-[10px]">
                      {new Date(mail.sent_at || mail.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-white truncate mb-1">
                    {mail.subject || '(No Subject)'}
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {mail.body}
                  </p>

                  <div className="flex items-center space-x-1.5 mt-2">
                    <span className="text-[9px] font-mono text-slate-500 truncate">
                      ID: {mail.outlook_message_id?.substring(0, 16)}...
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Column 3: Email Detail / Preview Pane */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/60 p-6">
            {activeEmail ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* Email Header */}
                <div className="border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white mb-2">{activeEmail.subject}</h3>
                      <div className="text-xs text-slate-400 space-y-1">
                        <p>
                          <span className="text-slate-500">From:</span> <span className="text-slate-200">{mailboxData?.account?.email}</span>
                        </p>
                        <p>
                          <span className="text-slate-500">To:</span> <span className="text-sky-400">{activeEmail.to_recipients?.map(t => `${t.name} <${t.email}>`).join(', ')}</span>
                        </p>
                        {activeEmail.cc_recipients?.length > 0 && (
                          <p>
                            <span className="text-slate-500">CC:</span> <span className="text-indigo-400">{activeEmail.cc_recipients?.map(c => `${c.name} <${c.email}>`).join(', ')}</span>
                          </p>
                        )}
                        <p>
                          <span className="text-slate-500">Date:</span> <span className="text-slate-300">{new Date(activeEmail.sent_at || activeEmail.created_at).toLocaleString()}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {selectedFolder === 'drafts' && (
                        <button
                          onClick={() => {
                            onLoadDraftIntoComposer(activeEmail);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all flex items-center space-x-1.5 shadow-sm"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit & Send</span>
                        </button>
                      )}

                      <button
                        onClick={() => onDeleteEmail(activeEmail.id)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
                        title="Delete from Outlook"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Email Body */}
                <div className="flex-1 overflow-y-auto pr-2 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                  {activeEmail.body}
                </div>

                {/* Outlook Sync Metadata Badge */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Microsoft Graph Outlook ID: <code className="text-slate-400 font-mono">{activeEmail.outlook_message_id}</code></span>
                  </span>
                  <span className="text-slate-400">Sync: {activeEmail.sync_status}</span>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                Select an email from the list to preview.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
