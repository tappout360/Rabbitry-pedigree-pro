import { create } from 'zustand';
import { db } from '../db/registryDb';
import { canAccessFeature, getTierLimits } from '../db/subscriptionConfig';

export const useSubscription = create((set, get) => ({
  tier: 'basic',
  status: 'active',
  stripeCustomerId: '',
  stripeSubscriptionId: '',
  currentPeriodEnd: '',
  trialEnd: '',
  cancelledAt: '',
  evansVerified: false,
  additionalHutches: 0,
  additionalStorageGb: 0,
  invoices: [],
  isLoading: true,

  // Pulls subscription state from local Dexie DB and updates store
  fetchStatus: async (breederId = 'ab-1') => {
    try {
      set({ isLoading: true });
      const localSub = await db.subscriptions.where('breederId').equals(breederId).first();
      
      if (localSub) {
        set({
          tier: localSub.tier || 'basic',
          status: localSub.status || 'active',
          stripeCustomerId: localSub.stripeCustomerId || '',
          stripeSubscriptionId: localSub.stripeSubscriptionId || '',
          currentPeriodEnd: localSub.currentPeriodEnd || '',
          trialEnd: localSub.trialEnd || '',
          cancelledAt: localSub.cancelledAt || '',
          evansVerified: !!localSub.evansVerified,
          additionalHutches: parseInt(localSub.additionalHutches) || 0,
          additionalStorageGb: parseInt(localSub.additionalStorageGb) || 0,
          isLoading: false
        });
      } else {
        // Fallback default active subscription
        const defaultSub = {
          id: `sub-${breederId}`,
          breederId,
          tier: 'basic',
          status: 'active',
          stripeCustomerId: '',
          stripeSubscriptionId: '',
          currentPeriodEnd: '2028-12-31',
          trialEnd: null,
          cancelledAt: null,
          evansVerified: false,
          additionalHutches: 0,
          additionalStorageGb: 0,
          createdAt: new Date().toISOString()
        };
        await db.subscriptions.add(defaultSub);
        set({
          tier: 'basic',
          status: 'active',
          stripeCustomerId: '',
          stripeSubscriptionId: '',
          currentPeriodEnd: '',
          trialEnd: defaultSub.trialEnd,
          cancelledAt: '',
          evansVerified: false,
          additionalHutches: 0,
          additionalStorageGb: 0,
          isLoading: false
        });
      }

      // Load matching invoices
      const localInvoices = await db.invoices.where('breederId').equals(breederId).toArray();
      set({ invoices: localInvoices || [] });
    } catch (e) {
      console.error("Error loading subscription from Dexie:", e);
      set({ isLoading: false });
    }
  },

  // Save new subscription data locally and sync with cloud
  updateSubscription: async (breederId, subData) => {
    try {
      const existing = await db.subscriptions.where('breederId').equals(breederId).first();
      const updatedRecord = {
        id: existing?.id || `sub-${Date.now()}`,
        breederId,
        tier: subData.tier || existing?.tier || 'basic',
        status: subData.status || existing?.status || 'active',
        stripeCustomerId: subData.stripeCustomerId || existing?.stripeCustomerId || '',
        stripeSubscriptionId: subData.stripeSubscriptionId || existing?.stripeSubscriptionId || '',
        currentPeriodEnd: subData.currentPeriodEnd || existing?.currentPeriodEnd || '',
        trialEnd: subData.trialEnd || existing?.trialEnd || null,
        cancelledAt: subData.cancelledAt || existing?.cancelledAt || null,
        evansVerified: subData.evansVerified !== undefined ? !!subData.evansVerified : !!existing?.evansVerified,
        additionalHutches: subData.additionalHutches !== undefined ? parseInt(subData.additionalHutches) : (parseInt(existing?.additionalHutches) || 0),
        additionalStorageGb: subData.additionalStorageGb !== undefined ? parseInt(subData.additionalStorageGb) : (parseInt(existing?.additionalStorageGb) || 0),
        updatedAt: new Date().toISOString()
      };

      if (existing) {
        await db.subscriptions.put(updatedRecord);
      } else {
        await db.subscriptions.add(updatedRecord);
      }

      // Update Zustand state
      set({
        tier: updatedRecord.tier,
        status: updatedRecord.status,
        stripeCustomerId: updatedRecord.stripeCustomerId,
        stripeSubscriptionId: updatedRecord.stripeSubscriptionId,
        currentPeriodEnd: updatedRecord.currentPeriodEnd,
        trialEnd: updatedRecord.trialEnd,
        cancelledAt: updatedRecord.cancelledAt,
        evansVerified: updatedRecord.evansVerified,
        additionalHutches: updatedRecord.additionalHutches,
        additionalStorageGb: updatedRecord.additionalStorageGb
      });

      // Queue sync action
      const syncAction = {
        id: `sync-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        breederId,
        timestamp: new Date().toISOString(),
        action: 'UPDATE',
        table: 'subscriptions',
        payload: updatedRecord
      };
      await db.syncQueue.add(syncAction);

      // Trigger automatic background sync check
      if (navigator.onLine) {
        window.dispatchEvent(new Event('trigger-cloud-sync'));
      }
    } catch (e) {
      console.error("Error saving subscription details:", e);
    }
  },

  buyHutches: async (breederId, count) => {
    const current = get().additionalHutches || 0;
    await get().updateSubscription(breederId, {
      additionalHutches: current + count
    });
  },

  buyStorage: async (breederId, gbCount) => {
    const current = get().additionalStorageGb || 0;
    await get().updateSubscription(breederId, {
      additionalStorageGb: current + gbCount
    });
  },

  clearSubscription: () => {
    set({
      tier: 'basic',
      status: 'trialing',
      stripeCustomerId: '',
      stripeSubscriptionId: '',
      currentPeriodEnd: '',
      trialEnd: '',
      cancelledAt: '',
      evansVerified: false,
      additionalHutches: 0,
      additionalStorageGb: 0,
      invoices: []
    });
  },

  // Helper check methods
  hasPremiumAccess: () => {
    const { tier, status } = get();
    const isActive = status === 'active' || status === 'trialing';
    if (!isActive) return false;
    // Premium includes Pro and 4-H Academy plans
    return tier === 'pro' || tier === 'youth_academy' || tier === 'evans_lifetime';
  },

  isFeatureAllowed: (featureName) => {
    const { tier, status } = get();
    const isActive = status === 'active' || status === 'trialing';
    if (!isActive) return false;
    return canAccessFeature(tier, featureName);
  },

  getLimits: () => {
    const { tier, status, additionalHutches, additionalStorageGb } = get();
    const isTrial = status === 'trialing';

    const limits = getTierLimits(tier);
    const baseGb = limits.cloudStorageGb || 1;
    const totalStorageGb = baseGb + (additionalStorageGb || 0);

    return {
      animalLimit: limits.animalLimit + (additionalHutches || 0),
      photoLimit: limits.photoLimit + ((additionalStorageGb || 0) * 500),
      storageGb: totalStorageGb,
      isTrial: isTrial
    };
  }
}));
