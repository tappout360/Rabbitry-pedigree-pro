import React, { useState } from 'react';
import { 
  Home, Heart, Grid, DollarSign, MoreHorizontal, X, 
  Award, BookOpen, Settings, LifeBuoy, Sun, Moon, 
  Beef, Shield, Sparkles, FileText, UserCheck
} from 'lucide-react';

export default function MobileBottomNav({
  activeTab,
  setActiveTab,
  barnMode,
  setBarnMode,
  theme,
  setTheme,
  currentUser,
  onOpenSettings,
  onOpenHelp,
  onOpenSecurity,
  unresolvedSyncCount = 0
}) {
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);

  const navItems = [
    { id: 'rabbits', label: 'Herd', icon: Home },
    { id: 'scheduler', label: 'Breeding', icon: Heart },
    { id: 'cages', label: 'Barn Map', icon: Grid },
    { id: 'finance', label: 'Finances', icon: DollarSign }
  ];

  const toggleSunlightMode = () => {
    const nextTheme = theme === 'sunlight' ? 'dark' : 'sunlight';
    setTheme(nextTheme);
    localStorage.setItem('rp_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <>
      {/* PERSISTENT BOTTOM NAVIGATION BAR */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-white/10 safe-area-bottom shadow-2xl"
      >
        <div className="flex items-center justify-around px-2 py-1.5 h-16">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setShowMoreDrawer(false);
                }}
                className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all border-none bg-transparent cursor-pointer touch-target-large ${
                  isActive 
                    ? 'text-indigo-400 font-extrabold scale-105' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[10px] tracking-tight mt-1">{item.label}</span>
                {isActive && <div className="w-1 h-1 rounded-full bg-indigo-400 mt-0.5" />}
              </button>
            );
          })}

          {/* MORE DRAWER BUTTON */}
          <button
            type="button"
            onClick={() => setShowMoreDrawer(!showMoreDrawer)}
            className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all border-none bg-transparent cursor-pointer touch-target-large relative ${
              showMoreDrawer || (!navItems.some(i => i.id === activeTab))
                ? 'text-indigo-400 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">More</span>
            {unresolvedSyncCount > 0 && (
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        </div>
      </nav>

      {/* SLIDE-UP MORE DRAWER */}
      {showMoreDrawer && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end animate-fade-in"
          onClick={() => setShowMoreDrawer(false)}
        >
          <div 
            className="glass-container bg-slate-900 border-t-2 border-indigo-500/30 rounded-t-3xl p-6 safe-area-bottom shadow-2xl space-y-5 animate-slide-up text-left max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🐰</span>
                <div>
                  <h3 className="text-sm font-black text-white">WarrenWise Mobile Barn Suite</h3>
                  <p className="text-[10.5px] text-slate-400">All tools & quick barn workflows</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowMoreDrawer(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 border-none bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Outdoor Sun Mode Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-950/80 border border-white/10 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${theme === 'sunlight' ? 'bg-amber-400 text-slate-950' : 'bg-indigo-500/20 text-indigo-400'}`}>
                  {theme === 'sunlight' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Outdoor Sunlight Mode</span>
                  <span className="text-[10.5px] text-slate-400">Anti-glare high contrast for bright sun</span>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleSunlightMode}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
                  theme === 'sunlight'
                    ? 'bg-amber-400 text-slate-950 font-black shadow'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {theme === 'sunlight' ? 'Sun Active' : 'Enable Sun Mode'}
              </button>
            </div>

            {/* Secondary Modules Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setActiveTab('meat'); setShowMoreDrawer(false); }}
                className="p-3 bg-slate-950/60 border border-white/5 rounded-2xl flex items-center gap-2.5 text-slate-200 hover:text-white hover:border-emerald-500/30 transition-all cursor-pointer text-left"
              >
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <Beef className="w-4 h-4" />
                </div>
                <span>Meat & Yield Logs</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('shows'); setShowMoreDrawer(false); }}
                className="p-3 bg-slate-950/60 border border-white/5 rounded-2xl flex items-center gap-2.5 text-slate-200 hover:text-white hover:border-amber-500/30 transition-all cursor-pointer text-left"
              >
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Award className="w-4 h-4" />
                </div>
                <span>Show Planner</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('academy'); setShowMoreDrawer(false); }}
                className="p-3 bg-slate-950/60 border border-white/5 rounded-2xl flex items-center gap-2.5 text-slate-200 hover:text-white hover:border-pink-500/30 transition-all cursor-pointer text-left"
              >
                <div className="p-2 bg-pink-500/20 text-pink-400 rounded-xl">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span>4-H Academy</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('evansMigrator'); setShowMoreDrawer(false); }}
                className="p-3 bg-slate-950/60 border border-white/5 rounded-2xl flex items-center gap-2.5 text-slate-200 hover:text-white hover:border-cyan-500/30 transition-all cursor-pointer text-left"
              >
                <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
                  <FileText className="w-4 h-4" />
                </div>
                <span>Evans Migrator</span>
              </button>

              <button
                type="button"
                onClick={() => { if (onOpenSettings) onOpenSettings(); setShowMoreDrawer(false); }}
                className="p-3 bg-slate-950/60 border border-white/5 rounded-2xl flex items-center gap-2.5 text-slate-200 hover:text-white hover:border-indigo-500/30 transition-all cursor-pointer text-left"
              >
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                  <Settings className="w-4 h-4" />
                </div>
                <span>App Settings</span>
              </button>

              <button
                type="button"
                onClick={() => { if (onOpenHelp) onOpenHelp(); setShowMoreDrawer(false); }}
                className="p-3 bg-slate-950/60 border border-white/5 rounded-2xl flex items-center gap-2.5 text-slate-200 hover:text-white hover:border-teal-500/30 transition-all cursor-pointer text-left"
              >
                <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl">
                  <LifeBuoy className="w-4 h-4" />
                </div>
                <span>Help & Support</span>
              </button>
            </div>

            {/* Account & Security Quick Link */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span className="truncate">Signed in: <strong className="text-white">{currentUser?.name || 'Breeder'}</strong></span>
              {onOpenSecurity && (
                <button
                  type="button"
                  onClick={() => { onOpenSecurity(); setShowMoreDrawer(false); }}
                  className="text-indigo-400 hover:text-indigo-300 font-bold border-none bg-transparent cursor-pointer flex items-center gap-1"
                >
                  <Shield className="w-3.5 h-3.5" /> Security
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
