import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Settings, 
  UserCheck, 
  ChevronDown, 
  ShieldCheck, 
  Layers,
  Sparkles,
  Inbox
} from 'lucide-react';

export default function Navbar({ 
  currentUser, 
  allUsers, 
  onSwitchUser, 
  stats, 
  onOpenMailbox, 
  onOpenScheduled, 
  onOpenTemplates, 
  onOpenSettings,
  activeTab,
  setActiveTab
}) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Outlook Connector Status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('composer')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">MailCraft <span className="text-sky-400">AI</span></span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-sky-400 border border-blue-500/30">
                  Outlook Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">AI Email Assistant & Scheduled Dispatch</p>
            </div>
          </div>

          {/* Microsoft 365 Connected Badge */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Outlook 365 Sync Active</span>
          </div>
        </div>

        {/* Central Navigation Tabs & Quick Counters */}
        <div className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('composer')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'composer' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Composer</span>
          </button>

          <button
            onClick={onOpenMailbox}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Outlook Mailbox</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
              {(stats?.draftCount || 0) + (stats?.sentCount || 0)}
            </span>
          </button>

          <button
            onClick={onOpenScheduled}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all relative"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Scheduled Queue</span>
            {stats?.scheduledCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono animate-pulse">
                {stats.scheduledCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenTemplates}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Templates</span>
          </button>
        </div>

        {/* User Account & Login Switcher */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all"
            >
              <img 
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
                alt={currentUser?.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-blue-500/40" 
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-200 leading-tight">{currentUser?.name || 'Althaf Syed'}</p>
                <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{currentUser?.email || 'user@outlook.com'}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu to switch active employee */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Logged in via Outlook</p>
                  <p className="text-xs font-bold text-white">{currentUser?.name}</p>
                  <p className="text-[11px] text-sky-400 truncate">{currentUser?.email}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{currentUser?.role}</p>
                </div>

                <div className="py-1">
                  <p className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Employee Account
                  </p>
                  {allUsers?.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u.id);
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 text-left hover:bg-slate-800 transition-colors ${
                        u.id === currentUser?.id ? 'bg-blue-600/10 text-sky-400 border-l-2 border-sky-400' : 'text-slate-300'
                      }`}
                    >
                      <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                      <div className="truncate">
                        <p className="text-xs font-medium">{u.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-800 pt-1 mt-1 px-2">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Outlook & API Settings</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            title="Settings & Outlook Configuration"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
