import React, { useState } from 'react';
import { AlertTriangle, Lock, ShieldAlert, X, Check, RefreshCw } from 'lucide-react';

export default function DangerConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'High-Risk Action Confirmation',
  description = 'This operation can modify critical production data or impact user accounts.',
  confirmKeyword = 'CONFIRM',
  requireReason = true,
  requirePassword = true,
  actionButtonText = 'Execute Danger Action',
  isExecuting = false
}) {
  const [typedKeyword, setTypedKeyword] = useState('');
  const [reason, setReason] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (typedKeyword.trim().toUpperCase() !== confirmKeyword.toUpperCase()) {
      setError(`Please type "${confirmKeyword}" to confirm.`);
      return;
    }

    if (requireReason && (!reason.trim() || reason.trim().length < 8)) {
      setError('A detailed operational reason (min 8 characters) is required for audit logs.');
      return;
    }

    if (requirePassword && !password.trim()) {
      setError('Please provide your admin password to re-authenticate.');
      return;
    }

    onConfirm({
      reason: reason.trim(),
      password: password.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-left">
      <div className="relative w-full max-w-lg bg-slate-950 border-2 border-rose-500/40 rounded-3xl shadow-2xl shadow-rose-950/50 overflow-hidden">
        
        {/* Danger Header */}
        <div className="p-6 bg-gradient-to-r from-rose-950/80 via-slate-900 to-red-950/80 border-b border-rose-500/20 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">{title}</h3>
              <p className="text-xs text-rose-300/80 mt-0.5">Dual-authorization required for audit compliance</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isExecuting}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 leading-relaxed">
            {description}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-900/60 border border-rose-500 text-xs text-rose-200 font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Confirmation */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Type Confirmation Keyword</span>
              <span className="font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                {confirmKeyword}
              </span>
            </label>
            <input
              type="text"
              required
              value={typedKeyword}
              onChange={(e) => setTypedKeyword(e.target.value)}
              placeholder={`Type "${confirmKeyword}" to proceed`}
              className="w-full bg-slate-900 border border-white/10 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Reason Input */}
          {requireReason && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Operational Reason <span className="text-rose-400">*</span> (Mandatory for audit trail)
              </label>
              <textarea
                required
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. User requested account closure via support ticket #1042"
                className="w-full bg-slate-900 border border-white/10 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
              />
            </div>
          )}

          {/* Password Re-Auth */}
          {requirePassword && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Admin Re-Authentication Password</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your admin password"
                className="w-full bg-slate-900 border border-white/10 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isExecuting}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isExecuting}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{actionButtonText}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
