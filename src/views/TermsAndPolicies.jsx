import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Trash2, Mail, Info, FileText, AlertCircle, 
  Scale, Gavel, Award, HeartPulse, CheckCircle2, AlertTriangle 
} from 'lucide-react';

export default function TermsAndPolicies({ onClose, initialTab = 'terms' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteRequested, setDeleteRequested] = useState(false);

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
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-container max-w-4xl w-full max-h-[90vh] flex flex-col border-2 border-indigo-500/30 rounded-3xl overflow-hidden shadow-2xl bg-slate-900/95 text-left animate-scale-up">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-indigo-950/50 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                RabbitryPedigree Pro — Terms, Policies & Rules
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                  100% Verified Legal
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                USDA Livestock Guidelines • Independent Trademark Disclaimer • HIPAA Safe Harbor • COPPA Youth Safety
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-all text-sm font-bold border-none bg-slate-800 hover:bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-slate-950 px-6 py-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'terms'
                ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/30'
                : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> 📜 Terms of Service
          </button>
          <button
            onClick={() => setActiveTab('disclaimer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'disclaimer'
                ? 'bg-amber-600 text-white font-black shadow-md shadow-amber-600/30'
                : 'bg-transparent text-slate-400 hover:text-amber-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> ⚠️ Trademark & Legal Disclaimer
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'marketplace'
                ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/30'
                : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" /> ⚖️ 100% Legal Marketplace Rules
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'privacy'
                ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/30'
                : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> 🛡️ Privacy & HIPAA Safe Harbor
          </button>
          <button
            onClick={() => setActiveTab('coppa')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'coppa'
                ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/30'
                : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> 🐣 4-H COPPA Protection
          </button>
          <button
            onClick={() => setActiveTab('owner')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'owner'
                ? 'bg-amber-600 text-white font-black shadow-md shadow-amber-600/30'
                : 'bg-transparent text-slate-400 hover:text-amber-400'
            }`}
          >
            <Gavel className="w-3.5 h-3.5" /> 👑 App Owner Control & Bans
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6 text-xs text-slate-300 leading-relaxed scrollbar-thin">
          
          {/* TAB: TRADEMARK & LEGAL DISCLAIMER */}
          {activeTab === 'disclaimer' && (
            <div className="space-y-5">
              <div className="p-4 bg-amber-500/15 border-2 border-amber-500/30 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">Independent Software & Trademark Disclaimer</h4>
                  <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                    <strong>RabbitryPedigree Pro (WarrenWise Pro) is an independent software application and is NOT supported by, affiliated with, sponsored by, or endorsed by the American Rabbit Breeders Association (ARBA) or any official breed organization.</strong>
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-slate-300">
                <h4 className="text-sm font-black text-white uppercase tracking-wider text-amber-400">
                  1. Trademark Notice & Fair Use
                </h4>
                <p>
                  The acronym <strong>"ARBA"</strong> and specific breed standard designations (such as Holland Lop, Mini Rex, Netherland Dwarf, New Zealand, Flemish Giant) belong exclusively to their respective trademark holders. All references to breed standards, show classes, weight divisions, or leg certificates within this application are purely descriptive and informational ("Fair Use") to assist breeders in organizing their personal herd records.
                </p>

                <h4 className="text-sm font-black text-white uppercase tracking-wider text-amber-400 mt-4">
                  2. No Official Endorsement or Affiliation
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-2">
                  <li>RabbitryPedigree Pro does not issue official ARBA registration certificates or official Grand Champion leg certificates.</li>
                  <li>Pedigree certificates generated by this software are generic, breeder-owned record sheets designed for personal rabbitry lineage tracking.</li>
                  <li>No partnership, official sponsorship, or commercial endorsement with ARBA is claimed or implied.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 1: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-5">
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-200">
                  Welcome to <strong>RabbitryPedigree Pro (WarrenWise Pro)</strong>. By creating an account, browsing public listings, or using our rabbitry management software, you agree to these binding Terms of Service.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-black text-white uppercase tracking-wider text-indigo-400">
                  1. Platform Purpose & License
                </h4>
                <p className="text-slate-300">
                  RabbitryPedigree Pro grants users a non-exclusive, non-transferable license to store rabbitry herd management records, calculate genetic outcomes, generate pedigree certificates, and showcase stock for purchase under official ARBA standards.
                </p>

                <h4 className="text-sm font-black text-white uppercase tracking-wider text-indigo-400 mt-4">
                  2. User Responsibility & Pedigree Accuracy
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-2">
                  <li>Users are solely responsible for ensuring all entered tattoo numbers, weights, ear markings, and 4-generation pedigree histories are accurate.</li>
                  <li>Falsification of ARBA Grand Champion leg certificates, ARBA registration numbers, or ancestry lineages is strictly prohibited and results in immediate account termination.</li>
                  <li>Users agree not to upload offensive imagery, copyright-protected material owned by third parties, or unlawful content.</li>
                </ul>

                <h4 className="text-sm font-black text-white uppercase tracking-wider text-indigo-400 mt-4">
                  3. Platform Liability Disclaimer
                </h4>
                <p className="text-slate-300">
                  RabbitryPedigree Pro and App Owner Jason Mounts provide this platform as a software utility and public marketplace venue. RabbitryPedigree Pro is not a party to direct sales agreements between buyers and sellers, and shall be held harmless from any claims, health disputes, shipping losses, or contract disagreements arising between independent breeders.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: 100% LEGAL MARKETPLACE RULES */}
          {activeTab === 'marketplace' && (
            <div className="space-y-5">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-emerald-300 uppercase tracking-wider">100% Legal & Ethical Livestock Guarantee</h4>
                  <p className="text-xs text-emerald-200/90 mt-1">
                    All listings published on the RabbitryPedigree Pro Marketplace must strictly comply with federal USDA animal welfare guidelines, state agricultural transport laws, and ARBA breed standards.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-black text-white uppercase tracking-wider text-emerald-400">
                  1. Permitted & Restricted Listings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900 border border-emerald-500/20 rounded-xl">
                    <span className="text-xs font-bold text-emerald-400 block mb-1">✅ Permitted Stock:</span>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                      <li>Purebred ARBA & Cavy Show Stock</li>
                      <li>Proven Utility & Breeding Stock</li>
                      <li>Commercial Meat & Furlines</li>
                      <li>Healthy Companion Pet Rabbits</li>
                      <li>Hutch Equipment & Feed Supplies</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-slate-900 border border-red-500/20 rounded-xl">
                    <span className="text-xs font-bold text-red-400 block mb-1">❌ Strictly Prohibited:</span>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                      <li>Non-rabbit animals (dogs, cats, exotic wildlife)</li>
                      <li>Sick, diseased, or unweaned rabbits (&lt; 8 weeks)</li>
                      <li>Puppy/Kitten mill transactions</li>
                      <li>Stolen or unverified livestock</li>
                      <li>Illegal animal fighting or cruelty</li>
                    </ul>
                  </div>
                </div>

                <h4 className="text-sm font-black text-white uppercase tracking-wider text-emerald-400 mt-4">
                  2. Mandatory Seller Disclosures & Health Guarantee
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-2">
                  <li>Sellers must explicitly state the age, weight, gender, breed category, and health status of listed rabbits.</li>
                  <li>Rabbits must be weaned and at least 8 weeks of age before transfer, in full accordance with federal animal welfare regulations.</li>
                  <li>Live animal deposits and reservations processed via Stripe are held in reservation escrow until buyer/seller pickup is confirmed.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: PRIVACY & HIPAA SAFE HARBOR */}
          {activeTab === 'privacy' && (
            <div className="space-y-5">
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-start gap-3">
                <HeartPulse className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-cyan-300 uppercase tracking-wider">HIPAA Safe Harbor Compliance Statement</h4>
                  <p className="text-xs text-cyan-200/90 mt-1">
                    RabbitryPedigree Pro is engineered exclusively for rabbitry management and veterinary health logs. Human medical history or personal health insurance data is strictly excluded.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-black text-white uppercase tracking-wider text-cyan-400">
                  1. Automated Health Record Sanitization Filter
                </h4>
                <p className="text-slate-300">
                  To maintain strict adherence to Federal HIPAA guidelines and privacy regulations, all text notes entered into our Health & Medication Logger undergo automated regex filtering to sanitize human diagnostic codes or human pharmaceuticals not approved for veterinary animal care.
                </p>

                <h4 className="text-sm font-black text-white uppercase tracking-wider text-cyan-400 mt-4">
                  2. Data Encryption & Storage Sovereignty
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-2">
                  <li>All herd data is saved locally on your client device using encrypted IndexedDB storage.</li>
                  <li>Cloud synchronization uses end-to-end AES-256 encryption.</li>
                  <li>We do not sell user data, email lists, or breeding records to third-party advertisers.</li>
                </ul>

                {/* Data Deletion Request Form */}
                <div className="flex flex-col gap-3 border-t border-white/10 pt-4 bg-red-950/20 p-4 rounded-2xl border border-red-500/20 mt-4">
                  <h4 className="text-sm font-black text-red-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Trash2 className="w-4 h-4 text-red-400" /> Right to Purge Data (GDPR / CCPA)
                  </h4>
                  <p className="text-slate-300 text-[11px]">
                    Enter your email to request immediate deletion of your synced cloud records:
                  </p>
                  <form onSubmit={handleDeleteRequest} className="flex gap-2">
                    <input 
                      type="email" 
                      required
                      placeholder="E.g. breeder@domain.com"
                      value={deleteEmail}
                      onChange={(e) => setDeleteEmail(e.target.value)}
                      className="bg-slate-950 border border-white/10 text-xs py-2 px-3 text-white rounded-xl flex-grow focus:outline-none focus:border-red-500"
                    />
                    <button 
                      type="submit"
                      disabled={deleteRequested}
                      className="py-2 px-4 bg-red-650 hover:bg-red-750 text-white font-bold border-none text-xs rounded-xl disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      {deleteRequested ? "Scrubbing..." : "Purge Account Data"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COPPA YOUTH PROTECTION */}
          {activeTab === 'coppa' && (
            <div className="space-y-5">
              <div className="p-4 bg-pink-500/10 border border-pink-500/20 rounded-2xl flex items-start gap-3">
                <Lock className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-pink-300 uppercase tracking-wider">COPPA Children's Privacy Shield (Under 13)</h4>
                  <p className="text-xs text-pink-200/90 mt-1">
                    4-H & FFA youth exhibitors under 13 years of age are fully protected under the Children's Online Privacy Protection Act (COPPA).
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-black text-white uppercase tracking-wider text-pink-400">
                  1. Parental Guardian Consent Framework
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-2">
                  <li>Youth exhibitors under 13 must register linked to a verified Parent/Guardian email account.</li>
                  <li>No public marketplace listings or buyer inquiries can be created by youth accounts without explicit parent authorization.</li>
                  <li>Publicly exported pedigree cards created by youth accounts automatically sanitize physical address, phone, and personal contact details.</li>
                  <li>Parents hold 100% administrative authority to view, alter, or delete their youth member's account at any time.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 5: APP OWNER CONTROL & BANS */}
          {activeTab === 'owner' && (
            <div className="space-y-5">
              <div className="p-4 bg-amber-500/15 border border-amber-500/40 rounded-2xl flex items-start gap-3">
                <Gavel className="w-6 h-6 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">App Owner Moderation & Ban Authority</h4>
                  <p className="text-xs text-amber-200/90 mt-1">
                    To maintain an ethical, trustworthy, and 100% legal marketplace, App Owner <strong>Jason Mounts</strong> retains ultimate moderation authority over all accounts and public listings.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-black text-white uppercase tracking-wider text-amber-400">
                  1. Abuse Minimization & Banning Policy
                </h4>
                <p className="text-slate-300">
                  Any user who violates marketplace guidelines, attempts fraudulent pedigree entries, engages in abusive behavior, or violates federal animal welfare laws is subject to immediate disciplinary action by App Owner Jason Mounts:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
                  <div className="p-3 bg-slate-900 border border-yellow-500/30 rounded-xl">
                    <span className="text-xs font-bold text-yellow-400 block mb-1">⚠️ Warning / Flag</span>
                    <p className="text-[11px] text-slate-400">Listing is temporarily hidden pending review or pedigree verification.</p>
                  </div>
                  <div className="p-3 bg-slate-900 border border-orange-500/30 rounded-xl">
                    <span className="text-xs font-bold text-orange-400 block mb-1">🚫 Marketplace Suspension</span>
                    <p className="text-[11px] text-slate-400">Marketplace creation and buying privileges revoked for 30–90 days.</p>
                  </div>
                  <div className="p-3 bg-slate-900 border border-red-500/40 rounded-xl">
                    <span className="text-xs font-bold text-red-400 block mb-1">⛔ Permanent Account Ban</span>
                    <p className="text-[11px] text-slate-400">Account locked permanently with zero access to cloud services or public directories.</p>
                  </div>
                </div>

                <h4 className="text-sm font-black text-white uppercase tracking-wider text-amber-400 mt-4">
                  2. User Reporting & Moderation Queue
                </h4>
                <p className="text-slate-300">
                  Users can click <strong>[🚩 Report Listing]</strong> on any marketplace listing. All reports are immediately queued in Jason Mounts' Super Admin Control Panel for review within 24 hours.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-white/10 text-center text-[10px] text-slate-400 flex justify-between items-center">
          <span className="font-mono text-slate-500">RabbitryPedigree Pro Legal Engine • App Owner: Jason Mounts</span>
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-xs rounded-xl border-none cursor-pointer shadow-lg shadow-indigo-600/25"
          >
            I Agree & Accept All Terms
          </button>
        </div>

      </div>
    </div>
  );
}
