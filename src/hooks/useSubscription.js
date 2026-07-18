import { create } from 'zustand';
import { db } from '../db/registryDb';
import { canAccessFeature, getTierLimits } from '../db/subscriptionConfig';

export const useSubscription = create((set, get) => ({
  tier: 'basic',
  status: 'trialing',
  stripeCustomerId: '',
  stripeSubscriptionId: '',
  currentPeriodEnd: '',
  trialEnd: '',
  cancelledAt: '',
  evansVerified: false,
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
          status: localSub.status || 'trialing',
          stripeCustomerId: localSub.stripeCustomerId || '',
          stripeSubscriptionId: localSub.stripeSubscriptionId || '',
          currentPeriodEnd: localSub.currentPeriodEnd || '',
          trialEnd: localSub.trialEnd || '',
          cancelledAt: localSub.cancelledAt || '',
          evansVerified: !!localSub.evansVerified,
          isLoading: false
        });
      } else {
        // Fallback or seed default 14-day trialing subscription
        const defaultSub = {
          id: `sub-${breederId}`,
          breederId,
          tier: 'basic',
          status: 'trialing',
          stripeCustomerId: '',
          stripeSubscriptionId: '',
          currentPeriodEnd: '',
          trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          cancelledAt: null,
          evansVerified: false,
          createdAt: new Date().toISOString()
        };
        await db.subscriptions.add(defaultSub);
        set({
          tier: 'basic',
          status: 'trialing',
          stripeCustomerId: '',
          stripeSubscriptionId: '',
          currentPeriodEnd: '',
          trialEnd: defaultSub.trialEnd,
          cancelledAt: '',
          evansVerified: false,
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
        tier: subData.tier || 'basic',
        status: subData.status || 'active',
        stripeCustomerId: subData.stripeCustomerId || '',
        stripeSubscriptionId: subData.stripeSubscriptionId || '',
        currentPeriodEnd: subData.currentPeriodEnd || '',
        trialEnd: subData.trialEnd || null,
        cancelledAt: subData.cancelledAt || null,
        evansVerified: !!subData.evansVerified,
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
        evansVerified: updatedRecord.evansVerified
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
    const { tier, status } = get();
    const isTrial = status === 'trialing';

    if (isTrial) {
      if (tier === 'basic') {
        return {
          animalLimit: 40,
          photoLimit: 100,
          isTrial: true
        };
      }
      if (tier === 'pro') {
        return {
          animalLimit: 100,
          photoLimit: 250,
          isTrial: true
        };
      }
      if (tier === 'youth_academy') {
        return {
          animalLimit: 50,
          photoLimit: 150,
          isTrial: true
        };
      }
    }

    const limits = getTierLimits(tier);
    return {
      animalLimit: limits.animalLimit,
      photoLimit: limits.photoLimit,
      isTrial: false
    };
  }
}));
