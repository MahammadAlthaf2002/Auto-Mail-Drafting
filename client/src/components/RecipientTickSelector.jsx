import React, { useState } from 'react';
import { Check, Search, Users, Sparkles, Filter, X } from 'lucide-react';

export default function RecipientTickSelector({ 
  allContacts = [], 
  presetGroups = [], 
  selectedTo = [], 
  selectedCc = [], 
  onUpdateTo, 
  onUpdateCc 
}) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  const departments = ['All', ...new Set(allContacts.map(c => c.department).filter(Boolean))];

  const filteredContacts = allContacts.filter(c => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase());
    const matchDept = selectedDept === 'All' || c.department === selectedDept;
    return matchSearch && matchDept;
  });

  const isToSelected = (id) => selectedTo.some(c => c.id === id);
  const isCcSelected = (id) => selectedCc.some(c => c.id === id);

  const toggleTo = (contact) => {
    if (isToSelected(contact.id)) {
      onUpdateTo(selectedTo.filter(c => c.id !== contact.id));
    } else {
      onUpdateTo([...selectedTo, contact]);
    }
  };

  const toggleCc = (contact) => {
    if (isCcSelected(contact.id)) {
      onUpdateCc(selectedCc.filter(c => c.id !== contact.id));
    } else {
      onUpdateCc([...selectedCc, contact]);
    }
  };

  const applyPreset = (grp) => {
    if (grp.to_contacts) onUpdateTo(grp.to_contacts);
    if (grp.cc_contacts) onUpdateCc(grp.cc_contacts);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4 font-sans">
      
      {/* Header and Quick Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2.5">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Step 2
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <Users className="w-4 h-4 text-indigo-600 mr-2" />
              Select Recipients (Tick Marks)
            </h3>
            <p className="text-xs text-slate-500">Tick colleagues to receive in TO and CC</p>
          </div>
        </div>

        {/* 1-Click Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {presetGroups.map(grp => (
            <button
              key={grp.id}
              type="button"
              onClick={() => applyPreset(grp)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-xs text-slate-700 hover:text-indigo-700 font-semibold transition-all flex items-center space-x-1.5 shadow-xs"
            >
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>{grp.name.replace('Group', '').trim()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search colleagues by name, email, or role..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0078d4]"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none w-full sm:w-auto"
        >
          {departments.map(d => (
            <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
          ))}
        </select>
      </div>

      {/* Clean 2-Column Checklist with Tick Marks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Left Column: TO Recipients */}
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-[#0078d4] uppercase tracking-wider">
              Send TO ({selectedTo.length} selected)
            </span>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => onUpdateTo(filteredContacts)}
                className="text-[11px] text-slate-600 hover:text-slate-900 font-medium"
              >
                Select All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => onUpdateTo([])}
                className="text-[11px] text-slate-500 hover:text-red-600"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
            {filteredContacts.map(c => {
              const checked = isToSelected(c.id);
              return (
                <div
                  key={c.id}
                  onClick={() => toggleTo(c)}
                  className={`flex items-center space-x-2.5 p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                    checked
                      ? 'bg-blue-50 border border-blue-300 text-slate-900 font-medium'
                      : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                    checked ? 'bg-[#0078d4] border-[#0078d4] text-white' : 'border-slate-400 bg-white'
                  }`}>
                    {checked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="truncate flex-1">
                    <p className="truncate font-semibold text-slate-900">{c.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{c.email}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200/60 text-slate-600 font-medium">
                    {c.department}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: CC Recipients */}
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Send CC ({selectedCc.length} selected)
            </span>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => onUpdateCc(filteredContacts)}
                className="text-[11px] text-slate-600 hover:text-slate-900 font-medium"
              >
                Select All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => onUpdateCc([])}
                className="text-[11px] text-slate-500 hover:text-red-600"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
            {filteredContacts.map(c => {
              const checked = isCcSelected(c.id);
              return (
                <div
                  key={c.id}
                  onClick={() => toggleCc(c)}
                  className={`flex items-center space-x-2.5 p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                    checked
                      ? 'bg-indigo-50 border border-indigo-300 text-slate-900 font-medium'
                      : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                    checked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-400 bg-white'
                  }`}>
                    {checked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="truncate flex-1">
                    <p className="truncate font-semibold text-slate-900">{c.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{c.email}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200/60 text-slate-600 font-medium">
                    {c.department}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
