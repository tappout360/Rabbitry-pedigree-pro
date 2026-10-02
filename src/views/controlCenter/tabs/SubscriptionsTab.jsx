import React, { useState } from 'react';
import { 
  CreditCard, Award, AlertTriangle, CheckCircle, ShieldCheck, 
  Search, ArrowUpRight, DollarSign, Calendar, RefreshCw, FileText, Check
} from 'lucide-react';
import { StaffRoleService } from '../../../services/StaffRoleService';

export default function SubscriptionsTab({
  allBreeders = [],
  setAdminBreeders,
  currentUser,
  showToast
}) {
  const [selectedBreederId, setSelectedBreederId] = useState('');
  const [targetTier, setTargetTier] = useState('pro');
  const [compReason, setCompReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [webhookSimStatus, setWebhookSimStatus] = useState(null);

  // Compute Revenue & Cohort Metrics
  const proCount = allBreeders.filter(b => b.subscriptionTier === 'pro').length;
  const familyCount = allBreeders.filter(b => b.subscriptionTier === 'family').length;
  const evansCount = allBreeders.filter(b => b.subscriptionTier === 'evans_lifetime' || b.evansVerified).length;
  const freeCount = allBreeders.filter(b => !b.subscriptionTier || b.subscriptionTier === 'free').length;

  const totalPaid = proCount + familyCount + evansCount;
  const conversionRate = allBreeders.length > 0 ? ((totalPaid / allBreeders.length) * 100).toFixed(1) : 0;
  const estimatedMrr = ((proCount * 14.99) + (familyCount * 29.99)).toFixed(2);

  // Grant or Modify Entitlement
  const handleUpdateSubscription = async (e) => {
    e.preventDefault();
    if (!selectedBreederId) {
      showToast('Please select a breeder account.', 'error');
      return;
    }
    if (!compReason.trim()) {
      showToast('A reason note is required for subscription changes.', 'error');
      return;
    }

    setIsUpdating(true);
    try {
      const breeder = allBreeders.find(b => b.id === selectedBreederId);
      if (!breeder) throw new Error('Breeder not found.');

      setAdminBreeders(prev => prev.map(b => {
        if (b.id === selectedBreederId) {
          return {
            ...b,
            subscriptionTier: targetTier,
            subscriptionLimit: targetTier === 'family' ? 100 : targetTier === 'pro' ? 10000 : 25,
            subscriptionStatus: 'active',
            updatedAt: new Date().toISOString()
          };
        }
        return b;
      }));

      await StaffRoleService.logStaffAction({
        staffId: currentUser?.id,
        staffName: currentUser?.name,
        action: 'SUBSCRIPTION_MODIFIED',
        targetUserId: selectedBreederId,
        details: `Updated subscription tier to ${targetTier.toUpperCase()} for ${breeder.email}. Reason: ${compReason}`
      });

      showToast(`Subscription updated to ${targetTier.toUpperCase()}!`, 'success');
      setCompReason('');
    } catch (err) {
      showToast(`Error updating subscription: ${err.message}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Webhook Simulator
  const handleSimulateWebhook = (eventType) => {
    setWebhookSimStatus({
      event: eventType,
      timestamp: new Date().toLocaleTimeString(),
      status: 'success',
      payload: {
        id: 'evt_' + Date.now(),
        type: eventType,
        customer: selectedBreederId || 'cus_demo_101',
        amount: eventType === 'invoice.paid' ? 1499 : 0
      }
    });
    showToast(`Simulated Stripe webhook: ${eventType}`, 'info');
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Revenue & Plan Mix Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/80 border border-white/10 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Estimated MRR</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">${estimatedMrr}</div>
          <p className="text-[11px] text-slate-400 mt-1">Based on active Pro and Family tiers</p>
        </div>

        <div className="p-4 bg-slate-900/80 border border-white/10 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Conversion Rate</span>
            <ArrowUpRight className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{conversionRate}%</div>
          <p className="text-[11px] text-slate-400 mt-1">{totalPaid} of {allBreeders.length} on paid plans</p>
        </div>

        <div className="p-4 bg-slate-900/80 border border-white/10 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Evans Lifetime Comps</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{evansCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Grandfathered migration perks</p>
        </div>

        <div className="p-4 bg-slate-900/80 border border-white/10 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Free Tier Breeders</span>
            <CreditCard className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white">{freeCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Conversion pipeline candidates</p>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Grant / Extend Entitlement Card */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-container p-6 border border-white/10 space-y-4">
            <div>
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                Grant, Extend or Modify Entitlement
              </h4>
              <p className="text-xs text-slate-400">
                Instantly upgrade accounts to Pro, Family, or VIP Comps with full audit trail logging.
              </p>
            </div>

            <form onSubmit={handleUpdateSubscription} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Select Target Breeder</label>
                <select
                  value={selectedBreederId}
                  onChange={(e) => setSelectedBreederId(e.target.value)}
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="">-- Choose Breeder Account --</option>
                  {allBreeders.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name || b.rabbitryName} ({b.email}) — Current: {(b.subscriptionTier || 'free').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Target Subscription Tier</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'pro', label: 'Pro Tier ($14.99/mo)', desc: '10,000 rabbits, unlimited PDF pedigrees' },
                    { id: 'family', label: 'Family Tier ($29.99/mo)', desc: '100 rabbits, multi-member 4-H sync' },
                    { id: 'evans_lifetime', label: 'Evans Lifetime Perk', desc: 'Grandfathered migration entitlement' },
                    { id: 'free', label: 'Free Tier', desc: '25 rabbits limit' }
                  ].map(plan => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setTargetTier(plan.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        targetTier === plan.id
                          ? 'bg-indigo-950/70 border-indigo-500 text-white shadow'
                          : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-white text-xs">{plan.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{plan.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Reason for Entitlement Modification <span className="text-indigo-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={compReason}
                  onChange={(e) => setCompReason(e.target.value)}
                  placeholder="e.g. Granted 1-year Pro complimentary access for ARBA National youth award"
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating || !selectedBreederId}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/30 transition-all"
              >
                {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Apply Entitlement Change</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Webhook Simulator & Failed Payment Inspector */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-container p-6 border border-white/10 space-y-4">
            <div>
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-emerald-400" />
                Payment Gateway & Webhook Reconciliation
              </h4>
              <p className="text-xs text-slate-400">
                Inspect webhook event deliveries, replay failed payment events, and verify tier synchronization.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSimulateWebhook('invoice.paid')}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/20 font-bold flex items-center justify-center gap-1.5"
              >
                Replay invoice.paid
              </button>
              <button
                type="button"
                onClick={() => handleSimulateWebhook('customer.subscription.deleted')}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-500/20 font-bold flex items-center justify-center gap-1.5"
              >
                Replay sub.deleted
              </button>
            </div>

            {webhookSimStatus && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-emerald-400 font-bold">Event: {webhookSimStatus.event}</span>
                  <span className="text-slate-500">{webhookSimStatus.timestamp}</span>
                </div>
                <pre className="font-mono text-[10px] text-slate-300 bg-slate-900 p-2 rounded-lg overflow-x-auto">
                  {JSON.stringify(webhookSimStatus.payload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
