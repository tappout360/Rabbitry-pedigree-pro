import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Camera, Search, Trash, Grid, Calendar, Image as ImageIcon, Sparkles, Sliders } from 'lucide-react';
import { db } from '../../db/registryDb';

export default function PhotoGallery({ rabbits = [], onUpdateRabbit }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [filterBreed, setFilterBreed] = useState('');
  const containerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(12); // Lazy loading paging chunk

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

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Optimal size for database storage
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to WebP with 0.7 quality
        const webpBase64 = canvas.toDataURL('image/webp', 0.7);

        // Save to rabbit instance
        const rabbit = rabbits.find(r => r.id === rabbitId);
        if (rabbit) {
          const updatedPhotos = [webpBase64, ...(rabbit.photos || [])];
          const updatedRabbit = { ...rabbit, photos: updatedPhotos };
          onUpdateRabbit(updatedRabbit);
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
        </div>
      </div>

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
