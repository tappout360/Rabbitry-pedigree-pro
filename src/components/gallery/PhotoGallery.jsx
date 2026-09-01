import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Camera, Search, Trash2, Grid, Calendar, Image as ImageIcon, Sparkles, 
  Sliders, Plus, FolderPlus, Folder, X, Download, Star, CheckCircle, 
  Tag, Filter, Eye, ArrowRight, Upload, Info, RefreshCw
} from 'lucide-react';
import { db } from '../../db/registryDb';

export default function PhotoGallery({ 
  rabbits = [], 
  allRabbits = [], 
  onUpdateRabbit, 
  showToast 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [filterBreed, setFilterBreed] = useState('');
  const [activeAlbum, setActiveAlbum] = useState('all');
  const containerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(24);

  // Upload modal & form states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadRabbitId, setUploadRabbitId] = useState('');
  const [uploadAlbumId, setUploadAlbumId] = useState('general');
  const [uploadTag, setUploadTag] = useState('Profile');
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Custom Album creation modal
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDesc, setNewAlbumDesc] = useState('');
  const [newAlbumIcon, setNewAlbumIcon] = useState('📁');

  // Comparison mode
  const [comparisonRabbitId, setComparisonRabbitId] = useState('');

  // Custom user-created albums persisted in localStorage
  const [customAlbums, setCustomAlbums] = useState(() => {
    try {
      const saved = localStorage.getItem('rp_custom_albums');
      return saved ? JSON.parse(saved) : [
        { id: 'champions', name: 'Show Champions', icon: '🏆', desc: 'Leg winners and Best of Breed stock' },
        { id: 'nursery', name: 'Nursery & Kits', icon: '🍼', desc: 'Junior prospects and litters' },
        { id: 'barn', name: 'Barn & Facilities', icon: '🏠', desc: 'Hutches, cages and barn facilities' }
      ];
    } catch {
      return [
        { id: 'champions', name: 'Show Champions', icon: '🏆', desc: 'Leg winners and Best of Breed stock' },
        { id: 'nursery', name: 'Nursery & Kits', icon: '🍼', desc: 'Junior prospects and litters' },
        { id: 'barn', name: 'Barn & Facilities', icon: '🏠', desc: 'Hutches, cages and barn facilities' }
      ];
    }
  });

  const saveCustomAlbums = (updated) => {
    setCustomAlbums(updated);
    localStorage.setItem('rp_custom_albums', JSON.stringify(updated));
  };

  const handleCreateAlbum = (e) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;

    const newAlbum = {
      id: `alb-${Date.now()}`,
      name: newAlbumName.trim(),
      desc: newAlbumDesc.trim() || 'Custom Rabbitry Collection',
      icon: newAlbumIcon || '📁'
    };

    const updated = [...customAlbums, newAlbum];
    saveCustomAlbums(updated);
    setActiveAlbum(newAlbum.id);
    setNewAlbumName('');
    setNewAlbumDesc('');
    setShowAlbumModal(false);
    if (showToast) showToast(`Created album "${newAlbum.name}"!`, 'success');
  };

  const handleDeleteAlbum = (albumId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to remove this album? Photos inside will remain linked to your rabbits.")) {
      const updated = customAlbums.filter(a => a.id !== albumId);
      saveCustomAlbums(updated);
      if (activeAlbum === albumId) setActiveAlbum('all');
      if (showToast) showToast("Album removed.", "info");
    }
  };

  // Extract all photos across entire inventory
  const allPhotos = useMemo(() => {
    const photos = [];
    const sourceRabbits = rabbits.length > 0 ? rabbits : allRabbits;

    sourceRabbits.forEach(rabbit => {
      // 1. Single primary photo property
      if (rabbit.photo && typeof rabbit.photo === 'string') {
        photos.push({
          id: `${rabbit.id}-primary`,
          rabbitId: rabbit.id,
          rabbitName: rabbit.name,
          rabbitTattoo: rabbit.tattooNumber || 'No Tattoo',
          rabbitBreed: rabbit.breed || 'Standard Purebred',
          url: rabbit.photo,
          date: rabbit.dob || 'Unknown',
          tag: 'Profile',
          album: rabbit.legs && rabbit.legs.length > 0 ? 'champions' : 'general',
          type: 'Primary Display',
          notes: rabbit.notes || 'Primary herd inventory portrait.'
        });
      }

      // 2. Photos array (strings or photo objects)
      if (Array.isArray(rabbit.photos)) {
        rabbit.photos.forEach((p, idx) => {
          const photoUrl = typeof p === 'string' ? p : p.url;
          if (photoUrl && photoUrl !== rabbit.photo) {
            photos.push({
              id: `${rabbit.id}-photo-${idx}`,
              rabbitId: rabbit.id,
              rabbitName: rabbit.name,
              rabbitTattoo: rabbit.tattooNumber || 'No Tattoo',
              rabbitBreed: rabbit.breed || 'Standard Purebred',
              url: photoUrl,
              date: typeof p === 'object' && p.date ? p.date : (rabbit.dob || 'Unknown'),
              tag: typeof p === 'object' && p.tag ? p.tag : 'Gallery',
              album: typeof p === 'object' && p.album ? p.album : (rabbit.legs?.length > 0 ? 'champions' : 'general'),
              type: 'Gallery Photo',
              notes: typeof p === 'object' && p.notes ? p.notes : 'Gallery log capture.'
            });
          }
        });
      }

      // 3. Timeline event photos
      if (Array.isArray(rabbit.timeline)) {
        rabbit.timeline.forEach((entry, idx) => {
          if (entry.photo && entry.photo !== rabbit.photo) {
            photos.push({
              id: entry.id || `${rabbit.id}-timeline-${idx}`,
              rabbitId: rabbit.id,
              rabbitName: rabbit.name,
              rabbitTattoo: rabbit.tattooNumber || 'No Tattoo',
              rabbitBreed: rabbit.breed || 'Standard Purebred',
              url: entry.photo,
              date: entry.date || 'Unknown',
              tag: 'Growth Check',
              album: 'nursery',
              type: 'Timeline Event',
              notes: entry.notes || entry.title || 'Growth weight check.'
            });
          }
        });
      }
    });

    return photos;
  }, [rabbits, allRabbits]);

  // Extract unique breeds
  const uniqueBreeds = useMemo(() => {
    const breeds = new Set();
    allPhotos.forEach(p => {
      if (p.rabbitBreed) breeds.add(p.rabbitBreed);
    });
    return Array.from(breeds);
  }, [allPhotos]);

  // Filtered photos based on Search, Breed, and Active Album
  const filteredPhotos = useMemo(() => {
    return allPhotos.filter(photo => {
      // 1. Search Query
      const matchSearch = !searchQuery.trim() || 
        photo.rabbitName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.rabbitTattoo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.rabbitBreed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (photo.notes && photo.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (photo.tag && photo.tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Breed Filter
      const matchBreed = !filterBreed || photo.rabbitBreed === filterBreed;

      // 3. Album Filter
      let matchAlbum = true;
      if (activeAlbum === 'all') {
        matchAlbum = true;
      } else if (activeAlbum === 'champions') {
        const rab = rabbits.find(r => r.id === photo.rabbitId);
        matchAlbum = (rab && rab.legs && rab.legs.length > 0) || photo.album === 'champions' || photo.tag === 'Show Ring';
      } else if (activeAlbum === 'holland_lop') {
        matchAlbum = photo.rabbitBreed?.toLowerCase().includes('holland');
      } else if (activeAlbum === 'mini_rex') {
        matchAlbum = photo.rabbitBreed?.toLowerCase().includes('rex');
      } else if (activeAlbum === 'dwarf') {
        matchAlbum = photo.rabbitBreed?.toLowerCase().includes('dwarf');
      } else if (activeAlbum === 'commercial') {
        matchAlbum = photo.rabbitBreed?.toLowerCase().includes('zealand') || photo.rabbitBreed?.toLowerCase().includes('californian') || photo.rabbitBreed?.toLowerCase().includes('giant');
      } else if (activeAlbum === 'youth') {
        const rab = rabbits.find(r => r.id === photo.rabbitId);
        matchAlbum = rab?.breederId?.includes('youth') || photo.album === 'youth';
      } else if (activeAlbum === 'health') {
        matchAlbum = photo.tag === 'Health Check' || photo.album === 'health';
      } else {
        // Custom Album match
        matchAlbum = photo.album === activeAlbum;
      }

      return matchSearch && matchBreed && matchAlbum;
    });
  }, [allPhotos, searchQuery, filterBreed, activeAlbum, rabbits]);

  // Handle Photo Upload
  const handleProcessUpload = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        let w = img.width;
        let h = img.height;
        if (w > MAX_WIDTH) {
          h = Math.round((h * MAX_WIDTH) / w);
          w = MAX_WIDTH;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const compressedWebp = canvas.toDataURL('image/webp', 0.8);
        setUploadPreview(compressedWebp);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUploadedPhoto = async (e) => {
    e.preventDefault();
    if (!uploadPreview) {
      alert("Please choose or take a photo first.");
      return;
    }
    if (!uploadRabbitId) {
      alert("Please select which rabbit this photo belongs to.");
      return;
    }

    setIsUploading(true);
    try {
      const targetRabbit = (rabbits.length > 0 ? rabbits : allRabbits).find(r => r.id === uploadRabbitId);
      if (!targetRabbit) throw new Error("Rabbit not found");

      const newPhotoObj = {
        url: uploadPreview,
        tag: uploadTag,
        album: uploadAlbumId,
        date: uploadDate,
        notes: uploadNotes.trim() || `${uploadTag} picture logged`
      };

      const updatedPhotos = [newPhotoObj, ...(targetRabbit.photos || [])];
      const updatedRabbit = {
        ...targetRabbit,
        photo: targetRabbit.photo ? targetRabbit.photo : uploadPreview,
        photos: updatedPhotos
      };

      if (onUpdateRabbit) onUpdateRabbit(updatedRabbit);
      if (showToast) showToast(`Added photo to ${targetRabbit.name}!`, 'success');

      // Reset and close
      setUploadPreview(null);
      setUploadRabbitId('');
      setUploadNotes('');
      setShowUploadModal(false);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to save photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Photo
  const handleDeletePhoto = (photo, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Delete this photo of ${photo.rabbitName}?`)) return;

    const targetRabbit = (rabbits.length > 0 ? rabbits : allRabbits).find(r => r.id === photo.rabbitId);
    if (!targetRabbit) return;

    const updatedPhotos = (targetRabbit.photos || []).filter(p => {
      const u = typeof p === 'string' ? p : p.url;
      return u !== photo.url;
    });

    const isPrimary = targetRabbit.photo === photo.url;
    const newPrimary = isPrimary 
      ? (updatedPhotos[0] ? (typeof updatedPhotos[0] === 'string' ? updatedPhotos[0] : updatedPhotos[0].url) : '') 
      : targetRabbit.photo;

    const updatedTimeline = (targetRabbit.timeline || []).filter(t => t.photo !== photo.url);

    const updatedRabbit = {
      ...targetRabbit,
      photo: newPrimary,
      photos: updatedPhotos,
      timeline: updatedTimeline
    };

    if (onUpdateRabbit) onUpdateRabbit(updatedRabbit);
    if (selectedImage && selectedImage.url === photo.url) setSelectedImage(null);
    if (showToast) showToast("Photo removed from rabbitry records.", "info");
  };

  // Set as Primary Profile Picture
  const handleSetAsPrimary = (photo, e) => {
    if (e) e.stopPropagation();
    const targetRabbit = (rabbits.length > 0 ? rabbits : allRabbits).find(r => r.id === photo.rabbitId);
    if (!targetRabbit) return;

    const updatedRabbit = {
      ...targetRabbit,
      photo: photo.url
    };

    if (onUpdateRabbit) onUpdateRabbit(updatedRabbit);
    if (showToast) showToast(`Set as primary profile picture for ${targetRabbit.name}!`, 'success');
  };

  // Populate sample breed photos for any rabbit lacking photos
  const handlePopulateSamplePhotos = () => {
    const sourceRabbits = rabbits.length > 0 ? rabbits : allRabbits;
    let updatedCount = 0;

    sourceRabbits.forEach(rabbit => {
      if (!rabbit.photo || rabbit.photo.includes('unsplash') || rabbit.photo === '') {
        let photoUrl = '/assets/holland_lop.png';
        const b = (rabbit.breed || '').toLowerCase();
        if (b.includes('rex')) photoUrl = '/assets/mini_rex.png';
        else if (b.includes('dwarf')) photoUrl = '/assets/netherland_dwarf.png';
        else if (b.includes('zealand') && (rabbit.variety || '').toLowerCase().includes('red')) photoUrl = '/assets/new_zealand_red.png';
        else if (b.includes('zealand') && (rabbit.variety || '').toLowerCase().includes('blue')) photoUrl = '/assets/new_zealand_blue.png';
        else if (b.includes('zealand')) photoUrl = '/assets/new_zealand_white.png';
        else if (b.includes('californian')) photoUrl = '/assets/californian_rabbit.png';
        else if (b.includes('flemish')) photoUrl = '/assets/flemish_giant.png';

        const updated = {
          ...rabbit,
          photo: photoUrl,
          photos: [photoUrl, ...(rabbit.photos || []).filter(p => p !== photoUrl)]
        };
        if (onUpdateRabbit) onUpdateRabbit(updated);
        updatedCount++;
      }
    });

    if (showToast) showToast(`Assigned authentic breed pictures to ${updatedCount} rabbits!`, 'success');
  };

  // Side-by-side growth comparison
  const comparisonTimeline = useMemo(() => {
    if (!comparisonRabbitId) return [];
    const sourceRabbits = rabbits.length > 0 ? rabbits : allRabbits;
    const rabbit = sourceRabbits.find(r => r.id === comparisonRabbitId);
    if (!rabbit) return [];

    const items = [];
    if (rabbit.photos) {
      rabbit.photos.forEach((p, idx) => {
        const url = typeof p === 'string' ? p : p.url;
        items.push({
          url: url,
          tag: typeof p === 'object' && p.tag ? p.tag : 'Profile',
          notes: typeof p === 'object' && p.notes ? p.notes : 'Herd Inventory Picture',
          date: typeof p === 'object' && p.date ? p.date : (rabbit.dob || 'Unknown'),
          label: `Photo #${idx + 1}`
        });
      });
    }
    if (rabbit.timeline) {
      rabbit.timeline.forEach(entry => {
        if (entry.photo) {
          items.push({
            url: entry.photo,
            tag: 'Growth Check',
            notes: entry.notes || 'Hutch Check Log',
            date: entry.date,
            weight: entry.weightOz ? `${(entry.weightOz / 16).toFixed(2)} lbs` : null,
            label: entry.title || 'Growth Check'
          });
        }
      });
    }
    return items.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [rabbits, allRabbits, comparisonRabbitId]);

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* 1. TOP HEADER & MAIN ACTIONS BAR */}
      <div className="glass-container p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-2 border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <ImageIcon className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black tracking-tight text-white">
              Rabbitry Media Gallery & Albums
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/30">
              {allPhotos.length} Total Pictures
            </span>
          </div>
          <p className="text-xs text-slate-300">
            High-resolution herd portraits, show certificates, health logs, and growth timeline comparisons.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-interactive py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer border-none shadow-lg shadow-indigo-900/30"
          >
            <Camera className="w-4 h-4 text-cyan-300" /> Upload / Take Photo
          </button>

          <button
            onClick={() => setShowAlbumModal(true)}
            className="btn-interactive py-2.5 px-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-white/10"
          >
            <FolderPlus className="w-4 h-4 text-amber-400" /> New Album
          </button>

          <button
            onClick={handlePopulateSamplePhotos}
            className="btn-interactive py-2.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-white/10"
            title="Populate authentic breed portraits for demo animals"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" /> Auto-Assign Breed Photos
          </button>
        </div>
      </div>

      {/* 2. ALBUMS NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setActiveAlbum('all')}
          className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border-none ${
            activeAlbum === 'all' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40' 
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
          }`}
        >
          📁 All Herd Photos ({allPhotos.length})
        </button>

        <button
          onClick={() => setActiveAlbum('champions')}
          className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border-none ${
            activeAlbum === 'champions' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40' 
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
          }`}
        >
          🏆 Show Champions
        </button>

        <button
          onClick={() => setActiveAlbum('holland_lop')}
          className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border-none ${
            activeAlbum === 'holland_lop' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40' 
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
          }`}
        >
          🐰 Holland Lops
        </button>

        <button
          onClick={() => setActiveAlbum('mini_rex')}
          className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border-none ${
            activeAlbum === 'mini_rex' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40' 
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
          }`}
        >
          👑 Mini Rex
        </button>

        <button
          onClick={() => setActiveAlbum('commercial')}
          className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border-none ${
            activeAlbum === 'commercial' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40' 
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
          }`}
        >
          🥩 Commercial & Meat
        </button>

        {/* Custom User Albums */}
        {customAlbums.map(alb => (
          <div key={alb.id} className="relative group flex items-center">
            <button
              onClick={() => setActiveAlbum(alb.id)}
              className={`flex items-center gap-1.5 py-2 pl-3.5 pr-7 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border-none ${
                activeAlbum === alb.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40' 
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
              }`}
            >
              <span>{alb.icon}</span> {alb.name}
            </button>
            <button
              onClick={(e) => handleDeleteAlbum(alb.id, e)}
              className="absolute right-2 text-slate-400 hover:text-red-400 border-none bg-transparent cursor-pointer p-0.5 text-xs opacity-60 group-hover:opacity-100"
              title="Delete custom album"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* 3. SEARCH, BREED FILTER & GROWTH COMPARISON TOOLBAR */}
      <div className="glass-container p-4 flex flex-col md:flex-row items-center justify-between gap-3 border border-white/10">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2 text-xs flex-1 md:max-w-xs">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search rabbit, tattoo, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white border-none bg-transparent cursor-pointer">✕</button>
            )}
          </div>

          <select
            value={filterBreed}
            onChange={(e) => setFilterBreed(e.target.value)}
            className="bg-slate-900 border border-white/10 text-white text-xs rounded-xl py-2 px-3 focus:outline-none"
          >
            <option value="">All Breeds</option>
            {uniqueBreeds.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Growth Comparison Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={comparisonRabbitId}
            onChange={(e) => setComparisonRabbitId(e.target.value)}
            className="bg-slate-900 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl py-2 px-3 focus:outline-none font-bold w-full md:w-auto"
          >
            <option value="">📈 Compare Growth History...</option>
            {(rabbits.length > 0 ? rabbits : allRabbits).map(r => (
              <option key={r.id} value={r.id}>{r.name} ({r.tattooNumber || 'No Tattoo'})</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. GROWTH TIMELINE COMPARISON DRAWER */}
      {comparisonRabbitId && (
        <div className="glass-container p-6 border-2 border-emerald-500/30 bg-slate-950/60 rounded-3xl flex flex-col gap-4 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                📈 Side-by-Side Growth & Physical Changes
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Comparing weight logs, body condition, and coat development over time.
              </p>
            </div>
            <button 
              onClick={() => setComparisonRabbitId('')} 
              className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded-lg border border-white/10 cursor-pointer"
            >
              Close Comparison
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin">
            {comparisonTimeline.length === 0 ? (
              <div className="text-xs text-slate-400 py-8 text-center w-full">
                No photo logs found for this animal yet. Upload a photo or log a weight in the Health tab to start comparing.
              </div>
            ) : (
              comparisonTimeline.map((item, idx) => (
                <div key={idx} className="shrink-0 w-52 bg-slate-900 p-3 rounded-2xl border border-white/10 flex flex-col gap-2 shadow-lg">
                  <div className="h-32 overflow-hidden rounded-xl bg-slate-950 border border-white/5">
                    <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-[11px] flex flex-col gap-1">
                    <strong className="text-indigo-300 block truncate">{item.label}</strong>
                    <span className="text-[10px] text-slate-400">📅 Date: {item.date}</span>
                    {item.weight && <span className="text-[10px] text-emerald-400 font-bold">⚖️ Weight: {item.weight}</span>}
                    <p className="text-[10px] text-slate-300 italic truncate" title={item.notes}>"{item.notes}"</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. MAIN MEDIA GALLERY GRID / EMPTY STATE */}
      <div ref={containerRef} className="min-h-[350px]">
        {filteredPhotos.length === 0 ? (
          <div className="glass-container p-12 text-center flex flex-col items-center justify-center gap-4 border-2 border-dashed border-white/10 rounded-3xl my-6">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl">
              📸
            </div>
            <div>
              <h3 className="text-lg font-black text-white mb-1">
                {searchQuery || filterBreed || activeAlbum !== 'all' ? 'No Matching Photos in this Filter' : 'Your Media Gallery is Ready'}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {searchQuery || filterBreed || activeAlbum !== 'all'
                  ? 'Try clearing your search query or selecting a different album above.'
                  : 'Start capturing purebred portraits, tattoo proofs, ARBA show ribbons, and nursery kit milestones.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-interactive py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl border-none cursor-pointer flex items-center gap-2"
              >
                <Camera className="w-4 h-4" /> Upload First Photo
              </button>

              <button
                onClick={() => setShowAlbumModal(true)}
                className="btn-interactive py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-white/10 cursor-pointer flex items-center gap-1.5"
              >
                <FolderPlus className="w-4 h-4" /> Create Album
              </button>

              <button
                onClick={handlePopulateSamplePhotos}
                className="btn-interactive py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl border-none cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" /> Load Sample Breed Photos
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.slice(0, visibleCount).map((photo) => (
              <div 
                key={photo.id}
                onClick={() => setSelectedImage(photo)}
                className="group glass-container p-2.5 flex flex-col justify-between gap-2 border border-white/10 hover:border-indigo-500/50 transition-all rounded-2xl cursor-pointer bg-slate-900/90 hover:shadow-xl hover:shadow-indigo-950/40 relative overflow-hidden"
              >
                {/* Photo Image Frame */}
                <div className="relative overflow-hidden rounded-xl h-48 bg-slate-950 flex items-center justify-center">
                  <img
                    src={photo.url}
                    alt={photo.rabbitName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    loading="lazy"
                  />
                  {/* Tag Pill */}
                  <span className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-sm border border-white/15 text-[9px] font-black py-0.5 px-2 rounded-full text-indigo-300">
                    {photo.tag || photo.type}
                  </span>

                  {/* Primary Star Indicator */}
                  {photo.type === 'Primary Display' && (
                    <span className="absolute top-2 right-2 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow">
                      ⭐ Main
                    </span>
                  )}
                </div>

                {/* Card Bottom Meta & Actions */}
                <div className="flex justify-between items-end px-1 pt-1">
                  <div className="flex flex-col text-left overflow-hidden">
                    <strong className="text-white text-xs font-black truncate max-w-[150px]">{photo.rabbitName}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">Tat: {photo.rabbitTattoo} • {photo.rabbitBreed}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleSetAsPrimary(photo, e)}
                      className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-white/10 border-none bg-transparent cursor-pointer transition-all"
                      title="Set as primary profile picture"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeletePhoto(photo, e)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/10 border-none bg-transparent cursor-pointer transition-all"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. UPLOAD / CAMERA CAPTURE MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-container p-6 border-2 border-indigo-500/40 rounded-3xl max-w-lg w-full bg-slate-900 shadow-2xl relative flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-400" /> Upload or Capture Rabbit Photo
              </h3>
              <button
                onClick={() => { setShowUploadModal(false); setUploadPreview(null); }}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-red-600 text-white font-bold flex items-center justify-center cursor-pointer border-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUploadedPhoto} className="flex flex-col gap-4">
              
              {/* Image Preview / Capture Zone */}
              <div className="flex flex-col gap-2">
                {uploadPreview ? (
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-white/10 h-52 flex items-center justify-center">
                    <img src={uploadPreview} alt="Preview" className="w-full h-full object-contain p-2" />
                    <button
                      type="button"
                      onClick={() => setUploadPreview(null)}
                      className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg border-none cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <label className="p-6 border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition-all text-center">
                      <Upload className="w-6 h-6 text-indigo-400" />
                      <span className="text-xs font-bold text-white">Choose File</span>
                      <span className="text-[10px] text-slate-400">JPG, PNG, WEBP</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleProcessUpload(e.target.files[0])}
                      />
                    </label>

                    <label className="p-6 border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition-all text-center">
                      <Camera className="w-6 h-6 text-emerald-400" />
                      <span className="text-xs font-bold text-white">Take Photo</span>
                      <span className="text-[10px] text-slate-400">Camera</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => handleProcessUpload(e.target.files[0])}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Rabbit Selection */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase">Select Rabbit *</label>
                <select
                  required
                  value={uploadRabbitId}
                  onChange={(e) => setUploadRabbitId(e.target.value)}
                  className="bg-slate-950 border border-white/10 text-white text-xs rounded-xl p-2.5 focus:outline-none"
                >
                  <option value="">-- Choose Rabbit from Herd --</option>
                  {(rabbits.length > 0 ? rabbits : allRabbits).map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.tattooNumber || 'No Tattoo'}) - {r.breed}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag & Album Assignment */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase">Photo Tag</label>
                  <select
                    value={uploadTag}
                    onChange={(e) => setUploadTag(e.target.value)}
                    className="bg-slate-950 border border-white/10 text-white text-xs rounded-xl p-2.5 focus:outline-none"
                  >
                    <option value="Profile">Profile (Main Face)</option>
                    <option value="Side Pose">Side Standard Pose</option>
                    <option value="Top Crown">Top Crown / Head</option>
                    <option value="Show Ring">Show Ring & Ribbons</option>
                    <option value="Health Check">Health / Teeth / Claws</option>
                    <option value="Kits / Nursery">Kits / Nursery</option>
                    <option value="General">General / Hutch</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase">Assign to Album</label>
                  <select
                    value={uploadAlbumId}
                    onChange={(e) => setUploadAlbumId(e.target.value)}
                    className="bg-slate-950 border border-white/10 text-white text-xs rounded-xl p-2.5 focus:outline-none"
                  >
                    <option value="general">📁 General Collection</option>
                    <option value="champions">🏆 Show Champions</option>
                    <option value="nursery">🍼 Nursery & Kits</option>
                    <option value="barn">🏠 Barn & Facilities</option>
                    {customAlbums.map(a => (
                      <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes & Date */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase">Notes / Caption</label>
                  <input
                    type="text"
                    placeholder="E.g., Showing prime fur condition."
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                    className="bg-slate-950 border border-white/10 text-white text-xs rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase">Log Date</label>
                  <input
                    type="date"
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    className="bg-slate-950 border border-white/10 text-white text-xs rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={isUploading || !uploadPreview}
                  className="btn-interactive flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs rounded-xl border-none cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? 'Saving Photo...' : '💾 Save Photo to Gallery'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowUploadModal(false); setUploadPreview(null); }}
                  className="btn-interactive py-3 px-5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-white/10 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 7. CREATE ALBUM MODAL */}
      {showAlbumModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-container p-6 border-2 border-amber-500/40 rounded-3xl max-w-md w-full bg-slate-900 shadow-2xl relative flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-amber-400" /> Create Custom Photo Album
              </h3>
              <button
                onClick={() => setShowAlbumModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-red-600 text-white font-bold flex items-center justify-center cursor-pointer border-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAlbum} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase">Album Name *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., 2026 National Show Team"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  className="bg-slate-950 border border-white/10 text-white text-xs rounded-xl p-2.5 focus:outline-none font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase">Description</label>
                <input
                  type="text"
                  placeholder="E.g., All senior bucks prep for ARBA convention"
                  value={newAlbumDesc}
                  onChange={(e) => setNewAlbumDesc(e.target.value)}
                  className="bg-slate-950 border border-white/10 text-white text-xs rounded-xl p-2.5 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase">Album Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {['📁', '🏆', '🐰', '🍼', '🥕', '🏠', '🥇', '🩺', '🌿', '✨', '📸'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewAlbumIcon(emoji)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center cursor-pointer border transition-all ${newAlbumIcon === emoji ? 'bg-amber-500/30 border-amber-400 scale-110' : 'bg-slate-950 border-white/10 hover:bg-slate-800'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  className="btn-interactive flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl border-none cursor-pointer shadow-lg shadow-amber-900/20"
                >
                  📁 Create Album
                </button>
                <button
                  type="button"
                  onClick={() => setShowAlbumModal(false)}
                  className="btn-interactive py-3 px-5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-white/10 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. FULLSCREEN LIGHTBOX PREVIEW MODAL */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-container p-6 border-2 border-indigo-500/40 rounded-3xl max-w-3xl w-full bg-slate-900 shadow-2xl relative flex flex-col gap-4 max-h-[95vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-400 font-mono tracking-wider">
                  📸 Herd Media Lightbox
                </span>
                <h3 className="text-xl font-black text-white">{selectedImage.rabbitName}</h3>
                <p className="text-xs text-slate-300 font-medium font-mono">
                  Tattoo: {selectedImage.rabbitTattoo} • Breed: {selectedImage.rabbitBreed}
                </p>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-600 text-white font-bold flex items-center justify-center cursor-pointer border-none"
              >
                ✕
              </button>
            </div>

            {/* Main Picture Frame */}
            <div className="rounded-2xl overflow-hidden bg-slate-950 border border-white/10 max-h-[460px] flex items-center justify-center shadow-inner">
              <img
                src={selectedImage.url}
                alt={selectedImage.rabbitName}
                className="max-h-[450px] w-full object-contain p-2"
              />
            </div>

            {/* Info Card */}
            <div className="p-4 bg-slate-950/80 rounded-2xl text-xs border border-white/5 flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-indigo-300">
                  Tag: {selectedImage.tag || selectedImage.type}
                </span>
                <span className="text-[10px] text-slate-400">📅 Log Date: {selectedImage.date}</span>
              </div>
              {selectedImage.notes && (
                <p className="text-slate-300 italic text-xs mt-0.5">"{selectedImage.notes}"</p>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                onClick={(e) => { handleSetAsPrimary(selectedImage, e); setSelectedImage(null); }}
                className="btn-interactive flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl border-none cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Star className="w-4 h-4" /> Set as Primary Profile Picture
              </button>

              <a
                href={selectedImage.url}
                download={`${selectedImage.rabbitName}_photo.png`}
                className="btn-interactive py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-white/10 cursor-pointer flex items-center gap-1.5 no-underline"
              >
                <Download className="w-4 h-4" /> Download
              </a>

              <button
                onClick={(e) => handleDeletePhoto(selectedImage, e)}
                className="btn-interactive py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl border-none cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
