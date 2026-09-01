import Dexie from 'dexie';
import {
  DEFAULT_BREEDERS, DEFAULT_RABBITS, DEFAULT_BREEDINGS, DEFAULT_LITTERS,
  DEFAULT_LEDGER, DEFAULT_SHOWS, DEFAULT_SHOW_ENTRIES, DEFAULT_CHORES, DEFAULT_TRANSFERS,
  DEFAULT_SIGNATURES, DEFAULT_MEDICAL, DEFAULT_WEIGHTS, DEFAULT_YOUTH_PROGRESS
} from './defaults';

export const db = new Dexie('RabbitryPedigreeProDB');

db.version(1).stores({
  adminBreeders: 'id, email, username',
  rabbits: 'id, breederId, breed, sireId, damId',
  breedings: 'id, breederId, buckId, doeId',
  litters: 'id, breederId, breedingId',
  ledger: 'id, breederId, rabbitId',
  shows: 'id, breederId',
  showEntries: 'id, breederId, showId, rabbitId',
  chores: 'id, breederId',
  transfers: 'id, breederId, rabbitId',
  signatures: 'id, breederId',
  medical: 'id, breederId, rabbitId',
  weights: 'id, breederId, rabbitId',
  syncQueue: 'id, breederId',
  approvals: 'id, breederId'
});

// Version 2: Advanced Indexing for query optimization & scaling (200-1000+ records)
db.version(2).stores({
  adminBreeders: 'id, email, username, role',
  rabbits: 'id, breederId, breed, variety, status, sex, dob, tattooNumber, sireId, damId, [breederId+status], [breederId+sex], [breederId+status+sex]',
  breedings: 'id, breederId, buckId, doeId, breedDate, status',
  litters: 'id, breederId, breedingId, kindleDate',
  ledger: 'id, breederId, rabbitId, date',
  shows: 'id, breederId, date',
  showEntries: 'id, breederId, showId, rabbitId',
  chores: 'id, breederId, dueDate',
  transfers: 'id, breederId, rabbitId, date',
  signatures: 'id, breederId',
  medical: 'id, breederId, rabbitId, date',
  weights: 'id, breederId, rabbitId, date, [rabbitId+date]',
  syncQueue: 'id, breederId, timestamp',
  approvals: 'id, breederId, timestamp'
});

// Version 3: Multi-species cavy field and youth progress/quiz tables
db.version(3).stores({
  adminBreeders: 'id, email, username, role',
  rabbits: 'id, breederId, breed, variety, status, sex, dob, tattooNumber, sireId, damId, species, [breederId+status], [breederId+sex], [breederId+status+sex]',
  breedings: 'id, breederId, buckId, doeId, breedDate, status',
  litters: 'id, breederId, breedingId, kindleDate',
  ledger: 'id, breederId, rabbitId, date',
  shows: 'id, breederId, date',
  showEntries: 'id, breederId, showId, rabbitId',
  chores: 'id, breederId, dueDate',
  transfers: 'id, breederId, rabbitId, date',
  signatures: 'id, breederId',
  medical: 'id, breederId, rabbitId, date',
  weights: 'id, breederId, rabbitId, date, [rabbitId+date]',
  syncQueue: 'id, breederId, timestamp',
  approvals: 'id, breederId, timestamp',
  youthProgress: 'id, memberName, ageGroup, currentLevel, xp, streak, lastActiveDate, coachId',
  youthQuizLogs: 'id, progressId, quizType, score, passed, date, coachFeedback'
});

// Version 4: Subscription & billing tracking tables
db.version(4).stores({
  adminBreeders: 'id, email, username, role',
  rabbits: 'id, breederId, breed, variety, status, sex, dob, tattooNumber, sireId, damId, species, [breederId+status], [breederId+sex], [breederId+status+sex]',
  breedings: 'id, breederId, buckId, doeId, breedDate, status',
  litters: 'id, breederId, breedingId, kindleDate',
  ledger: 'id, breederId, rabbitId, date',
  shows: 'id, breederId, date',
  showEntries: 'id, breederId, showId, rabbitId',
  chores: 'id, breederId, dueDate',
  transfers: 'id, breederId, rabbitId, date',
  signatures: 'id, breederId',
  medical: 'id, breederId, rabbitId, date',
  weights: 'id, breederId, rabbitId, date, [rabbitId+date]',
  syncQueue: 'id, breederId, timestamp',
  approvals: 'id, breederId, timestamp',
  youthProgress: 'id, memberName, ageGroup, currentLevel, xp, streak, lastActiveDate, coachId',
  youthQuizLogs: 'id, progressId, quizType, score, passed, date, coachFeedback',
  subscriptions: 'id, breederId, tier, status, currentPeriodEnd',
  invoices: 'id, breederId, stripeInvoiceId, status',
  evansVerifications: 'id, breederId, status'
});

// Version 5: COPPA Youth and Parental Consent attributes
db.version(5).stores({
  adminBreeders: 'id, email, username, role, parentalConsentVerified, consentToken',
  rabbits: 'id, breederId, breed, variety, status, sex, dob, tattooNumber, sireId, damId, species, [breederId+status], [breederId+sex], [breederId+status+sex]',
  breedings: 'id, breederId, buckId, doeId, breedDate, status',
  litters: 'id, breederId, breedingId, kindleDate',
  ledger: 'id, breederId, rabbitId, date',
  shows: 'id, breederId, date',
  showEntries: 'id, breederId, showId, rabbitId',
  chores: 'id, breederId, dueDate',
  transfers: 'id, breederId, rabbitId, date',
  signatures: 'id, breederId',
  medical: 'id, breederId, rabbitId, date',
  weights: 'id, breederId, rabbitId, date, [rabbitId+date]',
  syncQueue: 'id, breederId, timestamp',
  approvals: 'id, breederId, timestamp',
  youthProgress: 'id, memberName, ageGroup, currentLevel, xp, streak, lastActiveDate, coachId',
  youthQuizLogs: 'id, progressId, quizType, score, passed, date, coachFeedback',
  subscriptions: 'id, breederId, tier, status, currentPeriodEnd',
  invoices: 'id, breederId, stripeInvoiceId, status',
  evansVerifications: 'id, breederId, status'
});

// Version 6: Coach Authorization and Sync Conflict Resolution
db.version(6).stores({
  adminBreeders: 'id, email, username, role, parentalConsentVerified, consentToken, coachAuthorized',
  conflicts: 'id, recordId, tbl, fieldName',
  rabbits: 'id, breederId, breed, variety, status, sex, dob, tattooNumber, sireId, damId, species, [breederId+status], [breederId+sex], [breederId+status+sex]',
  breedings: 'id, breederId, buckId, doeId, breedDate, status',
  litters: 'id, breederId, breedingId, kindleDate',
  ledger: 'id, breederId, rabbitId, date',
  shows: 'id, breederId, date',
  showEntries: 'id, breederId, showId, rabbitId',
  chores: 'id, breederId, dueDate',
  transfers: 'id, breederId, rabbitId, date',
  signatures: 'id, breederId',
  medical: 'id, breederId, rabbitId, date',
  weights: 'id, breederId, rabbitId, date, [rabbitId+date]',
  syncQueue: 'id, breederId, timestamp',
  approvals: 'id, breederId, timestamp',
  youthProgress: 'id, memberName, ageGroup, currentLevel, xp, streak, lastActiveDate, coachId',
  youthQuizLogs: 'id, progressId, quizType, score, passed, date, coachFeedback',
  subscriptions: 'id, breederId, tier, status, currentPeriodEnd',
  invoices: 'id, breederId, stripeInvoiceId, status',
  evansVerifications: 'id, breederId, status'
});

// Version 7: Photo Thumbnails and Offline Queue
db.version(7).stores({
  adminBreeders: 'id, email, username, role, parentalConsentVerified, consentToken, coachAuthorized',
  conflicts: 'id, recordId, tbl, fieldName',
  rabbits: 'id, breederId, breed, variety, status, sex, dob, tattooNumber, sireId, damId, species, [breederId+status], [breederId+sex], [breederId+status+sex]',
  breedings: 'id, breederId, buckId, doeId, breedDate, status',
  litters: 'id, breederId, breedingId, kindleDate',
  ledger: 'id, breederId, rabbitId, date',
  shows: 'id, breederId, date',
  showEntries: 'id, breederId, showId, rabbitId',
  chores: 'id, breederId, dueDate',
  transfers: 'id, breederId, rabbitId, date',
  signatures: 'id, breederId',
  medical: 'id, breederId, rabbitId, date',
  weights: 'id, breederId, rabbitId, date, [rabbitId+date]',
  syncQueue: 'id, breederId, timestamp',
  approvals: 'id, breederId, timestamp',
  youthProgress: 'id, memberName, ageGroup, currentLevel, xp, streak, lastActiveDate, coachId',
  youthQuizLogs: 'id, progressId, quizType, score, passed, date, coachFeedback',
  subscriptions: 'id, breederId, tier, status, currentPeriodEnd, trialEnd',
  invoices: 'id, breederId, stripeInvoiceId, status',
  evansVerifications: 'id, breederId, status',
  photoThumbnails: 'id, rabbitId, date',
  offlinePhotos: 'id, rabbitId, status'
});

// Version 8: Public ARBA-Compliant Marketplace listings local tracking
db.version(8).stores({
  adminBreeders: 'id, email, username, role, parentalConsentVerified, consentToken, coachAuthorized',
  conflicts: 'id, recordId, tbl, fieldName',
  rabbits: 'id, breederId, breed, variety, status, sex, dob, tattooNumber, sireId, damId, species, [breederId+status], [breederId+sex], [breederId+status+sex]',
  breedings: 'id, breederId, buckId, doeId, breedDate, status',
  litters: 'id, breederId, breedingId, kindleDate',
  ledger: 'id, breederId, rabbitId, date',
  shows: 'id, breederId, date',
  showEntries: 'id, breederId, showId, rabbitId',
  chores: 'id, breederId, dueDate',
  transfers: 'id, breederId, rabbitId, date',
  signatures: 'id, breederId',
  medical: 'id, breederId, rabbitId, date',
  weights: 'id, breederId, rabbitId, date, [rabbitId+date]',
  syncQueue: 'id, breederId, timestamp',
  approvals: 'id, breederId, timestamp',
  youthProgress: 'id, memberName, ageGroup, currentLevel, xp, streak, lastActiveDate, coachId',
  youthQuizLogs: 'id, progressId, quizType, score, passed, date, coachFeedback',
  subscriptions: 'id, breederId, tier, status, currentPeriodEnd, trialEnd',
  invoices: 'id, breederId, stripeInvoiceId, status',
  evansVerifications: 'id, breederId, status',
  photoThumbnails: 'id, rabbitId, date',
  offlinePhotos: 'id, rabbitId, status',
  marketplaceListings: 'id, rabbitId, breederId, category, status'
});

// Version 9: Public Social Sharing Feed and Clocks Tracking
db.version(9).stores({
  adminBreeders: 'id, email, username, role, parentalConsentVerified, consentToken, coachAuthorized, userRestriction, vectorClock',
  conflicts: 'id, recordId, tbl, fieldName, resolved',
  rabbits: 'id, breederId, breed, variety, status, sex, dob, tattooNumber, sireId, damId, species, [breederId+status], [breederId+sex], [breederId+status+sex], vectorClock',
  breedings: 'id, breederId, buckId, doeId, breedDate, status, vectorClock',
  litters: 'id, breederId, breedingId, kindleDate, vectorClock',
  ledger: 'id, breederId, rabbitId, date, vectorClock',
  shows: 'id, breederId, date, vectorClock',
  showEntries: 'id, breederId, showId, rabbitId, vectorClock',
  chores: 'id, breederId, dueDate, vectorClock',
  transfers: 'id, breederId, rabbitId, date, vectorClock',
  signatures: 'id, breederId, vectorClock',
  medical: 'id, breederId, rabbitId, date, vectorClock',
  weights: 'id, breederId, rabbitId, date, [rabbitId+date], vectorClock',
  syncQueue: '++id, recordId, tbl, timestamp, action',
  approvals: 'id, breederId, timestamp',
  youthProgress: 'id, memberName, ageGroup, currentLevel, xp, streak, lastActiveDate, coachId',
  youthQuizLogs: 'id, progressId, quizType, score, passed, date, coachFeedback',
  subscriptions: 'id, breederId, tier, status, currentPeriodEnd, trialEnd',
  invoices: 'id, breederId, stripeInvoiceId, status',
  evansVerifications: 'id, breederId, status',
  photoThumbnails: 'id, rabbitId, date',
  offlinePhotos: 'id, rabbitId, status',
  marketplaceListings: 'id, rabbitId, breederId, category, status',
  socialPosts: 'id, breederId, title, status, timestamp, parentApproved, aiFlagged',
  socialComments: 'id, postId, breederId, timestamp, parentApproved, aiFlagged'
});

let migrationPromise = null;


export async function performMigrationAndLoad() {
  if (migrationPromise) {
    return migrationPromise;
  }

  migrationPromise = (async () => {
    const isMigrated = localStorage.getItem('rp_migrated_to_dexie_v9');
    
    const migrateOrLoadTable = async (localStorageKey, dexieTable, defaultList = []) => {
      if (isMigrated) {
        const count = await dexieTable.count();
        if (count > 0) {
          return await dexieTable.toArray();
        }
      }
      
      const saved = localStorage.getItem(localStorageKey);
      let list = defaultList;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed;
          }
        } catch (e) {
          console.error(`Error parsing localStorage key ${localStorageKey}:`, e);
        }
      }
      
      await dexieTable.clear();
      if (list.length > 0) {
        await dexieTable.bulkAdd(list);
      }
      return list;
    };

    // Run all migrations/loaders
    const adminBreeders = await migrateOrLoadTable('rp_admin_breeders', db.adminBreeders, DEFAULT_BREEDERS);
    const rabbits = await migrateOrLoadTable('rp_rabbits', db.rabbits, DEFAULT_RABBITS);
    const breedings = await migrateOrLoadTable('rp_breedings', db.breedings, DEFAULT_BREEDINGS);
    const litters = await migrateOrLoadTable('rp_litters', db.litters, DEFAULT_LITTERS);
    const ledger = await migrateOrLoadTable('rp_ledger', db.ledger, DEFAULT_LEDGER);
    const shows = await migrateOrLoadTable('rp_shows', db.shows, DEFAULT_SHOWS);
    const showEntries = await migrateOrLoadTable('rp_show_entries', db.showEntries, DEFAULT_SHOW_ENTRIES);
    const chores = await migrateOrLoadTable('rp_chores', db.chores, DEFAULT_CHORES);
    const transfers = await migrateOrLoadTable('rp_transfers', db.transfers, DEFAULT_TRANSFERS);
    
    const signatures = await migrateOrLoadTable('rp_signatures', db.signatures, DEFAULT_SIGNATURES);
    const medical = await migrateOrLoadTable('rp_medical', db.medical, DEFAULT_MEDICAL);
    const weights = await migrateOrLoadTable('rp_weights', db.weights, DEFAULT_WEIGHTS);
    const syncQueue = await migrateOrLoadTable('rp_sync_queue', db.syncQueue, []);
    const approvals = await migrateOrLoadTable('rp_approvals', db.approvals, []);
    const youthProgress = await migrateOrLoadTable('rp_youth_progress', db.youthProgress, DEFAULT_YOUTH_PROGRESS);
    const youthQuizLogs = await migrateOrLoadTable('rp_youth_quiz_logs', db.youthQuizLogs, []);

    // Seed defaults for Subscriptions
    const subscriptions = await migrateOrLoadTable('rp_subscriptions', db.subscriptions, []);
    const invoices = await migrateOrLoadTable('rp_invoices', db.invoices, []);
    const evansVerifications = await migrateOrLoadTable('rp_evans_verifications', db.evansVerifications, []);
    const conflicts = await migrateOrLoadTable('rp_conflicts', db.conflicts, []);
    const photoThumbnails = await migrateOrLoadTable('rp_photo_thumbnails', db.photoThumbnails, []);
    const offlinePhotos = await migrateOrLoadTable('rp_offline_photos', db.offlinePhotos, []);
    const marketplaceListings = await migrateOrLoadTable('rp_marketplace_listings', db.marketplaceListings, []);
    const socialPosts = await migrateOrLoadTable('rp_social_posts', db.socialPosts, []);
    const socialComments = await migrateOrLoadTable('rp_social_comments', db.socialComments, []);

    // Mark migration as done
    if (!isMigrated) {
      localStorage.setItem('rp_migrated_to_dexie_v9', 'true');
    }

    return {
      adminBreeders,
      rabbits,
      breedings,
      litters,
      ledger,
      shows,
      showEntries,
      chores,
      transfers,
      signatures,
      medical,
      weights,
      syncQueue,
      approvals,
      youthProgress,
      youthQuizLogs,
      subscriptions,
      invoices,
      evansVerifications,
      conflicts,
      photoThumbnails,
      offlinePhotos,
      marketplaceListings,
      socialPosts,
      socialComments
    };
  })().catch(async (err) => {
    console.warn("Database error detected during load. Executing automatic silent self-healing...", err);
    migrationPromise = null;
    try {
      // Delete old/corrupted database and reset migration flag
      localStorage.removeItem('rp_migrated_to_dexie_v9');
      await db.delete();
      await db.open();
      
      // Re-initialize tables with default datasets
      await db.adminBreeders.bulkAdd(DEFAULT_BREEDERS);
      await db.rabbits.bulkAdd(DEFAULT_RABBITS);
      await db.breedings.bulkAdd(DEFAULT_BREEDINGS);
      await db.litters.bulkAdd(DEFAULT_LITTERS);
      await db.ledger.bulkAdd(DEFAULT_LEDGER);
      await db.shows.bulkAdd(DEFAULT_SHOWS);
      await db.chores.bulkAdd(DEFAULT_CHORES);
      await db.medical.bulkAdd(DEFAULT_MEDICAL);
      await db.weights.bulkAdd(DEFAULT_WEIGHTS);

      localStorage.setItem('rp_migrated_to_dexie_v9', 'true');

      return {
        adminBreeders: DEFAULT_BREEDERS,
        rabbits: DEFAULT_RABBITS,
        breedings: DEFAULT_BREEDINGS,
        litters: DEFAULT_LITTERS,
        ledger: DEFAULT_LEDGER,
        shows: DEFAULT_SHOWS,
        showEntries: [],
        chores: DEFAULT_CHORES,
        transfers: DEFAULT_TRANSFERS,
        signatures: DEFAULT_SIGNATURES,
        medical: DEFAULT_MEDICAL,
        weights: DEFAULT_WEIGHTS,
        syncQueue: [],
        approvals: [],
        youthProgress: [],
        youthQuizLogs: [],
        subscriptions: [],
        invoices: [],
        evansVerifications: [],
        conflicts: [],
        photoThumbnails: [],
        offlinePhotos: [],
        marketplaceListings: [],
        socialPosts: [],
        socialComments: []
      };
    } catch (selfHealErr) {
      console.error("Self-healing recovery failed:", selfHealErr);
      return {
        adminBreeders: DEFAULT_BREEDERS,
        rabbits: DEFAULT_RABBITS,
        breedings: DEFAULT_BREEDINGS,
        litters: DEFAULT_LITTERS,
        ledger: DEFAULT_LEDGER,
        shows: DEFAULT_SHOWS,
        showEntries: [], chores: [], transfers: [], signatures: [], medical: [], weights: [], syncQueue: []
      };
    }
  });

  return migrationPromise;
}
