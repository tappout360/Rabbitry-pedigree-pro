import React, { useState, useMemo } from 'react';
import { 
  Calendar, Clock, AlertTriangle, CheckCircle2, HeartPulse, 
  Baby, ShieldAlert, Sparkles, ChevronRight, HardDrive 
} from 'lucide-react';

export default function DailyBarnAgenda({
  rabbits = [],
  breedings = [],
  litters = [],
  onPalpate,
  onOpenKindleModal,
  onOpenVaultBackup,
  onNavigateTab
}) {
  const [filterView, setFilterView] = useState('today'); // 'today', 'week', 'all'

  // Calculate daily agenda tasks
  const agendaItems = useMemo(() => {
    const items = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // 1. Process active breedings
    breedings.forEach(b => {
      if (!b.breedDate) return;
      const breedDate = new Date(b.breedDate);
      breedDate.setHours(0, 0, 0, 0);
      const daysSinceBreed = Math.round((now - breedDate) / (1000 * 60 * 60 * 24));

      const dam = rabbits.find(r => r.id === b.doeId);
      const sire = rabbits.find(r => r.id === b.buckId);
      const damName = dam?.name || 'Dam';
      const sireName = sire?.name || 'Sire';
      const isCavy = dam?.species === 'cavy';

      // A. Palpation check (Rabbits: Days 10-14, Cavies: Days 15-20)
      if (b.status === 'bred') {
        const palpStart = isCavy ? 15 : 10;
        const palpEnd = isCavy ? 20 : 14;

        if (daysSinceBreed >= palpStart && daysSinceBreed <= palpEnd + 5) {
          const isToday = daysSinceBreed >= palpStart && daysSinceBreed <= palpEnd;
          const isOverdue = daysSinceBreed > palpEnd;

          items.push({
            id: `palpate-${b.id}`,
            category: 'Breeding',
            type: 'palpate',
            priority: isOverdue ? 'high' : 'medium',
            dueDate: new Date(breedDate.getTime() + palpStart * 86400000),
            daysDiff: daysSinceBreed - palpStart,
            title: `Palpation Check: ${damName}`,
            description: `Bred to ${sireName} ${daysSinceBreed} days ago. Gently check for grape-sized embryonic knots.`,
            badge: isOverdue ? 'Overdue' : 'Due Today',
            breedingId: b.id,
            damName
          });
        }
      }

      // B. Nest Box Placement (Rabbits: Day 28, Cavies: Day 60)
      const nestBoxDay = isCavy ? 60 : 28;
      if (b.status === 'palpated_positive' || b.status === 'bred') {
        if (daysSinceBreed >= nestBoxDay && daysSinceBreed <= nestBoxDay + 3) {
          items.push({
            id: `nestbox-${b.id}`,
            category: 'Care',
            type: 'nestbox',
            priority: 'high',
            dueDate: new Date(breedDate.getTime() + nestBoxDay * 86400000),
            daysDiff: daysSinceBreed - nestBoxDay,
            title: `Insert Nest Box: ${damName}`,
            description: `Day ${daysSinceBreed} gestation. Sanitize nest box, add clean bedding and fur-nesting material.`,
            badge: 'Urgent',
            breedingId: b.id,
            damName
          });
        }
      }

      // C. Kindling Watch (Rabbits: Day 31, Cavies: Day 68)
      const kindleDay = isCavy ? 68 : 31;
      if (b.status === 'palpated_positive' || b.status === 'bred') {
        if (daysSinceBreed >= kindleDay - 1 && daysSinceBreed <= kindleDay + 4) {
          items.push({
            id: `kindle-${b.id}`,
            category: 'Birth',
            type: 'kindle',
            priority: 'high',
            dueDate: new Date(breedDate.getTime() + kindleDay * 86400000),
            daysDiff: daysSinceBreed - kindleDay,
            title: `Kindling Due: ${damName}`,
            description: `Expected kindle date reached. Inspect nest box for newborn kits, ensure doe is calm and hydrated.`,
            badge: 'Kindling Watch',
            breedingId: b.id,
            damName
          });
        }
      }
    });

    // 2. Weaning & Separation (42-56 days post-birth)
    litters.forEach(l => {
      if (!l.birthDate) return;
      const birthDate = new Date(l.birthDate);
      birthDate.setHours(0, 0, 0, 0);
      const kitAgeDays = Math.round((now - birthDate) / (1000 * 60 * 60 * 24));

      if (kitAgeDays >= 42 && kitAgeDays <= 60 && l.status !== 'weaned') {
        const dam = rabbits.find(r => r.id === l.damId);
        items.push({
          id: `wean-${l.id}`,
          category: 'Weaning',
          type: 'wean',
          priority: 'medium',
          dueDate: new Date(birthDate.getTime() + 42 * 86400000),
          daysDiff: kitAgeDays - 42,
          title: `Weaning & Tattoo Due: Litter ${l.litterId || l.id.slice(0, 6)}`,
          description: `Kits are ${Math.round(kitAgeDays / 7)} weeks old (${l.kitsAlive || 0} kits). Time to separate by gender and assign ear tattoos.`,
          badge: '6-8 Weeks',
          litterId: l.id
        });
      }
    });

    // 3. Vault Backup Nudge (every 30 days)
    const lastBackup = localStorage.getItem('rp_last_vault_backup_date');
    if (!lastBackup) {
      items.push({
        id: 'backup-initial',
        category: 'Trust',
        type: 'backup',
        priority: 'medium',
        title: 'Safeguard Herd: Initial Vault Backup',
        description: 'Download a secure offline copy of your lineages, pedigrees, and breeding logs.',
        badge: 'Recommended'
      });
    } else {
      const lastBackupDate = new Date(lastBackup);
      const daysSinceBackup = Math.round((now - lastBackupDate) / (1000 * 60 * 60 * 24));
      if (daysSinceBackup >= 30) {
        items.push({
          id: 'backup-monthly',
          category: 'Trust',
          type: 'backup',
          priority: 'medium',
          title: '30-Day Data Vault Backup Due',
          description: `Last saved ${daysSinceBackup} days ago. Keep your herd records protected against hardware loss.`,
          badge: 'Maintenance'
        });
      }
    }

    return items;
  }, [breedings, litters, rabbits]);

  // Filter tasks based on selected view
  const visibleItems = useMemo(() => {
    if (filterView === 'today') {
      return agendaItems.filter(i => i.priority === 'high' || i.daysDiff === 0 || i.type === 'backup');
    }
    return agendaItems;
  }, [agendaItems, filterView]);

  return (
    <div className="glass-container p-5 border border-white/10 text-left space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              Daily Barn Agenda & Milestones
              {agendaItems.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-600 text-white font-mono">
                  {agendaItems.length} Due
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Automated breeding, nest box, kindling, and weaning task manager.
            </p>
          </div>
        </div>

        {/* View Filter Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setFilterView('today')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              filterView === 'today' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Today's Tasks
          </button>
          <button
            type="button"
            onClick={() => setFilterView('all')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              filterView === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Upcoming ({agendaItems.length})
          </button>
        </div>
      </div>

      {/* Agenda Items List */}
      {visibleItems.length === 0 ? (
        <div className="p-6 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <h4 className="text-sm font-bold text-white">All Barn Tasks Up to Date!</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No pending palpations, nest boxes, or kindling watches due today. Relax and enjoy your herd!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visibleItems.map(item => (
            <div 
              key={item.id}
              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                item.priority === 'high' 
                  ? 'bg-rose-950/20 border-rose-500/30' 
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    item.priority === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-indigo-500/20 text-indigo-300'
                  }`}>
                    {item.badge}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.category}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white leading-snug pt-1">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-end gap-2">
                {item.type === 'palpate' && (
                  <>
                    <button
                      type="button"
                      onClick={() => onPalpate(item.breedingId, true)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                    >
                      + Pregnant
                    </button>
                    <button
                      type="button"
                      onClick={() => onPalpate(item.breedingId, false)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                    >
                      - Open
                    </button>
                  </>
                )}

                {item.type === 'kindle' && (
                  <button
                    type="button"
                    onClick={() => onOpenKindleModal(item.breedingId)}
                    className="px-3 py-1 text-xs rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold cursor-pointer flex items-center gap-1"
                  >
                    <Baby className="w-3.5 h-3.5" /> Log Litter
                  </button>
                )}

                {item.type === 'nestbox' && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('scheduler')}
                    className="px-3 py-1 text-xs rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer"
                  >
                    View Hutch
                  </button>
                )}

                {item.type === 'backup' && (
                  <button
                    type="button"
                    onClick={onOpenVaultBackup}
                    className="px-3 py-1 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer flex items-center gap-1"
                  >
                    <HardDrive className="w-3.5 h-3.5" /> Save Vault
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
