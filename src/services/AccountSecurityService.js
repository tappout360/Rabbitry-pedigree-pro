/**
 * AccountSecurityService.js
 * Comprehensive Zero Trust Security, 2FA (TOTP), Session Management, Rate Limiting, & Audit Logging
 * WarrenWise Pro / RabbitryPedigree Pro (rabbitrypedigreepro.com)
 */
import { db } from '../db/registryDb';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Generate random Base32 Secret Key for TOTP
export function generateTotpSecret(length = 16) {
  let secret = '';
  const randomBytes = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < length; i++) randomBytes[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < length; i++) {
    secret += BASE32_ALPHABET[randomBytes[i] % 32];
  }
  return secret;
}

// Generate 8 single-use backup recovery codes
export function generateBackupCodes(count = 8) {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const codes = [];
  for (let i = 0; i < count; i++) {
    let part1 = '';
    let part2 = '';
    for (let j = 0; j < 4; j++) {
      part1 += chars[Math.floor(Math.random() * chars.length)];
      part2 += chars[Math.floor(Math.random() * chars.length)];
    }
    codes.push(`${part1}-${part2}`);
  }
  return codes;
}

// Simple Base32 Decoder
function base32Decode(base32) {
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = '';
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_ALPHABET.indexOf(clean.charAt(i));
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  return new Uint8Array(bytes);
}

// Calculate TOTP Code using Web Crypto API HMAC-SHA1
export async function generateTotpCode(secret, timeOffsetStep = 0) {
  try {
    const epoch = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / 30) + timeOffsetStep;
    
    // Prepare 8-byte big-endian counter buffer
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setUint32(4, counter, false);

    const keyBytes = base32Decode(secret);
    if (keyBytes.length === 0) return null;

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: { name: 'SHA-1' } },
      false,
      ['sign']
    );

    const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, buffer);
    const sigBytes = new Uint8Array(signature);
    
    const offset = sigBytes[sigBytes.length - 1] & 0xf;
    const binary =
      ((sigBytes[offset] & 0x7f) << 24) |
      ((sigBytes[offset + 1] & 0xff) << 16) |
      ((sigBytes[offset + 2] & 0xff) << 8) |
      (sigBytes[offset + 3] & 0xff);

    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  } catch (err) {
    console.error('Error generating TOTP code:', err);
    return null;
  }
}

// Verify TOTP Code (checks current, -1, and +1 step for 60s window)
export async function verifyTotpCode(secret, code) {
  if (!secret || !code) return false;
  const cleanCode = code.toString().trim();
  if (cleanCode.length !== 6) return false;

  for (let step = -1; step <= 1; step++) {
    const expected = await generateTotpCode(secret, step);
    if (expected === cleanCode) {
      return true;
    }
  }
  return false;
}

// Generate OTPAuth URI for QR code scanners
export function getTotpUri(email, secret, issuer = 'RabbitryPedigreePro.com') {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(email || 'breeder');
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

// Rate Limiting & Lockout Engine
const RATE_LIMIT_PREFIX = 'rp_rate_limit_';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function checkAccountLockout(identifier) {
  if (!identifier) return { isLocked: false };
  const key = `${RATE_LIMIT_PREFIX}${identifier.toLowerCase()}`;
  try {
    const record = JSON.parse(localStorage.getItem(key));
    if (!record) return { isLocked: false, attemptsRemaining: MAX_ATTEMPTS };

    const now = Date.now();
    if (record.lockedUntil && record.lockedUntil > now) {
      const minutesLeft = Math.ceil((record.lockedUntil - now) / (60 * 1000));
      return {
        isLocked: true,
        minutesLeft,
        lockedUntil: record.lockedUntil
      };
    }

    if (record.lockedUntil && record.lockedUntil <= now) {
      // Cooldown has expired, reset
      localStorage.removeItem(key);
      return { isLocked: false, attemptsRemaining: MAX_ATTEMPTS };
    }

    const remaining = Math.max(0, MAX_ATTEMPTS - (record.count || 0));
    return { isLocked: false, attemptsRemaining: remaining };
  } catch {
    return { isLocked: false, attemptsRemaining: MAX_ATTEMPTS };
  }
}

export function recordFailedAttempt(identifier) {
  if (!identifier) return;
  const key = `${RATE_LIMIT_PREFIX}${identifier.toLowerCase()}`;
  try {
    const record = JSON.parse(localStorage.getItem(key)) || { count: 0, firstAttempt: Date.now() };
    record.count += 1;
    record.lastAttempt = Date.now();

    if (record.count >= MAX_ATTEMPTS) {
      record.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    }
    localStorage.setItem(key, JSON.stringify(record));
    return checkAccountLockout(identifier);
  } catch {
    return { isLocked: false };
  }
}

export function resetAccountLockout(identifier) {
  if (!identifier) return;
  const key = `${RATE_LIMIT_PREFIX}${identifier.toLowerCase()}`;
  localStorage.removeItem(key);
}

// Active Sessions Tracker
export function getOrCreateSessionToken() {
  let token = localStorage.getItem('rp_session_token');
  if (!token) {
    token = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('rp_session_token', token);
  }
  return token;
}

export function getCurrentDeviceProfile() {
  const ua = navigator.userAgent || '';
  let browser = 'Browser';
  if (ua.includes('Chrome')) browser = 'Google Chrome';
  else if (ua.includes('Safari')) browser = 'Apple Safari';
  else if (ua.includes('Firefox')) browser = 'Mozilla Firefox';
  else if (ua.includes('Edge')) browser = 'Microsoft Edge';

  let os = 'Unknown OS';
  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  return {
    deviceName: `${os} - ${browser}`,
    platform: os,
    browser,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    lastActive: new Date().toISOString()
  };
}

// Zero Trust Session Lifetime (12-hour sliding window)
const SESSION_MAX_INACTIVE_MS = 12 * 60 * 60 * 1000; // 12 Hours

export function touchSessionActivity() {
  localStorage.setItem('rp_last_session_activity', Date.now().toString());
}

export function isSessionExpired() {
  const lastActive = localStorage.getItem('rp_last_session_activity');
  if (!lastActive) return false;
  const elapsed = Date.now() - Number(lastActive);
  return elapsed > SESSION_MAX_INACTIVE_MS;
}

// Invalidate other devices / sessions
export function invalidateOtherSessions(userId) {
  const currentToken = getOrCreateSessionToken();
  const sessionVersion = Date.now().toString();
  localStorage.setItem('rp_session_version_' + userId, sessionVersion);
  localStorage.setItem('rp_current_session_version', sessionVersion);
  return { currentToken, sessionVersion };
}

// Zero Trust Re-Authentication Tickets (5-minute validity)
const REAUTH_TICKET_PREFIX = 'rp_reauth_ticket_';
const REAUTH_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export function createReAuthTicket(userId, actionName) {
  const ticketId = 'tk_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  const ticketData = {
    ticketId,
    userId,
    actionName,
    createdAt: Date.now(),
    expiresAt: Date.now() + REAUTH_DURATION_MS
  };
  sessionStorage.setItem(REAUTH_TICKET_PREFIX + actionName, JSON.stringify(ticketData));
  return ticketId;
}

export function hasValidReAuthTicket(actionName) {
  try {
    const raw = sessionStorage.getItem(REAUTH_TICKET_PREFIX + actionName);
    if (!raw) return false;
    const ticket = JSON.parse(raw);
    if (Date.now() > ticket.expiresAt) {
      sessionStorage.removeItem(REAUTH_TICKET_PREFIX + actionName);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function consumeReAuthTicket(actionName) {
  sessionStorage.removeItem(REAUTH_TICKET_PREFIX + actionName);
}

// Detect Unusual Device / Browser Patterns
export function detectUnusualDevice(currentProfile, knownSessions = []) {
  if (!knownSessions || knownSessions.length === 0) return { isUnusual: false };
  const hasSeenPlatform = knownSessions.some(s => s.platform === currentProfile.platform);
  const hasSeenBrowser = knownSessions.some(s => s.browser === currentProfile.browser);

  if (!hasSeenPlatform || !hasSeenBrowser) {
    return {
      isUnusual: true,
      message: `Login detected from a new environment: ${currentProfile.deviceName}`
    };
  }
  return { isUnusual: false };
}

// Append-Only Security & Audit Logger
export async function logSecurityEvent(breederId, eventType, details = {}, severity = 'info') {
  try {
    const logEntry = {
      id: 'sec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      breederId: breederId || 'anonymous',
      eventType, // LOGIN_SUCCESS, REAUTH_SUCCESS, 2FA_ENABLED, PASSWORD_CHANGED, etc.
      severity,  // 'info', 'warning', 'critical'
      timestamp: new Date().toISOString(),
      details: typeof details === 'string' ? details : JSON.stringify(details),
      userAgent: navigator.userAgent || 'unknown',
      device: getCurrentDeviceProfile().deviceName
    };

    if (db && db.securityLogs) {
      await db.securityLogs.add(logEntry);
    }
    return logEntry;
  } catch (err) {
    console.warn('Security logging error:', err);
    return null;
  }
}
