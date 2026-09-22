/**
 * securityRules.js
 * Domain Core: Zero Trust Security Rules, Lockout Engine, and Credential Policies
 * Pure Business Logic - No UI, No DB, No Network Dependencies.
 */

export const SECURITY_POLICIES = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000,      // 15 minutes
  SESSION_MAX_INACTIVITY_MS: 12 * 60 * 60 * 1000, // 12 hours
  REAUTH_TICKET_TTL_MS: 5 * 60 * 1000       // 5 minutes
};

/**
 * Validates strong password according to security standards:
 * Minimum 8 characters, must contain at least 1 number or symbol.
 */
export function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required.' };
  }
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }
  const hasDigitOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  if (!hasDigitOrSymbol) {
    return { isValid: false, message: 'Password must include at least one number or special character.' };
  }
  return { isValid: true };
}

/**
 * Validates support-assisted account recovery ownership claims
 */
export function validateRecoveryOwnershipSignals(signals = {}) {
  const { arbaNumber, rabbitryName, sampleTattoos } = signals;
  const errors = [];

  if (!rabbitryName || rabbitryName.trim().length < 2) {
    errors.push('Official Rabbitry / Caviary name is required.');
  }

  if (!sampleTattoos || sampleTattoos.trim().length < 2) {
    errors.push('At least one known animal ear number or tattoo prefix is required for ownership verification.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
