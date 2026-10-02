import React, { useState, useEffect } from 'react';
import { Eye, LogOut, Clock, ShieldAlert } from 'lucide-react';

export default function ImpersonationBanner({
  impersonatedUser,
  impersonationMeta,
  onExitImpersonation
}) {
  const [secondsRemaining, setSecondsRemaining] = useState(() => {
    if (!impersonationMeta?.expiresAt) return 900; // 15 mins default
    return Math.max(0, Math.floor((impersonationMeta.expiresAt - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!impersonatedUser) return;
    const interval = setInterval(() => {
      if (impersonationMeta?.expiresAt) {
        const remaining = Math.max(0, Math.floor((impersonationMeta.expiresAt - Date.now()) / 1000));
        setSecondsRemaining(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
          onExitImpersonation('Session auto-expired after 15 minutes.');
        }
      } else {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            onExitImpersonation('Session auto-expired.');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [impersonatedUser, impersonationMeta, onExitImpersonation]);

  if (!impersonatedUser) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-slate-950 font-bold px-4 py-2 shadow-xl border-b border-amber-400 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5">
        <div className="p-1 rounded-lg bg-black/20 text-slate-950">
          <Eye className="w-4 h-4 animate-pulse" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="uppercase tracking-wider font-black bg-black/15 px-2 py-0.5 rounded text-[10px]">
            Support Impersonation Mode
          </span>
          <span>Viewing as:</span>
          <strong className="underline decoration-slate-900">{impersonatedUser.name || impersonatedUser.rabbitryName}</strong>
          <span className="opacity-80">({impersonatedUser.email})</span>
          {impersonationMeta?.reason && (
            <span className="italic opacity-85 text-[11px] ml-1">
              &bull; Reason: &ldquo;{impersonationMeta.reason}&rdquo;
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 font-mono text-[11px] bg-black/20 px-2.5 py-1 rounded-lg">
          <Clock className="w-3.5 h-3.5" />
          <span>Auto-expires: {timeFormatted}</span>
        </div>

        <button
          type="button"
          onClick={() => onExitImpersonation('Admin exited impersonation')}
          className="px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-900 text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Impersonation</span>
        </button>
      </div>
    </div>
  );
}
