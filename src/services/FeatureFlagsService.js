/**
 * FeatureFlagsService.js
 * Progressive Feature Delivery & Staged Release Management
 * 
 * Supports:
 * - Default runtime flags
 * - Local overrides for beta testers and breeders
 * - Remote flag sync from /api/updates
 * - Event subscription for reactive UI updates
 */

const DEFAULT_FLAGS = {
  betaChannel: false,
  cloudBackupSync: true,
  enhancedGenetics: true,
  rapidWeightLogger: true,
  meatComplianceModule: true,
  advancedLineageGraph: true,
  offlineSelfHeal: true
};

export class FeatureFlagsService {
  constructor() {
    this.storageKey = 'rp_feature_flags';
    this.listeners = new Set();
    this.flags = this.loadFlags();
  }

  loadFlags() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        return { ...DEFAULT_FLAGS, ...JSON.parse(raw) };
      }
    } catch {}
    return { ...DEFAULT_FLAGS };
  }

  saveFlags() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.flags));
      this.notifyListeners();
    } catch (e) {
      console.warn('[FeatureFlagsService] Failed saving flags to localStorage:', e);
    }
  }

  isEnabled(flagName) {
    if (this.flags[flagName] !== undefined) {
      return Boolean(this.flags[flagName]);
    }
    return Boolean(DEFAULT_FLAGS[flagName]);
  }

  setFlag(flagName, value) {
    this.flags[flagName] = Boolean(value);
    this.saveFlags();
  }

  setOverride(flagName, value) {
    this.setFlag(flagName, value);
    return this.getAllFlags();
  }

  getAllFlags() {
    const res = {};
    for (const [k, v] of Object.entries(this.flags)) {
      res[k] = {
        name: k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        enabled: Boolean(v),
        description: `Controls ${k} capability across user sessions`,
        tier: k === 'advancedLineageGraph' ? 'pro' : null,
        betaOnly: k === 'betaChannel'
      };
    }
    return res;
  }

  resetToDefaults() {
    this.flags = { ...DEFAULT_FLAGS };
    this.saveFlags();
  }

  /**
   * Sync flags from serverless updates endpoint.
   */
  async syncRemoteFlags() {
    try {
      const res = await fetch('/api/updates');
      if (res.ok) {
        const data = await res.json();
        if (data.featureFlags) {
          // Merge remote defaults while keeping user-explicit opt-ins like betaChannel
          const userBeta = this.flags.betaChannel;
          this.flags = { ...this.flags, ...data.featureFlags, betaChannel: userBeta };
          this.saveFlags();
        }
      }
    } catch (err) {
      console.warn('[FeatureFlagsService] Remote flag sync skipped:', err.message);
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => {
      try { cb(this.getAllFlags()); } catch {}
    });
  }
}

export const featureFlags = new FeatureFlagsService();
export const featureFlagsService = featureFlags;
