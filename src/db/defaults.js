export const DEFAULT_BREEDERS = [
  { id: 'ab-admin', name: 'Jason Mounts', username: 'jmounts', email: 'jasonmounts77@yahoo.com', rabbitryName: '', phone: '', role: 'owner', isSuperAdmin: true, status: 'active', password: 'JakylieRabbitry4388$$', subscriptionTier: 'pro', subscriptionLimit: 10000 },
  { id: 'ab-1', name: 'Jason Miller', username: 'jmiller', email: 'jason@grandview.com', rabbitryName: 'Grandview Rabbitry', phone: '555-0101', role: 'owner', status: 'active', password: 'password123', subscriptionTier: 'pro', subscriptionLimit: 1000 },
  { id: 'ab-2', name: 'Sarah Connors', username: 'sconnors', email: 'sarah@arba.org', rabbitryName: 'Clover Barns', phone: '555-0102', role: 'owner', status: 'active', password: 'arba_pass_2026', subscriptionTier: 'free', subscriptionLimit: 25 },
  { id: 'ab-3', name: 'Tommy Pickles', username: 'tpickles', email: 'tommy@barn.com', rabbitryName: 'Grandview Rabbitry', phone: '555-0103', role: 'assistant', employerEmail: 'jason@grandview.com', employerStatus: 'active', status: 'active', password: 'feed_the_buns', subscriptionTier: 'free', subscriptionLimit: 25 },
  { id: 'ab-4', name: 'Emily Watson', username: 'ewatson', email: 'emily@rabbitry.net', rabbitryName: 'Blue Meadows', phone: '555-0104', role: 'owner', status: 'active', password: 'passwordemily', subscriptionTier: 'free', subscriptionLimit: 25 },
  { id: 'ab-5', name: 'Arthur Pendragon', username: 'apendragon', email: 'arthur@camelot.com', rabbitryName: 'Excalibur Buns', phone: '555-0105', role: 'assistant', employerEmail: 'jason@grandview.com', employerStatus: 'pending', status: 'pending', password: 'merlinsrabbit', subscriptionTier: 'free', subscriptionLimit: 25 },
  { id: 'ab-6', name: 'Bruce Wayne', username: 'bwayne', email: 'bruce@batcave.org', rabbitryName: 'Wayne Manor Hutch', phone: '555-0106', role: 'owner', status: 'active', password: 'i_am_the_batman', subscriptionTier: 'pro', subscriptionLimit: 1000 },
  { id: 'ab-7', name: 'Sarah Jenkins', username: 'sjenkins', email: 'sarah.jenkins@farm.com', rabbitryName: 'Jenkins Giant Barn', phone: '555-0107', role: 'owner', status: 'active', password: 'password123', subscriptionTier: 'free', subscriptionLimit: 25 }
];

export const DEFAULT_RABBITS = [
  { 
    id: 'r-1', breederId: 'ab-1', tattooNumber: 'S01', name: 'Blue Thunder', breed: 'Holland Lop', variety: 'Blue', sex: 'buck', dob: '2025-01-10', weightOz: 60, status: 'active', sireId: 'r-4', damId: 'r-5', inbreedingCoeff: 0.0, registrationNumber: 'REG-12345', gcNumber: 'GC-5544', location: 'A-01', notes: 'Proven sire, extremely calm.',
    photos: ['/assets/holland_lop.png'],
    legs: [{ id: 'leg-1', date: '2025-09-15', showName: 'ARBA National Show', judge: 'Dr. John Miller', award: 'Best of Variety', classSize: 24 }]
  },
  { 
    id: 'r-2', breederId: 'ab-1', tattooNumber: 'D01', name: 'Clover Blossom', breed: 'Holland Lop', variety: 'Broken Blue', sex: 'doe', dob: '2025-02-15', weightOz: 62, status: 'active', sireId: 'r-4', damId: 'r-7', inbreedingCoeff: 0.0, registrationNumber: 'REG-12346', gcNumber: '', location: 'A-02', notes: 'Excellent mothering instincts.',
    photos: ['/assets/holland_lop.png'],
    legs: []
  },
  { 
    id: 'r-3', breederId: 'ab-1', tattooNumber: 'L43-1', name: 'Blue Pearl', breed: 'Holland Lop', variety: 'Blue', sex: 'doe', dob: '2026-03-01', weightOz: 38, status: 'active', sireId: 'r-1', damId: 'r-2', inbreedingCoeff: 0.125, registrationNumber: '', gcNumber: '', location: 'B-04', notes: 'Nice hutch variety with rich blue undercoat.',
    photos: ['/assets/holland_lop.png'],
    legs: []
  },
  {
    id: 'r-4', breederId: 'ab-1', tattooNumber: 'SR01', name: 'Storm Rider', breed: 'Holland Lop', variety: 'Blue', sex: 'buck', dob: '2024-03-10', weightOz: 61, status: 'active', sireId: 'r-8', damId: 'r-9', inbreedingCoeff: 0.0, registrationNumber: 'REG-11022', gcNumber: '', location: 'C-01', notes: 'Sired multiple champions.',
    photos: ['/assets/holland_lop.png'],
    legs: [{ id: 'leg-2', date: '2025-10-05', showName: 'West Coast Rabbit Classic', judge: 'Carla Sanchez', award: 'Best of Breed', classSize: 18 }]
  },
  {
    id: 'r-5', breederId: 'ab-1', tattooNumber: 'SD01', name: 'Sky Dancer', breed: 'Holland Lop', variety: 'Blue', sex: 'doe', dob: '2024-04-12', weightOz: 59, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: '', gcNumber: '', location: 'C-02', notes: 'Very gentle temperament.',
    photos: ['/assets/holland_lop.png'],
    legs: []
  },
  {
    id: 'r-6', breederId: 'ab-1', tattooNumber: 'FR01', name: 'Forest Ranger', breed: 'Holland Lop', variety: 'Broken Blue', sex: 'buck', dob: '2024-02-18', weightOz: 63, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-11023', gcNumber: '', location: 'C-03', notes: 'Broad shoulders, compact body.',
    photos: ['/assets/holland_lop.png'],
    legs: []
  },
  {
    id: 'r-7', breederId: 'ab-1', tattooNumber: 'MB01', name: 'Meadow Breeze', breed: 'Holland Lop', variety: 'Blue', sex: 'doe', dob: '2024-03-22', weightOz: 60, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: '', gcNumber: '', location: 'C-04', notes: 'Deep blue coat, great fur density.',
    photos: ['/assets/holland_lop.png'],
    legs: []
  },
  {
    id: 'r-8', breederId: 'ab-1', tattooNumber: 'ZB01', name: 'Zephyr Buck', breed: 'Holland Lop', variety: 'Blue', sex: 'buck', dob: '2023-01-05', weightOz: 62, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-9988', gcNumber: 'GC-2211', location: 'D-01', notes: 'Grand Champion line progenitor.',
    photos: ['/assets/holland_lop.png'],
    legs: [{ id: 'leg-3', date: '2024-11-20', showName: 'Cascade Winter Show', judge: 'Robert Devlin', award: 'Best In Show', classSize: 42 }]
  },
  {
    id: 'r-9', breederId: 'ab-1', tattooNumber: 'OD01', name: 'Orchard Doe', breed: 'Holland Lop', variety: 'Blue', sex: 'doe', dob: '2023-02-14', weightOz: 61, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-9989', gcNumber: '', location: 'D-02', notes: 'High fertility history.',
    photos: ['/assets/holland_lop.png'],
    legs: []
  },
  { 
    id: 'r-10', breederId: 'ab-7', tattooNumber: 'FG01', name: 'Titan Rex', breed: 'Flemish Giant', variety: 'Sandy', sex: 'buck', dob: '2025-03-01', weightOz: 240, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-FG991', gcNumber: 'GC-FG101', location: 'Cage-G1', notes: 'Massive sandy buck, ARBA show winner.',
    photos: ['/assets/flemish_giant.png'],
    legs: [{ id: 'leg-fg1', date: '2025-11-10', showName: 'National Flemish Giant Show', judge: 'Reginald Vance', award: 'Best of Breed', classSize: 32 }]
  },
  { 
    id: 'r-11', breederId: 'ab-7', tattooNumber: 'FG02', name: 'Queen Freya', breed: 'Flemish Giant', variety: 'Steel', sex: 'doe', dob: '2025-04-12', weightOz: 256, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-FG992', gcNumber: '', location: 'Cage-G2', notes: 'Extremely fertile steel doe. Excellent size.',
    photos: ['/assets/flemish_giant.png'],
    legs: []
  },
  { 
    id: 'r-12', breederId: 'ab-7', tattooNumber: 'FG-L1', name: 'Freya Junior', breed: 'Flemish Giant', variety: 'Sandy', sex: 'doe', dob: '2026-04-05', weightOz: 112, status: 'active', sireId: 'r-10', damId: 'r-11', inbreedingCoeff: 0.0, registrationNumber: '', gcNumber: '', location: 'Cage-G3', notes: 'Junior doe showing excellent bone development.',
    photos: ['/assets/flemish_giant.png'],
    legs: []
  },
  { 
    id: 'r-20', breederId: 'ab-6', tattooNumber: 'BAT01', name: 'Midnight Knight', breed: 'Netherland Dwarf', variety: 'Black', sex: 'buck', dob: '2025-05-20', weightOz: 36, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-ND441', gcNumber: 'GC-BAT1', location: 'Cave-1', notes: 'Compact buck, very dark glossy coat.',
    photos: ['/assets/netherland_dwarf.png'],
    legs: [{ id: 'leg-nd1', date: '2026-02-15', showName: 'Gotham Rabbit Classic', judge: 'Harvey Dent', award: 'Best In Show', classSize: 15 }]
  },
  { 
    id: 'r-21', breederId: 'ab-6', tattooNumber: 'CAT01', name: 'Selina Doe', breed: 'Netherland Dwarf', variety: 'Sable Point', sex: 'doe', dob: '2025-06-14', weightOz: 38, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-ND442', gcNumber: '', location: 'Cave-2', notes: 'Sleek, highly active sable point doe.',
    photos: ['/assets/netherland_dwarf.png'],
    legs: []
  },
  { 
    id: 'r-22', breederId: 'ab-6', tattooNumber: 'BAT02', name: 'Bat-signalBEW', breed: 'Netherland Dwarf', variety: 'Blue Eyed White', sex: 'doe', dob: '2025-08-01', weightOz: 34, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-ND443', gcNumber: '', location: 'Cave-3', notes: 'Striking blue eyed white doe.',
    photos: ['/assets/netherland_dwarf.png'],
    legs: []
  },
  { 
    id: 'r-23', breederId: 'ab-6', tattooNumber: 'BAT03', name: 'Robin BEW', breed: 'Netherland Dwarf', variety: 'Blue Eyed White', sex: 'buck', dob: '2026-02-10', weightOz: 32, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: '', gcNumber: '', location: 'Cave-4', notes: 'Vigorous junior BEW buck.',
    photos: ['/assets/netherland_dwarf.png'],
    legs: []
  },
  { 
    id: 'r-24', breederId: 'ab-6', tattooNumber: 'BAT-L1', name: 'Bat-girl ND', breed: 'Netherland Dwarf', variety: 'Black', sex: 'doe', dob: '2026-05-01', weightOz: 16, status: 'active', sireId: 'r-20', damId: 'r-21', inbreedingCoeff: 0.0, registrationNumber: '', gcNumber: '', location: 'Cave-5', notes: 'Junior black doe. High potential.',
    photos: ['/assets/netherland_dwarf.png'],
    legs: []
  },
  { 
    id: 'r-13', breederId: 'ab-7', tattooNumber: 'FG03', name: 'Thor Sandy', breed: 'Flemish Giant', variety: 'Sandy', sex: 'buck', dob: '2025-08-20', weightOz: 232, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-FG993', gcNumber: '', location: 'Cage-G4', notes: 'Strong sand variety buck.',
    photos: ['/assets/flemish_giant.png'],
    legs: []
  },
  { 
    id: 'r-14', breederId: 'ab-7', tattooNumber: 'FG04', name: 'Loki Steel', breed: 'Flemish Giant', variety: 'Steel', sex: 'doe', dob: '2025-09-10', weightOz: 248, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-FG994', gcNumber: '', location: 'Cage-G5', notes: 'Sleek steel Flemish Giant doe.',
    photos: ['/assets/flemish_giant.png'],
    legs: []
  },
  { 
    id: 'r-30', breederId: 'ab-2', tattooNumber: 'CL01', name: 'Clover Opal', breed: 'Mini Rex', variety: 'Opal', sex: 'doe', dob: '2025-05-10', weightOz: 58, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-MR101', gcNumber: '', location: 'C-10', notes: 'Very soft opal coat.',
    photos: ['/assets/mini_rex.png'],
    legs: []
  },
  { 
    id: 'r-31', breederId: 'ab-2', tattooNumber: 'CL02', name: 'Castor King', breed: 'Mini Rex', variety: 'Castor', sex: 'buck', dob: '2025-02-12', weightOz: 60, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-MR102', gcNumber: 'GC-MR01', location: 'C-11', notes: 'Grand Champion lineage castor buck.',
    photos: ['/assets/mini_rex.png'],
    legs: [{ id: 'leg-mr1', date: '2025-11-20', showName: 'Midwest Mini Rex Specialty', judge: 'Adam West', award: 'Best of Variety', classSize: 15 }]
  },
  { 
    id: 'r-32', breederId: 'ab-2', tattooNumber: 'CL03', name: 'Clover Shadow', breed: 'Mini Rex', variety: 'Black', sex: 'doe', dob: '2025-06-01', weightOz: 56, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: '', gcNumber: '', location: 'C-12', notes: 'Jet black plush coat.',
    photos: ['/assets/mini_rex.png'],
    legs: []
  },
  { 
    id: 'r-33', breederId: 'ab-2', tattooNumber: 'CL-L1', name: 'Clover Velvet', breed: 'Mini Rex', variety: 'Castor', sex: 'doe', dob: '2026-03-15', weightOz: 35, status: 'active', sireId: 'r-31', damId: 'r-30', inbreedingCoeff: 0.0, registrationNumber: '', gcNumber: '', location: 'C-13', notes: 'Promising castor junior doe.',
    photos: ['/assets/mini_rex.png'],
    legs: []
  },
  { 
    id: 'r-34', breederId: 'ab-2', tattooNumber: 'CL-L2', name: 'Clover Prince', breed: 'Mini Rex', variety: 'Castor', sex: 'buck', dob: '2026-03-15', weightOz: 36, status: 'active', sireId: 'r-31', damId: 'r-30', inbreedingCoeff: 0.0, registrationNumber: '', gcNumber: '', location: 'C-14', notes: 'Energetic castor junior buck.',
    photos: ['/assets/mini_rex.png'],
    legs: []
  },
  { 
    id: 'r-40', breederId: 'ab-4', tattooNumber: 'NZ01', name: 'Blue Cyclone', breed: 'New Zealand', variety: 'Blue', sex: 'buck', dob: '2025-01-15', weightOz: 152, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-NZ101', gcNumber: 'GC-NZ01', location: 'Cage-NZ1', notes: 'Stunning New Zealand Blue buck, massive build.',
    photos: ['/assets/new_zealand_blue.png'],
    legs: [{ id: 'leg-nz1', date: '2025-11-20', showName: 'National New Zealand Rabbit Show', judge: 'Arthur Pendelton', award: 'Best of Variety', classSize: 22 }]
  },
  { 
    id: 'r-41', breederId: 'ab-4', tattooNumber: 'NZ02', name: 'Blue Sapphire', breed: 'New Zealand', variety: 'Blue', sex: 'doe', dob: '2025-02-20', weightOz: 168, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-NZ102', gcNumber: '', location: 'Cage-NZ2', notes: 'Proven New Zealand Blue doe, ideal type.',
    photos: ['/assets/new_zealand_blue.png'],
    legs: []
  },
  { 
    id: 'r-42', breederId: 'ab-4', tattooNumber: 'NZ-L1', name: 'Blue Mist', breed: 'New Zealand', variety: 'Blue', sex: 'doe', dob: '2026-03-05', weightOz: 104, status: 'active', sireId: 'r-40', damId: 'r-41', inbreedingCoeff: 0.0, registrationNumber: '', gcNumber: '', location: 'Cage-NZ3', notes: 'Promising junior Blue doe.',
    photos: ['/assets/new_zealand_blue.png'],
    legs: []
  }
];

export const DEFAULT_BREEDINGS = [
  { id: 'b-1', breederId: 'ab-1', buckId: 'r-1', doeId: 'r-2', breedDate: '2026-05-01', palpateDate: '2026-05-13', palpateResult: true, nestBoxDate: '2026-05-28', kindleDate: '2026-06-01', status: 'kindled' },
  { id: 'b-2', breederId: 'ab-1', buckId: 'r-4', doeId: 'r-5', breedDate: '2026-06-01', palpateDate: '2026-06-13', palpateResult: null, nestBoxDate: '2026-06-29', kindleDate: '2026-07-02', status: 'bred' },
  { id: 'b-3', breederId: 'ab-1', buckId: 'r-6', doeId: 'r-7', breedDate: '2026-04-10', palpateDate: '2026-04-22', palpateResult: true, nestBoxDate: '2026-05-08', kindleDate: '2026-05-11', status: 'kindled' },
  { id: 'b-4', breederId: 'ab-1', buckId: 'r-8', doeId: 'r-9', breedDate: '2026-05-20', palpateDate: '2026-06-01', palpateResult: true, nestBoxDate: '2026-06-17', kindleDate: '2026-06-20', status: 'palpated_positive' },
  { id: 'b-fg1', breederId: 'ab-7', buckId: 'r-10', doeId: 'r-11', breedDate: '2026-03-01', palpateDate: '2026-03-13', palpateResult: true, nestBoxDate: '2026-03-28', kindleDate: '2026-04-05', status: 'kindled' },
  { id: 'b-nd1', breederId: 'ab-6', buckId: 'r-20', doeId: 'r-21', breedDate: '2026-05-10', palpateDate: '2026-05-22', palpateResult: true, nestBoxDate: '2026-06-07', kindleDate: null, status: 'palpated_positive' },
  { id: 'b-rc1', breederId: 'ab-2', buckId: 'r-31', doeId: 'r-30', breedDate: '2026-02-10', palpateDate: '2026-02-22', palpateResult: true, nestBoxDate: '2026-03-09', kindleDate: '2026-03-15', status: 'kindled' },
  { id: 'b-rc2', breederId: 'ab-2', buckId: 'r-31', doeId: 'r-32', breedDate: '2026-06-05', palpateDate: '2026-06-17', palpateResult: null, nestBoxDate: '2026-07-02', kindleDate: '2026-07-06', status: 'bred' },
  { id: 'b-nd2', breederId: 'ab-6', buckId: 'r-20', doeId: 'r-21', breedDate: '2026-04-01', palpateDate: '2026-04-13', palpateResult: true, nestBoxDate: '2026-04-28', kindleDate: '2026-05-01', status: 'kindled' },
  { id: 'b-fg2', breederId: 'ab-7', buckId: 'r-13', doeId: 'r-14', breedDate: '2026-05-12', palpateDate: '2026-05-24', palpateResult: true, nestBoxDate: '2026-06-08', kindleDate: '2026-06-11', status: 'kindled' },
  { id: 'b-nz1', breederId: 'ab-4', buckId: 'r-40', doeId: 'r-41', breedDate: '2026-05-01', palpateDate: '2026-05-13', palpateResult: true, nestBoxDate: '2026-05-28', kindleDate: '2026-06-01', status: 'kindled' }
];

export const DEFAULT_LITTERS = [
  { id: 'l-1', breederId: 'ab-1', breedingId: 'b-1', kitsBornAlive: 6, kitsBornDead: 1, kitsWeaned: 5, notes: 'Thriving and active.' },
  { id: 'l-2', breederId: 'ab-1', breedingId: 'b-3', kitsBornAlive: 5, kitsBornDead: 0, kitsWeaned: 5, notes: 'Excellent weight gain, very healthy litter.' },
  { id: 'l-fg1', breederId: 'ab-7', breedingId: 'b-fg1', kitsBornAlive: 8, kitsBornDead: 1, kitsWeaned: 7, notes: 'Flemish Giant litter grew extremely fast. Freya junior is from this litter.' },
  { id: 'l-rc1', breederId: 'ab-2', breedingId: 'b-rc1', kitsBornAlive: 5, kitsBornDead: 0, kitsWeaned: 4, notes: 'Very sweet Mini Rex kits. Velvet and Prince are from this breeding.' },
  { id: 'l-nd2', breederId: 'ab-6', breedingId: 'b-nd2', kitsBornAlive: 3, kitsBornDead: 1, kitsWeaned: 2, notes: 'Bat-girl ND is from this litter.' },
  { id: 'l-fg2', breederId: 'ab-7', breedingId: 'b-fg2', kitsBornAlive: 7, kitsBornDead: 1, kitsWeaned: 6, notes: 'Flemish Giant sandy and steel kits growing fast.' },
  { id: 'l-nz1', breederId: 'ab-4', breedingId: 'b-nz1', kitsBornAlive: 8, kitsBornDead: 0, kitsWeaned: 8, notes: 'New Zealand Blue litter. Growing extremely fast and healthy.' }
];

export const DEFAULT_LEDGER = [
  { id: 'lt-1', breederId: 'ab-1', date: '2026-06-01', type: 'income', amount: 150.00, category: 'sale', rabbitId: 'r-3', notes: 'Sold Blue Pearl.' },
  { id: 'lt-2', breederId: 'ab-1', date: '2026-06-05', type: 'expense', amount: 45.50, category: 'feed', rabbitId: '', notes: 'Purchased two bags of alfalfa feed pellets.' },
  { id: 'lt-3', breederId: 'ab-1', date: '2026-05-10', type: 'expense', amount: 20.00, category: 'show_fee', rabbitId: '', notes: 'ARBA Spring Show registration fee.' },
  { id: 'lt-4', breederId: 'ab-1', date: '2026-05-12', type: 'income', amount: 80.00, category: 'sale', rabbitId: '', notes: 'Sold junior pet buck.' },
  { id: 'lt-5', breederId: 'ab-1', date: '2026-05-15', type: 'expense', amount: 35.00, category: 'equipment', rabbitId: '', notes: 'New automatic water nozzle system.' },
  { id: 'lt-6', breederId: 'ab-1', date: '2026-05-25', type: 'expense', amount: 12.00, category: 'medical', rabbitId: '', notes: 'VetRx respiratory treatment oil.' },
  { id: 'lt-7', breederId: 'ab-1', date: '2026-06-08', type: 'income', amount: 200.00, category: 'sale', rabbitId: '', notes: 'Sold proven senior show doe.' },
  { id: 'lt-fg1', breederId: 'ab-7', date: '2026-05-15', type: 'income', amount: 150.00, category: 'sale', rabbitId: '', notes: 'Sold Flemish Giant junior buck.' },
  { id: 'lt-fg2', breederId: 'ab-7', date: '2026-06-02', type: 'expense', amount: 85.00, category: 'feed', rabbitId: '', notes: 'Bulk purchase of high-protein giant breed feed.' },
  { id: 'lt-fg3', breederId: 'ab-7', date: '2026-06-12', type: 'income', amount: 100.00, category: 'other', rabbitId: '', notes: 'ARBA Flemish Giant Best of Breed Cash Award.' },
  { id: 'lt-bat1', breederId: 'ab-6', date: '2026-05-28', type: 'expense', amount: 300.00, category: 'equipment', rabbitId: '', notes: 'Cave-optimized LED hutch lighting.' },
  { id: 'lt-bat2', breederId: 'ab-6', date: '2026-06-10', type: 'income', amount: 400.00, category: 'sale', rabbitId: '', notes: 'Sold champion lineage Netherland Dwarf buck.' },
  { id: 'lt-rc1', breederId: 'ab-2', date: '2026-05-20', type: 'income', amount: 120.00, category: 'sale', rabbitId: '', notes: 'Sold a castor junior buck.' },
  { id: 'lt-rc2', breederId: 'ab-2', date: '2026-05-22', type: 'expense', amount: 35.00, category: 'feed', notes: 'Mini Rex feed bags.' },
  { id: 'lt-rc3', breederId: 'ab-2', date: '2026-06-01', type: 'expense', amount: 15.00, category: 'show_fee', notes: 'Rex Specialty registration fee.' },
  { id: 'lt-bat3', breederId: 'ab-6', date: '2026-05-05', type: 'income', amount: 250.00, category: 'sale', notes: 'Sold BEW junior buck.' },
  { id: 'lt-bat4', breederId: 'ab-6', date: '2026-06-02', type: 'expense', amount: 65.00, category: 'feed', notes: 'Netherland Dwarf special pellets.' },
  { id: 'lt-fg4', breederId: 'ab-7', date: '2026-05-18', type: 'expense', amount: 45.00, category: 'medical', notes: 'Nail clippers & ear mite preventative drops.' },
  { id: 'lt-fg5', breederId: 'ab-7', date: '2026-06-10', type: 'income', amount: 180.00, category: 'sale', notes: 'Sold steel Flemish giant junior doe.' },
  { id: 'lt-nz1', breederId: 'ab-4', date: '2026-06-15', type: 'income', amount: 120.00, category: 'sale', rabbitId: 'r-42', notes: 'Sold junior New Zealand Blue doe.' },
  { id: 'lt-nz2', breederId: 'ab-4', date: '2026-06-02', type: 'expense', amount: 50.00, category: 'feed', notes: 'Premium feed for New Zealand herd.' }
];

export const DEFAULT_SHOWS = [
  { id: 'show-1', breederId: 'ab-1', name: 'ARBA National Convention 2026', date: '2026-10-24', location: 'Indianapolis, IN', notes: 'Largest national event. Target all senior bucks.', status: 'interested', notifyDays: 14 },
  { id: 'show-2', breederId: 'ab-1', name: 'West Coast Rabbit Classic', date: '2026-07-20', location: 'Stockton, CA', notes: 'Local regional show. Register 4 Holland Lops.', status: 'attending', notifyDays: 7 },
  { id: 'show-3', breederId: 'ab-1', name: 'Mid-Summer Rabbit Show', date: '2026-08-15', location: 'Columbus, OH', notes: 'Hobbyist meet and show.', status: 'not_attending', notifyDays: 7 },
  { id: 'show-fg1', breederId: 'ab-7', name: 'ARBA National Flemish Giant Show', date: '2026-07-10', location: 'Indianapolis, IN', notes: 'Entering Titan Rex.', status: 'attending', notifyDays: 14 },
  { id: 'show-fg2', breederId: 'ab-7', name: 'Summer Giant Breeds Specialty', date: '2026-08-05', location: 'Lansing, MI', notes: 'Check weights for Freya Junior.', status: 'interested', notifyDays: 14 },
  { id: 'show-bat1', breederId: 'ab-6', name: 'Gotham Rabbit Classic', date: '2026-07-15', location: 'Gotham City', notes: 'Midnight Knight defending title.', status: 'attending', notifyDays: 7 },
  { id: 'show-rc1', breederId: 'ab-2', name: 'Midwest Mini Rex Specialty', date: '2026-07-12', location: 'Fort Wayne, IN', notes: 'Targeting Best Castor.', status: 'attending', notifyDays: 14 },
  { id: 'show-rc2', breederId: 'ab-2', name: 'Ohio State Rabbit Convention 2026', date: '2026-09-18', location: 'Columbus, OH', notes: 'Exhibiting Clover Shadow.', status: 'interested', notifyDays: 14 },
  { id: 'show-bat2', breederId: 'ab-6', name: 'Metropolis Dwarf Showdown', date: '2026-08-20', location: 'Metropolis Coliseum', notes: 'Entering Robin BEW in junior class.', status: 'interested', notifyDays: 14 },
  { id: 'show-fg3', breederId: 'ab-7', name: 'Great Lakes Giant Breeders Fair', date: '2026-09-02', location: 'Grand Rapids, MI', notes: 'Entering Thor Sandy.', status: 'attending', notifyDays: 14 }
];

export const DEFAULT_CHORES = [
  { id: 'ch-1', breederId: 'ab-1', taskName: 'Alfalfa Pellet Feeding', completed: false },
  { id: 'ch-2', breederId: 'ab-1', taskName: 'Water System Pressure Check', completed: false },
  { id: 'ch-3', breederId: 'ab-1', taskName: 'Sweep Hutch Aisles', completed: false },
  { id: 'ch-4', breederId: 'ab-2', taskName: 'Castor Variety Grooming', completed: false },
  { id: 'ch-5', breederId: 'ab-2', taskName: 'Refill Alfalfa Feed Hay', completed: false },
  { id: 'ch-6', breederId: 'ab-6', taskName: 'BEW Nestbox Inspections', completed: false },
  { id: 'ch-7', breederId: 'ab-6', taskName: 'Clean Dwarf Hutch Cage Trays', completed: false },
  { id: 'ch-8', breederId: 'ab-7', taskName: 'Flemish Giant Weight Logs', completed: false },
  { id: 'ch-9', breederId: 'ab-7', taskName: 'Clean Giant Breeding Enclosures', completed: false }
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
  },
  {
    id: 'tx-2',
    breederId: 'ab-7',
    rabbitId: 'r-fg2',
    rabbitName: 'Titan Freya',
    rabbitTattoo: 'FG-02',
    rabbitBreed: 'Flemish Giant',
    buyerName: 'Bob Vance',
    buyerEmail: 'bob@vancerefrigeration.com',
    buyerPhone: '555-0144',
    price: 250.00,
    type: 'sale',
    date: '2026-06-12',
    certificateId: 'TX-1049-7721',
    hash: 'a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3'
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
  },
  {
    id: 'sig-2',
    transferId: 'tx-2',
    sellerSignature: 'Sarah Jenkins',
    buyerSignature: 'Bob Vance',
    signedAt: '2026-06-12T10:15:00Z',
    sellerSignatureType: 'typed',
    buyerSignatureType: 'typed'
  }
];

export const DEFAULT_MEDICAL = [
  { id: 'm-1', rabbitId: 'r-1', date: '2025-01-20', type: 'Vaccination', treatment: 'RHDV2 Vaccine', notes: 'First dose administered. No side effects.', cost: 15.00 },
  { id: 'm-2', rabbitId: 'r-1', date: '2025-03-15', type: 'Prevention', treatment: 'Ivermectin Dewormer', notes: 'Routine spring deworming.', cost: 5.00 },
  { id: 'm-3', rabbitId: 'r-2', date: '2025-02-18', type: 'Prevention', treatment: 'Broad-Spectrum Dewormer', notes: 'Routine pregnancy preventative check.', cost: 4.50 },
  { id: 'm-4', rabbitId: 'r-6', date: '2025-04-10', type: 'Treatment', treatment: 'Penicillin Injection', notes: 'Checked by vet, respiratory treatment.', cost: 25.00 }
];

export const DEFAULT_WEIGHTS = [
  { id: 'w-1', rabbitId: 'r-1', date: '2025-02-10', weightOz: 16, stage: 'Weaning' },
  { id: 'w-2', rabbitId: 'r-1', date: '2025-03-10', weightOz: 32, stage: '8 Weeks' },
  { id: 'w-3', rabbitId: 'r-1', date: '2025-04-10', weightOz: 48, stage: '12 Weeks' },
  { id: 'w-4', rabbitId: 'r-1', date: '2025-07-10', weightOz: 60, stage: 'Maturity' },
  
  { id: 'w-5', rabbitId: 'r-2', date: '2025-03-15', weightOz: 18, stage: 'Weaning' },
  { id: 'w-6', rabbitId: 'r-2', date: '2025-04-15', weightOz: 34, stage: '8 Weeks' },
  { id: 'w-7', rabbitId: 'r-2', date: '2025-05-15', weightOz: 50, stage: '12 Weeks' },
  { id: 'w-8', rabbitId: 'r-2', date: '2025-08-15', weightOz: 62, stage: 'Maturity' }
];
