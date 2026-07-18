import React, { useState, useEffect, useMemo } from 'react';
import { Search, Sliders, ShoppingBag, Eye, X, Award, ShieldCheck, Heart, Sparkles, Phone, Mail } from 'lucide-react';

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBreed, setFilterBreed] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSex, setFilterSex] = useState('');
  
  // Modal states
  const [selectedListing, setSelectedListing] = useState(null);
  const [pedigreeTree, setPedigreeTree] = useState(null);
  const [pedigreeLoading, setPedigreeLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(null); // listingId
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch listings on mount
  useEffect(() => {
    fetchListings();
    
    // Check if redirecting back from a successful checkout
    const params = new URLSearchParams(window.location.hash.split('?')[1] || window.location.search);
    if (params.get('checkout') === 'success') {
      setSuccessMessage('🎉 Congratulations! Your purchase reservation was completed successfully. The breeder has been notified to coordinate pick-up.');
    }
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const API_ROOT = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';
      const res = await fetch(`${API_ROOT}/api/public/listings`);
      const data = await res.json();
      setListings(data || []);
    } catch(e) {
      console.error("Failed to load marketplace listings:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPedigreePreview = async (listingId) => {
    try {
      setPedigreeLoading(true);
      setPedigreeTree(null);
      const API_ROOT = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';
      const res = await fetch(`${API_ROOT}/api/public/listings/${listingId}/pedigree`);
      const data = await res.json();
      setPedigreeTree(data);
    } catch(e) {
      console.error("Failed to load pedigree tree preview:", e);
    } finally {
      setPedigreeLoading(false);
    }
  };

  const handlePurchaseListing = async (listingId) => {
    try {
      setPurchaseLoading(listingId);
      const API_ROOT = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';
      const res = await fetch(`${API_ROOT}/api/public/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId })
      });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else if (data.success) {
        setSuccessMessage('🎉 Reservation completed successfully (Simulated Payment). Listing updated to Sold!');
        fetchListings();
      } else {
        alert(data.error || 'Failed to initialize purchase.');
      }
    } catch(e) {
      console.error("Purchase reservation error:", e);
      alert('Failed to connect to checkout session.');
    } finally {
      setPurchaseLoading(null);
    }
  };

  // Filter computations
  const filteredListings = useMemo(() => {
    return listings.filter(l => {
      const r = l.rabbit || {};
      const matchSearch = 
        (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.breed || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.breederName || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchBreed = !filterBreed || (r.breed || '') === filterBreed;
      const matchCategory = !filterCategory || l.category === filterCategory;
      const matchSex = !filterSex || (r.sex || '') === filterSex;
      
      return matchSearch && matchBreed && matchCategory && matchSex;
    });
  }, [listings, searchQuery, filterBreed, filterCategory, filterSex]);

  // Extract unique breeds for selection
  const uniqueBreeds = useMemo(() => {
    const breeds = new Set();
    listings.forEach(l => {
      if (l.rabbit?.breed) breeds.add(l.rabbit.breed);
    });
    return Array.from(breeds);
  }, [listings]);

  const renderPedigreeNode = (node, relationshipLabel) => {
    if (!node) {
      return (
        <div className="p-2 border border-dashed border-white/10 rounded-xl text-center text-[9px] opacity-40 italic">
          Empty ancestor slot
        </div>
      );
    }
    return (
      <div className="p-3 bg-slate-900 border border-white/10 rounded-xl text-left flex flex-col gap-0.5 relative">
        <span className="absolute top-1 right-2 text-[8px] font-black text-indigo-400 font-mono uppercase">{relationshipLabel}</span>
        <strong className="text-white text-xs truncate max-w-[100px]">{node.name}</strong>
        <span className="text-[9px] text-slate-400">Tattoo: {node.tattooNumber || 'None'}</span>
        <span className="text-[9px] text-indigo-300 truncate">{node.breed}</span>
        {node.weightOz && <span className="text-[9px] text-slate-400">Wt: {(node.weightOz / 16).toFixed(2)} lbs</span>}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 text-slate-100 p-6 min-h-screen bg-slate-950/80">
      
      {/* Banner / Notice Alert */}
      {successMessage && (
        <div className="glass-container p-4 border border-emerald-500/30 bg-emerald-950/15 backdrop-blur flex justify-between items-center relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
          <p className="text-xs font-bold text-emerald-400 text-left">{successMessage}</p>
          <button onClick={() => setSuccessMessage('')} className="text-slate-400 hover:text-white border-none bg-transparent cursor-pointer font-bold ml-4">Dismiss</button>
        </div>
      )}

      {/* Hero Header */}
      <div className="glass-container p-8 border border-indigo-500/20 bg-indigo-950/5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="text-left max-w-xl">
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[10px] font-black uppercase tracking-wider">
            Public Directory Marketplace
          </span>
          <h2 className="text-2xl font-black tracking-tight text-white mt-2">
            ARBA Show-Class & Commercial Marketplace
          </h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Browse and secure purebred show stock, commercial utility meat breeders, and companion pets from certified local WarrenWise rabbitries. No account required to purchase.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-xl">🏆</span>
            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Show Registry</span>
            <span className="text-xs font-black text-indigo-400 mt-0.5">100% Certified</span>
          </div>
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-xl">🥩</span>
            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Commercial</span>
            <span className="text-xs font-black text-emerald-400 mt-0.5">Meat Standard</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-container p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2 text-xs w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by breed, breeder name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-slate-100 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-900 border border-white/10 text-white text-xs rounded-xl py-2 px-3 focus:outline-none flex-1 md:flex-none"
          >
            <option value="">All Categories</option>
            <option value="show">🏆 ARBA Show Quality</option>
            <option value="utility_breeder">🧬 Utility Breeder</option>
            <option value="meat">🥩 Commercial Meat</option>
            <option value="pet">🐰 Pet / Companion</option>
          </select>

          {/* Breed Filter */}
          <select
            value={filterBreed}
            onChange={(e) => setFilterBreed(e.target.value)}
            className="bg-slate-900 border border-white/10 text-white text-xs rounded-xl py-2 px-3 focus:outline-none flex-1 md:flex-none"
          >
            <option value="">All Breeds</option>
            {uniqueBreeds.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Sex Filter */}
          <select
            value={filterSex}
            onChange={(e) => setFilterSex(e.target.value)}
            className="bg-slate-900 border border-white/10 text-white text-xs rounded-xl py-2 px-3 focus:outline-none flex-1 md:flex-none"
          >
            <option value="">All Genders</option>
            <option value="buck">Buck (Male)</option>
            <option value="doe">Doe (Female)</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="glass-container p-12 text-center text-xs opacity-50 font-bold">
          Loading marketplace directory listings...
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="glass-container p-12 text-center text-slate-400">
          No active sales listings matching current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map(listing => {
            const rabbit = listing.rabbit || {};
            const isShow = listing.category === 'show';
            const isMeat = listing.category === 'meat';
            const isUtility = listing.category === 'utility_breeder';

            return (
              <div 
                key={listing.id}
                className="group glass-container p-3 flex flex-col gap-3 relative hover:border-indigo-500/50 transition-all text-left"
              >
                {/* Photo Header */}
                <div className="relative overflow-hidden rounded-xl h-44 bg-slate-950/80">
                  <img
                    src={rabbit.photos?.[0] || 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&q=80'}
                    alt={rabbit.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-all duration-300"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {/* Category badge */}
                    <span className={`text-[9px] font-black py-0.5 px-2 rounded-full border text-white shadow ${
                      isShow ? 'bg-indigo-650 border-indigo-500/30' :
                      isMeat ? 'bg-emerald-650 border-emerald-500/30' :
                      isUtility ? 'bg-amber-650 border-amber-500/30' :
                      'bg-slate-700 border-slate-500/30'
                    }`}>
                      {isShow ? '🏆 Show Quality' :
                       isMeat ? '🥩 Commercial Meat' :
                       isUtility ? '🧬 Utility Breeder' :
                       '🐰 Pet / Companion'}
                    </span>
                    {rabbit.tattooNumber && (
                      <span className="bg-slate-950/80 border border-white/10 text-[9px] font-bold py-0.5 px-2 rounded-full text-indigo-300 w-max">
                        Left Ear: {rabbit.tattooNumber}
                      </span>
                    )}
                  </div>
                  {/* Price overlay */}
                  <div className="absolute bottom-2 right-2 bg-slate-950/90 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-black text-white">
                    ${listing.price.toFixed(2)}
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-white text-sm font-black truncate">{rabbit.name || 'Listed Rabbit'}</strong>
                    <span className="text-[9px] uppercase font-bold text-slate-400">{rabbit.sex === 'buck' ? 'Buck ♂' : 'Doe ♀'}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-400 mt-1">
                    <span>Breed: <strong className="text-slate-300">{rabbit.breed || 'N/A'}</strong></span>
                    <span>Variety: <strong className="text-slate-300">{rabbit.variety || 'N/A'}</strong></span>
                    <span>DOB: <strong className="text-slate-300">{rabbit.dob || 'Unknown'}</strong></span>
                    {rabbit.weightOz && (
                      <span>Weight: <strong className="text-slate-300">{(rabbit.weightOz / 16).toFixed(2)} lbs</strong></span>
                    )}
                  </div>

                  {listing.description && (
                    <p className="text-[10px] text-slate-400 italic mt-2 line-clamp-2 leading-relaxed">
                      "{listing.description}"
                    </p>
                  )}
                  
                  <div className="border-t border-white/5 pt-2 mt-2 flex flex-col gap-1 text-[10px]">
                    <span className="text-[9px] text-slate-500 uppercase font-black">Breeder:</span>
                    <span className="font-bold text-indigo-350">{listing.breederName}</span>
                    <span className="text-[9px] text-slate-400 flex items-center gap-1">
                      {listing.contactMethod === 'email' ? <Mail className="w-3 h-3 text-indigo-400" /> : <Phone className="w-3 h-3 text-indigo-400" />}
                      {listing.contactInfo}
                    </span>
                  </div>
                </div>

                {/* Action panel */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={() => {
                      setSelectedListing(listing);
                      fetchPedigreePreview(listing.id);
                    }}
                    className="py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-lg cursor-pointer border border-white/10 flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Pedigree
                  </button>
                  <button
                    onClick={() => handlePurchaseListing(listing.id)}
                    disabled={purchaseLoading === listing.id}
                    className="py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg cursor-pointer border-none flex items-center justify-center gap-1 shadow-md shadow-indigo-650/15"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Buy / Reserve
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pedigree Preview Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-950 border-2 border-indigo-500/35 rounded-3xl p-6 flex flex-col gap-4 shadow-2xl relative animate-scale-up text-left">
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute top-4 right-4 p-2 bg-slate-900 rounded-full border-none text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col gap-1">
              <h3 className="font-extrabold text-base text-indigo-450 uppercase flex items-center gap-1.5">
                <Award className="w-5 h-5 text-indigo-450" /> Official 3-Gen Pedigree Preview
              </h3>
              <p className="text-[10px] text-slate-400">
                Ancestry registry for {selectedListing.rabbit?.name} — Tattoo: {selectedListing.rabbit?.tattooNumber || 'None'}
              </p>
            </div>

            {/* Pedigree Tree column boxes */}
            {pedigreeLoading ? (
              <div className="h-48 flex items-center justify-center text-xs text-slate-500 font-bold italic">
                Generating ancestry relationships...
              </div>
            ) : pedigreeTree ? (
              <div className="grid grid-cols-3 gap-3 items-center bg-slate-900/40 p-4 border border-white/5 rounded-2xl relative overflow-hidden min-h-[220px]">
                {/* Watermark overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-5 font-black text-6xl text-indigo-500 uppercase tracking-widest rotate-12">
                  WarrenWise Pedigree
                </div>
                
                {/* Column 1: Proband */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] uppercase font-black text-slate-500 text-center block">Proband</span>
                  {renderPedigreeNode(pedigreeTree, "Self")}
                </div>

                {/* Column 2: Parents */}
                <div className="flex flex-col gap-4">
                  <span className="text-[9px] uppercase font-black text-slate-500 text-center block">Parents</span>
                  <div className="flex flex-col gap-3">
                    {renderPedigreeNode(pedigreeTree.sire, "Sire")}
                    {renderPedigreeNode(pedigreeTree.dam, "Dam")}
                  </div>
                </div>

                {/* Column 3: Grandparents */}
                <div className="flex flex-col gap-4">
                  <span className="text-[9px] uppercase font-black text-slate-500 text-center block">Grandparents</span>
                  <div className="flex flex-col gap-2">
                    {renderPedigreeNode(pedigreeTree.sire?.sire, "P. Grand Sire")}
                    {renderPedigreeNode(pedigreeTree.sire?.dam, "P. Grand Dam")}
                    <div className="h-0.5 border-t border-white/5 my-1"></div>
                    {renderPedigreeNode(pedigreeTree.dam?.sire, "M. Grand Sire")}
                    {renderPedigreeNode(pedigreeTree.dam?.dam, "M. Grand Dam")}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-xs text-slate-500 italic">
                Ancestry records not linked. Listing type: {selectedListing.category}.
              </div>
            )}

            <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl text-[10px] text-slate-400">
              <span className="font-bold text-white block mb-1">ARBA SHOW RULE COMPLIANCE CERTIFICATION</span>
              This rabbit is certified healthy and offered under standard ARBA guidelines. Show Quality listings contain verified tattoos and pedigree history. Reserved purchases are held automatically via Stripe Secure.
            </div>

            <button
              onClick={() => {
                setSelectedListing(null);
                handlePurchaseListing(selectedListing.id);
              }}
              className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-md shadow-indigo-650/15"
            >
              <ShoppingBag className="w-4 h-4" /> Reserve This Rabbit Now
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
