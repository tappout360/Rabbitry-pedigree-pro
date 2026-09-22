/**
 * DiagnosticService.js
 * Barn Self-Diagnostics & System Health Check Engine
 * 
 * Inspects database integrity, storage quotas, service worker cache,
 * sync queues, and hardware APIs to empower breeders to self-troubleshoot.
 */

import { db } from '../db/registryDb';
import { globalSyncAdapter } from '../adapters/sync/OfflineSyncAdapter';

export class DiagnosticService {
  static async runFullDiagnostics() {
    const results = {
      timestamp: new Date().toISOString(),
      overallHealthy: true,
      checks: {}
    };

    // 1. Database Health Check
    try {
      if (!db) {
        results.checks.database = { status: 'fail', message: 'Dexie database instance not found' };
        results.overallHealthy = false;
      } else {
        const rabbitsCount = await db.rabbits.count();
        const breedingsCount = await db.breedings.count();
        const littersCount = await db.litters.count();

        results.checks.database = {
          status: 'pass',
          message: 'IndexedDB operational',
          counts: {
            rabbits: rabbitsCount,
            breedings: breedingsCount,
            litters: littersCount
          }
        };
      }
    } catch (err) {
      results.checks.database = { status: 'fail', message: `DB Error: ${err.message}` };
      results.overallHealthy = false;
    }

    // 2. Storage Quota & Persistence Check
    try {
      if (typeof navigator !== 'undefined' && navigator.storage) {
        const persisted = navigator.storage.persisted ? await navigator.storage.persisted() : false;
        let estimate = null;
        if (navigator.storage.estimate) {
          const est = await navigator.storage.estimate();
          estimate = {
            usageMb: Math.round((est.usage || 0) / (1024 * 1024)),
            quotaMb: Math.round((est.quota || 0) / (1024 * 1024)),
            percentUsed: est.quota ? Math.round(((est.usage || 0) / est.quota) * 100) : 0
          };
        }

        results.checks.storage = {
          status: 'pass',
          persisted,
          estimate,
          message: persisted 
            ? 'Persistent storage active (protected from OS auto-clearing)' 
            : 'Standard storage active (recommend requesting persistence)'
        };
      } else {
        results.checks.storage = { status: 'warning', message: 'Storage Manager API not supported by browser' };
      }
    } catch (err) {
      results.checks.storage = { status: 'warning', message: err.message };
    }

    // 3. Service Worker & Offline Cache Check
    try {
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        const isControlled = !!navigator.serviceWorker.controller;
        let cacheKeys = [];
        if (typeof window !== 'undefined' && 'caches' in window) {
          cacheKeys = await window.caches.keys();
        }

        results.checks.serviceWorker = {
          status: isControlled ? 'pass' : 'warning',
          registered: isControlled,
          caches: cacheKeys,
          message: isControlled 
            ? 'Service Worker active (offline barn mode enabled)' 
            : 'Service Worker initializing or bypassed in dev mode'
        };
      } else {
        results.checks.serviceWorker = { status: 'warning', message: 'Service Worker not supported' };
      }
    } catch (err) {
      results.checks.serviceWorker = { status: 'warning', message: err.message };
    }

    // 4. Sync Queue Check
    try {
      const queue = globalSyncAdapter.getQueue();
      const isOnline = globalSyncAdapter.isOnline();
      results.checks.syncQueue = {
        status: queue.length > 20 ? 'warning' : 'pass',
        pendingActions: queue.length,
        networkOnline: isOnline,
        lastSync: globalSyncAdapter.lastSyncTime || 'Never',
        message: `${queue.length} actions pending background sync`
      };
    } catch (err) {
      results.checks.syncQueue = { status: 'warning', message: err.message };
    }

    // 5. Hardware Capabilities Check
    results.checks.capabilities = {
      camera: typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia,
      webShare: typeof navigator !== 'undefined' && !!navigator.share,
      voiceRecognition: typeof window !== 'undefined' && !!(window.webkitSpeechRecognition || window.SpeechRecognition),
      speechSynthesis: typeof window !== 'undefined' && !!window.speechSynthesis,
      notifications: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
    };

    // 6. Device & Platform Context (Anonymized)
    results.environment = {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      platform: typeof navigator !== 'undefined' ? navigator.platform : 'Unknown',
      screen: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Unknown',
      appVersion: '7.0-launch-hardened'
    };

    return results;
  }

  /**
   * Format diagnostic report as readable Markdown for support tickets or clipboard copying.
   */
  static formatReportMarkdown(diagnostics) {
    const { checks, environment, timestamp } = diagnostics;
    const dbCheck = checks.database || {};
    const storageCheck = checks.storage || {};
    const swCheck = checks.serviceWorker || {};
    const syncCheck = checks.syncQueue || {};
    const caps = checks.capabilities || {};

    return `
### WarrenWise Pro / RabbitryPedigree Pro System Diagnostics
- **Timestamp**: ${timestamp}
- **App Version**: ${environment.appVersion}
- **Platform**: ${environment.platform} (Screen: ${environment.screen})

#### 1. Database (IndexedDB)
- Status: ${dbCheck.status?.toUpperCase() || 'UNKNOWN'} (${dbCheck.message || ''})
- Records: Rabbits: ${dbCheck.counts?.rabbits || 0} | Breedings: ${dbCheck.counts?.breedings || 0} | Litters: ${dbCheck.counts?.litters || 0}

#### 2. Storage Persistence
- Persistence Granted: ${storageCheck.persisted ? 'YES' : 'NO'}
- Storage Used: ${storageCheck.estimate ? `${storageCheck.estimate.usageMb} MB / ${storageCheck.estimate.quotaMb} MB (${storageCheck.estimate.percentUsed}%)` : 'N/A'}

#### 3. Offline & Service Worker
- Active Controller: ${swCheck.registered ? 'YES' : 'NO'}
- Caches: ${(swCheck.caches || []).join(', ') || 'None'}

#### 4. Sync Queue
- Online: ${syncCheck.networkOnline ? 'YES' : 'NO'}
- Pending Sync Actions: ${syncCheck.pendingActions || 0}
- Last Sync: ${syncCheck.lastSync || 'None'}

#### 5. Hardware & Browser Features
- Camera Access: ${caps.camera ? 'Supported' : 'Unavailable'}
- Native Web Share: ${caps.webShare ? 'Supported' : 'Fallback to PDF'}
- Hands-Free Voice Engine: ${caps.voiceRecognition ? 'Supported' : 'Unavailable'}
- Push Notifications: ${caps.notifications || 'Unsupported'}
    `.trim();
  }
}
