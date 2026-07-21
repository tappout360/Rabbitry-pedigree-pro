// Subscription Tiers & Capacity-Based Configurations for WarrenWise Pro (RabbitryPedigree Pro)
// ALL FEATURES UNLOCKED ON EVERY PLAN; Tiers scale based on Active Hutches, Storage (GB), and Barn Crew Seats.

export const SUBSCRIPTION_TIERS = {
  youth_student: {
    id: 'youth_student',
    name: '4-H Youth Linked Student Account',
    priceLabel: 'FREE ($0 / month linked to Parent Account)',
    monthlyPrice: 0,
    annualPrice: 0,
    limit: 25,
    cloudStorageGb: 1,
    maxPhotos: 500,
    maxCrewMembers: 1,
    features: [
      '100% FREE ($0) linked sub-account under Parent Account',
      'Individual login credentials for 4-H exhibitor',
      'Full access to 4-H Youth Academy & Quizzes',
      'ARBA Showmanship Routine Trainer & Checkpoints',
      'Hutch inventory registry (max 25 active animals)',
      '4-H Project Book Record Keeping',
      'Parental Controls & Consent Gate verified'
    ]
  },
  basic: {
    id: 'basic',
    name: 'Hobbyist & 4-H Starter Plan',
    priceLabel: '$4.99 / month or $49.00 / year',
    monthlyPrice: 4.99,
    annualPrice: 49.00,
    limit: 50,
    cloudStorageGb: 2,
    maxPhotos: 1000,
    maxCrewMembers: 1,
    features: [
      'ALL App Features Unlocked (Pedigrees, Voice, Ledger, etc.)',
      'Hutch inventory registry (max 50 active animals)',
      '2 GB Cloud Photo Storage (~1,000 photos)',
      'Full 4-generation pedigree tree generation',
      'Genetics inbreeding calculator (Wright’s COI)',
      'Financial ledger & digital bill of sale transfers',
      '100% Offline PWA access with auto-sync'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro Show Barn Plan',
    priceLabel: '$9.99 / month or $99.00 / year',
    monthlyPrice: 9.99,
    annualPrice: 99.00,
    evansAnnualFirstYearPrice: 49.00, // $50 OFF first year annual for Evans switchers!
    limit: 200,
    cloudStorageGb: 10,
    maxPhotos: 5000,
    maxCrewMembers: 3,
    features: [
      'ALL App Features Unlocked',
      'Active herd inventory (max 200 active animals)',
      '10 GB Cloud Photo Storage (~5,000 photos)',
      '3 Barn Crew / Assistant Sub-User Seats (Owner + 2 Helpers)',
      'Photo Gallery Editor & Lightbox',
      'Medication & Health Treatment Logs',
      'Multi-user barn permissions'
    ]
  },
  master: {
    id: 'master',
    name: 'Master Breeder Plan',
    priceLabel: '$19.99 / month or $199.00 / year',
    monthlyPrice: 19.99,
    annualPrice: 199.00,
    evansAnnualFirstYearPrice: 149.00, // $50 OFF first year annual for Evans switchers!
    limit: 750,
    cloudStorageGb: 35,
    maxPhotos: 20000,
    maxCrewMembers: 6,
    features: [
      'ALL App Features Unlocked',
      'Large herd inventory (max 750 active animals)',
      '35 GB Cloud Photo Storage (~20,000 photos)',
      '6 Barn Crew / Assistant Sub-User Seats (Owner + 5 Helpers)',
      'Free Evans Software Auto-Migrator Tool',
      'Priority ARBA Registrar Support',
      'Exhibitor registry bulk prep reports'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Commercial Enterprise & Co-Op Plan',
    priceLabel: '$34.99 / month or $349.00 / year',
    monthlyPrice: 34.99,
    annualPrice: 349.00,
    limit: 99999,
    cloudStorageGb: 100,
    maxPhotos: 50000,
    maxCrewMembers: 999,
    features: [
      'ALL App Features Unlocked',
      'Unlimited Active Hutches & Animal Profiles',
      '100 GB Cloud Photo Storage (~50,000 photos)',
      'Unlimited Barn Crew / Assistant Seats',
      'Multi-Location Barn Management',
      'Co-Op Marketing & Public Directory Showcase'
    ]
  }
};

export const ADDON_EXPANSION_PACKS = [
  { id: 'hutch_50', name: '+50 Extra Active Hutches', priceLabel: '$1.99 / mo', limitIncrease: 50 },
  { id: 'gb_10', name: '+10 GB Photo Storage', priceLabel: '$1.49 / mo', gb: 10, approxPhotos: 5000 },
  { id: 'crew_1', name: '+1 Extra Barn Crew Seat', priceLabel: '$1.49 / mo', seats: 1 }
];

export const EVANS_LIMIT_CONFIG = {
  maxRabbits: 500,
  maxPhotos: 9999,
  cloudStorageGb: 10
};

export function canAccessFeature(tier, featureKey) {
  return true; // All features unlocked for everyone
}

export function getTierLimits(tier = 'basic') {
  const t = SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.basic;
  return {
    maxRabbits: t.limit,
    cloudStorageGb: t.cloudStorageGb,
    maxPhotos: t.maxPhotos,
    maxCrewMembers: t.maxCrewMembers || 1
  };
}
