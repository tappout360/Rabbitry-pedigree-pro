import React, { useState } from 'react';
import { 
  Flag, ShieldCheck, AlertTriangle, CheckCircle, XCircle, Eye, 
  Sparkles, Lock, ShieldAlert, FileText, Check, HeartPulse, ShoppingBag
} from 'lucide-react';
import { db } from '../../../db/registryDb';
import { StaffRoleService } from '../../../services/StaffRoleService';

export default function ModerationTab({
  currentUser,
  showToast
}) {
  const [activeSubSection, setActiveSubSection] = useState('knowledge'); // 'knowledge', 'safety', 'marketplace', 'youth_lockdown'
  const [youthLockdownActive, setYouthLockdownActive] = useState(() => localStorage.getItem('rp_youth_lockdown') === 'true');

  // Sample Moderation Items
  const [knowledgeQueue, setKnowledgeQueue] = useState([
    {
      id: 'kn-1',
      title: 'Managing Heat Stress in Holland Lops during 90°F+ Weather',
      author: 'Grandview Barn',
      category: 'Husbandry & Barn Climate',
      content: 'Frozen 2-liter water bottles placed against the cage wire provide radiant cooling without wetting rabbit fur, avoiding wool rot and flystrike...',
      status: 'pending'
    },
    {
      id: 'kn-2',
      title: 'ARBA SOP Variety Groupings: Otter vs Tan Patterns',
      author: 'River Valley Rabbitry',
      category: 'Breed Standards & SOP',
      content: 'Otter pattern requires light nostrils, eye circles, and jowls with orange/tan edging above white underbelly under ARBA standard...',
      status: 'pending'
    }
  ]);

  const [safetyQueue, setSafetyQueue] = useState([
    {
      id: 'saf-1',
      title: 'Medication Withdrawal Notification Flag',
      breeder: 'Sunny Hutch',
      rabbitTattoo: 'SH-402',
      category: 'FDA Withdrawal Compliance',
      details: 'Rabbit logged with Ivermectin treatment 4 days ago; kit marked for meat harvest prior to recommended 14-day meat withdrawal window.',
      severity: 'high',
      status: 'pending'
    }
  ]);

  // Handle Knowledge Approval
  const handleApproveKnowledge = async (id, title) => {
    setKnowledgeQueue(prev => prev.filter(k => k.id !== id));
    await StaffRoleService.logStaffAction({
      staffId: currentUser?.id,
      staffName: currentUser?.name,
      action: 'KNOWLEDGE_APPROVED',
      targetUserId: id,
      details: `Approved community article: "${title}" into Community-Verified tier.`
    });
    showToast(`Approved article: "${title}" into Community Knowledge!`, 'success');
  };

  const handleRejectKnowledge = async (id, title) => {
    setKnowledgeQueue(prev => prev.filter(k => k.id !== id));
    await StaffRoleService.logStaffAction({
      staffId: currentUser?.id,
      staffName: currentUser?.name,
      action: 'KNOWLEDGE_REJECTED',
      targetUserId: id,
      details: `Rejected community article: "${title}".`
    });
    showToast(`Rejected article: "${title}".`, 'info');
  };

  // Toggle Youth Hardening Mode
  const handleToggleYouthLockdown = async () => {
    const next = !youthLockdownActive;
    setYouthLockdownActive(next);
    localStorage.setItem('rp_youth_lockdown', next ? 'true' : 'false');
    window.dispatchEvent(new Event('rp_youth_lockdown_change'));

    await StaffRoleService.logStaffAction({
      staffId: currentUser?.id,
      staffName: currentUser?.name,
      action: next ? 'YOUTH_LOCKDOWN_ENABLED' : 'YOUTH_LOCKDOWN_DISABLED',
      targetUserId: 'global_youth',
      details: `Platform-wide Youth 4-H Hardening Mode ${next ? 'activated' : 'deactivated'}.`
    });

    showToast(next ? 'Youth Hardening Mode activated! Underage profiles secured.' : 'Youth Hardening Mode deactivated.', next ? 'warning' : 'success');
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Sub-navigation pills */}
      <div className="glass-container p-3 border border-white/10 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {[
            { id: 'knowledge', label: `Community Knowledge (${knowledgeQueue.length})` },
            { id: 'safety', label: `Animal Safety Flags (${safetyQueue.length})` },
            { id: 'youth_lockdown', label: 'Youth Safety Override' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubSection(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeSubSection === tab.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUB-SECTION 1: COMMUNITY KNOWLEDGE */}
      {activeSubSection === 'knowledge' && (
        <div className="glass-container p-6 border border-white/10 space-y-4">
          <div>
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Community Knowledge Approval Queue
            </h4>
            <p className="text-xs text-slate-400">
              Review breeder-submitted articles and verify against official ARBA Standard of Perfection guidelines before publishing.
            </p>
          </div>

          <div className="space-y-3">
            {knowledgeQueue.length === 0 ? (
              <div className="p-8 text-center glass-container text-xs text-slate-400">
                <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2 opacity-60" />
                All community knowledge submissions have been reviewed and approved!
              </div>
            ) : (
              knowledgeQueue.map(item => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                        {item.category}
                      </span>
                      <h5 className="font-black text-white text-sm mt-1">{item.title}</h5>
                      <p className="text-[11px] text-slate-400">Submitted by: <strong className="text-white">{item.author}</strong></p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleApproveKnowledge(item.id, item.title)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectKnowledge(item.id, item.title)}
                        className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold text-xs border border-rose-500/30 cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-white/5 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-SECTION 2: ANIMAL SAFETY FLAGS */}
      {activeSubSection === 'safety' && (
        <div className="glass-container p-6 border border-white/10 space-y-4">
          <div>
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-400" />
              Animal Safety & Policy Enforcement Queue
            </h4>
            <p className="text-xs text-slate-400">
              Review flagged health logs, medication withdrawal warnings, and cage density policy violations.
            </p>
          </div>

          <div className="space-y-3">
            {safetyQueue.map(item => (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-900/80 border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 uppercase">
                    {item.category}
                  </span>
                  <span className="text-xs text-rose-400 font-bold uppercase">{item.severity} SEVERITY</span>
                </div>

                <h5 className="font-bold text-white text-sm">{item.title}</h5>
                <p className="text-xs text-slate-300 leading-relaxed">{item.details}</p>

                <div className="text-[11px] text-slate-400">
                  Breeder: <strong className="text-white">{item.breeder}</strong> &bull; Tattoo: <code className="font-mono text-indigo-300">{item.rabbitTattoo}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-SECTION 3: YOUTH SAFETY HARDENING OVERRIDE */}
      {activeSubSection === 'youth_lockdown' && (
        <div className="glass-container p-6 border border-amber-500/30 rounded-3xl space-y-4">
          <div className="flex items-center gap-3 text-amber-400">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <div>
              <h4 className="font-bold text-white text-base">One-Click Youth 4-H Safety Lockdown</h4>
              <p className="text-xs text-amber-300/80">Platform-wide safety guardrail for underage compliance</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            When activated, all youth rabbitry public directory profiles are immediately hidden, social feed comments by underage accounts require adult pre-approval, and direct messaging is completely blocked.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleToggleYouthLockdown}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                youthLockdownActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40'
                  : 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-md shadow-amber-600/30'
              }`}
            >
              {youthLockdownActive ? 'Disable Youth Safety Lockdown' : 'Activate 1-Click Youth Safety Lockdown'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
