/**
 * OfflineSyncAdapter.js
 * Outbound Adapter: Offline Sync Queue, Network Monitoring, and Conflict Resolution
 */

export class OfflineSyncAdapter {
  constructor() {
    this.storageKey = 'rp_sync_queue';
    this.listeners = new Set();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  isOnline() {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  getQueue() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  enqueue(actionType, collection, entity) {
    const queue = this.getQueue();
    const item = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      action: actionType, // 'CREATE', 'UPDATE', 'DELETE'
      collection,
      entity,
      timestamp: new Date().toISOString(),
      attempts: 0
    };
    queue.push(item);
    localStorage.setItem(this.storageKey, JSON.stringify(queue));
    this.notifyListeners();
    return item;
  }

  clearQueue() {
    localStorage.removeItem(this.storageKey);
    this.notifyListeners();
  }

  handleNetworkChange(online) {
    this.notifyListeners();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    const state = {
      isOnline: this.isOnline(),
      pendingCount: this.getQueue().length
    };
    this.listeners.forEach(cb => {
      try { cb(state); } catch {}
    });
  }
}

export const globalSyncAdapter = new OfflineSyncAdapter();
