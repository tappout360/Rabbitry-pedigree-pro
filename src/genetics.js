/**
 * Wright's Inbreeding Coefficient (F) calculator
 */
export class GeneticsEngine {
  constructor(rabbitsList) {
    this.rabbits = rabbitsList || [];
  }

  // Find a rabbit in the list
  getRabbit(id) {
    return this.rabbits.find(r => r.id === id) || null;
  }

  /**
   * Traverses ancestral lineage to build a map of ancestors and their generation paths
   */
  getAncestorPaths(rabbitId, depth = 0, visited = new Set()) {
    const paths = new Map();
    if (!rabbitId) return paths;

    if (visited.has(rabbitId)) {
      throw new Error(`Circular pedigree loop detected: ${rabbitId}`);
    }

    visited.add(rabbitId);
    const rabbit = this.getRabbit(rabbitId);

    if (rabbit) {
      paths.set(rabbitId, [depth]);

      if (rabbit.sireId) {
        const sirePaths = this.getAncestorPaths(rabbit.sireId, depth + 1, new Set(visited));
        this.mergePaths(paths, sirePaths);
      }

      if (rabbit.damId) {
        const damPaths = this.getAncestorPaths(rabbit.damId, depth + 1, new Set(visited));
        this.mergePaths(paths, damPaths);
      }
    }

    return paths;
  }

  mergePaths(targetMap, sourceMap) {
    for (const [ancestorId, depths] of sourceMap.entries()) {
      if (targetMap.has(ancestorId)) {
        targetMap.set(ancestorId, [...targetMap.get(ancestorId), ...depths]);
      } else {
        targetMap.set(ancestorId, [...depths]);
      }
    }
  }

  /**
   * Computes the Inbreeding Coefficient (F) of a hypothetical or existing mating
   */
  calculateInbreedingCoefficient(sireId, damId) {
    if (!sireId || !damId) return 0.0;

    try {
      const sirePaths = this.getAncestorPaths(sireId, 0, new Set());
      const damPaths = this.getAncestorPaths(damId, 0, new Set());

      let totalF = 0.0;

      for (const ancestorId of sirePaths.keys()) {
        if (damPaths.has(ancestorId)) {
          const sireDepths = sirePaths.get(ancestorId);
          const damDepths = damPaths.get(ancestorId);

          const ancestor = this.getRabbit(ancestorId);
          const F_A = ancestor ? (ancestor.inbreedingCoeff || 0.0) : 0.0;

          for (const n1 of sireDepths) {
            for (const n2 of damDepths) {
              const contribution = Math.pow(0.5, n1 + n2 + 1) * (1.0 + F_A);
              totalF += contribution;
            }
          }
        }
      }

      return parseFloat(totalF.toFixed(5));
    } catch (e) {
      console.error(e);
      return -1; // Indicates circular dependency error
    }
  }
}
