// Subscription tiers and gating configurations for WarrenWise Pro (RabbitryPedigree Pro)

export const SUBSCRIPTION_TIERS = {
  basic: {
    id: 'basic',
    name: 'Basic Hutch Plan',
    priceLabel: '$5.99 / month or $59.00 / year',
    limit: 75,
    maxPhotos: 500,
    features: [
      '14-Day Free Trial (Age Verify CC required)',
      'Hutch inventory registry (max 75 active animals)',
      'Full 4-generation pedigree tree generation',
      'No PDF watermarks on certificates',
      'Media photo logs (max 500 uploads)',
      'Gestation milestones & notification alerts',
      'Genetics inbreeding calculator',
      'Basic hutch financial ledger',
      'Offline auto-sync with secure SQLite cloud'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro / Commercial Plan',
    priceLabel: '$12.99 / month or $129.00 / year',
    limit: 500,
    maxPhotos: 9999,
    features: [
      '14-Day Free Trial (Age Verify CC required)',
      'Large herd inventory (max 500 active profiles)',
      'All Basic Plan hutch registry features',
      'Evans Software one-click import engine',
      'Multi-breeder/assistant hutch permissions',
      'Advanced financial profit/loss analytics',
      'Exhibitor registry bulk prep reports'
    ]
  },
  youth_academy: {
    id: 'youth_academy',
    name: '4-H Academy & Family Plan',
    priceLabel: '$15.99 / month',
    limit: 100,
    maxPhotos: 2000,
    features: [
      '14-Day Free Trial (Age Verify CC required)',
      'Medium hutch registry (max 100 active profiles)',
      'All Basic Plan hutch registry features',
      '4-H Learning gamified challenges and quizzes',
      '4-H parent chore checklists & controls',
      '4-H Leader / Coach learning progress sharing',
      'Free linked student accounts for children/students'
    ]
  },
  evans_lifetime: {
    id: 'evans_lifetime',
    name: 'Evans Migrant Lifetime',
    priceLabel: '$249.00 one-time, or 3 monthly payments of $85.00',
    limit: 500,
    maxPhotos: 9999,
    features: [
      'Verified Evans Migrant Lifetime account',
      'All Pro tier features & 5 years major updates',
      'No standard recurring hutch subscription bills',
      'Installment payment plans available'
    ]
  }
};

// Map features to eligible tier lists
export const FEATURE_TIER_ELIGIBILITY = {
  basic_registry: ['basic', 'pro', 'youth_academy', 'evans_lifetime'],
  pedigree_full: ['basic', 'pro', 'youth_academy', 'evans_lifetime'],
  financial_ledger: ['basic', 'pro', 'youth_academy', 'evans_lifetime'],
  cloud_sync: ['basic', 'pro', 'youth_academy', 'evans_lifetime'],
  genetics_calc: ['basic', 'pro', 'youth_academy', 'evans_lifetime'],
  
  evans_import: ['pro', 'evans_lifetime'],
  multi_breeder: ['pro', 'evans_lifetime'],
  commercial_analytics: ['pro', 'evans_lifetime'],
  registrar_bulk_prep: ['pro', 'evans_lifetime'],
  
  academy: ['youth_academy'],
  chore_assignment: ['youth_academy'],
  learning_share: ['youth_academy'],
  student_link: ['youth_academy']
};

// Check if a tier has access to a specific feature
export const canAccessFeature = (userTier = 'basic', featureName) => {
  const allowedTiers = FEATURE_TIER_ELIGIBILITY[featureName];
  if (!allowedTiers) return true; // Unregulated
  return allowedTiers.includes(userTier);
};

// Get inventory size limits
export const getTierLimits = (userTier = 'basic') => {
  const config = SUBSCRIPTION_TIERS[userTier] || SUBSCRIPTION_TIERS.basic;
  return {
    animalLimit: config.limit,
    photoLimit: config.maxPhotos
  };
};

export const EVANS_LIMIT_CONFIG = {
  maxRedemptions: 500,
  expirationDate: '2026-12-31'
};
