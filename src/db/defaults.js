// defaults.js — Rich initial sample production dataset for ARBA & 4-H show breeders
// Provides 20+ realistic animals, 3-generation pedigrees, weights, health, and show records.

export const DEFAULT_BREEDERS = [
  {
    id: 'ab-admin',
    name: 'Jason Mounts',
    username: 'jmounts',
    email: 'jasonmounts77@yahoo.com',
    rabbitryName: 'Grandview Rabbitry & Cavy Barn',
    phone: '555-0199',
    role: 'owner',
    isSuperAdmin: true,
    status: 'active',
    subscriptionTier: 'pro',
    arbaMemberNumber: 'ARBA-984123',
    state: 'OH',
    zip: '43015'
  },
  {
    id: 'ab-youth-1',
    name: 'Alex Rivera (4-H Youth)',
    username: 'arivera',
    email: 'junior.showman@4h.org',
    rabbitryName: 'Sunny Valley 4-H Hutch',
    phone: '555-0122',
    role: 'owner',
    isYouth: true,
    birthdate: '2014-06-15',
    arbaDivision: 'Intermediate (Ages 12-14)',
    status: 'active',
    subscriptionTier: 'family',
    arbaMemberNumber: 'YOUTH-4H-88',
    parentalConsentVerified: true,
    state: 'OH',
    zip: '43015'
  }
];

export const DEFAULT_RABBITS = [
  // Holland Lop Lineage (3 Generations)
  {
    id: 'r-hl-1',
    breederId: 'ab-admin',
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
    ]
  },
  {
    id: 'r-hl-2',
    breederId: 'ab-admin',
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
    ]
  },
  {
    id: 'r-hl-3',
    breederId: 'ab-admin',
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
    legs: []
  },
  {
    id: 'r-hl-4',
    breederId: 'ab-admin',
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
    legs: []
  },

  // Mini Rex Lineage
  {
    id: 'r-mr-1',
    breederId: 'ab-admin',
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
    ]
  },
  {
    id: 'r-mr-2',
    breederId: 'ab-admin',
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
    legs: []
  },
  {
    id: 'r-mr-3',
    breederId: 'ab-admin',
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
    legs: []
  },

  // Netherland Dwarf Lineage
  {
    id: 'r-nd-1',
    breederId: 'ab-admin',
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
    ]
  },
  {
    id: 'r-nd-2',
    breederId: 'ab-admin',
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
    legs: []
  },
  {
    id: 'r-nd-3',
    breederId: 'ab-admin',
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
    legs: []
  },

  // New Zealand Commercial Meat Stock
  {
    id: 'r-nz-1',
    breederId: 'ab-admin',
    tattooNumber: 'NZ-WHITE1',
    name: 'Commercial NZ White Sire #1',
    breed: 'New Zealand',
    variety: 'White',
    sex: 'buck',
    dob: '2023-01-05',
    weightOz: 176,
    status: 'active',
    species: 'rabbit',
    sireId: '',
    damId: '',
    registrationNumber: 'REG-NZ-501',
    gcNumber: 'GC-5501',
    location: 'Commercial Barn 1',
    notes: 'Prime commercial meat sire. FCR 2.8:1',
    legs: []
  },
  {
    id: 'r-nz-2',
    breederId: 'ab-admin',
    tattooNumber: 'NZ-WHITE2',
    name: 'Commercial NZ White Doe #1',
    breed: 'New Zealand',
    variety: 'White',
    sex: 'doe',
    dob: '2023-01-10',
    weightOz: 184,
    status: 'active',
    species: 'rabbit',
    sireId: '',
    damId: '',
    registrationNumber: 'REG-NZ-502',
    gcNumber: '',
    location: 'Commercial Barn 2',
    notes: 'Average 9.2 kits per litter. High milk yield.',
    legs: []
  },
  {
    id: 'r-nz-3',
    breederId: 'ab-admin',
    tattooNumber: 'NZ-FRYER-01',
    name: 'NZ Meat Fryer Kit #1',
    breed: 'New Zealand',
    variety: 'White',
    sex: 'buck',
    dob: '2024-06-01',
    weightOz: 80,
    status: 'active',
    species: 'rabbit',
    sireId: 'r-nz-1',
    damId: 'r-nz-2',
    registrationNumber: '',
    gcNumber: '',
    location: 'Grow-Out Pen 4',
    notes: 'Target 5lb fryer weight reached at 70 days.',
    legs: []
  }
];

export const DEFAULT_BREEDINGS = [
  {
    id: 'b-01',
    breederId: 'ab-admin',
    buckId: 'r-hl-1',
    doeId: 'r-hl-2',
    breedDate: '2024-02-12',
    kindleDate: '2024-03-15',
    status: 'kindled',
    notes: 'Produced 5 kits. All vigorous.'
  },
  {
    id: 'b-02',
    breederId: 'ab-admin',
    buckId: 'r-mr-1',
    doeId: 'r-mr-2',
    breedDate: '2024-03-30',
    kindleDate: '2024-05-01',
    status: 'kindled',
    notes: '4 kits weaned successfully.'
  },
  {
    id: 'b-03',
    breederId: 'ab-admin',
    buckId: 'r-nz-1',
    doeId: 'r-nz-2',
    breedDate: '2024-05-01',
    kindleDate: '2024-06-01',
    status: 'kindled',
    notes: 'Commercial meat litter. 9 born, 8 weaned.'
  }
];

export const DEFAULT_LITTERS = [
  { id: 'l-01', breederId: 'ab-admin', breedingId: 'b-01', kindleDate: '2024-03-15', bornAlive: 5, bornDead: 0, weanedCount: 4, notes: 'Show prospect kits' },
  { id: 'l-02', breederId: 'ab-admin', breedingId: 'b-02', kindleDate: '2024-05-01', bornAlive: 4, bornDead: 0, weanedCount: 4, notes: 'Plush coat kits' },
  { id: 'l-03', breederId: 'ab-admin', breedingId: 'b-03', kindleDate: '2024-06-01', bornAlive: 9, bornDead: 1, weanedCount: 8, notes: 'Fryer growth pen' }
];

export const DEFAULT_LEDGER = [
  { id: 'ld-1', breederId: 'ab-admin', date: '2024-06-10', type: 'income', category: 'sale', amount: 150.00, notes: 'Sold 2 show junior Holland Lops' },
  { id: 'ld-2', breederId: 'ab-admin', date: '2024-06-14', type: 'expense', category: 'feed', amount: 65.00, notes: 'Bulk pellet feed (200 lbs)' },
  { id: 'ld-3', breederId: 'ab-admin', date: '2024-06-25', type: 'expense', category: 'vet', amount: 35.00, notes: 'Routine health checkup & deworming' },
  { id: 'ld-4', breederId: 'ab-admin', date: '2024-07-02', type: 'income', category: 'show', amount: 80.00, notes: 'Show premiums & BOB cash prize' }
];

export const DEFAULT_SHOWS = [
  { id: 'sh-1', breederId: 'ab-admin', name: 'ARBA State Convention', date: '2024-09-20', location: 'Columbus, OH', notes: 'Double All-Breeds Show' }
];

export const DEFAULT_CHORES = [
  { id: 'c-1', breederId: 'ab-admin', title: 'Deep Clean Hutch A-Block', dueDate: '2024-09-01', status: 'pending', notes: 'Sanitize drop pans & replace bedding' },
  { id: 'c-2', breederId: 'ab-admin', title: 'Weigh Fryer Batch #1', dueDate: '2024-09-03', status: 'pending', notes: 'Log 10-week weights' }
];

export const DEFAULT_TRANSFERS = [];
export const DEFAULT_SIGNATURES = [];

export const DEFAULT_MEDICAL = [
  { id: 'm-1', breederId: 'ab-admin', rabbitId: 'r-hl-1', date: '2024-05-01', treatment: 'Annual Deworming & Nail Trim', cost: 12.00, notes: 'Clean health check' }
];

export const DEFAULT_WEIGHTS = [
  { id: 'w-1', breederId: 'ab-admin', rabbitId: 'r-hl-3', weightOz: 20, date: '2024-04-15', notes: '4 week check' },
  { id: 'w-2', breederId: 'ab-admin', rabbitId: 'r-hl-3', weightOz: 38, date: '2024-05-15', notes: '8 week weaning' },
  { id: 'w-3', breederId: 'ab-admin', rabbitId: 'r-hl-3', weightOz: 52, date: '2024-06-15', notes: 'Junior weight' },
  { id: 'w-4', breederId: 'ab-admin', rabbitId: 'r-hl-3', weightOz: 60, date: '2024-07-15', notes: 'Senior weight' },
  { id: 'w-5', breederId: 'ab-admin', rabbitId: 'r-nz-3', weightOz: 32, date: '2024-06-21', notes: '3 week check' },
  { id: 'w-6', breederId: 'ab-admin', rabbitId: 'r-nz-3', weightOz: 80, date: '2024-08-08', notes: '10 week fryer weight target' }
];
