// Subscription tiers and gating configurations for WarrenWise Pro (RabbitryPedigree Pro)

export const SUBSCRIPTION_TIERS = {
  free: {
    id: 'free',
    name: 'Starter (Free)',
    priceLabel: '$0.00',
    limit: 15,
    maxPhotos: 20,
    features: [
      'Basic rabbitry registry (max 15 active animals)',
      'Basic 3-generation pedigree printing (with watermark)',
      'Health & growth tracking',
      'Media photo gallery (max 20 uploads)',
      'Basic breeding scheduler',
      '4-H Academy access'
    ]
  },
  family: {
    id: 'family',
    name: 'Family / Hobby',
    priceLabel: '$5.99 / month or $59.00 / year',
    limit: 75,
    maxPhotos: 9999,
    features: [
      'Medium rabbitry registry (max 75 active animals)',
      'Full 4-generation pedigree tree generation',
      'No PDF watermarks',
      'Unlimited photo gallery space',
      'Gestation milestones & notification alerts',
      'Genetics inbreeding calculator',
      'Basic financial ledger log',
      'Offline auto-sync with cloud backups',
      '4-H parent chore dashboards'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro / Commercial',
    priceLabel: '$12.99 / month or $129.00 / year',
    limit: 500,
    maxPhotos: 9999,
    features: [
      'Large herd inventory (max 500 active profiles)',
      'All Family/Hobby features included',
      'Evans Software one-click import engine',
      'Multi-breeder/assistant admin permissions',
      'Advanced financial profit/loss analytics',
      'Exhibitor registry bulk prep reports'
    ]
  },
  lifetime: {
    id: 'lifetime',
    name: 'Lifetime Master',
    priceLabel: '$249.00 one-time',
    limit: 500,
    maxPhotos: 9999,
    features: [
      'Unlimited lifetime updates for 5 years',
      'All Pro tier capabilities unlocked',
      'Priority customer support channels',
      'Beta feature access'
    ]
  },
  evans_lifetime: {
    id: 'evans_lifetime',
    name: 'Evans Migrant Special',
    priceLabel: '$169.00 one-time',
    limit: 500,
    maxPhotos: 9999,
    features: [
      'Verified Evans Migrant Lifetime account',
      'All Pro features & 5 years major updates',
      'No recurring subscriptions ever'
    ]
  }
};

// Map features to minimum required tier levels for validation
export const FEATURE_MIN_TIERS = {
  basic_registry: 'free',
  academy: 'free',
  health_growth: 'free',
  pedigree_watermark: 'free',
  pedigree_full: 'family',
  genetics_calc: 'family',
  financial_ledger: 'family',
  cloud_sync: 'family',
  chore_assignment: 'family',
  evans_import: 'pro',
  multi_breeder: 'pro',
  commercial_analytics: 'pro',
  registrar_bulk_prep: 'pro'
};

// Check if a tier has access to a specific feature
export const canAccessFeature = (userTier = 'free', featureName) => {
  const minTier = FEATURE_MIN_TIERS[featureName];
  if (!minTier) return true; // Unregulated features

  const tierRank = { free: 0, family: 1, pro: 2, lifetime: 3, evans_lifetime: 3 };
  const userRank = tierRank[userTier] || 0;
  const requiredRank = tierRank[minTier] || 0;

  return userRank >= requiredRank;
};

// Get inventory size limits
export const getTierLimits = (userTier = 'free') => {
  const config = SUBSCRIPTION_TIERS[userTier] || SUBSCRIPTION_TIERS.free;
  return {
    animalLimit: config.limit,
    photoLimit: config.maxPhotos
  };
};

export const EVANS_LIMIT_CONFIG = {
  maxRedemptions: 500,
  expirationDate: '2026-12-31'
};
