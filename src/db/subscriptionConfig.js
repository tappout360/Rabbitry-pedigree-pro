// Subscription tiers and gating configurations for WarrenWise Pro (RabbitryPedigree Pro)

export const SUBSCRIPTION_TIERS = {
  youth_student: {
    id: 'youth_student',
    name: '4-H Youth Linked Student Account',
    priceLabel: 'FREE ($0 / month linked to Parent Account)',
    limit: 50,
    cloudStorageGb: 1,
    maxPhotos: 250,
    features: [
      'Included FREE ($0) with any Parent or Leader Paid Plan',
      'Individual login username & password for 4-H exhibitor',
      'Parental Controls & Consent Gate verified',
      'Full access to 4-H Youth Academy & Quizzes',
      'ARBA Showmanship Routine Trainer & Step Guide',
      'Hutch inventory registry (max 50 active animals)',
      '4-H Project Book Record Keeping'
    ]
  },
  basic: {
    id: 'basic',
    name: 'Basic Hutch Plan',
    priceLabel: '$5.99 / month or $59.00 / year',
    limit: 75,
    cloudStorageGb: 1,
    maxPhotos: 500,
    features: [
      'Instant Activation & Full Feature Access',
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
    name: 'Pro Herd Plan',
    priceLabel: '$14.99 / month or $149.00 / year',
    limit: 300,
    cloudStorageGb: 10,
    maxPhotos: 9999,
    features: [
      'Instant Activation & Full Feature Access',
      'Active herd inventory (max 300 active profiles)',
      '10 GB Cloud & Photo Storage (~10,000 uploads)',
      'All Basic Plan hutch registry features',
      'Advanced Genetics & COI Risk Calculator',
      'Barn Crew & Assistant Roles permissions',
      'Photo Gallery Editor & Lightbox',
      'Medication & Health Treatment Logs',
      'Multi-user barn permissions'
    ]
  },
  master: {
    id: 'master',
    name: 'Master Breeder Plan',
    priceLabel: '$29.99 / month or $299.00 / year',
    limit: 1000,
    cloudStorageGb: 50,
    maxPhotos: 50000,
    features: [
      'Instant Activation & Full Feature Access',
      'Large herd inventory (max 1,000 active profiles)',
      '50 GB Cloud & Photo Storage (~50,000 uploads)',
      'Free Evans Software Auto-Migrator',
      'Priority ARBA Registrar Support',
      'Exhibitor registry bulk prep reports',
      'Unlimited Cloud Storage & Daily Backups'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Commercial Enterprise & Club Co-Op Plan',
    priceLabel: '$49.99 / month',
    limit: 99999,
    cloudStorageGb: 200,
    maxPhotos: 200000,
    features: [
      'Unlimited Active Hutches & Animal Profiles',
      '200 GB Cloud & Photo Storage (~200,000 uploads)',
      'Multi-Location Barn Management',
      'Co-Op Marketing & Public Directory Showcase',
      'Dedicated ARBA Registrar Sync Account'
    ]
  },
  evans_lifetime: {
    id: 'evans_lifetime',
    name: 'Evans Migrant Lifetime Offer',
    priceLabel: '$49.00 one-time switcher discount',
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

export const ADDON_EXPANSION_PACKS = [
  { id: 'hutch_50', name: '+50 Extra Hutches', priceLabel: '$2.99 / mo', limitIncrease: 50 },
  { id: 'hutch_150', name: '+150 Extra Hutches', priceLabel: '$6.99 / mo', limitIncrease: 150 },
  { id: 'gb_10', name: '+10 GB Cloud Storage', priceLabel: '$1.99 / mo', gb: 10, approxPhotos: 5000 },
  { id: 'gb_50', name: '+50 GB Cloud Storage', priceLabel: '$4.99 / mo', gb: 50, approxPhotos: 25000 }
];

export const EVANS_LIMIT_CONFIG = {
  maxRabbits: 500,
  maxPhotos: 9999,
  cloudStorageGb: 10
};

export function canAccessFeature(tier, featureKey) {
  return true; // All features unlocked for active tiers
}

export function getTierLimits(tier = 'basic') {
  const t = SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.basic;
  return {
    maxRabbits: t.limit,
    cloudStorageGb: t.cloudStorageGb,
    maxPhotos: t.maxPhotos
  };
}
