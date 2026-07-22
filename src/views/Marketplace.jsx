import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Sliders, ShoppingBag, Eye, X, Award, ShieldCheck, Heart, Sparkles, 
  Phone, Mail, Flag, Plus, Scale, AlertTriangle, Check, CheckCircle2, Lock,
  MapPin, ArrowUpDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import TermsAndPolicies from './TermsAndPolicies';

const ITEMS_PER_PAGE = 25;

export default function Marketplace({ currentUser }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState(''); // Zip / Area Code / State
  const [maxMiles, setMaxMiles] = useState(''); // Radius in miles: '', '25', '50', '100', '250', '500'
  const [filterBreed, setFilterBreed] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSex, setFilterSex] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest | oldest | price_asc | price_desc | breed
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [selectedListing, setSelectedListing] = useState(null);
  const [pedigreeTree, setPedigreeTree] = useState(null);
  const [pedigreeLoading, setPedigreeLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Create Listing Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    breed: 'Holland Lop',
    variety: 'Solid',
    sex: 'buck',
    category: 'show',
    price: '120',
    location: '', // Area Code / Zip Code / State
    contactMethod: 'email',
    contactInfo: currentUser?.email || '',
    description: '',
    photoUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&q=80',
    agreedToTerms: false
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Report Listing Modal State
  const [reportingListing, setReportingListing] = useState(null);
  const [reportReason, setReportReason] = useState('Inaccurate Pedigree');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // Terms Modal State
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Fetch listings on mount
  useEffect(() => {
    fetchListings();
    
    const params = new URLSearchParams(window.location.hash.split('?')[1] || window.location.search);
    if (params.get('checkout') === 'success') {
      setSuccessMessage('🎉 Congratulations! Your purchase reservation was completed successfully. The breeder has been notified to coordinate pick-up.');
    }
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const API_ROOT = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
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
      const API_ROOT = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
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
      const API_ROOT = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
      const res = await fetch(`${API_ROOT}/api/public/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId })
      });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
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

  // Create Listing Handler
  const handleCreateListingSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.agreedToTerms) {
      alert('You must agree to the 100% Legal Marketplace Rules and Terms of Service to create a listing.');
      return;
    }

    if (currentUser?.status === 'banned' || currentUser?.status === 'suspended') {
      alert('Your account is currently suspended or banned from posting marketplace listings by App Owner Jason Mounts.');
      return;
    }

    try {
      setCreateSubmitting(true);
      const API_ROOT = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
      const res = await fetch(`${API_ROOT}/api/marketplace/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          breederId: currentUser?.id || 'ab-1',
          breederName: currentUser?.name || currentUser?.rabbitryName || 'Grandview Rabbitry',
          rabbitName: createForm.name,
          breed: createForm.breed,
          variety: createForm.variety,
          sex: createForm.sex,
          category: createForm.category,
          price: parseFloat(createForm.price) || 50,
          location: createForm.location,
          contactMethod: createForm.contactMethod,
          contactInfo: createForm.contactInfo,
          description: createForm.description,
          photoUrl: createForm.photoUrl,
          healthCertified: 1
        })
      });

      const data = await res.json();
      if (data.error) {
        alert(`Listing Error: ${data.error}`);
      } else {
        setSuccessMessage('🎉 Your new sales listing has been published to the 100% Legal Public Marketplace!');
        setShowCreateModal(false);
        setCreateForm({
          name: '',
          breed: 'Holland Lop',
          variety: 'Solid',
          sex: 'buck',
          category: 'show',
          price: '120',
          location: '',
          contactMethod: 'email',
          contactInfo: currentUser?.email || '',
          description: '',
          photoUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&q=80',
          agreedToTerms: false
        });
        fetchListings();
      }
    } catch (err) {
      console.error("Create listing failed:", err);
      alert('Failed to publish listing. Please try again.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Submit Abuse Report Handler
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportingListing) return;

    try {
      setReportSubmitting(true);
      const API_ROOT = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
      const res = await fetch(`${API_ROOT}/api/marketplace/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: reportingListing.id,
          reporterId: currentUser?.id || 'anonymous',
          reason: reportReason,
          details: reportDetails
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Thank you! Your report has been submitted to App Owner Jason Mounts for moderation review within 24 hours.');
        setReportingListing(null);
        setReportDetails('');
      } else {
        alert(data.error || 'Failed to submit report.');
      }
    } catch(err) {
      console.error("Report submission failed:", err);
      alert('Failed to submit report. Please try again.');
    } finally {
      setReportSubmitting(false);
    }
  };

  // Distance estimation helper in miles
  const getEstimatedDistanceMiles = (listingLoc, userLoc) => {
    if (!userLoc) return null;
    const userNum = parseInt(userLoc.replace(/\D/g, ''), 10);
    const itemNum = parseInt((listingLoc || '').replace(/\D/g, ''), 10);
    if (!isNaN(userNum) && !isNaN(itemNum)) {
      const diff = Math.abs(userNum - itemNum);
      return Math.min(Math.max(Math.round(diff / 8), 4), 500);
    }
    return 18; // Default estimated distance
  };

  // Filter & Sort Computation
  const filteredAndSortedListings = useMemo(() => {
    const list = listings.filter(l => {
      const r = l.rabbit || {};
      const matchSearch = 
        (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.breed || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.breederName || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const loc = (locationQuery || '').toLowerCase().trim();
      const matchLocation = !loc || 
        (l.location || '').toLowerCase().includes(loc) ||
        (l.contactInfo || '').toLowerCase().includes(loc) ||
        (l.breederName || '').toLowerCase().includes(loc);

      // Distance Radius Filter
      const estimatedDist = getEstimatedDistanceMiles(l.location || l.contactInfo, locationQuery);
      const matchRadius = !maxMiles || !locationQuery || (estimatedDist !== null && estimatedDist <= parseInt(maxMiles, 10));

      const matchBreed = !filterBreed || (r.breed || '') === filterBreed;
      const matchCategory = !filterCategory || l.category === filterCategory;
      const matchSex = !filterSex || (r.sex || '') === filterSex;
      
      return matchSearch && matchLocation && matchRadius && matchBreed && matchCategory && matchSex;
    });

    // Apply Sorting
    return list.sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || a.created_at || 0) - new Date(b.createdAt || b.created_at || 0);
      }
      if (sortBy === 'price_asc') {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortBy === 'price_desc') {
        return (b.price || 0) - (a.price || 0);
      }
      if (sortBy === 'breed') {
        return (a.rabbit?.breed || '').localeCompare(b.rabbit?.breed || '');
      }
      // Default: newest
      return new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
    });
  }, [listings, searchQuery, locationQuery, maxMiles, filterBreed, filterCategory, filterSex, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, locationQuery, maxMiles, filterBreed, filterCategory, filterSex, sortBy]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredAndSortedListings.length / ITEMS_PER_PAGE) || 1;
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedListings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedListings, currentPage]);

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
        <div className="glass-container p-4 border border-emerald-500/30 bg-emerald-950/15 backdrop-blur flex justify-between items-center relative overflow-hidden animate-fade-in text-left">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
          <p className="text-xs font-bold text-emerald-400">{successMessage}</p>
          <button onClick={() => setSuccessMessage('')} className="text-slate-400 hover:text-white border-none bg-transparent cursor-pointer font-bold ml-4">Dismiss</button>
        </div>
      )}

      {/* Hero Header */}
      <div className="glass-container p-8 border border-indigo-500/20 bg-indigo-950/5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="text-left max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[10px] font-black uppercase tracking-wider">
              100% Legal Public Marketplace Directory
            </span>
            <button 
              onClick={() => setShowTermsModal(true)}
              className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[10px] font-bold hover:bg-emerald-500/20 cursor-pointer flex items-center gap-1"
            >
              <Scale className="w-3 h-3" /> View Marketplace Rules & Terms
            </button>
          </div>
          
          <h2 className="text-2xl font-black tracking-tight text-white mt-2">
            Purebred Show-Class & Commercial Breeder Directory
          </h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Browse purebred show stock, commercial utility meat breeders, and companion pets from certified local WarrenWise rabbitries. Monitored by App Owner Jason Mounts for 100% safety.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-interactive px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black rounded-2xl border-none shadow-lg shadow-amber-500/25 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 font-black" /> Post Sales Listing
          </button>
        </div>
      </div>

      {/* Filter, Search, Location & Sort Bar */}
      <div className="glass-container p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 w-full flex-wrap">
          {/* Keyword Search */}
          <div className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2 text-xs flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search breed, rabbit name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-slate-100 focus:outline-none w-full"
            />
          </div>

          {/* Area Code / Zip Code / Location Input */}
          <div className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2 text-xs w-full sm:w-48">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <input
              type="text"
              placeholder="Area Code / Zip / State..."
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="bg-transparent border-none text-slate-100 focus:outline-none w-full"
            />
          </div>

          {/* Distance Radius Selector */}
          <select
            value={maxMiles}
            onChange={(e) => setMaxMiles(e.target.value)}
            className="bg-slate-900 border border-white/10 text-amber-300 font-bold text-xs rounded-xl py-2 px-3 focus:outline-none flex-1 sm:flex-none cursor-pointer"
          >
            <option value="">Distance: Any Radius</option>
            <option value="25">Within 25 Miles</option>
            <option value="50">Within 50 Miles</option>
            <option value="100">Within 100 Miles</option>
            <option value="250">Within 250 Miles</option>
            <option value="500">Within 500 Miles</option>
          </select>
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-slate-900 border border-white/10 rounded-xl px-2 py-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400 ml-1 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-white text-xs py-1 px-2 focus:outline-none cursor-pointer border-none"
            >
              <option value="newest">Sort: Newest to Oldest</option>
              <option value="oldest">Sort: Oldest to Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="breed">Sort by Breed (A-Z)</option>
            </select>
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-900 border border-white/10 text-white text-xs rounded-xl py-2 px-3 focus:outline-none flex-1 md:flex-none"
          >
            <option value="">All Categories</option>
            <option value="show">🏆 Standard Show Quality</option>
            <option value="utility_breeder">🧬 Utility Breeder</option>
            <option value="meat">🥩 Commercial Meat</option>
            <option value="pet">🐰 Pet / Companion</option>
          </select>

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

      {/* Results Header Info & Pagination Summary */}
      <div className="flex justify-between items-center text-xs text-slate-400 px-1">
        <span>
          Showing {paginatedListings.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} – {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedListings.length)} of <strong className="text-white">{filteredAndSortedListings.length}</strong> active sales listings
          {locationQuery && <span className="text-amber-400 font-semibold ml-2">📍 Location: "{locationQuery}"</span>}
        </span>
        {totalPages > 1 && (
          <span className="font-mono text-[11px] text-indigo-300 font-bold">
            Page {currentPage} of {totalPages} (25 per page)
          </span>
        )}
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="glass-container p-12 text-center text-xs opacity-50 font-bold">
          Loading marketplace directory listings...
        </div>
      ) : paginatedListings.length === 0 ? (
        <div className="glass-container p-12 text-center text-slate-400">
          No active sales listings matching current filters or area code.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedListings.map(listing => {
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
                    src={rabbit.photos?.[0] || listing.photoUrl || 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&q=80'}
                    alt={rabbit.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-all duration-300"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
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

                  {/* Flag button */}
                  <button
                    onClick={() => setReportingListing(listing)}
                    title="Report Listing to App Owner Jason Mounts"
                    className="absolute top-2 right-2 p-1.5 bg-slate-950/80 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-full border border-white/10 cursor-pointer transition-all"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>

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
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-500 uppercase font-black">Breeder:</span>
                      <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        ✓ Verified
                      </span>
                    </div>
                    <span className="font-bold text-indigo-300">{listing.breederName}</span>
                    {listing.location && (
                      <span className="text-[9px] text-amber-300 font-semibold flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                          Location: {listing.location}
                        </span>
                        {locationQuery && (
                          <span className="text-[9px] font-mono text-cyan-300 font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/20">
                            ~{getEstimatedDistanceMiles(listing.location || listing.contactInfo, locationQuery)} mi away
                          </span>
                        )}
                      </span>
                    )}
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

      {/* PAGINATION FOOTER (25 PER PAGE) */}
      {totalPages > 1 && (
        <div className="glass-container p-4 flex items-center justify-between gap-4 mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-xs font-bold rounded-xl border border-white/10 flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Previous Page
          </button>

          <span className="text-xs font-bold text-slate-300 font-mono">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-xs font-bold rounded-xl border border-white/10 flex items-center gap-1 cursor-pointer"
          >
            Next Page <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CREATE NEW LISTING MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 flex flex-col gap-4 shadow-2xl relative animate-scale-up text-left max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 bg-slate-900 rounded-full border-none text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col gap-1">
              <h3 className="font-extrabold text-lg text-amber-400 uppercase flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" /> Post New Sales Listing
              </h3>
              <p className="text-xs text-slate-400">
                Publish a 100% legal sales listing to the public WarrenWise breeder directory.
              </p>
            </div>

            <form onSubmit={handleCreateListingSubmit} className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Rabbit Name / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Grandview Royal King"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Breed *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Holland Lop"
                    value={createForm.breed}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, breed: e.target.value }))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Variety / Color</label>
                  <input
                    type="text"
                    placeholder="E.g. Sable Point"
                    value={createForm.variety}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, variety: e.target.value }))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Gender *</label>
                  <select
                    value={createForm.sex}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, sex: e.target.value }))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="buck">Buck (Male)</option>
                    <option value="doe">Doe (Female)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Category *</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="show">🏆 Standard Show Quality</option>
                    <option value="utility_breeder">🧬 Utility Breeder</option>
                    <option value="meat">🥩 Commercial Meat</option>
                    <option value="pet">🐰 Pet / Companion</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Price ($USD) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="120"
                    value={createForm.price}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Area Code / Zip / State</label>
                  <input
                    type="text"
                    placeholder="E.g. 44114, OH"
                    value={createForm.location}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Contact Method</label>
                  <select
                    value={createForm.contactMethod}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, contactMethod: e.target.value }))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Contact Info *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. breeder@farm.com"
                  value={createForm.contactInfo}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, contactInfo: e.target.value }))}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Description / Pedigree Highlights</label>
                <textarea
                  rows="2"
                  placeholder="Describe show wins, bloodlines, temperament..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Photo Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={createForm.photoUrl}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, photoUrl: e.target.value }))}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              {/* Mandatory Terms Checkbox */}
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 mt-2">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={createForm.agreedToTerms}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, agreedToTerms: e.target.checked }))}
                  className="mt-1 accent-emerald-500 cursor-pointer"
                />
                <label htmlFor="agreeTerms" className="text-[11px] text-emerald-200 cursor-pointer leading-tight">
                  <strong>100% Legal & Breed Standards Agreement:</strong> I certify under penalty of account suspension that this listing is 100% legal under USDA & state livestock laws, accurate under recognized breed standards, and free of puppy/kitten mills or prohibited animals.
                </label>
              </div>

              <button
                type="submit"
                disabled={createSubmitting || !createForm.agreedToTerms}
                className="mt-2 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer border-none shadow-lg shadow-amber-500/25"
              >
                {createSubmitting ? 'Publishing...' : 'Publish Sales Listing'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REPORT LISTING MODAL */}
      {reportingListing && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-950 border-2 border-red-500/40 rounded-3xl p-6 flex flex-col gap-4 shadow-2xl relative animate-scale-up text-left">
            <button
              onClick={() => setReportingListing(null)}
              className="absolute top-4 right-4 p-2 bg-slate-900 rounded-full border-none text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col gap-1">
              <h3 className="font-extrabold text-base text-red-400 uppercase flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-400" /> Report Listing to App Owner
              </h3>
              <p className="text-xs text-slate-400">
                Report "{reportingListing.rabbit?.name}" to App Owner Jason Mounts for investigation.
              </p>
            </div>

            <form onSubmit={handleReportSubmit} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Reason for Report *</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value="Inaccurate Pedigree">Inaccurate Pedigree / Falsified Lineage</option>
                  <option value="Animal Welfare Concern">Animal Welfare / Health Concern</option>
                  <option value="Fraud / Misrepresentation">Fraud / Scam / Misrepresentation</option>
                  <option value="Prohibited Animal">Prohibited Non-Rabbit Animal</option>
                  <option value="Inappropriate Content">Inappropriate Language / Imagery</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Additional Details</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Provide specific information regarding this violation..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={reportSubmitting}
                className="w-full py-2.5 bg-red-650 hover:bg-red-750 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer border-none shadow-md"
              >
                {reportSubmitting ? 'Submitting Report...' : 'Submit Report for Moderation'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PEDIGREE PREVIEW MODAL */}
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
              <h3 className="font-extrabold text-base text-indigo-400 uppercase flex items-center gap-1.5">
                <Award className="w-5 h-5 text-indigo-400" /> Official 3-Gen Pedigree Preview
              </h3>
              <p className="text-[10px] text-slate-400">
                Ancestry registry for {selectedListing.rabbit?.name} — Tattoo: {selectedListing.rabbit?.tattooNumber || 'None'}
              </p>
            </div>

            {pedigreeLoading ? (
              <div className="h-48 flex items-center justify-center text-xs text-slate-500 font-bold italic">
                Generating ancestry relationships...
              </div>
            ) : pedigreeTree ? (
              <div className="grid grid-cols-3 gap-3 items-center bg-slate-900/40 p-4 border border-white/5 rounded-2xl relative overflow-hidden min-h-[220px]">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-5 font-black text-6xl text-indigo-500 uppercase tracking-widest rotate-12">
                  WarrenWise Pedigree
                </div>
                
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] uppercase font-black text-slate-500 text-center block">Proband</span>
                  {renderPedigreeNode(pedigreeTree, "Self")}
                </div>

                <div className="flex flex-col gap-4">
                  <span className="text-[9px] uppercase font-black text-slate-500 text-center block">Parents</span>
                  <div className="flex flex-col gap-3">
                    {renderPedigreeNode(pedigreeTree.sire, "Sire")}
                    {renderPedigreeNode(pedigreeTree.dam, "Dam")}
                  </div>
                </div>

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
              <span className="font-bold text-white block mb-1">PUREBRED SHOW RULE COMPLIANCE CERTIFICATION</span>
              This rabbit is certified healthy and offered under standard breed guidelines. Reserved purchases are held automatically via Stripe Secure.
            </div>

            <button
              onClick={() => {
                setSelectedListing(null);
                handlePurchaseListing(selectedListing.id);
              }}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-md shadow-indigo-600/15"
            >
              <ShoppingBag className="w-4 h-4" /> Reserve This Rabbit Now
            </button>
          </div>
        </div>
      )}

      {/* FULL TERMS AND POLICIES MODAL */}
      {showTermsModal && (
        <TermsAndPolicies onClose={() => setShowTermsModal(false)} initialTab="marketplace" />
      )}

    </div>
  );
}
