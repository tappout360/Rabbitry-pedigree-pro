/**
 * subscriptionRules.js
 * Domain Core: Subscription Tier Entitlements & Feature Gate Policies
 * Pure Business Logic - No UI, No DB, No Network Dependencies.
 */

export const TIERS = {
  FREE: 'free',
  FAMILY: 'family',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
};

export const FEATURES = {
  SAVE_RABBIT: 'SAVE_RABBIT',
  PRINT_PEDIGREE: 'PRINT_PEDIGREE',
  EXPORT_PDF: 'EXPORT_PDF',
  PRINT_CAGE_CARD: 'PRINT_CAGE_CARD',
  BILL_OF_SALE_TRANSFER: 'BILL_OF_SALE_TRANSFER',
  GENETICS_CALCULATOR: 'GENETICS_CALCULATOR',
  CLOUD_SYNC_BACKUP: 'CLOUD_SYNC_BACKUP',
  EVANS_MIGRATOR: 'EVANS_MIGRATOR',
  LARGE_HERD_SCALING: 'LARGE_HERD_SCALING' // 100+ animals
};

const TIER_ENTITLEMENTS = {
  [TIERS.FREE]: [
    FEATURES.SAVE_RABBIT,
    FEATURES.GENETICS_CALCULATOR
  ],
  [TIERS.FAMILY]: [
    FEATURES.SAVE_RABBIT,
    FEATURES.PRINT_PEDIGREE,
    FEATURES.EXPORT_PDF,
    FEATURES.PRINT_CAGE_CARD,
    FEATURES.BILL_OF_SALE_TRANSFER,
    FEATURES.GENETICS_CALCULATOR,
    FEATURES.CLOUD_SYNC_BACKUP,
    FEATURES.EVANS_MIGRATOR
  ],
  [TIERS.PRO]: Object.values(FEATURES),
  [TIERS.ENTERPRISE]: Object.values(FEATURES)
};

export function isFeatureEntitled(userTier = TIERS.FAMILY, featureKey, isDemoMode = false) {
  // In demo mode, printing and saving new live stock is locked
  if (isDemoMode) {
    if (featureKey === FEATURES.PRINT_PEDIGREE || featureKey === FEATURES.EXPORT_PDF || featureKey === FEATURES.PRINT_CAGE_CARD) {
      return false;
    }
  }

  const effectiveTier = TIER_ENTITLEMENTS[userTier] ? userTier : TIERS.FAMILY;
  const allowed = TIER_ENTITLEMENTS[effectiveTier] || [];
  return allowed.includes(featureKey);
}

export function explainEntitlementGap(featureKey) {
  switch (featureKey) {
    case FEATURES.PRINT_PEDIGREE:
    case FEATURES.EXPORT_PDF:
      return "Official 4-Generation Pedigree Certificate printing and PDF download require an active Family or Pro subscription.";
    case FEATURES.PRINT_CAGE_CARD:
      return "High-contrast QR Cage Card and Coop Tag printing requires an active subscription.";
    case FEATURES.BILL_OF_SALE_TRANSFER:
      return "Digital ARBA Bill of Sale transfer generation is included with Family & Pro subscriptions.";
    default:
      return "This advanced rabbitry feature requires an active subscription tier upgrade.";
  }
}
