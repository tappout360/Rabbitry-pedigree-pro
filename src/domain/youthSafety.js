/**
 * youthSafety.js
 * Domain Core: COPPA & Youth 4-H Safety Policy Enforcement
 * Pure Business Logic - No UI, No DB, No Network Dependencies.
 */

export const YOUTH_APPROVAL_ACTIONS = {
  DELETE_RABBIT: 'DELETE_RABBIT',
  TRANSFER_RABBIT: 'TRANSFER_RABBIT',
  EDIT_FINANCIALS: 'EDIT_FINANCIALS',
  ADMINISTER_PRESCRIPTION: 'ADMINISTER_PRESCRIPTION'
};

/**
 * Validates if an action requires adult/parental approval when initiated by a youth user
 */
export function requiresAdultApproval(user, actionType) {
  if (!user) return true;
  const isYouth = user.isYouth || user.ageGroup === 'youth' || (user.age && user.age < 18);
  if (!isYouth) return false;
  return Object.values(YOUTH_APPROVAL_ACTIONS).includes(actionType);
}

/**
 * Create an immutable pending youth action approval entity
 */
export function createPendingApprovalEntity({
  youthId,
  youthName,
  actionType,
  targetId,
  targetDescription,
  requestedPayload
}) {
  if (!youthId || !actionType) {
    throw new Error("Invalid approval entity: youthId and actionType are required.");
  }

  return {
    id: `appr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    youthId,
    youthName: youthName || 'Youth Member',
    actionType,
    targetId: targetId || null,
    targetDescription: targetDescription || 'Sensitive operation',
    requestedPayload: requestedPayload || {},
    status: 'pending', // 'pending', 'approved', 'rejected'
    createdAt: new Date().toISOString(),
    reviewedAt: null,
    reviewedBy: null,
    reviewNotes: ''
  };
}

/**
 * Validates approval transition
 */
export function processApprovalTransition(approvalEntity, reviewerUser, decision, notes = '') {
  if (!approvalEntity || approvalEntity.status !== 'pending') {
    throw new Error("Approval entity is not in a pending state.");
  }
  if (!reviewerUser || reviewerUser.isYouth) {
    throw new Error("Youth members cannot approve pending adult actions.");
  }
  if (decision !== 'approved' && decision !== 'rejected') {
    throw new Error("Invalid decision: must be 'approved' or 'rejected'.");
  }

  return {
    ...approvalEntity,
    status: decision,
    reviewedAt: new Date().toISOString(),
    reviewedBy: reviewerUser.id || reviewerUser.email || 'Adult Supervisor',
    reviewNotes: notes.trim()
  };
}

/**
 * Filter sensitive PII fields from youth profiles (COPPA / Safe Harbor compliance)
 */
export function sanitizeYouthProfile(user) {
  if (!user) return null;
  const sanitized = { ...user };
  if (sanitized.isYouth || sanitized.ageGroup === 'youth') {
    delete sanitized.creditCard;
    delete sanitized.billingAddress;
    delete sanitized.ssn;
    delete sanitized.phone; // phone is masked/removed for underage 4-H participants
  }
  return sanitized;
}
