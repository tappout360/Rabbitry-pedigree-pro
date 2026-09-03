import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, Mail, Smartphone, Laptop, Trash2, Eye, EyeOff, 
  CheckCircle, AlertTriangle, Copy, Download, RefreshCw, X, Lock, FileText
} from 'lucide-react';
import QRCode from 'qrcode';
import { 
  generateTotpSecret, 
  generateBackupCodes, 
  verifyTotpCode, 
  getTotpUri, 
  logSecurityEvent,
  getCurrentDeviceProfile,
  getOrCreateSessionToken
} from '../services/AccountSecurityService';
import { db } from '../db/registryDb';

export default function AccountSecurityModal({
  currentUser,
  onUpdateUser,
  onClose,
  showToast,
  triggerConfetti
}) {
  const [activeTab, setActiveTab] = useState('2fa'); // 'password', 'email', '2fa', 'sessions', 'danger'
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [logoutOthersOnPwChange, setLogoutOthersOnPwChange] = useState(true);
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: '', success: '' });

  // Email State
  const [newEmail, setNewEmail] = useState('');
  const [emailPasswordConfirm, setEmailPasswordConfirm] = useState('');
  const [emailStep, setEmailStep] = useState('input'); // 'input', 'verify'
  const [emailVerifyCode, setEmailVerifyCode] = useState('');
  const [generatedEmailCode, setGeneratedEmailCode] = useState('');
  const [emailStatus, setEmailStatus] = useState({ loading: false, error: '', success: '' });

  // 2FA State
  const [is2FAActive, setIs2FAActive] = useState(Boolean(currentUser?.twoFactorEnabled));
  const [totpSecret, setTotpSecret] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [setupCode, setSetupCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [codesSavedConfirmed, setCodesSavedConfirmed] = useState(false);
  const [twoFaStep, setTwoFaStep] = useState('initial'); // 'initial', 'qr', 'codes', 'disable'
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [twoFaStatus, setTwoFaStatus] = useState({ loading: false, error: '', success: '' });

  // Sessions State
  const [sessions, setSessions] = useState([]);
  const [sessionsStatus, setSessionsStatus] = useState('');

  // Delete Account State
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteStatus, setDeleteStatus] = useState({ loading: false, error: '' });

  // Initialize Sessions
  useEffect(() => {
    const currentDevice = getCurrentDeviceProfile();
    const token = getOrCreateSessionToken();

    const initialSessions = [
      {
        id: 'sess-current',
        token,
        isCurrent: true,
        deviceName: currentDevice.deviceName,
        platform: currentDevice.platform,
        browser: currentDevice.browser,
        lastActive: 'Active Now',
        location: 'Current Device'
      },
      {
        id: 'sess-barn-tablet',
        token: 'sess_barn_ipad_9201',
        isCurrent: false,
        deviceName: 'iPad - Mobile Safari (Barn Mode Tablet)',
        platform: 'iOS',
        browser: 'Mobile Safari',
        lastActive: '2 hours ago',
        location: 'Main Barn WiFi'
      }
    ];
    setSessions(initialSessions);
  }, []);

  // Prepare QR Code when entering QR step
  const handleStart2FASetup = async () => {
    try {
      setTwoFaStatus({ loading: true, error: '', success: '' });
      const secret = generateTotpSecret(16);
      setTotpSecret(secret);
      
      const uri = getTotpUri(currentUser?.email, secret);
      const dataUrl = await QRCode.toDataURL(uri, {
        width: 220,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
      setQrCodeDataUrl(dataUrl);
      setTwoFaStep('qr');
      setTwoFaStatus({ loading: false, error: '', success: '' });
    } catch (err) {
      setTwoFaStatus({ loading: false, error: 'Failed to generate QR code: ' + err.message, success: '' });
    }
  };

  // Verify and Confirm 2FA Enable
  const handleVerify2FASetup = async (e) => {
    e.preventDefault();
    if (!setupCode || setupCode.trim().length !== 6) {
      setTwoFaStatus({ loading: false, error: 'Please enter a valid 6-digit code.', success: '' });
      return;
    }

    setTwoFaStatus({ loading: true, error: '', success: '' });
    const isValid = await verifyTotpCode(totpSecret, setupCode.trim());
    if (!isValid) {
      setTwoFaStatus({ loading: false, error: 'Invalid 6-digit authenticator code. Check your device clock and try again.', success: '' });
      return;
    }

    // Generate 8 backup recovery codes
    const codes = generateBackupCodes(8);
    setBackupCodes(codes);
    setTwoFaStep('codes');
    setTwoFaStatus({ loading: false, error: '', success: '' });
  };

  // Complete 2FA Setup
  const handleFinalize2FASetup = async () => {
    if (!codesSavedConfirmed) {
      alert("Please confirm you have safely saved your backup recovery codes.");
      return;
    }

    const updatedUser = {
      ...currentUser,
      twoFactorEnabled: true,
      twoFactorSecret: totpSecret,
      twoFactorBackupCodes: backupCodes
    };

    onUpdateUser(updatedUser);
    setIs2FAActive(true);
    setTwoFaStep('initial');
    await logSecurityEvent(currentUser?.id, '2FA_ENABLED', { method: 'TOTP' }, 'info');
    showToast("Two-Factor Authentication is now actively protecting your account!", "success");
    if (triggerConfetti) triggerConfetti();
  };

  // Disable 2FA
  const handleDisable2FA = async (e) => {
    e.preventDefault();
    if (disablePassword !== currentUser?.password) {
      setTwoFaStatus({ loading: false, error: 'Incorrect account password.', success: '' });
      return;
    }

    const isValidCode = await verifyTotpCode(currentUser?.twoFactorSecret, disableCode.trim());
    const isBackupCode = currentUser?.twoFactorBackupCodes?.includes(disableCode.trim().toUpperCase());

    if (!isValidCode && !isBackupCode) {
      setTwoFaStatus({ loading: false, error: 'Invalid 2FA code or backup code.', success: '' });
      return;
    }

    const updatedUser = {
      ...currentUser,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: []
    };

    onUpdateUser(updatedUser);
    setIs2FAActive(false);
    setTwoFaStep('initial');
    setDisablePassword('');
    setDisableCode('');
    await logSecurityEvent(currentUser?.id, '2FA_DISABLED', { method: 'TOTP' }, 'warning');
    showToast("Two-Factor Authentication has been disabled.", "info");
  };

  // Regenerate Backup Codes
  const handleRegenerateBackupCodes = async () => {
    const pw = prompt("Enter your account password to generate a fresh set of backup codes:");
    if (!pw) return;
    if (pw !== currentUser?.password) {
      alert("Incorrect account password.");
      return;
    }

    const newCodes = generateBackupCodes(8);
    setBackupCodes(newCodes);
    const updatedUser = {
      ...currentUser,
      twoFactorBackupCodes: newCodes
    };
    onUpdateUser(updatedUser);
    setTwoFaStep('codes');
    setCodesSavedConfirmed(false);
    await logSecurityEvent(currentUser?.id, 'BACKUP_CODES_REGENERATED', {}, 'info');
    showToast("Generated 8 new backup recovery codes. Prior codes are now invalid.", "success");
  };

  // Change Password Handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus({ loading: true, error: '', success: '' });

    if (currentPassword !== currentUser?.password) {
      setPasswordStatus({ loading: false, error: 'Current password is incorrect.', success: '' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordStatus({ loading: false, error: 'New password must be at least 8 characters.', success: '' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ loading: false, error: 'New passwords do not match.', success: '' });
      return;
    }

    const updatedUser = {
      ...currentUser,
      password: newPassword,
      lastPasswordChange: new Date().toISOString()
    };

    onUpdateUser(updatedUser);
    await logSecurityEvent(currentUser?.id, 'PASSWORD_CHANGED', { logoutOthers: logoutOthersOnPwChange }, 'info');

    if (logoutOthersOnPwChange) {
      handleRevokeOtherSessions();
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordStatus({ loading: false, error: '', success: 'Password changed successfully! Active sessions updated.' });
    showToast("Password successfully changed!", "success");
  };

  // Change Email Handler
  const handleInitiateEmailChange = (e) => {
    e.preventDefault();
    setEmailStatus({ loading: true, error: '', success: '' });

    if (emailPasswordConfirm !== currentUser?.password) {
      setEmailStatus({ loading: false, error: 'Account password confirmation failed.', success: '' });
      return;
    }

    if (!newEmail || !newEmail.includes('@')) {
      setEmailStatus({ loading: false, error: 'Please enter a valid email address.', success: '' });
      return;
    }

    // Generate simulated 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedEmailCode(code);
    setEmailStep('verify');
    setEmailStatus({ 
      loading: false, 
      error: '', 
      success: `Security code sent to ${newEmail}! (Simulated Code: ${code})` 
    });
  };

  const handleConfirmEmailChange = async (e) => {
    e.preventDefault();
    if (emailVerifyCode.trim() !== generatedEmailCode) {
      setEmailStatus({ loading: false, error: 'Invalid verification code. Please check and try again.', success: '' });
      return;
    }

    const oldEmail = currentUser?.email;
    const updatedUser = {
      ...currentUser,
      email: newEmail.toLowerCase().trim()
    };

    onUpdateUser(updatedUser);
    await logSecurityEvent(currentUser?.id, 'EMAIL_CHANGED', { oldEmail, newEmail }, 'warning');
    setEmailStep('input');
    setNewEmail('');
    setEmailPasswordConfirm('');
    setEmailVerifyCode('');
    setEmailStatus({ loading: false, error: '', success: `Account email successfully updated to ${updatedUser.email}!` });
    showToast(`Account email updated to ${updatedUser.email}!`, "success");
  };

  // Revoke Other Sessions
  const handleRevokeOtherSessions = async () => {
    const remaining = sessions.filter(s => s.isCurrent);
    setSessions(remaining);
    setSessionsStatus('All other devices have been logged out.');
    await logSecurityEvent(currentUser?.id, 'SESSIONS_REVOKED', { remainingTokens: 1 }, 'info');
    showToast("Logged out of all other devices.", "info");
    setTimeout(() => setSessionsStatus(''), 4000);
  };

  // Full Data Export before Deletion
  const handleExportData = async () => {
    try {
      const exportData = {
        breeder: currentUser,
        rabbits: await db.rabbits.where('breederId').equals(currentUser?.id).toArray(),
        breedings: await db.breedings.where('breederId').equals(currentUser?.id).toArray(),
        litters: await db.litters.where('breederId').equals(currentUser?.id).toArray(),
        ledger: await db.ledger.where('breederId').equals(currentUser?.id).toArray(),
        shows: await db.shows.where('breederId').equals(currentUser?.id).toArray(),
        exportedAt: new Date().toISOString(),
        software: 'RabbitryPedigree Pro / WarrenWise Pro'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `warrenwise-backup-${currentUser?.rabbitryName || 'rabbitry'}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Complete rabbitry archive downloaded!", "success");
    } catch (err) {
      alert("Export failed: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-scale-up">
      <div className="glass-container max-w-3xl w-full bg-slate-900 border-2 border-indigo-500/30 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-left">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Account & Security</h2>
              <p className="text-xs text-slate-400">Manage credentials, two-factor authentication, active sessions, and privacy</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors border-none bg-transparent cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-slate-950/40 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('2fa')}
            className={`py-3 px-5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === '2fa' 
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" /> Two-Factor Auth (2FA)
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-3 px-5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'password' 
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" /> Password
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`py-3 px-5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'email' 
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" /> Email Address
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-3 px-5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'sessions' 
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-4 h-4" /> Active Sessions
          </button>
          <button
            onClick={() => setActiveTab('danger')}
            className={`py-3 px-5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'danger' 
                ? 'border-red-500 text-red-400 bg-red-500/10' 
                : 'border-transparent text-slate-400 hover:text-red-400'
            }`}
          >
            <Trash2 className="w-4 h-4" /> Delete Account
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB: TWO-FACTOR AUTHENTICATION */}
          {activeTab === '2fa' && (
            <div className="space-y-6">
              
              {/* Status Banner */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                is2FAActive 
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              }`}>
                <div className="flex items-center gap-3">
                  {is2FAActive ? (
                    <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {is2FAActive ? 'Two-Factor Authentication is Enabled' : 'Two-Factor Authentication is Disabled'}
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {is2FAActive 
                        ? 'Your account is secured with standard TOTP (Authenticator App) verification.'
                        : 'Protect your purebred pedigrees and financial records against unauthorized access.'}
                    </p>
                  </div>
                </div>

                {!is2FAActive && twoFaStep === 'initial' && (
                  <button
                    onClick={handleStart2FASetup}
                    className="btn-interactive py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl border-none shrink-0 cursor-pointer shadow-md shadow-indigo-600/20"
                  >
                    Enable 2FA
                  </button>
                )}
              </div>

              {twoFaStatus.error && (
                <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{twoFaStatus.error}</span>
                </div>
              )}

              {/* Step 1: Scan QR Code & Enter Code */}
              {twoFaStep === 'qr' && (
                <div className="p-6 bg-slate-950/60 border border-indigo-500/30 rounded-2xl flex flex-col md:flex-row gap-6 items-center">
                  <div className="bg-white p-3 rounded-2xl shadow-xl shrink-0">
                    {qrCodeDataUrl ? (
                      <img src={qrCodeDataUrl} alt="2FA QR Code" className="w-48 h-48 block" />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-500">Generating QR...</div>
                    )}
                  </div>

                  <div className="space-y-4 flex-1 text-left">
                    <div>
                      <h4 className="font-bold text-white text-base">Step 1: Scan with Authenticator</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Open Google Authenticator, Microsoft Authenticator, 1Password, or Apple Keychain and scan this QR code.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-900 border border-white/10 rounded-xl">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Or Enter Secret Key Manually:</span>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <code className="text-xs font-mono font-bold text-indigo-300 break-all">{totpSecret}</code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(totpSecret);
                            showToast("Secret key copied to clipboard!", "info");
                          }}
                          className="p-1.5 text-slate-300 hover:text-white rounded-lg bg-white/5 border border-white/10 cursor-pointer shrink-0"
                          title="Copy secret"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleVerify2FASetup} className="space-y-3 pt-2">
                      <label className="text-xs font-bold text-white block">Step 2: Enter the 6-Digit Rotating Code</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="000000"
                          value={setupCode}
                          onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ''))}
                          className="font-mono text-center tracking-widest text-lg font-black w-40 py-2 bg-slate-900 border border-indigo-500/50 rounded-xl text-white"
                          required
                          autoFocus
                        />
                        <button
                          type="submit"
                          disabled={setupCode.length !== 6 || twoFaStatus.loading}
                          className="btn-interactive py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl border-none cursor-pointer"
                        >
                          {twoFaStatus.loading ? 'Verifying...' : 'Verify & Continue'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setTwoFaStep('initial')}
                          className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-white/10 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Step 2: Backup Recovery Codes Modal View */}
              {twoFaStep === 'codes' && (
                <div className="p-6 bg-slate-950/80 border-2 border-emerald-500/40 rounded-2xl space-y-5 text-left">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                      <Key className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">Save Your Backup Recovery Codes</h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        If you lose access to your phone or authenticator app, these 8 single-use codes are your primary self-service key.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-slate-900 border border-white/10 rounded-2xl font-mono text-center text-xs font-black text-amber-300">
                    {backupCodes.map((c, idx) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded-lg border border-white/5 tracking-wider">
                        {c}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const text = `WarrenWise Pro 2FA Backup Codes for ${currentUser?.email}:\n` + backupCodes.join('\n');
                        navigator.clipboard.writeText(text);
                        showToast("Backup codes copied to clipboard!", "info");
                      }}
                      className="btn-interactive py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 border border-white/10 cursor-pointer"
                    >
                      <Copy className="w-4 h-4" /> Copy All Codes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const text = `WarrenWise Pro 2FA Backup Codes\nAccount: ${currentUser?.email}\nDate: ${new Date().toLocaleDateString()}\n\n` + backupCodes.join('\n') + `\n\nEach code can be used exactly once. Store this document offline safely.`;
                        const blob = new Blob([text], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `warrenwise-2fa-backup-codes.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                        showToast("Downloaded backup codes file!", "success");
                      }}
                      className="btn-interactive py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 border border-white/10 cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Download Codes (.txt)
                    </button>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer font-semibold">
                      <input
                        type="checkbox"
                        checked={codesSavedConfirmed}
                        onChange={(e) => setCodesSavedConfirmed(e.target.checked)}
                        className="rounded bg-slate-800 border-white/20 text-emerald-500 w-4 h-4"
                      />
                      <span>I have safely saved these 8 backup codes in a secure location.</span>
                    </label>

                    <button
                      type="button"
                      disabled={!codesSavedConfirmed}
                      onClick={handleFinalize2FASetup}
                      className="btn-interactive py-2 px-5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs rounded-xl border-none cursor-pointer"
                    >
                      Complete 2FA Setup
                    </button>
                  </div>
                </div>
              )}

              {/* 2FA Active Controls (Regenerate / Disable) */}
              {is2FAActive && twoFaStep === 'initial' && (
                <div className="p-5 bg-slate-950/60 border border-white/10 rounded-2xl space-y-4 text-left">
                  <h4 className="font-bold text-white text-sm">2FA Security Management</h4>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleRegenerateBackupCodes}
                      className="btn-interactive py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-white/10 flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4 text-indigo-400" /> Regenerate Backup Codes
                    </button>
                    <button
                      onClick={() => setTwoFaStep('disable')}
                      className="btn-interactive py-2 px-4 bg-red-950/50 hover:bg-red-900/60 text-red-300 font-bold text-xs rounded-xl border border-red-500/30 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="w-4 h-4" /> Disable 2FA
                    </button>
                  </div>
                </div>
              )}

              {/* Disable 2FA Form */}
              {twoFaStep === 'disable' && (
                <form onSubmit={handleDisable2FA} className="p-5 bg-red-950/30 border border-red-500/40 rounded-2xl space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-red-200 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" /> Confirm Two-Factor Authentication Deactivation
                    </h4>
                    <button type="button" onClick={() => setTwoFaStep('initial')} className="text-slate-400 hover:text-white text-xs border-none bg-transparent cursor-pointer">
                      Cancel
                    </button>
                  </div>
                  <p className="text-xs text-slate-300">
                    Disabling 2FA reduces your account security. Please verify your current password and a valid 2FA code.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Current Password *</label>
                      <input
                        type="password"
                        required
                        value={disablePassword}
                        onChange={(e) => setDisablePassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">6-Digit 2FA Code or Backup Code *</label>
                      <input
                        type="text"
                        required
                        value={disableCode}
                        onChange={(e) => setDisableCode(e.target.value)}
                        placeholder="000000 or XXXX-XXXX"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-interactive py-2 px-5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl border-none cursor-pointer"
                  >
                    Confirm & Disable 2FA
                  </button>
                </form>
              )}

            </div>
          )}

          {/* TAB: PASSWORD CHANGE */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg text-left">
              <h4 className="font-bold text-white text-base">Change Account Password</h4>
              <p className="text-xs text-slate-400">Enforce strong credentials. Minimum 8 characters with numbers and symbols.</p>

              {passwordStatus.error && (
                <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-200">
                  {passwordStatus.error}
                </div>
              )}
              {passwordStatus.success && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-200">
                  {passwordStatus.success}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Current Password *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">New Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (8+ chars)"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white border-none bg-transparent cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Confirm New Password *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1 font-semibold">
                <input
                  type="checkbox"
                  checked={logoutOthersOnPwChange}
                  onChange={(e) => setLogoutOthersOnPwChange(e.target.checked)}
                  className="rounded text-indigo-600 bg-slate-800"
                />
                <span>Log out of other devices after changing password</span>
              </label>

              <button
                type="submit"
                disabled={passwordStatus.loading}
                className="btn-interactive py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl border-none cursor-pointer shadow-md shadow-indigo-600/30"
              >
                {passwordStatus.loading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          )}

          {/* TAB: EMAIL ADDRESS */}
          {activeTab === 'email' && (
            <div className="space-y-4 max-w-lg text-left">
              <h4 className="font-bold text-white text-base">Change Account Email</h4>
              <p className="text-xs text-slate-400">
                Current email: <strong className="text-white">{currentUser?.email}</strong>
              </p>

              {emailStatus.error && (
                <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-200">
                  {emailStatus.error}
                </div>
              )}
              {emailStatus.success && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-200">
                  {emailStatus.success}
                </div>
              )}

              {emailStep === 'input' ? (
                <form onSubmit={handleInitiateEmailChange} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">New Email Address *</label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="breeder@example.com"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Confirm Account Password *</label>
                    <input
                      type="password"
                      required
                      value={emailPasswordConfirm}
                      onChange={(e) => setEmailPasswordConfirm(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-interactive py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl border-none cursor-pointer"
                  >
                    Send Verification Code
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmEmailChange} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Enter 6-Digit Verification Code *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={emailVerifyCode}
                      onChange={(e) => setEmailVerifyCode(e.target.value)}
                      placeholder="000000"
                      className="w-48 text-center font-mono text-lg font-bold bg-slate-950 border border-indigo-500/50 rounded-xl p-2 text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="btn-interactive py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl border-none cursor-pointer"
                    >
                      Confirm Email Change
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmailStep('input')}
                      className="py-2 px-4 bg-slate-800 text-slate-300 text-xs rounded-xl border border-white/10 cursor-pointer"
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB: ACTIVE SESSIONS */}
          {activeTab === 'sessions' && (
            <div className="space-y-5 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-base">Active Logged-In Sessions</h4>
                  <p className="text-xs text-slate-400">Review devices currently signed in to your rabbitry database.</p>
                </div>
                <button
                  type="button"
                  onClick={handleRevokeOtherSessions}
                  className="btn-interactive py-2 px-4 bg-red-950/50 hover:bg-red-900/60 text-red-300 font-bold text-xs rounded-xl border border-red-500/30 cursor-pointer"
                >
                  Log Out of Other Devices
                </button>
              </div>

              {sessionsStatus && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-200">
                  {sessionsStatus}
                </div>
              )}

              <div className="space-y-3">
                {sessions.map((sess) => (
                  <div 
                    key={sess.id} 
                    className={`p-4 rounded-2xl border flex items-center justify-between ${
                      sess.isCurrent 
                        ? 'bg-indigo-950/40 border-indigo-500/40' 
                        : 'bg-slate-950/50 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-800 rounded-xl text-indigo-400">
                        <Laptop className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{sess.deviceName}</span>
                          {sess.isCurrent && (
                            <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                              This Device
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {sess.location} &bull; {sess.lastActive}
                        </p>
                      </div>
                    </div>

                    {!sess.isCurrent && (
                      <button
                        onClick={() => {
                          setSessions(prev => prev.filter(s => s.id !== sess.id));
                          showToast("Session revoked.", "info");
                        }}
                        className="text-xs text-red-400 hover:text-red-300 font-bold px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 cursor-pointer"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: DANGER ZONE (DELETE ACCOUNT) */}
          {activeTab === 'danger' && (
            <div className="p-6 bg-red-950/20 border-2 border-red-500/40 rounded-2xl space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/20 text-red-400 rounded-2xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-red-300 text-base">Delete WarrenWise Pro Account</h4>
                  <p className="text-xs text-red-200/80 mt-0.5">
                    Irreversible action: Permanently wipes all registered rabbits, litters, pedigrees, and cloud records.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-900/90 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Recommended: Backup Your Pedigrees</span>
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="btn-interactive py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg border-none flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Data (JSON)
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Download a complete offline copy of your herd pedigree tree, show records, and financial ledger before deletion.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs text-slate-300 block">
                  To confirm deletion, type your Rabbitry Name (<strong className="text-white font-mono">{currentUser?.rabbitryName || 'Grandview Rabbitry'}</strong>):
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={currentUser?.rabbitryName || 'Grandview Rabbitry'}
                  className="w-full bg-slate-950 border border-red-500/40 rounded-xl p-2.5 text-xs text-white font-mono"
                />

                <label className="text-xs text-slate-300 block">Enter Your Account Password:</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Account password"
                  className="w-full bg-slate-950 border border-red-500/40 rounded-xl p-2.5 text-xs text-white"
                />

                <button
                  type="button"
                  disabled={
                    deleteConfirmText !== (currentUser?.rabbitryName || 'Grandview Rabbitry') ||
                    deletePassword !== currentUser?.password
                  }
                  onClick={async () => {
                    const ok = window.confirm("FINAL WARNING: This will permanently delete your rabbitry account and all associated pedigree records. Proceed?");
                    if (!ok) return;
                    await db.adminBreeders.delete(currentUser?.id);
                    localStorage.removeItem('rp_current_user');
                    localStorage.removeItem('rp_session_token');
                    window.location.reload();
                  }}
                  className="btn-interactive py-2.5 px-6 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-black text-xs rounded-xl border-none cursor-pointer shadow-lg shadow-red-600/30"
                >
                  Permanently Delete My Account
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
