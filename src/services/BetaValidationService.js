/**
 * BetaValidationService.js
 * Structured Real-User Beta Validation System & Triage Engine
 * 
 * Manages:
 * - 8-Day Real-User Beta Testing Checklist & Task Progressions
 * - In-App Severity-Tagged Issue & Feedback Reporting (Blocker, Major, Minor, Feature)
 * - Diagnostic Context Collection (Device, Screen, Storage, Offline State)
 * - Triage Status Workflow (Open -> Under Review -> Resolved -> Deferred)
 * - Launch Readiness KPI Scorecard
 */

import { db } from '../db/registryDb';
import { globalSyncAdapter } from '../adapters/sync/OfflineSyncAdapter';

export const BETA_COHORTS = [
  { id: 'show_breeder', label: 'Show / ARBA Standard Breeder', desc: 'Focus: Pedigree accuracy, varieties, show legs' },
  { id: '4h_youth_family', label: '4-H Youth & Family', desc: 'Focus: Ease of use, parental consent, learning' },
  { id: 'large_herd_50_plus', label: 'Large Herd Breeder (50+ Animals)', desc: 'Focus: Performance, batch actions, search speed' },
  { id: 'mobile_first_barn', label: 'Mobile-First Barn Operator', desc: 'Focus: Weak signal, sunlight readability, quick logging' },
  { id: 'commercial_meat', label: 'Meat & Production Breeder', desc: 'Focus: Litters, weight gain curves, processing' }
];

export const BETA_TASKS = [
  // --- Phase 1: Days 1–2 (Onboarding & Initial Herd) ---
  {
    id: 'setup_profile',
    phase: 'Days 1–2: Onboarding',
    title: 'Complete Rabbitry Profile & Prefix',
    desc: 'Set your official rabbitry name, breeder tattoo prefix, and ARBA membership/club details in Settings.',
    requiredAction: 'settings'
  },
  {
    id: 'add_initial_herd',
    phase: 'Days 1–2: Onboarding',
    title: 'Add or Import First 5 Animals',
    desc: 'Enter at least 5 rabbits or cavies into your herd with ear tattoos, sex, breed, and variety.',
    requiredAction: 'rabbits'
  },
  {
    id: 'attach_primary_photo',
    phase: 'Days 1–2: Onboarding',
    title: 'Attach Photos with Camera or Gallery',
    desc: 'Attach at least one photo with client-side compression and verify the Primary Pedigree Photo badge.',
    requiredAction: 'media'
  },
  {
    id: 'filter_herd_list',
    phase: 'Days 1–2: Onboarding',
    title: 'Test Herd Search & Variety Filters',
    desc: 'Search by ear number and filter the herd by sex (Bucks vs Does) or breeding status.',
    requiredAction: 'rabbits'
  },

  // --- Phase 2: Days 3–5 (Daily Barn Chores & Offline Test) ---
  {
    id: 'enable_barn_mode',
    phase: 'Days 3–5: Barn Chores',
    title: 'Enable High-Contrast Barn Mode',
    desc: 'Toggle High-Contrast Barn Mode for sunlight readability and large touch targets.',
    requiredAction: 'barn'
  },
  {
    id: 'offline_weight_log',
    phase: 'Days 3–5: Barn Chores',
    title: 'Log Rapid Weights in Airplane Mode',
    desc: 'Turn off Wi-Fi/Cellular, log weights for 3 animals, and verify the "Saved on Device" indicator appears.',
    requiredAction: 'rapid_weight'
  },
  {
    id: 'offline_health_note',
    phase: 'Days 3–5: Barn Chores',
    title: 'Add Medical or Health Note Offline',
    desc: 'Record a nail trim, ivermectin dosage, or ear mite check while disconnected.',
    requiredAction: 'health'
  },
  {
    id: 'reconnect_drain_queue',
    phase: 'Days 3–5: Barn Chores',
    title: 'Reconnect & Verify Sync Queue Drains',
    desc: 'Turn Wi-Fi back on. Confirm the sync banner shows "Connected Online" and the pending counter clears to 0.',
    requiredAction: 'sync'
  },

  // --- Phase 3: Days 6–7 (Breeding & Pedigree Generation) ---
  {
    id: 'record_breeding',
    phase: 'Days 6–7: Pedigrees',
    title: 'Record Mating Pair & Kindle Forecast',
    desc: 'Schedule a breeding between a buck and doe; verify the 31-day kindle countdown alert is generated.',
    requiredAction: 'breedings'
  },
  {
    id: 'generate_pedigree_pdf',
    phase: 'Days 6–7: Pedigrees',
    title: 'Generate Official 3-Gen Pedigree PDF',
    desc: 'Export a PDF pedigree with ancestor lineage and animal photo. Verify accuracy of layout and text.',
    requiredAction: 'pedigree'
  },
  {
    id: 'export_backup_archive',
    phase: 'Days 6–7: Pedigrees',
    title: 'Export Portable Backup Snapshot',
    desc: 'In Settings &rarr; Backup & Restore, click "Backup Now" or "Export Backup" to save an archive.',
    requiredAction: 'backup'
  },

  // --- Phase 4: Day 8 (Exit Evaluation & Feedback) ---
  {
    id: 'submit_beta_feedback',
    phase: 'Day 8: Evaluation',
    title: 'Submit In-App Feedback Report',
    desc: 'Send your first structured feedback or issue report with a severity rating (Blocker, Major, or Minor).',
    requiredAction: 'feedback'
  },
  {
    id: 'complete_exit_survey',
    phase: 'Day 8: Evaluation',
    title: 'Complete Launch Readiness Scorecard',
    desc: 'Rate your overall barn experience (1-10) and confirm whether the app is ready for public release.',
    requiredAction: 'survey'
  }
];

export class BetaValidationService {
  constructor() {
    this.storageKey = 'rp_beta_user_state';
  }

  /**
   * Get user's current beta enrollment state and completed tasks
   */
  async getUserState(userId = 'default_user') {
    try {
      const saved = localStorage.getItem(`${this.storageKey}_${userId}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}

    const defaultState = {
      userId,
      isEnrolled: true,
      cohort: 'show_breeder',
      enrolledAt: new Date().toISOString(),
      completedTasks: {},
      exitSurvey: null
    };
    this.saveUserState(userId, defaultState);
    return defaultState;
  }

  saveUserState(userId, state) {
    try {
      localStorage.setItem(`${this.storageKey}_${userId}`, JSON.stringify(state));
    } catch (e) {
      console.error('[BetaValidationService] Failed to save beta state:', e);
    }
  }

  /**
   * Mark a task as completed or incomplete
   */
  async setTaskCompletion(userId, taskId, isComplete, notes = '') {
    const state = await this.getUserState(userId);
    if (!state.completedTasks) state.completedTasks = {};

    if (isComplete) {
      state.completedTasks[taskId] = {
        completed: true,
        completedAt: new Date().toISOString(),
        notes
      };

      // Also persist to Dexie betaChecklist table
      try {
        if (db.betaChecklist) {
          await db.betaChecklist.put({
            id: `${userId}_${taskId}`,
            userId,
            taskId,
            completed: true,
            completedAt: new Date().toISOString(),
            notes
          });
        }
      } catch (err) {
        console.warn('[BetaValidationService] Dexie checklist put error:', err);
      }
    } else {
      delete state.completedTasks[taskId];
      try {
        if (db.betaChecklist) {
          await db.betaChecklist.delete(`${userId}_${taskId}`);
        }
      } catch {}
    }

    this.saveUserState(userId, state);
    return state;
  }

  /**
   * Submit structured beta feedback with diagnostic telemetry
   */
  async submitBetaFeedback({
    userId = 'user',
    userName = 'Breeder',
    userEmail = '',
    rabbitryName = '',
    cohort = 'show_breeder',
    severity = 'Minor', // 'Blocker', 'Major', 'Minor', 'Feature'
    category = 'General',
    title = '',
    message = '',
    screenshot = null,
    rating = 5,
    currentRoute = ''
  }) {
    if (!message.trim()) {
      throw new Error('Feedback message is required');
    }

    // Capture diagnostic environment snapshot
    const storageEstimate = typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate 
      ? await navigator.storage.estimate().catch(() => null) 
      : null;

    const diagnosticContext = {
      currentRoute: currentRoute || (typeof window !== 'undefined' ? window.location.hash : ''),
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
      screenHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
      devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
      storageUsedMb: storageEstimate ? (storageEstimate.usage / (1024 * 1024)).toFixed(1) : 'unknown',
      storageQuotaMb: storageEstimate ? (storageEstimate.quota / (1024 * 1024)).toFixed(1) : 'unknown'
    };

    const feedbackId = `beta_fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    const feedbackItem = {
      id: feedbackId,
      userId,
      userName,
      userEmail,
      rabbitryName,
      cohort,
      severity, // 'Blocker' | 'Major' | 'Minor' | 'Feature'
      category,
      title: title || `${severity} report in ${category}`,
      message,
      screenshot, // base64 or URL
      rating,
      context: diagnosticContext,
      status: 'Open', // 'Open' | 'Under Review' | 'Resolved' | 'Deferred'
      adminNotes: '',
      submittedAt: nowIso,
      updatedAt: nowIso
    };

    // 1. Save to Dexie
    try {
      if (db.betaFeedback) {
        await db.betaFeedback.put(feedbackItem);
      }
    } catch (e) {
      console.warn('[BetaValidationService] Local Dexie feedback save failed:', e);
    }

    // 2. Also keep in localStorage queue for instant access
    try {
      const existingList = this.getAllLocalFeedback();
      existingList.unshift(feedbackItem);
      localStorage.setItem('rp_all_beta_feedback', JSON.stringify(existingList));
    } catch (e) {
      console.warn('[BetaValidationService] LocalStorage feedback sync error:', e);
    }

    // 3. Mark the 'submit_beta_feedback' task as completed
    await this.setTaskCompletion(userId, 'submit_beta_feedback', true, `Logged ${severity}: ${title}`);

    // 4. Enqueue into global offline sync adapter
    globalSyncAdapter.enqueue('CREATE', 'betaFeedback', feedbackItem);

    // 5. Try direct API push if online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const API_ROOT = window.location.hostname === 'localhost' ? 'http://localhost:4000/api' : '/api';
        const token = localStorage.getItem('rp_auth_token');
        fetch(`${API_ROOT}/beta/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(feedbackItem)
        }).catch(() => {});
      } catch {}
    }

    return feedbackItem;
  }

  getAllLocalFeedback() {
    try {
      const raw = localStorage.getItem('rp_all_beta_feedback');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Fetch all feedback tickets across the database and local storage
   */
  async getAllFeedback() {
    let dexieItems = [];
    try {
      if (db.betaFeedback) {
        dexieItems = await db.betaFeedback.reverse().toArray();
      }
    } catch {}

    const localItems = this.getAllLocalFeedback();
    
    // Merge without duplicates
    const itemMap = new Map();
    [...dexieItems, ...localItems].forEach(item => {
      if (item && item.id && !itemMap.has(item.id)) {
        itemMap.set(item.id, item);
      }
    });

    return Array.from(itemMap.values()).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }

  /**
   * Update feedback triage status from Root Control Center
   */
  async updateFeedbackStatus(feedbackId, status, adminNotes = '') {
    const all = await this.getAllFeedback();
    const target = all.find(f => f.id === feedbackId);
    if (!target) return;

    target.status = status;
    if (adminNotes) target.adminNotes = adminNotes;
    target.updatedAt = new Date().toISOString();

    // Update Dexie
    try {
      if (db.betaFeedback) {
        await db.betaFeedback.put(target);
      }
    } catch {}

    // Update LocalStorage
    const local = this.getAllLocalFeedback().map(item => item.id === feedbackId ? target : item);
    localStorage.setItem('rp_all_beta_feedback', JSON.stringify(local));

    globalSyncAdapter.enqueue('UPDATE', 'betaFeedback', target);
    return target;
  }

  /**
   * Calculate launch readiness metrics for Owner Control Center
   */
  async getLaunchReadinessMetrics() {
    const feedback = await this.getAllFeedback();
    const blockerCount = feedback.filter(f => f.severity === 'Blocker' && f.status !== 'Resolved').length;
    const majorCount = feedback.filter(f => f.severity === 'Major' && f.status !== 'Resolved').length;
    const resolvedCount = feedback.filter(f => f.status === 'Resolved').length;

    // Default sample beta cohort testers
    const totalTesters = 18;
    const activeTesters = 15;
    const avgChecklistProgress = 78; // 78% average completed

    // Readiness score calculation
    let readinessScore = 100;
    readinessScore -= blockerCount * 25; // Each blocker subtracts 25%
    readinessScore -= majorCount * 10;   // Each major subtracts 10%
    if (readinessScore < 0) readinessScore = 0;

    return {
      readinessScore: Math.max(0, Math.min(100, readinessScore)),
      isLaunchReady: blockerCount === 0 && readinessScore >= 80,
      totalTesters,
      activeTesters,
      avgChecklistProgress,
      blockerCount,
      majorCount,
      resolvedCount,
      totalFeedback: feedback.length
    };
  }
}

export const betaService = new BetaValidationService();
