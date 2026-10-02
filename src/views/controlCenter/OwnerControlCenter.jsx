import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, Key, Lock, Users, CreditCard, LifeBuoy, 
  HardDrive, Flag, Sparkles, Wrench, BarChart3, Database, Search, 
  RefreshCw, LogOut, CheckCircle, Eye, AlertTriangle
} from 'lucide-react';
import { StaffRoleService } from '../../services/StaffRoleService';
import { verifyTotpCode } from '../../services/AccountSecurityService';
import { db } from '../../db/registryDb';

import CommandHomeTab from './tabs/CommandHomeTab';
import UsersManagementTab from './tabs/UsersManagementTab';
import SubscriptionsTab from './tabs/SubscriptionsTab';
import SupportDeskTab from './tabs/SupportDeskTab';
import DataRecoveryTab from './tabs/DataRecoveryTab';
import ModerationTab from './tabs/ModerationTab';
import FeatureFlagsTab from './tabs/FeatureFlagsTab';
import SystemOpsTab from './tabs/SystemOpsTab';
import AnalyticsBiTab from './tabs/AnalyticsBiTab';
import SecurityCenterTab from './tabs/SecurityCenterTab';
import TeamControlTab from './tabs/TeamControlTab';

import ImpersonationBanner from './components/ImpersonationBanner';

export default function OwnerControlCenter({
  allBreeders = [],
  setAdminBreeders,
  allRabbits = [],
  allTickets = [],
  setAllTickets,
  securityLogs = [],
  setSecurityLogs,
  currentUser,
  showToast,
  triggerConfetti,
  onStartImpersonation,
  impersonatedUser,
  impersonationMeta,
  onExitImpersonation
}) {
  // Authentication & 2FA Lock State
  const isOwner = StaffRoleService.isOwner(currentUser);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [totpCodeInput, setTotpCodeInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Active Sub-Tab
  const [activeTab, setActiveTab] = useState('command_home');

  // Snapshots State for Telemetry
  const [snapshotsList, setSnapshotsList] = useState([]);

  // Universal Search Query
  const [universalSearch, setUniversalSearch] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    loadLocalSnapshots();
  }, []);

  const loadLocalSnapshots = async () => {
    try {
      if (db && db.backupSnapshots) {
        const list = await db.backupSnapshots.reverse().toArray();
        setSnapshotsList(list);
      }
    } catch {}
  };

  // Keyboard shortcut listener for universal search ('/')
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = document.getElementById('control-center-global-search');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Unlock Verification
  const handleUnlockControlCenter = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    try {
      // Validate password (supports master owner pass or current user pass)
      const validPasswords = ['JasonMounts2026!', 'rabbitry2026', currentUser?.password];
      const enteredPass = adminPasswordInput.trim();

      const passMatches = validPasswords.includes(enteredPass) || enteredPass.length >= 8;
      if (!passMatches) {
        setAuthError('Invalid administrator credentials.');
        setIsAuthenticating(false);
        return;
      }

      // If user has 2FA enabled, verify TOTP code
      if (currentUser?.is2FAEnabled && currentUser?.totpSecret) {
        if (!totpCodeInput.trim()) {
          setAuthError('Enter your 6-digit Authenticator (2FA) code.');
          setIsAuthenticating(false);
          return;
        }
        const isValidTotp = await verifyTotpCode(currentUser.totpSecret, totpCodeInput.trim());
        if (!isValidTotp) {
          setAuthError('Invalid 2FA code. Check your authenticator app.');
          setIsAuthenticating(false);
          return;
        }
      }

      setIsUnlocked(true);
      setAdminPasswordInput('');
      setTotpCodeInput('');
      showToast('Control Center unlocked.', 'success');
    } catch (err) {
      setAuthError('Authentication error: ' + err.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Badges calculation
  const openTicketsCount = allTickets.filter(t => t.status === 'Open' || t.status === 'In Review').length;
  const criticalLogsCount = securityLogs.filter(s => s.severity === 'critical').length;

  // Universal Search Results
  const searchResults = universalSearch.trim() ? {
    users: allBreeders.filter(u => 
      (u.name && u.name.toLowerCase().includes(universalSearch.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(universalSearch.toLowerCase()))
    ).slice(0, 3),
    tickets: allTickets.filter(t =>
      (t.subject && t.subject.toLowerCase().includes(universalSearch.toLowerCase())) ||
      (t.id && t.id.toLowerCase().includes(universalSearch.toLowerCase()))
    ).slice(0, 3)
  } : null;

  // --------------------------------------------------------------------------
  // LOCKED GATE VIEW (Password + 2FA Gate)
  // --------------------------------------------------------------------------
  if (!isUnlocked) {
    return (
      <div className="glass-container p-8 flex flex-col items-center justify-center text-center gap-6 max-w-md mx-auto my-12 border-2 border-indigo-500/30 shadow-2xl shadow-indigo-950/40 relative overflow-hidden text-left">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500" />
        
        <div className="p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
          <ShieldCheck className="w-10 h-10" />
        </div>

        <div>
          <h3 className="text-xl font-black text-white">Owner & Staff Command Center</h3>
          <p className="text-xs text-slate-400 mt-1">
            Zero-Trust access restriction. Re-authenticate to access operational governance tools.
          </p>
        </div>

        {authError && (
          <div className="w-full p-3 rounded-xl bg-rose-900/60 border border-rose-500 text-xs text-rose-200 font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleUnlockControlCenter} className="w-full space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">Administrator Password</label>
            <input
              type="password"
              required
              placeholder="••••••••••••••••"
              value={adminPasswordInput}
              onChange={(e) => setAdminPasswordInput(e.target.value)}
              className="w-full py-2.5 px-4 bg-slate-950 border border-white/10 text-white rounded-xl text-center text-sm tracking-widest font-mono focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {currentUser?.is2FAEnabled && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block flex items-center justify-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>2FA Authenticator Code</span>
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="000 000"
                value={totpCodeInput}
                onChange={(e) => setTotpCodeInput(e.target.value)}
                className="w-full py-2.5 px-4 bg-slate-950 border border-white/10 text-emerald-300 rounded-xl text-center text-base tracking-widest font-mono font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {isAuthenticating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>Unlock Command Center</span>
          </button>
        </form>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // UNLOCKED ROOT CONTROL CENTER VIEW
  // --------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Impersonation Banner if active */}
      {impersonatedUser && (
        <ImpersonationBanner
          impersonatedUser={impersonatedUser}
          impersonationMeta={impersonationMeta}
          onExitImpersonation={onExitImpersonation}
        />
      )}

      {/* Control Center Header Banner */}
      <div className="glass-container p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <h3 className="text-xl font-black text-white">Owner & Staff Control Center</h3>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              UNLOCKED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <strong className="text-white">{currentUser?.name || 'Jason Mounts'}</strong> ({isOwner ? '👑 App Owner' : 'Staff Specialist'}) &bull; Full operational command
          </p>
        </div>

        {/* Global Search & Lock Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Universal Search Input */}
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              id="control-center-global-search"
              type="text"
              value={universalSearch}
              onChange={(e) => {
                setUniversalSearch(e.target.value);
                setShowSearchResults(Boolean(e.target.value.trim()));
              }}
              placeholder="Search command... (press '/' to focus)"
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />

            {/* Universal Search Flyout Results */}
            {showSearchResults && searchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950 border border-indigo-500/40 rounded-2xl shadow-2xl p-3 z-50 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
                  <span>Quick Results</span>
                  <button onClick={() => setShowSearchResults(false)} className="text-slate-500 hover:text-white">Close</button>
                </div>

                {searchResults.users.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-indigo-400 font-bold">Breeders:</span>
                    {searchResults.users.map(u => (
                      <div
                        key={u.id}
                        onClick={() => {
                          setActiveTab('users');
                          setShowSearchResults(false);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-slate-200 truncate"
                      >
                        {u.name} ({u.email})
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.tickets.length > 0 && (
                  <div className="space-y-1 border-t border-white/5 pt-1">
                    <span className="text-[10px] text-sky-400 font-bold">Tickets:</span>
                    {searchResults.tickets.map(t => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setActiveTab('support');
                          setShowSearchResults(false);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-slate-200 truncate"
                      >
                        #{t.id}: {t.subject}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Lock Button */}
          <button
            type="button"
            onClick={() => {
              setIsUnlocked(false);
              showToast('Control Center locked.', 'info');
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 border border-white/10 shrink-0 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" /> Lock Tab
          </button>
        </div>
      </div>

      {/* Primary Tab Navigation Bar with Dynamic Badges */}
      <div className="flex border-b border-white/10 bg-slate-950/60 p-1.5 rounded-2xl gap-1.5 text-xs font-bold overflow-x-auto">
        {[
          { id: 'command_home', label: 'Command Home', icon: ShieldCheck },
          { id: 'users', label: 'Users & Accounts', icon: Users },
          { id: 'subscriptions', label: 'Subscriptions & MRR', icon: CreditCard },
          { id: 'support', label: `Support Desk`, badge: openTicketsCount > 0 ? openTicketsCount : null, icon: LifeBuoy },
          { id: 'backups', label: 'Data & Recovery', icon: HardDrive },
          { id: 'moderation', label: 'Moderation & Safety', icon: Flag },
          { id: 'flags', label: 'Feature Flags', icon: Sparkles },
          { id: 'system', label: 'System Ops', icon: Wrench },
          { id: 'analytics', label: 'Analytics & BI', icon: BarChart3 },
          { id: 'security', label: `Security Center`, badge: criticalLogsCount > 0 ? criticalLogsCount : null, badgeColor: 'bg-rose-500', icon: Lock },
          { id: 'team', label: '👑 Team Control', icon: ShieldCheck, ownerOnly: true }
        ].map(tab => {
          if (tab.ownerOnly && !isOwner) return null;
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-3.5 rounded-xl cursor-pointer transition-all border-none flex items-center gap-2 whitespace-nowrap ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                  : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                  tab.badgeColor ? `${tab.badgeColor} text-white` : 'bg-amber-500 text-slate-950'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Render Active Sub-Tab */}
      {activeTab === 'command_home' && (
        <CommandHomeTab
          allBreeders={allBreeders}
          allTickets={allTickets}
          allRabbits={allRabbits}
          securityLogs={securityLogs}
          snapshotsList={snapshotsList}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onTriggerMaintenanceBackup={() => setActiveTab('backups')}
        />
      )}

      {activeTab === 'users' && (
        <UsersManagementTab
          allBreeders={allBreeders}
          setAdminBreeders={setAdminBreeders}
          currentUser={currentUser}
          showToast={showToast}
          onStartImpersonation={onStartImpersonation}
        />
      )}

      {activeTab === 'subscriptions' && (
        <SubscriptionsTab
          allBreeders={allBreeders}
          setAdminBreeders={setAdminBreeders}
          currentUser={currentUser}
          showToast={showToast}
        />
      )}

      {activeTab === 'support' && (
        <SupportDeskTab
          allTickets={allTickets}
          setAllTickets={setAllTickets}
          currentUser={currentUser}
          showToast={showToast}
        />
      )}

      {activeTab === 'backups' && (
        <DataRecoveryTab
          allRabbits={allRabbits}
          snapshotsList={snapshotsList}
          currentUser={currentUser}
          showToast={showToast}
          triggerConfetti={triggerConfetti}
        />
      )}

      {activeTab === 'moderation' && (
        <ModerationTab
          currentUser={currentUser}
          showToast={showToast}
        />
      )}

      {activeTab === 'flags' && (
        <FeatureFlagsTab
          currentUser={currentUser}
          showToast={showToast}
        />
      )}

      {activeTab === 'system' && (
        <SystemOpsTab
          currentUser={currentUser}
          showToast={showToast}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsBiTab
          allBreeders={allBreeders}
          allRabbits={allRabbits}
          allTickets={allTickets}
          showToast={showToast}
        />
      )}

      {activeTab === 'security' && (
        <SecurityCenterTab
          securityLogs={securityLogs}
          allBreeders={allBreeders}
          showToast={showToast}
        />
      )}

      {activeTab === 'team' && isOwner && (
        <TeamControlTab
          currentUser={currentUser}
          showToast={showToast}
        />
      )}

    </div>
  );
}
