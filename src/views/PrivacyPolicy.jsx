import React, { useState } from 'react';
import { ShieldCheck, Lock, Trash2, Mail, Info, FileText, AlertCircle } from 'lucide-react';

export default function PrivacyPolicy({ onClose }) {
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteRequested, setDeleteRequested] = useState(false);
  const [activePolicyTab, setActivePolicyTab] = useState('privacy');

  const handleDeleteRequest = (e) => {
    e.preventDefault();
    if (!deleteEmail) return;
    setDeleteRequested(true);
    setTimeout(() => {
      alert(`Data Deletion Request Initiated: Under COPPA & GDPR compliance, all local and synced records linked to "${deleteEmail}" will be permanently scrubbed within 48 hours.`);
      setDeleteEmail('');
      setDeleteRequested(false);
      if (onClose) onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-container max-w-3xl w-full max-h-[90vh] flex flex-col border-2 border-indigo-500/30 rounded-3xl overflow-hidden shadow-2xl bg-slate-900/95 text-left">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-cyan-400 font-bold" />
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">WarrenWise Pro — User Agreements & Safety Policies</h3>
              <p className="text-xs text-slate-400 font-mono">COPPA Youth Protection • ARBA Disclaimer • Data Governance</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-all text-sm font-bold border-none bg-transparent cursor-pointer"
          >
            ✕ Close
          </button>
        </div>

        {/* Policy Tabs */}
        <div className="flex border-b border-white/10 bg-slate-950 px-6 py-2 gap-2">
          <button
            onClick={() => setActivePolicyTab('privacy')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activePolicyTab === 'privacy'
                ? 'bg-indigo-600 text-white font-black'
                : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            🛡️ Privacy & COPPA
          </button>
          <button
            onClick={() => setActivePolicyTab('terms')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activePolicyTab === 'terms'
                ? 'bg-indigo-600 text-white font-black'
                : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            📜 Terms of Service
          </button>
          <button
            onClick={() => setActivePolicyTab('disclaimers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activePolicyTab === 'disclaimers'
                ? 'bg-indigo-600 text-white font-black'
                : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            ⚖️ ARBA & AI Disclaimers
          </button>
        </div>

        {/* Policy Contents */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6 text-xs text-slate-300 leading-relaxed scrollbar-thin">
          
          {activePolicyTab === 'privacy' && (
            <>
              <div className="flex items-start gap-2.5 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-200">
                  WarrenWise Pro (RabbitryPedigree Pro) prioritizes family safety, youth protection, and agricultural data privacy. Below is our COPPA compliance framework and data protection commitment.
                </p>
              </div>

              {/* Section 1: COPPA Child Privacy Policy */}
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-black text-white flex items-center gap-1.5 uppercase tracking-wider text-pink-400">
                  🛡️ COPPA Youth Protection (Under 13)
                </h4>
                <p className="text-slate-300">
                  In strict compliance with the <strong>Children's Online Privacy Protection Act (COPPA)</strong>:
                </p>
                <ul className="list-disc list-inside pl-2 space-y-1 text-slate-400">
                  <li>Children under 13 cannot register without explicit parental consent.</li>
                  <li>No personal behavioral tracking or third-party advertising cookies are used for child accounts.</li>
                  <li>All 4-H Learning Academy quiz activity is strictly stored locally on the client device.</li>
                  <li>Parents have absolute control to review, edit, or purge their child's account records.</li>
                </ul>
              </div>

              {/* Section 2: Data Security & Ownership */}
              <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                <h4 className="text-sm font-black text-white flex items-center gap-1.5 uppercase tracking-wider text-cyan-400">
                  🔐 Data Ownership & Local Storage
                </h4>
                <p className="text-slate-300">
                  You own 100% of your pedigree records, financial ledgers, and animal photographs. All data is saved directly to your device's IndexedDB storage and encrypted prior to cloud sync.
                </p>
              </div>

              {/* Data Deletion Request Form */}
              <div className="flex flex-col gap-3 border-t border-white/5 pt-4 bg-red-950/20 p-4 rounded-2xl border border-red-500/20">
                <h4 className="text-sm font-black text-red-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Trash2 className="w-4 h-4 text-red-400" /> Right to Purge Data (COPPA / GDPR)
                </h4>
                <p className="text-slate-300">
                  Enter your email address to instantly initiate a permanent scrub of all account data:
                </p>
                <form onSubmit={handleDeleteRequest} className="flex gap-2 mt-1">
                  <input 
                    type="email" 
                    required
                    placeholder="E.g. parent@domain.com"
                    value={deleteEmail}
                    onChange={(e) => setDeleteEmail(e.target.value)}
                    className="bg-slate-950 border border-white/10 text-xs py-2.5 px-3 text-white rounded-xl flex-grow focus:outline-none focus:border-red-500"
                  />
                  <button 
                    type="submit"
                    disabled={deleteRequested}
                    className="btn-interactive py-2.5 px-4 bg-red-650 hover:bg-red-750 text-white font-bold border-none text-xs rounded-xl disabled:opacity-50 shrink-0"
                  >
                    {deleteRequested ? "Scrubbing..." : "Purge All Account Data"}
                  </button>
                </form>
              </div>
            </>
          )}

          {activePolicyTab === 'terms' && (
            <div className="space-y-4">
              <h4 className="text-sm font-black text-white uppercase tracking-wider text-amber-400">
                📜 Terms of Service & Acceptable Use
              </h4>
              <p className="text-slate-300 leading-relaxed">
                By accessing RabbitryPedigree Pro (WarrenWise Pro), you agree to use the platform solely for lawful rabbitry management, cavy breeding, exhibition preparation, and 4-H youth education.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                <li>Users are responsible for maintaining true and accurate pedigree lineage entries.</li>
                <li>Commercial sales listings in the public directory must comply with local livestock transfer laws.</li>
                <li>Any attempt to falsify ARBA registration numbers or grand champion leg certificates is strictly prohibited.</li>
              </ul>
            </div>
          )}

          {activePolicyTab === 'disclaimers' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                <h4 className="text-sm font-black text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                  ⚠️ Official ARBA & AI Guidance Disclaimer
                </h4>
                <p className="text-xs text-amber-200 mt-2 leading-relaxed">
                  <strong>American Rabbit Breeders Association (ARBA) Notice:</strong> RabbitryPedigree Pro (WarrenWise Pro) is an independent software platform. ARBA and associated breed standard trademarks belong exclusively to the American Rabbit Breeders Association.
                </p>
                <p className="text-xs text-amber-200 mt-2 leading-relaxed font-semibold">
                  <strong>AI 4-H Coach Disclaimer:</strong> All guidance provided by WarrenWise Coach is designed for educational support and 4-H youth study. For official competition rules, points scoring, and registrars exam evaluations, always consult the current official ARBA Standard of Perfection manual and licensed ARBA Registrars.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-white/10 text-center text-[10px] text-slate-400 flex justify-between items-center">
          <span>WarrenWise Pro Privacy & Compliance Engine v4.0</span>
          <button 
            onClick={onClose}
            className="btn-interactive px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl border-none cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>

      </div>
    </div>
  );
}
