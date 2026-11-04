import React, { useState, useEffect } from 'react';
import { defaultWeeklyDays, parseWeeklyEmailClient, detectTopicCategory } from '../services/clientEmailService';
import { 
  X, 
  RefreshCw, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  Clipboard, 
  Edit3, 
  AlertCircle, 
  ChevronRight, 
  Clock, 
  Sun,
  FileText
} from 'lucide-react';

export default function WeeklyTaskChartModal({
  isOpen,
  onClose,
  onSelectDayForEOD,
  onScheduleUpdated,
  currentActiveDay = 5,
  initialTab = 'chart'
}) {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab || 'chart'); // 'chart' | 'paste' | 'edit'
  const [pasteText, setPasteText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      fetchWeeklyChart();
    }
  }, [isOpen, initialTab]);

  const fetchWeeklyChart = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/emails/weekly-chart');
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.days) {
          setChartData(data);
          return;
        }
      }
      
      // Fallback: check localStorage for custom pasted schedule first
      let activeDays = defaultWeeklyDays;
      let syncLabel = 'Standard Curriculum & Prasanna Mam Email Format';
      try {
        const stored = localStorage.getItem('mailcraft_weekly_schedule');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            activeDays = parsed;
            syncLabel = 'Saved Custom Schedule (Prasanna Mam)';
          }
        }
      } catch (e) {}

      setChartData({
        success: true,
        sheet: {
          id: 'sheet-fallback',
          title: 'Web Development Weekly Curriculum',
          sender: 'prasanna.gunji@nybinfotech.com',
          recipient: 'nafisa.khanam@nybinfotech.com',
          technology: 'Web Development',
          syncSource: syncLabel,
          totalDays: activeDays.length,
          activeDayNumber: currentActiveDay || 5,
          activeDayName: 'Today',
          updatedAt: new Date().toISOString()
        },
        syncSource: syncLabel,
        days: activeDays
      });
    } catch (err) {
      console.warn('Fetch weekly chart error, using fallback:', err);
      let activeDays = defaultWeeklyDays;
      let syncLabel = 'Standard Curriculum & Prasanna Mam Email Format';
      try {
        const stored = localStorage.getItem('mailcraft_weekly_schedule');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            activeDays = parsed;
            syncLabel = 'Saved Custom Schedule (Prasanna Mam)';
          }
        }
      } catch (e) {}

      setChartData({
        success: true,
        sheet: {
          id: 'sheet-fallback',
          title: 'Web Development Weekly Curriculum',
          sender: 'prasanna.gunji@nybinfotech.com',
          recipient: 'nafisa.khanam@nybinfotech.com',
          technology: 'Web Development',
          syncSource: syncLabel,
          totalDays: activeDays.length,
          activeDayNumber: currentActiveDay || 5,
          activeDayName: 'Today',
          updatedAt: new Date().toISOString()
        },
        syncSource: syncLabel,
        days: activeDays
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncInbox = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/emails/sync-inbox-tasks', { method: 'POST' });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setChartData(data);
          setStatusMessage({
            type: 'success',
            text: `Weekly Tasks Synced: ${data.syncSource || 'Outlook Inbox'}`
          });
          return;
        }
      }
      // If server sync unavailable (e.g. static hosting)
      setChartData({
        success: true,
        sheet: {
          id: 'sheet-offline',
          title: 'Web Development Curriculum (Curated)',
          sender: 'prasanna.gunji@nybinfotech.com',
          recipient: 'nafisa.khanam@nybinfotech.com',
          technology: 'Web Development',
          syncSource: 'Curated by Prasanna Gunji (Offline/Static Mode)',
          totalDays: defaultWeeklyDays.length,
          activeDayNumber: currentActiveDay || 5,
          activeDayName: 'Today',
          updatedAt: new Date().toISOString()
        },
        syncSource: 'Curated by Prasanna Gunji (Offline/Static Mode)',
        days: defaultWeeklyDays
      });
      setStatusMessage({
        type: 'success',
        text: 'Weekly tasks active: Curated from Prasanna Mam (Offline Mode)'
      });
    } catch (err) {
      setChartData({
        success: true,
        sheet: {
          id: 'sheet-offline',
          title: 'Web Development Curriculum (Curated)',
          sender: 'prasanna.gunji@nybinfotech.com',
          recipient: 'nafisa.khanam@nybinfotech.com',
          technology: 'Web Development',
          syncSource: 'Curated by Prasanna Gunji (Offline/Static Mode)',
          totalDays: defaultWeeklyDays.length,
          activeDayNumber: currentActiveDay || 5,
          activeDayName: 'Today',
          updatedAt: new Date().toISOString()
        },
        syncSource: 'Curated by Prasanna Gunji (Offline/Static Mode)',
        days: defaultWeeklyDays
      });
      setStatusMessage({
        type: 'success',
        text: 'Weekly tasks active: Curated from Prasanna Mam (Offline Mode)'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleParsePastedEmail = async () => {
    if (!pasteText.trim()) return;
    setIsParsing(true);
    setStatusMessage(null);
    try {
      // 1. Parse client-side immediately - guarantees zero 404s on Vercel and instant response
      const parsedDays = parseWeeklyEmailClient(pasteText);
      try {
        localStorage.setItem('mailcraft_weekly_schedule', JSON.stringify(parsedDays));
      } catch (e) {}

      // 2. Also attempt backend parse in background if server is present
      fetch('/api/emails/parse-weekly-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailText: pasteText,
          syncSource: 'Pasted Prasanna Mam Email'
        })
      }).catch(() => {});

      const newChartData = {
        success: true,
        sheet: {
          id: `sheet-client-${Date.now()}`,
          title: 'Web Development Weekly Tasks (Updated)',
          sender: 'prasanna.gunji@nybinfotech.com',
          recipient: 'nafisa.khanam@nybinfotech.com',
          technology: 'Web Development',
          syncSource: 'Pasted Prasanna Mam Email',
          totalDays: parsedDays.length,
          activeDayNumber: currentActiveDay || 1,
          activeDayName: 'Today',
          updatedAt: new Date().toISOString()
        },
        syncSource: 'Pasted Prasanna Mam Email',
        days: parsedDays
      };
      setChartData(newChartData);
      setActiveTab('chart');
      setPasteText('');
      setStatusMessage({
        type: 'success',
        text: `Successfully parsed ${parsedDays.length} working days from Prasanna Mam's email!`
      });

      if (typeof onScheduleUpdated === 'function') {
        onScheduleUpdated(parsedDays);
      }
    } catch (err) {
      console.error('Error parsing pasted email:', err);
      setStatusMessage({
        type: 'error',
        text: 'Error parsing email. Please check the text format.'
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleSaveDayEdit = async () => {
    if (!editingDay) return;
    try {
      const res = await fetch(`/api/emails/weekly-day/${editingDay.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicsCovered: editingDay.topicsCovered,
          assignedTasks: editingDay.assignedTasks,
          isHoliday: editingDay.isHoliday,
          holidayReason: editingDay.holidayReason
        })
      });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setChartData(data);
          setEditingDay(null);
          setActiveTab('chart');
          return;
        }
      }
      // Client-side fallback edit
      if (chartData && chartData.days) {
        const updatedDays = chartData.days.map(d => d.id === editingDay.id ? { ...d, ...editingDay } : d);
        setChartData({ ...chartData, days: updatedDays });
      }
      setEditingDay(null);
      setActiveTab('chart');
    } catch (err) {
      if (chartData && chartData.days) {
        const updatedDays = chartData.days.map(d => d.id === editingDay.id ? { ...d, ...editingDay } : d);
        setChartData({ ...chartData, days: updatedDays });
      }
      setEditingDay(null);
      setActiveTab('chart');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[96vw] max-w-7xl max-h-[95vh] h-[92vh] flex flex-col overflow-hidden text-slate-800 font-sans">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0078d4]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  Weekly Assigned Tasks Chart (Web Development)
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0078d4] border border-blue-200">
                  Curated by Prasanna Gunji
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Monitored from <code className="text-[#0078d4] font-medium">prasanna.gunji@nybinfotech.com</code> • Reports to <code className="text-slate-700 font-medium">nafisa.khanam@nybinfotech.com</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Action Navigation Bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setActiveTab('chart')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'chart' ? 'bg-[#0078d4] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              📅 Weekly Schedule Chart
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'paste' ? 'bg-[#0078d4] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              📝 Paste / Update Prasanna Mam's Email
            </button>
          </div>

          <button
            onClick={handleSyncInbox}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-[#0078d4] text-slate-700 hover:text-[#0078d4] font-bold transition-all flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#0078d4]' : ''}`} />
            <span>{isLoading ? 'Scanning Outlook...' : 'Fetch from Real Outlook Inbox'}</span>
          </button>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div className={`px-6 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b ${
            statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* TAB 1: VISUAL WEEKLY SCHEDULE CHART */}
          {activeTab === 'chart' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>
                  Showing all working days for active curriculum. Click <strong>"Use for Today's EOD"</strong> to instantly populate table.
                </span>
                <span className="font-semibold text-slate-700">
                  Sync Source: {chartData?.sheet?.syncSource || 'Active Curriculum'}
                </span>
              </div>

              {/* Guidance Notice Banner explaining browser sandbox */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-950">
                    Why isn't my real Chrome Outlook data syncing automatically?
                  </p>
                  <p className="text-[11px] leading-relaxed text-amber-900">
                    For your security, web browsers prohibit any website on localhost from silently reading emails inside your other Chrome tabs. To get <strong>Prasanna Ma'am's exact 10-15 lines</strong> without default data, click <strong>"📝 Paste / Update Prasanna Mam's Email"</strong> above, or enter your Outlook App Password via the Connect button.
                  </p>
                </div>
              </div>

              {/* Day Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {chartData?.days?.map((day) => {
                  const isCurrent = day?.dayNumber === (chartData?.sheet?.activeDayNumber || currentActiveDay || 5);
                  const topics = Array.isArray(day?.topicsCovered) ? day.topicsCovered : [];
                  const tasks = Array.isArray(day?.assignedTasks) ? day.assignedTasks : [];
                  const topicCat = day?.topicCategory || detectTopicCategory(topics);
                  return (
                    <div
                      key={day?.id || `day-${day?.dayNumber}`}
                      className={`rounded-xl border p-4 transition-all flex flex-col justify-between ${
                        isCurrent 
                          ? 'border-[#0078d4] bg-blue-50/40 ring-2 ring-[#0078d4]/20 shadow-md' 
                          : day?.isHoliday 
                          ? 'border-amber-300 bg-amber-50/50' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        {/* Day Header & Status */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-sm text-slate-900">
                              Day {day?.dayNumber} ({day?.dayName || `Day ${day?.dayNumber}`})
                            </span>
                          </div>
                          {day?.isHoliday ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              🏖️ Holiday
                            </span>
                          ) : isCurrent ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0078d4] text-white">
                              ⭐ Today
                            </span>
                          ) : day?.status === 'completed' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                              ✓ Completed
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                              Upcoming
                            </span>
                          )}
                        </div>

                        {day?.isHoliday ? (
                          <div className="py-6 text-center text-xs text-amber-800">
                            <Sun className="w-6 h-6 mx-auto mb-1 text-amber-600" />
                            <p className="font-bold">{day?.holidayReason || 'Public / Company Holiday'}</p>
                            <p className="text-[11px] text-amber-700 mt-1">No tasks assigned for this day</p>
                          </div>
                        ) : (
                          <div className="space-y-3 text-xs">
                            {/* Topics Covered (1. Dynamic Category) */}
                            <div>
                              <p className="font-bold text-slate-900 mb-1 text-[11px] flex items-center justify-between">
                                <span>1. {topicCat} (Topics Covered):</span>
                                <span className="font-semibold text-[#0078d4]">{topics.length} lines</span>
                              </p>
                              <ul className="list-disc pl-4 space-y-1.5 text-slate-700 text-[11px]">
                                {topics.map((t, idx) => (
                                  <li key={idx} className="leading-relaxed break-words">{t}</li>
                                ))}
                              </ul>
                            </div>

                            {/* Assigned Tasks (2. Tasks) */}
                            <div>
                              <p className="font-bold text-slate-900 mb-1 text-[11px] flex items-center justify-between">
                                <span>2. Tasks (Assigned Tasks):</span>
                                <span className="font-semibold text-emerald-700">{tasks.length} lines</span>
                              </p>
                              <ul className="list-disc pl-4 space-y-1.5 text-slate-700 text-[11px]">
                                {tasks.map((t, idx) => (
                                  <li key={idx} className="leading-relaxed break-words">{t}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="pt-3 mt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            setEditingDay({ ...day });
                            setActiveTab('edit');
                          }}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center space-x-1 transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => {
                            onSelectDayForEOD(day, chartData?.days || []);
                            onClose();
                          }}
                          className={`px-3 py-1 rounded text-[11px] font-bold flex items-center space-x-1 transition-all ${
                            isCurrent
                              ? 'bg-[#0078d4] text-white hover:bg-[#106ebe] shadow-sm'
                              : 'bg-blue-50 text-[#0078d4] hover:bg-blue-100'
                          }`}
                        >
                          <span>Use for Today's EOD</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PASTE / UPDATE PRASANNA MAM'S EMAIL */}
          {activeTab === 'paste' && (
            <div className="space-y-4 w-full">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center">
                  <Clipboard className="w-4 h-4 text-[#0078d4] mr-2" />
                  Paste Weekly Assigned Tasks Email from Prasanna Mam
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Copy the full email text received from Prasanna Gunji in your Chrome Outlook and paste it here. Our parser automatically extracts all working days, React topics, assigned tasks, and holidays.
                  <span className="text-[#0078d4] font-semibold ml-1">
                    (Note: Mini assessments / mini tasks are automatically excluded from planned tasks).
                  </span>
                </p>
              </div>

              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={16}
                placeholder={`Example email format:\n\nDay 1 (Monday):\nTopics Covered:\n- Advanced State Management\n- Redux Toolkit setup\nAssigned Tasks:\n- Setup Redux slices\n- Connect UI components\n\nDay 2 (Tuesday):\nHoliday - Festival\n\nDay 3 (Wednesday):\n...`}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] resize-none leading-relaxed min-h-[360px]"
              />

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('chart')}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleParsePastedEmail}
                  disabled={isParsing || !pasteText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  {isParsing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{isParsing ? 'Parsing Email...' : 'Parse & Update Weekly Chart'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: EDIT DAY MODAL */}
          {activeTab === 'edit' && editingDay && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h4 className="text-sm font-bold text-slate-900">
                  Editing Day {editingDay.dayNumber} ({editingDay.dayName})
                </h4>
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingDay.isHoliday}
                      onChange={(e) => setEditingDay(prev => ({ ...prev, isHoliday: e.target.checked }))}
                      className="rounded border-slate-300 text-[#0078d4] focus:ring-[#0078d4]"
                    />
                    <span>Mark as Holiday</span>
                  </label>
                </div>
              </div>

              {editingDay.isHoliday ? (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Holiday Reason / Festival Name:
                  </label>
                  <input
                    type="text"
                    value={editingDay.holidayReason}
                    onChange={(e) => setEditingDay(prev => ({ ...prev, holidayReason: e.target.value }))}
                    placeholder="e.g. Gandhi Jayanti / Dussehra Holiday"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0078d4]"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Topics Covered (React) */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      1. React: Topics Covered (1 item per line - As-is from Prasanna Mam):
                    </label>
                    <textarea
                      rows={5}
                      value={(Array.isArray(editingDay.topicsCovered) ? editingDay.topicsCovered : []).join('\n')}
                      onChange={(e) => setEditingDay(prev => ({
                        ...prev,
                        topicsCovered: e.target.value.split('\n').map(l => l.trim()).filter(Boolean)
                      }))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-[#0078d4]"
                    />
                  </div>

                  {/* Assigned Tasks */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      2. Tasks: Assigned Tasks (1 item per line - As-is from Prasanna Mam):
                    </label>
                    <textarea
                      rows={5}
                      value={(Array.isArray(editingDay.assignedTasks) ? editingDay.assignedTasks : []).join('\n')}
                      onChange={(e) => setEditingDay(prev => ({
                        ...prev,
                        assignedTasks: e.target.value.split('\n').map(l => l.trim()).filter(Boolean)
                      }))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-[#0078d4]"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('chart')}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveDayEdit}
                  className="px-5 py-2.5 rounded-xl bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-bold shadow-sm"
                >
                  Save Day Changes
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Logged in as <strong>Syed Mahammad Althaf</strong> (Associate software Engineer • Web Development)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors text-xs"
          >
            Close Chart
          </button>
        </div>

      </div>
    </div>
  );
}
