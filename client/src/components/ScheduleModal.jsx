import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Calendar, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Zap
} from 'lucide-react';

export default function ScheduleModal({ 
  isOpen, 
  onClose, 
  onScheduleConfirm, 
  currentSubject, 
  toCount, 
  ccCount 
}) {
  if (!isOpen) return null;

  const getInitialTime = () => {
    const d = new Date();
    d.setHours(18, 30, 0, 0); // 6:30 PM
    if (d.getTime() < Date.now()) {
      d.setDate(d.getDate() + 1);
    }
    return d.toISOString().slice(0, 16);
  };

  const [scheduledDateTime, setScheduledDateTime] = useState(getInitialTime);

  const calculateTimeDiff = () => {
    const target = new Date(scheduledDateTime).getTime();
    const diffMs = target - Date.now();
    if (diffMs <= 0) return 'Immediate / In the past';

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    if (hours === 0) return `in ${mins} minute(s)`;
    return `in ${hours} hour(s) and ${mins} minute(s)`;
  };

  const setPresetTime = (type) => {
    const d = new Date();
    if (type === '6:30pm') {
      d.setHours(18, 30, 0, 0);
      if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
    } else if (type === '7:00pm') {
      d.setHours(19, 0, 0, 0);
      if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
    } else if (type === '30m') {
      d.setMinutes(d.getMinutes() + 30);
    } else if (type === '1h') {
      d.setHours(d.getHours() + 1);
    } else if (type === 'tomorrow9am') {
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
    }
    setScheduledDateTime(d.toISOString().slice(0, 16));
  };

  const handleConfirm = () => {
    onScheduleConfirm(new Date(scheduledDateTime).toISOString());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-[#0078d4] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Schedule Outlook Send</h2>
              <p className="text-xs text-blue-100">Automatic background dispatch at selected time</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {/* Target Preview */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target Email</p>
            <p className="text-xs font-bold text-slate-900 truncate">{currentSubject || '(Untitled Draft)'}</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Recipients: <strong className="text-[#0078d4]">{toCount} in TO</strong> • <strong className="text-indigo-600">{ccCount} in CC</strong>
            </p>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center">
              <Zap className="w-3.5 h-3.5 text-amber-500 mr-1.5" />
              Quick Time Presets:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPresetTime('6:30pm')}
                className="p-2.5 rounded-lg bg-amber-50 hover:bg-amber-100/80 border border-amber-300 text-left transition-colors"
              >
                <p className="text-xs font-bold text-amber-900">Today at 6:30 PM</p>
                <p className="text-[10px] text-amber-700">Evening wrap</p>
              </button>

              <button
                type="button"
                onClick={() => setPresetTime('7:00pm')}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
              >
                <p className="text-xs font-bold text-slate-800">Today at 7:00 PM</p>
                <p className="text-[10px] text-slate-500">End of day</p>
              </button>

              <button
                type="button"
                onClick={() => setPresetTime('1h')}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
              >
                <p className="text-xs font-bold text-slate-800">In 1 Hour</p>
                <p className="text-[10px] text-slate-500">Timed follow-up</p>
              </button>

              <button
                type="button"
                onClick={() => setPresetTime('30m')}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
              >
                <p className="text-xs font-bold text-slate-800">In 30 Minutes</p>
                <p className="text-[10px] text-slate-500">Short delay</p>
              </button>

              <button
                type="button"
                onClick={() => setPresetTime('tomorrow9am')}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors col-span-2 sm:col-span-2"
              >
                <p className="text-xs font-bold text-slate-800">Tomorrow at 9:00 AM</p>
                <p className="text-[10px] text-slate-500">Morning opening</p>
              </button>
            </div>
          </div>

          {/* Custom Date & Time */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center">
              <Calendar className="w-3.5 h-3.5 text-[#0078d4] mr-1.5" />
              Custom Date & Time:
            </label>
            <input
              type="datetime-local"
              value={scheduledDateTime}
              onChange={(e) => setScheduledDateTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0078d4]"
            />
          </div>

          {/* Countdown notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start space-x-2">
            <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Automatic Dispatch {calculateTimeDiff()}</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Our background scheduler monitors your queue and automatically sends via Outlook even if you close the browser.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 rounded-lg bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-bold shadow-sm"
          >
            Queue for {new Date(scheduledDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </button>
        </div>

      </div>
    </div>
  );
}
