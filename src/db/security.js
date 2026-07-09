import CryptoJS from 'crypto-js';

// Fallback session key derived from breeder context or system salt
const DEFAULT_SALT = 'RP_System_Secret_Salt_Vector_2026_Secure';

/**
 * Derives a cryptographic key from a password or active session context
 */
export const deriveSessionKey = (userPassword, userEmail) => {
  if (!userPassword || !userEmail) return DEFAULT_SALT;
  return CryptoJS.SHA256(userPassword + userEmail + DEFAULT_SALT).toString();
};

/**
 * Encrypt a plain text string using AES-256
 */
export const encryptAES = (plainText, secretKey) => {
  if (!plainText) return '';
  const key = secretKey || DEFAULT_SALT;
  try {
    return CryptoJS.AES.encrypt(String(plainText), key).toString();
  } catch (err) {
    console.error('Encryption failed:', err);
    return plainText;
  }
};

/**
 * Decrypt an AES-256 encrypted ciphertext string
 */
export const decryptAES = (cipherText, secretKey) => {
  if (!cipherText) return '';
  const key = secretKey || DEFAULT_SALT;
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) return cipherText; // Return original if not decryptable (e.g. already in plain text)
    return decrypted;
  } catch (err) {
    // If decryption fails, it might be plain text
    return cipherText;
  }
};

/**
 * Transparently encrypts specified fields in a database record before storage
 */
export const encryptRecord = (record, secretKey, fields = []) => {
  if (!record) return record;
  const encrypted = { ...record };
  fields.forEach(field => {
    if (encrypted[field] !== undefined && encrypted[field] !== null) {
      encrypted[field] = encryptAES(String(encrypted[field]), secretKey);
    }
  });
  return encrypted;
};

/**
 * Transparently decrypts specified fields in a database record after retrieval
 */
export const decryptRecord = (record, secretKey, fields = []) => {
  if (!record) return record;
  const decrypted = { ...record };
  fields.forEach(field => {
    if (decrypted[field] !== undefined && decrypted[field] !== null) {
      // Only decrypt if it looks like a base64 ciphertext block (CryptoJS AES output format)
      if (typeof decrypted[field] === 'string' && decrypted[field].length > 16) {
        let val = decryptAES(decrypted[field], secretKey);
        // Fall back to system default salt if user key decryption returns invalid values
        if (!val || val === decrypted[field] || val.startsWith('U2FsdGVk')) {
          val = decryptAES(decrypted[field], DEFAULT_SALT);
        }
        
        // Double-decryption recovery check: self-heal double-encrypted values
        if (typeof val === 'string' && val.startsWith('U2FsdGVk') && val.length > 16) {
          let innerVal = decryptAES(val, secretKey);
          if (!innerVal || innerVal === val || innerVal.startsWith('U2FsdGVk')) {
            innerVal = decryptAES(val, DEFAULT_SALT);
          }
          val = innerVal;
        }
        
        decrypted[field] = val;
      }
    }
  });
  return decrypted;
};

/**
 * Audit Logger: Inserts immutable operations tracking logs locally
 */
export const recordAuditLog = async (db, action, table, recordId, userId, details = '') => {
  if (!db || !db.approvals) return;
  const auditEntry = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    action, // e.g. 'INSERT', 'UPDATE', 'DELETE'
    table,  // e.g. 'rabbits', 'medical', 'ledger'
    recordId,
    userId,
    details,
    checksum: CryptoJS.SHA256(action + table + recordId + userId + details).toString()
  };
  
  try {
    // We reuse approvals/syncQueue or write it directly to IndexedDB if configured
    await db.approvals.add({
      id: auditEntry.id,
      breederId: userId,
      type: 'AUDIT_LOG',
      status: 'approved',
      timestamp: auditEntry.timestamp,
      assistantName: 'SecurityAgent',
      payload: auditEntry
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
};

/**
 * Mask sensitive veterinary notes, location values, and specific description fields for junior/youth helper accounts
 */
export const maskYouthField = (fieldName, value, ageGroup) => {
  if (!value) return '';
  if (ageGroup === 'junior' || ageGroup === 'teen') {
    const lower = fieldName.toLowerCase();
    if (lower === 'notes' || lower === 'treatment' || lower === 'location' || lower === 'details') {
      return '[Protected Youth Profile Value]';
    }
  }
  return value;
};
