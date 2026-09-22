/**
 * roles.js
 * Domain Core: User Roles, Permissions, and Least Privilege Access Matrix
 * Pure Business Logic - No UI, No DB, No Network Dependencies.
 */

export const ROLES = {
  OWNER: 'owner',         // App Owner / Superadmin
  ADULT: 'adult',         // Adult Breeder / Family Rabbitry Manager
  YOUTH: 'youth',         // 4-H / FFA Youth Member (Underage / Protected Sandbox)
  COACH: 'coach'          // 4-H Leader, Advisor, or Parent Supervisor
};

export const ACTIONS = {
  // Animal Lineage & Herd Management
  VIEW_HERD: 'VIEW_HERD',
  ADD_RABBIT: 'ADD_RABBIT',
  EDIT_RABBIT: 'EDIT_RABBIT',
  DELETE_RABBIT: 'DELETE_RABBIT',
  EDIT_PEDIGREE: 'EDIT_PEDIGREE',
  EXPORT_PEDIGREE: 'EXPORT_PEDIGREE',
  PRINT_FORMS: 'PRINT_FORMS',
  TRANSFER_RABBIT: 'TRANSFER_RABBIT',

  // Daily Barn Operations
  LOG_WEIGHT: 'LOG_WEIGHT',
  LOG_MEDICAL: 'LOG_MEDICAL',
  MANAGE_BREEDING: 'MANAGE_BREEDING',
  MANAGE_CHORES: 'MANAGE_CHORES',
  PLAY_ACADEMY: 'PLAY_ACADEMY',

  // Commercial & Financial Operations
  VIEW_FINANCIALS: 'VIEW_FINANCIALS',
  EDIT_FINANCIALS: 'EDIT_FINANCIALS',
  MANAGE_SALES: 'MANAGE_SALES',

  // Sensitive System & Security Operations
  EXPORT_DATA: 'EXPORT_DATA',
  RESET_DATABASE: 'RESET_DATABASE',
  MANAGE_BILLING: 'MANAGE_BILLING',
  EDIT_SECURITY: 'EDIT_SECURITY', // Change email, password, 2FA
  DELETE_ACCOUNT: 'DELETE_ACCOUNT',
  SUBMIT_TICKET: 'SUBMIT_TICKET',
  APPROVE_YOUTH_ACTION: 'APPROVE_YOUTH_ACTION',
  ACCESS_CONTROL_CENTER: 'ACCESS_CONTROL_CENTER'
};

// Pure Permission Matrix
const PERMISSION_MATRIX = {
  [ROLES.OWNER]: Object.values(ACTIONS),

  [ROLES.ADULT]: [
    ACTIONS.VIEW_HERD,
    ACTIONS.ADD_RABBIT,
    ACTIONS.EDIT_RABBIT,
    ACTIONS.DELETE_RABBIT,
    ACTIONS.EDIT_PEDIGREE,
    ACTIONS.EXPORT_PEDIGREE,
    ACTIONS.PRINT_FORMS,
    ACTIONS.TRANSFER_RABBIT,
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
    ACTIONS.DELETE_ACCOUNT,
    ACTIONS.SUBMIT_TICKET,
    ACTIONS.APPROVE_YOUTH_ACTION
  ],

  [ROLES.YOUTH]: [
    ACTIONS.VIEW_HERD,
    ACTIONS.ADD_RABBIT,
    ACTIONS.EDIT_RABBIT,
    ACTIONS.LOG_WEIGHT,
    ACTIONS.LOG_MEDICAL,
    ACTIONS.MANAGE_CHORES,
    ACTIONS.PLAY_ACADEMY,
    ACTIONS.PRINT_FORMS,
    ACTIONS.EXPORT_PEDIGREE,
    ACTIONS.VIEW_FINANCIALS,
    ACTIONS.SUBMIT_TICKET
    // Destructive, financial modifications, and credential changes are blocked for youth
  ],

  [ROLES.COACH]: [
    ACTIONS.VIEW_HERD,
    ACTIONS.PLAY_ACADEMY,
    ACTIONS.MANAGE_CHORES,
    ACTIONS.PRINT_FORMS,
    ACTIONS.EXPORT_PEDIGREE,
    ACTIONS.VIEW_FINANCIALS,
    ACTIONS.EXPORT_DATA,
    ACTIONS.SUBMIT_TICKET,
    ACTIONS.APPROVE_YOUTH_ACTION
  ]
};

export function resolveUserRole(user) {
  if (!user) return ROLES.YOUTH;
  if (user.role === 'superadmin' || user.id === 'ab-admin' || user.isSuperAdmin) return ROLES.OWNER;
  if (user.isYouth || user.ageGroup === 'youth' || (user.age && user.age < 18)) return ROLES.YOUTH;
  if (user.role === 'coach' || user.role === 'parent' || user.role === 'advisor') return ROLES.COACH;
  return ROLES.ADULT;
}

export function isActionPermitted(user, action) {
  const role = resolveUserRole(user);
  const allowedActions = PERMISSION_MATRIX[role] || [];
  return allowedActions.includes(action);
}

export function explainActionDenial(user, action) {
  const role = resolveUserRole(user);
  if (role === ROLES.YOUTH) {
    switch (action) {
      case ACTIONS.DELETE_RABBIT:
        return "Youth Safety Policy: Rabbit deletion requires adult family approval to protect herd records.";
      case ACTIONS.RESET_DATABASE:
        return "Youth Safety Policy: Database reset is restricted to adult managers.";
      case ACTIONS.MANAGE_BILLING:
        return "Youth Safety Policy: Subscription and billing management requires an adult manager.";
      case ACTIONS.EDIT_SECURITY:
        return "Youth Safety Policy: Security credential modifications require parental consent.";
      case ACTIONS.DELETE_ACCOUNT:
        return "Youth Safety Policy: Account deletion is restricted to adult managers.";
      case ACTIONS.ACCESS_CONTROL_CENTER:
        return "Administrative control center is restricted to the App Owner.";
      default:
        return "Action restricted under Youth Least Privilege mode.";
    }
  }
  if (action === ACTIONS.ACCESS_CONTROL_CENTER && role !== ROLES.OWNER) {
    return "The Root Control Center is restricted to authorized App Owner administration.";
  }
  return "Permission denied for your current user role.";
}
