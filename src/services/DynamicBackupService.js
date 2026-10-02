/**
 * DynamicBackupService.js
 * Production-Grade Dynamic Backup & Disaster Recovery Engine
 * 
 * Complies with ARBA, COPPA, and Zero Trust standards.
 * Supports:
 * - Full Scope Extraction across 15+ registry tables + settings + sync queue
 * - Schema v3.0 with SHA-256 Checksums and optional AES-256 Encryption
 * - Rolling Retention Policy (Max 5 automatic, pinned manual backups preserved)
 * - Pre-Destructive-Action and Pre-Update Safety Snapshots
 * - Guided Restore with Interactive Diff Preview, Category Filtering, and Merge/Replace Modes
 * - Seamless Cloud Sync with MongoDB Atlas & Offline-First Resilience
 */

import CryptoJS from 'crypto-js';
import { db } from '../db/registryDb';
import { logSecurityEvent } from './AccountSecurityService';

export const BACKUP_FORMAT_VERSION = '3.0';
export const CLIENT_APP_VERSION = '7.1.0';
export const MAX_AUTO_SNAPSHOTS = 5;

export class DynamicBackupService {
  /**
   * Extract all active user tables, settings, and pending queue states into a structured payload.
   */
  static async extractFullPayload(breederId) {
    if (!db) throw new Error('Database not initialized');

    // Filter helper by breederId
    const getByBreeder = async (table) => {
      if (!table) return [];
      try {
        const records = await table.toArray();
        if (!breederId || breederId === 'all') return records;
        return records.filter(r => !r.breederId || r.breederId === breederId || r.authorId === breederId);
      } catch {
        return [];
      }
    };

    // Extract core data tables
    const [
      rabbits,
      breedings,
      litters,
      ledger,
      medical,
      weights,
      shows,
      showEntries,
      transfers,
      signatures,
      chores,
      youthProgress,
      youthQuizLogs,
      subscriptions,
      photoThumbnails,
      syncQueue
    ] = await Promise.all([
      getByBreeder(db.rabbits),
      getByBreeder(db.breedings),
      getByBreeder(db.litters),
      getByBreeder(db.ledger),
      getByBreeder(db.medical),
      getByBreeder(db.weights),
      getByBreeder(db.shows),
      getByBreeder(db.showEntries),
      getByBreeder(db.transfers),
      getByBreeder(db.signatures),
      getByBreeder(db.chores),
      getByBreeder(db.youthProgress),
      getByBreeder(db.youthQuizLogs),
      getByBreeder(db.subscriptions),
      getByBreeder(db.photoThumbnails),
      getByBreeder(db.syncQueue)
    ]);

    // Extract user preferences and configuration from localStorage
    const settings = {
      theme: localStorage.getItem('rp_theme') || 'dark',
      weightUnit: localStorage.getItem('rp_weight_unit') || 'oz',
      dateFormat: localStorage.getItem('rp_date_format') || 'YYYY-MM-DD',
      syncMode: localStorage.getItem('rp_sync_mode') || 'auto',
      photoCompression: localStorage.getItem('rp_photo_compression') || 'medium',
      voiceSpeed: localStorage.getItem('rp_voice_speed') || '1.0',
      autoBackupSchedule: localStorage.getItem('rp_auto_backup_schedule') || 'daily',
      customAccent: localStorage.getItem('rp_custom_accent') || '#6366f1'
    };

    // Extract cage records if present in local state
    let cages = [];
    try {
      const rawCages = localStorage.getItem('rp_barn_cages');
      if (rawCages) cages = JSON.parse(rawCages);
    } catch {}

    // Clean youth data to satisfy COPPA privacy rules (strip raw emails/phones of minors)
    const sanitizedYouth = youthProgress.map(yp => ({
      ...yp,
      parentContact: undefined,
      email: undefined,
      phone: undefined
    }));

    return {
      rabbits,
      breedings,
      litters,
      ledger,
      medical,
      weights,
      shows,
      showEntries,
      transfers,
      signatures,
      chores,
      cages,
      youthProgress: sanitizedYouth,
      youthQuizLogs,
      subscriptions,
      photoThumbnails,
      syncQueueState: syncQueue.map(sq => ({ id: sq.id, action: sq.action, tbl: sq.tbl, timestamp: sq.timestamp })),
      settings
    };
  }

  /**
   * Create a new backup snapshot (local + optional cloud sync).
   * 
   * @param {Object} options
   * @param {'manual'|'automatic'|'pre_action'|'pre_update'|'portable'} options.type
   * @param {string} options.label - Descriptive label (e.g. "Before Evans Import")
   * @param {string} options.passphrase - Optional AES-256 encryption password
   * @param {string} options.breederId - Target breeder ID
   * @param {string} options.breederName - Rabbitry or breeder name
   * @param {boolean} options.autoSyncCloud - Whether to upload to cloud endpoint if online
   */
  static async createBackup({
    type = 'manual',
    label = '',
    passphrase = '',
    breederId = 'primary',
    breederName = 'Rabbitry',
    autoSyncCloud = true
  } = {}) {
    const rawTables = await this.extractFullPayload(breederId);

    const recordCounts = {
      rabbits: rawTables.rabbits.length,
      breedings: rawTables.breedings.length,
      litters: rawTables.litters.length,
      ledger: rawTables.ledger.length,
      medical: rawTables.medical.length,
      weights: rawTables.weights.length,
      shows: rawTables.shows.length,
      chores: rawTables.chores.length,
      cages: rawTables.cages.length
    };

    const backupId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const createdAt = new Date().toISOString();

    const deviceProfile = {
      platform: typeof navigator !== 'undefined' ? navigator.platform : 'Unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      screen: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Unknown'
    };

    const metadata = {
      backupFormatVersion: BACKUP_FORMAT_VERSION,
      id: backupId,
      createdAt,
      appVersion: CLIENT_APP_VERSION,
      type,
      label: label || `${type.toUpperCase()} Backup - ${new Date().toLocaleDateString()}`,
      accountId: breederId,
      breederName,
      device: deviceProfile,
      recordCounts
    };

    const unencryptedPayload = {
      ...metadata,
      tables: rawTables
    };

    const rawJson = JSON.stringify(unencryptedPayload);
    const checksum = CryptoJS.SHA256(rawJson).toString();

    let finalPayload;
    const isEncrypted = Boolean(passphrase && passphrase.trim());

    if (isEncrypted) {
      const ciphertext = CryptoJS.AES.encrypt(rawJson, passphrase.trim()).toString();
      finalPayload = {
        ...metadata,
        encrypted: true,
        checksum,
        ciphertext
      };
    } else {
      finalPayload = {
        ...metadata,
        encrypted: false,
        checksum,
        data: unencryptedPayload
      };
    }

    const payloadString = JSON.stringify(finalPayload);
    const sizeBytes = new Blob([payloadString]).size;

    // Save snapshot in local IndexedDB store
    const snapshotRecord = {
      id: backupId,
      breederId,
      type,
      label: metadata.label,
      createdAt,
      sizeBytes,
      checksum,
      status: 'completed',
      isPinned: type === 'manual' || type === 'pre_action', // Pin manual & pre-action by default
      cloudSynced: false,
      recordCounts,
      encrypted: isEncrypted,
      payload: finalPayload
    };

    if (db && db.backupSnapshots) {
      try {
        await db.backupSnapshots.put(snapshotRecord);
        await this.pruneAutomaticBackups(breederId);
      } catch (err) {
        console.warn('[DynamicBackupService] Failed saving local snapshot to Dexie:', err);
      }
    }

    // Save last backup timestamp
    try {
      localStorage.setItem('rp_last_vault_backup_date', createdAt);
      localStorage.setItem('rp_last_backup_type', type);
    } catch {}

    // Cloud upload if requested and online
    if (autoSyncCloud && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        await this.syncSnapshotToCloud(snapshotRecord);
      } catch (cloudErr) {
        console.warn('[DynamicBackupService] Cloud backup sync deferred:', cloudErr.message);
      }
    }

    // Security Audit Log
    logSecurityEvent(breederId, 'BACKUP_CREATED', {
      backupId,
      type,
      sizeBytes,
      checksum: checksum.slice(0, 12),
      isEncrypted
    });

    const safeName = (breederName || 'Rabbitry').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${safeName}_Backup_${type}_${createdAt.split('T')[0]}_${backupId.slice(-4)}.json`;

    return {
      backupId,
      snapshot: snapshotRecord,
      jsonString: payloadString,
      filename,
      recordCounts,
      sizeBytes,
      checksum
    };
  }

  /**
   * Enforce rolling retention policy: keep only MAX_AUTO_SNAPSHOTS unpinned automatic backups.
   */
  static async pruneAutomaticBackups(breederId) {
    if (!db || !db.backupSnapshots) return;
    try {
      const all = await db.backupSnapshots.where('breederId').equals(breederId).toArray();
      const autoBackups = all
        .filter(s => s.type === 'automatic' && !s.isPinned)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (autoBackups.length > MAX_AUTO_SNAPSHOTS) {
        const toDelete = autoBackups.slice(MAX_AUTO_SNAPSHOTS);
        for (const item of toDelete) {
          await db.backupSnapshots.delete(item.id);
        }
      }
    } catch (err) {
      console.warn('[DynamicBackupService] Pruning auto backups failed:', err);
    }
  }

  /**
   * List all stored backup snapshots for the user.
   */
  static async listSnapshots(breederId) {
    if (!db || !db.backupSnapshots) return [];
    try {
      const records = await db.backupSnapshots.toArray();
      const filtered = (!breederId || breederId === 'all')
        ? records
        : records.filter(r => r.breederId === breederId);

      return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch {
      return [];
    }
  }

  /**
   * Toggle the pinned status of a snapshot so it is exempt from auto-pruning.
   */
  static async togglePinSnapshot(snapshotId, isPinned) {
    if (!db || !db.backupSnapshots) return;
    await db.backupSnapshots.update(snapshotId, { isPinned });
  }

  /**
   * Delete a snapshot from local storage (and cloud if present).
   */
  static async deleteSnapshot(snapshotId, breederId) {
    if (!db || !db.backupSnapshots) return;
    await db.backupSnapshots.delete(snapshotId);

    // Call cloud delete endpoint if online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        await fetch(`/api/backups?id=${encodeURIComponent(snapshotId)}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('rp_auth_token') || ''}`
          }
        });
      } catch {}
    }

    logSecurityEvent(breederId, 'BACKUP_DELETED', { snapshotId });
  }

  /**
   * Push a snapshot record to the cloud backup endpoint (/api/backups).
   */
  static async syncSnapshotToCloud(snapshotRecord) {
    const token = localStorage.getItem('rp_auth_token');
    const response = await fetch('/api/backups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        id: snapshotRecord.id,
        type: snapshotRecord.type,
        label: snapshotRecord.label,
        createdAt: snapshotRecord.createdAt,
        sizeBytes: snapshotRecord.sizeBytes,
        checksum: snapshotRecord.checksum,
        recordCounts: snapshotRecord.recordCounts,
        encrypted: snapshotRecord.encrypted,
        payload: snapshotRecord.payload
      })
    });

    if (response.ok) {
      if (db && db.backupSnapshots) {
        await db.backupSnapshots.update(snapshotRecord.id, { cloudSynced: true });
      }
      return true;
    }
    return false;
  }

  /**
   * Validate and parse a backup file string or object before restoring.
   */
  static validateBackup(rawInput, passphrase = '') {
    try {
      const parsed = typeof rawInput === 'string' ? JSON.parse(rawInput) : rawInput;

      if (!parsed || (!parsed.data && !parsed.ciphertext)) {
        return { valid: false, error: 'Invalid file format. Unrecognized backup schema.' };
      }

      let unencryptedData;
      if (parsed.encrypted) {
        if (!passphrase || !passphrase.trim()) {
          return {
            valid: false,
            encrypted: true,
            error: 'This backup is protected with AES-256 encryption. Passphrase required.'
          };
        }
        try {
          const bytes = CryptoJS.AES.decrypt(parsed.ciphertext, passphrase.trim());
          const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
          if (!decryptedText) {
            return { valid: false, encrypted: true, error: 'Incorrect passphrase. Decryption failed.' };
          }
          unencryptedData = JSON.parse(decryptedText);
        } catch {
          return { valid: false, encrypted: true, error: 'Decryption failed. Incorrect passphrase or corrupted payload.' };
        }
      } else {
        unencryptedData = parsed.data || parsed;
      }

      // Verify SHA-256 checksum if present
      if (parsed.checksum) {
        const computed = CryptoJS.SHA256(JSON.stringify(unencryptedData)).toString();
        if (computed !== parsed.checksum) {
          return { valid: false, error: 'Integrity check failed: SHA-256 checksum mismatch. File may be corrupted or altered.' };
        }
      }

      if (!unencryptedData || !unencryptedData.tables || !Array.isArray(unencryptedData.tables.rabbits)) {
        return { valid: false, error: 'Backup is missing required rabbit registry tables.' };
      }

      return {
        valid: true,
        encrypted: Boolean(parsed.encrypted),
        metadata: {
          id: unencryptedData.id || parsed.id,
          createdAt: unencryptedData.createdAt || parsed.createdAt,
          appVersion: unencryptedData.appVersion || parsed.appVersion,
          type: unencryptedData.type || parsed.type || 'portable',
          label: unencryptedData.label || parsed.label,
          breederName: unencryptedData.breederName || parsed.breederName,
          recordCounts: unencryptedData.recordCounts || parsed.recordCounts
        },
        payload: unencryptedData
      };
    } catch (err) {
      return { valid: false, error: `JSON Parse error: ${err.message}` };
    }
  }

  /**
   * Compare backup payload against current live database to generate diff metrics.
   */
  static async computeDiff(payload) {
    if (!db) return null;
    const backupTables = payload.tables || {};

    const diff = {
      rabbits: { backupCount: (backupTables.rabbits || []).length, liveCount: await db.rabbits.count(), newCount: 0, updateCount: 0 },
      breedings: { backupCount: (backupTables.breedings || []).length, liveCount: await db.breedings.count(), newCount: 0, updateCount: 0 },
      litters: { backupCount: (backupTables.litters || []).length, liveCount: await db.litters.count(), newCount: 0, updateCount: 0 },
      ledger: { backupCount: (backupTables.ledger || []).length, liveCount: await db.ledger.count(), newCount: 0, updateCount: 0 },
      medical: { backupCount: (backupTables.medical || []).length, liveCount: await db.medical.count(), newCount: 0, updateCount: 0 }
    };

    // Calculate additions vs updates for rabbits
    const liveRabbitIds = new Set(await db.rabbits.toCollection().primaryKeys());
    (backupTables.rabbits || []).forEach(r => {
      if (liveRabbitIds.has(r.id)) {
        diff.rabbits.updateCount++;
      } else {
        diff.rabbits.newCount++;
      }
    });

    return diff;
  }

  /**
   * Execute guided restore with category filtering and strategy selection (merge vs replace).
   * 
   * @param {Object} payload - Validated unencrypted payload
   * @param {Object} options
   * @param {'merge'|'replace'} options.mode
   * @param {string[]} options.categories - ['all'] or subset ['rabbits', 'breedings', 'ledger', 'medical']
   * @param {string} options.breederId
   */
  static async executeRestore(payload, {
    mode = 'merge',
    categories = ['all'],
    breederId = 'primary'
  } = {}) {
    if (!db) throw new Error('Database not initialized');
    const tables = payload.tables;
    if (!tables) throw new Error('No table structures in backup payload');

    const shouldRestore = (cat) => categories.includes('all') || categories.includes(cat);
    const restoredCounts = {};

    // Take an automatic pre-restore safety snapshot in case the user wants to revert
    try {
      await this.createBackup({
        type: 'pre_action',
        label: 'Pre-Restore Safety Snapshot',
        breederId,
        autoSyncCloud: false
      });
    } catch (e) {
      console.warn('Pre-restore safety backup skipped:', e);
    }

    // Execute restoration transactionally
    await db.transaction('rw', [
      db.rabbits, db.breedings, db.litters, db.ledger, db.medical,
      db.weights, db.shows, db.showEntries, db.transfers, db.signatures, db.chores
    ], async () => {
      // 1. Rabbits & Lineage
      if (shouldRestore('rabbits') && tables.rabbits) {
        if (mode === 'replace') await db.rabbits.clear();
        await db.rabbits.bulkPut(tables.rabbits);
        restoredCounts.rabbits = tables.rabbits.length;
      }

      // 2. Breedings & Litters
      if (shouldRestore('breedings') && tables.breedings) {
        if (mode === 'replace') await db.breedings.clear();
        await db.breedings.bulkPut(tables.breedings);
        restoredCounts.breedings = tables.breedings.length;
      }
      if (shouldRestore('breedings') && tables.litters) {
        if (mode === 'replace') await db.litters.clear();
        await db.litters.bulkPut(tables.litters);
        restoredCounts.litters = tables.litters.length;
      }

      // 3. Financial Ledger
      if (shouldRestore('ledger') && tables.ledger) {
        if (mode === 'replace') await db.ledger.clear();
        await db.ledger.bulkPut(tables.ledger);
        restoredCounts.ledger = tables.ledger.length;
      }

      // 4. Medical Logs
      if (shouldRestore('medical') && tables.medical) {
        if (mode === 'replace') await db.medical.clear();
        await db.medical.bulkPut(tables.medical);
        restoredCounts.medical = tables.medical.length;
      }

      // 5. Weights
      if (shouldRestore('medical') && tables.weights) {
        if (mode === 'replace') await db.weights.clear();
        await db.weights.bulkPut(tables.weights);
        restoredCounts.weights = tables.weights.length;
      }

      // 6. Shows
      if (shouldRestore('shows') && tables.shows) {
        if (mode === 'replace') await db.shows.clear();
        await db.shows.bulkPut(tables.shows);
        restoredCounts.shows = tables.shows.length;
      }
    });

    // Restore settings if requested
    if (shouldRestore('settings') && tables.settings) {
      Object.entries(tables.settings).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          localStorage.setItem(`rp_${k}`, v);
        }
      });
    }

    // Log security event
    logSecurityEvent(breederId, 'BACKUP_RESTORED', {
      backupId: payload.id,
      mode,
      categories,
      restoredCounts
    }, 'warning');

    return {
      success: true,
      mode,
      categories,
      restoredCounts,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check if an automatic scheduled backup is due and run it in the background.
   */
  static async checkScheduledBackupDue(breederId, breederName) {
    const schedule = localStorage.getItem('rp_auto_backup_schedule') || 'daily';
    if (schedule === 'disabled') return;

    const lastBackup = localStorage.getItem('rp_last_vault_backup_date');
    const now = Date.now();
    const intervalMs = schedule === 'weekly' ? 7 * 86400000 : 24 * 86400000;

    if (!lastBackup || (now - new Date(lastBackup).getTime()) > intervalMs) {
      console.log(`[DynamicBackupService] Automatic ${schedule} backup due. Creating snapshot...`);
      try {
        await this.createBackup({
          type: 'automatic',
          label: `Scheduled ${schedule.charAt(0).toUpperCase() + schedule.slice(1)} Auto-Backup`,
          breederId,
          breederName,
          autoSyncCloud: true
        });
      } catch (err) {
        console.warn('[DynamicBackupService] Scheduled backup failed:', err);
      }
    }
  }

  /**
   * Download a backup snapshot to the local filesystem.
   */
  static downloadSnapshotFile(snapshot, customFilename) {
    const payloadString = JSON.stringify(snapshot.payload, null, 2);
    const blob = new Blob([payloadString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = customFilename || `${(snapshot.label || 'Backup').replace(/[^a-zA-Z0-9_-]/g, '_')}_${snapshot.createdAt.split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
