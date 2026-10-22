import React, { useState } from 'react';
import { Mail, ShieldCheck, ChevronDown, Clock, Key, Check } from 'lucide-react';

export default function SimpleNavbar({ 
  currentUser, 
  allUsers = [], 
  onSwitchUser, 
  onOpenConnectModal,
  onOpenScheduled,
  scheduledCount = 0
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isRealConnected = Boolean(currentUser?.outlook_connected && currentUser?.outlook_email);

  return (
    <header className="bg-[#0078d4] text-white shadow-md sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Microsoft Outlook Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white shadow-inner">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base tracking-tight">Outlook <span className="font-light text-blue-200">MailCraft AI</span></span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/20 text-white tracking-wider">
                Microsoft 365
              </span>
            </div>
            <p className="text-[11px] text-blue-100 hidden sm:block">AI Email Assistant & Scheduled Outlook Dispatch</p>
          </div>
        </div>

        {/* Right Controls: Real Outlook Status & Account */}
        <div className="flex items-center space-x-3">
          
          {/* Scheduled Queue Indicator */}
          {scheduledCount > 0 && (
            <button
              onClick={onOpenScheduled}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>{scheduledCount} Scheduled</span>
            </button>
          )}

          {/* Real Outlook Login / Active Status Pill */}
          <button
            onClick={onOpenConnectModal}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isRealConnected
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-[#0078d4] hover:bg-blue-50 shadow-sm'
            }`}
          >
            {isRealConnected ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span className="truncate max-w-[160px] sm:max-w-[220px]">
                  {currentUser.outlook_email}
                </span>
              </>
            ) : (
              <>
                <Key className="w-3.5 h-3.5 text-[#0078d4]" />
                <span>Log In Real Outlook</span>
              </>
            )}
          </button>

          {/* User Account Switcher */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 p-1 pl-1.5 pr-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white border border-white/20 transition-colors"
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                alt={currentUser?.name}
                className="w-6 h-6 rounded-md object-cover bg-white"
              />
              <span className="hidden sm:inline font-semibold">{currentUser?.name || 'Althaf Syed'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-blue-200" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 border border-slate-200 rounded-xl shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 text-xs">
                  <p className="font-bold text-slate-900">{currentUser?.name}</p>
                  <p className="text-slate-500 truncate">{currentUser?.email}</p>
                  <p className="text-[11px] text-[#0078d4] font-semibold mt-0.5">{currentUser?.role}</p>
                </div>

                <div className="py-1">
                  <p className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Employee Profile
                  </p>
                  {allUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center space-x-2.5 px-4 py-2 text-left text-xs hover:bg-slate-50 transition-colors ${
                        u.id === currentUser?.id ? 'text-[#0078d4] font-bold bg-blue-50/60' : 'text-slate-700'
                      }`}
                    >
                      <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                      <div className="truncate">
                        <p className="truncate font-medium">{u.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
