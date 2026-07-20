export const DEFAULT_BREEDERS = [
  { id: 'ab-admin', name: 'Jason Mounts', username: 'jmounts', email: 'jasonmounts77@yahoo.com', rabbitryName: '', phone: '', role: 'owner', isSuperAdmin: true, status: 'active', password: '7c2df4fb3c5eb87155ec4dfbc6732ef620e7df6504a377d6118d098ab67d3e40', subscriptionTier: 'pro', subscriptionLimit: 10000, isProtected: true },
  { id: 'ab-1', name: 'Jason Miller', username: 'jmiller', email: 'jason@grandview.com', rabbitryName: 'Grandview Rabbitry', phone: '555-0101', role: 'owner', status: 'active', password: 'ef92b778bafe4255239639026793a59a728b70db90373c50f00f074d0cf6007e', subscriptionTier: 'pro', subscriptionLimit: 1000, isDemo: true, isProtected: true },
  { id: 'ab-2', name: 'Sarah Connors', username: 'sconnors', email: 'sarah@arba.org', rabbitryName: 'Clover Barns', phone: '555-0102', role: 'owner', status: 'active', password: '85c7bb741829e0839e9921f07fcf86716a4a60032bbcc9c424a73752e5055032', subscriptionTier: 'free', subscriptionLimit: 25, isDemo: true, isProtected: true }
];

export const DEFAULT_RABBITS = [
  { 
    id: 'r-1', breederId: 'ab-1', tattooNumber: 'S01', name: 'Blue Thunder', breed: 'Holland Lop', variety: 'Blue', sex: 'buck', dob: '2025-01-10', weightOz: 60, status: 'active', sireId: 'r-4', damId: 'r-5', inbreedingCoeff: 0.0, registrationNumber: 'REG-12345', gcNumber: 'GC-5544', location: 'A-1-2', notes: 'Proven sire, extremely calm.',
    colorCarrier: 'Carries dilute, self',
    winningsBOB: 1,
    winningsBOV: 2,
    winningsBOS: 0,
    winningsBOSV: 0,
    winningsBIS: 0,
    winningsOther: 0,
    photos: ['/assets/holland_lop.png'],
    legs: [{ id: 'leg-1', date: '2025-09-15', showName: 'ARBA National Show', judge: 'Dr. John Miller', award: 'Best of Variety', classSize: 24 }],
    timeline: [
      { id: 't-r1-1', date: '2025-01-10', photo: '/assets/holland_lop.png', weightOz: 2.5, notes: 'Birth entry - Blue Thunder' },
      { id: 't-r1-2', date: '2025-02-10', photo: '/assets/holland_lop.png', weightOz: 16.0, notes: 'Weaning weight log' },
      { id: 't-r1-3', date: '2025-03-10', photo: '/assets/holland_lop.png', weightOz: 32.0, notes: '8 weeks growth check' },
      { id: 't-r1-4', date: '2025-04-10', photo: '/assets/holland_lop.png', weightOz: 48.0, notes: '12 weeks growth check' },
      { id: 't-r1-5', date: '2025-07-10', photo: '/assets/holland_lop.png', weightOz: 60.0, notes: 'Maturity weight check' }
    ]
  },
  { 
    id: 'r-2', breederId: 'ab-1', tattooNumber: 'D01', name: 'Clover Blossom', breed: 'Holland Lop', variety: 'Broken Blue', sex: 'doe', dob: '2025-02-15', weightOz: 62, status: 'active', sireId: 'r-4', damId: 'r-7', inbreedingCoeff: 0.0, registrationNumber: 'REG-12346', gcNumber: '', location: 'A-2-2', notes: 'Excellent mothering instincts.',
    photos: ['/assets/holland_lop.png'],
    legs: [],
    timeline: [
      { id: 't-r2-1', date: '2025-02-15', photo: '/assets/holland_lop.png', weightOz: 2.4, notes: 'Birth entry - Clover Blossom' },
      { id: 't-r2-2', date: '2025-03-15', photo: '/assets/holland_lop.png', weightOz: 18.0, notes: 'Weaning check' },
      { id: 't-r2-3', date: '2025-04-15', photo: '/assets/holland_lop.png', weightOz: 34.0, notes: '8 weeks check' },
      { id: 't-r2-4', date: '2025-05-15', photo: '/assets/holland_lop.png', weightOz: 50.0, notes: '12 weeks check' },
      { id: 't-r2-5', date: '2025-08-15', photo: '/assets/holland_lop.png', weightOz: 62.0, notes: 'Senior weight verification' }
    ]
  },
  { 
    id: 'r-3', breederId: 'ab-1', tattooNumber: 'L43-1', name: 'Blue Pearl', breed: 'Holland Lop', variety: 'Blue', sex: 'doe', dob: '2026-03-01', weightOz: 38, status: 'active', sireId: 'r-1', damId: 'r-2', inbreedingCoeff: 0.125, registrationNumber: '', gcNumber: '', location: 'B-4-1', notes: 'Nice hutch variety with rich blue undercoat.',
    photos: ['/assets/holland_lop.png'],
    legs: [],
    timeline: [
      { id: 't-r3-1', date: '2026-03-01', photo: '/assets/holland_lop.png', weightOz: 2.2, notes: 'Birth entry - Blue Pearl' },
      { id: 't-r3-2', date: '2026-04-01', photo: '/assets/holland_lop.png', weightOz: 14.5, notes: 'Weaning weight' },
      { id: 't-r3-3', date: '2026-05-01', photo: '/assets/holland_lop.png', weightOz: 28.0, notes: '8 weeks growth check' },
      { id: 't-r3-4', date: '2026-06-01', photo: '/assets/holland_lop.png', weightOz: 38.0, notes: 'Junior hutch check' }
    ]
  },
  {
    id: 'r-4', breederId: 'ab-1', tattooNumber: 'SR01', name: 'Storm Rider', breed: 'Holland Lop', variety: 'Blue', sex: 'buck', dob: '2024-03-10', weightOz: 61, status: 'active', sireId: 'r-8', damId: 'r-9', inbreedingCoeff: 0.0, registrationNumber: 'REG-11022', gcNumber: '', location: 'C-1-2', notes: 'Sired multiple champions.',
    photos: ['/assets/holland_lop.png'],
    legs: [{ id: 'leg-2', date: '2025-10-05', showName: 'West Coast Rabbit Classic', judge: 'Carla Sanchez', award: 'Best of Breed', classSize: 18 }],
    timeline: [
      { id: 't-r4-1', date: '2024-03-10', photo: '/assets/holland_lop.png', weightOz: 2.6, notes: 'Birth entry - Storm Rider' },
      { id: 't-r4-2', date: '2024-10-05', photo: '/assets/holland_lop.png', weightOz: 61.0, notes: 'Senior weight verification' }
    ]
  },
  {
    id: 'r-5', breederId: 'ab-1', tattooNumber: 'SD01', name: 'Sky Dancer', breed: 'Holland Lop', variety: 'Blue', sex: 'doe', dob: '2024-04-12', weightOz: 59, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: '', gcNumber: '', location: 'C-2-2', notes: 'Very gentle temperament.',
    photos: ['/assets/holland_lop.png'],
    legs: [],
    timeline: [
      { id: 't-r5-1', date: '2024-04-12', photo: '/assets/holland_lop.png', weightOz: 2.3, notes: 'Birth entry - Sky Dancer' },
      { id: 't-r5-2', date: '2024-08-12', photo: '/assets/holland_lop.png', weightOz: 59.0, notes: 'Official maturity check' }
    ]
  },
  {
    id: 'r-6', breederId: 'ab-1', tattooNumber: 'FR01', name: 'Forest Ranger', breed: 'Holland Lop', variety: 'Broken Blue', sex: 'buck', dob: '2024-02-18', weightOz: 63, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-11023', gcNumber: '', location: 'C-3-2', notes: 'Broad shoulders, compact body.',
    photos: ['/assets/holland_lop.png'],
    legs: [],
    timeline: [
      { id: 't-r6-1', date: '2024-02-18', photo: '/assets/holland_lop.png', weightOz: 2.4, notes: 'Birth entry - Forest Ranger' },
      { id: 't-r6-2', date: '2024-06-18', photo: '/assets/holland_lop.png', weightOz: 63.0, notes: 'Hutch maturity check' }
    ]
  },
  {
    id: 'r-7', breederId: 'ab-1', tattooNumber: 'MB01', name: 'Meadow Breeze', breed: 'Holland Lop', variety: 'Blue', sex: 'doe', dob: '2024-03-22', weightOz: 60, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: '', gcNumber: '', location: 'C-4-2', notes: 'Deep blue coat, great fur density.',
    photos: ['/assets/holland_lop.png'],
    legs: [],
    timeline: [
      { id: 't-r7-1', date: '2024-03-22', photo: '/assets/holland_lop.png', weightOz: 2.2, notes: 'Birth entry - Meadow Breeze' },
      { id: 't-r7-2', date: '2024-07-22', photo: '/assets/holland_lop.png', weightOz: 60.0, notes: 'Hutch maturity check' }
    ]
  },
  {
    id: 'r-8', breederId: 'ab-1', tattooNumber: 'ZB01', name: 'Zephyr Buck', breed: 'Holland Lop', variety: 'Blue', sex: 'buck', dob: '2023-01-05', weightOz: 62, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-9988', gcNumber: 'GC-2211', location: 'D-1-2', notes: 'Grand Champion line progenitor.',
    photos: ['/assets/holland_lop.png'],
    legs: [{ id: 'leg-3', date: '2024-11-20', showName: 'Cascade Winter Show', judge: 'Robert Devlin', award: 'Best In Show', classSize: 42 }],
    timeline: [
      { id: 't-r8-1', date: '2023-01-05', photo: '/assets/holland_lop.png', weightOz: 2.5, notes: 'Birth entry - Zephyr Buck' },
      { id: 't-r8-2', date: '2024-11-20', photo: '/assets/holland_lop.png', weightOz: 62.0, notes: 'Cascade Show weight audit' }
    ]
  },
  {
    id: 'r-9', breederId: 'ab-1', tattooNumber: 'OD01', name: 'Orchard Doe', breed: 'Holland Lop', variety: 'Blue', sex: 'doe', dob: '2023-02-14', weightOz: 61, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-9989', gcNumber: '', location: 'D-2-2', notes: 'High fertility history.',
    photos: ['/assets/holland_lop.png'],
    legs: [],
    timeline: [
      { id: 't-r9-1', date: '2023-02-14', photo: '/assets/holland_lop.png', weightOz: 2.3, notes: 'Birth entry - Orchard Doe' },
      { id: 't-r9-2', date: '2024-02-14', photo: '/assets/holland_lop.png', weightOz: 61.0, notes: 'Hutch maturity check' }
    ]
  },
  { 
    id: 'r-30', breederId: 'ab-2', tattooNumber: 'CL01', name: 'Clover Opal', breed: 'Mini Rex', variety: 'Opal', sex: 'doe', dob: '2025-05-10', weightOz: 58, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-MR101', gcNumber: '', location: 'C-10', notes: 'Very soft opal coat.',
    photos: ['/assets/mini_rex.png'],
    legs: [],
    timeline: [
      { id: 't-30-1', date: '2025-05-10', photo: '/assets/mini_rex.png', weightOz: 2.1, notes: 'Birth entry - Clover Opal' },
      { id: 't-30-2', date: '2025-09-10', photo: '/assets/mini_rex.png', weightOz: 40, notes: 'Official senior weight log' },
      { id: 't-30-3', date: '2026-01-10', photo: '/assets/mini_rex.png', weightOz: 58, notes: 'Pre-breeding check' }
    ]
  },
  { 
    id: 'r-31', breederId: 'ab-2', tattooNumber: 'CL02', name: 'Castor King', breed: 'Mini Rex', variety: 'Castor', sex: 'buck', dob: '2025-02-12', weightOz: 60, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-MR102', gcNumber: 'GC-MR01', location: 'C-11', notes: 'Grand Champion lineage castor buck.',
    photos: ['/assets/mini_rex.png'],
    legs: [{ id: 'leg-mr1', date: '2025-11-20', showName: 'Midwest Mini Rex Specialty', judge: 'Adam West', award: 'Best of Variety', classSize: 15 }],
    timeline: [
      { id: 't-31-1', date: '2025-02-12', photo: '/assets/mini_rex.png', weightOz: 2.2, notes: 'Birth entry - Castor King' },
      { id: 't-31-2', date: '2025-11-20', photo: '/assets/mini_rex.png', weightOz: 60, notes: 'Championship show weight check' }
    ]
  },
  { 
    id: 'r-32', breederId: 'ab-2', tattooNumber: 'CL03', name: 'Clover Shadow', breed: 'Mini Rex', variety: 'Black', sex: 'doe', dob: '2025-06-01', weightOz: 56, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: '', gcNumber: '', location: 'C-12', notes: 'Jet black plush coat.',
    photos: ['/assets/mini_rex.png'],
    legs: [],
    timeline: [
      { id: 't-32-1', date: '2025-06-01', photo: '/assets/mini_rex.png', weightOz: 2.0, notes: 'Birth entry - Clover Shadow' },
      { id: 't-32-2', date: '2026-03-01', photo: '/assets/mini_rex.png', weightOz: 56, notes: 'Junior hutch weight logging' }
    ]
  },
  { 
    id: 'r-33', breederId: 'ab-2', tattooNumber: 'CL-L1', name: 'Clover Velvet', breed: 'Mini Rex', variety: 'Castor', sex: 'doe', dob: '2026-03-15', weightOz: 35, status: 'active', sireId: 'r-31', damId: 'r-30', inbreedingCoeff: 0.0, registrationNumber: '', gcNumber: '', location: 'C-13', notes: 'Promising castor junior doe.',
    photos: ['/assets/mini_rex.png'],
    legs: [],
    timeline: [
      { id: 't-33-1', date: '2026-03-15', photo: '/assets/mini_rex.png', weightOz: 2.3, notes: 'Birth entry - Castor kit weaned.' },
      { id: 't-33-2', date: '2026-04-15', photo: '/assets/mini_rex.png', weightOz: 12.0, notes: '4 weeks old - Transitioning to solid hay.' },
      { id: 't-33-3', date: '2026-05-15', photo: '/assets/mini_rex.png', weightOz: 24.0, notes: '8 weeks old - Official hutch weight log.' },
      { id: 't-33-4', date: '2026-06-15', photo: '/assets/mini_rex.png', weightOz: 35.0, notes: 'Junior weight check.' }
    ]
  },
  { 
    id: 'r-34', breederId: 'ab-2', tattooNumber: 'CL-L2', name: 'Clover Prince', breed: 'Mini Rex', variety: 'Castor', sex: 'buck', dob: '2026-03-15', weightOz: 36, status: 'active', sireId: 'r-31', damId: 'r-30', inbreedingCoeff: 0.0, registrationNumber: '', gcNumber: '', location: 'C-14', notes: 'Energetic castor junior buck.',
    photos: ['/assets/mini_rex.png'],
    legs: [],
    timeline: [
      { id: 't-34-1', date: '2026-03-15', photo: '/assets/mini_rex.png', weightOz: 2.4, notes: 'Birth entry - Clover Prince' },
      { id: 't-34-2', date: '2026-05-15', photo: '/assets/mini_rex.png', weightOz: 25.0, notes: '8 weeks old - Transitioning successfully.' },
      { id: 't-34-3', date: '2026-06-15', photo: '/assets/mini_rex.png', weightOz: 36.0, notes: 'Hutch junior check' }
    ]
  },
  {
    id: 'c-1', breederId: 'ab-1', tattooNumber: 'TAG-C1', name: 'Ginger Snap', breed: 'Abyssinian', variety: 'Golden Agouti', sex: 'doe', dob: '2025-06-10', weightOz: 34, status: 'active', sireId: '', damId: 'c-4', inbreedingCoeff: 0.0, registrationNumber: 'REG-C101', gcNumber: '', location: 'Cage-C1', notes: 'Proven Abyssinian cavy doe. Very docile.',
    species: 'cavy',
    photos: ['https://images.unsplash.com/photo-1534840698914-99670ad49064?w=300'],
    legs: [],
    timeline: [
      { id: 't-c1-1', date: '2025-06-10', photo: 'https://images.unsplash.com/photo-1534840698914-99670ad49064?w=300', weightOz: 12, notes: 'Seeded birth entry.' }
    ]
  },
  {
    id: 'c-2', breederId: 'ab-1', tattooNumber: 'TAG-C2', name: 'Pepper Corn', breed: 'Abyssinian', variety: 'Black', sex: 'buck', dob: '2025-05-15', weightOz: 36, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-C102', gcNumber: 'GC-C01', location: 'Cage-C2', notes: 'Excellent rosette placement golden agouti buck.',
    species: 'cavy',
    photos: ['https://images.unsplash.com/photo-1534840698914-99670ad49064?w=300'],
    legs: [{ id: 'leg-c1', date: '2026-03-01', showName: 'Midwest Cavy Specialty', judge: 'Carla Devlin', award: 'Best of Variety', classSize: 10 }]
  },
  {
    id: 'c-3', breederId: 'ab-2', tattooNumber: 'TAG-C3', name: 'Teddy Bear', breed: 'Teddy', variety: 'White', sex: 'buck', dob: '2025-07-22', weightOz: 35, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: '', gcNumber: '', location: 'Cage-C3', notes: 'Plush coat Teddy buck.',
    species: 'cavy',
    photos: ['https://images.unsplash.com/photo-1534840698914-99670ad49064?w=300'],
    legs: []
  },
  {
    id: 'c-4', breederId: 'ab-1', tattooNumber: 'TAG-C4', name: 'Cinnamon Roll', breed: 'Abyssinian', variety: 'Golden Agouti', sex: 'doe', dob: '2024-04-12', weightOz: 36, status: 'pedigree_only', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: '', gcNumber: '', location: '', notes: 'Ancestor reference profile only.',
    species: 'cavy',
    photos: ['https://images.unsplash.com/photo-1534840698914-99670ad49064?w=300'],
    legs: []
  }
];

export const DEFAULT_BREEDINGS = [
  { id: 'b-1', breederId: 'ab-1', buckId: 'r-1', doeId: 'r-2', breedDate: '2026-05-01', palpateDate: '2026-05-13', palpateResult: true, nestBoxDate: '2026-05-28', kindleDate: '2026-06-01', status: 'kindled' },
  { id: 'b-2', breederId: 'ab-1', buckId: 'r-4', doeId: 'r-5', breedDate: '2026-06-01', palpateDate: '2026-06-13', palpateResult: null, nestBoxDate: '2026-06-29', kindleDate: '2026-07-02', status: 'bred' },
  { id: 'b-3', breederId: 'ab-1', buckId: 'r-6', doeId: 'r-7', breedDate: '2026-04-10', palpateDate: '2026-04-22', palpateResult: true, nestBoxDate: '2026-05-08', kindleDate: '2026-05-11', status: 'kindled' },
  { id: 'b-4', breederId: 'ab-1', buckId: 'r-8', doeId: 'r-9', breedDate: '2026-05-20', palpateDate: '2026-06-01', palpateResult: true, nestBoxDate: '2026-06-17', kindleDate: '2026-06-20', status: 'palpated_positive' },
  { id: 'b-rc1', breederId: 'ab-2', buckId: 'r-31', doeId: 'r-30', breedDate: '2026-02-10', palpateDate: '2026-02-22', palpateResult: true, nestBoxDate: '2026-03-09', kindleDate: '2026-03-15', status: 'kindled' },
  { id: 'b-rc2', breederId: 'ab-2', buckId: 'r-31', doeId: 'r-32', breedDate: '2026-06-05', palpateDate: '2026-06-17', palpateResult: null, nestBoxDate: '2026-07-02', kindleDate: '2026-07-06', status: 'bred' }
];

export const DEFAULT_LITTERS = [
  { id: 'l-1', breederId: 'ab-1', breedingId: 'b-1', kitsBornAlive: 6, kitsBornDead: 1, kitsWeaned: 5, notes: 'Thriving and active.' },
  { id: 'l-2', breederId: 'ab-1', breedingId: 'b-3', kitsBornAlive: 5, kitsBornDead: 0, kitsWeaned: 5, notes: 'Excellent weight gain, very healthy litter.' },
  { id: 'l-rc1', breederId: 'ab-2', breedingId: 'b-rc1', kitsBornAlive: 5, kitsBornDead: 0, kitsWeaned: 4, notes: 'Very sweet Mini Rex kits. Velvet and Prince are from this breeding.' }
];

export const DEFAULT_LEDGER = [
  { id: 'lt-1', breederId: 'ab-1', date: '2026-06-01', type: 'income', amount: 150.00, category: 'sale', rabbitId: 'r-3', notes: 'Sold Blue Pearl.' },
  { id: 'lt-2', breederId: 'ab-1', date: '2026-06-05', type: 'expense', amount: 45.50, category: 'feed', rabbitId: '', notes: 'Purchased two bags of alfalfa feed pellets.' },
  { id: 'lt-3', breederId: 'ab-1', date: '2026-05-10', type: 'expense', amount: 20.00, category: 'show_fee', rabbitId: '', notes: 'ARBA Spring Show registration fee.' },
  { id: 'lt-4', breederId: 'ab-1', date: '2026-05-12', type: 'income', amount: 80.00, category: 'sale', rabbitId: '', notes: 'Sold junior pet buck.' },
  { id: 'lt-5', breederId: 'ab-1', date: '2026-05-15', type: 'expense', amount: 35.00, category: 'equipment', rabbitId: '', notes: 'New automatic water nozzle system.' },
  { id: 'lt-6', breederId: 'ab-1', date: '2026-05-25', type: 'expense', amount: 12.00, category: 'medical', rabbitId: '', notes: 'VetRx respiratory treatment oil.' },
  { id: 'lt-7', breederId: 'ab-1', date: '2026-06-08', type: 'income', amount: 200.00, category: 'sale', rabbitId: '', notes: 'Sold proven senior show doe.' },
  { id: 'lt-rc1', breederId: 'ab-2', date: '2026-05-20', type: 'income', amount: 120.00, category: 'sale', rabbitId: '', notes: 'Sold a castor junior buck.' },
  { id: 'lt-rc2', breederId: 'ab-2', date: '2026-05-22', type: 'expense', amount: 35.00, category: 'feed', notes: 'Mini Rex feed bags.' },
  { id: 'lt-rc3', breederId: 'ab-2', date: '2026-06-01', type: 'expense', amount: 15.00, category: 'show_fee', notes: 'Rex Specialty registration fee.' }
];

export const DEFAULT_SHOWS = [
  { id: 'show-1', breederId: 'ab-1', name: 'ARBA National Convention 2026', date: '2026-10-24', location: 'Indianapolis, IN', notes: 'Largest national event. Target all senior bucks.', status: 'interested', notifyDays: 14 },
  { id: 'show-2', breederId: 'ab-1', name: 'West Coast Rabbit Classic', date: '2026-07-20', location: 'Stockton, CA', notes: 'Local regional show. Register 4 Holland Lops.', status: 'attending', notifyDays: 7 },
  { id: 'show-3', breederId: 'ab-1', name: 'Mid-Summer Rabbit Show', date: '2026-08-15', location: 'Columbus, OH', notes: 'Hobbyist meet and show.', status: 'not_attending', notifyDays: 7 },
  { id: 'show-rc1', breederId: 'ab-2', name: 'Midwest Mini Rex Specialty', date: '2026-07-12', location: 'Fort Wayne, IN', notes: 'Targeting Best Castor.', status: 'attending', notifyDays: 14 },
  { id: 'show-rc2', breederId: 'ab-2', name: 'Ohio State Rabbit Convention 2026', date: '2026-09-18', location: 'Columbus, OH', notes: 'Exhibiting Clover Shadow.', status: 'interested', notifyDays: 14 }
];

export const DEFAULT_CHORES = [
  { id: 'ch-1', breederId: 'ab-1', taskName: 'Alfalfa Pellet Feeding', completed: false },
  { id: 'ch-2', breederId: 'ab-1', taskName: 'Water System Pressure Check', completed: false },
  { id: 'ch-3', breederId: 'ab-1', taskName: 'Sweep Hutch Aisles', completed: false },
  { id: 'ch-4', breederId: 'ab-2', taskName: 'Castor Variety Grooming', completed: false },
  { id: 'ch-5', breederId: 'ab-2', taskName: 'Refill Alfalfa Feed Hay', completed: false }
];

export const DEFAULT_TRANSFERS = [
  {
    id: 'tx-1',
    breederId: 'ab-1',
    rabbitId: 'r-3',
    rabbitName: 'Blue Pearl',
    rabbitTattoo: 'L43-1',
    rabbitBreed: 'Holland Lop',
    buyerName: 'Alice Watson',
    buyerEmail: 'alice@watsonrabbitry.com',
    buyerPhone: '555-0199',
    price: 150.00,
    type: 'sale',
    date: '2026-06-05',
    certificateId: 'TX-8821-4902',
    hash: '8f7d9a10c9b5e3f412ad8e92f2c8d203a5b0eef2a95c4786d1a91e5c43d8f822'
  }
];

export const DEFAULT_SIGNATURES = [
  {
    id: 'sig-1',
    transferId: 'tx-1',
    sellerSignature: 'Jason Miller',
    buyerSignature: 'Alice Watson',
    signedAt: '2026-06-05T14:30:00Z',
    sellerSignatureType: 'typed',
    buyerSignatureType: 'typed'
  }
];

export const DEFAULT_MEDICAL = [
  { id: 'm-1', rabbitId: 'r-1', date: '2025-01-20', type: 'Vaccination', treatment: 'RHDV2 Vaccine', notes: 'First dose administered. No side effects.', cost: 15.00 },
  { id: 'm-2', rabbitId: 'r-1', date: '2025-03-15', type: 'Prevention', treatment: 'Ivermectin Dewormer', notes: 'Routine spring deworming.', cost: 5.00 },
  { id: 'm-3', rabbitId: 'r-2', date: '2025-02-18', type: 'Prevention', treatment: 'Broad-Spectrum Dewormer', notes: 'Routine pregnancy preventative check.', cost: 4.50 },
  { id: 'm-4', rabbitId: 'r-6', date: '2025-04-10', type: 'Treatment', treatment: 'Penicillin Injection', notes: 'Checked by vet, respiratory treatment.', cost: 25.00 },
  
  // Sarah Connors' Rabbits
  { id: 'm-5', rabbitId: 'r-30', date: '2025-06-15', type: 'Vaccination', treatment: 'RHDV2 Vaccine', notes: 'Immunization complete.', cost: 16.00 },
  { id: 'm-6', rabbitId: 'r-31', date: '2025-07-20', type: 'Prevention', treatment: 'Fenbendazole Dewormer', notes: 'Bi-annual parasite check.', cost: 6.00 },
  { id: 'm-7', rabbitId: 'r-33', date: '2026-04-10', type: 'Treatment', treatment: 'Terramycin Ophthalmic', notes: 'Cleared mild eye irritation.', cost: 12.50 }
];

export const DEFAULT_WEIGHTS = [
  { id: 'w-1', rabbitId: 'r-1', date: '2025-02-10', weightOz: 16, stage: 'Weaning' },
  { id: 'w-2', rabbitId: 'r-1', date: '2025-03-10', weightOz: 32, stage: '8 Weeks' },
  { id: 'w-3', rabbitId: 'r-1', date: '2025-04-10', weightOz: 48, stage: '12 Weeks' },
  { id: 'w-4', rabbitId: 'r-1', date: '2025-07-10', weightOz: 60, stage: 'Maturity' },
  
  { id: 'w-5', rabbitId: 'r-2', date: '2025-03-15', weightOz: 18, stage: 'Weaning' },
  { id: 'w-6', rabbitId: 'r-2', date: '2025-04-15', weightOz: 34, stage: '8 Weeks' },
  { id: 'w-7', rabbitId: 'r-2', date: '2025-05-15', weightOz: 50, stage: '12 Weeks' },
  { id: 'w-8', rabbitId: 'r-2', date: '2025-08-15', weightOz: 62, stage: 'Maturity' },

  // Jason Miller's other rabbits
  { id: 'w-9', rabbitId: 'r-3', date: '2026-04-01', weightOz: 14, stage: 'Weaning' },
  { id: 'w-10', rabbitId: 'r-3', date: '2026-05-01', weightOz: 28, stage: '8 Weeks' },
  { id: 'w-11', rabbitId: 'r-3', date: '2026-06-01', weightOz: 38, stage: '12 Weeks' },

  // Sarah Connors' Rabbits
  { id: 'w-30', rabbitId: 'r-30', date: '2025-06-10', weightOz: 15, stage: 'Weaning' },
  { id: 'w-31', rabbitId: 'r-30', date: '2025-09-10', weightOz: 40, stage: 'Maturity Check' },
  { id: 'w-32', rabbitId: 'r-30', date: '2026-01-10', weightOz: 58, stage: 'Breeding Pre-Audit' },

  { id: 'w-33', rabbitId: 'r-33', date: '2026-03-15', weightOz: 2.3, stage: 'Birth' },
  { id: 'w-34', rabbitId: 'r-33', date: '2026-04-15', weightOz: 12, stage: 'Weaning' },
  { id: 'w-35', rabbitId: 'r-33', date: '2026-05-15', weightOz: 24, stage: '8 Weeks' },
  { id: 'w-36', rabbitId: 'r-33', date: '2026-06-15', weightOz: 35, stage: '12 Weeks' }
];
