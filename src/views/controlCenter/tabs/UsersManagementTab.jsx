import React, { useState } from 'react';
import { 
  Users, Search, Shield, Eye, Lock, LogOut, Trash2, AlertTriangle, 
  CheckCircle, Mail, Phone, Calendar, Award, ExternalLink, RefreshCw, 
  UserCheck, ShieldAlert, HeartHandshake, FileText, Smartphone, Ban
} from 'lucide-react';
import DangerConfirmModal from '../components/DangerConfirmModal';
import { StaffRoleService } from '../../../services/StaffRoleService';

export default function UsersManagementTab({
  allBreeders = [],
  setAdminBreeders,
  currentUser,
  showToast,
  onStartImpersonation
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all'); // 'all', 'pro', 'youth', 'suspended'
  const [selectedUser, setSelectedUser] = useState(null);

  // Danger Modal State
  const [dangerModalConfig, setDangerModalConfig] = useState({
    isOpen: false,
    title: '',
    description: '',
    confirmKeyword: 'CONFIRM',
    actionButtonText: 'Execute',
    actionHandler: null
  });

  // Impersonation Reason Prompt Modal
  const [showImpersonatePrompt, setShowImpersonatePrompt] = useState(false);
  const [impersonateTarget, setImpersonateTarget] = useState(null);
  const [impersonateReason, setImpersonateReason] = useState('');

  // Password Reset result modal
  const [tempPasswordResult, setTempPasswordResult] = useState(null);

  const isOwner = StaffRoleService.isOwner(currentUser);

  // Filter users
  const filteredUsers = allBreeders.filter(u => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q || 
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.rabbitryName && u.rabbitryName.toLowerCase().includes(q)) ||
      (u.id && u.id.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q));

    if (!matchQuery) return false;

    if (filterRole === 'pro') return u.subscriptionTier === 'pro' || u.subscriptionTier === 'family';
    if (filterRole === 'youth') return u.isYouth || u.ageGroup === 'youth';
    if (filterRole === 'suspended') return u.status === 'suspended' || u.isSuspended;

    return true;
  });

  // Action 1: Start Impersonation
  const handleTriggerImpersonation = (user) => {
    setImpersonateTarget(user);
    setImpersonateReason('');
    setShowImpersonatePrompt(true);
  };

  const handleConfirmImpersonation = (e) => {
    e.preventDefault();
    if (!impersonateReason.trim() || impersonateReason.trim().length < 6) {
      showToast('A clear support reason (min 6 characters) is required for audit logs.', 'error');
      return;
    }
    setShowImpersonatePrompt(false);
    onStartImpersonation(impersonateTarget, impersonateReason.trim());
  };

  // Action 2: Reset Password (generates temporary credential)
  const handleResetPassword = (user) => {
    setDangerModalConfig({
      isOpen: true,
      title: `Reset Password: ${user.name || user.rabbitryName}`,
      description: `This will invalidate the current password for ${user.email} and generate a secure temporary credential.`,
      confirmKeyword: 'RESET',
      actionButtonText: 'Generate Temp Password',
      actionHandler: async ({ reason }) => {
        const tempPass = 'Rabbitry!' + Math.random().toString(36).substring(2, 7) + Math.floor(100 + Math.random() * 900);
        
        // Update user in local state
        setAdminBreeders(prev => prev.map(b => b.id === user.id ? { ...b, password: tempPass, mustChangePassword: true } : b));
        
        await StaffRoleService.logStaffAction({
          staffId: currentUser?.id,
          staffName: currentUser?.name,
          action: 'PASSWORD_RESET',
          targetUserId: user.id,
          details: `Temporary password generated for ${user.email}. Reason: ${reason}`
        });

        setTempPasswordResult({ email: user.email, tempPass });
        showToast('Password reset successful!', 'success');
        setDangerModalConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Action 3: Force Logout / Revoke Sessions
  const handleForceLogout = (user) => {
    setDangerModalConfig({
      isOpen: true,
      title: `Force Logout & Revoke Sessions: ${user.name}`,
      description: `Immediately invalidates all active browser tokens and PWA sessions for ${user.email}. The user will be required to re-login.`,
      confirmKeyword: 'REVOKE',
      actionButtonText: 'Revoke All Sessions',
      actionHandler: async ({ reason }) => {
        setAdminBreeders(prev => prev.map(b => b.id === user.id ? { ...b, sessionRevocationTimestamp: Date.now() } : b));

        await StaffRoleService.logStaffAction({
          staffId: currentUser?.id,
          staffName: currentUser?.name,
          action: 'SESSIONS_REVOKED',
          targetUserId: user.id,
          details: `All active sessions revoked for ${user.email}. Reason: ${reason}`
        });

        showToast(`Revoked all active sessions for ${user.name}.`, 'success');
        setDangerModalConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Action 4: Suspend / Reinstate User
  const handleToggleSuspend = (user) => {
    const isSuspended = user.status === 'suspended' || user.isSuspended;
    const actionLabel = isSuspended ? 'Reinstate' : 'Suspend';

    setDangerModalConfig({
      isOpen: true,
      title: `${actionLabel} Account: ${user.name}`,
      description: isSuspended 
        ? `Restore full platform access for ${user.email}.`
        : `Temporarily lock ${user.email} out of the platform. Offline barn records will remain read-only.`,
      confirmKeyword: actionLabel.toUpperCase(),
      actionButtonText: `${actionLabel} Account`,
      actionHandler: async ({ reason }) => {
        const nextStatus = isSuspended ? 'active' : 'suspended';
        setAdminBreeders(prev => prev.map(b => b.id === user.id ? { ...b, status: nextStatus, isSuspended: !isSuspended } : b));

        await StaffRoleService.logStaffAction({
          staffId: currentUser?.id,
          staffName: currentUser?.name,
          action: isSuspended ? 'ACCOUNT_REINSTATED' : 'ACCOUNT_SUSPENDED',
          targetUserId: user.id,
          details: `Account ${actionLabel.toLowerCase()}ed for ${user.email}. Reason: ${reason}`
        });

        showToast(`Account successfully ${actionLabel.toLowerCase()}ed.`, 'success');
        setDangerModalConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Action 5: Soft Delete Account (Owner Only)
  const handleSoftDelete = (user) => {
    if (!isOwner) {
      showToast('Account deletion is restricted strictly to the primary App Owner.', 'error');
      return;
    }

    setDangerModalConfig({
      isOpen: true,
      title: `Soft-Delete Account: ${user.name}`,
      description: `WARNING: This queues ${user.email} for permanent deletion. A 30-day soft-delete grace window is applied during which the account can be restored.`,
      confirmKeyword: 'DELETE',
      actionButtonText: 'Queue for Soft Deletion',
      actionHandler: async ({ reason }) => {
        const restoreDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        setAdminBreeders(prev => prev.filter(b => b.id !== user.id));

        await StaffRoleService.logStaffAction({
          staffId: currentUser?.id,
          staffName: currentUser?.name,
          action: 'ACCOUNT_SOFT_DELETED',
          targetUserId: user.id,
          details: `Soft-deleted user ${user.email}. Recovery deadline: ${restoreDeadline}. Reason: ${reason}`
        });

        showToast(`Account queued for soft deletion (30-day restore window).`, 'warning');
        setDangerModalConfig(prev => ({ ...prev, isOpen: false }));
        setSelectedUser(null);
      }
    });
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header & Search Bar */}
      <div className="glass-container p-5 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Universal User & Account Administration
            </h3>
            <p className="text-xs text-slate-400">
              Search breeders, inspect memberships, assist credential recovery, and manage youth guardian protection.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span>{filteredUsers.length} matching accounts</span>
          </div>
        </div>

        {/* Search Input & Filter Pills */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, rabbitry, tattoo prefix, account ID..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
            {[
              { id: 'all', label: 'All Users' },
              { id: 'pro', label: 'Pro / Family' },
              { id: 'youth', label: 'Youth 4-H' },
              { id: 'suspended', label: 'Suspended' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterRole(f.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  filterRole === f.id
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split Layout: User Directory List & User Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Users List (7 Cols) */}
        <div className="lg:col-span-7 space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center glass-container text-xs text-slate-400">
              No accounts found matching search filters.
            </div>
          ) : (
            filteredUsers.map(user => {
              const isSelected = selectedUser?.id === user.id;
              const isSuspended = user.status === 'suspended' || user.isSuspended;

              return (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-indigo-950/70 border-indigo-500 shadow-md'
                      : 'bg-slate-900/80 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-white text-xs font-bold">{user.name || user.rabbitryName}</strong>
                      <span className="text-[10px] font-mono text-slate-400">({user.email})</span>
                      
                      {/* Tier Badge */}
                      <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
                        user.subscriptionTier === 'pro' ? 'bg-purple-900/60 text-purple-300 border border-purple-500/30' :
                        user.subscriptionTier === 'family' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {user.subscriptionTier || 'free'}
                      </span>

                      {/* Youth Badge */}
                      {user.isYouth && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-900/50 text-amber-300 border border-amber-500/30">
                          Youth 4-H
                        </span>
                      )}

                      {/* Suspended Badge */}
                      {isSuspended && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-900/60 text-rose-300 border border-rose-500/30">
                          Suspended
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Rabbitry: {user.rabbitryName || 'Individual Breeder'}</span>
                      <span>&bull;</span>
                      <span>ID: <code className="font-mono text-[10px]">{user.id}</code></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTriggerImpersonation(user);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-bold flex items-center gap-1 border border-amber-500/20"
                      title="Support-Only: View app as this user"
                    >
                      <Eye className="w-3.5 h-3.5" /> Impersonate
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected User Detail Drawer (5 Cols) */}
        <div className="lg:col-span-5">
          {selectedUser ? (
            <div className="glass-container p-6 border border-indigo-500/30 rounded-3xl space-y-5 sticky top-6">
              
              {/* Profile Card Header */}
              <div className="border-b border-white/10 pb-4 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-white text-base">{selectedUser.name || 'Unnamed Breeder'}</h4>
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    selectedUser.status === 'suspended' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {selectedUser.status || 'Active'}
                  </span>
                </div>
                <p className="text-xs text-indigo-300 font-mono">{selectedUser.email}</p>
                <p className="text-xs text-slate-400">{selectedUser.rabbitryName || 'Rabbitry'}</p>
              </div>

              {/* Account Metadata Details */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Account ID:</span>
                  <span className="font-mono text-white text-[11px]">{selectedUser.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Subscription Tier:</span>
                  <span className="font-bold text-purple-300 uppercase">{selectedUser.subscriptionTier || 'Free'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">ARBA Member #:</span>
                  <span className="font-mono text-white">{selectedUser.arbaMemberNumber || 'Not set'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Phone:</span>
                  <span className="text-white">{selectedUser.phone || 'None'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Youth Account:</span>
                  <span className="font-bold text-white">{selectedUser.isYouth ? '✅ Yes (Protected)' : 'No'}</span>
                </div>
                {selectedUser.isYouth && (
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Parental Consent:</span>
                    <span className="font-bold text-emerald-400">
                      {selectedUser.parentalConsentVerified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons Panel */}
              <div className="space-y-2 pt-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Operational Control Actions
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Reset Password */}
                  <button
                    type="button"
                    onClick={() => handleResetPassword(selectedUser)}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-white/10 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" /> Reset Password
                  </button>

                  {/* Force Logout */}
                  <button
                    type="button"
                    onClick={() => handleForceLogout(selectedUser)}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-white/10 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Force Logout
                  </button>

                  {/* Suspend / Reinstate */}
                  <button
                    type="button"
                    onClick={() => handleToggleSuspend(selectedUser)}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 border border-white/10 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    {selectedUser.status === 'suspended' ? 'Reinstate' : 'Suspend'}
                  </button>

                  {/* Soft Delete */}
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => handleSoftDelete(selectedUser)}
                      className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Soft Delete
                    </button>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-container p-12 text-center text-xs text-slate-500 rounded-3xl border border-dashed border-white/10">
              Select a user profile from the directory to inspect account details, trigger credential recovery, or begin support impersonation.
            </div>
          )}
        </div>

      </div>

      {/* Impersonation Prompt Modal */}
      {showImpersonatePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-left">
          <div className="relative w-full max-w-md bg-slate-950 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <Eye className="w-6 h-6 animate-pulse" />
              <div>
                <h4 className="font-bold text-white text-base">Support Impersonation Mode</h4>
                <p className="text-[11px] text-amber-300/80">Support-Only &bull; Auto-expires in 15 minutes</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to view the platform from the perspective of <strong className="text-white">{impersonateTarget?.name || impersonateTarget?.email}</strong>.
              All actions are watermarked and logged to the central security audit trail.
            </p>

            <form onSubmit={handleConfirmImpersonation} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Mandatory Support Reason <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={impersonateReason}
                  onChange={(e) => setImpersonateReason(e.target.value)}
                  placeholder="e.g. Investigating missing pedigree link on Ticket #892"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImpersonatePrompt(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-600/30"
                >
                  Start Impersonation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Temporary Password Result Modal */}
      {tempPasswordResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in text-left">
          <div className="relative w-full max-w-md bg-slate-950 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-400">
              <CheckCircle className="w-6 h-6" />
              <div>
                <h4 className="font-bold text-white text-base">Temporary Password Generated</h4>
                <p className="text-[11px] text-slate-400">User will be prompted to reset upon login</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl border border-white/10 space-y-2">
              <div className="text-xs text-slate-400">Account: <strong className="text-white">{tempPasswordResult.email}</strong></div>
              <div className="text-xs text-slate-400">Temporary Password:</div>
              <div className="font-mono text-sm font-black text-emerald-300 bg-slate-950 p-2.5 rounded-xl border border-emerald-500/30 select-all">
                {tempPasswordResult.tempPass}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setTempPasswordResult(null)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Danger Action Confirmation Modal */}
      <DangerConfirmModal
        isOpen={dangerModalConfig.isOpen}
        onClose={() => setDangerModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={dangerModalConfig.actionHandler}
        title={dangerModalConfig.title}
        description={dangerModalConfig.description}
        confirmKeyword={dangerModalConfig.confirmKeyword}
        actionButtonText={dangerModalConfig.actionButtonText}
      />

    </div>
  );
}
