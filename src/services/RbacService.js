/**
 * RbacService.js
 * Role-Based Access Control (RBAC) & Least Privilege Access
 * WarrenWise Pro / RabbitryPedigree Pro (rabbitrypedigreepro.com)
 */

export const ROLES = {
  OWNER: 'owner',         // App Owner / Superadmin (Jason Mounts)
  ADULT: 'adult',         // Adult Breeder / Family Manager
  YOUTH: 'youth',         // 4-H / FFA Youth Member (Protected Sandbox)
  COACH: 'coach'          // 4-H Advisor / Parent Supervisor
};

export const ACTIONS = {
  // Animal & Lineage Actions
  VIEW_HERD: 'VIEW_HERD',
  ADD_RABBIT: 'ADD_RABBIT',
  EDIT_RABBIT: 'EDIT_RABBIT',
  DELETE_RABBIT: 'DELETE_RABBIT',
  EDIT_PEDIGREE: 'EDIT_PEDIGREE',
  PRINT_FORMS: 'PRINT_FORMS',

  // Daily Barn Operations
  LOG_WEIGHT: 'LOG_WEIGHT',
  LOG_MEDICAL: 'LOG_MEDICAL',
  MANAGE_BREEDING: 'MANAGE_BREEDING',
  MANAGE_CHORES: 'MANAGE_CHORES',
  PLAY_ACADEMY: 'PLAY_ACADEMY',

  // Financials & Commercial
  VIEW_FINANCIALS: 'VIEW_FINANCIALS',
  EDIT_FINANCIALS: 'EDIT_FINANCIALS',
  MANAGE_SALES: 'MANAGE_SALES',

  // Sensitive System & Security Actions
  EXPORT_DATA: 'EXPORT_DATA',
  RESET_DATABASE: 'RESET_DATABASE',
  MANAGE_BILLING: 'MANAGE_BILLING',
  EDIT_SECURITY: 'EDIT_SECURITY', // Change email, pw, 2FA
  DELETE_ACCOUNT: 'DELETE_ACCOUNT',
  ACCESS_CONTROL_CENTER: 'ACCESS_CONTROL_CENTER'
};

// Permission Matrix (Role -> Allowed Actions)
const PERMISSION_MATRIX = {
  [ROLES.OWNER]: Object.values(ACTIONS), // Owner has access to all actions

  [ROLES.ADULT]: [
    ACTIONS.VIEW_HERD,
    ACTIONS.ADD_RABBIT,
    ACTIONS.EDIT_RABBIT,
    ACTIONS.DELETE_RABBIT,
    ACTIONS.EDIT_PEDIGREE,
    ACTIONS.PRINT_FORMS,
    ACTIONS.LOG_WEIGHT,
    ACTIONS.LOG_MEDICAL,
    ACTIONS.MANAGE_BREEDING,
    ACTIONS.MANAGE_CHORES,
    ACTIONS.PLAY_ACADEMY,
    ACTIONS.VIEW_FINANCIALS,
    ACTIONS.EDIT_FINANCIALS,
    ACTIONS.MANAGE_SALES,
    ACTIONS.EXPORT_DATA,
    ACTIONS.RESET_DATABASE,
    ACTIONS.MANAGE_BILLING,
    ACTIONS.EDIT_SECURITY,
    ACTIONS.DELETE_ACCOUNT
  ],

  [ROLES.YOUTH]: [
    // Least Privilege for 4-H youth: can record, learn, and view, but cannot destroy data
    ACTIONS.VIEW_HERD,
    ACTIONS.ADD_RABBIT,
    ACTIONS.EDIT_RABBIT,
    ACTIONS.LOG_WEIGHT,
    ACTIONS.LOG_MEDICAL,
    ACTIONS.MANAGE_CHORES,
    ACTIONS.PLAY_ACADEMY,
    ACTIONS.PRINT_FORMS,
    ACTIONS.VIEW_FINANCIALS
  ],

  [ROLES.COACH]: [
    // Parent / Coach supervisor: view progress, approve records, read-only
    ACTIONS.VIEW_HERD,
    ACTIONS.PLAY_ACADEMY,
    ACTIONS.MANAGE_CHORES,
    ACTIONS.PRINT_FORMS,
    ACTIONS.VIEW_FINANCIALS,
    ACTIONS.EXPORT_DATA
  ]
};

/**
 * Determine effective role of user
 */
export function getUserRole(user) {
  if (!user) return ROLES.YOUTH;
  if (user.role === 'superadmin' || user.id === 'ab-admin') return ROLES.OWNER;
  if (user.isYouth || user.ageGroup === 'youth') return ROLES.YOUTH;
  if (user.role === 'coach' || user.role === 'parent') return ROLES.COACH;
  return ROLES.ADULT;
}

/**
 * Check if a user has permission to execute an action
 */
export function canPerformAction(user, action) {
  const role = getUserRole(user);
  const allowed = PERMISSION_MATRIX[role] || [];
  return allowed.includes(action);
}

/**
 * Human-friendly explanation if an action is denied
 */
export function getDenialReason(user, action) {
  const role = getUserRole(user);
  if (role === ROLES.YOUTH) {
    switch (action) {
      case ACTIONS.DELETE_RABBIT:
        return "Youth 4-H Safeguard: Deleting rabbits requires an adult or family manager account to prevent accidental herd loss.";
      case ACTIONS.RESET_DATABASE:
        return "Youth 4-H Safeguard: Database reset is restricted to adult rabbitry managers.";
      case ACTIONS.MANAGE_BILLING:
        return "Youth 4-H Safeguard: Subscription and billing management requires an adult account.";
      case ACTIONS.EDIT_SECURITY:
        return "Youth 4-H Safeguard: Security credential changes require adult parental authorization.";
      case ACTIONS.DELETE_ACCOUNT:
        return "Youth 4-H Safeguard: Account deletion is restricted to adult rabbitry managers.";
      case ACTIONS.ACCESS_CONTROL_CENTER:
        return "Administrative access is restricted to the App Owner.";
      default:
        return "This action is restricted under Youth Least Privilege mode.";
    }
  }

  if (action === ACTIONS.ACCESS_CONTROL_CENTER && role !== ROLES.OWNER) {
    return "The Control Center is restricted to authorized App Owner administration.";
  }

  return "Permission denied for your current user role.";
}
