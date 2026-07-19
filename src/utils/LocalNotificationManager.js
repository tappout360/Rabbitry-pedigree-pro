/**
 * Safe, zero-dependency offline local notification coordinator.
 * Stores alerts in a local queue and triggers native browser Notifications when due.
 */

// Request notification permission from the user
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log("This browser does not support notifications.");
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

/**
 * Schedule pregnancy milestones notifications
 */
export function schedulePregnancyAlerts(doeName, hutchLocation, breedDateString) {
  const breedDate = new Date(breedDateString);
  if (isNaN(breedDate.getTime())) return;

  const milestones = [
    { day: 12, label: 'Palpation Due', msg: `Time to palpate ${doeName} in hutch ${hutchLocation || 'N/A'} to confirm pregnancy.` },
    { day: 28, label: 'Nest Box In', msg: `Warning: Nest box insertion is due for ${doeName} (Hutch: ${hutchLocation || 'N/A'}).` },
    { day: 31, label: 'Kindle Due Date', msg: `Litter kindling expected today for ${doeName} (Hutch: ${hutchLocation || 'N/A'}).` },
    { day: 56, label: 'Weaning Due', msg: `Weaning timeline reached for ${doeName}'s litter (Hutch: ${hutchLocation || 'N/A'}).` }
  ];

  const scheduledAlerts = milestones.map(m => {
    const alertDate = new Date(breedDate.getTime() + m.day * 24 * 60 * 60 * 1000);
    const alertId = `alert-${doeName.replace(/\s/g, '-')}-${m.day}-${breedDate.getTime()}`;

    // Try scheduling a native browser Notification API trigger if permission is active
    if ('Notification' in window && Notification.permission === 'granted') {
      const now = Date.now();
      const delay = alertDate.getTime() - now;
      if (delay > 0) {
        setTimeout(() => {
          new Notification(`🐇 WarrenWise: ${m.label}`, {
            body: m.msg,
            icon: '/manifest.json'
          });
        }, delay);
      }
    }

    return {
      id: alertId,
      title: `${m.label} - ${doeName}`,
      message: m.msg,
      date: alertDate.toISOString().split('T')[0],
      status: 'pending'
    };
  });

  // Save to localStorage alert queue as a secondary offline fallback
  try {
    const existing = JSON.parse(localStorage.getItem('wp_local_alerts') || '[]');
    const merged = [...existing, ...scheduledAlerts];
    localStorage.setItem('wp_local_alerts', JSON.stringify(merged));
    console.log("Successfully scheduled offline pregnancy alerts:", scheduledAlerts);
  } catch (e) {
    console.error("Failed to write offline notifications queue:", e);
  }
}

/**
 * Check and fire pending alerts (called on boot or periodically)
 */
export function checkPendingAlerts() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  try {
    const nowStr = new Date().toISOString().split('T')[0];
    const alerts = JSON.parse(localStorage.getItem('wp_local_alerts') || '[]');
    let modified = false;

    alerts.forEach(alert => {
      if (alert.status === 'pending' && alert.date <= nowStr) {
        new Notification(`🐇 WarrenWise: ${alert.title.split(' - ')[0]}`, {
          body: alert.message,
          icon: '/manifest.json'
        });
        alert.status = 'fired';
        modified = true;
      }
    });

    if (modified) {
      localStorage.setItem('wp_local_alerts', JSON.stringify(alerts));
    }
  } catch (e) {
    console.error("Error checking local offline notifications:", e);
  }
}
