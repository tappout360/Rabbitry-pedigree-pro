/**
 * SubmitSupportTicketService.js
 * Application Use-Case Service: Submit Customer Support / Incident Ticket
 * Coordinates Ticket Validation, Diagnostic Profiling, and Persistence.
 */

import { isActionPermitted, explainActionDenial, ACTIONS } from '../domain/roles';
import { getCurrentDeviceProfile, logSecurityEvent } from '../services/AccountSecurityService';
import { db } from '../db/registryDb';

export class SubmitSupportTicketService {
  async execute({ currentUser, ticketData }) {
    if (!isActionPermitted(currentUser, ACTIONS.SUBMIT_TICKET)) {
      throw new Error(explainActionDenial(currentUser, ACTIONS.SUBMIT_TICKET));
    }

    const { subject, category, priority, description, screenshot } = ticketData;

    if (!subject || subject.trim().length < 3) {
      throw new Error("Ticket subject must be at least 3 characters.");
    }
    if (!description || description.trim().length < 10) {
      throw new Error("Please provide a detailed description (at least 10 characters).");
    }

    const deviceProfile = getCurrentDeviceProfile();

    const ticketEntity = {
      id: `tkt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      breederId: currentUser?.id || 'anonymous',
      breederName: currentUser?.name || 'Breeder',
      breederEmail: currentUser?.email || 'unregistered@warrenwise.pro',
      rabbitryName: currentUser?.rabbitryName || 'WarrenWise Rabbitry',
      subject: subject.trim(),
      category: category || 'general',
      priority: priority || 'normal',
      description: description.trim(),
      screenshot: screenshot || null,
      status: 'open',
      diagnostics: {
        ...deviceProfile,
        appVersion: '1.0.0 (Production)',
        online: typeof navigator !== 'undefined' ? navigator.onLine : true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg_${Date.now()}`,
          sender: 'customer',
          senderName: currentUser?.name || 'Breeder',
          text: description.trim(),
          timestamp: new Date().toISOString()
        }
      ]
    };

    if (db && db.supportTickets) {
      await db.supportTickets.add(ticketEntity);
    }

    await logSecurityEvent(
      currentUser?.id,
      'SUPPORT_TICKET_SUBMITTED',
      { ticketId: ticketEntity.id, category: ticketEntity.category, priority: ticketEntity.priority },
      'info'
    );

    return {
      success: true,
      ticket: ticketEntity
    };
  }
}
