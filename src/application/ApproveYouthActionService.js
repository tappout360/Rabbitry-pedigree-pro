/**
 * ApproveYouthActionService.js
 * Application Use-Case Service: Manage & Review Youth 4-H Action Approvals
 * Coordinates Safe Youth Operations and Adult Consent Execution.
 */

import { isActionPermitted, explainActionDenial, ACTIONS } from '../domain/roles';
import { 
  createPendingApprovalEntity, 
  processApprovalTransition, 
  requiresAdultApproval 
} from '../domain/youthSafety';
import { logSecurityEvent } from '../services/AccountSecurityService';
import { db } from '../db/registryDb';

export class ApproveYouthActionService {
  /**
   * Submit an action for adult approval if initiated by a youth user
   */
  async submitActionForApproval({ youthUser, actionType, targetId, targetDescription, requestedPayload }) {
    if (!requiresAdultApproval(youthUser, actionType)) {
      return { requiresApproval: false };
    }

    const pendingEntity = createPendingApprovalEntity({
      youthId: youthUser.id || 'youth_user',
      youthName: youthUser.name || 'Youth Member',
      actionType,
      targetId,
      targetDescription,
      requestedPayload
    });

    if (db && db.approvals) {
      await db.approvals.add(pendingEntity);
    }

    await logSecurityEvent(
      youthUser.id,
      'YOUTH_ACTION_SUBMITTED_FOR_APPROVAL',
      { actionType, targetDescription },
      'info'
    );

    return {
      requiresApproval: true,
      pendingEntity,
      message: `Action submitted for adult review: "${targetDescription}" requires parental approval.`
    };
  }

  /**
   * Process Adult Approval / Rejection
   */
  async reviewAction({ reviewerUser, approvalId, decision, reviewNotes = '' }) {
    if (!isActionPermitted(reviewerUser, ACTIONS.APPROVE_YOUTH_ACTION)) {
      throw new Error(explainActionDenial(reviewerUser, ACTIONS.APPROVE_YOUTH_ACTION));
    }

    let existingEntity = null;
    if (db && db.approvals) {
      existingEntity = await db.approvals.get(approvalId);
    }

    if (!existingEntity) {
      throw new Error("Approval request not found.");
    }

    const updatedEntity = processApprovalTransition(existingEntity, reviewerUser, decision, reviewNotes);

    if (db && db.approvals) {
      await db.approvals.put(updatedEntity);
    }

    await logSecurityEvent(
      reviewerUser.id,
      decision === 'approved' ? 'YOUTH_ACTION_APPROVED' : 'YOUTH_ACTION_REJECTED',
      { approvalId, actionType: updatedEntity.actionType, reviewedBy: reviewerUser.name },
      'info'
    );

    return {
      success: true,
      approval: updatedEntity
    };
  }
}
