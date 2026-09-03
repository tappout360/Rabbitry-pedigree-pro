import React, { useState } from 'react';
import { 
  ShieldCheck, LifeBuoy, Key, Smartphone, Mail, CheckCircle, 
  AlertTriangle, Clock, Send, MessageSquare, UserCheck, RefreshCw, 
  Search, Lock, Eye, Filter
} from 'lucide-react';
import { db } from '../db/registryDb';
import { logSecurityEvent } from '../services/AccountSecurityService';

export default function AdminSupportDesk({
  allBreeders = [],
  setAdminBreeders,
  allRabbits = [],
  allTickets = [],
  setAllTickets,
  securityLogs = [],
  setSecurityLogs,
  currentUser,
  showToast,
  triggerConfetti
}) {
  const [subTab, setSubTab] = useState('tickets'); // 'tickets', 'recovery', 'audit'
  
  // Tickets filter
  const [ticketFilterStatus, setTicketFilterStatus] = useState('All');
  const [ticketFilterCategory, setTicketFilterCategory] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  // User lookup for assisted recovery
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [selectedRecoveryBreeder, setSelectedRecoveryBreeder] = useState(null);
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [recoveryNewEmail, setRecoveryNewEmail] = useState('');

  // Filtered tickets
  const filteredTickets = allTickets.filter(t => {
    const matchStatus = ticketFilterStatus === 'All' || t.status === ticketFilterStatus;
    const matchCategory = ticketFilterCategory === 'All' || t.category === ticketFilterCategory;
    return matchStatus && matchCategory;
  });

  // Handle Ticket Status Change
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
    showToast(`Ticket status updated to ${nextStatus}!`, "info");
  };

  // Handle Admin Reply
  const handleSendAdminReply = async (e) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !selectedTicket) return;

    const reply = {
      id: 'rep_' + Date.now(),
      senderRole: 'admin',
      senderName: `Root Admin (${currentUser?.name || 'Jason'})`,
      message: adminReplyText.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedReplies = [...(selectedTicket.replies || []), reply];
    const updatedTicket = {
      ...selectedTicket,
      replies: updatedReplies,
      status: selectedTicket.status === 'Open' ? 'In Review' : selectedTicket.status,
      updatedAt: new Date().toISOString()
    };

    if (db && db.supportTickets) {
      await db.supportTickets.update(selectedTicket.id, {
        replies: updatedReplies,
        status: updatedTicket.status,
        updatedAt: updatedTicket.updatedAt
      });
    }

    setSelectedTicket(updatedTicket);
    setAllTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    setAdminReplyText('');
    showToast("Reply posted to customer support ticket!", "success");
  };

  // Support-Assisted 2FA Reset
  const handleAssistDisable2FA = async (breeder) => {
    const confirm = window.confirm(`SECURITY OVERRIDE:\nAre you sure you want to disable 2FA for ${breeder.name} (${breeder.email})?\n\nVerify that you have inspected ownership signals (Rabbitry name, ARBA number, tattoos).`);
    if (!confirm) return;

    const updated = {
      ...breeder,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: []
    };

    await db.adminBreeders.update(breeder.id, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: []
    });

    setAdminBreeders(prev => prev.map(b => b.id === breeder.id ? updated : b));
    setSelectedRecoveryBreeder(updated);

    const log = await logSecurityEvent(breeder.id, 'ROOT_2FA_OVERRIDE', { adminUser: currentUser?.email }, 'critical');
    if (log) setSecurityLogs(prev => [log, ...prev]);

    showToast(`2FA has been disabled for ${breeder.email}. They can now log in with their password.`, "success");
    if (triggerConfetti) triggerConfetti();
  };

  // Support-Assisted Password Reset
  const handleAssistResetPassword = async (breeder) => {
    if (!recoveryNewPassword || recoveryNewPassword.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    await db.adminBreeders.update(breeder.id, {
      password: recoveryNewPassword,
      lastPasswordChange: new Date().toISOString()
    });

    const updated = { ...breeder, password: recoveryNewPassword };
    setAdminBreeders(prev => prev.map(b => b.id === breeder.id ? updated : b));
    setSelectedRecoveryBreeder(updated);
    setRecoveryNewPassword('');

    const log = await logSecurityEvent(breeder.id, 'ROOT_PASSWORD_OVERRIDE', { adminUser: currentUser?.email }, 'critical');
    if (log) setSecurityLogs(prev => [log, ...prev]);

    showToast(`Password updated for ${breeder.email}!`, "success");
  };

  // Support-Assisted Email Change
  const handleAssistChangeEmail = async (breeder) => {
    if (!recoveryNewEmail || !recoveryNewEmail.includes('@')) {
      alert("Please enter a valid email address.");
      return;
    }

    const oldEmail = breeder.email;
    const updated = { ...breeder, email: recoveryNewEmail.trim().toLowerCase() };

    await db.adminBreeders.update(breeder.id, { email: updated.email });
    setAdminBreeders(prev => prev.map(b => b.id === breeder.id ? updated : b));
    setSelectedRecoveryBreeder(updated);
    setRecoveryNewEmail('');

    const log = await logSecurityEvent(breeder.id, 'ROOT_EMAIL_OVERRIDE', { oldEmail, newEmail: updated.email, adminUser: currentUser?.email }, 'critical');
    if (log) setSecurityLogs(prev => [log, ...prev]);

    showToast(`Account email changed from ${oldEmail} to ${updated.email}!`, "success");
  };

  // Breeder Rabbits for ownership signal verification
  const breederRabbits = selectedRecoveryBreeder 
    ? allRabbits.filter(r => r.breederId === selectedRecoveryBreeder.id)
    : [];

  return (
    <div className="space-y-6 text-left">
      
      {/* Subtab Header */}
      <div className="flex border-b border-white/10 bg-slate-950/40 p-1 rounded-2xl gap-2 text-xs font-bold">
        <button
          onClick={() => setSubTab('tickets')}
          className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
            subTab === 'tickets' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white bg-transparent'
          }`}
        >
          <LifeBuoy className="w-4 h-4" /> Support Tickets ({allTickets.length})
        </button>
        <button
          onClick={() => setSubTab('recovery')}
          className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
            subTab === 'recovery' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white bg-transparent'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Account Recovery & Verification Desk
        </button>
        <button
          onClick={() => setSubTab('audit')}
          className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
            subTab === 'audit' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white bg-transparent'
          }`}
        >
          <Lock className="w-4 h-4" /> Security Audit Logs ({securityLogs.length})
        </button>
      </div>

      {/* SUBTAB 1: TICKETS INBOX */}
      {subTab === 'tickets' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="glass-container p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter Status:
              </span>
              {['All', 'Open', 'In Review', 'Resolved', 'Closed'].map(st => (
                <button
                  key={st}
                  onClick={() => setTicketFilterStatus(st)}
                  className={`text-[11px] font-bold py-1 px-3 rounded-lg border-none cursor-pointer ${
                    ticketFilterStatus === st ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
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
                className="bg-slate-900 border border-white/10 rounded-lg text-xs text-white p-1"
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

          {/* Master Detail View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Tickets List */}
            <div className="lg:col-span-5 space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
              {filteredTickets.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 glass-container">
                  No support tickets found matching current filters.
                </div>
              ) : (
                filteredTickets.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedTicket?.id === t.id 
                        ? 'bg-indigo-950/60 border-indigo-500 shadow-md' 
                        : 'bg-slate-900/80 border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-300">{t.ticketNumber}</span>
                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          t.priority === 'Urgent' || t.priority === 'Lockout Critical' ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        t.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300' :
                        t.status === 'In Review' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-indigo-500/20 text-indigo-300'
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-white line-clamp-1">{t.subject}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{t.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-white/5">
                      <span>From: {t.breederEmail}</span>
                      <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Ticket Details & Action Panel */}
            <div className="lg:col-span-7">
              {selectedTicket ? (
                <div className="glass-container p-6 border border-white/10 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-indigo-300">{selectedTicket.ticketNumber}</span>
                        <span className="text-xs text-slate-400">&bull; {selectedTicket.category}</span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">{selectedTicket.subject}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Status:</span>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleUpdateTicketStatus(selectedTicket.id, e.target.value)}
                        className="bg-slate-950 border border-white/20 rounded-lg text-xs font-bold text-white p-1.5 cursor-pointer"
                      >
                        <option value="Open">Open</option>
                        <option value="In Review">In Review</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  {/* Breeder context */}
                  <div className="p-3 bg-slate-950/60 border border-white/10 rounded-xl text-xs grid grid-cols-2 gap-2 text-slate-300">
                    <div>User: <strong className="text-white">{selectedTicket.breederEmail}</strong></div>
                    <div>Rabbitry: <strong className="text-white">{selectedTicket.rabbitryName || 'N/A'}</strong></div>
                    <div>Submitted: <strong className="text-white">{new Date(selectedTicket.createdAt).toLocaleString()}</strong></div>
                    <div>Priority: <strong className={selectedTicket.priority === 'Urgent' ? 'text-red-400' : 'text-slate-300'}>{selectedTicket.priority}</strong></div>
                  </div>

                  {/* Body description */}
                  <div className="p-4 bg-slate-950/40 border border-white/10 rounded-2xl text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                    {selectedTicket.description}
                  </div>

                  {selectedTicket.screenshot && (
                    <div>
                      <span className="text-xs font-bold text-slate-400 block mb-1">Attached Screenshot:</span>
                      <img src={selectedTicket.screenshot} alt="Attachment" className="max-h-72 rounded-xl border border-white/10" />
                    </div>
                  )}

                  {/* Conversation Replies */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Responses & Audit Thread</h4>
                    {selectedTicket.replies?.map(rep => (
                      <div 
                        key={rep.id} 
                        className={`p-3.5 rounded-xl border text-xs ${
                          rep.senderRole === 'admin' 
                            ? 'bg-indigo-950/50 border-indigo-500/30' 
                            : 'bg-slate-950/60 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <strong className="text-white">{rep.senderName}</strong>
                          <span className="text-[10px] text-slate-400">{new Date(rep.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-200 whitespace-pre-line leading-relaxed">{rep.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Reply form */}
                  <form onSubmit={handleSendAdminReply} className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-slate-300 block">Post Official Support Reply</label>
                    <textarea
                      rows={3}
                      required
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      placeholder="Type response to breeder..."
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white resize-none"
                    />
                    <button
                      type="submit"
                      className="btn-interactive py-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl border-none flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-4 h-4" /> Reply & Update Customer
                    </button>
                  </form>
                </div>
              ) : (
                <div className="glass-container p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-3 min-h-[400px]">
                  <MessageSquare className="w-10 h-10 text-indigo-400/50" />
                  <span>Select a ticket on the left to view customer conversation and take support actions.</span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* SUBTAB 2: SUPPORT-ASSISTED ACCOUNT RECOVERY */}
      {subTab === 'recovery' && (
        <div className="space-y-6">
          <div className="glass-container p-6 border border-white/10 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-400" /> Account Verification & Ownership Signals
              </h3>
              <p className="text-xs text-slate-400">
                To prevent unauthorized account takeovers, examine registered signals before performing overrides.
              </p>
            </div>

            {/* Breeder Search */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Lookup breeder by name, email, or rabbitry..."
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white"
              />
            </div>

            {searchUserQuery && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {allBreeders
                  .filter(b => 
                    b.name?.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
                    b.email?.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
                    b.rabbitryName?.toLowerCase().includes(searchUserQuery.toLowerCase())
                  )
                  .map(b => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedRecoveryBreeder(b)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedRecoveryBreeder?.id === b.id 
                          ? 'bg-indigo-950/60 border-indigo-500' 
                          : 'bg-slate-900/60 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <h4 className="font-bold text-xs text-white">{b.name}</h4>
                      <p className="text-[11px] text-indigo-300">{b.email}</p>
                      <p className="text-[10px] text-slate-400">{b.rabbitryName}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Selected Breeder Recovery Inspector */}
          {selectedRecoveryBreeder && (
            <div className="glass-container p-6 border-2 border-indigo-500/30 rounded-3xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white">{selectedRecoveryBreeder.name}</h3>
                  <p className="text-xs text-indigo-300">{selectedRecoveryBreeder.email} &bull; {selectedRecoveryBreeder.rabbitryName}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  selectedRecoveryBreeder.twoFactorEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {selectedRecoveryBreeder.twoFactorEnabled ? '2FA Active' : '2FA Disabled'}
                </span>
              </div>

              {/* Ownership Signals Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950/60 border border-white/10 rounded-2xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">ARBA / Youth Member #</span>
                  <span className="text-sm font-mono font-bold text-white mt-1 block">
                    {selectedRecoveryBreeder.arbaMemberNumber || 'Not Linked'}
                  </span>
                </div>
                <div className="p-4 bg-slate-950/60 border border-white/10 rounded-2xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Purebred Herd Size</span>
                  <span className="text-sm font-bold text-indigo-300 mt-1 block">
                    {breederRabbits.length} Animals Registered
                  </span>
                </div>
                <div className="p-4 bg-slate-950/60 border border-white/10 rounded-2xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Sample Ear Tattoos</span>
                  <span className="text-xs font-mono text-slate-200 mt-1 block">
                    {breederRabbits.slice(0, 4).map(r => r.tattooNumber).join(', ') || 'None recorded'}
                  </span>
                </div>
              </div>

              {/* Recovery Actions */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider text-slate-400">Available Support Recovery Actions</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Action 1: Disable 2FA */}
                  <div className="p-4 bg-slate-950/70 border border-white/10 rounded-2xl flex flex-col justify-between gap-3">
                    <div>
                      <strong className="text-xs text-white block">Disable 2FA Temporarily</strong>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Clears authenticator requirement so the user can log in with their password and re-pair.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={!selectedRecoveryBreeder.twoFactorEnabled}
                      onClick={() => handleAssistDisable2FA(selectedRecoveryBreeder)}
                      className="btn-interactive py-2 px-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl border-none cursor-pointer"
                    >
                      Disable User 2FA
                    </button>
                  </div>

                  {/* Action 2: Reset Password */}
                  <div className="p-4 bg-slate-950/70 border border-white/10 rounded-2xl flex flex-col justify-between gap-3">
                    <div>
                      <strong className="text-xs text-white block">Set Temporary Password</strong>
                      <input
                        type="text"
                        placeholder="New password (8+ chars)"
                        value={recoveryNewPassword}
                        onChange={(e) => setRecoveryNewPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-1.5 text-xs text-white mt-1 font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={!recoveryNewPassword}
                      onClick={() => handleAssistResetPassword(selectedRecoveryBreeder)}
                      className="btn-interactive py-2 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl border-none cursor-pointer"
                    >
                      Update Password
                    </button>
                  </div>

                  {/* Action 3: Change Email */}
                  <div className="p-4 bg-slate-950/70 border border-white/10 rounded-2xl flex flex-col justify-between gap-3">
                    <div>
                      <strong className="text-xs text-white block">Update Account Email</strong>
                      <input
                        type="email"
                        placeholder="new.email@example.com"
                        value={recoveryNewEmail}
                        onChange={(e) => setRecoveryNewEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-1.5 text-xs text-white mt-1"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={!recoveryNewEmail}
                      onClick={() => handleAssistChangeEmail(selectedRecoveryBreeder)}
                      className="btn-interactive py-2 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl border-none cursor-pointer"
                    >
                      Update Email
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: SECURITY AUDIT LOGS */}
      {subTab === 'audit' && (
        <div className="glass-container p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-400" /> Append-Only Security & Recovery Audit Trail
              </h3>
              <p className="text-xs text-slate-400">
                Immutable record of password resets, 2FA events, session revocations, and Root administrative overrides.
              </p>
            </div>
            <button
              onClick={async () => {
                const logs = await db.securityLogs.toArray();
                setSecurityLogs(logs.reverse());
                showToast("Security logs refreshed.", "info");
              }}
              className="btn-interactive py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-white/10 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Logs
            </button>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {securityLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No security audit events recorded yet.
              </div>
            ) : (
              securityLogs.map(log => (
                <div 
                  key={log.id} 
                  className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    log.severity === 'critical' ? 'bg-red-950/40 border-red-500/40' :
                    log.severity === 'warning' ? 'bg-amber-950/40 border-amber-500/40' :
                    'bg-slate-900/60 border-white/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-white">{log.eventType}</span>
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        log.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                        log.severity === 'warning' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {log.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Account: <strong className="text-slate-200">{log.breederId}</strong> &bull; {log.details}
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
