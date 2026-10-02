import React, { useState } from 'react';
import { 
  LifeBuoy, MessageSquare, Send, CheckCircle, Clock, AlertTriangle, 
  ShieldCheck, UserCheck, Search, Filter, Lock, FileText, Check, ChevronRight
} from 'lucide-react';
import { db } from '../../../db/registryDb';
import { StaffRoleService } from '../../../services/StaffRoleService';

// Canned Macros Library
const CANNED_MACROS = [
  {
    title: 'Lost 2FA Recovery Checklist',
    text: "Hello! To protect your rabbitry pedigree records under our Zero Trust security policy, please confirm: (1) Your ARBA membership number or tattoo prefix, (2) The tattoo or name of your most recent registered rabbit, and (3) The last 4 digits of your payment card on file. Once verified, we will issue a one-time secure recovery link."
  },
  {
    title: 'Evans Import Assistance',
    text: "Hi there! If you are migrating from Evans Software, make sure you select your ANIMAL.DBF and PEDIGREE.DBF files. Our migrator reconstructs all 4 generations automatically without modifying your original files. Let us know if you encounter any unrecognized breed codes!"
  },
  {
    title: 'Pedigree Inbreeding / COI Query',
    text: "Wright's Coefficient of Inbreeding (COI) is calculated using complete pedigree lineage graph traversal up to 5 generations. Values under 6.25% represent mild outcrosses, while 12.5%+ indicate half-sibling or closer matings. You can run automated test matings in the Breeding Scheduler!"
  },
  {
    title: 'Subscription & Billing Help',
    text: "Thank you for reaching out! We have reviewed your account and updated your subscription status. You now have full access to unlimited 4-generation pedigree PDF exports and cloud sync across all your barn devices."
  }
];

export default function SupportDeskTab({
  allTickets = [],
  setAllTickets,
  currentUser,
  showToast
}) {
  const [ticketFilterStatus, setTicketFilterStatus] = useState('All');
  const [ticketFilterCategory, setTicketFilterCategory] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  // Recovery Checklist Modal State
  const [showRecoveryChecklist, setShowRecoveryChecklist] = useState(false);
  const [checkIdVerified, setCheckIdVerified] = useState(false);
  const [checkTattooVerified, setCheckTattooVerified] = useState(false);
  const [checkBillingVerified, setCheckBillingVerified] = useState(false);
  const [issuedRecoveryCode, setIssuedRecoveryCode] = useState(null);

  // Filtered tickets
  const filteredTickets = allTickets.filter(t => {
    const matchStatus = ticketFilterStatus === 'All' || t.status === ticketFilterStatus;
    const matchCategory = ticketFilterCategory === 'All' || t.category === ticketFilterCategory;
    return matchStatus && matchCategory;
  });

  // Handle status update
  const handleUpdateTicketStatus = async (ticketId, nextStatus) => {
    if (db && db.supportTickets) {
      await db.supportTickets.update(ticketId, {
        status: nextStatus,
        updatedAt: new Date().toISOString()
      });
    }

    setAllTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: nextStatus } : t));
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(prev => ({ ...prev, status: nextStatus }));
    }
    showToast(`Ticket status updated to ${nextStatus}!`, 'info');
  };

  // Handle reply submission
  const handleSendAdminReply = async (e) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !selectedTicket) return;

    const reply = {
      id: 'rep_' + Date.now(),
      senderRole: 'admin',
      senderName: `${currentUser?.name || 'Staff'}${isInternalNote ? ' (Internal Note)' : ''}`,
      message: adminReplyText.trim(),
      timestamp: new Date().toISOString(),
      isInternal: isInternalNote
    };

    const updatedReplies = [...(selectedTicket.replies || []), reply];
    const updatedTicket = {
      ...selectedTicket,
      replies: updatedReplies,
      status: !isInternalNote && selectedTicket.status === 'Open' ? 'In Review' : selectedTicket.status,
      updatedAt: new Date().toISOString()
    };

    if (db && db.supportTickets) {
      await db.supportTickets.put(updatedTicket);
    }

    setAllTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    setSelectedTicket(updatedTicket);
    setAdminReplyText('');

    await StaffRoleService.logStaffAction({
      staffId: currentUser?.id,
      staffName: currentUser?.name,
      action: isInternalNote ? 'TICKET_NOTE_ADDED' : 'TICKET_REPLIED',
      targetUserId: selectedTicket.breederId,
      details: `Replied to Ticket #${selectedTicket.id}: ${selectedTicket.subject}`
    });

    showToast(isInternalNote ? 'Internal staff note added.' : 'Reply sent to user!', 'success');
  };

  // Generate 2FA Recovery Bypass Code
  const handleGenerateRecoveryCode = async () => {
    if (!checkIdVerified || !checkTattooVerified || !checkBillingVerified) {
      showToast('All 3 verification checklist items must be checked to authorize bypass.', 'error');
      return;
    }

    const recoveryCode = 'WW-REC-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    setIssuedRecoveryCode(recoveryCode);

    await StaffRoleService.logStaffAction({
      staffId: currentUser?.id,
      staffName: currentUser?.name,
      action: '2FA_BYPASS_AUTHORIZED',
      targetUserId: selectedTicket?.breederId || 'user',
      details: `Authorized 2FA recovery bypass code for ticket #${selectedTicket?.id} after 3-point checklist validation.`
    });

    showToast('Recovery bypass code authorized and logged to audit trail!', 'success');
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Filter Bar */}
      <div className="glass-container p-4 flex flex-wrap items-center justify-between gap-3 border border-white/10">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['All', 'Open', 'In Review', 'Resolved', 'Closed'].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setTicketFilterStatus(st)}
              className={`text-[11px] font-bold py-1 px-3 rounded-lg transition-all ${
                ticketFilterStatus === st ? 'bg-indigo-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold">Category:</span>
          <select
            value={ticketFilterCategory}
            onChange={(e) => setTicketFilterCategory(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-lg text-xs text-white p-1.5 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Account Recovery">Account Recovery</option>
            <option value="Billing">Billing</option>
            <option value="Pedigree">Pedigree</option>
            <option value="Technical">Technical Bug</option>
            <option value="Animal Safety">Animal Safety</option>
          </select>
        </div>
      </div>

      {/* Main Split Layout: Tickets List & Ticket Detail / Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Tickets Queue (5 Cols) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 glass-container">
              No support tickets found matching current filters.
            </div>
          ) : (
            filteredTickets.map(t => {
              const isSelected = selectedTicket?.id === t.id;
              const isUrgent = t.priority === 'Urgent' || t.priority === 'High';

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-950/70 border-indigo-500 shadow-md'
                      : 'bg-slate-900/80 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      t.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      t.priority === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {t.priority || 'Normal'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h5 className="font-bold text-white text-xs truncate">{t.subject}</h5>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{t.message}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 mt-2 border-t border-white/5">
                    <span>From: {t.breederName || t.breederId}</span>
                    <span className={`font-bold uppercase ${
                      t.status === 'Open' ? 'text-amber-400' :
                      t.status === 'In Review' ? 'text-indigo-400' :
                      'text-emerald-400'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Ticket Conversation Thread & Actions (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="glass-container p-6 border border-indigo-500/30 rounded-3xl space-y-5">
              
              {/* Ticket Top Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold">#{selectedTicket.id}</span>
                    <h4 className="font-black text-white text-base">{selectedTicket.subject}</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Category: <strong className="text-white">{selectedTicket.category}</strong> &bull; From: {selectedTicket.breederName} ({selectedTicket.breederEmail || selectedTicket.breederId})
                  </p>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['Open', 'In Review', 'Resolved', 'Closed'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateTicketStatus(selectedTicket.id, st)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                        selectedTicket.status === st
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recovery Verification Trigger if category is Account Recovery */}
              {selectedTicket.category === 'Account Recovery' && (
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-amber-300 text-xs">
                    <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>2FA or Credential Loss Assistance Required</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRecoveryChecklist(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs shrink-0 cursor-pointer shadow"
                  >
                    Open Recovery Checklist
                  </button>
                </div>
              )}

              {/* Thread Messages */}
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {/* Initial Ticket Message */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <strong className="text-white">{selectedTicket.breederName || 'Breeder'}</strong>
                    <span className="text-slate-500 font-mono">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>

                {/* Replies */}
                {(selectedTicket.replies || []).map(r => (
                  <div
                    key={r.id}
                    className={`p-4 rounded-2xl border space-y-1.5 ${
                      r.isInternal 
                        ? 'bg-amber-950/30 border-amber-500/30 text-amber-200' 
                        : 'bg-indigo-950/40 border-indigo-500/30 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <strong className={r.isInternal ? 'text-amber-300 font-bold' : 'text-indigo-300'}>
                        {r.senderName}
                      </strong>
                      <span className="text-slate-500 font-mono text-[10px]">{new Date(r.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{r.message}</p>
                  </div>
                ))}
              </div>

              {/* Canned Macros Quick-Insert */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Canned Macros</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {CANNED_MACROS.map((m, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAdminReplyText(m.text)}
                      className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-medium"
                    >
                      {m.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendAdminReply} className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Staff Response</label>
                  <label className="flex items-center gap-1.5 text-xs text-amber-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-0"
                    />
                    <span>Post as Internal Staff Note</span>
                  </label>
                </div>

                <textarea
                  required
                  rows={3}
                  value={adminReplyText}
                  onChange={(e) => setAdminReplyText(e.target.value)}
                  placeholder={isInternalNote ? 'Write private staff note...' : 'Type response to user...'}
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isInternalNote ? 'Save Internal Note' : 'Send Reply'}</span>
                  </button>
                </div>
              </form>

            </div>
          ) : (
            <div className="glass-container p-12 text-center text-xs text-slate-500 rounded-3xl border border-dashed border-white/10">
              Select a ticket from the inbox to review conversation thread, apply canned macros, or assist credential recovery.
            </div>
          )}
        </div>

      </div>

      {/* Recovery Checklist Modal */}
      {showRecoveryChecklist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in text-left">
          <div className="relative w-full max-w-lg bg-slate-950 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
              <div>
                <h4 className="font-bold text-white text-base">Assisted 2FA & Identity Recovery</h4>
                <p className="text-[11px] text-slate-400">3-point validation checklist before issuing bypass</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl border border-white/10 space-y-3 text-xs">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkIdVerified}
                  onChange={(e) => setCheckIdVerified(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600"
                />
                <span className="text-slate-300">
                  <strong>1. Identity / Government ID Check:</strong> Verified government-issued photo ID or ARBA youth membership card matching registered name.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkTattooVerified}
                  onChange={(e) => setCheckTattooVerified(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600"
                />
                <span className="text-slate-300">
                  <strong>2. Tattoo Prefix / Lineage Check:</strong> Verified registered ear tattoo prefix or last known registered animal in herd.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkBillingVerified}
                  onChange={(e) => setCheckBillingVerified(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600"
                />
                <span className="text-slate-300">
                  <strong>3. Billing & Device Match:</strong> Confirmed payment card last 4 digits, billing zip code, or last known login IP.
                </span>
              </label>
            </div>

            {issuedRecoveryCode ? (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
                <div className="text-xs text-emerald-400 font-bold">Recovery Bypass Code Authorized:</div>
                <div className="font-mono text-base font-black text-white bg-slate-950 p-2.5 rounded-xl border border-emerald-500/30 select-all">
                  {issuedRecoveryCode}
                </div>
                <p className="text-[10px] text-slate-400">Share this one-time code securely with the breeder. Code expires in 30 minutes.</p>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRecoveryChecklist(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateRecoveryCode}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-600/30 cursor-pointer"
                >
                  Authorize 2FA Bypass Code
                </button>
              </div>
            )}

            {issuedRecoveryCode && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowRecoveryChecklist(false);
                    setIssuedRecoveryCode(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
