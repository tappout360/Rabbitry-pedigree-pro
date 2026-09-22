/**
 * RabbitRepository.js
 * Outbound Storage Adapter: Abstracts Dexie / IndexedDB persistence for Rabbits & Lineage
 */

import { db } from '../../db/registryDb';

export class RabbitRepository {
  async getById(id) {
    if (!id || !db || !db.rabbits) return null;
    return await db.rabbits.get(id);
  }

  async getAll() {
    if (!db || !db.rabbits) return [];
    return await db.rabbits.toArray();
  }

  async getByBreeder(breederId) {
    if (!db || !db.rabbits) return [];
    if (!breederId || breederId === 'all') {
      return await db.rabbits.toArray();
    }
    return await db.rabbits.where('breederId').equals(breederId).toArray();
  }

  async save(rabbit) {
    if (!rabbit || !rabbit.id || !db || !db.rabbits) return null;
    await db.rabbits.put(rabbit);
    return rabbit;
  }

  async saveBatch(rabbits = []) {
    if (!rabbits.length || !db || !db.rabbits) return [];
    await db.rabbits.bulkPut(rabbits);
    return rabbits;
  }

  async delete(id) {
    if (!id || !db || !db.rabbits) return false;
    await db.rabbits.delete(id);
    return true;
  }
}

export const globalRabbitRepository = new RabbitRepository();
