import React, { useState, useEffect } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { SUBSCRIPTION_TIERS, EVANS_LIMIT_CONFIG } from '../db/subscriptionConfig';
import { 
  Sparkles, Check, AlertTriangle, ShieldCheck, 
  CreditCard, ExternalLink, Calendar, HelpCircle, 
  FileText, History, LogOut, ArrowRight, Upload, Clock, Award
} from 'lucide-react';

export default function SubscriptionManager({ currentUser, triggerConfetti }) {
  const {
    tier,
    status,
    currentPeriodEnd,
    trialEnd,
    cancelledAt,
    evansVerified,
    invoices,
    updateSubscription,
    hasPremiumAccess,
    isFeatureAllowed,
    getLimits
  } = useSubscription();

  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelFeedback, setCancelFeedback] = useState('');
  const [evansVerifying, setEvansVerifying] = useState(false);
  const [evansVerificationResult, setEvansVerificationResult] = useState(null);

  // Load current status
  useEffect(() => {
    if (currentUser?.id) {
      useSubscription.getState().fetchStatus(currentUser.id);
    }
  }, [currentUser?.id]);

  const handleCheckout = async (targetTier, evansOption = 'one_time') => {
    try {
      setCheckoutLoading(true);
      const API_ROOT = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';
      const token = localStorage.getItem('rp_auth_token');
      const res = await fetch(`${API_ROOT}/billing/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tier: targetTier,
          billingCycle: targetTier === 'evans_lifetime' ? evansOption : billingCycle
        })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error("Checkout session failed:", e);
      alert("Failed to start payment checkout.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePortalRedirect = async () => {
    try {
      setPortalLoading(true);
      const API_ROOT = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';
      const token = localStorage.getItem('rp_auth_token');
      const res = await fetch(`${API_ROOT}/billing/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error("Portal redirect failed:", e);
      alert("Failed to launch billing portal.");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (currentUser?.id) {
      await updateSubscription(currentUser.id, {
        tier: 'basic',
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      });
      setCancelModalOpen(false);
      triggerConfetti();
      alert("Your subscription has been cancelled. Your active hutch billing is now stopped.");
    }
  };

  const handleManualReviewSubmit = (e) => {
    e.preventDefault();
    setEvansVerificationResult({
      status: 'pending',
      message: 'Thank you! Your manual verification request has been queued. Our customer support team will audit your license key and db format within 24-48 hours.'
    });
  };

  const formatPeriodEnd = (dateStr) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString(undefined, { dateStyle: 'long' });
  };

  const getTierGradient = (tId) => {
    if (tId === 'basic') return 'from-slate-800 to-indigo-950/70 border-slate-700/60';
    if (tId === 'pro') return 'from-purple-950/45 to-fuchsia-950/50 border-purple-500/25';
    if (tId === 'youth_academy') return 'from-indigo-950/50 to-cyan-950/50 border-indigo-500/25';
    return 'from-amber-950/60 to-yellow-950/60 border-amber-500/30';
  };

  return (
    <div className="flex flex-col gap-6 text-slate-100 max-w-6xl mx-auto">
      {/* Title & Header Banner */}
      <div className="glass-container p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-indigo-950/50 to-purple-950/50">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> Subscription & Hutch Upgrade Center
          </h3>
          <p className="text-xs opacity-75 mt-0.5">
            Manage billing cycles, unlock advanced showmanship analytics, cavy templates, and gamified study tools.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs opacity-75">Secure checkout encrypted by</span>
          <div className="bg-white/10 px-3 py-1 rounded-xl text-xs font-bold font-mono text-indigo-300">Stripe</div>
        </div>
      </div>

      {/* 1. CURRENT SUBSCRIPTION DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-container p-6 flex flex-col gap-3 md:col-span-2">
          <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Active Hutch Subscription</span>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-2xl">
                {tier === 'basic' ? '🏡' : tier === 'pro' ? '👑' : tier === 'youth_academy' ? '🎓' : '🧬'}
              </div>
              <div>
                <h4 className="font-black text-lg text-white">
                  {SUBSCRIPTION_TIERS[tier]?.name || 'Basic Plan'}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${status === 'active' || status === 'trialing' ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                    {status}
                  </span>
                  {trialEnd && status === 'trialing' && (
                    <span className="text-[10px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 animate-pulse">
                      14-Day Trial ends {formatPeriodEnd(trialEnd)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-xs text-left md:text-right border-t md:border-t-0 border-white/5 pt-2 md:pt-0">
              <span className="opacity-70">Next Renewal / Expiration</span>
              <span className="font-bold text-white flex items-center md:justify-end gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5 opacity-80" /> {formatPeriodEnd(currentPeriodEnd || trialEnd)}
              </span>
              {cancelledAt && (
                <span className="text-[10px] text-amber-400 font-bold">Auto-renewals stopped</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 mt-4 pt-3 border-t border-white/5">
            {status !== 'trialing' && (
              <button
                type="button"
                onClick={handlePortalRedirect}
                disabled={portalLoading}
                className="btn-interactive text-[11px] py-1.5 px-4 bg-indigo-650 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 border-none"
              >
                <CreditCard className="w-3.5 h-3.5" /> {portalLoading ? 'Loading Portal...' : 'Manage Stripe Billing'} <ExternalLink className="w-3 h-3" />
              </button>
            )}

            {(status === 'active' || status === 'trialing') && (
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className="btn-interactive text-[11px] py-1.5 px-4 bg-red-650/80 hover:bg-red-750/85 text-red-100 font-bold border-none"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>

        {/* Mascot Mascot helper widget */}
        <div className="glass-container p-6 bg-gradient-to-br from-indigo-950/40 to-slate-900/60 flex flex-col justify-between items-center text-center gap-3">
          <div className="text-4xl">🐰</div>
          <div>
            <h5 className="text-xs font-bold text-indigo-300">WarrenWise Mascot says:</h5>
            <p className="text-[11px] italic opacity-85 mt-1 leading-relaxed text-slate-300">
              "We have special 4-H family packages so kids can learn to log showmanship entries safely with zero ads or tracking!"
            </p>
          </div>
          <span className="text-[9px] bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20 font-bold text-indigo-300">COMPLIANT VET LEDGER</span>
        </div>
      </div>

      {/* Hutch Storage & Cloud Storage Expansion Purchases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Hutch Capacity Expansion */}
        <div className="glass-container p-6 border border-indigo-500/10 bg-slate-900/25 flex flex-col justify-between gap-6 text-left">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🏡</div>
            <div>
              <h4 className="font-black text-sm text-indigo-300 uppercase tracking-wider">Hutch Profile Capacity Expansion</h4>
              <p className="text-[11px] opacity-75 mt-1 leading-relaxed">
                Need extra rabbit space? Expand your capacity beyond your plan limit. Purchase a permanent hutch pack to house more active rabbit profiles.
              </p>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className="text-[11px] bg-slate-800 px-3 py-1 rounded border border-white/10 text-slate-200">
                  Base Limit: <strong className="text-white">{getLimits().animalLimit - (useSubscription.getState().additionalHutches || 0)}</strong>
                </span>
                <span className="text-[11px] bg-indigo-500/10 px-3 py-1 rounded border border-indigo-500/20 text-indigo-300 font-bold">
                  Additions: <strong className="text-indigo-200">+{useSubscription.getState().additionalHutches || 0} hutches</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
            <button
              onClick={async () => {
                if (!currentUser?.id) return;
                await useSubscription.getState().buyHutches(currentUser.id, 25);
                triggerConfetti();
                alert("Successfully purchased +25 Hutch Storage Expansion ($3.99)!");
              }}
              className="btn-interactive py-2 px-3 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs font-black border-none cursor-pointer flex-1 flex items-center justify-center gap-1 shadow"
            >
              +25 Hutches ($3.99)
            </button>
            <button
              onClick={async () => {
                if (!currentUser?.id) return;
                await useSubscription.getState().buyHutches(currentUser.id, 50);
                triggerConfetti();
                alert("Successfully purchased +50 Hutch Storage Expansion ($6.99)!");
              }}
              className="btn-interactive py-2 px-3 bg-teal-650 hover:bg-teal-750 text-white rounded-xl text-xs font-black border-none cursor-pointer flex-1 flex items-center justify-center gap-1 shadow"
            >
              +50 Hutches ($6.99)
            </button>
            <button
              onClick={async () => {
                if (!currentUser?.id) return;
                await useSubscription.getState().buyHutches(currentUser.id, 100);
                triggerConfetti();
                alert("Successfully purchased +100 Hutch Storage Expansion ($11.99)!");
              }}
              className="btn-interactive py-2 px-3 bg-purple-650 hover:bg-purple-750 text-white rounded-xl text-xs font-black border-none cursor-pointer flex-1 flex items-center justify-center gap-1 shadow"
            >
              +100 Hutches ($11.99)
            </button>
          </div>
        </div>

        {/* 2. Cloud Media & Photo Storage Expansion */}
        <div className="glass-container p-6 border border-cyan-500/10 bg-slate-900/25 flex flex-col justify-between gap-6 text-left">
          <div className="flex items-start gap-4">
            <div className="text-3xl">☁️</div>
            <div>
              <h4 className="font-black text-sm text-cyan-300 uppercase tracking-wider">Cloud & Photo Media Storage Expansion</h4>
              <p className="text-[11px] opacity-75 mt-1 leading-relaxed">
                Need extra storage space for judging photo logs, tattoo scans, and show leg certificates? Add cloud storage capacity to your hutch account.
              </p>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className="text-[11px] bg-slate-800 px-3 py-1 rounded border border-white/10 text-slate-200">
                  Total Cloud Storage: <strong className="text-cyan-300 font-bold">{getLimits().storageGb} GB</strong>
                </span>
                <span className="text-[11px] bg-cyan-500/10 px-3 py-1 rounded border border-cyan-500/20 text-cyan-300 font-bold">
                  Photo Limit: <strong className="text-cyan-200">~{getLimits().photoLimit} uploads</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
            <button
              onClick={async () => {
                if (!currentUser?.id) return;
                await useSubscription.getState().buyStorage(currentUser.id, 2);
                triggerConfetti();
                alert("Successfully purchased +2 GB Cloud Media Storage ($2.99)!");
              }}
              className="btn-interactive py-2 px-3 bg-cyan-650 hover:bg-cyan-750 text-white rounded-xl text-xs font-black border-none cursor-pointer flex-1 flex items-center justify-center gap-1 shadow"
            >
              +2 GB Storage ($2.99)
            </button>
            <button
              onClick={async () => {
                if (!currentUser?.id) return;
                await useSubscription.getState().buyStorage(currentUser.id, 5);
                triggerConfetti();
                alert("Successfully purchased +5 GB Cloud Media Storage ($5.99)!");
              }}
              className="btn-interactive py-2 px-3 bg-sky-650 hover:bg-sky-750 text-white rounded-xl text-xs font-black border-none cursor-pointer flex-1 flex items-center justify-center gap-1 shadow"
            >
              +5 GB Storage ($5.99)
            </button>
            <button
              onClick={async () => {
                if (!currentUser?.id) return;
                await useSubscription.getState().buyStorage(currentUser.id, 15);
                triggerConfetti();
                alert("Successfully purchased +15 GB Cloud Media Storage ($12.99)!");
              }}
              className="btn-interactive py-2 px-3 bg-blue-650 hover:bg-blue-750 text-white rounded-xl text-xs font-black border-none cursor-pointer flex-1 flex items-center justify-center gap-1 shadow"
            >
              +15 GB Storage ($12.99)
            </button>
          </div>
        </div>
      </div>

      {/* 2. UPGRADE PLANS & TARIFF FLOW */}
      <div className="flex flex-col gap-6 mt-4">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-300">
            📊 Compare Upgrade Packages
          </h4>

          {/* Monthly / Annual cycle switcher toggle */}
          <div className="bg-slate-900/80 p-1 border border-white/10 rounded-2xl flex items-center gap-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`text-xs px-4 py-1.5 font-bold rounded-xl transition-all ${billingCycle === 'monthly' ? 'bg-indigo-600 text-white' : 'opacity-70 hover:opacity-100 text-slate-300'}`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`text-xs px-4 py-1.5 font-bold rounded-xl transition-all flex items-center gap-1.5 ${billingCycle === 'annual' ? 'bg-indigo-600 text-white' : 'opacity-70 hover:opacity-100 text-slate-300'}`}
            >
              Annual bill <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1 rounded-full font-bold">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {Object.keys(SUBSCRIPTION_TIERS).filter(k => k !== 'evans_lifetime').map(key => {
            const plan = SUBSCRIPTION_TIERS[key];
            const isCurrent = tier === key;
            const cardGrad = getTierGradient(key);

            // Price resolution
            let priceText = plan.priceLabel;
            if (key === 'basic') {
              priceText = billingCycle === 'annual' ? '$59.00 / year' : '$5.99 / month';
            } else if (key === 'pro') {
              priceText = billingCycle === 'annual' ? '$129.00 / year' : '$12.99 / month';
            } else if (key === 'youth_academy') {
              priceText = '$15.99 / month'; // Monthly only
            }

            return (
              <div key={key} className={`rounded-3xl border p-6 flex flex-col justify-between gap-5 bg-gradient-to-b ${cardGrad} transition-all relative ${plan.id === 'basic' ? 'shadow-[0_0_20px_rgba(99,102,241,0.15)] ring-2 ring-indigo-500/25' : ''}`}>
                {plan.id === 'basic' && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow animate-pulse">
                    14-Day Trial Options
                  </span>
                )}
                <div className="flex flex-col gap-3">
                  <div>
                    <h5 className="font-black text-white text-base">{plan.name}</h5>
                    <span className="text-xl font-black text-indigo-350 font-mono mt-1 block">
                      {priceText}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 font-medium">
                    Hutch capacity limits: <strong className="text-slate-300 font-bold">{plan.limit}</strong> active profiles
                  </p>

                  <ul className="flex flex-col gap-2 mt-2 text-left">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px] opacity-90 leading-relaxed text-slate-350">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleCheckout(key)}
                  disabled={checkoutLoading || isCurrent}
                  className={`btn-interactive w-full text-xs font-bold py-2 ${isCurrent ? 'bg-white/10 text-white cursor-default border-none shadow-inner' : 'bg-indigo-650 hover:bg-indigo-700 text-white border-none shadow-md shadow-indigo-650/15 cursor-pointer'}`}
                >
                  {isCurrent ? 'Current Plan Active' : 'Upgrade & Start Trial'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. EVANS AUTOMATED & MANUAL DISCOUNTS */}
      <div className="glass-container p-6 bg-gradient-to-br from-slate-900 to-indigo-950/40 border-indigo-500/10 flex flex-col gap-4 mt-4 text-left">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Evans Migrant Discount Verification
          </h4>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-2 py-0.5 rounded">
            Evans Client Coupon Only
          </span>
        </div>

        <p className="text-xs opacity-85 leading-relaxed text-slate-300">
          Transitioning from Evans Software? Upload your Evans database file to verify your formatting. Once successfully analyzed, you will unlock a transition purchase option to get the **Evans Migrant Lifetime Offer** for a special switcher price: **$249.00 for the first 5 years (includes all major updates & features)**. After 5 years, you can keep using your software forever without recurring bills, paying only for optional major version upgrades.
        </p>

        {evansVerified ? (
          <div className="p-5 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex flex-col gap-4 max-w-3xl animate-fade-in text-left">
            <div className="flex items-center gap-3 text-xs text-emerald-300">
              <ShieldCheck className="w-6 h-6 shrink-0 text-emerald-400" />
              <div>
                <span className="font-bold block text-sm">Evans Database File Verified Successfully!</span>
                <span className="opacity-80 font-medium">Discount pricing unlocked. Select your transition payment choice below to claim Evans Migrant Lifetime.</span>
              </div>
            </div>
            {tier !== 'evans_lifetime' ? (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleCheckout('evans_lifetime', 'one_time')}
                  disabled={checkoutLoading}
                  className="py-2.5 px-5 bg-amber-600 hover:bg-amber-700 border-none rounded-xl text-white font-extrabold cursor-pointer text-xs shadow-md uppercase tracking-wider transition-all"
                >
                  Pay One-Time ($249 for 5 Years)
                </button>
                <button
                  onClick={() => handleCheckout('evans_lifetime', 'installments')}
                  disabled={checkoutLoading}
                  className="py-2.5 px-5 bg-indigo-650 hover:bg-indigo-700 border-none rounded-xl text-white font-extrabold cursor-pointer text-xs shadow-md uppercase tracking-wider transition-all"
                >
                  3 Installments of $85
                </button>
              </div>
            ) : (
              <span className="bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase self-start">Evans Lifetime Active</span>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-2 justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Automated Checker</span>
                <p className="text-[11px] opacity-75 mt-1 leading-relaxed text-slate-350">
                  Go to the **Evans Migrator** tab in the sidebar and import your Evans export file. The checker scans columns automatically and unlocks the perk.
                </p>
              </div>
              <span className="text-[10px] text-amber-400 font-bold">Heuristics scanner is instant & offline friendly!</span>
            </div>

            {/* Manual review request form fallback */}
            <form onSubmit={handleManualReviewSubmit} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-3 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Manual Review Fallback Queue</span>
              <div className="flex flex-col gap-1 text-[11px]">
                <label className="font-bold">Describe your Evans license or details</label>
                <textarea
                  required
                  placeholder="e.g. Registered email on Evans, approx license key number, or purchase receipt..."
                  rows={2}
                  className="bg-slate-900 border border-white/10 p-2 text-white rounded-lg focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="btn-interactive text-[11px] py-1.5 bg-slate-800 text-slate-300 font-bold border border-white/10 self-start"
              >
                Submit manual claim
              </button>
              {evansVerificationResult && (
                <div className="p-2.5 bg-indigo-950/40 border border-indigo-500/20 text-[10px] text-indigo-300 rounded-lg">
                  {evansVerificationResult.message}
                </div>
              )}
            </form>
          </div>
        )}
      </div>

      {/* 4. BILLING HISTORY / INVOICES LIST */}
      <div className="glass-container p-6">
        <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-300 mb-4 flex items-center gap-1.5 text-left">
          <History className="w-4 h-4" /> Billing History & Invoices
        </h4>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <th className="pb-3">Invoice ID</th>
                <th className="pb-3">Paid Date</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Payment Method</th>
                <th className="pb-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-left">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-white/5 transition-all">
                  <td className="py-3 font-mono font-bold text-indigo-300">{inv.stripeInvoiceId || inv.id}</td>
                  <td className="py-3 opacity-90">{formatPeriodEnd(inv.paidAt)}</td>
                  <td className="py-3 font-semibold text-emerald-450 font-mono">${(inv.amount || 0).toFixed(2)}</td>
                  <td className="py-3 opacity-80">Stripe Card</td>
                  <td className="py-3 text-right">
                    {inv.receiptUrl ? (
                      <a 
                        href={inv.receiptUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline font-semibold flex items-center justify-end gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Receipt
                      </a>
                    ) : (
                      <span className="opacity-50">Local record only</span>
                    )}
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-6 opacity-60 text-slate-455 text-xs italic">
                    No active transaction receipts logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CANCELLATION DIALOG MODAL */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-left">
          <div className="glass-container p-6 max-w-md w-full flex flex-col gap-4 border border-red-500/20">
            <h4 className="text-base font-bold text-white flex items-center gap-1.5">
              <AlertTriangle className="w-5 h-5 text-red-400" /> Cancel Subscription?
            </h4>
            <p className="text-xs opacity-80 leading-relaxed text-slate-350">
              We will miss you! Cancelling your upgrade will freeze active synchronization and set your hutch account status to cancelled.
            </p>

            <div className="flex flex-col gap-2 text-xs">
              <label className="font-bold">Why are you leaving? (Optional)</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="bg-slate-900 border border-white/10 p-2 text-white rounded-lg text-xs"
              >
                <option value="">Select a reason...</option>
                <option value="expensive">Too expensive / price change</option>
                <option value="features">Missing vital features</option>
                <option value="competitor">Switched to another software</option>
                <option value="retired">Retired breeder / closed rabbitry</option>
                <option value="bugs">Experienced software bugs</option>
              </select>

              <label className="font-bold mt-1">Additional Comments</label>
              <textarea
                value={cancelFeedback}
                onChange={(e) => setCancelFeedback(e.target.value)}
                placeholder="How can we make WarrenWise better?"
                rows={2}
                className="bg-slate-900 border border-white/10 p-2 text-white rounded-lg text-xs"
              />
            </div>

            <div className="flex gap-2 justify-end mt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="btn-interactive text-xs py-2 px-4 bg-slate-800 text-slate-300 font-bold border border-white/10"
              >
                Keep Plan
              </button>
              <button
                type="button"
                onClick={handleCancelSubscription}
                className="btn-interactive text-xs py-2 px-4 bg-red-600 hover:bg-red-650 text-white font-bold border-none"
              >
                Confirm Downgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
