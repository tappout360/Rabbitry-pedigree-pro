// defaults.js — Rich initial production sample dataset for ARBA & 4-H show breeders
// Provides complete 4-generation pedigrees, photos, weights, health, and 4-H youth records.

export const DEFAULT_BREEDERS = [
  {
    id: 'ab-demo-1',
    name: 'Demo Breeder (Grandview Barn)',
    username: 'demobreeder',
    email: 'demo@rabbitrypedigree.pro',
    rabbitryName: 'Grandview Pedigree Barn',
    phone: '555-0100',
    role: 'owner',
    isDemo: true,
    status: 'active',
    subscriptionTier: 'pro',
    arbaMemberNumber: 'ARBA-554123',
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
  // ==========================================
  // HOLLAND LOP COMPLETE 4-GENERATION LINEAGE
  // ==========================================

  // --- GENERATION 3: Great-Grandparents (8 Ancestors) ---
  {
    id: 'r-hl-gg-1',
    breederId: 'ab-demo-1',
    tattooNumber: 'HL-GG1',
    name: 'Camelot\'s Excalibur',
    breed: 'Holland Lop',
    variety: 'Broken Blue',
    sex: 'buck',
    dob: '2021-03-10',
    weightOz: 64,
    status: 'active',
    species: 'rabbit',
    sireId: '', damId: '',
    registrationNumber: 'REG-HL-501',
    gcNumber: 'GC-7011',
    location: 'Retired Sire Pen',
    notes: 'Foundational sire for crown shape.',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&q=80',
    legs: [{ id: 'l-gg1', date: '2022-04-10', showName: 'National Convention', judge: 'Dr. John Miller', award: 'Best of Breed (BOB)', classSize: 60 }]
  },
  {
    id: 'r-hl-gg-2',
    breederId: 'ab-demo-1',
    tattooNumber: 'HL-GG2',
    name: 'Oakridge Blue Ribbon',
    breed: 'Holland Lop',
    variety: 'Solid Blue',
    sex: 'doe',
    dob: '2021-04-15',
    weightOz: 62,
    status: 'active',
    species: 'rabbit',
    sireId: '', damId: '',
    registrationNumber: 'REG-HL-610',
    gcNumber: '',
    location: 'Retired Doe Pen',
    notes: 'Dense blue coat & wide ears.',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&q=80',
    legs: []
  },
  {
    id: 'r-hl-gg-3',
    breederId: 'ab-demo-1',
    tattooNumber: 'HL-GG3',
    name: 'Grandview Midnight Boss',
    breed: 'Holland Lop',
    variety: 'Black',
    sex: 'buck',
    dob: '2021-05-01',
    weightOz: 66,
    status: 'active',
    species: 'rabbit',
    sireId: '', damId: '',
    registrationNumber: 'REG-HL-615',
    gcNumber: 'GC-8001',
    location: 'Hutch A-10',
    notes: '3-Leg winner.',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&q=80',
    legs: [{ id: 'l-gg3', date: '2022-06-15', showName: 'Buckeye Regional', judge: 'Tom Evans', award: 'Best Group', classSize: 32 }]
  },
  {
    id: 'r-hl-gg-4',
    breederId: 'ab-demo-1',
    tattooNumber: 'HL-GG4',
    name: 'Sapphire Velvet',
    breed: 'Holland Lop',
    variety: 'Blue Otter',
    sex: 'doe',
    dob: '2021-06-20',
    weightOz: 60,
    status: 'active',
    species: 'rabbit',
    sireId: '', damId: '',
    registrationNumber: 'REG-HL-590',
    gcNumber: '',
    location: 'Hutch A-11',
    notes: 'Smooth roll-back fur.',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&q=80',
    legs: []
  },
  {
    id: 'r-hl-gg-5',
    breederId: 'ab-demo-1',
    tattooNumber: 'HL-GG5',
    name: 'Lakeside Golden Boy',
    breed: 'Holland Lop',
    variety: 'Tortoise',
    sex: 'buck',
    dob: '2021-02-14',
    weightOz: 64,
    status: 'active',
    species: 'rabbit',
    sireId: '', damId: '',
    registrationNumber: 'REG-HL-630',
    gcNumber: 'GC-7600',
    location: 'Hutch A-12',
    notes: 'Thick bone structure.',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&q=80',
    legs: [{ id: 'l-gg5', date: '2022-03-20', showName: 'Spring Specialty', judge: 'Alan Stevens', award: 'Best Variety (BOV)', classSize: 40 }]
  },
  {
    id: 'r-hl-gg-6',
    breederId: 'ab-demo-1',
    tattooNumber: 'HL-GG6',
    name: 'Copper Duchess',
    breed: 'Holland Lop',
    variety: 'Tortoise',
    sex: 'doe',
    dob: '2021-03-22',
    weightOz: 62,
    status: 'active',
    species: 'rabbit',
    sireId: '', damId: '',
    registrationNumber: 'REG-HL-688',
    gcNumber: '',
    location: 'Hutch A-13',
    notes: 'Excellent dam line.',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&q=80',
    legs: []
  },
  {
    id: 'r-hl-gg-7',
    breederId: 'ab-demo-1',
    tattooNumber: 'HL-GG7',
    name: 'Highland Chief',
    breed: 'Holland Lop',
    variety: 'Broken Tortoise',
    sex: 'buck',
    dob: '2021-01-30',
    weightOz: 65,
    status: 'active',
    species: 'rabbit',
    sireId: '', damId: '',
    registrationNumber: 'REG-HL-710',
    gcNumber: 'GC-8100',
    location: 'Hutch A-14',
    notes: 'Grand Champion winner.',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&q=80',
    legs: [{ id: 'l-gg7', date: '2022-05-12', showName: 'Tri-State Classic', judge: 'Robert Vance', award: 'Best Opposite Sex (BOS)', classSize: 45 }]
  },
  {
    id: 'r-hl-gg-8',
    breederId: 'ab-demo-1',
    tattooNumber: 'HL-GG8',
    name: 'Grandview Autumn Glow',
    breed: 'Holland Lop',
    variety: 'Orange',
    sex: 'doe',
    dob: '2021-04-05',
    weightOz: 61,
    status: 'active',
    species: 'rabbit',
    sireId: '', damId: '',
    registrationNumber: 'REG-HL-725',
    gcNumber: 'GC-8500',
    location: 'Hutch A-15',
    notes: 'Vibrant color saturation.',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&q=80',
    legs: []
  },

  // --- GENERATION 2: Grandparents (4 Ancestors) ---
  {
    id: 'r-hl-g1-s',
    breederId: 'ab-demo-1',
    tattooNumber: 'HL-G1S',
    name: 'Oakridge Royal Crown',
    breed: 'Holland Lop',
    variety: 'Broken Blue',
    sex: 'buck',
    dob: '2022-03-15',
    weightOz: 64,
    status: 'active',
    species: 'rabbit',
    sireId: 'r-hl-gg-1', damId: 'r-hl-gg-2',
    registrationNumber: 'REG-HL-810',
    gcNumber: 'GC-9102',
    location: 'Hutch A-05',
    notes: 'Paternal Grandfather. Supreme crown curvature & mass.',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&q=80',
    legs: [{ id: 'l-g1s', date: '2023-04-12', showName: 'ARBA National Convention', judge: 'Alan Stevens', award: 'Best of Breed (BOB)', classSize: 75 }]
  },
  {
    id: 'r-hl-g1-d',
    breederId: 'ab-demo-1',
    tattooNumber: 'HL-G1D',
    name: 'Grandview Sapphire',
    breed: 'Holland Lop',
    variety: 'Solid Blue',
    sex: 'doe',
    dob: '2022-04-01',
    weightOz: 62,
    status: 'active',
    species: 'rabbit',
    sireId: 'r-hl-gg-3', damId: 'r-hl-gg-4',
    registrationNumber: 'REG-HL-812',
    gcNumber: 'GC-8811',
    location: 'Hutch A-06',
    notes: 'Paternal Grandmother. Dense plush undercoat.',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&q=80',
    legs: []
  },
  {
    id: 'r-hl-g2-s',
    breederId: 'ab-demo-1',
    tattooNumber: 'HL-G2S',
    name: 'Lakeside Copper Chief',
    breed: 'Holland Lop',
    variety: 'Tortoise',
    sex: 'buck',
    dob: '2022-02-10',
    weightOz: 65,
    status: 'active',
    species: 'rabbit',
    sireId: 'r-hl-gg-5', damId: 'r-hl-gg-6',
    registrationNumber: 'REG-HL-771',
    gcNumber: '',
    location: 'Hutch A-07',
    notes: 'Maternal Grandfather. Compact 4-class body ratio.',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&q=80',
    legs: []
  },
  {
    id: 'r-hl-g2-d',
    breederId: 'ab-demo-1',
    tattooNumber: 'HL-G2D',
    name: 'Grandview Autumn Charm',
    breed: 'Holland Lop',
    variety: 'Broken Tortoise',
    sex: 'doe',
    dob: '2022-05-18',
    weightOz: 63,
    status: 'active',
    species: 'rabbit',
    sireId: 'r-hl-gg-7', damId: 'r-hl-gg-8',
    registrationNumber: 'REG-HL-820',
    gcNumber: 'GC-9304',
    location: 'Hutch A-08',
    notes: 'Maternal Grandmother. Excellent litter size & milk production.',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&q=80',
    legs: [{ id: 'l-g2d', date: '2023-06-10', showName: 'Buckeye Regional', judge: 'Sarah Jenkins', award: 'Best Opposite Sex (BOS)', classSize: 40 }]
  },

  // --- GENERATION 1: Parents (2 Ancestors) ---
  {
    id: 'r-hl-1',
    breederId: 'ab-demo-1',
    tattooNumber: 'HL-SIRE1',
    name: 'Grandview\'s Thunder King',
    breed: 'Holland Lop',
    variety: 'Broken Blue',
    sex: 'buck',
    dob: '2023-04-10',
    weightOz: 64,
    status: 'active',
    species: 'rabbit',
    sireId: 'r-hl-g1-s', damId: 'r-hl-g1-d',
    registrationNumber: 'REG-HL-901',
    gcNumber: 'GC-9942',
    location: 'Hutch A-01',
    notes: 'Father (Sire). Grand Champion sire. Supreme crown & thick bone.',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&q=80',
    legs: [
      { id: 'leg-1', date: '2024-05-10', showName: 'Ohio State ARBA Convention', judge: 'Dr. John Miller', award: 'Best of Breed (BOB)', classSize: 42 },
      { id: 'leg-2', date: '2024-09-15', showName: 'Midwest Regional Show', judge: 'Sarah Jenkins', award: 'Best in Show (BIS)', classSize: 110 }
    ]
  },
  {
    id: 'r-hl-2',
    breederId: 'ab-demo-1',
    tattooNumber: 'HL-DAM1',
    name: 'Grandview\'s Velvet Queen',
    breed: 'Holland Lop',
    variety: 'Tortoise',
    sex: 'doe',
    dob: '2023-05-12',
    weightOz: 62,
    status: 'active',
    species: 'rabbit',
    sireId: 'r-hl-g2-s', damId: 'r-hl-g2-d',
    registrationNumber: 'REG-HL-902',
    gcNumber: 'GC-9943',
    location: 'Hutch A-02',
    notes: 'Mother (Dam). Proven dam with excellent maternal traits.',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&q=80',
    legs: [
      { id: 'leg-3', date: '2024-06-20', showName: 'Buckeye Classic', judge: 'Tom Evans', award: 'Best Opposite Sex (BOS)', classSize: 35 }
    ]
  },

  // --- GENERATION 0: Target Offspring (4-Gen Star Rabbit) ---
  {
    id: 'r-hl-3',
    breederId: 'ab-demo-1',
    tattooNumber: 'HL-F1-01',
    name: 'Grandview\'s Blue Lightning',
    breed: 'Holland Lop',
    variety: 'Solid Blue',
    sex: 'buck',
    dob: '2024-03-15',
    weightOz: 60,
    status: 'active',
    species: 'rabbit',
    sireId: 'r-hl-1', damId: 'r-hl-2',
    registrationNumber: 'REG-HL-1001',
    gcNumber: 'GC-10088',
    location: 'Hutch A-03',
    notes: 'Star 4-Gen Pedigree Buck! Ideal 4-class crown and rollback fur.',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&q=80',
    legs: [
      { id: 'leg-hl3-1', date: '2024-08-10', showName: 'Summer ARBA Showcase', judge: 'Alan Stevens', award: 'Best Junior Buck (BJB)', classSize: 28 }
    ]
  },
  {
    id: 'r-hl-4',
    breederId: 'ab-demo-1',
    tattooNumber: 'HL-F1-02',
    name: 'Grandview\'s Opal Star',
    breed: 'Holland Lop',
    variety: 'Opal',
    sex: 'doe',
    dob: '2024-03-15',
    weightOz: 58,
    status: 'active',
    species: 'rabbit',
    sireId: 'r-hl-1', damId: 'r-hl-2',
    registrationNumber: 'REG-HL-1002',
    gcNumber: '',
    location: 'Hutch A-04',
    notes: 'Sister to Blue Lightning. Dense coat & compact body.',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&q=80',
    legs: []
  },

  // ==========================================
  // MINI REX HERD DATA
  // ==========================================
  {
    id: 'r-mr-1',
    breederId: 'ab-demo-1',
    tattooNumber: 'MR-ROYAL',
    name: 'Clover Barn\'s Velvet Prince',
    breed: 'Mini Rex',
    variety: 'Castor',
    sex: 'buck',
    dob: '2023-02-18',
    weightOz: 68,
    status: 'active',
    species: 'rabbit',
    sireId: '', damId: '',
    registrationNumber: 'REG-MR-801',
    gcNumber: 'GC-8812',
    location: 'Hutch B-01',
    notes: 'Plush velvet fur depth (5/8 inch). Ideal head & ear set.',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&q=80',
    legs: [
      { id: 'leg-4', date: '2024-04-12', showName: 'National Mini Rex Show', judge: 'Alan Stevens', award: 'Best Variety (BOV)', classSize: 64 }
    ]
  },
  {
    id: 'r-mr-2',
    breederId: 'ab-demo-1',
    tattooNumber: 'MR-RUBY',
    name: 'Clover Barn\'s Ruby Charm',
    breed: 'Mini Rex',
    variety: 'Broken Castor',
    sex: 'doe',
    dob: '2023-03-22',
    weightOz: 70,
    status: 'active',
    species: 'rabbit',
    sireId: '', damId: '',
    registrationNumber: 'REG-MR-802',
    gcNumber: '',
    location: 'Hutch B-02',
    notes: 'Excellent body density & fur texture.',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&q=80',
    legs: []
  },
  {
    id: 'r-mr-3',
    breederId: 'ab-demo-1',
    tattooNumber: 'MR-F1-10',
    name: 'Grandview\'s Shadow Rex',
    breed: 'Mini Rex',
    variety: 'Black',
    sex: 'buck',
    dob: '2024-05-01',
    weightOz: 64,
    status: 'active',
    species: 'rabbit',
    sireId: 'r-mr-1', damId: 'r-mr-2',
    registrationNumber: '',
    gcNumber: '',
    location: 'Hutch B-03',
    notes: 'Jet black plush fur.',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&q=80',
    legs: []
  },

  // ==========================================
  // YOUTH 4-H PROJECT HERD (Alex Rivera - 12 Yrs)
  // ==========================================
  {
    id: 'r-youth-1',
    breederId: 'ab-youth-1',
    tattooNumber: '4H-CLOVER',
    name: 'Sunny Valley\'s Lucky Clover',
    breed: 'Netherland Dwarf',
    variety: 'Blue Eyed White',
    sex: 'doe',
    dob: '2024-01-10',
    weightOz: 34,
    status: 'active',
    species: 'rabbit',
    sireId: '', damId: '',
    registrationNumber: 'REG-YOUTH-101',
    gcNumber: 'GC-Y-901',
    location: '4-H Hutch Pen 1',
    notes: '4-H County Fair Grand Champion Showmanship Rabbit!',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&q=80',
    legs: [
      { id: 'l-y1', date: '2024-07-20', showName: 'Delaware County 4-H Fair', judge: 'Mary Henderson', award: 'Grand Champion Showmanship', classSize: 45 }
    ]
  },
  {
    id: 'r-youth-2',
    breederId: 'ab-youth-1',
    tattooNumber: '4H-SPOT',
    name: 'Sunny Valley\'s Barnaby',
    breed: 'Holland Lop',
    variety: 'Broken Black',
    sex: 'buck',
    dob: '2024-02-15',
    weightOz: 62,
    status: 'active',
    species: 'rabbit',
    sireId: '', damId: '',
    registrationNumber: 'REG-YOUTH-102',
    gcNumber: '',
    location: '4-H Hutch Pen 2',
    notes: 'Alex\'s 4-H breeding project buck.',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&q=80',
    legs: []
  }
];

export const DEFAULT_BREEDINGS = [
  {
    id: 'b-01',
    breederId: 'ab-demo-1',
    buckId: 'r-hl-1',
    doeId: 'r-hl-2',
    breedDate: '2024-02-12',
    kindleDate: '2024-03-15',
    status: 'kindled',
    notes: 'Produced 5 kits. All vigorous.'
  },
  {
    id: 'b-02',
    breederId: 'ab-demo-1',
    buckId: 'r-mr-1',
    doeId: 'r-mr-2',
    breedDate: '2024-03-30',
    kindleDate: '2024-05-01',
    status: 'kindled',
    notes: '4 kits weaned successfully.'
  },
  {
    id: 'b-youth-1',
    breederId: 'ab-youth-1',
    buckId: 'r-youth-2',
    doeId: 'r-youth-1',
    breedDate: '2024-05-10',
    kindleDate: '2024-06-11',
    status: 'kindled',
    notes: '4-H Project breeding. 4 kits born alive.'
  }
];

export const DEFAULT_LITTERS = [
  { id: 'l-01', breederId: 'ab-demo-1', breedingId: 'b-01', kindleDate: '2024-03-15', bornAlive: 5, bornDead: 0, weanedCount: 4, notes: 'Show prospect kits' },
  { id: 'l-02', breederId: 'ab-demo-1', breedingId: 'b-02', kindleDate: '2024-05-01', bornAlive: 4, bornDead: 0, weanedCount: 4, notes: 'Plush coat kits' },
  { id: 'l-youth-1', breederId: 'ab-youth-1', breedingId: 'b-youth-1', kindleDate: '2024-06-11', bornAlive: 4, bornDead: 0, weanedCount: 4, notes: 'Alex 4-H Record Book Litter #1' }
];

export const DEFAULT_LEDGER = [
  { id: 'ld-1', breederId: 'ab-demo-1', date: '2024-06-10', type: 'income', category: 'sale', amount: 150.00, notes: 'Sold 2 show junior Holland Lops' },
  { id: 'ld-2', breederId: 'ab-demo-1', date: '2024-06-14', type: 'expense', category: 'feed', amount: 65.00, notes: 'Bulk pellet feed (200 lbs)' },
  { id: 'ld-3', breederId: 'ab-demo-1', date: '2024-06-25', type: 'expense', category: 'vet', amount: 35.00, notes: 'Routine health checkup & deworming' },
  { id: 'ld-4', breederId: 'ab-demo-1', date: '2024-07-02', type: 'income', category: 'show', amount: 80.00, notes: 'Show premiums & BOB cash prize' }
];

export const DEFAULT_SHOWS = [
  { id: 'sh-1', breederId: 'ab-demo-1', name: 'ARBA State Convention', date: '2024-09-20', location: 'Columbus, OH', notes: 'Double All-Breeds Show' }
];

export const DEFAULT_CHORES = [
  { id: 'c-1', breederId: 'ab-demo-1', title: 'Deep Clean Hutch A-Block', dueDate: '2024-09-01', status: 'pending', notes: 'Sanitize drop pans & replace bedding' },
  { id: 'c-2', breederId: 'ab-demo-1', title: 'Weigh Fryer Batch #1', dueDate: '2024-09-03', status: 'pending', notes: 'Log 10-week weights' }
];

export const DEFAULT_TRANSFERS = [];
export const DEFAULT_SIGNATURES = [];

export const DEFAULT_MEDICAL = [
  { id: 'm-1', breederId: 'ab-demo-1', rabbitId: 'r-hl-3', date: '2024-05-01', treatment: 'Annual Deworming & Nail Trim', cost: 12.00, notes: 'Clean health check' }
];

export const DEFAULT_WEIGHTS = [
  { id: 'w-1', breederId: 'ab-demo-1', rabbitId: 'r-hl-3', weightOz: 20, date: '2024-04-15', notes: '4 week check' },
  { id: 'w-2', breederId: 'ab-demo-1', rabbitId: 'r-hl-3', weightOz: 38, date: '2024-05-15', notes: '8 week weaning' },
  { id: 'w-3', breederId: 'ab-demo-1', rabbitId: 'r-hl-3', weightOz: 52, date: '2024-06-15', notes: 'Junior weight' },
  { id: 'w-4', breederId: 'ab-demo-1', rabbitId: 'r-hl-3', weightOz: 60, date: '2024-07-15', notes: 'Senior weight' }
];
