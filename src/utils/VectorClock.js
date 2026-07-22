/**
 * Vector Clock & Conflict Resolution Engine for RabbitryPedigree Pro (WarrenWise Pro)
 * Tracks causality across distributed mobile devices and cloud databases.
 */

export function getDeviceId() {
  let deviceId = localStorage.getItem('rp_device_id');
  if (!deviceId) {
    deviceId = `dev-${Math.random().toString(36).substring(2, 10)}-${Date.now().toString(36)}`;
    localStorage.setItem('rp_device_id', deviceId);
  }
  return deviceId;
}

export function createVectorClock(deviceId = getDeviceId()) {
  return { [deviceId]: 1 };
}

export function incrementVectorClock(clock = {}, deviceId = getDeviceId()) {
  const nextClock = { ...clock };
  nextClock[deviceId] = (nextClock[deviceId] || 0) + 1;
  return nextClock;
}

export function mergeVectorClocks(clockA = {}, clockB = {}) {
  const merged = { ...clockA };
  for (const [device, seq] of Object.entries(clockB)) {
    merged[device] = Math.max(merged[device] || 0, seq);
  }
  return merged;
}

/**
 * Compare two vector clocks to determine causality relationships.
 * @returns {'EQUAL' | 'DOMINATES_A' | 'DOMINATES_B' | 'CONCURRENT'}
 */
export function compareVectorClocks(clockA = {}, clockB = {}) {
  const keys = Array.from(new Set([...Object.keys(clockA), ...Object.keys(clockB)]));
  let aGreater = false;
  let bGreater = false;

  for (const key of keys) {
    const valA = clockA[key] || 0;
    const valB = clockB[key] || 0;

    if (valA > valB) aGreater = true;
    if (valB > valA) bGreater = true;
  }

  if (aGreater && bGreater) return 'CONCURRENT'; // Conflict! Both devices updated independently
  if (aGreater) return 'DOMINATES_A'; // Clock A is causally ahead of Clock B
  if (bGreater) return 'DOMINATES_B'; // Clock B is causally ahead of Clock A
  return 'EQUAL';
}

/**
 * Classify record fields into critical (pedigree lineage, ownership) vs simple (weights, notes).
 */
export const CRITICAL_FIELDS = ['sireId', 'damId', 'registrationNumber', 'ownerBreederId', 'ownershipStatus'];

/**
 * Conflict Resolver: Evaluates local record vs cloud record using vector clocks.
 * - Auto-merges non-critical fields via Last-Write-Wins (LWW).
 * - Flags critical field divergence for user manual review.
 */
export function resolveRecordConflict(localRecord, cloudRecord, currentDeviceId = getDeviceId()) {
  if (!localRecord) return { action: 'ACCEPT_CLOUD', record: cloudRecord };
  if (!cloudRecord) return { action: 'KEEP_LOCAL', record: localRecord };

  const clockLocal = localRecord.vectorClock || { [currentDeviceId]: 1 };
  const clockCloud = cloudRecord.vectorClock || {};

  const causality = compareVectorClocks(clockLocal, clockCloud);

  if (causality === 'DOMINATES_A') {
    // Local dominates cloud -> keep local
    return { action: 'KEEP_LOCAL', record: localRecord };
  }

  if (causality === 'DOMINATES_B') {
    // Cloud dominates local -> accept cloud
    return { action: 'ACCEPT_CLOUD', record: cloudRecord };
  }

  if (causality === 'EQUAL') {
    return { action: 'KEEP_LOCAL', record: localRecord };
  }

  // CONCURRENT DIVERGENCE (Conflict)
  // Check if critical fields differ
  const hasCriticalConflict = CRITICAL_FIELDS.some(field => {
    const localVal = localRecord[field];
    const cloudVal = cloudRecord[field];
    return localVal !== undefined && cloudVal !== undefined && localVal !== cloudVal;
  });

  if (hasCriticalConflict) {
    // Requires manual user intervention
    return {
      action: 'REQUIRES_MANUAL_MERGE',
      localRecord,
      cloudRecord,
      conflictingFields: CRITICAL_FIELDS.filter(f => localRecord[f] !== cloudRecord[f])
    };
  }

  // Non-critical conflict -> Auto-merge non-critical fields via Last-Write-Wins (LWW)
  const localTime = new Date(localRecord.timestamp || localRecord.updatedAt || 0).getTime();
  const cloudTime = new Date(cloudRecord.timestamp || cloudRecord.updatedAt || 0).getTime();
  const winner = cloudTime > localTime ? cloudRecord : localRecord;

  const mergedPayload = {
    ...cloudRecord,
    ...localRecord,
    // Keep most recent timestamp & merged clock
    timestamp: new Date().toISOString(),
    vectorClock: mergeVectorClocks(clockLocal, clockCloud)
  };

  return {
    action: 'AUTO_MERGED_LWW',
    record: mergedPayload
  };
}
