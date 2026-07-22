import { db } from '../db/registryDb';
import { uuidv7 } from '../db/uuid';

/**
 * Realistic Large Herd Data Seeder for RabbitryPedigree Pro (WarrenWise Pro)
 * Populates 250+ realistic show, utility, and commercial rabbits with full pedigree histories,
 * weights, gestation timelines, and show entries for offline stress testing.
 */

const BREEDS = [
  { name: 'Holland Lop', category: '4-Class', varieties: ['Sable Point', 'Broken Black', 'Tortoise', 'Blue'] },
  { name: 'Mini Rex', category: '4-Class', varieties: ['Castor', 'Black', 'Otter', 'Broken Opal'] },
  { name: 'Netherland Dwarf', category: '4-Class', varieties: ['REO', 'Siamese Smoke Pearl', 'Black Otter', 'Chestnut'] },
  { name: 'New Zealand', category: '6-Class', varieties: ['White', 'Red', 'Black', 'Blue'] },
  { name: 'Flemish Giant', category: '6-Class', varieties: ['Sandy', 'Fawn', 'Steel Gray', 'White'] },
  { name: 'Californian', category: '6-Class', varieties: ['Standard White/Black Points'] }
];

const RABBIT_PREFIXES = ['Grandview', 'Copper Ridge', 'Clover Barns', 'Valley Mark', 'Midnight', 'Sunnyside', 'Royal Meadow', 'Titan'];
const RABBIT_NAMES = ['Monarch', 'King', 'Queen', 'Thunder', 'Velvet', 'Smudge', 'Shadow', 'Duchess', 'Blaze', 'Sovereign', 'Jewel', 'Titan', 'Baron', 'Princess', 'Storm', 'Rex', 'Majesty', 'Sable'];

const PHOTOS_BY_BREED = {
  'Holland Lop': '/assets/holland_lop.png',
  'Mini Rex': '/assets/mini_rex.png',
  'Netherland Dwarf': '/assets/netherland_dwarf.png',
  'New Zealand': '/assets/new_zealand_white.png',
  'Flemish Giant': '/assets/flemish_giant.png',
  'Californian': '/assets/californian_rabbit.png'
};

export async function seedLargeHerdData(breederId = 'ab-1', targetCount = 250, onProgress = null) {
  console.log(`Starting Large Herd Data Seeding (${targetCount} rabbits) for breeder: ${breederId}`);
  
  const generatedRabbits = [];
  const generatedBreedings = [];
  const generatedLitters = [];
  const generatedLedger = [];
  const generatedShows = [];
  const generatedWeights = [];

  // Phase 1: Generate Foundation Sires & Dams (Generation 1 - Ancestors)
  const foundationCount = Math.floor(targetCount * 0.3); // 30% foundation stock
  for (let i = 0; i < foundationCount; i++) {
    const breedObj = BREEDS[i % BREEDS.length];
    const variety = breedObj.varieties[i % breedObj.varieties.length];
    const sex = i % 2 === 0 ? 'buck' : 'doe';
    const prefix = RABBIT_PREFIXES[i % RABBIT_PREFIXES.length];
    const name = `${prefix}'s ${RABBIT_NAMES[i % RABBIT_NAMES.length]} Gen1-${i + 1}`;
    const tattoo = `${sex === 'buck' ? 'B' : 'D'}1-${i + 100}`;
    
    // Age: 18-36 months
    const dobDaysAgo = 500 + (i * 5);
    const dob = new Date(Date.now() - dobDaysAgo * 86400000).toISOString().split('T')[0];
    
    const rabbit = {
      id: `r-gen1-${i + 1}`,
      breederId,
      name,
      breed: breedObj.name,
      variety,
      sex,
      dob,
      tattooNumber: tattoo,
      status: 'available',
      sireId: null,
      damId: null,
      weightOz: sex === 'buck' ? 56 + (i % 20) : 60 + (i % 20),
      notes: `Foundation ${sex} imported from national championship bloodlines.`,
      photos: [PHOTOS_BY_BREED[breedObj.name] || '/assets/mascot.png'],
      vectorClock: { 'seeder-device': 1 }
    };
    generatedRabbits.push(rabbit);

    if (onProgress && i % 10 === 0) onProgress(`Generating foundation stock: ${i}/${foundationCount}`);
  }

  // Separate sires & dams for breeding logic
  const foundationSires = generatedRabbits.filter(r => r.sex === 'buck');
  const foundationDams = generatedRabbits.filter(r => r.sex === 'doe');

  // Phase 2: Generate Offspring Stock (Generation 2 & 3 - Pedigree Linked)
  const remainingCount = targetCount - foundationCount;
  for (let i = 0; i < remainingCount; i++) {
    const sire = foundationSires[i % foundationSires.length];
    const dam = foundationDams[i % foundationDams.length];
    
    const breedObj = BREEDS.find(b => b.name === sire.breed) || BREEDS[0];
    const variety = breedObj.varieties[i % breedObj.varieties.length];
    const sex = i % 2 === 0 ? 'buck' : 'doe';
    const prefix = RABBIT_PREFIXES[(i + 3) % RABBIT_PREFIXES.length];
    const name = `${prefix}'s ${RABBIT_NAMES[(i + 4) % RABBIT_NAMES.length]} #${i + 1}`;
    const tattoo = `${sex === 'buck' ? 'B' : 'D'}2-${i + 200}`;
    
    // Age: 3-12 months
    const dobDaysAgo = 90 + (i * 2);
    const dob = new Date(Date.now() - dobDaysAgo * 86400000).toISOString().split('T')[0];
    
    const rabbit = {
      id: `r-gen2-${i + 1}`,
      breederId,
      name,
      breed: sire.breed,
      variety,
      sex,
      dob,
      tattooNumber: tattoo,
      status: 'available',
      sireId: sire.id,
      damId: dam.id,
      weightOz: 48 + (i % 16),
      notes: `Purebred offspring of ${sire.name} x ${dam.name}. Excellent body type.`,
      photos: [PHOTOS_BY_BREED[sire.breed] || '/assets/mascot.png'],
      vectorClock: { 'seeder-device': 1 }
    };
    generatedRabbits.push(rabbit);

    // Add growth weight history logs
    generatedWeights.push({
      id: `w-${i}-1`,
      breederId,
      rabbitId: rabbit.id,
      weightOz: 20,
      date: new Date(Date.now() - (dobDaysAgo - 30) * 86400000).toISOString().split('T')[0],
      notes: 'Weaning weight'
    });
    generatedWeights.push({
      id: `w-${i}-2`,
      breederId,
      rabbitId: rabbit.id,
      weightOz: rabbit.weightOz,
      date: new Date().toISOString().split('T')[0],
      notes: 'Current weight check'
    });

    if (onProgress && i % 20 === 0) onProgress(`Generating pedigreed herd: ${foundationCount + i}/${targetCount}`);
  }

  // Phase 3: Generate Breeding Timeline Records & Litters
  for (let i = 0; i < 30; i++) {
    const sire = foundationSires[i % foundationSires.length];
    const dam = foundationDams[i % foundationDams.length];
    const breedDate = new Date(Date.now() - (40 - i) * 86400000).toISOString().split('T')[0];
    
    const breedingId = `br-seed-${i + 1}`;
    generatedBreedings.push({
      id: breedingId,
      breederId,
      buckId: sire.id,
      doeId: dam.id,
      breedDate,
      status: i < 15 ? 'kindled' : 'palpated_positive',
      notes: `Targeting top show variety for ${sire.breed}`
    });

    if (i < 15) {
      generatedLitters.push({
        id: `lit-seed-${i + 1}`,
        breederId,
        breedingId,
        kindleDate: new Date(Date.now() - (9 - i) * 86400000).toISOString().split('T')[0],
        totalKits: 6 + (i % 3),
        liveKits: 5 + (i % 3),
        deadKits: 1,
        notes: 'Healthy litter with strong nest box growth.'
      });
    }
  }

  // Phase 4: Financial Ledger Entries
  for (let i = 0; i < 40; i++) {
    const isIncome = i % 2 === 0;
    generatedLedger.push({
      id: `led-seed-${i + 1}`,
      breederId,
      type: isIncome ? 'income' : 'expense',
      category: isIncome ? 'Rabbit Sales' : (i % 4 === 0 ? 'Feed & Hay' : 'Show Fees'),
      amount: isIncome ? 120 + (i * 10) : 45 + (i * 5),
      date: new Date(Date.now() - i * 7 * 86400000).toISOString().split('T')[0],
      description: isIncome ? 'Sale of show quality stock' : 'Bulk Timothy Hay & Feed Pellets'
    });
  }

  // Bulk Insert into Dexie Database
  if (onProgress) onProgress('Writing records to IndexedDB database...');
  await db.rabbits.bulkPut(generatedRabbits);
  await db.weights.bulkPut(generatedWeights);
  await db.breedings.bulkPut(generatedBreedings);
  await db.litters.bulkPut(generatedLitters);
  await db.ledger.bulkPut(generatedLedger);

  console.log(`Large Herd Seeding Complete! Successfully inserted ${generatedRabbits.length} rabbits, ${generatedWeights.length} weight logs, ${generatedBreedings.length} breeding chains.`);
  return {
    rabbitsCount: generatedRabbits.length,
    weightsCount: generatedWeights.length,
    breedingsCount: generatedBreedings.length,
    littersCount: generatedLitters.length,
    ledgerCount: generatedLedger.length
  };
}
