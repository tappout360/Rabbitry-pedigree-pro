import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, UserPlus, Key, Lock, Ban, Check, X, 
  AlertTriangle, Clock, RefreshCw, Eye, Edit3, ShieldAlert
} from 'lucide-react';
import { StaffRoleService, STAFF_ROLES, STAFF_PERMISSIONS, ROLE_CAPABILITIES } from '../../../services/StaffRoleService';

export default function TeamControlTab({
  currentUser,
  showToast
}) {
  const [staffMembers, setStaffMembers] = useState([]);
  const [staffLogs, setStaffLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState(STAFF_ROLES.SUPPORT_LEAD);
  const [inviteNotes, setInviteNotes] = useState('');

  // Edit Permissions Modal
  const [selectedStaffToEdit, setSelectedStaffToEdit] = useState(null);
  const [editPermissionsList, setEditPermissionsList] = useState([]);

  const isOwner = StaffRoleService.isOwner(currentUser);

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    setIsLoading(true);
    try {
      const [members, logs] = await Promise.all([
        StaffRoleService.listStaffMembers(),
        StaffRoleService.getStaffAuditLogs(50)
      ]);
      setStaffMembers(members);
      setStaffLogs(logs);
    } catch (err) {
      console.warn('Error loading team data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Invite
  const handleInviteStaff = async (e) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      showToast('Name and email are required.', 'error');
      return;
    }

    try {
      await StaffRoleService.inviteStaffMember({
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
        notes: inviteNotes.trim()
      }, currentUser);

      showToast(`Invited ${inviteName} as ${inviteRole.toUpperCase()}!`, 'success');
      setShowInviteModal(false);
      setInviteName('');
      setInviteEmail('');
      setInviteNotes('');
      await loadTeamData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Revoke Staff
  const handleRevokeStaff = async (staffId, name) => {
    const reason = window.prompt(`Enter reason for revoking access for ${name}:`);
    if (!reason) return;

    try {
      await StaffRoleService.revokeStaffMember(staffId, reason, currentUser);
      showToast(`Access revoked for ${name}.`, 'warning');
      await loadTeamData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Save Permissions Edit
  const handleSavePermissions = async () => {
    if (!selectedStaffToEdit) return;
    try {
      await StaffRoleService.updateStaffMember(selectedStaffToEdit.id, {
        permissions: editPermissionsList
      }, currentUser);

      showToast(`Updated permissions for ${selectedStaffToEdit.name}.`, 'success');
      setSelectedStaffToEdit(null);
      await loadTeamData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const togglePermission = (perm) => {
    setEditPermissionsList(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header Banner */}
      <div className="glass-container p-6 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-white text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Team Delegation & Staff Governance
          </h4>
          <p className="text-xs text-slate-400">
            Delegate day-to-day operations to trusted helpers with strict least-privilege boundaries. Owner retains absolute veto and audit authority.
          </p>
        </div>

        {isOwner && (
          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Invite Team Member
          </button>
        )}
      </div>

      {/* Staff Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staffMembers.map(staff => {
          const isStaffOwner = staff.role === STAFF_ROLES.OWNER || staff.isImmutable;
          const isRevoked = staff.status === 'revoked';

          return (
            <div
              key={staff.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 ${
                isStaffOwner
                  ? 'bg-gradient-to-br from-indigo-950/70 via-slate-900 to-purple-950/70 border-indigo-500/40 shadow-lg'
                  : isRevoked
                  ? 'bg-slate-950/60 border-rose-500/30 opacity-75'
                  : 'bg-slate-900/80 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-black text-white text-sm">{staff.name}</h5>
                      {isStaffOwner && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          👑 Owner
                        </span>
                      )}
                      {isRevoked && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Revoked
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{staff.email}</div>
                  </div>

                  <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-xl ${
                    staff.role === STAFF_ROLES.OWNER ? 'bg-indigo-600 text-white' :
                    staff.role === STAFF_ROLES.SUPPORT_LEAD ? 'bg-sky-600/30 text-sky-300 border border-sky-500/30' :
                    staff.role === STAFF_ROLES.BILLING_ADMIN ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30' :
                    staff.role === STAFF_ROLES.CONTENT_MODERATOR ? 'bg-amber-600/30 text-amber-300 border border-amber-500/30' :
                    staff.role === STAFF_ROLES.TECH_OPS ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {staff.role.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
                  {staff.notes || 'Team member'}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Permissions: <strong className="text-white">{(staff.permissions || []).length} active</strong></span>
                  <span>Last active: {new Date(staff.lastActive).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {isOwner && !isStaffOwner && (
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStaffToEdit(staff);
                      setEditPermissionsList(staff.permissions || []);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Permissions
                  </button>

                  {!isRevoked && (
                    <button
                      type="button"
                      onClick={() => handleRevokeStaff(staff.id, staff.name)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold flex items-center gap-1.5 border border-rose-500/20"
                    >
                      <Ban className="w-3.5 h-3.5" /> Revoke Access
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Staff Action Audit Trail */}
      <div className="glass-container p-6 border border-white/10 rounded-3xl space-y-4">
        <h4 className="font-bold text-white text-base flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          Live Team Staff Audit Trail
        </h4>
        <p className="text-xs text-slate-400">
          Every action taken by any team member (invitations, ticket responses, password resets, flag updates) is recorded here with full context.
        </p>

        <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
          {staffLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-dashed border-white/10">
              No staff activity recorded yet.
            </div>
          ) : (
            staffLogs.map(log => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-900 border border-white/10 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <strong className="text-white">{log.staffName}</strong>
                    <span className="text-[10px] font-mono text-indigo-300 font-bold bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">{log.details}</p>
                </div>

                <div className="text-[10px] text-slate-500 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Invite Staff Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in text-left">
          <div className="relative w-full max-w-md bg-slate-950 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-indigo-400">
              <UserPlus className="w-6 h-6" />
              <div>
                <h4 className="font-bold text-white text-base">Invite Team Member</h4>
                <p className="text-[11px] text-slate-400">Delegate tasks with least-privilege permissions</p>
              </div>
            </div>

            <form onSubmit={handleInviteStaff} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Alex Cooper"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. alex@rabbitrypedigree.pro"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Staff Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value={STAFF_ROLES.SUPPORT_LEAD}>Support Lead (Tickets, User Recovery)</option>
                  <option value={STAFF_ROLES.BILLING_ADMIN}>Billing Admin (Subscriptions, Invoices)</option>
                  <option value={STAFF_ROLES.CONTENT_MODERATOR}>Content Moderator (Marketplace, Knowledge)</option>
                  <option value={STAFF_ROLES.TECH_OPS}>Tech Ops (Flags, Maintenance, Releases)</option>
                  <option value={STAFF_ROLES.READ_ONLY_ANALYST}>Read-Only Analyst (Metrics & Logs Only)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Role Description / Assignment Notes</label>
                <textarea
                  rows={2}
                  value={inviteNotes}
                  onChange={(e) => setInviteNotes(e.target.value)}
                  placeholder="e.g. Handles customer questions during Pacific time zone"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {selectedStaffToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in text-left">
          <div className="relative w-full max-w-lg bg-slate-950 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h4 className="font-bold text-white text-base">Custom Permissions: {selectedStaffToEdit.name}</h4>
                <p className="text-[11px] text-slate-400">Configure exact operational capability boundaries</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStaffToEdit(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs max-h-[380px] overflow-y-auto pr-1">
              {Object.entries(STAFF_PERMISSIONS).map(([key, permVal]) => {
                const isChecked = editPermissionsList.includes(permVal);
                const isOwnerOnly = permVal === STAFF_PERMISSIONS.CAN_DELETE_USERS || permVal === STAFF_PERMISSIONS.CAN_MANAGE_TEAM;

                return (
                  <label
                    key={key}
                    className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-indigo-950/60 border-indigo-500 text-white'
                        : 'bg-slate-900 border-white/5 text-slate-400'
                    } ${isOwnerOnly ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="checkbox"
                      disabled={isOwnerOnly}
                      checked={isChecked}
                      onChange={() => togglePermission(permVal)}
                      className="mt-0.5 rounded text-indigo-600"
                    />
                    <div>
                      <div className="font-bold text-[11px]">{key.replace('CAN_', '')}</div>
                      {isOwnerOnly && <div className="text-[9px] text-amber-400 font-mono">Owner exclusive</div>}
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedStaffToEdit(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
