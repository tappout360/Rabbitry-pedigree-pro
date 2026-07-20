import React, { useState } from 'react';
import { 
  Sparkles, Award, ShieldCheck, HeartPulse, RefreshCw, Zap, 
  ChevronRight, CheckCircle2, FileText, Users, Download, ArrowRight,
  Star, Play, Lock, Smartphone, Database, Check, Layers, HelpCircle
} from 'lucide-react';

export default function LandingHomePage({ onSignIn, onRegister, onTryDemo, onSelectPlan }) {
  const [activeFeatureTab, setActiveFeatureTab] = useState('pedigree');
  const [selectedBreedCategory, setSelectedBreedCategory] = useState('all');

  const breedsShowcase = [
    {
      name: "Grandview's Snow Monarch",
      breed: "New Zealand White",
      class: "Senior Buck",
      awards: "Best in Show (BIS) - ARBA National",
      image: "/assets/new_zealand_white.png",
      breeder: "Grandview Rabbitry",
      category: "commercial"
    },
    {
      name: "Copper Ridge Champion",
      breed: "New Zealand Red",
      class: "Senior Doe",
      awards: "Best of Breed (BOB) - 4 Grand Legs",
      image: "/assets/new_zealand_red.png",
      breeder: "Grandview Rabbitry",
      category: "commercial"
    },
    {
      name: "Blue Thunder",
      breed: "Holland Lop",
      class: "Senior Buck",
      awards: "Best of Variety (BOV) - 3 Legs",
      image: "/assets/holland_lop.png",
      breeder: "Grandview Rabbitry",
      category: "fancy"
    },
    {
      name: "Clover Velvet King",
      breed: "Mini Rex",
      class: "Senior Buck",
      awards: "Best Fur Award - 5 Legs",
      image: "/assets/mini_rex.png",
      breeder: "Clover Barns",
      category: "fancy"
    },
    {
      name: "Valley Mark Smudge",
      breed: "Californian",
      class: "Senior Buck",
      awards: "Best Commercial Type - ARBA",
      image: "/assets/californian_rabbit.png",
      breeder: "Grandview Rabbitry",
      category: "commercial"
    },
    {
      name: "Midnight Knight",
      breed: "Netherland Dwarf",
      class: "Senior Buck",
      awards: "Best of Breed - Gotham Classic",
      image: "/assets/netherland_dwarf.png",
      breeder: "Wayne Manor Hutch",
      category: "fancy"
    }
  ];

  const filteredBreeds = selectedBreedCategory === 'all' 
    ? breedsShowcase 
    : breedsShowcase.filter(b => b.category === selectedBreedCategory);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[160px] pointer-events-none animate-pulse"></div>
      <div className="absolute top-[800px] right-10 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-[1800px] left-10 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none"></div>

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/assets/mascot.png" alt="WarrenWise Mascot" className="w-10 h-10 object-contain p-1 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-xl shadow-lg shadow-amber-500/20 animate-bounce" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent tracking-tight">
                  RabbitryPedigree Pro
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  WarrenWise
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold font-mono tracking-wider">ARBA & CAVY REGISTRY ENGINE</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold text-slate-300">
            <a href="#features" className="hover:text-yellow-400 transition-colors">Features</a>
            <a href="#showcase" className="hover:text-yellow-400 transition-colors">Show Champions</a>
            <a href="#youth" className="hover:text-yellow-400 transition-colors">4-H Youth</a>
            <a href="#pricing" className="hover:text-yellow-400 transition-colors">Pricing & Plans</a>
            <a href="#evans" className="hover:text-yellow-400 transition-colors">Evans Migrator</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onTryDemo('ab-1')}
              className="btn-interactive px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded-xl border-none shadow-lg shadow-cyan-900/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Live Demo
            </button>
            <button
              onClick={onSignIn}
              className="btn-interactive px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/10 cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onRegister}
              className="btn-interactive px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black rounded-xl border-none shadow-lg shadow-amber-500/25 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* HERO BANNER SECTION */}
      <section className="relative pt-12 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-pink-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide shadow-inner">
              <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
              <span>Built for ARBA & 4-H Show Champions Worldwide</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tight">
              The Ultimate <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">ARBA-Compliant</span> Rabbit & Cavy Management App
            </h1>

            <p className="text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl font-medium">
              Fun, reliable, and built for show success! Manage your hutch records, design 4-generation pedigree certificates with cryptographic proof, track kindle dates, and empower your 4-H youth family.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onTryDemo('ab-1')}
                className="btn-interactive px-7 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm rounded-2xl border-none shadow-xl shadow-cyan-500/25 flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5 transition-all"
              >
                <Play className="w-5 h-5 fill-current" /> Launch Interactive Live Demo
              </button>

              <button
                onClick={onRegister}
                className="btn-interactive px-7 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-2xl border-none shadow-xl shadow-amber-500/25 flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5 transition-all"
              >
                <span>Create My Hutch Account</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-slate-300">100% Offline Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400 shrink-0" />
                <span className="text-xs font-bold text-slate-300">ARBA Standards</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-400 shrink-0" />
                <span className="text-xs font-bold text-slate-300">FDA Health Audit</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400 shrink-0" />
                <span className="text-xs font-bold text-slate-300">4-H Family Ready</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md">
              
              {/* Main Champion Card Showcase */}
              <div className="glass-container p-6 border-2 border-amber-500/30 rounded-3xl shadow-2xl bg-slate-900/90 relative z-20">
                <div className="relative rounded-2xl overflow-hidden mb-4 border border-white/10 bg-slate-950">
                  <img src="/assets/new_zealand_white.png" alt="Champion New Zealand White" className="w-full h-64 object-contain p-2" />
                  <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Best In Show
                  </div>
                </div>

                <div className="text-left flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase text-amber-400 font-mono tracking-wider">Commercial Show Strain • Reg #REG-12345</span>
                  <h3 className="text-xl font-black text-white">Grandview's Snow Monarch</h3>
                  <p className="text-xs text-slate-400 font-semibold">New Zealand White • Senior Buck • 11 lbs 2 oz</p>
                  
                  <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block font-mono">Inbreeding COI</span>
                      <span className="font-bold text-emerald-400">0.00% (Optimal)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-slate-400 block font-mono">Grand Legs</span>
                      <span className="font-bold text-amber-400">5 Legs Awarded</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Accent Card 1: Pedigree Signature */}
              <div className="absolute -bottom-6 -left-6 z-30 glass-container p-4 border border-cyan-500/40 rounded-2xl bg-slate-900/95 shadow-xl hidden sm:flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black">
                  📜
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Instant Pedigree PDF</h4>
                  <p className="text-[10px] text-slate-400">Digital signature & QR code verified</p>
                </div>
              </div>

              {/* Floating Accent Card 2: 4-H Academy Badge */}
              <div className="absolute -top-6 -right-6 z-30 glass-container p-4 border border-yellow-500/40 rounded-2xl bg-slate-900/95 shadow-xl hidden sm:flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 font-black">
                  🎓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">4-H Youth Academy</h4>
                  <p className="text-[10px] text-slate-400">Standard of Perfection Quizzes</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* DEMO ACCOUNTS QUICK LAUNCH BANNER */}
      <section className="bg-gradient-to-r from-cyan-950/60 via-indigo-950/80 to-purple-950/60 border-y border-cyan-500/20 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-cyan-400 font-mono tracking-widest">⚡ Instant Live Demonstration</span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">No Sign-Up Needed</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">Explore Pre-Seeded Sample Hutch Accounts Instantly!</h2>
            <p className="text-xs text-slate-300 max-w-xl mt-1">
              Click any demo account below to test real pedigrees, breeding schedules, medical logs, and financial ledgers live in your browser.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 shrink-0">
            <button
              onClick={() => onTryDemo('ab-1')}
              className="btn-interactive p-4 bg-slate-900/90 hover:bg-slate-900 border-2 border-cyan-500/40 hover:border-cyan-400 rounded-2xl text-left flex items-center gap-3 cursor-pointer shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xl">
                👨‍🌾
              </div>
              <div>
                <h4 className="text-xs font-black text-white">Jason Miller</h4>
                <p className="text-[10px] text-cyan-300 font-semibold">Grandview Rabbitry (Pro Demo)</p>
              </div>
            </button>

            <button
              onClick={() => onTryDemo('ab-2')}
              className="btn-interactive p-4 bg-slate-900/90 hover:bg-slate-900 border-2 border-emerald-500/40 hover:border-emerald-400 rounded-2xl text-left flex items-center gap-3 cursor-pointer shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl">
                👩‍🌾
              </div>
              <div>
                <h4 className="text-xs font-black text-white">Sarah Connors</h4>
                <p className="text-[10px] text-emerald-300 font-semibold">Clover Barns (Mini Rex Demo)</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* FEATURE SHOWCASE TABS SECTION */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto text-center">
        <div className="max-w-3xl mx-auto mb-12">
          <span className="text-xs font-black uppercase text-amber-400 font-mono tracking-widest">Complete Feature Suite</span>
          <h2 className="text-3xl md:text-5xl font-black text-white mt-2">
            Everything You Need for Show & Barn Excellence
          </h2>
          <p className="text-sm text-slate-350 mt-3 leading-relaxed">
            Designed specifically for ARBA rabbit breeders, cavy enthusiasts, 4-H families, and commercial rabbitries.
          </p>
        </div>

        {/* Feature Tab Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {[
            { id: 'pedigree', icon: '📜', label: 'Pedigree Builder' },
            { id: 'gallery', icon: '📸', label: 'Photo Gallery & Timelines' },
            { id: 'breeding', icon: '🐰', label: 'Breeding & Health' },
            { id: 'transfers', icon: '🏷️', label: 'Sales & Transfers' },
            { id: 'youth', icon: '🎓', label: '4-H Youth Academy' },
            { id: 'offline', icon: '⚡', label: 'Offline PWA Ready' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFeatureTab(tab.id)}
              className={`btn-interactive px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 border cursor-pointer transition-all ${
                activeFeatureTab === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/25 scale-105'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Feature Tab Content Displays */}
        <div className="glass-container p-8 md:p-12 border-2 border-white/10 rounded-3xl bg-slate-900/60 text-left">
          
          {activeFeatureTab === 'pedigree' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl">📜</div>
                <h3 className="text-2xl font-black text-white">Interactive Pedigree Tree Builder & Genetics Engine</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Generate beautiful 3 to 4 generation official ARBA-compliant pedigree certificates. Auto-calculate Inbreeding Coefficients (Wright's COI) and predict color genotypes using our integrated genetic engine.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 font-semibold">
                  <li className="flex items-center gap-2 text-amber-400"><CheckCircle2 className="w-4 h-4" /> One-click PDF pedigree export with custom logo</li>
                  <li className="flex items-center gap-2 text-amber-400"><CheckCircle2 className="w-4 h-4" /> Inbreeding COI percentage & lineage alert warnings</li>
                  <li className="flex items-center gap-2 text-amber-400"><CheckCircle2 className="w-4 h-4" /> Grand Champions & leg count award tracking</li>
                </ul>
              </div>
              <div className="lg:col-span-6 glass-container p-6 border border-amber-500/30 rounded-2xl bg-slate-950">
                <div className="text-center font-bold text-xs text-amber-300 mb-4 uppercase tracking-wider">Sample 3-Generation Lineage Tree</div>
                <div className="space-y-3">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                    <span className="text-[10px] text-amber-400 font-mono block">SUBJECT (SIRE)</span>
                    <strong className="text-xs text-white">Grandview's Blue Thunder</strong>
                    <p className="text-[10px] text-slate-400">Holland Lop • Blue • Reg #12345</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-center">
                      <span className="text-[9px] text-blue-400 font-mono block">SIRE</span>
                      <strong className="text-xs text-white">Storm Rider</strong>
                    </div>
                    <div className="p-2.5 bg-pink-500/10 border border-pink-500/30 rounded-xl text-center">
                      <span className="text-[9px] text-pink-400 font-mono block">DAM</span>
                      <strong className="text-xs text-white">Sky Dancer</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'gallery' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-2xl">📸</div>
                <h3 className="text-2xl font-black text-white">Rich Photo Gallery & Growth Timelines</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Upload photos of your rabbits from birth through maturity. Track weight growth curves with interactive chart visualizers and store timeline photos for show condition audits.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 font-semibold">
                  <li className="flex items-center gap-2 text-pink-400"><CheckCircle2 className="w-4 h-4" /> WebP automatic image compression & instant lightbox viewer</li>
                  <li className="flex items-center gap-2 text-pink-400"><CheckCircle2 className="w-4 h-4" /> Side-by-side rabbit growth comparisons</li>
                  <li className="flex items-center gap-2 text-pink-400"><CheckCircle2 className="w-4 h-4" /> Tag photos by birth, weaning, 8-weeks, and senior status</li>
                </ul>
              </div>
              <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                <img src="/assets/holland_lop.png" alt="Holland Lop" className="w-full h-40 object-contain p-2 bg-slate-950 border border-white/10 rounded-2xl" />
                <img src="/assets/mini_rex.png" alt="Mini Rex" className="w-full h-40 object-contain p-2 bg-slate-950 border border-white/10 rounded-2xl" />
              </div>
            </div>
          )}

          {activeFeatureTab === 'breeding' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-2xl">🐰</div>
                <h3 className="text-2xl font-black text-white">Hutch Scheduling, Kindle Calculators & FDA Health Audit</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Never miss a kindle date or nestbox check again! Automatic countdown timers alert you when palpation, nestbox placement, and kindle dates arrive. Plus, track medical treatments with built-in FDA drug withdrawal safety rules.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 font-semibold">
                  <li className="flex items-center gap-2 text-rose-400"><CheckCircle2 className="w-4 h-4" /> 31-day kindle countdown calendar & nestbox alerts</li>
                  <li className="flex items-center gap-2 text-rose-400"><CheckCircle2 className="w-4 h-4" /> FDA meat withdrawal safety timers for show & commercial herds</li>
                  <li className="flex items-center gap-2 text-rose-400"><CheckCircle2 className="w-4 h-4" /> Daily chore task lists with one-tap completion</li>
                </ul>
              </div>
              <div className="lg:col-span-6 p-6 bg-slate-950 border border-rose-500/30 rounded-2xl text-left">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-white">Active Breeding #B-102</span>
                  <span className="text-[10px] font-black uppercase bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded">Kindle Due in 4 Days</span>
                </div>
                <p className="text-xs text-slate-400 mb-2">Buck: Storm Rider × Doe: Clover Blossom</p>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-rose-500 to-pink-500 h-full w-[85%]"></div>
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'transfers' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-2xl">🏷️</div>
                <h3 className="text-2xl font-black text-white">Digital Transfer Packets & Cryptographic Bill of Sale</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Transfer rabbit ownership instantly with cryptographic digital verification. Buyers receive a complete transfer packet including pedigree lineage, weight history, and signed bill of sale certificate.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 font-semibold">
                  <li className="flex items-center gap-2 text-indigo-400"><CheckCircle2 className="w-4 h-4" /> SHA-256 cryptographic verification hashes</li>
                  <li className="flex items-center gap-2 text-indigo-400"><CheckCircle2 className="w-4 h-4" /> Digital buyer & seller signature capture</li>
                  <li className="flex items-center gap-2 text-indigo-400"><CheckCircle2 className="w-4 h-4" /> Public marketplace listing for show stock & breeding stock</li>
                </ul>
              </div>
              <div className="lg:col-span-6 p-6 bg-slate-950 border border-indigo-500/30 rounded-2xl text-center">
                <div className="text-2xl mb-1">📜</div>
                <h4 className="text-sm font-bold text-white">Official Ownership Transfer Certificate</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-1">Certificate #TX-8821-4902 • Verified on Blockchain Ledger</p>
              </div>
            </div>
          )}

          {activeFeatureTab === 'youth' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-2xl">🎓</div>
                <h3 className="text-2xl font-black text-white">4-H Youth Academy & Parent Security Consent</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Empower 4-H kids with gamified ARBA Standard of Perfection quizzes, daily streak badges, and registrar exam prep. Features COPPA-compliant parent consent gates for family peace of mind.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 font-semibold">
                  <li className="flex items-center gap-2 text-yellow-400"><CheckCircle2 className="w-4 h-4" /> ARBA breed identification quizzes & flashcards</li>
                  <li className="flex items-center gap-2 text-yellow-400"><CheckCircle2 className="w-4 h-4" /> Parent approval dashboard & assistant write-only modes</li>
                  <li className="flex items-center gap-2 text-yellow-400"><CheckCircle2 className="w-4 h-4" /> Achievement trophy badges for young show exhibitors</li>
                </ul>
              </div>
              <div className="lg:col-span-6 p-6 bg-slate-950 border border-yellow-500/30 rounded-2xl text-center">
                <span className="text-3xl">🏆</span>
                <h4 className="text-sm font-bold text-white mt-2">4-H Junior Master Breeder Badge</h4>
                <p className="text-xs text-yellow-400 font-semibold mt-1">10 Quiz Streak Achieved!</p>
              </div>
            </div>
          )}

          {activeFeatureTab === 'offline' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-2xl">⚡</div>
                <h3 className="text-2xl font-black text-white">100% Offline Progressive Web App (PWA)</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Works seamlessly in barns, show arenas, and county fairs with zero internet connection! Your data is stored locally in Dexie IndexedDB and automatically syncs to the cloud when online.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 font-semibold">
                  <li className="flex items-center gap-2 text-cyan-400"><CheckCircle2 className="w-4 h-4" /> Zero internet dependency in rural barn areas</li>
                  <li className="flex items-center gap-2 text-cyan-400"><CheckCircle2 className="w-4 h-4" /> Vector clock conflict resolution for multi-device sync</li>
                  <li className="flex items-center gap-2 text-cyan-400"><CheckCircle2 className="w-4 h-4" /> One-tap mobile app home screen installation</li>
                </ul>
              </div>
              <div className="lg:col-span-6 p-6 bg-slate-950 border border-cyan-500/30 rounded-2xl text-center">
                <span className="text-3xl">🌐</span>
                <h4 className="text-sm font-bold text-white mt-2">Offline Barn Sync Enabled</h4>
                <p className="text-xs text-cyan-300 font-mono mt-1">100% Local Storage Active</p>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* SHOW CHAMPIONS GALLERY SECTION */}
      <section id="showcase" className="py-16 px-6 max-w-7xl mx-auto bg-slate-900/40 border-y border-white/10 rounded-3xl my-12">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10 text-left">
          <div>
            <span className="text-xs font-black uppercase text-amber-400 font-mono tracking-widest">ARBA Show Quality</span>
            <h2 className="text-3xl font-black text-white mt-1">Winning Show Rabbits Managed on WarrenWise</h2>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedBreedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${selectedBreedCategory === 'all' ? 'bg-amber-500 text-slate-950 border-amber-400 font-black' : 'bg-white/5 text-slate-300 border-white/10'}`}
            >
              All Champions
            </button>
            <button
              onClick={() => setSelectedBreedCategory('commercial')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${selectedBreedCategory === 'commercial' ? 'bg-amber-500 text-slate-950 border-amber-400 font-black' : 'bg-white/5 text-slate-300 border-white/10'}`}
            >
              Commercial Breeds
            </button>
            <button
              onClick={() => setSelectedBreedCategory('fancy')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${selectedBreedCategory === 'fancy' ? 'bg-amber-500 text-slate-950 border-amber-400 font-black' : 'bg-white/5 text-slate-300 border-white/10'}`}
            >
              Fancy Breeds
            </button>
          </div>
        </div>

        {/* Breed Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {filteredBreeds.map((rabbit, i) => (
            <div key={i} className="glass-container p-5 border border-white/10 rounded-2xl bg-slate-900/80 hover:border-amber-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="relative h-48 rounded-xl overflow-hidden bg-slate-950 mb-4 border border-white/5">
                  <img src={rabbit.image} alt={rabbit.name} className="w-full h-full object-contain p-2" />
                  <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    {rabbit.awards.split('-')[0]}
                  </div>
                </div>
                <h4 className="font-black text-white text-base">{rabbit.name}</h4>
                <p className="text-xs text-slate-400 font-semibold">{rabbit.breed} • {rabbit.class}</p>
                <p className="text-[11px] text-amber-300 font-bold mt-2 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-yellow-400" /> {rabbit.awards}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>{rabbit.breeder}</span>
                <span className="text-emerald-400 font-bold">ARBA Certified</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4-H YOUTH SECTION */}
      <section id="youth" className="py-16 px-6 max-w-7xl mx-auto text-left">
        <div className="glass-container p-8 md:p-12 border-2 border-yellow-500/30 rounded-3xl bg-gradient-to-br from-yellow-950/20 via-slate-900 to-amber-950/20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <span className="text-xs font-black uppercase text-yellow-400 font-mono tracking-widest">🍀 4-H & FFA Youth Program</span>
            <h2 className="text-3xl font-black text-white">Empowering the Next Generation of Livestock Champions</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              RabbitryPedigree Pro is built with dedicated tools for 4-H youth and FFA students. Train for county fair registrar exams, track project record books, and learn genetics in a fun, safe environment.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button onClick={onRegister} className="btn-interactive px-5 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs rounded-xl border-none">
                Register 4-H Family Account
              </button>
            </div>
          </div>
          <div className="lg:col-span-5 text-center">
            <img src="/assets/mascot.png" alt="WarrenWise Mascot" className="w-40 h-40 mx-auto object-contain p-2 bg-white/5 rounded-3xl border border-yellow-500/30 shadow-2xl" />
          </div>
        </div>
      </section>

      {/* PRICING & SUBSCRIPTION PLANS SECTION (NO 14-DAY FREE TRIAL) */}
      <section id="pricing" className="py-20 px-6 max-w-7xl mx-auto text-center">
        <div className="max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black uppercase text-amber-400 font-mono tracking-widest">Transparent Pricing</span>
          <h2 className="text-3xl md:text-5xl font-black text-white mt-2">Choose the Right Plan for Your Barn</h2>
          <p className="text-sm text-slate-350 mt-3">Simple monthly plans with zero hidden fees. Upgrade or cancel anytime.</p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          
          {/* BASIC PLAN */}
          <div className="glass-container p-8 border border-white/10 rounded-3xl bg-slate-900/60 flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Hobbyist & 4-H Starter</span>
              <h3 className="text-2xl font-black text-white">Basic Hutch Plan</h3>
              <div className="my-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$5.99</span>
                <span className="text-xs text-slate-400 font-semibold">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">Ideal for small rabbitries, 4-H youth projects, and hobby breeders.</p>
              
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> <strong>75 Active Hutches</strong></li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Unlimited 4-Gen Pedigree Exports</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Financial Ledger & Income Tracking</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Digital Bill of Sale Transfers</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 100% Offline PWA Access</li>
              </ul>
            </div>
            <button
              onClick={() => onSelectPlan('basic')}
              className="mt-8 btn-interactive w-full py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/10 cursor-pointer"
            >
              Select Basic Plan
            </button>
          </div>

          {/* PRO HERD PLAN (FEATURED) */}
          <div className="glass-container p-8 border-2 border-amber-500 rounded-3xl bg-slate-900/90 flex flex-col justify-between relative shadow-2xl shadow-amber-500/15 transform md:-translate-y-3">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
              ★ Most Popular for Breeders
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-2">Professional Show Herds</span>
              <h3 className="text-2xl font-black text-white">Pro Herd Plan</h3>
              <div className="my-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$14.99</span>
                <span className="text-xs text-slate-400 font-semibold">/ month</span>
              </div>
              <p className="text-xs text-slate-350 mb-6">Designed for active show exhibitors, commercial breeders, and multi-user barns.</p>
              
              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-amber-400 shrink-0" /> <strong>300 Active Hutches</strong></li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Advanced Genetics & COI Risk Calculator</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Barn Crew & Assistant Roles</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Photo Gallery Editor & Lightbox</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-amber-400 shrink-0" /> FDA Drug Withdrawal Health Safety Audit</li>
              </ul>
            </div>
            <button
              onClick={() => onSelectPlan('pro')}
              className="mt-8 btn-interactive w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl border-none shadow-lg shadow-amber-500/25 cursor-pointer"
            >
              Get Started with Pro Herd
            </button>
          </div>

          {/* MASTER BREEDER PLAN */}
          <div className="glass-container p-8 border border-white/10 rounded-3xl bg-slate-900/60 flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-2">Large Commercial & National Herds</span>
              <h3 className="text-2xl font-black text-white">Master Breeder Plan</h3>
              <div className="my-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$29.99</span>
                <span className="text-xs text-slate-400 font-semibold">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">Unlimited power for national champion rabbitries and commercial herds.</p>
              
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-cyan-400 shrink-0" /> <strong>1,000 Active Hutches</strong></li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-cyan-400 shrink-0" /> Free Evans Software Auto-Migrator</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-cyan-400 shrink-0" /> Priority ARBA Registrar Support</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-cyan-400 shrink-0" /> Unlimited Cloud Storage & Backups</li>
              </ul>
            </div>
            <button
              onClick={() => onSelectPlan('master')}
              className="mt-8 btn-interactive w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl border-none cursor-pointer"
            >
              Select Master Plan
            </button>
          </div>

        </div>
      </section>

      {/* EVANS MIGRATION BANNER */}
      <section id="evans" className="py-16 px-6 max-w-7xl mx-auto text-left">
        <div className="glass-container p-8 md:p-12 border-2 border-indigo-500/30 rounded-3xl bg-slate-900/80 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-black uppercase text-indigo-400 font-mono tracking-widest">🔄 Evans Software Migrator</span>
            <h2 className="text-2xl md:text-3xl font-black text-white">Switching from Legacy Evans Software?</h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Import your existing Evans database in seconds with our automated migrator tool. Lifetime verification badges available for verified Evans software owners.
            </p>
          </div>
          <button
            onClick={() => onTryDemo('ab-1')}
            className="btn-interactive px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl border-none shadow-lg shrink-0 cursor-pointer"
          >
            Try Evans Migrator Tool
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-slate-950 py-12 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/assets/mascot.png" alt="Mascot" className="w-8 h-8 object-contain" />
            <span className="font-black text-white text-sm">RabbitryPedigree Pro (WarrenWise)</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 font-semibold">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#youth" className="hover:text-white transition-colors">4-H Youth</a>
            <button onClick={onSignIn} className="hover:text-white transition-colors bg-transparent border-none text-xs text-slate-400 font-semibold cursor-pointer">Sign In</button>
          </div>

          <p className="text-[10px] text-slate-500">
            © {new Date().getFullYear()} RabbitryPedigree Pro. ARBA-Compatible Registry. All Rights Reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
