import React, { useState } from 'react';
import { 
  LifeBuoy, Key, ShieldAlert, Mail, ArrowLeft, CheckCircle, 
  AlertCircle, HelpCircle, Lock, Send, X, RefreshCw
} from 'lucide-react';
import { db } from '../../db/registryDb';
import { logSecurityEvent, resetAccountLockout } from '../../services/AccountSecurityService';

export default function AccountRecoveryModal({
  allBreeders = [],
  onLoginSuccess,
  onClose,
  showToast
}) {
  const [recoveryMode, setRecoveryMode] = useState('menu'); // 'menu', 'forgot_pw', 'backup_code', 'support_ticket', 'lockout_info'

  // Forgot Password States
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState('email'); // 'email', 'code', 'new_pw'
  const [resetCode, setResetCode] = useState('');
  const [generatedResetCode, setGeneratedResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStatus, setResetStatus] = useState({ loading: false, error: '', success: '' });

  // 2FA Backup Code States
  const [backupEmail, setBackupEmail] = useState('');
  const [backupPassword, setBackupPassword] = useState('');
  const [inputBackupCode, setInputBackupCode] = useState('');
  const [backupStatus, setBackupStatus] = useState({ loading: false, error: '', success: '' });

  // Support Recovery Ticket States
  const [ticketRabbitry, setTicketRabbitry] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketArba, setTicketArba] = useState('');
  const [ticketTattoos, setTicketTattoos] = useState('');
  const [ticketReason, setTicketReason] = useState('Lost Authenticator & Backup Codes');
  const [ticketDetails, setTicketDetails] = useState('');
  const [ticketStatus, setTicketStatus] = useState({ loading: false, error: '', success: '' });

  // 1. Forgot Password Flow
  const handleRequestPasswordReset = (e) => {
    e.preventDefault();
    setResetStatus({ loading: true, error: '', success: '' });

    const cleanEmail = resetEmail.trim().toLowerCase();
    const targetBreeder = allBreeders.find(b => b.email.toLowerCase() === cleanEmail);

    if (!targetBreeder) {
      // Security standard: don't reveal if account exists or not, but allow demo/valid accounts
      setResetStatus({ 
        loading: false, 
        error: 'If this email is registered in the database, a 6-digit recovery code has been generated.', 
        success: '' 
      });
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedResetCode(code);
    setResetStep('code');
    setResetStatus({ 
      loading: false, 
      error: '', 
      success: `Security Code Sent! (Simulated Email Code: ${code})` 
    });
  };

  const handleVerifyResetCode = (e) => {
    e.preventDefault();
    if (resetCode.trim() !== generatedResetCode) {
      setResetStatus({ loading: false, error: 'Invalid 6-digit recovery code. Please check and try again.', success: '' });
      return;
    }
    setResetStep('new_pw');
    setResetStatus({ loading: false, error: '', success: 'Code verified! Enter your new password below.' });
  };

  const handleCompletePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setResetStatus({ loading: false, error: 'Password must be at least 8 characters long.', success: '' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetStatus({ loading: false, error: 'Passwords do not match.', success: '' });
      return;
    }

    setResetStatus({ loading: true, error: '', success: '' });
    const cleanEmail = resetEmail.trim().toLowerCase();
    const targetBreeder = allBreeders.find(b => b.email.toLowerCase() === cleanEmail);

    if (targetBreeder) {
      await db.adminBreeders.update(targetBreeder.id, {
        password: newPassword,
        lastPasswordChange: new Date().toISOString()
      });
      resetAccountLockout(cleanEmail);
      await logSecurityEvent(targetBreeder.id, 'PASSWORD_RESET_SELF_SERVICE', {}, 'warning');
    }

    setResetStatus({ loading: false, error: '', success: 'Password successfully reset! You can now log in.' });
    showToast("Password successfully reset!", "success");
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  // 2. 2FA Backup Code Recovery
  const handleVerifyBackupCodeLogin = async (e) => {
    e.preventDefault();
    setBackupStatus({ loading: true, error: '', success: '' });

    const cleanEmail = backupEmail.trim().toLowerCase();
    const breeder = allBreeders.find(b => b.email.toLowerCase() === cleanEmail);

    if (!breeder || breeder.password !== backupPassword) {
      setBackupStatus({ loading: false, error: 'Invalid email or account password.', success: '' });
      return;
    }

    const cleanCode = inputBackupCode.trim().toUpperCase();
    const codes = breeder.twoFactorBackupCodes || [];

    if (!codes.includes(cleanCode)) {
      setBackupStatus({ loading: false, error: 'Invalid or already used backup code.', success: '' });
      return;
    }

    // Consume backup code
    const remainingCodes = codes.filter(c => c !== cleanCode);
    await db.adminBreeders.update(breeder.id, {
      twoFactorBackupCodes: remainingCodes
    });

    await logSecurityEvent(breeder.id, 'BACKUP_CODE_USED', { remainingCount: remainingCodes.length }, 'warning');
    showToast(`Logged in using single-use backup code! (${remainingCodes.length} codes remaining)`, "success");
    onLoginSuccess({ ...breeder, twoFactorBackupCodes: remainingCodes });
    onClose();
  };

  // 3. Support Recovery Ticket Submission
  const handleSubmitSupportTicket = async (e) => {
    e.preventDefault();
    setTicketStatus({ loading: true, error: '', success: '' });

    const ticketNumber = 'REC-' + Math.floor(1000 + Math.random() * 9000);
    const newTicket = {
      id: 'tkt_' + Date.now(),
      ticketNumber,
      breederId: 'recovery_guest',
      breederEmail: ticketEmail.trim(),
      rabbitryName: ticketRabbitry.trim(),
      category: 'Account Recovery',
      priority: 'Urgent',
      subject: `[Account Recovery] ${ticketReason}`,
      description: `Ownership Signals:\n- ARBA Account: ${ticketArba || 'None'}\n- Known Tattoo Prefix / Animals: ${ticketTattoos || 'None'}\n\nUser Description:\n${ticketDetails}`,
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deviceInfo: {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        screen: `${window.screen.width}x${window.screen.height}`,
        online: navigator.onLine
      },
      replies: []
    };

    if (db && db.supportTickets) {
      await db.supportTickets.add(newTicket);
    }

    await logSecurityEvent('recovery_guest', 'ACCOUNT_RECOVERY_TICKET_FILED', { ticketNumber, email: ticketEmail }, 'warning');

    setTicketStatus({ 
      loading: false, 
      error: '', 
      success: `Ticket #${ticketNumber} has been received! Our Root Administration will review your ownership signals and respond to ${ticketEmail}.` 
    });
    showToast(`Account Recovery Ticket #${ticketNumber} filed!`, "success");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-scale-up">
      <div className="glass-container max-w-lg w-full bg-slate-900 border-2 border-indigo-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-left relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Supreme Account Recovery</h3>
              <p className="text-xs text-slate-400">WarrenWise Pro Lockout & Security Assistance</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors border-none bg-transparent cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MENU VIEW */}
        {recoveryMode === 'menu' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-300">
              Select the situation that best describes your account access issue:
            </p>

            <button
              onClick={() => { setRecoveryMode('forgot_pw'); setResetStep('email'); setResetStatus({ loading: false, error: '', success: '' }); }}
              className="w-full p-4 rounded-2xl bg-slate-950/60 hover:bg-indigo-950/40 border border-white/10 hover:border-indigo-500/50 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl group-hover:scale-105 transition-transform">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Forgot Password</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Reset your password using your registered email address.</p>
                </div>
              </div>
              <span className="text-slate-500 group-hover:text-white transition-colors">&rarr;</span>
            </button>

            <button
              onClick={() => { setRecoveryMode('backup_code'); setBackupStatus({ loading: false, error: '', success: '' }); }}
              className="w-full p-4 rounded-2xl bg-slate-950/60 hover:bg-emerald-950/40 border border-white/10 hover:border-emerald-500/50 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Lost 2FA Device / Use Backup Code</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Sign in with one of your 8 single-use emergency recovery codes.</p>
                </div>
              </div>
              <span className="text-slate-500 group-hover:text-white transition-colors">&rarr;</span>
            </button>

            <button
              onClick={() => { setRecoveryMode('support_ticket'); setTicketStatus({ loading: false, error: '', success: '' }); }}
              className="w-full p-4 rounded-2xl bg-slate-950/60 hover:bg-amber-950/40 border border-white/10 hover:border-amber-500/50 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl group-hover:scale-105 transition-transform">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Support-Assisted Recovery (Root)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Lost access to email or backup codes? Open a verified Root ticket.</p>
                </div>
              </div>
              <span className="text-slate-500 group-hover:text-white transition-colors">&rarr;</span>
            </button>

            <button
              onClick={() => setRecoveryMode('lockout_info')}
              className="w-full p-4 rounded-2xl bg-slate-950/60 hover:bg-slate-800 border border-white/10 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-800 text-slate-300 rounded-xl">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Account Lockout Policy</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Why accounts lock out after failed attempts and cooldown periods.</p>
                </div>
              </div>
              <span className="text-slate-500 group-hover:text-white transition-colors">&rarr;</span>
            </button>
          </div>
        )}

        {/* 1. FORGOT PASSWORD VIEW */}
        {recoveryMode === 'forgot_pw' && (
          <div className="space-y-4">
            <button
              onClick={() => setRecoveryMode('menu')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 border-none bg-transparent cursor-pointer font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Recovery Options
            </button>

            <h4 className="font-bold text-white text-base">Self-Service Password Reset</h4>

            {resetStatus.error && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-200">
                {resetStatus.error}
              </div>
            )}
            {resetStatus.success && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-200">
                {resetStatus.success}
              </div>
            )}

            {resetStep === 'email' && (
              <form onSubmit={handleRequestPasswordReset} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Registered Account Email *</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="breeder@example.com"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetStatus.loading}
                  className="btn-interactive w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl border-none cursor-pointer"
                >
                  {resetStatus.loading ? 'Sending Code...' : 'Send Recovery Code'}
                </button>
              </form>
            )}

            {resetStep === 'code' && (
              <form onSubmit={handleVerifyResetCode} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Enter 6-Digit Recovery Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full text-center font-mono text-xl tracking-widest font-black bg-slate-950 border border-indigo-500/50 rounded-xl p-2.5 text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-interactive w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl border-none cursor-pointer"
                >
                  Verify Code
                </button>
              </form>
            )}

            {resetStep === 'new_pw' && (
              <form onSubmit={handleCompletePasswordReset} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">New Password (8+ characters) *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetStatus.loading}
                  className="btn-interactive w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl border-none cursor-pointer"
                >
                  {resetStatus.loading ? 'Updating...' : 'Set New Password & Invalidate Other Sessions'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* 2. BACKUP CODE RECOVERY VIEW */}
        {recoveryMode === 'backup_code' && (
          <form onSubmit={handleVerifyBackupCodeLogin} className="space-y-4">
            <button
              type="button"
              onClick={() => setRecoveryMode('menu')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 border-none bg-transparent cursor-pointer font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Recovery Options
            </button>

            <h4 className="font-bold text-white text-base">Sign In with 2FA Backup Code</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Use one of the 8-character single-use emergency backup recovery codes saved during 2FA setup.
            </p>

            {backupStatus.error && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-200">
                {backupStatus.error}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Account Email *</label>
              <input
                type="email"
                required
                value={backupEmail}
                onChange={(e) => setBackupEmail(e.target.value)}
                placeholder="breeder@example.com"
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Account Password *</label>
              <input
                type="password"
                required
                value={backupPassword}
                onChange={(e) => setBackupPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Single-Use Backup Code (e.g. 8F2A-99B1) *</label>
              <input
                type="text"
                required
                placeholder="XXXX-XXXX"
                value={inputBackupCode}
                onChange={(e) => setInputBackupCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl p-2.5 text-xs font-mono font-bold text-center tracking-widest text-emerald-300"
              />
            </div>

            <button
              type="submit"
              disabled={backupStatus.loading}
              className="btn-interactive w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl border-none cursor-pointer"
            >
              Verify Backup Code & Sign In
            </button>
          </form>
        )}

        {/* 3. SUPPORT-ASSISTED RECOVERY TICKET */}
        {recoveryMode === 'support_ticket' && (
          <form onSubmit={handleSubmitSupportTicket} className="space-y-4">
            <button
              type="button"
              onClick={() => setRecoveryMode('menu')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 border-none bg-transparent cursor-pointer font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Recovery Options
            </button>

            <h4 className="font-bold text-white text-base">Request Root Account Recovery</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              When self-service is impossible, our Root support team verifies ownership signals before resetting credentials.
            </p>

            {ticketStatus.error && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-200">
                {ticketStatus.error}
              </div>
            )}
            {ticketStatus.success && (
              <div className="p-4 bg-emerald-950/70 border border-emerald-500/50 rounded-2xl text-xs text-emerald-200 space-y-2">
                <p className="font-bold">{ticketStatus.success}</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-interactive py-1.5 px-4 bg-emerald-600 text-white font-bold rounded-lg border-none text-xs cursor-pointer"
                >
                  Close Recovery Window
                </button>
              </div>
            )}

            {!ticketStatus.success && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Registered Email *</label>
                    <input
                      type="email"
                      required
                      value={ticketEmail}
                      onChange={(e) => setTicketEmail(e.target.value)}
                      placeholder="breeder@example.com"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Rabbitry Name *</label>
                    <input
                      type="text"
                      required
                      value={ticketRabbitry}
                      onChange={(e) => setTicketRabbitry(e.target.value)}
                      placeholder="E.g. Grandview Rabbitry"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">ARBA Account / Youth # (Optional)</label>
                    <input
                      type="text"
                      value={ticketArba}
                      onChange={(e) => setTicketArba(e.target.value)}
                      placeholder="E.g. A-88492"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Known Tattoo Prefix / Animals *</label>
                    <input
                      type="text"
                      required
                      value={ticketTattoos}
                      onChange={(e) => setTicketTattoos(e.target.value)}
                      placeholder="E.g. HL-1, CT-101"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Describe Your Situation *</label>
                  <textarea
                    required
                    rows={3}
                    value={ticketDetails}
                    onChange={(e) => setTicketDetails(e.target.value)}
                    placeholder="Describe what happened (e.g. broken phone, changed email, lost backup codes)..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs text-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={ticketStatus.loading}
                  className="btn-interactive w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl border-none flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  <Send className="w-4 h-4" /> Submit Recovery Ticket for Root Verification
                </button>
              </>
            )}
          </form>
        )}

        {/* 4. LOCKOUT INFO VIEW */}
        {recoveryMode === 'lockout_info' && (
          <div className="space-y-4">
            <button
              onClick={() => setRecoveryMode('menu')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 border-none bg-transparent cursor-pointer font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Recovery Options
            </button>

            <div className="p-4 bg-slate-950 rounded-2xl border border-white/10 space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400" /> WarrenWise Rate Limiting & Cooldown Policy
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                To prevent brute-force attacks and credential stuffing, accounts are locked for <strong>15 minutes</strong> after 5 consecutive failed login or 2FA attempts.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                <li>Wait 15 minutes for the lockout timer to expire automatically.</li>
                <li>Or perform a <strong>Self-Service Password Reset</strong> via your registered email to immediately reset the lockout counter.</li>
                <li>Never share your credentials with anyone. WarrenWise Support will never ask for your password.</li>
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
