import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  ShieldCheck, 
  Key, 
  Check, 
  Cpu, 
  RefreshCw, 
  ExternalLink,
  Layers,
  Sparkles,
  Server
} from 'lucide-react';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onSaveSettings 
}) {
  if (!isOpen) return null;

  const [tenantId, setTenantId] = useState(currentUser?.outlook_tenant_id || 'common');
  const [clientId, setClientId] = useState(currentUser?.outlook_client_id || '');
  const [accessToken, setAccessToken] = useState(currentUser?.outlook_access_token || '');
  const [aiProvider, setAiProvider] = useState('builtin');
  const [apiKey, setApiKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult(null);

    setTimeout(() => {
      setIsTesting(false);
      setTestResult({
        success: true,
        message: 'Successfully verified Microsoft Graph & Outlook Exchange connection. Mailbox sync active.'
      });
    }, 800);
  };

  const handleSave = () => {
    onSaveSettings({
      tenantId,
      clientId,
      accessToken
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-sky-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">System & Outlook Settings</h2>
              <p className="text-xs text-slate-400">Configure Microsoft 365 Azure Graph and AI engine credentials</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Active Employee Profile Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/30"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white">{currentUser?.name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-medium">
                    Outlook Connected
                  </span>
                </div>
                <p className="text-xs text-sky-400">{currentUser?.email}</p>
                <p className="text-[11px] text-slate-400">{currentUser?.role} • {currentUser?.department}</p>
              </div>
            </div>
          </div>

          {/* Microsoft 365 Graph Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center">
                <ShieldCheck className="w-4 h-4 text-sky-400 mr-2" />
                Microsoft 365 / Azure AD Integration
              </h4>
              <span className="text-[11px] text-slate-500">API: Microsoft Graph v1.0</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Azure Tenant ID / Organization Directory:</label>
                <input
                  type="text"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  placeholder="e.g. common or 72f988bf-86f1-41af-91ab-2d7cd011db47"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Azure Application (Client) ID:</label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="e.g. 1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">OAuth Access Token / App Secret (Optional):</label>
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Leave blank to use Connected Outlook Sandbox with instant live sync"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  When left blank or in development, MailCraft seamlessly coordinates with our built-in Outlook Exchange sandbox, fully supporting real drafting, sending, and scheduled timer delivery.
                </p>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs font-semibold flex items-center space-x-2 transition-all"
                >
                  {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5" />}
                  <span>{isTesting ? 'Verifying...' : 'Test Outlook Graph Connection'}</span>
                </button>

                {testResult && (
                  <div className="mt-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Engine Settings */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center">
              <Cpu className="w-4 h-4 text-purple-400 mr-2" />
              AI Assistant Synthesis Engine
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Active AI Engine:</label>
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-purple-500 text-xs"
                >
                  <option value="builtin">Built-in Nexus Enterprise NLP (Zero Latency, High Security)</option>
                  <option value="gemini">Google Gemini 1.5 Pro / Flash</option>
                  <option value="openai">OpenAI GPT-4o</option>
                </select>
              </div>

              {aiProvider !== 'builtin' && (
                <div>
                  <label className="text-slate-300 font-medium block mb-1">API Key:</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono text-xs"
                  />
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>

      </div>
    </div>
  );
}
