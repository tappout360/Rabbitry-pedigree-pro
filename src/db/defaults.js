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
    isDemo: true,
    birthdate: '2014-06-15',
    arbaDivision: 'Intermediate (Ages 12-14)',
    status: 'active',
    subscriptionTier: 'youth_student',
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
    photo: '/assets/holland_lop.png',
    photos: ['/assets/holland_lop.png'],
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
    photo: '/assets/holland_lop.png',
    photos: ['/assets/holland_lop.png'],
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
    photo: '/assets/holland_lop.png',
    photos: ['/assets/holland_lop.png'],
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
    photo: '/assets/holland_lop.png',
    photos: ['/assets/holland_lop.png'],
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
    photo: '/assets/holland_lop.png',
    photos: ['/assets/holland_lop.png'],
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
    photo: '/assets/holland_lop.png',
    photos: ['/assets/holland_lop.png'],
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
    photo: '/assets/holland_lop.png',
    photos: ['/assets/holland_lop.png'],
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
    photo: '/assets/holland_lop.png',
    photos: ['/assets/holland_lop.png'],
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
    photo: '/assets/holland_lop.png',
    photos: ['/assets/holland_lop.png'],
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
    photo: '/assets/holland_lop.png',
    photos: ['/assets/holland_lop.png'],
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
    gcNumber: 'GC-8899',
    location: 'Hutch A-07',
    notes: 'Maternal Grandfather. Robust bone and bold eye placement.',
    photo: '/assets/holland_lop.png',
    photos: ['/assets/holland_lop.png'],
    legs: [{ id: 'l-g2s', date: '2023-05-18', showName: 'Spring Buckeye Show', judge: 'Mary Vance', award: 'Best Opposite (BOS)', classSize: 50 }]
  },
  {
    id: 'r-hl-g2-d',
    breederId: 'ab-demo-1',
    tattooNumber: 'HL-G2D',
    name: 'Grandview Autumn Charm',
    breed: 'Holland Lop',
    variety: 'Broken Tortoise',
    sex: 'doe',
    dob: '2022-03-01',
    weightOz: 63,
    status: 'active',
    species: 'rabbit',
    sireId: 'r-hl-gg-7', damId: 'r-hl-gg-8',
    registrationNumber: 'REG-HL-820',
    gcNumber: 'GC-9201',
    location: 'Hutch A-08',
    notes: 'Maternal Grandmother. Wide muzzle & clear markings.',
    photo: '/assets/holland_lop.png',
    photos: ['/assets/holland_lop.png'],
    legs: []
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
    photo: '/assets/holland_lop.png',
    photos: ['/assets/holland_lop.png'],
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
    photo: '/assets/holland_lop.png',
    photos: ['/assets/holland_lop.png'],
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
    photo: '/assets/holland_lop.png',
    photos: [
      '/assets/holland_lop.png',
      'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800&q=80'
    ],
    timeline: [
      { id: 'tm-hl3-1', date: '2024-04-15', title: '4-Week Growth Check', weightOz: 20, notes: 'Healthy weaning weight and compact bone.', photo: '/assets/holland_lop.png' },
      { id: 'tm-hl3-2', date: '2024-07-15', title: 'Senior Evaluation', weightOz: 60, notes: 'Grand Champion crown curvature achieved.', photo: '/assets/holland_lop.png' }
    ],
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
    photo: '/assets/holland_lop.png',
    photos: ['/assets/holland_lop.png'],
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
    photo: '/assets/mini_rex.png',
    photos: ['/assets/mini_rex.png'],
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
    photo: '/assets/mini_rex.png',
    photos: ['/assets/mini_rex.png'],
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
    photo: '/assets/mini_rex.png',
    photos: ['/assets/mini_rex.png'],
    legs: []
  },

  // ==========================================
  // COMMERCIAL & FANCY CHAMPION SHOW STOCK
  // ==========================================
  {
    id: 'r-nzw-1',
    breederId: 'ab-demo-1',
    tattooNumber: 'NZ-SNOW1',
    name: 'Grandview\'s Snow Monarch',
    breed: 'New Zealand',
    variety: 'White',
    sex: 'buck',
    dob: '2023-06-10',
    weightOz: 178,
    status: 'active',
    species: 'rabbit',
    sireId: '', damId: '',
    registrationNumber: 'REG-NZ-12345',
    gcNumber: 'GC-9901',
    location: 'Barn Row C-01',
    notes: 'National Best in Show (BIS) Commercial Champion Senior Buck. 11 lbs 2 oz.',
    photo: '/assets/new_zealand_white.png',
    photos: ['/assets/new_zealand_white.png'],
    legs: [
      { id: 'leg-nzw-1', date: '2024-06-15', showName: 'National ARBA Show', judge: 'William Clark', award: 'Best in Show (BIS)', classSize: 140 }
    ]
  },
  {
    id: 'r-nzr-1',
    breederId: 'ab-demo-1',
    tattooNumber: 'NZ-RED01',
    name: 'Copper Ridge Champion',
    breed: 'New Zealand',
    variety: 'Red',
    sex: 'doe',
    dob: '2023-07-20',
    weightOz: 182,
    status: 'active',
    species: 'rabbit',
    sireId: '', damId: '',
    registrationNumber: 'REG-NZ-8821',
    gcNumber: 'GC-9924',
    location: 'Barn Row C-02',
    notes: 'Best of Breed (BOB) 4 Grand Legs Senior Doe.',
    photo: '/assets/new_zealand_red.png',
    photos: ['/assets/new_zealand_red.png'],
    legs: [
      { id: 'leg-nzr-1', date: '2024-07-10', showName: 'Midwest Classic', judge: 'Alan Stevens', award: 'Best of Breed (BOB)', classSize: 85 }
    ]
  },
  {
    id: 'r-cal-1',
    breederId: 'ab-demo-1',
    tattooNumber: 'CAL-SMUDGE',
    name: 'Valley Mark Smudge',
    breed: 'Californian',
    variety: 'Standard Smudge',
    sex: 'buck',
    dob: '2023-08-15',
    weightOz: 168,
    status: 'active',
    species: 'rabbit',
    sireId: '', damId: '',
    registrationNumber: 'REG-CAL-4411',
    gcNumber: 'GC-9810',
    location: 'Barn Row C-03',
    notes: 'Best Commercial Meat Type National Winner.',
    photo: '/assets/californian_rabbit.png',
    photos: ['/assets/californian_rabbit.png'],
    legs: [
      { id: 'leg-cal-1', date: '2024-05-22', showName: 'State Commercial Specialty', judge: 'Dr. John Miller', award: 'Best Commercial Type', classSize: 90 }
    ]
  },
  {
    id: 'r-nd-1',
    breederId: 'ab-demo-1',
    tattooNumber: 'ND-KNIGHT',
    name: 'Midnight Knight',
    breed: 'Netherland Dwarf',
    variety: 'Black',
    sex: 'buck',
    dob: '2023-09-01',
    weightOz: 36,
    status: 'active',
    species: 'rabbit',
    sireId: '', damId: '',
    registrationNumber: 'REG-ND-9900',
    gcNumber: 'GC-9712',
    location: 'Hutch D-01',
    notes: 'Tiny erect show ears & compact body. Best of Breed Gotham Classic.',
    photo: '/assets/netherland_dwarf.png',
    photos: ['/assets/netherland_dwarf.png'],
    legs: [
      { id: 'leg-nd-1', date: '2024-06-05', showName: 'Gotham Classic', judge: 'Sarah Connors', award: 'Best of Breed (BOB)', classSize: 52 }
    ]
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
    photo: '/assets/netherland_dwarf.png',
    photos: ['/assets/netherland_dwarf.png'],
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
    photo: '/assets/holland_lop.png',
    photos: ['/assets/holland_lop.png'],
    legs: []
  },

  // ==========================================
  // ARBA REGISTERED CAVY (GUINEA PIG) SAMPLES
  // ==========================================
  {
    id: 'c-demo-1',
    breederId: 'ab-demo-1',
    tattooNumber: 'CT-101',
    name: 'Starfire\'s Golden Nugget',
    breed: 'American',
    variety: 'Golden Agouti',
    sex: 'buck', // Boar
    dob: '2024-01-10',
    weightOz: 36,
    status: 'active',
    species: 'cavy',
    sireId: '', damId: '',
    registrationNumber: 'REG-CV-3310',
    gcNumber: 'GC-CV-991',
    location: 'Cavy Haven Pen 1',
    colorCarrier: 'Self Golden Agouti Locus',
    notes: 'Smooth, glossy Roman nose coat with dense guard ticking. ARBA Best in Show Cavy winner.',
    photo: '/assets/holland_lop.png',
    photos: ['/assets/holland_lop.png'],
    showClass: 'Senior Boar',
    winningsBOB: 2,
    winningsBOV: 3,
    winningsBIS: 1,
    legs: [
      { id: 'leg-cv-1', date: '2024-06-15', showName: 'Buckeye State Cavy Classic', judge: 'Dr. John Miller', award: 'Best in Show (BIS)', classSize: 45 }
    ]
  },
  {
    id: 'c-demo-2',
    breederId: 'ab-demo-1',
    tattooNumber: 'CT-102',
    name: 'Grandview\'s Rosette Queen',
    breed: 'Abyssinian',
    variety: 'Brindle',
    sex: 'doe', // Sow
    dob: '2024-03-20',
    weightOz: 34,
    status: 'active',
    species: 'cavy',
    sireId: '', damId: '',
    registrationNumber: 'REG-CV-3315',
    gcNumber: '',
    location: 'Cavy Haven Pen 2',
    colorCarrier: 'Roan & Brindle Pattern',
    notes: 'Crisp, well-formed rosettes with sharp ridges across collar and saddle.',
    photo: '/assets/mini_rex.png',
    photos: ['/assets/mini_rex.png'],
    showClass: 'Senior Sow',
    winningsBOB: 1,
    winningsBOV: 2,
    legs: [
      { id: 'leg-cv-2', date: '2024-07-20', showName: 'Tri-State Specialty', judge: 'Alan Stevens', award: 'Best of Breed (BOB)', classSize: 30 }
    ]
  },
  {
    id: 'c-youth-1',
    breederId: 'ab-youth-1',
    tattooNumber: '4H-PIP',
    name: 'Sunny Valley\'s Pip',
    breed: 'Teddy',
    variety: 'Tortoiseshell & White',
    sex: 'buck', // Boar
    dob: '2024-04-05',
    weightOz: 32,
    status: 'active',
    species: 'cavy',
    sireId: '', damId: '',
    registrationNumber: 'REG-YOUTH-CV01',
    gcNumber: '',
    location: 'Youth Hutch Pen C1',
    notes: 'Alex\'s 4-H Showmanship Cavy project! Super friendly and docile table handling.',
    photo: '/assets/holland_lop.png',
    photos: ['/assets/holland_lop.png'],
    showClass: 'Senior Boar',
    winningsBOB: 1,
    legs: [
      { id: 'leg-ycv-1', date: '2024-08-01', showName: 'Delaware County 4-H Fair', judge: 'Mary Henderson', award: 'Grand Champion Cavy Showmanship', classSize: 22 }
    ]
  },
  {
    id: 'c-youth-2',
    breederId: 'ab-youth-1',
    tattooNumber: '4H-SQK',
    name: 'Sunny Valley\'s Squeak',
    breed: 'American',
    variety: 'Red',
    sex: 'doe', // Sow
    dob: '2024-04-18',
    weightOz: 30,
    status: 'active',
    species: 'cavy',
    sireId: '', damId: '',
    registrationNumber: 'REG-YOUTH-CV02',
    gcNumber: '',
    location: 'Youth Hutch Pen C2',
    notes: 'Deep rich mahogany red coat. Active breeding sow prospect.',
    photo: '/assets/new_zealand_red.png',
    photos: ['/assets/new_zealand_red.png'],
    showClass: 'Senior Sow',
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
  },
  {
    id: 'b-cavy-1',
    breederId: 'ab-demo-1',
    buckId: 'c-demo-1',
    doeId: 'c-demo-2',
    breedDate: '2024-04-10',
    kindleDate: '2024-06-15',
    status: 'kindled',
    notes: 'Purebred show cavy pairing. 3 pups born vigorous.'
  }
];

export const DEFAULT_LITTERS = [
  { id: 'l-01', breederId: 'ab-demo-1', breedingId: 'b-01', kindleDate: '2024-03-15', bornAlive: 5, bornDead: 0, weanedCount: 4, notes: 'Show prospect kits' },
  { id: 'l-02', breederId: 'ab-demo-1', breedingId: 'b-02', kindleDate: '2024-05-01', bornAlive: 4, bornDead: 0, weanedCount: 4, notes: 'Plush coat kits' },
  { id: 'l-youth-1', breederId: 'ab-youth-1', breedingId: 'b-youth-1', kindleDate: '2024-06-11', bornAlive: 4, bornDead: 0, weanedCount: 4, notes: 'Alex 4-H Record Book Litter #1' },
  { id: 'l-cavy-1', breederId: 'ab-demo-1', breedingId: 'b-cavy-1', kindleDate: '2024-06-15', bornAlive: 3, bornDead: 0, weanedCount: 3, notes: 'Champion rosette pups' }
];

export const DEFAULT_LEDGER = [
  { id: 'ld-1', breederId: 'ab-demo-1', date: '2024-06-10', type: 'income', category: 'sale', amount: 150.00, notes: 'Sold 2 show junior Holland Lops' },
  { id: 'ld-2', breederId: 'ab-demo-1', date: '2024-06-14', type: 'expense', category: 'feed', amount: 65.00, notes: 'Bulk pellet feed (200 lbs)' },
  { id: 'ld-3', breederId: 'ab-demo-1', date: '2024-06-25', type: 'expense', category: 'vet', amount: 35.00, notes: 'Routine health checkup & deworming' },
  { id: 'ld-4', breederId: 'ab-demo-1', date: '2024-07-02', type: 'income', category: 'show', amount: 80.00, notes: 'Show premiums & BOB cash prize' },
  { id: 'ld-5', breederId: 'ab-demo-1', date: '2024-07-20', type: 'income', category: 'sale', amount: 75.00, notes: 'Sold 1 registered American Cavy pup' },
  { id: 'ld-6', breederId: 'ab-demo-1', date: '2024-08-05', type: 'expense', category: 'equipment', amount: 45.00, notes: 'Heavy duty ceramic feed crocks & hay racks' }
];

export const DEFAULT_SHOWS = [
  { id: 'sh-1', breederId: 'ab-demo-1', name: '2026 ARBA National Convention', date: '2026-10-18', location: 'Louisville, KY', notes: 'National Triple All-Breeds & Specialty Show' },
  { id: 'sh-2', breederId: 'ab-demo-1', name: 'Buckeye State Rabbit & Cavy Classic', date: '2026-09-12', location: 'Columbus, OH', notes: 'Double Show & Youth Showmanship Ring' },
  { id: 'sh-3', breederId: 'ab-youth-1', name: 'Delaware County 4-H Fair Rabbit Show', date: '2026-09-05', location: 'Delaware, OH', notes: 'Alex Rivera 4-H Project Exhibition' }
];

export const DEFAULT_SHOW_ENTRIES = [
  { id: 'se-1', breederId: 'ab-demo-1', showId: 'sh-1', rabbitId: 'r-hl-1', entryClass: 'Senior Buck', tattoo: 'HL-F1-01', entryFee: 9.00, status: 'entered', remarks: 'Best of Variety contender' },
  { id: 'se-2', breederId: 'ab-demo-1', showId: 'sh-1', rabbitId: 'r-mr-1', entryClass: 'Senior Buck', tattoo: 'MR-F1-01', entryFee: 9.00, status: 'entered', remarks: 'Grand Champion Castor' },
  { id: 'se-3', breederId: 'ab-youth-1', showId: 'sh-3', rabbitId: 'r-youth-1', entryClass: 'Junior Showmanship', tattoo: '4H-CLOVER', entryFee: 5.00, status: 'entered', remarks: 'County Fair Showmanship Ring' },
  { id: 'se-4', breederId: 'ab-demo-1', showId: 'sh-2', rabbitId: 'c-demo-1', entryClass: 'Senior Boar', tattoo: 'CT-101', entryFee: 8.00, status: 'entered', remarks: 'Best in Show Cavy Ring Contender' }
];

export const DEFAULT_CHORES = [
  { id: 'c-1', breederId: 'ab-demo-1', title: 'Morning Feed & Timothy Hay Replenish', dueDate: '2026-09-01', status: 'completed', notes: 'Fresh pellets & unlimited orchard grass hay in all racks' },
  { id: 'c-2', breederId: 'ab-demo-1', title: 'Nesting Box Check — Dutch & Holland Doe Pens', dueDate: '2026-09-01', status: 'pending', notes: 'Verify nest fur & warmth for day 28 check' },
  { id: 'c-3', breederId: 'ab-demo-1', title: 'Clean Drop Pans & Sanitize A-Block', dueDate: '2026-09-03', status: 'pending', notes: 'Replace pine pellets in drop trays' },
  { id: 'c-4', breederId: 'ab-youth-1', title: 'Daily 4-H Showmanship Handling Practice', dueDate: '2026-09-01', status: 'completed', notes: '15 min table pose & ear/teeth check with Lucky Clover' },
  { id: 'c-5', breederId: 'ab-demo-1', title: 'Vitamin C & Fresh Bell Pepper Distribution (Cavies)', dueDate: '2026-09-02', status: 'pending', notes: 'Daily stabilized vitamin C supplement for guinea pig pens' }
];

export const DEFAULT_TRANSFERS = [
  {
    id: 'tx-1001',
    breederId: 'ab-demo-1',
    rabbitId: 'r-hl-1',
    rabbitName: 'Grandview\'s Blue Lightning',
    rabbitTattoo: 'HL-F1-01',
    rabbitBreed: 'Holland Lop',
    rabbitVariety: 'Solid Blue',
    rabbitSex: 'buck',
    rabbitDob: '2024-03-15',
    rabbitWeightOz: 60,
    rabbitReg: 'REG-HL-1001',
    rabbitGc: 'GC-10088',
    buyerName: 'Emily Clark (Demo Buyer)',
    buyerEmail: 'emily.demo@example.com',
    buyerPhone: '555-0188',
    price: 150.00,
    type: 'sale',
    date: '2026-08-20',
    certificateId: 'TX-8842-1092',
    hash: 'e89a74cf09b211d088a291f03348120b'
  }
];

export const DEFAULT_SIGNATURES = [
  {
    id: 'sig-1001',
    transferId: 'tx-1001',
    sellerSignature: 'Grandview Pedigree Barn',
    buyerSignature: 'Emily Clark',
    signedAt: '2026-08-20T14:30:00Z',
    sellerSignatureType: 'typed',
    buyerSignatureType: 'typed'
  }
];

export const DEFAULT_MEDICAL = [
  { id: 'm-1', breederId: 'ab-demo-1', rabbitId: 'r-hl-1', date: '2026-08-01', treatment: 'Annual Preventative Health & Nail Trim', cost: 15.00, notes: 'Clear eyes, clean ears, healthy weight' },
  { id: 'm-2', breederId: 'ab-demo-1', rabbitId: 'r-mr-1', date: '2026-07-15', treatment: 'Probiotic Gut Health Booster', cost: 8.00, notes: 'Post-show digestive support' },
  { id: 'm-3', breederId: 'ab-youth-1', rabbitId: 'r-youth-1', date: '2026-08-10', treatment: 'Pre-Fair Showmanship Vet Check', cost: 10.00, notes: 'Perfect 4-H health certificate clearance' },
  { id: 'm-4', breederId: 'ab-demo-1', rabbitId: 'c-demo-1', date: '2026-08-18', treatment: 'Routine Vitamin C Assessment & Nail Clip', cost: 12.00, notes: 'Glossy coat and clear bright eyes' }
];

export const DEFAULT_WEIGHTS = [
  { id: 'w-1', breederId: 'ab-demo-1', rabbitId: 'r-hl-1', weightOz: 22, date: '2024-04-15', notes: '4 week check' },
  { id: 'w-2', breederId: 'ab-demo-1', rabbitId: 'r-hl-1', weightOz: 40, date: '2024-05-15', notes: '8 week weaning' },
  { id: 'w-3', breederId: 'ab-demo-1', rabbitId: 'r-hl-1', weightOz: 54, date: '2024-06-15', notes: 'Junior show weight' },
  { id: 'w-4', breederId: 'ab-demo-1', rabbitId: 'r-hl-1', weightOz: 60, date: '2024-07-15', notes: 'Senior standard weight' },
  { id: 'w-5', breederId: 'ab-demo-1', rabbitId: 'r-mr-1', weightOz: 20, date: '2024-05-01', notes: '4 week kit check' },
  { id: 'w-6', breederId: 'ab-demo-1', rabbitId: 'r-mr-1', weightOz: 52, date: '2024-07-01', notes: 'Junior prime weight' },
  { id: 'w-7', breederId: 'ab-youth-1', rabbitId: 'r-youth-1', weightOz: 34, date: '2026-08-01', notes: 'Pre-fair official weigh-in' },
  { id: 'w-8', breederId: 'ab-demo-1', rabbitId: 'c-demo-1', weightOz: 24, date: '2024-03-01', notes: 'Junior cavy weigh-in' },
  { id: 'w-9', breederId: 'ab-demo-1', rabbitId: 'c-demo-1', weightOz: 36, date: '2024-06-01', notes: 'Senior boar standard weight' }
];

export const DEFAULT_YOUTH_PROGRESS = [
  {
    id: 'yp-alex-1',
    breederId: 'ab-youth-1',
    memberName: 'Alex Rivera',
    ageGroup: 'Intermediate (Ages 12-14)',
    currentLevel: 'Intermediate',
    xp: 680,
    streak: 8,
    lastActiveDate: '2026-08-31',
    coachId: 'coach-warren',
    badges: [
      { id: 'b-showmanship', name: 'Showmanship Master', icon: '🏆', unlockedAt: '2026-07-20' },
      { id: 'b-breeds', name: 'ARBA Breed Identifier', icon: '🐇', unlockedAt: '2026-08-02' },
      { id: 'b-genetics', name: 'Locus Genetics Scholar', icon: '🧬', unlockedAt: '2026-08-15' },
      { id: 'b-chores', name: 'Barn Care Champion', icon: '🌾', unlockedAt: '2026-08-28' }
    ]
  }
];
