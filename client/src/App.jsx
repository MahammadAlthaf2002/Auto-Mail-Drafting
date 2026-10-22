import React, { useState, useEffect } from 'react';
import SimpleNavbar from './components/SimpleNavbar';
import ConnectOutlookModal from './components/ConnectOutlookModal';
import RecipientTickSelector from './components/RecipientTickSelector';
import ScheduleModal from './components/ScheduleModal';
import ScheduledQueueModal from './components/ScheduledQueueModal';
import EODTablePreview from './components/EODTablePreview';
import WeeklyTaskChartModal from './components/WeeklyTaskChartModal';
import OutlookHelperModal from './components/OutlookHelperModal';
import { 
  Sparkles, 
  Send, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Paperclip, 
  X, 
  RefreshCw, 
  Globe, 
  Trash2, 
  Calendar, 
  Briefcase, 
  Plane, 
  CheckSquare, 
  Key, 
  Inbox,
  BarChart2,
  Download
} from 'lucide-react';

export default function App() {
  // App Data States
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [presetGroups, setPresetGroups] = useState([]);
  const [mailboxData, setMailboxData] = useState({ drafts: [], sent: [], scheduled: [], stats: {} });

  // Email Composer States
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [isEODTable, setIsEODTable] = useState(false);
  const [scheduleData, setScheduleData] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [isSyncingInbox, setIsSyncingInbox] = useState(false);
  const [selectedTo, setSelectedTo] = useState([]);
  const [selectedCc, setSelectedCc] = useState([]);
  const [attachments, setAttachments] = useState([]);

  // Loading States
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Modals
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduledQueueOpen, setScheduledQueueOpen] = useState(false);
  const [weeklyChartModalOpen, setWeeklyChartModalOpen] = useState(false);
  const [outlookHelperOpen, setOutlookHelperOpen] = useState(false);
  const [webOutlookUrl, setWebOutlookUrl] = useState('');

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success', subtitle = null) => {
    setToast({ message, type, subtitle });
    setTimeout(() => setToast(null), 7000);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async (userId = null) => {
    try {
      const headers = userId ? { 'x-user-id': userId } : {};

      const userRes = await fetch('/api/auth/me', { headers });
      const userData = await userRes.json();
      if (userData.success) setCurrentUser(userData.user);

      const allUsersRes = await fetch('/api/auth/users');
      const allUsersData = await allUsersRes.json();
      if (allUsersData.success) setAllUsers(allUsersData.users);

      const contactsRes = await fetch('/api/contacts');
      const contactsData = await contactsRes.json();
      if (contactsData.success) setAllContacts(contactsData.contacts);

      const groupsRes = await fetch('/api/contacts/groups');
      const groupsData = await groupsRes.json();
      if (groupsData.success) setPresetGroups(groupsData.groups);

      const mailboxRes = await fetch('/api/emails/mailbox', { headers });
      const mailboxOverview = await mailboxRes.json();
      if (mailboxOverview.success) setMailboxData(mailboxOverview);
    } catch (err) {
      console.error('Initial data fetch error:', err);
    }
  };

  // AI Generation from Prompt
  const handleGenerate = async (customPrompt = null) => {
    const activePrompt = customPrompt || prompt;
    if (!activePrompt.trim()) {
      showToast('Please type your notes or prompt first', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || 'usr-althaf'
        },
        body: JSON.stringify({
          prompt: activePrompt,
          tone,
          attachments
        })
      });

      const data = await res.json();
      if (data.success && data.draft) {
        setSubject(data.draft.subject);
        setBody(data.draft.body);
        setHtmlBody(data.draft.htmlBody || '');
        setIsEODTable(Boolean(data.draft.isEODTable));
        setScheduleData(data.draft.scheduleData || null);
        if (data.draft.isEODTable) setViewMode('table');
        if (data.draft.suggestedTo?.length > 0) setSelectedTo(data.draft.suggestedTo);
        if (data.draft.suggestedCc?.length > 0) setSelectedCc(data.draft.suggestedCc);

        showToast(
          data.draft.isEODTable ? 'Daily EOD Task Table Generated!' : 'Email draft generated!',
          'success',
          data.draft.isEODTable 
            ? 'Populated 5 React points & 5 Task points for Web Development. Auto-addressed to Prasanna Gunji & Nafisa Khanam Pathan.'
            : `Auto-filled subject, body, and selected ${data.draft.suggestedTo.length} TO and ${data.draft.suggestedCc.length} CC recipients.`
        );
      } else {
        showToast(data.error || 'Failed to generate email', 'error');
      }
    } catch (err) {
      showToast('Error communicating with AI assistant', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // 1-Click Quick Actions
  const handleQuickCategory = (type) => {
    if (type === 'leave') {
      const leavePrompt = 'I would like to apply for leave for tomorrow due to personal issue. Please grant me leave for one day.';
      setPrompt(leavePrompt);
      handleGenerate(leavePrompt);
    } else if (type === 'eod') {
      const eodPrompt = 'Draft Daily Evening EOD Task Summary for Prasanna Gunji and Nafisa Khanam Pathan with Web Development React and Tasks table';
      setPrompt(eodPrompt);
      handleGenerate(eodPrompt);
    } else if (type === 'project') {
      const projPrompt = 'Draft project recommendation: proposed architectural performance upgrades to reduce API latency and enhance staging reliability for Q4.';
      setPrompt(projPrompt);
      handleGenerate(projPrompt);
    } else if (type === 'qa') {
      const qaPrompt = 'Draft sprint release: staging candidate build v2.4 deployed for regression tests. Sign-off requested by noon tomorrow.';
      setPrompt(qaPrompt);
      handleGenerate(qaPrompt);
    }
  };

  // Scan real Outlook inbox for weekly email from Prasanna Gunji
  const handleSyncInbox = async () => {
    setIsSyncingInbox(true);
    try {
      const res = await fetch('/api/emails/sync-inbox-tasks', {
        method: 'POST',
        headers: { 'x-user-id': currentUser?.id || 'usr-althaf' }
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          `Weekly Tasks Synced: ${data.sheet?.title || data.dayActive}!`,
          'success',
          `Curriculum loaded from ${data.syncSource}. Today's topics and tasks ready for EOD.`
        );
        handleQuickCategory('eod');
      } else {
        showToast(data.error || 'Could not sync inbox tasks', 'error');
      }
    } catch (err) {
      showToast('Error communicating with inbox sync service', 'error');
    } finally {
      setIsSyncingInbox(false);
    }
  };

  // Select a specific day (Day 1..5) from the Weekly Chart for EOD table
  const handleSelectDayForEOD = async (dayNumber) => {
    try {
      const res = await fetch('/api/emails/set-active-eod-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayNumber })
      });
      const data = await res.json();
      if (data.success && data.schedule) {
        setScheduleData(data.schedule);
        setHtmlBody(data.htmlTable);
        if (data.body) setBody(data.body);
        setIsEODTable(true);
        setViewMode('table');

        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        setSubject(`Daily Status Report [${dd}-${mm}-${yyyy}]`);

        // Fetch text format for plain text editor fallback
        const textRes = await fetch(`/api/emails/eod-schedule?day=${dayNumber}`);
        const textData = await textRes.json();
        if (!data.body && textData?.body) setBody(textData.body);

        // Auto select Prasanna Gunji & Nafisa Khanam Pathan in TO
        const prasanna = allContacts.find(c => c.email.includes('prasanna'));
        const nafisa = allContacts.find(c => c.email.includes('nafisa'));
        const toRecipients = [];
        if (prasanna) toRecipients.push(prasanna);
        if (nafisa) toRecipients.push(nafisa);
        if (toRecipients.length > 0) setSelectedTo(toRecipients);

        showToast(
          `Loaded Day ${dayNumber} (${data.schedule.dayName}) for EOD!`,
          'success',
          `Planned: ${data.schedule.plannedToday.react.length} React & ${data.schedule.plannedToday.tasks.length} Tasks. Completed: 5 points.`
        );
      }
    } catch (err) {
      showToast('Error setting active day for EOD', 'error');
    }
  };

  // Action 1: Save to Real Outlook Draft
  const handleSaveDraft = async () => {
    if (!subject && !body) {
      showToast('Please generate or enter email content first', 'error');
      return;
    }

    setIsSavingDraft(true);
    try {
      const res = await fetch('/api/emails/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || 'usr-althaf'
        },
        body: JSON.stringify({
          subject,
          body,
          htmlBody: htmlBody || null,
          toRecipients: selectedTo,
          ccRecipients: selectedCc,
          attachments
        })
      });

      const data = await res.json();
      if (data.success) {
        if (data.result.realDraftCreated) {
          showToast(
            'Saved into your Real Outlook Drafts!',
            'success',
            'Synchronized directly to your Outlook account. Open your Outlook app or web to see it in your Drafts folder!'
          );
        } else {
          showToast(
            'Draft saved in MailCraft',
            'info',
            'To synchronize directly into your real Outlook Drafts folder, connect your Outlook account via the "Connect Real Outlook" button above.'
          );
        }
        refreshMailbox();
      } else {
        showToast(data.error || 'Failed to save draft', 'error');
      }
    } catch (err) {
      showToast('Error saving draft to Outlook', 'error');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Action 2: Schedule Timer (e.g. 6:30 PM)
  const handleScheduleConfirm = async (scheduledTime) => {
    if (selectedTo.length === 0) {
      showToast('Please select at least one TO recipient using tick marks', 'error');
      return;
    }

    try {
      const res = await fetch('/api/emails/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || 'usr-althaf'
        },
        body: JSON.stringify({
          subject,
          body,
          htmlBody: htmlBody || null,
          toRecipients: selectedTo,
          ccRecipients: selectedCc,
          attachments,
          scheduledTime
        })
      });

      const data = await res.json();
      if (data.success) {
        const timeStr = new Date(scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        showToast(
          `Email scheduled for ${timeStr}!`,
          'success',
          `Our background timer will automatically dispatch it via Outlook at ${timeStr} even if you are offline.`
        );
        refreshMailbox();
      } else {
        showToast(data.error || 'Failed to schedule email', 'error');
      }
    } catch (err) {
      showToast('Error scheduling email', 'error');
    }
  };

  // Action 3: Send Directly via Outlook Now
  const handleSendDirect = async () => {
    if (selectedTo.length === 0) {
      showToast('Please select at least one TO recipient using tick marks', 'error');
      return;
    }
    if (!subject) {
      showToast('Please enter an email subject line', 'error');
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || 'usr-althaf'
        },
        body: JSON.stringify({
          subject,
          body,
          htmlBody: htmlBody || null,
          toRecipients: selectedTo,
          ccRecipients: selectedCc,
          attachments
        })
      });

      const data = await res.json();
      if (data.success) {
        if (data.result.realEmailSent) {
          showToast(
            `Email delivered to real inboxes from ${data.result.from}!`,
            'success',
            `Dispatched via ${data.result.deliveryMethod} to ${data.result.deliveredToCount} recipients.`
          );
        } else {
          showToast(
            `Email processed in MailCraft`,
            'info',
            'To send directly to real mailboxes, enter your Outlook credentials using the "Log In with OTP" button above.'
          );
        }
        refreshMailbox();
        handleClearAll();
      } else {
        showToast(data.error || 'Failed to send email via Outlook', 'error');
      }
    } catch (err) {
      showToast('Error sending email via Outlook', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Action 4: Open Directly in Chrome Outlook Web Tab (with Auto-Copy & Helper Guide)
  const handleOpenInChromeOutlook = async () => {
    // 1. Immediately copy rich formatted HTML table to system clipboard
    try {
      const container = document.getElementById('eod-table-container');
      const richHtml = container ? container.innerHTML : htmlBody;
      const plainText = container ? container.innerText : body;

      if (richHtml && navigator.clipboard && window.ClipboardItem) {
        const htmlBlob = new Blob([richHtml], { type: 'text/html' });
        const textBlob = new Blob([plainText || ''], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': textBlob
          })
        ]);
      } else if (plainText && navigator.clipboard) {
        await navigator.clipboard.writeText(plainText);
      }
    } catch (clipErr) {
      console.warn('Clipboard write error:', clipErr);
    }

    // 2. Open Outlook Deeplink & Trigger Guidance Modal
    try {
      const res = await fetch('/api/emails/web-outlook-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || 'usr-althaf'
        },
        body: JSON.stringify({
          toRecipients: selectedTo,
          ccRecipients: selectedCc,
          subject,
          body
        })
      });

      const data = await res.json();
      if (data.success && data.url) {
        setWebOutlookUrl(data.url);
        window.open(data.url, '_blank');
        setOutlookHelperOpen(true);
        showToast('Draft opened in Chrome Outlook! Press Ctrl+V in Outlook to paste table.', 'success');
      }
    } catch (err) {
      showToast('Could not open Chrome Outlook tab', 'error');
    }
  };

  // Action 5: Download / Open Native Outlook Draft (.eml with Rich HTML Table)
  const handleDownloadEmlDraft = async () => {
    try {
      const container = document.getElementById('eod-table-container');
      const richHtml = container ? container.innerHTML : htmlBody;

      const res = await fetch('/api/emails/download-draft-eml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toRecipients: selectedTo,
          ccRecipients: selectedCc,
          subject,
          body,
          htmlBody: richHtml
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
        showToast('Downloaded Outlook .eml draft! Opens directly in Outlook with the table rendered.', 'success');
      } else {
        showToast('Failed to generate Outlook draft', 'error');
      }
    } catch (err) {
      showToast('Error downloading Outlook draft', 'error');
    }
  };

  const handleFileUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/attachments/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.success && data.attachment) {
          setAttachments(prev => [...prev, data.attachment]);
          showToast(`Attached file: ${data.attachment.original_name}`, 'info');
        }
      } catch (err) {
        showToast('Error uploading attachment', 'error');
      }
    }
  };

  const handleClearAll = () => {
    setPrompt('');
    setSubject('');
    setBody('');
    setHtmlBody('');
    setIsEODTable(false);
    setScheduleData(null);
    setSelectedTo([]);
    setSelectedCc([]);
    setAttachments([]);
  };

  const refreshMailbox = async () => {
    try {
      const res = await fetch('/api/emails/mailbox', {
        headers: { 'x-user-id': currentUser?.id || 'usr-althaf' }
      });
      const data = await res.json();
      if (data.success) setMailboxData(data);
    } catch (err) {
      console.error('Mailbox refresh error:', err);
    }
  };

  const isConnected = Boolean(currentUser?.outlook_connected && currentUser?.outlook_email);

  return (
    <div className="min-h-screen bg-[#f3f2f1] text-[#201f1e] flex flex-col font-sans selection:bg-[#0078d4] selection:text-white">
      
      {/* 1. Authentic Microsoft 365 Outlook Blue Navbar */}
      <SimpleNavbar
        currentUser={currentUser}
        allUsers={allUsers}
        onSwitchUser={fetchInitialData}
        onOpenConnectModal={() => setConnectModalOpen(true)}
        onOpenScheduled={() => setScheduledQueueOpen(true)}
        scheduledCount={mailboxData?.stats?.scheduledCount || 0}
      />

      {/* Main Workspace with White Outlook Cards */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        
        {/* Real Outlook Login Guidance Banner if not connected */}
        {!isConnected && (
          <div className="p-4 rounded-xl bg-white border border-blue-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#0078d4] flex items-center justify-center flex-shrink-0 border border-blue-100">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Real Outlook Account Not Connected</p>
                <p className="text-slate-600">
                  Connect your real Outlook account via Microsoft 365 Sign-In (no password needed) or OTP to save drafts and send emails directly.
                </p>
              </div>
            </div>
            <button
              onClick={() => setConnectModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#0078d4] hover:bg-[#106ebe] text-white font-bold whitespace-nowrap shadow-sm transition-colors text-xs"
            >
              Connect Real Outlook
            </button>
          </div>
        )}

        {/* Step 1: AI Prompt & 1-Click Category Buttons */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0078d4] border border-blue-200">
                Step 1
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center">
                  <Sparkles className="w-4 h-4 text-[#0078d4] mr-2" />
                  What do you want to email? (AI Assist)
                </h2>
                <p className="text-xs text-slate-500">Pick a 1-click corporate action or type your notes</p>
              </div>
            </div>

            {/* Clean Tone Selector */}
            <div className="flex items-center space-x-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 px-2 font-medium">Tone:</span>
              {['professional', 'concise', 'executive'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    tone === t ? 'bg-[#0078d4] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 1-Click Corporate Actions: Leave, EOD, Project, QA */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleQuickCategory('leave')}
              className="p-3.5 rounded-xl bg-gradient-to-br from-blue-50/70 to-white hover:from-blue-100/70 border border-slate-200 hover:border-[#0078d4]/40 text-left transition-all duration-200 group shadow-xs hover:shadow-sm"
            >
              <div className="flex items-center space-x-2 text-[#0078d4] mb-1">
                <div className="w-6 h-6 rounded-lg bg-blue-100/80 flex items-center justify-center text-[#0078d4] group-hover:scale-105 transition-transform">
                  <Plane className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-xs text-slate-900 group-hover:text-[#0078d4]">Apply for Leave</span>
              </div>
              <p className="text-[11px] text-slate-500 pl-8">1-Day Tomorrow / Custom</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickCategory('eod')}
              className="p-3.5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/40 hover:from-amber-100/80 border-2 border-amber-400 text-left transition-all duration-200 group shadow-sm ring-2 ring-amber-400/20"
            >
              <div className="flex items-center space-x-2 text-amber-700 mb-1">
                <div className="w-6 h-6 rounded-lg bg-amber-200/80 flex items-center justify-center text-amber-800 group-hover:scale-105 transition-transform">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-xs text-slate-900 group-hover:text-amber-900">Daily Evening EOD</span>
              </div>
              <p className="text-[11px] font-semibold text-amber-800 pl-8">Web Dev 2-Column Table</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickCategory('project')}
              className="p-3.5 rounded-xl bg-gradient-to-br from-purple-50/70 to-white hover:from-purple-100/70 border border-slate-200 hover:border-purple-300 text-left transition-all duration-200 group shadow-xs hover:shadow-sm"
            >
              <div className="flex items-center space-x-2 text-purple-600 mb-1">
                <div className="w-6 h-6 rounded-lg bg-purple-100/80 flex items-center justify-center text-purple-700 group-hover:scale-105 transition-transform">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-xs text-slate-900 group-hover:text-purple-700">Project Proposal</span>
              </div>
              <p className="text-[11px] text-slate-500 pl-8">Stakeholder Updates</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickCategory('qa')}
              className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50/70 to-white hover:from-emerald-100/70 border border-slate-200 hover:border-emerald-300 text-left transition-all duration-200 group shadow-xs hover:shadow-sm"
            >
              <div className="flex items-center space-x-2 text-emerald-600 mb-1">
                <div className="w-6 h-6 rounded-lg bg-emerald-100/80 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform">
                  <CheckSquare className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-700">Sprint QA Sign-Off</span>
              </div>
              <p className="text-[11px] text-slate-500 pl-8">Auto-selects QA Squad</p>
            </button>
          </div>

          {/* Prasanna Mam Weekly Inbox Tasks Sync Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-sky-50/90 border border-blue-200/90 text-xs gap-3 shadow-xs">
            <div className="flex items-center space-x-3 text-slate-800">
              <div className="w-9 h-9 rounded-xl bg-[#0078d4]/10 border border-[#0078d4]/20 flex items-center justify-center text-[#0078d4] flex-shrink-0 shadow-xs">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-bold text-slate-900 text-sm">Prasanna Mam's Weekly Tasks</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0078d4] border border-blue-200">Web Dev Curriculum</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Topics Covered & Assigned Tasks for Days 1–5 (with automated holiday detection)
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setWeeklyChartModalOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-white border border-[#0078d4] hover:bg-blue-50 text-[#0078d4] font-bold text-xs transition-colors flex items-center space-x-1.5 shadow-xs"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>📊 View Weekly Chart</span>
              </button>
              <button
                type="button"
                onClick={() => setWeeklyChartModalOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-white border border-emerald-500 hover:bg-emerald-50 text-emerald-700 font-bold text-xs transition-colors flex items-center space-x-1.5 shadow-xs"
              >
                <span>📝 Paste Real Email</span>
              </button>
              <button
                type="button"
                onClick={handleSyncInbox}
                disabled={isSyncingInbox}
                className="px-3.5 py-2 rounded-lg bg-[#0078d4] hover:bg-[#106ebe] text-white font-bold text-xs transition-colors flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingInbox ? 'animate-spin' : ''}`} />
                <span>{isSyncingInbox ? 'Scanning...' : 'Sync Outlook'}</span>
              </button>
            </div>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="e.g. Apply for leave tomorrow due to personal issue... OR generate Daily Evening EOD table for Day 5"
            className="w-full bg-slate-50/70 border border-slate-300/80 focus:bg-white focus:border-[#0078d4] focus:ring-2 focus:ring-[#0078d4]/20 rounded-xl p-4 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none resize-none leading-relaxed transition-all shadow-xs"
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={isGenerating || !prompt.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50 active:scale-[0.98]"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isGenerating ? 'AI Crafting Draft...' : 'Generate Email with AI'}</span>
            </button>
          </div>
        </section>

        {/* Step 2: Recipient Selection with Tick Marks */}
        <section>
          <RecipientTickSelector
            allContacts={allContacts}
            presetGroups={presetGroups}
            selectedTo={selectedTo}
            selectedCc={selectedCc}
            onUpdateTo={setSelectedTo}
            onUpdateCc={setSelectedCc}
          />
        </section>

        {/* Step 3: Review, Edit & The 3 Action Buttons */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Step 3
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center">
                  <FileText className="w-4 h-4 text-[#0078d4] mr-2" />
                  Review Email Content & Dispatch
                </h2>
                <p className="text-xs text-slate-500">Review or edit the auto-generated subject and content before dispatch</p>
              </div>
            </div>

            {/* View Mode Toggle when EOD Table is active */}
            {isEODTable && (
              <div className="flex items-center space-x-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'table' ? 'bg-[#0078d4] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📋 Formatted Table View
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('text')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'text' ? 'bg-[#0078d4] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📝 Plain Text Editor
                </button>
              </div>
            )}
          </div>

          {/* Subject Line Input */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Subject Line:
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject (auto-generated by AI based on prompt)..."
              className="w-full bg-slate-50/70 border border-slate-300/80 focus:bg-white focus:border-[#0078d4] focus:ring-2 focus:ring-[#0078d4]/20 rounded-xl px-4 py-3 text-base font-semibold text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-xs"
            />
          </div>

          {/* If EOD Table and Table View is selected, show Table Preview */}
          {isEODTable && viewMode === 'table' ? (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                EOD Task Summary Table (Screenshots Matching 2-Column Corporate Format):
              </label>
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <EODTablePreview scheduleData={scheduleData} user={currentUser} />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Email Body:
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                placeholder="Email content will appear here after clicking 'Generate Email with AI'. You can edit directly..."
                className="w-full bg-slate-50/70 border border-slate-300/80 focus:bg-white focus:border-[#0078d4] focus:ring-2 focus:ring-[#0078d4]/20 rounded-xl p-4 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none resize-none font-sans leading-relaxed transition-all shadow-xs"
              />
            </div>
          )}

          {/* Attachments & Clear Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200">
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-semibold text-slate-700 flex items-center space-x-1.5 transition-colors shadow-xs">
                <Paperclip className="w-3.5 h-3.5 text-[#0078d4]" />
                <span>Attach File</span>
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>

              {attachments.map(att => (
                <div key={att.id} className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-800">
                  <span className="truncate max-w-[120px]">{att.original_name}</span>
                  <button onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))} className="text-slate-400 hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-medium text-slate-500 hover:text-red-600 transition-colors flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Everything</span>
            </button>
          </div>

          {/* The 5 Core Dispatch Actions */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            
            {/* Option 1: Save to Real Outlook Draft */}
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSavingDraft || (!subject && !body)}
              className="w-full flex items-center justify-center space-x-2 px-3 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800 transition-all shadow-xs hover:shadow-sm disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-[#0078d4]" />
              <span>{isSavingDraft ? 'Saving Draft...' : '1. Add to Draft'}</span>
            </button>

            {/* Option 2: Schedule Timer (6:30 PM) */}
            <button
              type="button"
              onClick={() => setScheduleModalOpen(true)}
              disabled={selectedTo.length === 0}
              className="w-full flex items-center justify-center space-x-2 px-3 py-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs font-bold text-amber-950 transition-all shadow-xs hover:shadow-sm disabled:opacity-50"
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>2. Schedule at 6:30 PM</span>
            </button>

            {/* Option 3: Send Directly via Outlook */}
            <button
              type="button"
              onClick={handleSendDirect}
              disabled={isSending || selectedTo.length === 0}
              className="w-full flex items-center justify-center space-x-2 px-3 py-3 rounded-xl bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'Sending via Outlook...' : '3. Send Now'}</span>
            </button>

            {/* Option 4: Open in Chrome Outlook Web */}
            <button
              type="button"
              onClick={handleOpenInChromeOutlook}
              className="w-full flex items-center justify-center space-x-2 px-3 py-3 rounded-xl bg-blue-50/80 hover:bg-blue-100 border-2 border-[#0078d4] text-xs font-bold text-[#0078d4] transition-all shadow-xs hover:shadow-sm"
              title="Open directly in Chrome Outlook and copy table to clipboard for Ctrl+V"
            >
              <Globe className="w-4 h-4 text-[#0078d4]" />
              <span>4. Open Chrome Outlook</span>
            </button>

            {/* Option 5: Open in Native Outlook App (.eml draft with HTML table) */}
            <button
              type="button"
              onClick={handleDownloadEmlDraft}
              className="w-full flex items-center justify-center space-x-2 px-3 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-400 text-xs font-bold text-emerald-900 transition-all shadow-xs hover:shadow-sm"
              title="Opens natively in Microsoft Outlook with the exact HTML table already rendered inside the email!"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>5. Open in Outlook (.eml)</span>
            </button>

          </div>

        </section>

      </main>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-200">
          <div className={`p-4 rounded-xl shadow-2xl border flex items-start space-x-3 bg-white ${
            toast.type === 'success' ? 'border-emerald-300 text-emerald-900' :
            toast.type === 'error' ? 'border-red-300 text-red-900' :
            'border-blue-300 text-blue-900'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Globe className="w-5 h-5 text-[#0078d4] flex-shrink-0 mt-0.5" />}

            <div className="flex-1 pr-2">
              <p className="text-xs font-bold text-slate-900">{toast.message}</p>
              {toast.subtitle && <p className="text-[11px] text-slate-600 mt-0.5">{toast.subtitle}</p>}
            </div>

            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ConnectOutlookModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        currentUser={currentUser}
        onSaveCredentials={(user) => {
          setCurrentUser(user);
          showToast(`Logged in to Real Outlook as ${user.outlook_email}`, 'success');
        }}
        onDisconnect={async () => {
          await fetch('/api/auth/disconnect-outlook', {
            method: 'POST',
            headers: { 'x-user-id': currentUser?.id || 'usr-althaf' }
          });
          fetchInitialData();
          setConnectModalOpen(false);
          showToast('Outlook account logged out', 'info');
        }}
      />

      <ScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onScheduleConfirm={handleScheduleConfirm}
        currentSubject={subject}
        toCount={selectedTo.length}
        ccCount={selectedCc.length}
      />

      <ScheduledQueueModal
        isOpen={scheduledQueueOpen}
        onClose={() => setScheduledQueueOpen(false)}
        scheduledEmails={mailboxData?.scheduled || []}
        onCancelScheduled={async (id) => {
          await fetch(`/api/emails/scheduled/${id}`, {
            method: 'DELETE',
            headers: { 'x-user-id': currentUser?.id || 'usr-althaf' }
          });
          refreshMailbox();
          showToast('Scheduled email cancelled', 'info');
        }}
        onSendNow={async (id) => {
          await fetch(`/api/emails/scheduled/${id}/send-now`, {
            method: 'POST',
            headers: { 'x-user-id': currentUser?.id || 'usr-althaf' }
          });
          refreshMailbox();
          showToast('Scheduled email dispatched immediately!', 'success');
        }}
        onRefresh={refreshMailbox}
      />

      {/* Weekly Task Schedule Chart & Prasanna Mam Email Hub */}
      <WeeklyTaskChartModal
        isOpen={weeklyChartModalOpen}
        onClose={() => setWeeklyChartModalOpen(false)}
        onSelectDayForEOD={handleSelectDayForEOD}
        currentActiveDay={scheduleData?.dayNumber || 5}
      />

      {/* Chrome Outlook Helper Guidance Modal */}
      <OutlookHelperModal
        isOpen={outlookHelperOpen}
        onClose={() => setOutlookHelperOpen(false)}
        subject={subject}
        toRecipients={selectedTo}
        ccRecipients={selectedCc}
        htmlContent={htmlBody}
        plainTextContent={body}
        webOutlookUrl={webOutlookUrl}
      />

    </div>
  );
}
