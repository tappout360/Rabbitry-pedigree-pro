import React, { useState, useRef } from 'react';
import { 
  Camera, X, Upload, Check, Image as ImageIcon, Sparkles, Tag 
} from 'lucide-react';

export default function MobileQuickCameraModal({
  rabbits = [],
  onAttachPhoto,
  onClose,
  showToast
}) {
  const [selectedRabbitId, setSelectedRabbitId] = useState('');
  const [tag, setTag] = useState('Profile');
  const [imagePreview, setImagePreview] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);

  // Compress image to ~150KB JPEG using Client-side Canvas
  const processImageFile = (file) => {
    if (!file) return;
    setIsCompressing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize max dimension to 1000px
        const MAX_DIM = 1000;
        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to 80% JPEG
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
        setImagePreview(compressedBase64);
        setIsCompressing(false);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleSave = () => {
    if (!selectedRabbitId) {
      alert("Please select which rabbit this photo belongs to.");
      return;
    }
    if (!imagePreview) {
      alert("Please take or select a photo.");
      return;
    }

    const photoObj = {
      url: imagePreview,
      tag: tag || 'Profile',
      date: new Date().toISOString().split('T')[0]
    };

    if (onAttachPhoto) {
      onAttachPhoto(selectedRabbitId, photoObj);
    }

    const matched = rabbits.find(r => r.id === selectedRabbitId);
    if (showToast) {
      showToast(`Attached ${tag} photo to ${matched?.tattooNumber || matched?.name || 'rabbit'}!`, "success");
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in text-left">
      <div className="w-full max-w-md bg-slate-900 border-t-2 sm:border-2 border-pink-500/40 rounded-t-3xl sm:rounded-3xl p-6 flex flex-col gap-4 shadow-2xl safe-area-bottom max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-pink-500/20 text-pink-400 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Quick Hutch Camera Snap</h3>
              <p className="text-[10px] text-slate-400">Direct mobile capture with fast compression</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 border-none bg-transparent cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rabbit Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Assign to Rabbit / Cavy *</label>
          <select
            value={selectedRabbitId}
            onChange={(e) => setSelectedRabbitId(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
            required
          >
            <option value="">-- Choose Animal --</option>
            {rabbits
              .filter(r => r && r.status !== 'pedigree_only' && r.status !== 'sold')
              .map(r => (
                <option key={r.id} value={r.id}>
                  [{r.tattooNumber || 'NO-TAG'}] {r.name} - {r.breed}
                </option>
              ))}
          </select>
        </div>

        {/* Tag Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Photo Category</label>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            {['Profile', 'Body Type', 'Crown & Ears', 'Fur & Luster', 'Medical', 'Cage Card'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t)}
                className={`py-2 px-1 rounded-xl border-none font-bold transition-all cursor-pointer truncate ${
                  tag === t ? 'bg-pink-600 text-white shadow' : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Camera Trigger / Preview Box */}
        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden border-2 border-pink-500/40 bg-black aspect-video flex items-center justify-center">
              <img 
                src={imagePreview} 
                alt="Captured Rabbit" 
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 py-1.5 px-3 bg-black/70 hover:bg-black text-white text-[11px] font-bold rounded-xl border border-white/20 cursor-pointer"
              >
                Retake
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-10 bg-slate-950/80 hover:bg-slate-950 border-2 border-dashed border-pink-500/30 hover:border-pink-500/60 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all touch-target-large"
            >
              <div className="p-3 bg-pink-500/20 text-pink-400 rounded-2xl">
                <Camera className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold text-white">Tap to Open Device Camera</span>
              <span className="text-[10px] text-slate-400">Auto-compressed for instant offline storage</span>
            </button>
          )}

          {isCompressing && (
            <div className="text-center text-xs text-pink-400 animate-pulse font-bold">
              Compressing photo...
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!imagePreview || !selectedRabbitId}
            className="btn-interactive flex-1 py-3.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-40 disabled:pointer-events-none text-white font-black text-sm rounded-xl border-none shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 cursor-pointer touch-target-large"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Save to Rabbit Profile</span>
          </button>
        </div>

      </div>
    </div>
  );
}
