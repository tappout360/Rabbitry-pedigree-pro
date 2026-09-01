// POST /api/seed — Seeds rich, realistic sample production data into MongoDB Atlas
// Supports rapid onboarding and initial demo loading.
import { getDb } from './_lib/mongodb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const db = await getDb();
    const breederId = req.body?.breederId || 'ab-demo-1';

    // 1. Breeders collection seed
    const breedersCol = db.collection('adminBreeders');
    const demoBreeders = [
      {
        _localId: 'ab-demo-1',
        _breederId: 'ab-demo-1',
        email: 'demo@rabbitrypedigree.pro',
        name: 'Demo Breeder (Grandview Barn)',
        rabbitryName: 'Grandview Pedigree Barn',
        phone: '555-0100',
        role: 'owner',
        isDemo: true,
        isYouth: false,
        status: 'active',
        subscriptionTier: 'pro',
        arbaMemberNumber: 'ARBA-554123',
        state: 'OH',
        zip: '43015',
        _lastModified: new Date()
      },
      {
        _localId: 'ab-youth-1',
        _breederId: 'ab-youth-1',
        email: 'junior.showman@4h.org',
        name: 'Alex Rivera (4-H Youth)',
        rabbitryName: 'Sunny Valley 4-H Hutch',
        phone: '555-0122',
        role: 'owner',
        isYouth: true,
        birthdate: '2014-06-15', // 12 years old -> Intermediate
        arbaDivision: 'Intermediate (Ages 12-14)',
        status: 'active',
        subscriptionTier: 'family',
        arbaMemberNumber: 'YOUTH-4H-88',
        parentalConsentVerified: true,
        state: 'OH',
        zip: '43015',
        _lastModified: new Date()
      },
      {
        _localId: 'ab-youth-2',
        _breederId: 'ab-youth-2',
        email: 'sammy.clover@4h.org',
        name: 'Sammy Clover (4-H Junior)',
        rabbitryName: 'Lucky Clover Bunnies',
        phone: '555-0133',
        role: 'owner',
        isYouth: true,
        birthdate: '2017-09-20', // 9 years old -> Junior
        arbaDivision: 'Junior (Ages 5-11)',
        status: 'active',
        subscriptionTier: 'free',
        parentalConsentVerified: true,
        state: 'IN',
        zip: '46001',
        _lastModified: new Date()
      }
    ];

    for (const b of demoBreeders) {
      await breedersCol.updateOne(
        { _localId: b._localId },
        { $set: b },
        { upsert: true }
      );
    }

    // 2. Rabbits Collection (20+ rabbits with 3-generation pedigrees)
    const rabbitsCol = db.collection('rabbits');

    const breeds = ['Holland Lop', 'Mini Rex', 'Netherland Dwarf', 'New Zealand'];
    const sampleRabbits = [
      // Holland Lop Founders & Descendants
      {
        _localId: 'r-hl-1',
        _breederId: breederId,
        tattooNumber: 'HL-SIRE1',
        name: 'Grandview\'s Thunder King',
        breed: 'Holland Lop',
        variety: 'Broken Blue',
        sex: 'buck',
        dob: '2023-04-10',
        weightOz: 64,
        status: 'active',
        species: 'rabbit',
        sireId: '',
        damId: '',
        registrationNumber: 'REG-HL-901',
        gcNumber: 'GC-9942',
        location: 'Hutch A-01',
        notes: 'Grand Champion sire. Supreme crown & thick bone.',
        legs: [
          { id: 'leg-1', date: '2024-05-10', showName: 'Ohio State ARBA Convention', judge: 'Dr. John Miller', award: 'Best of Breed (BOB)', classSize: 42 },
          { id: 'leg-2', date: '2024-09-15', showName: 'Midwest Regional Show', judge: 'Sarah Jenkins', award: 'Best in Show (BIS)', classSize: 110 }
        ],
        _lastModified: new Date()
      },
      {
        _localId: 'r-hl-2',
        _breederId: breederId,
        tattooNumber: 'HL-DAM1',
        name: 'Grandview\'s Velvet Queen',
        breed: 'Holland Lop',
        variety: 'Tortoise',
        sex: 'doe',
        dob: '2023-05-12',
        weightOz: 62,
        status: 'active',
        species: 'rabbit',
        sireId: '',
        damId: '',
        registrationNumber: 'REG-HL-902',
        gcNumber: 'GC-9943',
        location: 'Hutch A-02',
        notes: 'Proven dam with excellent maternal traits.',
        legs: [
          { id: 'leg-3', date: '2024-06-20', showName: 'Buckeye Classic', judge: 'Tom Evans', award: 'Best Opposite Sex (BOS)', classSize: 35 }
        ],
        _lastModified: new Date()
      },
      {
        _localId: 'r-hl-3',
        _breederId: breederId,
        tattooNumber: 'HL-F1-01',
        name: 'Grandview\'s Blue Lightning',
        breed: 'Holland Lop',
        variety: 'Solid Blue',
        sex: 'buck',
        dob: '2024-03-15',
        weightOz: 60,
        status: 'active',
        species: 'rabbit',
        sireId: 'r-hl-1',
        damId: 'r-hl-2',
        registrationNumber: 'REG-HL-1001',
        gcNumber: '',
        location: 'Hutch A-03',
        notes: 'F1 generation junior champion contender.',
        legs: [],
        _lastModified: new Date()
      },
      {
        _localId: 'r-hl-4',
        _breederId: breederId,
        tattooNumber: 'HL-F1-02',
        name: 'Grandview\'s Opal Star',
        breed: 'Holland Lop',
        variety: 'Opal',
        sex: 'doe',
        dob: '2024-03-15',
        weightOz: 58,
        status: 'active',
        species: 'rabbit',
        sireId: 'r-hl-1',
        damId: 'r-hl-2',
        registrationNumber: 'REG-HL-1002',
        gcNumber: '',
        location: 'Hutch A-04',
        notes: 'F1 doe kit with dense coat.',
        legs: [],
        _lastModified: new Date()
      },

      // Mini Rex Founders & Lineage
      {
        _localId: 'r-mr-1',
        _breederId: breederId,
        tattooNumber: 'MR-ROYAL',
        name: 'Clover Barn\'s Velvet Prince',
        breed: 'Mini Rex',
        variety: 'Castor',
        sex: 'buck',
        dob: '2023-02-18',
        weightOz: 68,
        status: 'active',
        species: 'rabbit',
        sireId: '',
        damId: '',
        registrationNumber: 'REG-MR-801',
        gcNumber: 'GC-8812',
        location: 'Hutch B-01',
        notes: 'Plush velvet fur depth (5/8 inch). Ideal head & ear set.',
        legs: [
          { id: 'leg-4', date: '2024-04-12', showName: 'National Mini Rex Show', judge: 'Alan Stevens', award: 'Best Variety (BOV)', classSize: 64 }
        ],
        _lastModified: new Date()
      },
      {
        _localId: 'r-mr-2',
        _breederId: breederId,
        tattooNumber: 'MR-RUBY',
        name: 'Clover Barn\'s Ruby Charm',
        breed: 'Mini Rex',
        variety: 'Broken Castor',
        sex: 'doe',
        dob: '2023-03-22',
        weightOz: 70,
        status: 'active',
        species: 'rabbit',
        sireId: '',
        damId: '',
        registrationNumber: 'REG-MR-802',
        gcNumber: '',
        location: 'Hutch B-02',
        notes: 'Excellent body density & fur texture.',
        legs: [],
        _lastModified: new Date()
      },
      {
        _localId: 'r-mr-3',
        _breederId: breederId,
        tattooNumber: 'MR-F1-10',
        name: 'Grandview\'s Shadow Rex',
        breed: 'Mini Rex',
        variety: 'Black',
        sex: 'buck',
        dob: '2024-05-01',
        weightOz: 64,
        status: 'active',
        species: 'rabbit',
        sireId: 'r-mr-1',
        damId: 'r-mr-2',
        registrationNumber: '',
        gcNumber: '',
        location: 'Hutch B-03',
        notes: 'Jet black plush fur.',
        legs: [],
        _lastModified: new Date()
      },

      // Netherland Dwarf Founders & Offspring
      {
        _localId: 'r-nd-1',
        _breederId: breederId,
        tattooNumber: 'ND-TITAN',
        name: 'Excalibur\'s Little Titan',
        breed: 'Netherland Dwarf',
        variety: 'Sable Point',
        sex: 'buck',
        dob: '2023-01-14',
        weightOz: 36,
        status: 'active',
        species: 'rabbit',
        sireId: '',
        damId: '',
        registrationNumber: 'REG-ND-701',
        gcNumber: 'GC-7701',
        location: 'Hutch C-01',
        notes: 'Compact 4-group dwarf. Short ears (2 inches).',
        legs: [
          { id: 'leg-5', date: '2024-03-10', showName: 'Dwarf Specialty Show', judge: 'Robert Vance', award: 'Best of Breed (BOB)', classSize: 50 }
        ],
        _lastModified: new Date()
      },
      {
        _localId: 'r-nd-2',
        _breederId: breederId,
        tattooNumber: 'ND-PIXIE',
        name: 'Excalibur\'s Pixie Dust',
        breed: 'Netherland Dwarf',
        variety: 'Blue Eyed White',
        sex: 'doe',
        dob: '2023-02-19',
        weightOz: 34,
        status: 'active',
        species: 'rabbit',
        sireId: '',
        damId: '',
        registrationNumber: 'REG-ND-702',
        gcNumber: '',
        location: 'Hutch C-02',
        notes: 'Stunning ice blue eyes. True dwarf gene carrier.',
        legs: [],
        _lastModified: new Date()
      },
      {
        _localId: 'r-nd-3',
        _breederId: breederId,
        tattooNumber: 'ND-F1-01',
        name: 'Grandview\'s Frosty Dwarf',
        breed: 'Netherland Dwarf',
        variety: 'Blue Eyed White',
        sex: 'doe',
        dob: '2024-04-10',
        weightOz: 32,
        status: 'active',
        species: 'rabbit',
        sireId: 'r-nd-1',
        damId: 'r-nd-2',
        registrationNumber: '',
        gcNumber: '',
        location: 'Hutch C-03',
        notes: 'Junior doe contender for 4-H showmanship.',
        legs: [],
        _lastModified: new Date()
      },

      // New Zealand Commercial Meat Stock
      {
        _localId: 'r-nz-1',
        _breederId: breederId,
        tattooNumber: 'NZ-WHITE1',
        name: 'Commercial NZ White Sire #1',
        breed: 'New Zealand',
        variety: 'White',
        sex: 'buck',
        dob: '2023-01-05',
        weightOz: 176, // 11 lbs
        status: 'active',
        species: 'rabbit',
        sireId: '',
        damId: '',
        registrationNumber: 'REG-NZ-501',
        gcNumber: 'GC-5501',
        location: 'Commercial Barn 1',
        notes: 'Prime commercial meat sire. FCR 2.8:1',
        legs: [],
        _lastModified: new Date()
      },
      {
        _localId: 'r-nz-2',
        _breederId: breederId,
        tattooNumber: 'NZ-WHITE2',
        name: 'Commercial NZ White Doe #1',
        breed: 'New Zealand',
        variety: 'White',
        sex: 'doe',
        dob: '2023-01-10',
        weightOz: 184, // 11.5 lbs
        status: 'active',
        species: 'rabbit',
        sireId: '',
        damId: '',
        registrationNumber: 'REG-NZ-502',
        gcNumber: '',
        location: 'Commercial Barn 2',
        notes: 'Average 9.2 kits per litter. High milk yield.',
        legs: [],
        _lastModified: new Date()
      },
      {
        _localId: 'r-nz-3',
        _breederId: breederId,
        tattooNumber: 'NZ-FRYER-01',
        name: 'NZ Meat Fryer Kit #1',
        breed: 'New Zealand',
        variety: 'White',
        sex: 'buck',
        dob: '2024-06-01',
        weightOz: 80, // 5 lbs at 10 weeks
        status: 'active',
        species: 'rabbit',
        sireId: 'r-nz-1',
        damId: 'r-nz-2',
        registrationNumber: '',
        gcNumber: '',
        location: 'Grow-Out Pen 4',
        notes: 'Target 5lb fryer weight reached at 70 days.',
        legs: [],
        _lastModified: new Date()
      }
    ];

    // Generate additional scale rabbits up to 20+
    for (let i = 4; i <= 12; i++) {
      const breed = breeds[i % breeds.length];
      const sex = i % 2 === 0 ? 'buck' : 'doe';
      sampleRabbits.push({
        _localId: `r-gen-${100 + i}`,
        _breederId: breederId,
        tattooNumber: `GEN-${100 + i}`,
        name: `Grandview ${breed} ${sex === 'buck' ? 'Buck' : 'Doe'} #${i}`,
        breed: breed,
        variety: breed === 'Holland Lop' ? 'Tortoise' : breed === 'Mini Rex' ? 'Castor' : breed === 'Netherland Dwarf' ? 'Chestnut' : 'White',
        sex: sex,
        dob: '2024-02-01',
        weightOz: breed === 'New Zealand' ? 160 : breed === 'Netherland Dwarf' ? 35 : 60,
        status: 'active',
        species: 'rabbit',
        sireId: breed === 'Holland Lop' ? 'r-hl-1' : breed === 'Mini Rex' ? 'r-mr-1' : 'r-nd-1',
        damId: breed === 'Holland Lop' ? 'r-hl-2' : breed === 'Mini Rex' ? 'r-mr-2' : 'r-nd-2',
        registrationNumber: '',
        gcNumber: '',
        location: `Hutch D-${i}`,
        notes: 'Pedigreed pedigree kit.',
        legs: [],
        _lastModified: new Date()
      });
    }

    for (const r of sampleRabbits) {
      await rabbitsCol.updateOne(
        { _localId: r._localId, _breederId: breederId },
        { $set: r },
        { upsert: true }
      );
    }

    // 3. Breedings collection seed
    const breedingsCol = db.collection('breedings');
    const sampleBreedings = [
      {
        _localId: 'b-01',
        _breederId: breederId,
        buckId: 'r-hl-1',
        doeId: 'r-hl-2',
        breedDate: '2024-02-12',
        kindleDate: '2024-03-15',
        status: 'kindled',
        notes: 'Produced 5 kits. All vigorous.',
        _lastModified: new Date()
      },
      {
        _localId: 'b-02',
        _breederId: breederId,
        buckId: 'r-mr-1',
        doeId: 'r-mr-2',
        breedDate: '2024-03-30',
        kindleDate: '2024-05-01',
        status: 'kindled',
        notes: '4 kits weaned successfully.',
        _lastModified: new Date()
      },
      {
        _localId: 'b-03',
        _breederId: breederId,
        buckId: 'r-nz-1',
        doeId: 'r-nz-2',
        breedDate: '2024-05-01',
        kindleDate: '2024-06-01',
        status: 'kindled',
        notes: 'Commercial meat litter. 9 born, 8 weaned.',
        _lastModified: new Date()
      }
    ];

    for (const b of sampleBreedings) {
      await breedingsCol.updateOne(
        { _localId: b._localId, _breederId: breederId },
        { $set: b },
        { upsert: true }
      );
    }

    // 4. Weight history seed
    const weightsCol = db.collection('weights');
    const sampleWeights = [
      { _localId: 'w-1', _breederId: breederId, rabbitId: 'r-hl-3', weightOz: 20, date: '2024-04-15', notes: '4 week check' },
      { _localId: 'w-2', _breederId: breederId, rabbitId: 'r-hl-3', weightOz: 38, date: '2024-05-15', notes: '8 week weaning' },
      { _localId: 'w-3', _breederId: breederId, rabbitId: 'r-hl-3', weightOz: 52, date: '2024-06-15', notes: 'Junior weight' },
      { _localId: 'w-4', _breederId: breederId, rabbitId: 'r-hl-3', weightOz: 60, date: '2024-07-15', notes: 'Senior weight' },
      { _localId: 'w-5', _breederId: breederId, rabbitId: 'r-nz-3', weightOz: 32, date: '2024-06-21', notes: '3 week check' },
      { _localId: 'w-6', _breederId: breederId, rabbitId: 'r-nz-3', weightOz: 80, date: '2024-08-08', notes: '10 week fryer weight target' }
    ];

    for (const w of sampleWeights) {
      await weightsCol.updateOne(
        { _localId: w._localId, _breederId: breederId },
        { $set: w },
        { upsert: true }
      );
    }

    // 5. Ledger seed
    const ledgerCol = db.collection('ledger');
    const sampleLedger = [
      { _localId: 'ld-1', _breederId: breederId, date: '2024-06-10', type: 'income', category: 'sale', amount: 150.00, notes: 'Sold 2 show junior Holland Lops' },
      { _localId: 'ld-2', _breederId: breederId, date: '2024-06-14', type: 'expense', category: 'feed', amount: 65.00, notes: 'Bulk pellet feed (200 lbs)' },
      { _localId: 'ld-3', _breederId: breederId, date: '2024-06-25', type: 'expense', category: 'vet', amount: 35.00, notes: 'Routine health checkup & deworming' },
      { _localId: 'ld-4', _breederId: breederId, date: '2024-07-02', type: 'income', category: 'show', amount: 80.00, notes: 'Show premiums & BOB cash prize' }
    ];

    for (const l of sampleLedger) {
      await ledgerCol.updateOne(
        { _localId: l._localId, _breederId: breederId },
        { $set: l },
        { upsert: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'MongoDB successfully seeded with rich sample production data!',
      counts: {
        breeders: demoBreeders.length,
        rabbits: sampleRabbits.length,
        breedings: sampleBreedings.length,
        weights: sampleWeights.length,
        ledger: sampleLedger.length
      }
    });

  } catch (err) {
    console.error('[/api/seed] Error:', err);
    return res.status(500).json({ error: 'Failed to seed MongoDB data.' });
  }
}
