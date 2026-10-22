import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ShieldCheck, 
  Mail, 
  Lock, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  Key, 
  Copy,
  CheckCircle2,
  Globe,
  Sparkles
} from 'lucide-react';

export default function ConnectOutlookModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onSaveCredentials, 
  onDisconnect 
}) {
  if (!isOpen) return null;

  // Tabs: 'device' (Microsoft Sign-In No Password), 'password' (App Password), 'otp' (OTP)
  const [authMode, setAuthMode] = useState('device');
  const [email, setEmail] = useState(currentUser?.outlook_email || currentUser?.email || '');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState(currentUser?.outlook_type || 'work');
  const [otpCode, setOtpCode] = useState('');
  
  // Microsoft Device Code States
  const [deviceData, setDeviceData] = useState(null);
  const [isRequestingDevice, setIsRequestingDevice] = useState(false);
  const [isPollingDevice, setIsPollingDevice] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const pollIntervalRef = useRef(null);

  // States
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const isConnected = Boolean(currentUser?.outlook_connected && currentUser?.outlook_email);

  // On open or when switching to 'device' tab, fetch real Microsoft Device Code
  useEffect(() => {
    if (isOpen && authMode === 'device' && !isConnected) {
      initMicrosoftDeviceLogin();
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, authMode]);

  const initMicrosoftDeviceLogin = async () => {
    setIsRequestingDevice(true);
    setFeedback(null);
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    try {
      const res = await fetch('/api/auth/ms-device-code', { method: 'POST' });
      const data = await res.json();

      if (data.success && data.userCode) {
        setDeviceData(data);
        startDevicePolling(data.deviceCode);
      } else {
        setFeedback({ 
          type: 'error', 
          message: data.error || 'Could not connect to Microsoft identity platform. Try signing in with App Password.' 
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to reach Microsoft authentication server.' });
    } finally {
      setIsRequestingDevice(false);
    }
  };

  const startDevicePolling = (deviceCode) => {
    setIsPollingDevice(true);
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/auth/ms-poll-token', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-id': currentUser?.id || 'usr-althaf'
          },
          body: JSON.stringify({ deviceCode })
        });

        const data = await res.json();
        if (data.connected && data.user) {
          clearInterval(pollIntervalRef.current);
          setIsPollingDevice(false);
          setFeedback({
            type: 'success',
            message: `Connected successfully to real Outlook: ${data.user.outlook_email}!`
          });
          onSaveCredentials(data.user);
          setTimeout(() => onClose(), 1500);
        } else if (!data.pending) {
          clearInterval(pollIntervalRef.current);
          setIsPollingDevice(false);
          if (data.error) {
            setFeedback({ type: 'error', message: data.error });
          }
        }
      } catch (err) {
        console.warn('Poll error:', err);
      }
    }, 4000);
  };

  const handleCopyCode = () => {
    if (deviceData?.userCode) {
      navigator.clipboard.writeText(deviceData.userCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2500);
    }
  };

  const handleOpenMicrosoftDevicePage = () => {
    handleCopyCode();
    window.open('https://login.microsoft.com/device', '_blank');
  };

  // 1. Direct Real Outlook Sign-In (Email + Password / App Password)
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setFeedback({ type: 'error', message: 'Please enter both your Outlook email and password.' });
      return;
    }

    setIsLoggingIn(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/auth/connect-outlook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || 'usr-althaf'
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          type: accountType
        })
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({ 
          type: 'success', 
          message: data.testResult?.message || `Successfully connected to real Outlook account: ${email}!` 
        });
        onSaveCredentials(data.user);
        setTimeout(() => onClose(), 1200);
      } else {
        setFeedback({ 
          type: 'error', 
          message: data.error || 'Microsoft authentication failed. Please verify your email and password.' 
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Connection error while communicating with Microsoft servers.' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 2. Send Real OTP to Inbox
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setFeedback({ type: 'error', message: 'Please enter your Outlook email address.' });
      return;
    }

    setIsSendingOtp(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setFeedback({
          type: 'success',
          message: `Verification code generated for ${email}. If outbound mail service is active, check your inbox; or enter your code below.`
        });
        if (data.otpCode) {
          // Auto-fill or show OTP for convenience
          setOtpCode(data.otpCode);
        }
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to dispatch verification code.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Network error sending OTP.' });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 3. Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setFeedback({ type: 'error', message: 'Please enter the 6-digit code.' });
      return;
    }

    setIsLoggingIn(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || 'usr-althaf'
        },
        body: JSON.stringify({
          email: email.trim(),
          code: otpCode.trim(),
          type: accountType
        })
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: 'Identity verified! Logged in with Outlook.' });
        onSaveCredentials(data.user);
        setTimeout(() => onClose(), 1000);
      } else {
        setFeedback({ type: 'error', message: data.error || 'Invalid or expired verification code.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Verification error.' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* Microsoft Outlook Header */}
        <div className="bg-[#0078d4] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Real Microsoft Outlook Login</h2>
              <p className="text-xs text-blue-100">Connect directly to your real Outlook account</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active connection status banner */}
        {isConnected && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Connected as: <strong>{currentUser.outlook_email}</strong></span>
            </div>
            <button
              onClick={onDisconnect}
              className="text-xs text-red-600 hover:text-red-700 font-bold underline"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* 3 Clear Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-semibold bg-slate-50">
          <button
            onClick={() => { setAuthMode('device'); setFeedback(null); }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 flex items-center justify-center space-x-1.5 ${
              authMode === 'device'
                ? 'border-[#0078d4] text-[#0078d4] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0078d4]" />
            <span>Sign In with Microsoft</span>
          </button>

          <button
            onClick={() => { setAuthMode('password'); setFeedback(null); }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              authMode === 'password'
                ? 'border-[#0078d4] text-[#0078d4] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Password / App Password</span>
          </button>

          <button
            onClick={() => { setAuthMode('otp'); setFeedback(null); }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              authMode === 'otp'
                ? 'border-[#0078d4] text-[#0078d4] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>OTP Code</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">

          {/* TAB 1: OFFICIAL MICROSOFT DEVICE LOGIN (RECOMMENDED / ZERO PASSWORD NEEDED) */}
          {authMode === 'device' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1 text-xs text-slate-700">
                <p className="font-bold text-slate-900 flex items-center">
                  <ShieldCheck className="w-4 h-4 text-[#0078d4] mr-1.5" />
                  Official Microsoft 365 Verification
                </p>
                <p className="text-slate-600 leading-relaxed">
                  No password needed. Authorize via your Chrome browser where your Outlook is already open.
                </p>
              </div>

              {isRequestingDevice ? (
                <div className="py-8 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-[#0078d4] animate-spin mx-auto" />
                  <p className="text-sm text-slate-600">Contacting Microsoft identity service...</p>
                </div>
              ) : deviceData ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Your Microsoft Security Code:
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-slate-100 border-2 border-dashed border-[#0078d4] rounded-xl py-3 px-4 text-center font-mono text-2xl font-bold tracking-widest text-[#0078d4] select-all">
                        {deviceData.userCode}
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
                        title="Copy Code"
                      >
                        {codeCopied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleOpenMicrosoftDevicePage}
                      className="w-full py-3 rounded-xl bg-[#0078d4] hover:bg-[#106ebe] text-white font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all"
                    >
                      <span>1. Copy Code & Open Microsoft Login</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <p className="text-[11px] text-center text-slate-500">
                      Opens <strong>microsoft.com/device</strong>. Paste the code above and click <strong>Next</strong> to authorize.
                    </p>
                  </div>

                  {/* Polling Indicator */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center space-x-2.5 text-xs text-slate-600">
                    <RefreshCw className="w-4 h-4 text-[#0078d4] animate-spin flex-shrink-0" />
                    <span>Waiting for Microsoft approval... (Auto-detects when authorized)</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <button
                    type="button"
                    onClick={initMicrosoftDeviceLogin}
                    className="px-4 py-2 bg-[#0078d4] text-white rounded-lg text-xs font-bold"
                  >
                    Generate Microsoft Code
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* TAB 2: REAL OUTLOOK SIGN IN (PASSWORD / APP PASSWORD) */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Outlook Email Address:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com or name@outlook.com"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0078d4]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Microsoft Account / App Password:
                  </label>
                  <a
                    href="https://account.microsoft.com/security"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#0078d4] hover:underline flex items-center font-medium"
                  >
                    <span>Get App Password</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your Outlook password or 16-character App Password"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0078d4] font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Allows MailCraft to directly write drafts into your real Outlook <strong>Drafts</strong> folder (via IMAP) and deliver real emails (via SMTP).
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Account Type:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label
                    onClick={() => setAccountType('work')}
                    className={`p-2.5 rounded-lg border cursor-pointer flex items-center space-x-2 transition-all ${
                      accountType === 'work'
                        ? 'bg-blue-50 border-[#0078d4] text-[#0078d4] font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <input type="radio" name="accType" checked={accountType === 'work'} onChange={() => setAccountType('work')} className="hidden" />
                    <Globe className="w-4 h-4" />
                    <span>Work / Office 365</span>
                  </label>

                  <label
                    onClick={() => setAccountType('personal')}
                    className={`p-2.5 rounded-lg border cursor-pointer flex items-center space-x-2 transition-all ${
                      accountType === 'personal'
                        ? 'bg-blue-50 border-[#0078d4] text-[#0078d4] font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <input type="radio" name="accType" checked={accountType === 'personal'} onChange={() => setAccountType('personal')} className="hidden" />
                    <Mail className="w-4 h-4" />
                    <span>Personal Outlook</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn || !email.trim() || !password.trim()}
                className="w-full py-2.5 rounded-lg bg-[#0078d4] hover:bg-[#106ebe] text-white text-sm font-bold shadow transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isLoggingIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{isLoggingIn ? 'Verifying with Microsoft...' : 'Log In & Connect Outlook'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: EMAIL OTP LOGIN */}
          {authMode === 'otp' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Your Outlook Email Address:
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com or name@outlook.com"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0078d4]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp || !email.trim()}
                    className="px-4 py-2 rounded-lg bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-bold whitespace-nowrap disabled:opacity-50"
                  >
                    {isSendingOtp ? 'Sending...' : otpSent ? 'Resend Code' : 'Send Code'}
                  </button>
                </div>
              </div>

              {otpSent && (
                <form onSubmit={handleVerifyOtp} className="space-y-3 animate-in fade-in duration-200">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Enter 6-Digit Code Received:
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-base text-center font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:border-[#0078d4]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn || otpCode.length < 6}
                    className="w-full py-2.5 rounded-lg bg-[#0078d4] hover:bg-[#106ebe] text-white text-sm font-bold shadow disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isLoggingIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>{isLoggingIn ? 'Verifying...' : 'Verify & Log In'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Feedback Result */}
          {feedback && (
            <div className={`p-3 rounded-lg border text-xs flex items-center space-x-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : feedback.type === 'error'
                ? 'bg-red-50 border-red-300 text-red-800'
                : 'bg-blue-50 border-blue-300 text-blue-800'
            }`}>
              {feedback.type === 'success' && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
              {feedback.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
              {feedback.type === 'info' && <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Microsoft 365 Exchange Gateway</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
