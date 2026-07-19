/**
 * ARBA Genetic Locus Combinatorial Crossing Engine
 * Models Loci: A, B, C, D, E to predict variety distributions.
 */

// Allele dominance chains
const DOMINANCE = {
  A: ['A', 'at', 'a'],
  B: ['B', 'b'],
  C: ['C', 'cchd', 'cchl', 'ch', 'c'],
  D: ['D', 'd'],
  E: ['Es', 'E', 'e']
};

/**
 * Infer possible genotypes for a rabbit based on its standard breed and color variety.
 * Returns an array of possible genotypes, where each genotype is:
 * { A: ['A', 'a'], B: ['B', 'B'], ... }
 */
export function inferGenotypeFromVariety(variety, breed) {
  const v = (variety || '').toLowerCase().trim();

  // Defaults (Wild-type Castor/Chestnut)
  const base = {
    A: ['A', 'a'],
    B: ['B', 'b'],
    C: ['C', 'c'],
    D: ['D', 'd'],
    E: ['E', 'e']
  };

  if (v.includes('rew') || v.includes('ruby eyed white') || v.includes('ruby-eyed')) {
    base.C = ['c', 'c'];
  } else if (v.includes('pointed') || v.includes('himalayan')) {
    base.C = ['ch', 'c'];
  } else if (v.includes('sable point')) {
    base.A = ['a', 'a'];
    base.C = ['cchl', 'c'];
    base.E = ['e', 'e'];
  } else if (v.includes('siamese sable') || v.includes('sable')) {
    base.A = ['a', 'a'];
    base.C = ['cchl', 'c'];
  } else if (v.includes('chinchilla')) {
    base.A = ['A', 'a'];
    base.C = ['cchd', 'c'];
  } else if (v.includes('tortoise') || v.includes('tort')) {
    base.A = ['a', 'a'];
    base.E = ['e', 'e'];
    if (v.includes('blue')) {
      base.D = ['d', 'd'];
    } else if (v.includes('chocolate')) {
      base.B = ['b', 'b'];
    } else if (v.includes('lilac')) {
      base.B = ['b', 'b'];
      base.D = ['d', 'd'];
    }
  } else if (v.includes('orange') || v.includes('red') || v.includes('fawn')) {
    base.A = ['A', 'a'];
    base.E = ['e', 'e'];
  } else if (v.includes('opal')) {
    base.A = ['A', 'a'];
    base.D = ['d', 'd'];
  } else if (v.includes('lynx')) {
    base.A = ['A', 'a'];
    base.B = ['b', 'b'];
    base.D = ['d', 'd'];
  } else if (v.includes('cinnamon') || v.includes('amber')) {
    base.A = ['A', 'a'];
    base.B = ['b', 'b'];
  } else if (v.includes('lilac')) {
    base.A = ['a', 'a'];
    base.B = ['b', 'b'];
    base.D = ['d', 'd'];
  } else if (v.includes('chocolate')) {
    base.A = ['a', 'a'];
    base.B = ['b', 'b'];
  } else if (v.includes('blue')) {
    base.A = ['a', 'a'];
    base.D = ['d', 'd'];
  } else if (v.includes('black')) {
    base.A = ['a', 'a'];
  } else if (v.includes('otter') || v.includes('fox') || v.includes('marten')) {
    base.A = ['at', 'a'];
    if (v.includes('blue')) {
      base.D = ['d', 'd'];
    } else if (v.includes('chocolate')) {
      base.B = ['b', 'b'];
    } else if (v.includes('lilac')) {
      base.B = ['b', 'b'];
      base.D = ['d', 'd'];
    }
  }

  return base;
}

/**
 * Determine the visual variety name (phenotype) from a set of crossed alleles.
 * E.g., { A: ['A', 'a'], B: ['B', 'b'], ... } -> "Chestnut / Castor"
 */
export function determineVarietyFromGenotype(g) {
  // Extract dominant alleles
  const getDominant = (locus) => {
    const alleles = g[locus];
    const order = DOMINANCE[locus];
    for (const a of order) {
      if (alleles.includes(a)) return a;
    }
    return alleles[0];
  };

  const a = getDominant('A');
  const b = getDominant('B');
  const c = getDominant('C');
  const d = getDominant('D');
  const e = getDominant('E');

  // REW Epistasis (c/c completely masks everything else)
  if (c === 'c') {
    return 'Ruby-Eyed White (REW)';
  }

  // Pointed/Himalayan Locus
  if (c === 'ch') {
    let suffix = 'Black';
    if (b === 'b' && d === 'd') suffix = 'Lilac';
    else if (b === 'b') suffix = 'Chocolate';
    else if (d === 'd') suffix = 'Blue';
    return `Pointed White (${suffix})`;
  }

  // Sable Point / Siamese Sable
  if (c === 'cchl') {
    if (e === 'e') {
      return 'Sable Point';
    }
    let suffix = 'Black';
    if (b === 'b' && d === 'd') suffix = 'Lilac';
    else if (b === 'b') suffix = 'Chocolate';
    else if (d === 'd') suffix = 'Blue';
    return `Siamese Sable (${suffix})`;
  }

  // Non-extension (e/e) group
  if (e === 'e') {
    if (a === 'A') {
      if (d === 'd') return 'Opal / Dilute Orange';
      return 'Orange / Red';
    } else if (a === 'at') {
      return 'Orange Otter';
    } else {
      // Self + non-extension = Tortoise
      if (b === 'b' && d === 'd') return 'Tortoise (Lilac)';
      if (b === 'b') return 'Tortoise (Chocolate)';
      if (d === 'd') return 'Tortoise (Blue)';
      return 'Tortoise (Black)';
    }
  }

  // Agouti Group
  if (a === 'A') {
    if (c === 'cchd') {
      if (d === 'd') return 'Squirrel (Blue Chinchilla)';
      return 'Chinchilla';
    }
    if (b === 'b' && d === 'd') return 'Lynx';
    if (b === 'b') return 'Cinnamon / Amber';
    if (d === 'd') return 'Opal';
    return 'Castor / Chestnut / Agouti';
  }

  // Tan Pattern Group
  if (a === 'at') {
    let color = 'Black';
    if (b === 'b' && d === 'd') color = 'Lilac';
    else if (b === 'b') color = 'Chocolate';
    else if (d === 'd') color = 'Blue';
    
    if (c === 'cchd' || c === 'cchl') {
      return `${color} Silver Marten`;
    }
    return `${color} Otter`;
  }

  // Self Group (aa)
  if (b === 'b' && d === 'd') return 'Lilac';
  if (b === 'b') return 'Chocolate';
  if (d === 'd') return 'Blue';
  return 'Black';
}

/**
 * Cross alleles of a single locus to find all combinations and frequencies.
 */
function crossLocus(alleles1, alleles2) {
  const results = {};
  for (const a1 of alleles1) {
    for (const a2 of alleles2) {
      // Sort alleles by dominance order to keep representations identical
      const sorted = [a1, a2].sort((x, y) => {
        const order = DOMINANCE; // We don't need full locus context since alleles are unique prefixes
        return 0; // We can sort when formatting
      });
      // Just keep them as simple pair array
      const pair = [a1, a2];
      const key = pair.sort().join('/');
      results[key] = (results[key] || 0) + 1;
    }
  }
  return results;
}

/**
 * Performs a complete Cartesian cross of 5 Loci between Buck and Doe.
 * Returns:
 * {
 *   varieties: [ { name: "Opal", percent: 25 }, ... ],
 *   grid: [ { buckGenotype, doeGenotype, childGenotype, varietyName }, ... ]
 * }
 */
export function crossRabbitsGenetics(buckGen, doeGen) {
  // Helper to cross locus and return array of combinations with probability weights
  const crossAndWeight = (locus) => {
    const buckAlleles = buckGen[locus] || ['A', 'a'];
    const doeAlleles = doeGen[locus] || ['A', 'a'];
    
    const outcomes = [];
    for (const b of buckAlleles) {
      for (const d of doeAlleles) {
        outcomes.push([b, d].sort().join('/'));
      }
    }
    return outcomes;
  };

  const aOut = crossAndWeight('A');
  const bOut = crossAndWeight('B');
  const cOut = crossAndWeight('C');
  const dOut = crossAndWeight('D');
  const eOut = crossAndWeight('E');

  const totals = {};
  const grid = [];

  // Cartesian Product across all 5 crossed outcomes (4^5 = 1024 possibilities)
  for (const a of aOut) {
    for (const b of bOut) {
      for (const c of cOut) {
        for (const d of dOut) {
          for (const e of eOut) {
            const genotype = {
              A: a.split('/'),
              B: b.split('/'),
              C: c.split('/'),
              D: d.split('/'),
              E: e.split('/')
            };
            const variety = determineVarietyFromGenotype(genotype);
            totals[variety] = (totals[variety] || 0) + 1;
            
            // Format nice string representation for grid
            const formatGenotype = (g) => `${g.A.join('')} ${g.B.join('')} ${g.C.join('')} ${g.D.join('')} ${g.E.join('')}`;
            grid.push({
              childGenotype: formatGenotype(genotype),
              varietyName: variety
            });
          }
        }
      }
    }
  }

  const grandTotal = 1024;
  const varietyList = Object.keys(totals).map(name => ({
    name,
    percent: parseFloat(((totals[name] / grandTotal) * 100).toFixed(2))
  })).sort((x, y) => y.percent - x.percent);

  // Take a representative sample of grid to display (e.g. max 16 entries)
  const sampledGrid = [];
  const step = Math.max(1, Math.floor(grid.length / 16));
  for (let i = 0; i < grid.length && sampledGrid.length < 16; i += step) {
    sampledGrid.push(grid[i]);
  }

  return {
    varieties: varietyList,
    grid: sampledGrid
  };
}
