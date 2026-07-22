import React, { useState } from 'react';
import { 
  Sparkles, Award, ShieldCheck, HeartPulse, RefreshCw, Zap, 
  ChevronRight, CheckCircle2, FileText, Users, Download, ArrowRight,
  Star, Play, Lock, Smartphone, Database, Check, Layers, HelpCircle,
  ShoppingBag, Scale, Eye, Gavel
} from 'lucide-react';

export default function LandingHomePage({ 
  onSignIn, 
  onRegister, 
  onTryDemo, 
  onSelectPlan, 
  onOpenMarketplace, 
  onOpenTerms 
}) {
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
      category: "commercial",
      price: 150
    },
    {
      name: "Copper Ridge Champion",
      breed: "New Zealand Red",
      class: "Senior Doe",
      awards: "Best of Breed (BOB) - 4 Grand Legs",
      image: "/assets/new_zealand_red.png",
      breeder: "Grandview Rabbitry",
      category: "commercial",
      price: 180
    },
    {
      name: "Blue Thunder",
      breed: "Holland Lop",
      class: "Senior Buck",
      awards: "Best of Variety (BOV) - 3 Legs",
      image: "/assets/holland_lop.png",
      breeder: "Grandview Rabbitry",
      category: "fancy",
      price: 200
    },
    {
      name: "Clover Velvet King",
      breed: "Mini Rex",
      class: "Senior Buck",
      awards: "Best Fur Award - 5 Legs",
      image: "/assets/mini_rex.png",
      breeder: "Clover Barns",
      category: "fancy",
      price: 120
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

          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-300">
            <a href="#features" className="hover:text-yellow-400 transition-colors">Features</a>
            <a href="#marketplace-showcase" className="hover:text-yellow-400 transition-colors flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" /> Marketplace
            </a>
            <a href="#showcase" className="hover:text-yellow-400 transition-colors">Show Champions</a>
            <a href="#youth" className="hover:text-yellow-400 transition-colors">4-H Youth</a>
            <a href="#pricing" className="hover:text-yellow-400 transition-colors">Pricing & Plans</a>
            <button 
              onClick={onOpenTerms}
              className="hover:text-yellow-400 transition-colors text-slate-300 bg-transparent border-none font-bold text-xs cursor-pointer flex items-center gap-1"
            >
              <Scale className="w-3.5 h-3.5 text-emerald-400" /> Terms & Rules
            </button>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenMarketplace}
              className="btn-interactive px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-black rounded-xl border-none shadow-lg shadow-indigo-900/30 flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Marketplace
            </button>
            <button
              onClick={() => onTryDemo('ab-1')}
              className="btn-interactive px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded-xl border-none shadow-lg shadow-cyan-900/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Live Demo
            </button>
            <button
              onClick={onSignIn}
              className="btn-interactive px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/10 cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onRegister}
              className="btn-interactive px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black rounded-xl border-none shadow-lg shadow-amber-500/25 cursor-pointer"
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
              Fun, reliable, and built for show success! Manage your hutch records, design 4-generation pedigree certificates, buy & sell verified purebred stock in our 100% legal marketplace, and empower your 4-H family.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenMarketplace}
                className="btn-interactive px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-sm rounded-2xl border-none shadow-xl shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5 transition-all"
              >
                <ShoppingBag className="w-5 h-5" /> Explore Breeder Marketplace
              </button>

              <button
                onClick={() => onTryDemo('ab-1')}
                className="btn-interactive px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm rounded-2xl border-none shadow-xl shadow-cyan-500/25 flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5 transition-all"
              >
                <Play className="w-5 h-5 fill-current" /> Live Demo
              </button>

              <button
                onClick={onRegister}
                className="btn-interactive px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-2xl border-none shadow-xl shadow-amber-500/25 flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5 transition-all"
              >
                <span>Create Hutch Account</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-slate-300">100% Legal Livestock</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400 shrink-0" />
                <span className="text-xs font-bold text-slate-300">ARBA & Cavy Standards</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-400 shrink-0" />
                <span className="text-xs font-bold text-slate-300">HIPAA Safe Harbor</span>
              </div>
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-indigo-400 shrink-0" />
                <span className="text-xs font-bold text-slate-300">Owner Abuse Protection</span>
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

            </div>
          </div>

        </div>
      </section>

      {/* FEATURED BREEDER MARKETPLACE SHOWCASE SECTION */}
      <section id="marketplace-showcase" className="py-16 px-6 max-w-7xl mx-auto text-left">
        <div className="glass-container p-8 border-2 border-indigo-500/30 rounded-3xl bg-slate-900/80 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-black uppercase tracking-wider mb-2">
                <ShoppingBag className="w-4 h-4 text-cyan-400" /> 100% Certified Public Directory
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">Verified Breeder Marketplace Showcase</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Browse purebred show stock, commercial utility meat breeders, and pedigreed animals from verified WarrenWise breeders. All listings are subject to strict legal guidelines and seller verification.
              </p>
            </div>
            <button
              onClick={onOpenMarketplace}
              className="btn-interactive px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-xs rounded-xl border-none shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <ShoppingBag className="w-4 h-4" /> View All Listings
            </button>
          </div>

          {/* Grid of sample stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {breedsShowcase.map((stock, idx) => (
              <div key={idx} className="bg-slate-950 border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
                <div>
                  <div className="relative rounded-xl overflow-hidden bg-slate-900 h-40 mb-3">
                    <img src={stock.image} alt={stock.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-slate-950/80 border border-white/10 text-[9px] font-black text-emerald-400 px-2 py-0.5 rounded-full">
                      ✓ Verified Breeder
                    </span>
                    <span className="absolute bottom-2 right-2 bg-slate-950/90 text-white font-black text-xs px-2.5 py-1 rounded-lg">
                      ${stock.price}
                    </span>
                  </div>
                  <strong className="text-white text-sm font-bold block truncate">{stock.name}</strong>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{stock.breed} • {stock.class}</span>
                  <span className="text-[10px] text-amber-400 font-semibold block mt-1">🏆 {stock.awards}</span>
                </div>
                <button
                  onClick={onOpenMarketplace}
                  className="mt-4 w-full py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl border-none cursor-pointer flex items-center justify-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View Listing & Pedigree
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-16 px-6 max-w-7xl mx-auto text-left">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-black uppercase text-amber-400 tracking-widest">Fair & Transparent Pricing</span>
          <h2 className="text-3xl font-black text-white mt-2">Choose Your Hutch Capacity Tier</h2>
          <p className="text-slate-400 text-xs mt-2">Scale seamlessly as your rabbitry grows. All plans include 100% offline access and full legal compliance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* BASIC HUTCH PLAN */}
          <div className="glass-container p-8 border border-white/10 rounded-3xl bg-slate-900/60 flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Hobby & Starter Barns</span>
              <h3 className="text-2xl font-black text-white">Basic Hutch Plan</h3>
              <div className="my-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$2.59</span>
                <span className="text-xs text-slate-400 font-semibold">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">Perfect for small rabbitries, 4-H exhibitors, and beginner breeders.</p>
              
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> <strong>50 Active Hutches</strong></li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 4-Generation Pedigree Builder</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Breeding & Nest Box Reminders</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> ARBA Weight & Show Class Calculator</li>
              </ul>
            </div>
            <button
              onClick={() => onSelectPlan('basic')}
              className="mt-8 btn-interactive w-full py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/10 cursor-pointer"
            >
              Select Basic Plan ($2.59/mo)
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
                <span className="text-4xl font-black text-white">$8.99</span>
                <span className="text-xs text-slate-400 font-semibold">/ month</span>
              </div>
              <p className="text-xs text-slate-350 mb-6">Designed for active show exhibitors, commercial breeders, and multi-user barns.</p>
              
              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-amber-400 shrink-0" /> <strong>300 Active Hutches</strong></li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Advanced Genetics & COI Risk Calculator</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Barn Crew & Assistant Roles</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Photo Gallery Editor & Lightbox</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Medication & Health Treatment Logs</li>
              </ul>
            </div>
            <button
              onClick={() => onSelectPlan('pro')}
              className="mt-8 btn-interactive w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl border-none shadow-lg shadow-amber-500/25 cursor-pointer"
            >
              Get Started with Pro Herd ($8.99/mo)
            </button>
          </div>

          {/* MASTER BREEDER PLAN */}
          <div className="glass-container p-8 border border-white/10 rounded-3xl bg-slate-900/60 flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-2">Large Commercial & National Herds</span>
              <h3 className="text-2xl font-black text-white">Master Breeder Plan</h3>
              <div className="my-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$17.99</span>
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
              Select Master Plan ($17.99/mo)
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER WITH LEGAL LINKS */}
      <footer className="border-t border-white/10 bg-slate-950 py-12 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/assets/mascot.png" alt="Mascot" className="w-8 h-8 object-contain" />
            <div>
              <span className="font-black text-white text-sm block text-left">RabbitryPedigree Pro</span>
              <span className="text-[10px] text-slate-500 block text-left">App Owner: Jason Mounts</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 font-semibold">
            <button onClick={onOpenMarketplace} className="hover:text-white transition-colors bg-transparent border-none text-xs text-slate-400 font-semibold cursor-pointer">Marketplace Directory</button>
            <button onClick={onOpenTerms} className="hover:text-yellow-400 transition-colors bg-transparent border-none text-xs text-emerald-400 font-bold cursor-pointer">📜 Terms of Service & Rules</button>
            <button onClick={onOpenTerms} className="hover:text-white transition-colors bg-transparent border-none text-xs text-slate-400 font-semibold cursor-pointer">🛡️ Privacy & HIPAA Policy</button>
            <button onClick={onOpenTerms} className="hover:text-white transition-colors bg-transparent border-none text-xs text-slate-400 font-semibold cursor-pointer">⚖️ 100% Legal Livestock Rules</button>
            <button onClick={onSignIn} className="hover:text-white transition-colors bg-transparent border-none text-xs text-slate-400 font-semibold cursor-pointer">Sign In</button>
          </div>

          <p className="text-[10px] text-slate-500">
            © {new Date().getFullYear()} RabbitryPedigree Pro. ARBA & USDA Compliant. All Rights Reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
