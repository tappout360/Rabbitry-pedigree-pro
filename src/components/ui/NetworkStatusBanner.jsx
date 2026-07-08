import React, { useState, useEffect } from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';

export default function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [showStatusChanged, setShowStatusChanged] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatusChanged(true);
      const timer = setTimeout(() => setShowStatusChanged(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatusChanged(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="w-full bg-amber-600/90 text-white text-xs font-bold py-2.5 px-4 flex items-center justify-center gap-2 shadow-md sticky top-0 z-50 backdrop-blur-sm border-b border-amber-500/30 transition-all no-print">
        <WifiOff className="w-4 h-4 animate-pulse" />
        <span>Working Offline | Database Saved Locally in Barn Mode 🌾</span>
      </div>
    );
  }

  if (showStatusChanged) {
    return (
      <div className="w-full bg-emerald-600/95 text-white text-xs font-bold py-2.5 px-4 flex items-center justify-center gap-2 shadow-md sticky top-0 z-50 backdrop-blur-sm border-b border-emerald-500/30 transition-all animate-fade-in no-print">
        <ShieldCheck className="w-4 h-4" />
        <span>Connected Online | Sync Safe & Active 📡</span>
      </div>
    );
  }

  return null;
}
