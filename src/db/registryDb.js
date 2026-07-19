import Dexie from 'dexie';
import {
  DEFAULT_BREEDERS, DEFAULT_RABBITS, DEFAULT_BREEDINGS, DEFAULT_LITTERS,
  DEFAULT_LEDGER, DEFAULT_SHOWS, DEFAULT_CHORES, DEFAULT_TRANSFERS,
  DEFAULT_SIGNATURES, DEFAULT_MEDICAL, DEFAULT_WEIGHTS
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
  adminBreeders: 'id, email, username, role, parentalConsentVerified, consentToken, coachAuthorized, vectorClock',
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
  socialPosts: 'id, breederId, title, status, timestamp, parentApproved'
});

let migrationPromise = null;

function generateScaleData() {
  const breeds = ['Holland Lop', 'Mini Rex', 'Netherland Dwarf', 'New Zealand'];
  const varieties = {
    'Holland Lop': ['Blue', 'Broken Blue', 'Opal', 'Tortoise'],
    'Mini Rex': ['Castor', 'Black', 'Opal', 'Broken Castor'],
    'Netherland Dwarf': ['Black', 'Sable Point', 'Blue Eyed White', 'Chestnut'],
    'New Zealand': ['White', 'Red', 'Black', 'Blue']
  };

  const rabbits = [...DEFAULT_RABBITS];
  const breedings = [...DEFAULT_BREEDINGS];
  const litters = [...DEFAULT_LITTERS];
  const ledger = [...DEFAULT_LEDGER];
  const chores = [...DEFAULT_CHORES];

  const medical = DEFAULT_MEDICAL.map(m => {
    const r = DEFAULT_RABBITS.find(rx => rx.id === m.rabbitId);
    return { ...m, breederId: r ? r.breederId : 'ab-1' };
  });
  const weights = DEFAULT_WEIGHTS.map(w => {
    const r = DEFAULT_RABBITS.find(rx => rx.id === w.rabbitId);
    return { ...w, breederId: r ? r.breederId : 'ab-1' };
  });
  const signatures = DEFAULT_SIGNATURES.map(s => {
    const t = DEFAULT_TRANSFERS.find(tx => tx.id === s.transferId);
    return { ...s, breederId: t ? t.breederId : 'ab-1' };
  });

  const breeders = ['ab-1', 'ab-admin', 'ab-2'];

  let rabbitCounter = rabbits.length + 1;
  let breedingCounter = breedings.length + 1;
  let litterCounter = litters.length + 1;
  let ledgerCounter = ledger.length + 1;
  let medicalCounter = medical.length + 1;
  let weightCounter = weights.length + 1;
  let choreCounter = chores.length + 1;

  for (const breederId of breeders) {
    for (const breed of breeds) {
      const vars = varieties[breed];
      
      // Generation 1: 4 founders (2 bucks, 2 does)
      const founders = [];
      for (let i = 0; i < 4; i++) {
        const sex = i % 2 === 0 ? 'buck' : 'doe';
        const variety = vars[i % vars.length];
        const id = `r-gen-${rabbitCounter++}`;
        const name = `${breed} Founder ${sex === 'buck' ? 'Sire' : 'Dam'} ${rabbitCounter}`;
        const tattoo = `${breed.substring(0,2).toUpperCase()}${rabbitCounter}`;
        
        const rabbit = {
          id,
          breederId,
          tattooNumber: tattoo,
          name,
          breed,
          variety,
          sex,
          dob: '2024-01-10',
          weightOz: breed === 'New Zealand' ? 144 : breed === 'Netherland Dwarf' ? 36 : 60,
          status: 'active',
          sireId: '',
          damId: '',
          inbreedingCoeff: 0.0,
          registrationNumber: `REG-${10000 + rabbitCounter}`,
          gcNumber: i === 0 ? `GC-${20000 + rabbitCounter}` : '',
          location: `Hutch-${rabbitCounter}`,
          notes: 'Foundation stock.',
          photos: ['/assets/holland_lop.png'],
          legs: i === 0 ? [{ id: `leg-${rabbitCounter}`, date: '2025-05-15', showName: 'State Fair', judge: 'Dr. A. Smith', award: 'Best of Breed', classSize: 20 }] : []
        };
        rabbits.push(rabbit);
        founders.push(rabbit);

        weights.push({
          id: `w-gen-${weightCounter++}`,
          breederId,
          rabbitId: id,
          weightOz: rabbit.weightOz,
          date: '2024-08-10',
          notes: 'Maturity check'
        });
      }

      const founderBucks = founders.filter(f => f.sex === 'buck');
      const founderDoes = founders.filter(f => f.sex === 'doe');

      // Generation 2: Offspring (2 pairings, each producing 3 offspring)
      const gen2Rabbits = [];
      for (let b = 0; b < 2; b++) {
        const buck = founderBucks[b];
        const doe = founderDoes[b];
        const breedDate = '2024-09-01';
        const kindleDate = '2024-10-02';
        
        const breedingId = `b-gen-${breedingCounter++}`;
        breedings.push({
          id: breedingId,
          breederId,
          buckId: buck.id,
          doeId: doe.id,
          breedDate,
          status: 'kindled',
          notes: 'Foundation pairing.'
        });

        const litterId = `l-gen-${litterCounter++}`;
        litters.push({
          id: litterId,
          breederId,
          breedingId,
          kindleDate,
          bornAlive: 5,
          bornDead: 0,
          weanedCount: 4,
          notes: 'Vigorous litter.'
        });

        for (let o = 0; o < 3; o++) {
          const id = `r-gen-${rabbitCounter++}`;
          const sex = o % 2 === 0 ? 'buck' : 'doe';
          const variety = doe.variety;
          const tattoo = `${buck.tattooNumber}-F1-${o}`;
          
          const rabbit = {
            id,
            breederId,
            tattooNumber: tattoo,
            name: `${breed} Gen-2 ${sex === 'buck' ? 'Buck' : 'Doe'} ${rabbitCounter}`,
            breed,
            variety,
            sex,
            dob: kindleDate,
            weightOz: breed === 'New Zealand' ? 140 : breed === 'Netherland Dwarf' ? 34 : 58,
            status: 'active',
            sireId: buck.id,
            damId: doe.id,
            inbreedingCoeff: 0.0,
            registrationNumber: '',
            gcNumber: '',
            location: `Hutch-${rabbitCounter}`,
            notes: 'F1 generation offspring.',
            photos: ['/assets/holland_lop.png'],
            legs: []
          };
          rabbits.push(rabbit);
          gen2Rabbits.push(rabbit);

          const baseWeight = breed === 'New Zealand' ? 140 : breed === 'Netherland Dwarf' ? 34 : 58;
          for (let w = 0; w < 4; w++) {
            const ageMonths = w + 1;
            const logDate = new Date(new Date(kindleDate).getTime() + ageMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            weights.push({
              id: `w-gen-${weightCounter++}`,
              breederId,
              rabbitId: id,
              weightOz: Math.round(baseWeight * (ageMonths / 6)),
              date: logDate,
              notes: `Growth log month ${ageMonths}`
            });
          }

          if (o === 0) {
            medical.push({
              id: `m-gen-${medicalCounter++}`,
              breederId,
              rabbitId: id,
              date: '2025-01-15',
              treatment: 'Deworming',
              cost: 5.0,
              notes: 'Routine checkup.'
            });
            ledger.push({
              id: `ld-gen-${ledgerCounter++}`,
              breederId,
              rabbitId: id,
              date: '2025-01-15',
              type: 'expense',
              category: 'vet',
              amount: 5.0,
              notes: 'Dewormer cost'
            });
          }
        }
      }

      // Generation 3: Offspring from Generation 2 (2 pairings, each producing 3 offspring)
      const gen2Bucks = gen2Rabbits.filter(r => r.sex === 'buck');
      const gen2Does = gen2Rabbits.filter(r => r.sex === 'doe');
      
      for (let b = 0; b < Math.min(gen2Bucks.length, gen2Does.length); b++) {
        const buck = gen2Bucks[b];
        const doe = gen2Does[b];
        const breedDate = '2025-06-01';
        const kindleDate = '2025-07-02';

        const breedingId = `b-gen-${breedingCounter++}`;
        breedings.push({
          id: breedingId,
          breederId,
          buckId: buck.id,
          doeId: doe.id,
          breedDate,
          status: 'kindled',
          notes: 'Generation 2 pairing.'
        });

        const litterId = `l-gen-${litterCounter++}`;
        litters.push({
          id: litterId,
          breederId,
          breedingId,
          kindleDate,
          bornAlive: 4,
          bornDead: 1,
          weanedCount: 3,
          notes: 'Standard hutch litter.'
        });

        for (let o = 0; o < 3; o++) {
          const id = `r-gen-${rabbitCounter++}`;
          const sex = o % 2 === 0 ? 'buck' : 'doe';
          const variety = buck.variety;
          const tattoo = `${buck.tattooNumber}-F2-${o}`;

          const rabbit = {
            id,
            breederId,
            tattooNumber: tattoo,
            name: `${breed} Gen-3 ${sex === 'buck' ? 'Buck' : 'Doe'} ${rabbitCounter}`,
            breed,
            variety,
            sex,
            dob: kindleDate,
            weightOz: breed === 'New Zealand' ? 142 : breed === 'Netherland Dwarf' ? 35 : 59,
            status: 'active',
            sireId: buck.id,
            damId: doe.id,
            inbreedingCoeff: 0.125,
            registrationNumber: '',
            gcNumber: '',
            location: `Hutch-${rabbitCounter}`,
            notes: 'F2 generation pedigree kit.',
            photos: ['/assets/holland_lop.png'],
            legs: []
          };
          rabbits.push(rabbit);

          weights.push({
            id: `w-gen-${weightCounter++}`,
            breederId,
            rabbitId: id,
            weightOz: rabbit.weightOz,
            date: '2026-02-15',
            notes: 'Weaned growth check'
          });
        }
      }
    }

    // Add some random financial transactions for each breeder to make financial dashboard alive
    for (let f = 0; f < 10; f++) {
      ledger.push({
        id: `ld-gen-${ledgerCounter++}`,
        breederId,
        date: `2026-0${1 + (f % 5)}-10`,
        type: f % 3 === 0 ? 'expense' : 'income',
        category: f % 3 === 0 ? 'feed' : 'sale',
        amount: f % 3 === 0 ? 45.00 : 120.00,
        notes: f % 3 === 0 ? 'Bulk feed bags purchase' : 'Sold show junior kits'
      });
    }

    chores.push(
      { id: `c-gen-${choreCounter++}`, breederId, title: 'Clean A-Block cages', dueDate: '2026-07-20', status: 'pending', notes: 'Sanitize pans and water bottles' },
      { id: `c-gen-${choreCounter++}`, breederId, title: 'Weigh Gen-3 juniors', dueDate: '2026-07-22', status: 'pending', notes: 'Log 8 weeks weight check' },
      { id: `c-gen-${choreCounter++}`, breederId, title: 'Nestbox check - Hutch 12', dueDate: '2026-07-25', status: 'pending', notes: 'Expected kindle date tomorrow' }
    );
  }

  return { rabbits, breedings, litters, ledger, chores, signatures, medical, weights };
}

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

    // Generate scale data programmatically to reach 200+ rabbits and histories
    const scaleData = generateScaleData();

    // Run all migrations/loaders
    const adminBreeders = await migrateOrLoadTable('rp_admin_breeders', db.adminBreeders, DEFAULT_BREEDERS);
    const rabbits = await migrateOrLoadTable('rp_rabbits', db.rabbits, scaleData.rabbits);
    const breedings = await migrateOrLoadTable('rp_breedings', db.breedings, scaleData.breedings);
    const litters = await migrateOrLoadTable('rp_litters', db.litters, scaleData.litters);
    const ledger = await migrateOrLoadTable('rp_ledger', db.ledger, scaleData.ledger);
    const shows = await migrateOrLoadTable('rp_shows', db.shows, DEFAULT_SHOWS);
    const showEntries = await migrateOrLoadTable('rp_show_entries', db.showEntries, []);
    const chores = await migrateOrLoadTable('rp_chores', db.chores, scaleData.chores);
    const transfers = await migrateOrLoadTable('rp_transfers', db.transfers, DEFAULT_TRANSFERS);
    
    const signatures = await migrateOrLoadTable('rp_signatures', db.signatures, scaleData.signatures);
    const medical = await migrateOrLoadTable('rp_medical', db.medical, scaleData.medical);
    const weights = await migrateOrLoadTable('rp_weights', db.weights, scaleData.weights);
    const syncQueue = await migrateOrLoadTable('rp_sync_queue', db.syncQueue, []);
    const approvals = await migrateOrLoadTable('rp_approvals', db.approvals, []);
    const youthProgress = await migrateOrLoadTable('rp_youth_progress', db.youthProgress, []);
    const youthQuizLogs = await migrateOrLoadTable('rp_youth_quiz_logs', db.youthQuizLogs, []);

    // Seed defaults for Subscriptions
    const defaultSubs = [
      { id: 'sub-seed-1', breederId: 'ab-1', tier: 'pro', status: 'active', stripeCustomerId: 'cus_seed1', stripeSubscriptionId: 'sub_seed1', currentPeriodEnd: '2028-12-31', trialEnd: null, cancelledAt: null, evansVerified: false, evansRedemptionDate: null, createdAt: new Date().toISOString() },
      { id: 'sub-seed-2', breederId: 'ab-owner-1', tier: 'pro', status: 'active', stripeCustomerId: 'cus_seed2', stripeSubscriptionId: 'sub_seed2', currentPeriodEnd: '2028-12-31', trialEnd: null, cancelledAt: null, evansVerified: false, evansRedemptionDate: null, createdAt: new Date().toISOString() },
      { id: 'sub-seed-3', breederId: 'ab-youth-2', tier: 'free', status: 'active', stripeCustomerId: 'cus_seed3', stripeSubscriptionId: 'sub_seed3', currentPeriodEnd: '2028-12-31', trialEnd: null, cancelledAt: null, evansVerified: false, evansRedemptionDate: null, createdAt: new Date().toISOString() }
    ];
    const subscriptions = await migrateOrLoadTable('rp_subscriptions', db.subscriptions, defaultSubs);
    const invoices = await migrateOrLoadTable('rp_invoices', db.invoices, []);
    const evansVerifications = await migrateOrLoadTable('rp_evans_verifications', db.evansVerifications, []);
    const conflicts = await migrateOrLoadTable('rp_conflicts', db.conflicts, []);
    const photoThumbnails = await migrateOrLoadTable('rp_photo_thumbnails', db.photoThumbnails, []);
    const offlinePhotos = await migrateOrLoadTable('rp_offline_photos', db.offlinePhotos, []);
    const marketplaceListings = await migrateOrLoadTable('rp_marketplace_listings', db.marketplaceListings, []);
    const socialPosts = await migrateOrLoadTable('rp_social_posts', db.socialPosts, []);

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
      socialPosts
    };
  })().catch(err => {
    migrationPromise = null;
    throw err;
  });

  return migrationPromise;
}
