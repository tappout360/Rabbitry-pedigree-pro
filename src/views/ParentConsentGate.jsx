import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ParentConsentGate() {
  const [token, setToken] = useState('');
  const [childInfo, setChildInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState(false);

  // Parent Consent Form States
  const [parentName, setParentName] = useState('');
  const [agreeNotice, setAgreeNotice] = useState(false);
  const [ccNumber, setCcNumber] = useState('');
  const [ccExpiry, setCcExpiry] = useState('');
  const [ccCvc, setCcCvc] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Parental Control Matrix States
  const [controls, setControls] = useState({
    allowCloudSync: false,
    allowPublicListings: false,
    allowPhotoUpload: false,
    animalLimit: 10
  });
  const [coachAuthorized, setCoachAuthorized] = useState(false);

  useEffect(() => {
    // Extract token from URL query string
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      fetchStatus(tokenParam);
    } else {
      setLoading(false);
      setError('Missing consent verification token. Please verify the link in your email.');
    }
  }, []);

  const fetchStatus = (t) => {
    setLoading(true);
    fetch(`http://localhost:5000/api/consent/status/${t}`)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setChildInfo(data);
          if (data.parentalControls) {
            setControls({
              allowCloudSync: data.parentalControls.allowCloudSync || false,
              allowPublicListings: data.parentalControls.allowPublicListings || false,
              allowPhotoUpload: data.parentalControls.allowPhotoUpload || false,
              animalLimit: data.parentalControls.animalLimit || 10
            });
          }
          if (data.coachAuthorized) {
            setCoachAuthorized(true);
          }
          if (data.verified) {
            setApproved(true);
          }
        } else {
          setError('Verification Link Expired: The parental consent token is invalid or has expired.');
        }
      })
      .catch(() => {
        setError('Network Connection Error: Could not reach the verification servers.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleApprove = (e) => {
    e.preventDefault();
    if (!agreeNotice) {
      alert("You must check the box to agree to the COPPA consent notice.");
      return;
    }
    if (!parentName) {
      alert("Please provide your full legal name.");
      return;
    }

    setVerifying(true);

    // Simulate identity verification check (COPPA VPC)
    setTimeout(() => {
      fetch(`http://localhost:5000/api/consent/approve/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ controls, coachAuthorized })
      })
      .then(async (res) => {
        if (res.ok) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          setApproved(true);
          // Update local breeders cache if present
          const localBreeders = localStorage.getItem('rp_admin_breeders');
          if (localBreeders && childInfo) {
            const arr = JSON.parse(localBreeders);
            const idx = arr.findIndex(b => b.id === childInfo.id);
            if (idx !== -1) {
              arr[idx].parentalConsentVerified = true;
              arr[idx].status = 'pending'; // moves to standard owner approval queue
              arr[idx].parentalControls = controls;
              arr[idx].coachAuthorized = coachAuthorized;
              localStorage.setItem('rp_admin_breeders', JSON.stringify(arr));
            }
          }
        } else {
          alert("Failed to submit consent approval. Please try again.");
        }
      })
      .catch(() => {
        alert("Server error. Please verify your connection.");
      })
      .finally(() => {
        setVerifying(false);
      });
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs opacity-75 font-semibold text-indigo-300">Retrieving consent status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-white">
        <div className="glass-container max-w-md w-full p-8 border border-red-500/20 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-red-950/40 border border-red-500/30 rounded-3xl flex items-center justify-center text-3xl">
            ⚠️
          </div>
          <h3 className="text-lg font-black text-white">Verification Error</h3>
          <p className="text-xs opacity-75 leading-relaxed text-slate-300">{error}</p>
          <a href="/" className="btn-interactive text-xs py-2 px-6 bg-slate-800 border-none font-bold text-white rounded-xl mt-2">
            Return to App Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-white">
      <div className="glass-container max-w-xl w-full border border-indigo-500/20 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Banner */}
        <div className="p-6 bg-gradient-to-r from-indigo-900 to-indigo-950 border-b border-white/10 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-cyan-400 font-bold shrink-0" />
          <div>
            <h2 className="text-base font-black tracking-tight uppercase">Verifiable Parental Consent Portal</h2>
            <p className="text-[11px] opacity-75 text-indigo-200 mt-0.5">COPPA Regulatory Gateway — WarrenWise Pro</p>
          </div>
        </div>

        {approved ? (
          <div className="p-8 text-center flex flex-col items-center gap-5">
            <div className="w-16 h-16 bg-emerald-950/40 border border-emerald-500/30 rounded-3xl flex items-center justify-center text-3xl shadow-inner animate-bounce">
              🎉
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Consent Verified!</h3>
              <p className="text-xs opacity-75 leading-relaxed mt-2 text-slate-300">
                You have successfully approved the Junior Helper profile for <strong>{childInfo?.childName}</strong>. 
                Their account has been unlocked and they can now sign in using their unique Account Number or Username.
              </p>
            </div>
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/15 rounded-xl text-left w-full text-[11px] flex flex-col gap-2">
              <span className="font-bold text-emerald-300">Active Parental Controls:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>Cloud Synchronization: {controls.allowCloudSync ? '✅ Allowed' : '❌ Blocked (Local Only)'}</li>
                <li>Public Sales Listings: {controls.allowPublicListings ? '✅ Allowed' : '❌ Blocked'}</li>
                <li>Gallery Uploads: {controls.allowPhotoUpload ? '✅ Allowed' : '❌ Blocked'}</li>
                <li>Hutch Limit: {controls.animalLimit} active profiles</li>
              </ul>
            </div>
            <p className="text-[10px] opacity-60">You can edit these controls at any time by logging in to the coach portal within the app.</p>
          </div>
        ) : (
          <form onSubmit={handleApprove} className="p-6 flex flex-col gap-5">
            
            <div className="p-4 bg-indigo-950/30 border border-indigo-500/10 rounded-2xl flex flex-col gap-1.5 text-xs text-indigo-200">
              <span className="font-bold text-white text-sm">Account Summary:</span>
              <span>Child Name: <strong>{childInfo?.childName}</strong></span>
              <span>Parent Email: <strong>{childInfo?.parentEmail}</strong></span>
            </div>

            {/* Custom Parental Controls */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">1. Customize Parental Controls</span>
              
              <div className="flex flex-col gap-2">
                {[
                  { key: 'allowCloudSync', label: 'Enable Cloud Database Backups', desc: 'Allows syncing the inventory data to secure central cloud backup servers. Disable to lock data strictly to this local device.' },
                  { key: 'allowPublicListings', label: 'Allow Sales Registry Listings', desc: 'Allows the student to publish rabbits to the public exchange listings board.' },
                  { key: 'allowPhotoUpload', label: 'Enable High-Resolution Photo Uploads', desc: 'Enables uploading custom photos for pedigrees and cages.' }
                ].map(item => (
                  <label key={item.key} className="p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl flex items-start gap-3 cursor-pointer transition-all">
                    <input 
                      type="checkbox" 
                      checked={controls[item.key]}
                      onChange={(e) => setControls({ ...controls, [item.key]: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded cursor-pointer shrink-0"
                    />
                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="text-xs font-black text-white">{item.label}</span>
                      <span className="text-[10px] opacity-65 leading-relaxed">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex flex-col gap-1.5 p-3 bg-white/5 border border-white/5 rounded-xl">
                <label className="text-xs font-black text-white text-left">Max Hutch Animal Capacity Limit</label>
                <div className="flex gap-2 mt-1">
                  {[5, 10, 15].map(lim => (
                    <button
                      type="button" key={lim}
                      onClick={() => setControls({ ...controls, animalLimit: lim })}
                      className={`flex-grow py-1.5 px-3 font-bold text-xs rounded-lg transition-all ${controls.animalLimit === lim ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                      {lim} Animals
                    </button>
                  ))}
                </div>
              </div>

              {/* Coach Authorization Toggle */}
              <label className="p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl flex items-start gap-3 cursor-pointer transition-all">
                <input 
                  type="checkbox" 
                  checked={coachAuthorized}
                  onChange={(e) => setCoachAuthorized(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded cursor-pointer shrink-0"
                />
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-xs font-black text-white">Authorize 4-H Leader/Coach Oversight</span>
                  <span className="text-[10px] opacity-65 leading-relaxed">Allows your child's designated 4-H club leader or barn coach to monitor audit logs and adjust parental controls from their dashboard.</span>
                </div>
              </label>
            </div>

            {/* COPPA VPC Identity Challenge */}
            <div className="flex flex-col gap-3 border-t border-white/5 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-400">2. Verifiable Identity Challenge</span>
                <span className="text-[9.5px] opacity-75 bg-pink-500/10 px-2 py-0.5 rounded text-pink-400">COPPA Requirement</span>
              </div>
              <p className="text-[10.5px] opacity-70 leading-relaxed text-left">
                To satisfy the FTC's legal guidelines for parental verification, we simulate a card authentication challenge. <strong>No real charge will occur.</strong>
              </p>

              <div className="grid grid-cols-3 gap-3 mt-1 text-left">
                <div className="col-span-3 flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-indigo-300">Parent / Guardian Legal Name *</label>
                  <input 
                    type="text" required placeholder="E.g. Sarah Miller"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="bg-white/5 border-white/10 text-xs py-2 px-3 text-white rounded-lg focus:outline-none"
                  />
                </div>
                
                <div className="col-span-3 flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-indigo-300">Simulated Card Number (Any 16 digits) *</label>
                  <input 
                    type="text" required placeholder="4111 2222 3333 4444"
                    maxLength={19}
                    value={ccNumber}
                    onChange={(e) => setCcNumber(e.target.value)}
                    className="bg-white/5 border-white/10 text-xs py-2 px-3 text-white rounded-lg focus:outline-none font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-indigo-300">Expiry *</label>
                  <input 
                    type="text" required placeholder="MM/YY"
                    maxLength={5}
                    value={ccExpiry}
                    onChange={(e) => setCcExpiry(e.target.value)}
                    className="bg-white/5 border-white/10 text-xs py-2 px-3 text-white rounded-lg focus:outline-none font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-indigo-300">CVC *</label>
                  <input 
                    type="text" required placeholder="123"
                    maxLength={3}
                    value={ccCvc}
                    onChange={(e) => setCcCvc(e.target.value)}
                    className="bg-white/5 border-white/10 text-xs py-2 px-3 text-white rounded-lg focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Acknowledge Checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer text-left border-t border-white/5 pt-4">
              <input 
                type="checkbox" required
                checked={agreeNotice}
                onChange={(e) => setAgreeNotice(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded cursor-pointer shrink-0"
              />
              <span className="text-[10.5px] opacity-80 leading-relaxed text-indigo-200">
                I verify that I am the parent/guardian of {childInfo?.childName}, and authorize their use of WarrenWise Pro under the configured controls above. I have read the Privacy Policy.
              </span>
            </label>

            <button
              type="submit"
              disabled={verifying}
              className="btn-interactive w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 font-bold border-none text-white text-xs mt-2 disabled:opacity-50"
            >
              {verifying ? "Verifying VPC Identity..." : "Authorize Consent & Unlock Account"}
            </button>

          </form>
        )}
      </div>
    </div>
  );
}
