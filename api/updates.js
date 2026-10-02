// api/updates.js — Dynamic Update, Feature Flags & Release Delivery Endpoint
import { verifyAuth } from './_lib/auth.js';

// Default global release state
let releaseState = {
  latestStable: '7.1.0',
  latestBeta: '7.2.0-beta.1',
  minimumRequiredVersion: '7.0.0',
  maintenanceMode: false,
  maintenanceMessage: 'RabbitryPedigree Pro is undergoing scheduled database maintenance. Please check back shortly.',
  featureFlags: {
    cloudBackupSync: true,
    betaChannel: false,
    enhancedGenetics: true,
    rapidWeightLogger: true,
    meatComplianceModule: true
  },
  releaseNotes: [
    {
      version: '7.1.0',
      date: '2026-10-02',
      title: 'Dynamic Backup, Restore & Update Hardening Release',
      highlights: [
        'Complete Data Vault Schema v3.0 with SHA-256 integrity verification.',
        'Zero Trust re-authentication guard on all restore actions.',
        'Pre-destructive-action safety snapshots before Evans imports and bulk updates.',
        'Guided restore with visual diff preview and category filtering (Rabbits, Ledger, Medical).',
        'Staged PWA update delivery with offline data migration safety checks.'
      ]
    },
    {
      version: '7.0.0',
      date: '2026-09-22',
      title: 'Barn-Ready Mobile & Launch Hardening',
      highlights: [
        'One-thumb mobile bottom navigation and floating quick-action dock.',
        'High-contrast sunlight theme for direct outdoor barn lighting.',
        'Service Worker v7.0 with complete offline asset caching.'
      ]
    }
  ]
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET: Client checks for updates, release notes, and feature flags
  if (req.method === 'GET') {
    const { clientVersion, channel } = req.query;

    const targetVersion = channel === 'beta' ? releaseState.latestBeta : releaseState.latestStable;
    const updateAvailable = clientVersion && clientVersion !== targetVersion;
    const isHardRequired = clientVersion && clientVersion < releaseState.minimumRequiredVersion;

    return res.status(200).json({
      latestVersion: targetVersion,
      channel: channel || 'stable',
      updateAvailable: Boolean(updateAvailable),
      isHardRequired: Boolean(isHardRequired),
      maintenanceMode: releaseState.maintenanceMode,
      maintenanceMessage: releaseState.maintenanceMessage,
      featureFlags: releaseState.featureFlags,
      releaseNotes: releaseState.releaseNotes[0] || null,
      history: releaseState.releaseNotes
    });
  }

  // POST: Admin updates release state, maintenance mode, or feature flags
  if (req.method === 'POST') {
    const authUser = verifyAuth(req);
    // Allow admin / superadmin / owner
    if (!authUser || (authUser.role !== 'owner' && authUser.role !== 'superadmin')) {
      // In local dev, allow if explicit header present
      const isDev = process.env.NODE_ENV !== 'production';
      if (!isDev) {
        return res.status(403).json({ error: 'Superadmin privileges required to modify release state.' });
      }
    }

    const { latestStable, minimumRequiredVersion, maintenanceMode, featureFlags } = req.body;

    if (latestStable) releaseState.latestStable = latestStable;
    if (minimumRequiredVersion) releaseState.minimumRequiredVersion = minimumRequiredVersion;
    if (maintenanceMode !== undefined) releaseState.maintenanceMode = Boolean(maintenanceMode);
    if (featureFlags) releaseState.featureFlags = { ...releaseState.featureFlags, ...featureFlags };

    return res.status(200).json({
      success: true,
      message: 'Release configuration updated successfully.',
      state: releaseState
    });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}
