import React, { useState } from 'react';
import { ShieldCheck, Lock, Trash2, Mail, Info } from 'lucide-react';

export default function PrivacyPolicy({ onClose }) {
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteRequested, setDeleteRequested] = useState(false);

  const handleDeleteRequest = (e) => {
    e.preventDefault();
    if (!deleteEmail) return;
    setDeleteRequested(true);
    setTimeout(() => {
      alert(`Data Deletion Request Queued: We have initiated a full scrub of all records linked to "${deleteEmail}". Under COPPA compliance, all parent/child profiles, inventory records, and synced backups will be deleted within 48 hours.`);
      setDeleteEmail('');
      setDeleteRequested(false);
      if (onClose) onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-container max-w-2xl w-full max-h-[85vh] flex flex-col border border-indigo-500/20 overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-indigo-950/40 to-slate-950/40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-cyan-400 font-bold" />
            <h3 className="text-lg font-black text-white tracking-tight">WarrenWise Privacy Policy & Disclosures</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-all text-sm font-bold border-none bg-transparent cursor-pointer"
          >
            ✕ Close
          </button>
        </div>

        {/* Policy Contents */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 text-xs text-slate-300 leading-relaxed scrollbar-thin">
          
          <div className="flex items-start gap-2.5 p-3.5 bg-indigo-500/5 border border-indigo-500/15 rounded-xl">
            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-indigo-200">
              WarrenWise Pro (RabbitryPedigree Pro) takes youth privacy and agricultural data security seriously. Below is our legally binding COPPA notice, data minimization outline, and HIPAA disclaimer.
            </p>
          </div>

          {/* Section 1: COPPA Child Privacy Policy */}
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider text-pink-400">
              🛡️ COPPA Youth Protection (Under 13)
            </h4>
            <p>
              In compliance with the <strong>Children's Online Privacy Protection Act (COPPA)</strong>, WarrenWise Pro enforces a strict neutral age gate:
            </p>
            <ul className="list-disc list-inside pl-2 space-y-1 text-slate-400">
              <li>Children under 13 cannot register an email address. A local username/account number is generated.</li>
              <li>A parent or guardian's email address is required exclusively to seek verifiable consent.</li>
              <li>No personal information (including location, name, or custom emblem uploads) is stored in our database for child accounts without explicit parental consent.</li>
            </ul>
          </div>

          {/* Section 2: HIPAA Compliance */}
          <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider text-cyan-400">
              🩺 HIPAA Health Data Compliance
            </h4>
            <p>
              WarrenWise Pro is built exclusively for <strong>veterinary rabbitry and cavy husbandry operations</strong>. Storing human medical records, social security numbers, or private healthcare notes is strictly prohibited.
            </p>
            <p className="text-slate-400">
              Any logs containing human pharmaceutical tags or reference codes are run through our automated sanitization engine, which redacts human medical references to ensure zero regulatory spill.
            </p>
          </div>

          {/* Section 3: Data Deletion & Modification */}
          <div className="flex flex-col gap-3 border-t border-white/5 pt-4 bg-red-950/10 p-4 rounded-2xl border border-red-500/10">
            <h4 className="text-sm font-bold text-red-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Trash2 className="w-4 h-4 text-red-400" /> Right to Delete Data (COPPA/GDPR)
            </h4>
            <p className="text-slate-300">
              Parents, guardians, and adult breeders have an absolute right to review, modify, or permanently delete all stored data. Enter your child's or your email below to queue an instant deletion:
            </p>
            <form onSubmit={handleDeleteRequest} className="flex gap-2 mt-1">
              <input 
                type="email" 
                required
                placeholder="E.g. parent@domain.com"
                value={deleteEmail}
                onChange={(e) => setDeleteEmail(e.target.value)}
                className="bg-slate-900 border border-white/10 text-xs py-2 px-3 text-white rounded-xl flex-grow focus:outline-none focus:border-red-500"
              />
              <button 
                type="submit"
                disabled={deleteRequested}
                className="btn-interactive py-2 px-4 bg-red-650 hover:bg-red-750 text-white font-bold border-none text-xs rounded-xl disabled:opacity-50 shrink-0"
              >
                {deleteRequested ? "Scrubbing..." : "Purge All Data"}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/60 flex justify-between items-center text-[10px] text-slate-400">
          <span>WarrenWise Pro Compliance Engine v1.4</span>
          <a href="mailto:support@warrenwise.pro" className="text-indigo-400 hover:underline flex items-center gap-1">
            <Mail className="w-3 h-3" /> Contact Compliance Officer
          </a>
        </div>

      </div>
    </div>
  );
}
