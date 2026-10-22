import React, { useState } from 'react';
import { CheckCircle2, Clock, Globe, UserCheck, ShieldAlert, Copy, Check } from 'lucide-react';

export default function EODTablePreview({ 
  scheduleData, 
  user,
  onUpdatePoint
}) {
  const [copied, setCopied] = useState(false);

  if (!scheduleData) return null;

  const { plannedToday, completedToday, pending, plannedNextDay, challenges, dayName } = scheduleData;

  const handleCopyRichTable = async () => {
    try {
      const container = document.getElementById('eod-table-container');
      if (!container) return;

      const html = container.innerHTML;
      const plainText = container.innerText;

      if (navigator.clipboard && window.ClipboardItem) {
        const htmlBlob = new Blob([html], { type: 'text/html' });
        const textBlob = new Blob([plainText], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': textBlob
          })
        ]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 5000);
    } catch (err) {
      console.warn('Clipboard copy error:', err);
    }
  };

  return (
    <div className="bg-white border-2 border-slate-300 rounded-xl p-5 shadow-sm space-y-4 text-slate-800 font-sans">
      
      {/* Table Title Badge & Copy Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0078d4]">
            NYBinfotech Daily Evening Task Table ({dayName || 'Today'})
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleCopyRichTable}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-[#0078d4] hover:bg-[#106ebe] text-white'
            }`}
            title="Copies rich HTML table with borders so you can press Ctrl+V in Chrome Outlook"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '✓ Table Copied (Ctrl+V in Outlook)' : '📋 Copy Table for Outlook'}</span>
          </button>
        </div>
      </div>

      {copied && (
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Table copied to clipboard! Switch to your Chrome Outlook tab and press <strong>Ctrl+V</strong> to paste the exact bordered table!</span>
        </div>
      )}

      <div id="eod-table-container" className="space-y-4">
        {/* Greeting Header matching Screenshot */}
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          <p className="font-semibold text-slate-900">Hi Nafisa Khanam Pathan mam and Prasanna Gunji Mam,</p>
          <p className="mt-1">Good evening,</p>
          <p className="mt-1 text-slate-600">Please find below the task summary for today</p>
        </div>

      {/* The Exact 2-Column Corporate Table with Solid Black Borders */}
      <div className="overflow-x-auto rounded-lg">
        <table 
          border="1" 
          borderColor="#000000" 
          cellPadding="10" 
          cellSpacing="0" 
          className="w-full text-xs text-left"
          style={{ 
            borderCollapse: 'collapse', 
            width: '100%', 
            border: '1.5px solid #000000', 
            fontFamily: 'Calibri, Segoe UI, Arial, sans-serif',
            color: '#000000'
          }}
        >
          <tbody>
            
            {/* ROW 1: TECHNOLOGY */}
            <tr style={{ border: '1.5px solid #000000' }}>
              <td 
                style={{ 
                  border: '1.5px solid #000000', 
                  width: '32%', 
                  padding: '12px', 
                  fontWeight: 'bold', 
                  textAlign: 'center', 
                  backgroundColor: '#f2f2f2', 
                  color: '#000000', 
                  verticalAlign: 'middle' 
                }}
              >
                Technology
              </td>
              <td 
                style={{ 
                  border: '1.5px solid #000000', 
                  width: '68%', 
                  padding: '12px', 
                  fontWeight: 'bold', 
                  textAlign: 'center', 
                  backgroundColor: '#ffffff', 
                  color: '#000000', 
                  verticalAlign: 'middle' 
                }}
              >
                Web Development
              </td>
            </tr>

            {/* ROW 2: PLANNED TASKS (TODAY) */}
            <tr style={{ border: '1.5px solid #000000' }}>
              <td 
                style={{ 
                  border: '1.5px solid #000000', 
                  padding: '12px', 
                  fontWeight: 'bold', 
                  textAlign: 'center', 
                  backgroundColor: '#f2f2f2', 
                  color: '#000000', 
                  verticalAlign: 'middle' 
                }}
              >
                Planned Tasks (Today)
              </td>
              <td 
                style={{ 
                  border: '1.5px solid #000000', 
                  padding: '12px', 
                  backgroundColor: '#ffffff', 
                  color: '#000000' 
                }}
              >
                <div style={{ marginBottom: '8px' }}>
                  <p style={{ fontWeight: 'bold', color: '#000000', margin: '0 0 4px 0' }}>1. React:</p>
                  <ul style={{ margin: '0 0 0 18px', padding: 0, listStyleType: 'disc', color: '#000000' }}>
                    {plannedToday.react.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '4px', lineHeight: '1.5', color: '#000000' }}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <p style={{ fontWeight: 'bold', color: '#000000', margin: '0 0 4px 0' }}>2.Tasks:</p>
                  <ul style={{ margin: '0 0 0 18px', padding: 0, listStyleType: 'disc', color: '#000000' }}>
                    {plannedToday.tasks.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '4px', lineHeight: '1.5', color: '#000000' }}>{item}</li>
                    ))}
                  </ul>
                </div>
              </td>
            </tr>

            {/* ROW 3: COMPLETED TASKS (TODAY) */}
            <tr style={{ border: '1.5px solid #000000' }}>
              <td 
                style={{ 
                  border: '1.5px solid #000000', 
                  padding: '12px', 
                  fontWeight: 'bold', 
                  textAlign: 'center', 
                  backgroundColor: '#f2f2f2', 
                  color: '#000000', 
                  verticalAlign: 'middle' 
                }}
              >
                Completed Tasks (Today)
              </td>
              <td 
                style={{ 
                  border: '1.5px solid #000000', 
                  padding: '12px', 
                  backgroundColor: '#ffffff', 
                  color: '#000000' 
                }}
              >
                <div style={{ marginBottom: '8px' }}>
                  <p style={{ fontWeight: 'bold', color: '#000000', margin: '0 0 4px 0' }}>1. React:</p>
                  <ul style={{ margin: '0 0 0 18px', padding: 0, listStyleType: 'disc', color: '#000000' }}>
                    {completedToday.react.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '4px', lineHeight: '1.5', color: '#000000' }}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <p style={{ fontWeight: 'bold', color: '#000000', margin: '0 0 4px 0' }}>2.Tasks:</p>
                  <ul style={{ margin: '0 0 0 18px', padding: 0, listStyleType: 'disc', color: '#000000' }}>
                    {completedToday.tasks.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '4px', lineHeight: '1.5', color: '#000000' }}>{item}</li>
                    ))}
                  </ul>
                </div>
              </td>
            </tr>

            {/* ROW 4: PENDING TASKS */}
            <tr style={{ border: '1.5px solid #000000' }}>
              <td 
                style={{ 
                  border: '1.5px solid #000000', 
                  padding: '12px', 
                  fontWeight: 'bold', 
                  textAlign: 'center', 
                  backgroundColor: '#f2f2f2', 
                  color: '#000000', 
                  verticalAlign: 'middle' 
                }}
              >
                Pending Tasks
              </td>
              <td 
                style={{ 
                  border: '1.5px solid #000000', 
                  padding: '12px', 
                  backgroundColor: '#ffffff', 
                  color: '#000000', 
                  textAlign: Array.isArray(pending) && pending.length > 0 ? 'left' : 'center',
                  fontWeight: Array.isArray(pending) && pending.length > 0 ? 'normal' : '500',
                  verticalAlign: 'middle'
                }}
              >
                {Array.isArray(pending) && pending.length > 0 ? (
                  <ul style={{ margin: '0 0 0 18px', padding: 0, listStyleType: 'disc', color: '#000000' }}>
                    {pending.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '4px', color: '#000000' }}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <span>N/A</span>
                )}
              </td>
            </tr>

            {/* ROW 5: PLANNED TASKS (NEXT DAY) */}
            <tr style={{ border: '1.5px solid #000000' }}>
              <td 
                style={{ 
                  border: '1.5px solid #000000', 
                  padding: '12px', 
                  fontWeight: 'bold', 
                  textAlign: 'center', 
                  backgroundColor: '#f2f2f2', 
                  color: '#000000', 
                  verticalAlign: 'middle' 
                }}
              >
                Planned Tasks (Next Day)
              </td>
              <td 
                style={{ 
                  border: '1.5px solid #000000', 
                  padding: '12px', 
                  backgroundColor: '#ffffff', 
                  color: '#000000', 
                  textAlign: plannedNextDay?.isNA || !plannedNextDay?.react || plannedNextDay.react.length === 0 ? 'center' : 'left',
                  fontWeight: plannedNextDay?.isNA || !plannedNextDay?.react || plannedNextDay.react.length === 0 ? '500' : 'normal',
                  verticalAlign: 'middle'
                }}
              >
                {plannedNextDay?.isNA || !plannedNextDay?.react || plannedNextDay.react.length === 0 ? (
                  <span>N/A</span>
                ) : (
                  <>
                    <div style={{ marginBottom: '8px' }}>
                      <p style={{ fontWeight: 'bold', color: '#000000', margin: '0 0 4px 0' }}>1. React:</p>
                      <ul style={{ margin: '0 0 0 18px', padding: 0, listStyleType: 'disc', color: '#000000' }}>
                        {plannedNextDay.react.map((item, idx) => (
                          <li key={idx} style={{ marginBottom: '4px', lineHeight: '1.5', color: '#000000' }}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <p style={{ fontWeight: 'bold', color: '#000000', margin: '0 0 4px 0' }}>2.Tasks:</p>
                      <ul style={{ margin: '0 0 0 18px', padding: 0, listStyleType: 'disc', color: '#000000' }}>
                        {plannedNextDay.tasks.map((item, idx) => (
                          <li key={idx} style={{ marginBottom: '4px', lineHeight: '1.5', color: '#000000' }}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </td>
            </tr>

            {/* ROW 6: CHALLENGES / BLOCKERS */}
            <tr style={{ border: '1.5px solid #000000' }}>
              <td 
                style={{ 
                  border: '1.5px solid #000000', 
                  padding: '12px', 
                  fontWeight: 'bold', 
                  textAlign: 'center', 
                  backgroundColor: '#f2f2f2', 
                  color: '#000000', 
                  verticalAlign: 'middle' 
                }}
              >
                Challenges / Blockers if any
              </td>
              <td 
                style={{ 
                  border: '1.5px solid #000000', 
                  padding: '12px', 
                  backgroundColor: '#ffffff', 
                  color: '#000000', 
                  textAlign: Array.isArray(challenges) && challenges.length > 0 ? 'left' : 'center',
                  fontWeight: Array.isArray(challenges) && challenges.length > 0 ? 'normal' : '500',
                  verticalAlign: 'middle'
                }}
              >
                {Array.isArray(challenges) && challenges.length > 0 ? (
                  <ul style={{ margin: '0 0 0 18px', padding: 0, listStyleType: 'disc', color: '#000000' }}>
                    {challenges.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '4px', color: '#000000' }}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <span>N/A</span>
                )}
              </td>
            </tr>

          </tbody>
        </table>
      </div>

      </div> {/* closes #eod-table-container */}
    </div>
  );
}
