import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Check, 
  Users, 
  Shield, 
  Building, 
  Sparkles, 
  Filter, 
  Layers, 
  UserCheck, 
  Star 
} from 'lucide-react';

export default function RecipientSelectorModal({ 
  isOpen, 
  onClose, 
  allContacts = [], 
  presetGroups = [], 
  selectedTo = [], 
  selectedCc = [], 
  onUpdateRecipients, 
  defaultTab = 'to' 
}) {
  const [activeTab, setActiveTab] = useState(defaultTab); // 'to' or 'cc'
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  if (!isOpen) return null;

  // Extract unique departments
  const departments = ['All', ...new Set(allContacts.map(c => c.department).filter(Boolean))];

  // Current selections based on activeTab
  const isSelected = (contactId) => {
    if (activeTab === 'to') {
      return selectedTo.some(c => c.id === contactId);
    } else {
      return selectedCc.some(c => c.id === contactId);
    }
  };

  const handleToggleContact = (contact) => {
    if (activeTab === 'to') {
      const exists = selectedTo.some(c => c.id === contact.id);
      let newTo;
      if (exists) {
        newTo = selectedTo.filter(c => c.id !== contact.id);
      } else {
        newTo = [...selectedTo, contact];
      }
      onUpdateRecipients(newTo, selectedCc);
    } else {
      const exists = selectedCc.some(c => c.id === contact.id);
      let newCc;
      if (exists) {
        newCc = selectedCc.filter(c => c.id !== contact.id);
      } else {
        newCc = [...selectedCc, contact];
      }
      onUpdateRecipients(selectedTo, newCc);
    }
  };

  const handleSelectAllFiltered = () => {
    const idsToAdd = filteredContacts.filter(c => !isSelected(c.id));
    if (activeTab === 'to') {
      onUpdateRecipients([...selectedTo, ...idsToAdd], selectedCc);
    } else {
      onUpdateRecipients(selectedTo, [...selectedCc, ...idsToAdd]);
    }
  };

  const handleClearCurrentTab = () => {
    if (activeTab === 'to') {
      onUpdateRecipients([], selectedCc);
    } else {
      onUpdateRecipients(selectedTo, []);
    }
  };

  const handleApplyPresetGroup = (group) => {
    if (group.to_contacts && group.cc_contacts) {
      onUpdateRecipients(group.to_contacts, group.cc_contacts);
    }
  };

  // Filter contacts by search & department
  const filteredContacts = allContacts.filter(c => {
    const matchesSearch = !search || 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.email.toLowerCase().includes(search.toLowerCase()) || 
      c.role.toLowerCase().includes(search.toLowerCase()) ||
      (c.tags && c.tags.toLowerCase().includes(search.toLowerCase()));

    const matchesDept = selectedDept === 'All' || c.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-sky-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Company Directory & Recipient Selector</h2>
              <p className="text-xs text-slate-400">Select colleagues with tick marks for TO and CC recipients</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Recipient Groups Quick Bar */}
        {presetGroups.length > 0 && (
          <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center space-x-2 overflow-x-auto text-xs">
            <span className="text-[11px] font-medium text-slate-500 flex items-center whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 mr-1.5" /> 1-Click Groups:
            </span>
            {presetGroups.map(grp => (
              <button
                key={grp.id}
                onClick={() => handleApplyPresetGroup(grp)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-blue-600/20 hover:border-blue-500/40 border border-slate-700/70 text-slate-300 hover:text-sky-300 text-xs font-medium transition-all whitespace-nowrap flex items-center space-x-1.5"
                title={grp.description}
              >
                <span>{grp.name}</span>
                <span className="px-1.5 py-0.2 rounded bg-slate-700 text-[10px] text-slate-300">
                  {grp.to_contacts?.length || 0} TO / {grp.cc_contacts?.length || 0} CC
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Tab Switcher (TO vs CC) */}
        <div className="px-6 pt-4 pb-2 flex items-center justify-between border-b border-slate-800 bg-slate-900">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('to')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'to'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>TO Recipients</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'to' ? 'bg-blue-800 text-white' : 'bg-slate-700 text-slate-300'
              }`}>
                {selectedTo.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('cc')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'cc'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>CC Recipients</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'cc' ? 'bg-indigo-800 text-white' : 'bg-slate-700 text-slate-300'
              }`}>
                {selectedCc.length}
              </span>
            </button>
          </div>

          {/* Quick Selection Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSelectAllFiltered}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition-colors"
            >
              Select All Visible
            </button>
            <button
              onClick={handleClearCurrentTab}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-400 hover:text-rose-400 font-medium transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Search & Department Filters */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team members by name, email, role, or tags..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Department Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto text-xs pb-1">
            <span className="text-[11px] text-slate-500 font-medium flex items-center mr-1">
              <Filter className="w-3 h-3 mr-1" /> Dept:
            </span>
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap ${
                  selectedDept === dept
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts Roster with Tick Marks */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No colleagues found matching "{search}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredContacts.map(contact => {
                const checked = isSelected(contact.id);
                return (
                  <div
                    key={contact.id}
                    onClick={() => handleToggleContact(contact)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? activeTab === 'to'
                          ? 'bg-blue-600/15 border-blue-500/60 shadow-sm'
                          : 'bg-indigo-600/15 border-indigo-500/60 shadow-sm'
                        : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      {/* Checkbox with Tick Mark */}
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all flex-shrink-0 ${
                        checked 
                          ? activeTab === 'to' 
                            ? 'bg-blue-600 border-blue-500 text-white' 
                            : 'bg-indigo-600 border-indigo-500 text-white'
                          : 'border-slate-600 bg-slate-800 text-transparent'
                      }`}>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>

                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-700 flex-shrink-0"
                      />

                      <div className="truncate">
                        <div className="flex items-center space-x-1.5">
                          <p className="text-xs font-semibold text-slate-200 truncate">{contact.name}</p>
                          {contact.is_favorite === 1 && (
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-sky-400 truncate">{contact.email}</p>
                        <p className="text-[10px] text-slate-400 truncate">{contact.role}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end flex-shrink-0 pl-2">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {contact.department}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Summary and Apply */}
        <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 space-x-3">
            <span className="font-medium text-slate-200">Selected for TO: <strong className="text-sky-400">{selectedTo.length}</strong></span>
            <span>•</span>
            <span className="font-medium text-slate-200">Selected for CC: <strong className="text-indigo-400">{selectedCc.length}</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Done & Apply Selection</span>
          </button>
        </div>

      </div>
    </div>
  );
}
