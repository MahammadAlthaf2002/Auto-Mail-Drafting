import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Send, 
  Trash2, 
  RefreshCw 
} from 'lucide-react';

export default function ScheduledQueueModal({ 
  isOpen, 
  onClose, 
  scheduledEmails = [], 
  onCancelScheduled, 
  onSendNow, 
  onRefresh 
}) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const getRemainingTime = (targetIso) => {
    const target = new Date(targetIso).getTime();
    const diffMs = target - currentTime;
    if (diffMs <= 0) return 'Sending now...';

    const diffSecs = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSecs / 3600);
    const mins = Math.floor((diffSecs % 3600) / 60);
    const secs = diffSecs % 60;

    if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0078d4] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Scheduled Email Queue</h2>
              <p className="text-xs text-blue-100">Emails queued for automatic background delivery</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button onClick={onRefresh} className="p-1 hover:bg-white/20 rounded text-white">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {scheduledEmails.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">No scheduled emails in queue</p>
              <p className="text-xs text-slate-500 mt-0.5">Use "2. Schedule at 6:30 PM" to queue an email for automatic dispatch.</p>
            </div>
          ) : (
            scheduledEmails.map(item => {
              const to = item.to_recipients || [];
              const cc = item.cc_recipients || [];
              const countdown = getRemainingTime(item.scheduled_time);

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-mono font-bold flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                        <span>Sends in {countdown}</span>
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Target: {new Date(item.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 truncate">{item.subject}</h4>
                    <p className="text-xs text-slate-600 line-clamp-1">{item.body}</p>

                    <div className="text-[11px] text-slate-500 pt-0.5">
                      <span className="text-[#0078d4] font-medium">TO: {to.map(t => t.name).join(', ')}</span>
                      {cc.length > 0 && <span className="ml-2 text-indigo-600">CC: {cc.map(c => c.name).join(', ')}</span>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => onSendNow(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-semibold flex items-center space-x-1 shadow-sm"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send Now</span>
                    </button>
                    <button
                      onClick={() => onCancelScheduled(item.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Active Scheduled Jobs: <strong className="text-slate-800">{scheduledEmails.length}</strong></span>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-900 font-medium">
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
