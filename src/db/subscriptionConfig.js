// Subscription tiers and gating configurations for WarrenWise Pro (RabbitryPedigree Pro)

export const SUBSCRIPTION_TIERS = {
  basic: {
    id: 'basic',
    name: 'Basic Hutch Plan',
    priceLabel: '$5.99 / month or $59.00 / year',
    limit: 75,
    cloudStorageGb: 1,
    maxPhotos: 500,
    features: [
      '14-Day Free Trial (Age Verify CC required)',
      'Hutch inventory registry (max 75 active animals)',
      '1 GB Cloud & Photo Storage (~500 uploads)',
      'Full 4-generation pedigree tree generation',
      'No PDF watermarks on certificates',
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
    cloudStorageGb: 10,
    maxPhotos: 9999,
    features: [
      '14-Day Free Trial (Age Verify CC required)',
      'Large herd inventory (max 500 active profiles)',
      '10 GB Cloud & Photo Storage (~10,000 uploads)',
      'All Basic Plan hutch registry features',
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
    cloudStorageGb: 5,
    maxPhotos: 2500,
    features: [
      '14-Day Free Trial (Age Verify CC required)',
      'Medium hutch registry (max 100 active profiles)',
      '5 GB Cloud & Photo Storage (~2,500 uploads)',
      'All Basic Plan hutch registry features',
      '4-H Learning gamified challenges and quizzes',
      '4-H parent chore checklists & controls',
      '4-H Leader / Coach learning progress sharing',
      'Free linked student accounts for children/students'
    ]
  },
  evans_lifetime: {
    id: 'evans_lifetime',
    name: 'Evans Migrant Lifetime Offer',
    priceLabel: '$249.00 one-time for first 5 years',
    limit: 500,
    cloudStorageGb: 10,
    maxPhotos: 9999,
    features: [
      'Special Verified Evans Software switcher rate',
      'Includes 5 years of all major updates & features',
      '10 GB Cloud & Photo Storage (~10,000 uploads)',
      'Pay only for optional major version upgrades after 5 years',
      'No standard monthly or yearly recurring hutch bills',
      'All Pro Plan commercial tools and imports included'
    ]
  }
};

export const STORAGE_EXPANSION_PACKS = [
  { id: 'gb_2', name: '+2 GB Storage', priceLabel: '$2.99', gb: 2, approxPhotos: 1000 },
  { id: 'gb_5', name: '+5 GB Storage', priceLabel: '$5.99', gb: 5, approxPhotos: 2500 },
  { id: 'gb_15', name: '+15 GB Storage', priceLabel: '$12.99', gb: 15, approxPhotos: 7500 }
];

// Map features to eligible tier lists
export const FEATURE_TIER_ELIGIBILITY = {
  basic_registry: ['basic', 'pro', 'youth_academy', 'evans_lifetime'],
  pedigree_full: ['basic', 'pro', 'youth_academy', 'evans_lifetime'],
  financial_ledger: ['basic', 'pro', 'youth_academy', 'evans_lifetime'],
  cloud_sync: ['basic', 'pro', 'youth_academy', 'evans_lifetime'],
  genetics_calc: ['basic', 'pro', 'youth_academy', 'evans_lifetime'],
  
  evans_import: ['evans_lifetime'],
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
