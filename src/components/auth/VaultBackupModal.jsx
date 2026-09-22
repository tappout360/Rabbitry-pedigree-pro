import React, { useState } from 'react';
import { 
  X, HardDrive, Download, Upload, ShieldCheck, Lock, 
  FileText, CheckCircle2, AlertTriangle, RefreshCw 
} from 'lucide-react';
import { VaultBackupService } from '../../services/VaultBackupService';

export default function VaultBackupModal({
  isOpen,
  onClose,
  currentUser,
  rabbits = [],
  onRestoreSuccess,
  showToast
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('export'); // 'export', 'restore', 'csv'
  const [passphrase, setPassphrase] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Restore State
  const [selectedFileContent, setSelectedFileContent] = useState(null);
  const [restoreValidation, setRestoreValidation] = useState(null);
  const [restorePassphrase, setRestorePassphrase] = useState('');
  const [restoreMode, setRestoreMode] = useState('merge'); // 'merge', 'replace'

  // Handle Export
  const handleExport = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const result = await VaultBackupService.exportVault({
        passphrase,
        breederName: currentUser?.rabbitryName || currentUser?.name || 'Rabbitry',
        breederId: currentUser?.id
      });
      showToast(`Data Vault exported successfully (${result.filename})!`, 'success');
      setPassphrase('');
    } catch (err) {
      showToast(`Export failed: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle CSV Export
  const handleCsvExport = () => {
    try {
      VaultBackupService.exportStockCsv(rabbits);
      showToast(`Exported ${rabbits.length} animals to CSV!`, 'success');
    } catch (err) {
      showToast(`CSV export failed: ${err.message}`, 'error');
    }
  };

  // Handle File Upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      setSelectedFileContent(content);
      const validation = VaultBackupService.validateVault(content, restorePassphrase);
      setRestoreValidation(validation);
    };
    reader.readAsText(file);
  };

  // Re-validate when passphrase changes
  const handlePassphraseRevalidate = (val) => {
    setRestorePassphrase(val);
    if (selectedFileContent) {
      const validation = VaultBackupService.validateVault(selectedFileContent, val);
      setRestoreValidation(validation);
    }
  };

  // Execute Restore
  const handleExecuteRestore = async () => {
    if (!restoreValidation?.valid || !restoreValidation?.payload) {
      showToast('Cannot restore: invalid vault file.', 'error');
      return;
    }

    const confirmMsg = restoreMode === 'replace'
      ? 'WARNING: Full Replace will overwrite all current local rabbits, breedings, and litters with the backup file. Proceed?'
      : 'Merge will add any missing records and update existing matching IDs without deleting your current stock. Proceed?';

    if (!window.confirm(confirmMsg)) return;

    setIsProcessing(true);
    try {
      const res = await VaultBackupService.restoreVault(restoreValidation.payload, restoreMode);
      showToast(`Restored ${res.restoredCounts.rabbits} rabbits and ${res.restoredCounts.breedings} breedings!`, 'success');
      if (onRestoreSuccess) onRestoreSuccess();
      onClose();
    } catch (err) {
      showToast(`Restore error: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-left">
      <div className="glass-container max-w-xl w-full p-6 border border-indigo-500/30 bg-slate-900 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Rabbitry Data Vault</h3>
            <p className="text-xs text-slate-400">
              Complete local backup, AES encryption, and disaster recovery.
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-white/10 text-xs mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 font-bold rounded-lg transition-all ${
              activeTab === 'export' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Export Backup Vault
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('restore')}
            className={`flex-1 py-2 font-bold rounded-lg transition-all ${
              activeTab === 'restore' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Restore from Backup
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('csv')}
            className={`flex-1 py-2 font-bold rounded-lg transition-all ${
              activeTab === 'csv' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            CSV Export
          </button>
        </div>

        {/* TAB 1: EXPORT */}
        {activeTab === 'export' && (
          <form onSubmit={handleExport} className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Active Stock to Export:</span>
                <strong className="text-white font-mono">{rabbits.length} Animals</strong>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Includes all pedigrees, 4-generation lineages, breedings, weights, photos, and cage assignments in a tamper-proof JSON payload with a SHA-256 integrity checksum.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                Optional AES-256 Encryption Passphrase
              </label>
              <input
                type="password"
                placeholder="Leave blank for unencrypted JSON"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
              />
              <p className="text-[10px] text-slate-400">
                If provided, only users with this passphrase can decrypt and restore this backup file.
              </p>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Packaging Vault...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Download Complete Vault Snapshot (.json)
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: RESTORE */}
        {activeTab === 'restore' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white block">Select Vault Backup (.json)</label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs text-slate-300"
              />
            </div>

            {/* Validation Feedback */}
            {restoreValidation && (
              <div className={`p-4 rounded-xl border space-y-3 ${
                restoreValidation.valid 
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200' 
                  : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
              }`}>
                {restoreValidation.valid ? (
                  <>
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" /> Valid Vault File Verified
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                      <div>Rabbits: <strong>{restoreValidation.counts.rabbits}</strong></div>
                      <div>Breedings: <strong>{restoreValidation.counts.breedings}</strong></div>
                      <div>Litters: <strong>{restoreValidation.counts.litters}</strong></div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs text-rose-400">
                      <AlertTriangle className="w-4 h-4" /> {restoreValidation.error}
                    </div>
                    {restoreValidation.encrypted && (
                      <div className="pt-1">
                        <input
                          type="password"
                          placeholder="Enter Passphrase to Decrypt"
                          value={restorePassphrase}
                          onChange={(e) => handlePassphraseRevalidate(e.target.value)}
                          className="w-full bg-slate-950 border border-white/20 rounded-xl p-2 text-xs text-white"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Mode Select */}
            {restoreValidation?.valid && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-white block">Restore Strategy</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className={`p-3 rounded-xl border cursor-pointer flex flex-col gap-1 ${
                    restoreMode === 'merge' ? 'bg-indigo-600/30 border-indigo-400 text-white' : 'bg-white/5 border-white/10 text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="restoreMode"
                      checked={restoreMode === 'merge'}
                      onChange={() => setRestoreMode('merge')}
                      className="hidden"
                    />
                    <strong className="text-white">Merge (Safe)</strong>
                    <span className="text-[10px]">Upsert records without deleting existing entries.</span>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer flex flex-col gap-1 ${
                    restoreMode === 'replace' ? 'bg-rose-600/30 border-rose-400 text-white' : 'bg-white/5 border-white/10 text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="restoreMode"
                      checked={restoreMode === 'replace'}
                      onChange={() => setRestoreMode('replace')}
                      className="hidden"
                    />
                    <strong className="text-white">Full Replace</strong>
                    <span className="text-[10px]">Wipe current local stock and rehydrate from backup.</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleExecuteRestore}
                  disabled={isProcessing}
                  className="w-full py-3 mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Restoring Database...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" /> Execute Vault Restore
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CSV */}
        {activeTab === 'csv' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <h4 className="font-bold text-white text-sm">Spreadsheet & Evans Compatibility</h4>
              <p className="text-slate-400 leading-relaxed">
                Export all {rabbits.length} herd records into a standard CSV file with ear tattoos, names, varieties, weights (lbs & oz), sire/dam tattoos, registration numbers, and cage assignments.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCsvExport}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30"
            >
              <FileText className="w-4 h-4" /> Download Herd Stock CSV (.csv)
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
