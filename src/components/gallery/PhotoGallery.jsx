import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Camera, Search, Trash, Grid, Calendar, Image as ImageIcon, Sparkles, Sliders } from 'lucide-react';
import { db } from '../../db/registryDb';

export default function PhotoGallery({ rabbits = [], onUpdateRabbit }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [filterBreed, setFilterBreed] = useState('');
  const containerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(12); // Lazy loading paging chunk

  // New detailed upload & comparison states
  const [uploadRabbitId, setUploadRabbitId] = useState('');
  const [uploadTag, setUploadTag] = useState('Profile');
  const [uploadNotes, setUploadNotes] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [comparisonRabbitId, setComparisonRabbitId] = useState('');

  // Extract all photos from all rabbits, including their timelines
  const allPhotos = useMemo(() => {
    const photos = [];
    rabbits.forEach(rabbit => {
      // Main photos array
      if (rabbit.photos && rabbit.photos.length > 0) {
        rabbit.photos.forEach((url, idx) => {
          photos.push({
            id: `${rabbit.id}-photo-${idx}`,
            rabbitId: rabbit.id,
            rabbitName: rabbit.name,
            rabbitTattoo: rabbit.tattooNumber,
            rabbitBreed: rabbit.breed,
            url: url,
            date: rabbit.dob || 'Unknown',
            type: 'Primary Photo',
            notes: 'Primary display picture.'
          });
        });
      }
      
      // Timeline photos
      if (rabbit.timeline && rabbit.timeline.length > 0) {
        rabbit.timeline.forEach(entry => {
          if (entry.photo && !rabbit.photos?.includes(entry.photo)) {
            photos.push({
              id: entry.id,
              rabbitId: rabbit.id,
              rabbitName: rabbit.name,
              rabbitTattoo: rabbit.tattooNumber,
              rabbitBreed: rabbit.breed,
              url: entry.photo,
              date: entry.date,
              type: 'Timeline Event',
              notes: entry.notes || 'Hutch check log.'
            });
          }
        });
      }
    });
    
    // Sort latest photos first
    return photos.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [rabbits]);

  // Filter photos
  const filteredPhotos = useMemo(() => {
    return allPhotos.filter(photo => {
      const matchSearch = 
        photo.rabbitName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.rabbitTattoo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.notes.toLowerCase().includes(searchQuery.toLowerCase());
      const matchBreed = filterBreed === '' || photo.rabbitBreed === filterBreed;
      return matchSearch && matchBreed;
    });
  }, [allPhotos, searchQuery, filterBreed]);

  // Extract list of unique breeds for filtering
  const uniqueBreeds = useMemo(() => {
    const breeds = new Set();
    allPhotos.forEach(p => {
      if (p.rabbitBreed) breeds.add(p.rabbitBreed);
    });
    return Array.from(breeds);
  }, [allPhotos]);

  const comparisonTimeline = useMemo(() => {
    if (!comparisonRabbitId) return [];
    const rabbit = rabbits.find(r => r.id === comparisonRabbitId);
    if (!rabbit) return [];

    const items = [];
    if (rabbit.photos) {
      rabbit.photos.forEach((photo, idx) => {
        const pObj = typeof photo === 'string' ? { url: photo, tag: 'Profile', notes: 'Display Photo', date: rabbit.dob || 'Unknown' } : photo;
        items.push({
          url: pObj.url,
          tag: pObj.tag || 'Profile',
          notes: pObj.notes || 'Display Photo',
          date: pObj.date || rabbit.dob || 'Unknown',
          weight: rabbit.weightOz ? `${(rabbit.weightOz / 16).toFixed(2)} lbs` : null,
          label: `Photo #${idx + 1}`
        });
      });
    }
    if (rabbit.timeline) {
      rabbit.timeline.forEach(entry => {
        if (entry.photo) {
          items.push({
            url: entry.photo,
            tag: 'Timeline Event',
            notes: entry.notes || 'Hutch Check Log',
            date: entry.date,
            weight: entry.weightOz ? `${(entry.weightOz / 16).toFixed(2)} lbs` : null,
            label: entry.title || 'Timeline Log'
          });
        }
      });
    }
    return items.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [rabbits, comparisonRabbitId]);

  // Implement scroll-based lazy loading (simplifies virtualization)
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        // Near bottom, load more
        setVisibleCount(prev => Math.min(prev + 12, filteredPhotos.length));
      }
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) container.removeEventListener('scroll', handleScroll);
    };
  }, [filteredPhotos]);

  // Handle new photo capture & compression to WebP (0.7 quality)
  const handleUploadPhoto = (e, rabbitId) => {
    const file = e.target.files[0];
    if (!file) return;

    const photoId = `photo-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        // 1. Generate full-size image (max width 800px, 0.7 WebP)
        const fullCanvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let w = img.width;
        let h = img.height;
        if (w > MAX_WIDTH) {
          h = Math.round((h * MAX_WIDTH) / w);
          w = MAX_WIDTH;
        }
        fullCanvas.width = w;
        fullCanvas.height = h;
        const fullCtx = fullCanvas.getContext('2d');
        fullCtx.drawImage(img, 0, 0, w, h);
        const fullWebp = fullCanvas.toDataURL('image/webp', 0.7);

        // 2. Generate thumbnail image (max width 150px, 0.6 WebP)
        const thumbCanvas = document.createElement('canvas');
        const THUMB_WIDTH = 150;
        let tw = img.width;
        let th = img.height;
        if (tw > THUMB_WIDTH) {
          th = Math.round((th * THUMB_WIDTH) / tw);
          tw = THUMB_WIDTH;
        }
        thumbCanvas.width = tw;
        thumbCanvas.height = th;
        const thumbCtx = thumbCanvas.getContext('2d');
        thumbCtx.drawImage(img, 0, 0, tw, th);
        const thumbWebp = thumbCanvas.toDataURL('image/webp', 0.6);

        // 3. Save thumbnail locally in Dexie for fast card list rendering
        try {
          await db.photoThumbnails.put({
            id: photoId,
            rabbitId: rabbitId,
            date: new Date().toISOString().split('T')[0],
            data: thumbWebp
          });
        } catch (dbErr) {
          console.error("Failed to save local thumbnail:", dbErr);
        }

        // 4. Handle sync and offline upload routing
        let finalPhotoUrl = thumbWebp; // fallback to thumbnail locally if upload fails / offline

        if (navigator.onLine) {
          try {
            const API_ROOT = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';
            const token = localStorage.getItem('rp_auth_token');
            const uploadRes = await fetch(`${API_ROOT}/photos/upload`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                photoId,
                base64Data: fullWebp
              })
            });
            const uploadData = await uploadRes.json();
            if (uploadData.success && uploadData.url) {
              finalPhotoUrl = uploadData.url; // Use real static serve URL from Node server
            } else if (uploadData.error) {
              alert(uploadData.error);
              return;
            }
          } catch (uploadErr) {
            console.warn("Upload failed, queueing offline:", uploadErr);
            // Queue offline
            await db.offlinePhotos.put({
              id: photoId,
              rabbitId: rabbitId,
              base64Data: fullWebp,
              status: 'pending'
            });
          }
        } else {
          // Offline queueing
          await db.offlinePhotos.put({
            id: photoId,
            rabbitId: rabbitId,
            base64Data: fullWebp,
            status: 'pending'
          });
        }

        // 5. Save final photo reference link to rabbit profile
        const rabbit = rabbits.find(r => r.id === rabbitId);
        if (rabbit) {
          const updatedPhotos = [finalPhotoUrl, ...(rabbit.photos || [])];
          const updatedRabbit = { ...rabbit, photos: updatedPhotos };
          onUpdateRabbit(updatedRabbit);
        }
      };
      img.src = img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Handle detailed uploads (with tags/notes/custom rabbit selection)
  const handleUploadPhotoWithDetails = (e) => {
    const targetRabbitId = uploadRabbitId;
    if (!targetRabbitId) {
      alert("Please select a rabbit first.");
      return;
    }
    const file = e.target.files[0];
    if (!file) return;

    const photoId = `photo-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        // 1. Generate full-size image (max width 800px, 0.7 WebP)
        const fullCanvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let w = img.width;
        let h = img.height;
        if (w > MAX_WIDTH) {
          h = Math.round((h * MAX_WIDTH) / w);
          w = MAX_WIDTH;
        }
        fullCanvas.width = w;
        fullCanvas.height = h;
        const fullCtx = fullCanvas.getContext('2d');
        fullCtx.drawImage(img, 0, 0, w, h);
        const fullWebp = fullCanvas.toDataURL('image/webp', 0.7);

        // 2. Generate thumbnail image (max width 150px, 0.6 WebP)
        const thumbCanvas = document.createElement('canvas');
        const THUMB_WIDTH = 150;
        let tw = img.width;
        let th = img.height;
        if (tw > THUMB_WIDTH) {
          th = Math.round((th * THUMB_WIDTH) / tw);
          tw = THUMB_WIDTH;
        }
        thumbCanvas.width = tw;
        thumbCanvas.height = th;
        const thumbCtx = thumbCanvas.getContext('2d');
        thumbCtx.drawImage(img, 0, 0, tw, th);
        const thumbWebp = thumbCanvas.toDataURL('image/webp', 0.6);

        // 3. Save thumbnail locally in Dexie
        try {
          await db.photoThumbnails.put({
            id: photoId,
            rabbitId: targetRabbitId,
            date: new Date().toISOString().split('T')[0],
            data: thumbWebp
          });
        } catch (dbErr) {
          console.error("Failed to save local thumbnail:", dbErr);
        }

        // 4. Handle sync and offline routing
        let finalPhotoUrl = thumbWebp;

        if (navigator.onLine) {
          try {
            const API_ROOT = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';
            const token = localStorage.getItem('rp_auth_token');
            const uploadRes = await fetch(`${API_ROOT}/photos/upload`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                photoId,
                base64Data: fullWebp
              })
            });
            const uploadData = await uploadRes.json();
            if (uploadData.success && uploadData.url) {
              finalPhotoUrl = uploadData.url;
            } else if (uploadData.error) {
              alert(uploadData.error);
              return;
            }
          } catch (uploadErr) {
            console.warn("Upload failed, queueing offline:", uploadErr);
            await db.offlinePhotos.put({
              id: photoId,
              rabbitId: targetRabbitId,
              base64Data: fullWebp,
              status: 'pending'
            });
          }
        } else {
          await db.offlinePhotos.put({
            id: photoId,
            rabbitId: targetRabbitId,
            base64Data: fullWebp,
            status: 'pending'
          });
        }

        // 5. Save photo details as object inside rabbit.photos
        const rabbit = rabbits.find(r => r.id === targetRabbitId);
        if (rabbit) {
          const newPhotoObj = {
            url: finalPhotoUrl,
            tag: uploadTag,
            notes: uploadNotes || 'Gallery photo log',
            date: new Date().toISOString().split('T')[0]
          };
          const updatedPhotos = [newPhotoObj, ...(rabbit.photos || [])];
          const updatedRabbit = { ...rabbit, photos: updatedPhotos };
          onUpdateRabbit(updatedRabbit);
          
          // Reset form
          setUploadRabbitId('');
          setUploadNotes('');
          setShowUploadForm(false);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = (photo) => {
    const rabbit = rabbits.find(r => r.id === photo.rabbitId);
    if (!rabbit) return;

    // Filter out from photos array
    const updatedPhotos = (rabbit.photos || []).filter(p => p !== photo.url);
    // Filter out from timeline
    const updatedTimeline = (rabbit.timeline || []).filter(t => t.photo !== photo.url);

    const updatedRabbit = { 
      ...rabbit, 
      photos: updatedPhotos,
      timeline: updatedTimeline
    };
    onUpdateRabbit(updatedRabbit);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Search and Filters Bar */}
      <div className="glass-container p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-indigo-400" /> Virtualized Photo Gallery
          </h2>
          <p className="text-xs text-slate-300">Browse all compressed WebP pictures across your entire herd inventory.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
          {/* Search bar */}
          <div className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2 text-xs flex-1 md:flex-none">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search rabbit name, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-slate-100 focus:outline-none w-full md:w-48"
            />
          </div>

          {/* Breed Filter */}
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

          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="py-2 px-3 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border-none"
          >
            <Camera className="w-4 h-4" /> Upload / Take Photo
          </button>
          
          <select
            value={comparisonRabbitId}
            onChange={(e) => setComparisonRabbitId(e.target.value)}
            className="bg-slate-900 border border-white/10 text-white text-xs rounded-xl py-2 px-3 focus:outline-none"
          >
            <option value="">📈 Compare Growth...</option>
            {rabbits.map(r => (
              <option key={r.id} value={r.id}>{r.name} ({r.tattooNumber || 'No Tattoo'})</option>
            ))}
          </select>
        </div>
      </div>
 
      {/* Detailed Upload Form Panel */}
      {showUploadForm && (
        <div className="glass-container p-6 border border-indigo-500/20 flex flex-col gap-4 animate-fade-in text-slate-100">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Add New Photo to Rabbitry Log</h3>
            <button onClick={() => setShowUploadForm(false)} className="text-slate-400 hover:text-white border-none bg-transparent cursor-pointer font-bold">Close</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Select Rabbit *</label>
              <select
                value={uploadRabbitId}
                onChange={(e) => setUploadRabbitId(e.target.value)}
                className="bg-slate-900 border border-white/10 text-white text-xs rounded-xl py-2 px-3 focus:outline-none"
              >
                <option value="">-- Choose Rabbit --</option>
                {rabbits.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.tattooNumber || 'No Tattoo'})</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Photo Tag</label>
              <select
                value={uploadTag}
                onChange={(e) => setUploadTag(e.target.value)}
                className="bg-slate-900 border border-white/10 text-white text-xs rounded-xl py-2 px-3 focus:outline-none"
              >
                <option value="Profile">Profile (Main Face)</option>
                <option value="Front">Front Angle</option>
                <option value="Back">Back Angle</option>
                <option value="Pedigree">Pedigree Proof</option>
                <option value="General">General / Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Photo Notes / Log details</label>
              <input
                type="text"
                placeholder="E.g., Showing prime fur condition at 4 months old."
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-slate-900 border-white/10 rounded-xl text-white focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-2">
            {/* Standard file picker */}
            <label className="btn-interactive text-xs py-2 px-4 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl cursor-pointer flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Choose File
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUploadPhotoWithDetails(e)}
              />
            </label>
            {/* Direct Mobile Camera Capture */}
            <label className="btn-interactive text-xs py-2 px-4 bg-emerald-600 hover:bg-emerald-750 text-white font-bold rounded-xl cursor-pointer flex items-center gap-2">
              <Camera className="w-4 h-4" /> Take Camera Photo
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleUploadPhotoWithDetails(e)}
              />
            </label>
          </div>
        </div>
      )}

      {/* Growth Timeline Comparison */}
      {comparisonRabbitId && (
        <div className="glass-container p-6 border border-emerald-500/20 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                📈 Growth & Timeline Comparison
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Visualize weights, dates, and physical changes side-by-side.</p>
            </div>
            <button onClick={() => setComparisonRabbitId('')} className="text-slate-400 hover:text-white border-none bg-transparent cursor-pointer font-bold">Close</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {comparisonTimeline.length === 0 ? (
              <span className="text-xs text-slate-400 py-6 text-center w-full">No pictures logged on this rabbit's timeline yet.</span>
            ) : (
              comparisonTimeline.map((item, idx) => (
                <div key={idx} className="flex-shrink-0 w-44 bg-slate-950 p-2.5 rounded-2xl border border-white/5 flex flex-col gap-2">
                  <div className="h-28 overflow-hidden rounded-xl bg-slate-900 border border-white/5">
                    <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-[10px] text-left flex flex-col gap-0.5">
                    <span className="font-bold text-indigo-400 block truncate">{item.label}</span>
                    <span className="text-[9px] text-slate-400">Date: {item.date}</span>
                    {item.weight && <span className="text-[9px] text-emerald-400 font-bold">Weight: {item.weight}</span>}
                    <p className="text-[9px] text-slate-300 italic truncate mt-0.5" title={item.notes}>"{item.notes}"</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Grid View */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto pr-1 max-h-[600px] min-h-[300px]"
      >
        {filteredPhotos.length === 0 ? (
          <div className="glass-container p-12 text-center text-slate-400">
            No pictures found. Try adding photos to your rabbits or logging growth timelines.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredPhotos.slice(0, visibleCount).map((photo, idx) => (
              <div 
                key={photo.id}
                className="group glass-container p-2 flex flex-col gap-2 relative hover:border-indigo-500/50 transition-all cursor-pointer"
              >
                {/* Photo Image Card */}
                <div 
                  onClick={() => setSelectedImage(photo)}
                  className="relative overflow-hidden rounded-xl h-40 bg-slate-950/80"
                >
                  <img
                    src={photo.url}
                    alt={photo.rabbitName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 bg-slate-950/70 border border-white/10 text-[9px] font-bold py-0.5 px-2 rounded-full text-indigo-300">
                    {photo.type}
                  </div>
                </div>

                {/* Info and delete option */}
                <div className="flex justify-between items-start mt-1 text-[11px] px-1">
                  <div className="flex flex-col text-left">
                    <strong className="text-white font-bold truncate max-w-[120px]">{photo.rabbitName}</strong>
                    <span className="text-[10px] text-slate-400">Tat: {photo.rabbitTattoo}</span>
                  </div>
                  <button
                    onClick={() => handleDeletePhoto(photo)}
                    className="text-slate-400 hover:text-red-400 p-1 rounded-lg hover:bg-white/5 border-none bg-transparent transition-all cursor-pointer"
                    title="Delete photo"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox / Fullscreen Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border-2 border-indigo-500/30 rounded-3xl p-6 flex flex-col gap-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full border-none text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col gap-1 items-start text-left">
              <h3 className="font-extrabold text-base text-indigo-400">
                📸 {selectedImage.rabbitName} Photo Log
              </h3>
              <p className="text-xs text-slate-400">Tattoo: {selectedImage.rabbitTattoo} | Breed: {selectedImage.rabbitBreed}</p>
            </div>

            <img
              src={selectedImage.url}
              alt={selectedImage.rabbitName}
              className="w-full max-h-[450px] object-contain rounded-2xl border border-white/5 bg-slate-950 shadow"
            />

            <div className="p-4 bg-slate-950/60 rounded-2xl text-xs text-left text-slate-300">
              <span className="font-bold text-slate-400 block mb-0.5">Event Log Details:</span>
              <p className="italic">"{selectedImage.notes}"</p>
              <span className="text-[10px] text-slate-500 block mt-2">Log Date: {selectedImage.date}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
