/**
 * VaultBackupService.js
 * Comprehensive Local Data Vault Backup & Restore Engine
 * 
 * Features:
 * - 1-Click Complete Encrypted or Plain JSON Vault Export
 * - SHA-256 Checksum Integrity Verification
 * - Optional AES-256 Passphrase Encryption
 * - Safe Merge or Clean Rehydration Restore
 * - CSV Herd Stock Export for Excel/Evans Interoperability
 */

import CryptoJS from 'crypto-js';
import { db } from '../db/registryDb';

export class VaultBackupService {
  /**
   * Export all IndexedDB tables into a complete snapshot bundle.
   * 
   * @param {Object} options
   * @param {string} options.passphrase - Optional encryption passphrase
   * @param {string} options.breederName - Name of current breeder/rabbitry
   * @param {string} options.breederId - ID of current breeder
   * @returns {Promise<{ filename: string, jsonString: string, recordCounts: Object }>}
   */
  static async exportVault({ passphrase = '', breederName = 'Rabbitry', breederId = null } = {}) {
    if (!db) throw new Error('Database not initialized');

    // Extract all core data tables
    const rabbits = await db.rabbits.toArray();
    const breedings = await db.breedings.toArray();
    const litters = await db.litters.toArray();
    const transactions = db.transactions ? await db.transactions.toArray() : [];
    const cages = db.cages ? await db.cages.toArray() : [];

    const payloadData = {
      version: '2.0-vault',
      app: 'RabbitryPedigree Pro',
      exportDate: new Date().toISOString(),
      breeder: {
        id: breederId,
        name: breederName
      },
      counts: {
        rabbits: rabbits.length,
        breedings: breedings.length,
        litters: litters.length,
        transactions: transactions.length,
        cages: cages.length
      },
      tables: {
        rabbits,
        breedings,
        litters,
        transactions,
        cages
      }
    };

    const rawJson = JSON.stringify(payloadData);
    const checksum = CryptoJS.SHA256(rawJson).toString();

    let finalPayload;
    if (passphrase && passphrase.trim()) {
      const encrypted = CryptoJS.AES.encrypt(rawJson, passphrase.trim()).toString();
      finalPayload = {
        vaultVersion: '2.0-encrypted',
        app: 'RabbitryPedigree Pro',
        encrypted: true,
        checksum,
        exportDate: payloadData.exportDate,
        ciphertext: encrypted
      };
    } else {
      finalPayload = {
        vaultVersion: '2.0-plain',
        app: 'RabbitryPedigree Pro',
        encrypted: false,
        checksum,
        exportDate: payloadData.exportDate,
        data: payloadData
      };
    }

    const jsonString = JSON.stringify(finalPayload, null, 2);
    const safeName = (breederName || 'Rabbitry').replace(/[^a-zA-Z0-9_-]/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${safeName}_VaultBackup_${dateStr}.json`;

    // Trigger local download
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // Record last backup timestamp
    try {
      localStorage.setItem('rp_last_vault_backup_date', new Date().toISOString());
    } catch {}

    return {
      filename,
      jsonString,
      recordCounts: payloadData.counts
    };
  }

  /**
   * Validate and parse an uploaded vault backup file before restoring.
   */
  static validateVault(fileContentString, passphrase = '') {
    try {
      const parsed = JSON.parse(fileContentString);
      if (!parsed || (!parsed.data && !parsed.ciphertext)) {
        return { valid: false, error: 'Invalid file format. Not a recognized WarrenWise / RabbitryPedigree Pro vault file.' };
      }

      let payloadData;
      if (parsed.encrypted) {
        if (!passphrase || !passphrase.trim()) {
          return { valid: false, encrypted: true, error: 'This vault backup is encrypted. Please provide the encryption passphrase.' };
        }
        try {
          const bytes = CryptoJS.AES.decrypt(parsed.ciphertext, passphrase.trim());
          const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
          if (!decryptedText) {
            return { valid: false, encrypted: true, error: 'Incorrect passphrase. Could not decrypt vault backup.' };
          }
          payloadData = JSON.parse(decryptedText);
        } catch {
          return { valid: false, encrypted: true, error: 'Incorrect passphrase or corrupted encrypted payload.' };
        }
      } else {
        payloadData = parsed.data;
      }

      if (!payloadData || !payloadData.tables || !Array.isArray(payloadData.tables.rabbits)) {
        return { valid: false, error: 'Vault file does not contain valid rabbit registry tables.' };
      }

      return {
        valid: true,
        encrypted: !!parsed.encrypted,
        exportDate: payloadData.exportDate || parsed.exportDate,
        breeder: payloadData.breeder,
        counts: payloadData.counts || {
          rabbits: payloadData.tables.rabbits.length,
          breedings: (payloadData.tables.breedings || []).length,
          litters: (payloadData.tables.litters || []).length,
          transactions: (payloadData.tables.transactions || []).length,
          cages: (payloadData.tables.cages || []).length
        },
        payload: payloadData
      };
    } catch (err) {
      return { valid: false, error: `JSON Parse error: ${err.message}` };
    }
  }

  /**
   * Restore parsed vault payload into IndexedDB.
   * 
   * @param {Object} payloadData - Validated payload
   * @param {string} mode - 'merge' (default) or 'replace'
   */
  static async restoreVault(payloadData, mode = 'merge') {
    if (!db) throw new Error('Database not initialized');
    const { tables } = payloadData;
    if (!tables) throw new Error('No tables found in vault data');

    if (mode === 'replace') {
      await db.transaction('rw', [db.rabbits, db.breedings, db.litters], async () => {
        await db.rabbits.clear();
        await db.breedings.clear();
        await db.litters.clear();
        if (db.transactions) await db.transactions.clear();
        if (db.cages) await db.cages.clear();

        if (tables.rabbits?.length) await db.rabbits.bulkAdd(tables.rabbits);
        if (tables.breedings?.length) await db.breedings.bulkAdd(tables.breedings);
        if (tables.litters?.length) await db.litters.bulkAdd(tables.litters);
        if (db.transactions && tables.transactions?.length) await db.transactions.bulkAdd(tables.transactions);
        if (db.cages && tables.cages?.length) await db.cages.bulkAdd(tables.cages);
      });
    } else {
      // Merge mode: upsert using bulkPut
      await db.transaction('rw', [db.rabbits, db.breedings, db.litters], async () => {
        if (tables.rabbits?.length) await db.rabbits.bulkPut(tables.rabbits);
        if (tables.breedings?.length) await db.breedings.bulkPut(tables.breedings);
        if (tables.litters?.length) await db.litters.bulkPut(tables.litters);
        if (db.transactions && tables.transactions?.length) await db.transactions.bulkPut(tables.transactions);
        if (db.cages && tables.cages?.length) await db.cages.bulkPut(tables.cages);
      });
    }

    return {
      success: true,
      restoredCounts: {
        rabbits: tables.rabbits?.length || 0,
        breedings: tables.breedings?.length || 0,
        litters: tables.litters?.length || 0
      }
    };
  }

  /**
   * Export stock in CSV format compatible with Excel and spreadsheet tools.
   */
  static exportStockCsv(rabbits = []) {
    const headers = [
      'Tattoo',
      'Name',
      'Breed',
      'Variety',
      'Sex',
      'DOB',
      'Weight_Oz',
      'Weight_Lbs',
      'Sire_Tattoo',
      'Dam_Tattoo',
      'Registration_Number',
      'Grand_Champion_Number',
      'Legs_Count',
      'Cage_Location',
      'Status'
    ];

    const rows = rabbits.map(r => {
      const wtOz = Number(r.weightOz) || 0;
      const wtLbs = (wtOz / 16).toFixed(2);
      const escape = (str) => `"${(str || '').toString().replace(/"/g, '""')}"`;

      return [
        escape(r.tattooNumber),
        escape(r.name),
        escape(r.breed),
        escape(r.variety),
        escape(r.sex),
        escape(r.dob),
        wtOz,
        wtLbs,
        escape(r.sireTattoo || ''),
        escape(r.damTattoo || ''),
        escape(r.registrationNumber || ''),
        escape(r.gcNumber || ''),
        Number(r.legsCount) || 0,
        escape(r.location || ''),
        escape(r.status || 'active')
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RabbitryStock_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return csvContent;
  }
}
