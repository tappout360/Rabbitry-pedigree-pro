/**
 * StaffRoleService.js
 * Comprehensive Staff Delegation, Role-Based Access Control, and Governance System
 * Gives the App Owner full control to delegate tasks to team members with least-privilege boundaries.
 * WarrenWise Pro / RabbitryPedigree Pro (rabbitrypedigreepro.com)
 */
import { db } from '../db/registryDb';
import { logSecurityEvent } from './AccountSecurityService';

export const STAFF_ROLES = {
  OWNER: 'owner',                     // App Owner (Jason Mounts) — Full immutable God Mode
  SUPPORT_LEAD: 'support_lead',       // Support & Recovery Desk, User Assistance, Canned Responses
  BILLING_ADMIN: 'billing_admin',     // Subscription management, manual invoice reconciliation, comp codes
  CONTENT_MODERATOR: 'content_moderator', // Marketplace listings, community articles, animal welfare alerts
  TECH_OPS: 'tech_ops',               // Feature flags, release channels, system diagnostics, maintenance
  READ_ONLY_ANALYST: 'read_only_analyst' // Business Intelligence, dashboards, metrics CSV exports
};

export const STAFF_PERMISSIONS = {
  // User Management
  CAN_VIEW_USERS: 'CAN_VIEW_USERS',
  CAN_RESET_USER_PASSWORDS: 'CAN_RESET_USER_PASSWORDS',
  CAN_FORCE_LOGOUT_USERS: 'CAN_FORCE_LOGOUT_USERS',
  CAN_SUSPEND_USERS: 'CAN_SUSPEND_USERS',
  CAN_DELETE_USERS: 'CAN_DELETE_USERS',             // OWNER ONLY
  CAN_IMPERSONATE_USERS: 'CAN_IMPERSONATE_USERS',   // OWNER & SUPPORT_LEAD (with mandatory reason)

  // Subscriptions & Revenue
  CAN_MANAGE_SUBSCRIPTIONS: 'CAN_MANAGE_SUBSCRIPTIONS',
  CAN_GRANT_COMP_PLANS: 'CAN_GRANT_COMP_PLANS',     // OWNER ONLY
  CAN_RECONCILE_BILLING: 'CAN_RECONCILE_BILLING',

  // Support Operations
  CAN_MANAGE_TICKETS: 'CAN_MANAGE_TICKETS',
  CAN_RECOVER_USER_2FA: 'CAN_RECOVER_USER_2FA',     // Requires verification checklist

  // Data Integrity & Backups
  CAN_TRIGGER_BACKUPS: 'CAN_TRIGGER_BACKUPS',
  CAN_EXECUTE_REPAIRS: 'CAN_EXECUTE_REPAIRS',
  CAN_FREEZE_OPERATIONS: 'CAN_FREEZE_OPERATIONS',   // OWNER ONLY

  // Moderation
  CAN_MODERATE_CONTENT: 'CAN_MODERATE_CONTENT',
  CAN_MODERATE_SAFETY: 'CAN_MODERATE_SAFETY',
  CAN_LOCKDOWN_YOUTH: 'CAN_LOCKDOWN_YOUTH',

  // System & Flags
  CAN_MANAGE_FLAGS: 'CAN_MANAGE_FLAGS',
  CAN_TOGGLE_MAINTENANCE: 'CAN_TOGGLE_MAINTENANCE',
  CAN_ENFORCE_VERSIONS: 'CAN_ENFORCE_VERSIONS',

  // Governance & Security
  CAN_VIEW_AUDIT_LOGS: 'CAN_VIEW_AUDIT_LOGS',
  CAN_MANAGE_TEAM: 'CAN_MANAGE_TEAM'                // OWNER ONLY
};

// Default capability matrix for each role
export const ROLE_CAPABILITIES = {
  [STAFF_ROLES.OWNER]: Object.values(STAFF_PERMISSIONS), // Owner has access to all permissions

  [STAFF_ROLES.SUPPORT_LEAD]: [
    STAFF_PERMISSIONS.CAN_VIEW_USERS,
    STAFF_PERMISSIONS.CAN_RESET_USER_PASSWORDS,
    STAFF_PERMISSIONS.CAN_FORCE_LOGOUT_USERS,
    STAFF_PERMISSIONS.CAN_SUSPEND_USERS,
    STAFF_PERMISSIONS.CAN_IMPERSONATE_USERS,
    STAFF_PERMISSIONS.CAN_MANAGE_TICKETS,
    STAFF_PERMISSIONS.CAN_RECOVER_USER_2FA,
    STAFF_PERMISSIONS.CAN_VIEW_AUDIT_LOGS
  ],

  [STAFF_ROLES.BILLING_ADMIN]: [
    STAFF_PERMISSIONS.CAN_VIEW_USERS,
    STAFF_PERMISSIONS.CAN_MANAGE_SUBSCRIPTIONS,
    STAFF_PERMISSIONS.CAN_RECONCILE_BILLING,
    STAFF_PERMISSIONS.CAN_VIEW_AUDIT_LOGS
  ],

  [STAFF_ROLES.CONTENT_MODERATOR]: [
    STAFF_PERMISSIONS.CAN_VIEW_USERS,
    STAFF_PERMISSIONS.CAN_MODERATE_CONTENT,
    STAFF_PERMISSIONS.CAN_MODERATE_SAFETY,
    STAFF_PERMISSIONS.CAN_LOCKDOWN_YOUTH,
    STAFF_PERMISSIONS.CAN_VIEW_AUDIT_LOGS
  ],

  [STAFF_ROLES.TECH_OPS]: [
    STAFF_PERMISSIONS.CAN_TRIGGER_BACKUPS,
    STAFF_PERMISSIONS.CAN_EXECUTE_REPAIRS,
    STAFF_PERMISSIONS.CAN_MANAGE_FLAGS,
    STAFF_PERMISSIONS.CAN_TOGGLE_MAINTENANCE,
    STAFF_PERMISSIONS.CAN_ENFORCE_VERSIONS,
    STAFF_PERMISSIONS.CAN_VIEW_AUDIT_LOGS
  ],

  [STAFF_ROLES.READ_ONLY_ANALYST]: [
    STAFF_PERMISSIONS.CAN_VIEW_USERS,
    STAFF_PERMISSIONS.CAN_VIEW_AUDIT_LOGS
  ]
};

// Allowed UI Modules for each staff role
export const ROLE_MODULES = {
  [STAFF_ROLES.OWNER]: [
    'command_home', 'users', 'subscriptions', 'support', 
    'backups', 'moderation', 'flags', 'system', 'analytics', 'security', 'team'
  ],
  [STAFF_ROLES.SUPPORT_LEAD]: [
    'command_home', 'users', 'support', 'security'
  ],
  [STAFF_ROLES.BILLING_ADMIN]: [
    'command_home', 'users', 'subscriptions', 'analytics'
  ],
  [STAFF_ROLES.CONTENT_MODERATOR]: [
    'command_home', 'moderation', 'users'
  ],
  [STAFF_ROLES.TECH_OPS]: [
    'command_home', 'backups', 'flags', 'system', 'security'
  ],
  [STAFF_ROLES.READ_ONLY_ANALYST]: [
    'command_home', 'analytics', 'users', 'subscriptions', 'security'
  ]
};

// Initial default staff members for team delegation
const DEFAULT_STAFF_MEMBERS = [
  {
    id: 'staff-owner-1',
    name: 'Jason Mounts (App Owner)',
    email: 'jasonmounts77@yahoo.com',
    role: STAFF_ROLES.OWNER,
    status: 'active',
    invitedAt: '2026-01-01T00:00:00Z',
    lastActive: new Date().toISOString(),
    isImmutable: true,
    permissions: Object.values(STAFF_PERMISSIONS),
    notes: 'Primary application creator & root system administrator.'
  },
  {
    id: 'staff-supp-1',
    name: 'Sarah Jenkins',
    email: 'sarah.support@rabbitrypedigree.pro',
    role: STAFF_ROLES.SUPPORT_LEAD,
    status: 'active',
    invitedAt: '2026-08-15T10:00:00Z',
    lastActive: new Date(Date.now() - 3600000 * 4).toISOString(),
    isImmutable: false,
    permissions: ROLE_CAPABILITIES[STAFF_ROLES.SUPPORT_LEAD],
    notes: 'Handles user support inquiries, pedigree reconstruction, and assisted 2FA resets.'
  },
  {
    id: 'staff-bill-1',
    name: 'Marcus Chen',
    email: 'marcus.finance@rabbitrypedigree.pro',
    role: STAFF_ROLES.BILLING_ADMIN,
    status: 'active',
    invitedAt: '2026-08-20T14:30:00Z',
    lastActive: new Date(Date.now() - 3600000 * 24).toISOString(),
    isImmutable: false,
    permissions: ROLE_CAPABILITIES[STAFF_ROLES.BILLING_ADMIN],
    notes: 'Manages subscription disputes, webhook retries, and commercial rabbitry invoicing.'
  },
  {
    id: 'staff-mod-1',
    name: 'Emily Watson',
    email: 'emily.moderator@rabbitrypedigree.pro',
    role: STAFF_ROLES.CONTENT_MODERATOR,
    status: 'active',
    invitedAt: '2026-09-01T09:15:00Z',
    lastActive: new Date(Date.now() - 3600000 * 12).toISOString(),
    isImmutable: false,
    permissions: ROLE_CAPABILITIES[STAFF_ROLES.CONTENT_MODERATOR],
    notes: 'Reviews marketplace rabbit listings, verifies community genetics articles, and monitors animal welfare flags.'
  }
];

export class StaffRoleService {
  /**
   * Check if a user is the primary App Owner (Jason Mounts)
   */
  static isOwner(user) {
    if (!user) return false;
    const email = (user.email || '').toLowerCase();
    const username = (user.username || '').toLowerCase();
    return (
      user.id === 'ab-admin' ||
      user.id === 'staff-owner-1' ||
      email === 'jasonmounts77@yahoo.com' ||
      username === 'jmounts' ||
      user.role === 'owner' ||
      user.role === 'superadmin'
    );
  }

  /**
   * Get effective role for user in Control Center context
   */
  static getEffectiveStaffRole(user) {
    if (this.isOwner(user)) return STAFF_ROLES.OWNER;
    return user?.staffRole || user?.role || STAFF_ROLES.READ_ONLY_ANALYST;
  }

  /**
   * Check if staff user can access a specific Control Center sub-module
   */
  static canAccessModule(user, moduleId) {
    if (this.isOwner(user)) return true;
    const role = this.getEffectiveStaffRole(user);
    const allowedModules = ROLE_MODULES[role] || ['command_home'];
    return allowedModules.includes(moduleId);
  }

  /**
   * Check if staff user can execute a specific permission
   */
  static hasPermission(user, permissionKey) {
    if (this.isOwner(user)) return true;
    const role = this.getEffectiveStaffRole(user);
    const allowed = user?.customPermissions || ROLE_CAPABILITIES[role] || [];
    return allowed.includes(permissionKey);
  }

  /**
   * List all registered staff team members
   */
  static async listStaffMembers() {
    try {
      if (db && db.staffMembers) {
        const stored = await db.staffMembers.toArray();
        if (stored.length > 0) return stored;

        // Seed initial defaults if table is empty
        await db.staffMembers.bulkAdd(DEFAULT_STAFF_MEMBERS);
        return DEFAULT_STAFF_MEMBERS;
      }
      return DEFAULT_STAFF_MEMBERS;
    } catch (err) {
      console.warn('Error reading staff members, falling back to defaults:', err);
      return DEFAULT_STAFF_MEMBERS;
    }
  }

  /**
   * Invite a new team staff member (Owner Only)
   */
  static async inviteStaffMember(staffData, ownerUser) {
    if (!this.isOwner(ownerUser)) {
      throw new Error('Only the App Owner can invite team staff members.');
    }

    const newStaff = {
      id: 'staff_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: staffData.name.trim(),
      email: staffData.email.trim().toLowerCase(),
      role: staffData.role || STAFF_ROLES.SUPPORT_LEAD,
      status: 'active',
      invitedAt: new Date().toISOString(),
      invitedBy: ownerUser.name || 'Jason Mounts',
      lastActive: new Date().toISOString(),
      isImmutable: false,
      permissions: staffData.customPermissions || ROLE_CAPABILITIES[staffData.role] || [],
      notes: staffData.notes || ''
    };

    if (db && db.staffMembers) {
      await db.staffMembers.add(newStaff);
    }

    await this.logStaffAction({
      staffId: ownerUser.id || 'owner',
      staffName: ownerUser.name || 'Jason Mounts',
      action: 'STAFF_INVITED',
      targetUserId: newStaff.id,
      details: `Invited new team member: ${newStaff.name} (${newStaff.email}) as role ${newStaff.role.toUpperCase()}`
    });

    return newStaff;
  }

  /**
   * Update an existing team member's role or permissions (Owner Only)
   */
  static async updateStaffMember(staffId, updates, ownerUser) {
    if (!this.isOwner(ownerUser)) {
      throw new Error('Only the App Owner can modify team staff roles.');
    }

    const existing = await db.staffMembers.get(staffId);
    if (!existing) throw new Error('Staff member not found.');
    if (existing.isImmutable) throw new Error('The primary App Owner role is immutable and cannot be modified.');

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (db && db.staffMembers) {
      await db.staffMembers.put(updated);
    }

    await this.logStaffAction({
      staffId: ownerUser.id || 'owner',
      staffName: ownerUser.name || 'Jason Mounts',
      action: 'STAFF_UPDATED',
      targetUserId: staffId,
      details: `Updated staff permissions/role for ${updated.name}: ${JSON.stringify(updates)}`
    });

    return updated;
  }

  /**
   * Revoke or suspend a staff member's access (Owner Only)
   */
  static async revokeStaffMember(staffId, reason, ownerUser) {
    if (!this.isOwner(ownerUser)) {
      throw new Error('Only the App Owner can revoke staff access.');
    }

    const existing = await db.staffMembers.get(staffId);
    if (!existing) throw new Error('Staff member not found.');
    if (existing.isImmutable) throw new Error('Cannot revoke the primary App Owner account.');

    await db.staffMembers.update(staffId, {
      status: 'revoked',
      revokedAt: new Date().toISOString(),
      revocationReason: reason || 'Revoked by App Owner'
    });

    await this.logStaffAction({
      staffId: ownerUser.id || 'owner',
      staffName: ownerUser.name || 'Jason Mounts',
      action: 'STAFF_REVOKED',
      targetUserId: staffId,
      details: `Revoked access for ${existing.name} (${existing.email}). Reason: ${reason}`
    });

    return true;
  }

  /**
   * Log an audited staff action
   */
  static async logStaffAction({ staffId, staffName, action, targetUserId, details }) {
    try {
      const logEntry = {
        id: 'stf_log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        staffId: staffId || 'unknown',
        staffName: staffName || 'Staff Member',
        action,
        targetUserId: targetUserId || 'n/a',
        timestamp: new Date().toISOString(),
        details: typeof details === 'string' ? details : JSON.stringify(details)
      };

      if (db && db.staffAuditLogs) {
        await db.staffAuditLogs.add(logEntry);
      }

      // Also record in central security logs
      await logSecurityEvent(
        staffId,
        `STAFF_${action}`,
        { staffName, targetUserId, details },
        action.includes('REVOKE') || action.includes('DELETE') ? 'warning' : 'info'
      );

      return logEntry;
    } catch (err) {
      console.warn('Failed to record staff audit log:', err);
      return null;
    }
  }

  /**
   * Get all staff audit logs with optional filtering
   */
  static async getStaffAuditLogs(limit = 100) {
    try {
      if (db && db.staffAuditLogs) {
        const logs = await db.staffAuditLogs.reverse().limit(limit).toArray();
        return logs;
      }
      return [];
    } catch {
      return [];
    }
  }
}
