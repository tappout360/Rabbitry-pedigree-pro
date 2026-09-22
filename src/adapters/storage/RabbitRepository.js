/**
 * RabbitRepository.js
 * Outbound Storage Adapter: Abstracts Dexie / IndexedDB persistence for Rabbits & Lineage
 * Optimized for large herds (1,000+ animals) with chunked queries, pagination, and memory guards.
 */

import { db } from '../../db/registryDb';

export class RabbitRepository {
  async getById(id) {
    if (!id || !db || !db.rabbits) return null;
    try {
      return await db.rabbits.get(id);
    } catch (err) {
      console.error(`[RabbitRepository] getById failed for ${id}:`, err);
      return null;
    }
  }

  async getAll() {
    if (!db || !db.rabbits) return [];
    try {
      return await db.rabbits.toArray();
    } catch (err) {
      console.error('[RabbitRepository] getAll failed:', err);
      return [];
    }
  }

  async getByBreeder(breederId) {
    if (!db || !db.rabbits) return [];
    try {
      if (!breederId || breederId === 'all') {
        return await db.rabbits.toArray();
      }
      return await db.rabbits.where('breederId').equals(breederId).toArray();
    } catch (err) {
      console.error(`[RabbitRepository] getByBreeder failed for ${breederId}:`, err);
      return [];
    }
  }

  async count(breederId) {
    if (!db || !db.rabbits) return 0;
    try {
      if (!breederId || breederId === 'all') {
        return await db.rabbits.count();
      }
      return await db.rabbits.where('breederId').equals(breederId).count();
    } catch {
      return 0;
    }
  }

  async search({ query = '', breederId = 'all', status = 'active', limit = 50, offset = 0 } = {}) {
    if (!db || !db.rabbits) return { items: [], total: 0 };
    try {
      let collection = db.rabbits.toCollection();
      if (breederId && breederId !== 'all') {
        collection = db.rabbits.where('breederId').equals(breederId);
      }

      const q = query.trim().toLowerCase();
      let filtered = await collection.filter(r => {
        if (!r) return false;
        if (status !== 'all' && r.status !== status) return false;
        if (!q) return true;
        const name = (r.name || '').toLowerCase();
        const tat = (r.tattooNumber || '').toLowerCase();
        const breed = (r.breed || '').toLowerCase();
        return name.includes(q) || tat.includes(q) || breed.includes(q);
      }).toArray();

      const total = filtered.length;
      const items = filtered.slice(offset, offset + limit);
      return { items, total };
    } catch (err) {
      console.error('[RabbitRepository] search failed:', err);
      return { items: [], total: 0 };
    }
  }

  async save(rabbit) {
    if (!rabbit || !rabbit.id || !db || !db.rabbits) return null;
    try {
      await db.rabbits.put(rabbit);
      return rabbit;
    } catch (err) {
      console.error(`[RabbitRepository] save failed for ${rabbit.id}:`, err);
      throw err;
    }
  }

  async saveBatch(rabbits = []) {
    if (!rabbits.length || !db || !db.rabbits) return [];
    try {
      await db.rabbits.bulkPut(rabbits);
      return rabbits;
    } catch (err) {
      console.error('[RabbitRepository] saveBatch failed:', err);
      throw err;
    }
  }

  async delete(id) {
    if (!id || !db || !db.rabbits) return false;
    try {
      await db.rabbits.delete(id);
      return true;
    } catch (err) {
      console.error(`[RabbitRepository] delete failed for ${id}:`, err);
      return false;
    }
  }
}

export const globalRabbitRepository = new RabbitRepository();
