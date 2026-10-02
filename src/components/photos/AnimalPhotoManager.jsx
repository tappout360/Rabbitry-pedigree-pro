import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Image as ImageIcon, Star, Trash2, CheckCircle, Clock, 
  Upload, Tag, Edit3, X, RefreshCw, ZoomIn, Download, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { photoService } from '../../services/PhotoManagementService';
import { isCloudPhoto } from '../../services/StorageService';

const PHOTO_TAGS = [
  'Profile',
  'Left Ear Tattoo',
  'Right Ear Tattoo',
  'Show Pose',
  'Undercolor',
  'Teeth / Bite',
  'Junior / Baby Kit',
  'Health / Injury',
  'Litter / Nest Box',
  'Sire / Dam Reference'
];

export default function AnimalPhotoManager({
  rabbit,
  onPhotoUpdated,
  currentUser,
  showToast,
  onClose,
  isBarnMode = false
}) {
  const [photos, setPhotos] = useState(() => {
    if (!rabbit?.photos) return [];
    return rabbit.photos.map(p => typeof p === 'string' ? { id: p, url: p, tag: 'Profile', isPrimary: true } : p);
  });

  const [activePhoto, setActivePhoto] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState('');
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  // New photo staging modal
  const [stagingPhoto, setStagingPhoto] = useState(null);
  const [stagedTag, setStagedTag] = useState('Profile');
  const [stagedCaption, setStagedCaption] = useState('');
  const [stagedIsPrimary, setStagedIsPrimary] = useState(false);

  // Caption editing modal for existing photo
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [editCaption, setEditCaption] = useState('');
  const [editTag, setEditTag] = useState('');

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Sync state with rabbit prop changes
  useEffect(() => {
    if (rabbit?.photos) {
      setPhotos(rabbit.photos.map(p => typeof p === 'string' ? { id: p, url: p, tag: 'Profile', isPrimary: true } : p));
    }
    checkPending();
  }, [rabbit]);

  const checkPending = async () => {
    const count = await photoService.getPendingCount();
    setPendingSyncCount(count);
  };

  // Subscribe to photo pipeline events
  useEffect(() => {
    const unsub = photoService.subscribe((event) => {
      if (event.rabbitId === rabbit?.id) {
        checkPending();
      }
    });
    return unsub;
  }, [rabbit?.id]);

  // Handle file selection from camera or file picker
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setCompressionProgress('Compressing photo on device...');

      // Run client-side compression
      const compressed = await photoService.compressImage(file, { maxWidth: 1280, maxHeight: 1280, quality: 0.8 });
      
      setStagingPhoto({
        file: compressed.blob,
        dataUrl: compressed.dataUrl,
        sizeBytes: compressed.sizeBytes,
        originalSizeBytes: compressed.originalSizeBytes,
        compressionRatio: compressed.compressionRatio.toFixed(0),
        width: compressed.width,
        height: compressed.height
      });
      setStagedTag(photos.length === 0 ? 'Profile' : 'Show Pose');
      setStagedIsPrimary(photos.length === 0);
      setStagedCaption('');
    } catch (err) {
      console.error('Photo compression error:', err);
      if (showToast) showToast('Could not process photo: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
      setCompressionProgress('');
      if (e.target) e.target.value = '';
    }
  };

  // Commit staged photo to database & cloud
  const handleSaveStagedPhoto = async () => {
    if (!stagingPhoto || !rabbit?.id) return;

    try {
      setIsProcessing(true);
      setCompressionProgress('Saving to local storage & queueing...');

      const result = await photoService.saveAnimalPhoto({
        rabbitId: rabbit.id,
        fileOrBlob: stagingPhoto.file,
        caption: stagedCaption,
        tag: stagedTag,
        isPrimary: stagedIsPrimary,
        breederId: currentUser?.id || 'breeder'
      });

      if (result.success) {
        const updatedRabbit = result.rabbit;
        if (updatedRabbit && onPhotoUpdated) {
          onPhotoUpdated(updatedRabbit);
        }
        setPhotos(updatedRabbit?.photos || []);
        setStagingPhoto(null);

        const statusMsg = result.isOffline 
          ? `Saved locally in Barn Mode! Will upload when online.` 
          : `Photo uploaded and synced successfully!`;
        if (showToast) showToast(statusMsg, result.isOffline ? 'info' : 'success');
      }
    } catch (err) {
      console.error('Failed to save photo:', err);
      if (showToast) showToast('Failed to save photo: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
      setCompressionProgress('');
      checkPending();
    }
  };

  // Set selected photo as primary
  const handleSetPrimary = async (photo) => {
    if (!rabbit?.id) return;
    try {
      setIsProcessing(true);
      await photoService.setPrimaryPhoto(rabbit.id, photo.id || photo.url);
      
      const updatedPhotos = photos.map(p => ({
        ...p,
        isPrimary: (p.id === photo.id || p.url === photo.url)
      }));
      setPhotos(updatedPhotos);

      if (onPhotoUpdated) {
        onPhotoUpdated({
          ...rabbit,
          photos: updatedPhotos,
          photo: photo.url,
          imageUrl: photo.url
        });
      }

      if (showToast) showToast('Primary pedigree photo updated! ⭐', 'success');
      if (activePhoto) {
        setActivePhoto(prev => prev ? { ...prev, isPrimary: true } : null);
      }
    } catch (err) {
      console.error('Failed to set primary photo:', err);
      if (showToast) showToast('Error setting primary photo', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete photo
  const handleDeletePhoto = async (photo) => {
    if (!rabbit?.id) return;
    if (!window.confirm('Are you sure you want to delete this photo from this animal?')) return;

    try {
      setIsProcessing(true);
      await photoService.deleteAnimalPhoto(rabbit.id, photo.id || photo.url);

      const remaining = photos.filter(p => (p.id || p.url) !== (photo.id || photo.url));
      setPhotos(remaining);

      if (onPhotoUpdated) {
        onPhotoUpdated({
          ...rabbit,
          photos: remaining,
          photo: remaining.length > 0 ? (remaining.find(p => p.isPrimary)?.url || remaining[0].url) : ''
        });
      }

      if (activePhoto && (activePhoto.id || activePhoto.url) === (photo.id || photo.url)) {
        setActivePhoto(null);
      }

      if (showToast) showToast('Photo deleted', 'info');
    } catch (err) {
      console.error('Failed to delete photo:', err);
      if (showToast) showToast('Failed to delete photo', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Save edited caption/tag
  const handleSaveMeta = async () => {
    if (!editingPhoto || !rabbit?.id) return;
    try {
      await photoService.updatePhotoMeta(rabbit.id, editingPhoto.id || editingPhoto.url, {
        caption: editCaption,
        tag: editTag
      });

      const updated = photos.map(p => {
        if ((p.id || p.url) === (editingPhoto.id || editingPhoto.url)) {
          return { ...p, caption: editCaption, tag: editTag };
        }
        return p;
      });
      setPhotos(updated);

      if (onPhotoUpdated) {
        onPhotoUpdated({ ...rabbit, photos: updated });
      }

      if (activePhoto && (activePhoto.id || activePhoto.url) === (editingPhoto.id || editingPhoto.url)) {
        setActivePhoto(prev => prev ? { ...prev, caption: editCaption, tag: editTag } : null);
      }

      setEditingPhoto(null);
      if (showToast) showToast('Photo details updated', 'success');
    } catch (err) {
      console.error('Failed to update photo meta:', err);
      if (showToast) showToast('Error updating details', 'error');
    }
  };

  // Trigger manual sync
  const handleSyncPending = async () => {
    setIsProcessing(true);
    setCompressionProgress('Syncing offline photos to cloud...');
    try {
      const res = await photoService.syncPendingPhotos();
      if (showToast) {
        showToast(`Sync complete: ${res.synced} uploaded, ${res.failed} pending.`, 'info');
      }
      checkPending();
    } catch (err) {
      if (showToast) showToast('Sync failed: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
      setCompressionProgress('');
    }
  };

  const primaryPhoto = photos.find(p => p.isPrimary) || photos[0];

  return (
    <div className={`flex flex-col gap-5 text-left ${isBarnMode ? 'font-mono' : ''}`}>
      
      {/* Hidden File Inputs for Native Camera & Device Gallery */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Control Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-pink-500/20 text-pink-400 rounded-xl border border-pink-500/30">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">
              {rabbit?.name || 'Animal'} ({rabbit?.tattooNumber || 'No Tattoo'})
            </h4>
            <p className="text-[11px] text-slate-400">
              {photos.length} Photo{photos.length === 1 ? '' : 's'} &bull; {rabbit?.breed || 'Breed'}
            </p>
          </div>
        </div>

        {/* Action Buttons with Barn Touch Target (>44px) */}
        <div className="flex items-center gap-2">
          {pendingSyncCount > 0 && (
            <button
              type="button"
              onClick={handleSyncPending}
              disabled={isProcessing}
              className="min-h-[44px] px-3.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
              title="Sync pending photos to cloud"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Sync ({pendingSyncCount})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={isProcessing}
            className="min-h-[44px] px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-pink-600/30 cursor-pointer transition-all active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Camera</span>
          </button>

          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            disabled={isProcessing}
            className="min-h-[44px] px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Gallery</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress banner during compression or upload */}
      {isProcessing && (
        <div className="p-3 bg-indigo-950/80 border border-indigo-500/40 rounded-xl flex items-center gap-3 text-xs text-indigo-200 animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
          <span className="font-bold">{compressionProgress || 'Processing...'}</span>
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 ? (
        <div className="p-10 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center gap-4 bg-slate-900/40">
          <div className="p-4 bg-pink-500/10 rounded-full text-pink-400">
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <h5 className="text-sm font-bold text-white">No Photos Attached Yet</h5>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Snap a profile pose, ear tattoo verification, or show photo. Photos work completely offline in the barn.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="py-2.5 px-4 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Camera className="w-4 h-4" /> Take First Photo
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Primary Photo Spotlight Card */}
          {primaryPhoto && (
            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-slate-950 shadow-xl group">
              <div className="h-64 sm:h-72 w-full bg-slate-950 flex items-center justify-center overflow-hidden relative">
                <img
                  src={primaryPhoto.url || primaryPhoto.thumbnailUrl}
                  alt={rabbit?.name || 'Primary Rabbit Photo'}
                  className="w-full h-full object-cover sm:object-contain transition-transform group-hover:scale-105 duration-300"
                />

                {/* Badge: Primary Pedigree Photo */}
                <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg">
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Primary Pedigree Photo</span>
                </div>

                {/* Badge: Sync Status */}
                <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 text-slate-200">
                  {primaryPhoto.syncStatus === 'synced' || isCloudPhoto(primaryPhoto.url) ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Cloud Synced</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span className="text-amber-300">Saved on Device</span>
                    </>
                  )}
                </div>

                {/* Bottom Overlay Info & Action */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-4 flex items-end justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-bold text-slate-200 uppercase tracking-wider">
                      {primaryPhoto.tag || 'Profile'}
                    </span>
                    {primaryPhoto.caption && (
                      <p className="text-xs text-white mt-1 line-clamp-1">{primaryPhoto.caption}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePhoto(primaryPhoto)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/10 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                  >
                    <ZoomIn className="w-4 h-4" /> Inspect
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Multi-Photo Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">Gallery ({photos.length})</span>
              <span>Tap photo to preview or set as primary</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.map((photo, idx) => {
                const photoKey = photo.id || photo.url || idx;
                const isPrim = photo.isPrimary;
                const isSynced = photo.syncStatus === 'synced' || isCloudPhoto(photo.url);

                return (
                  <div
                    key={photoKey}
                    onClick={() => setActivePhoto(photo)}
                    className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-square bg-slate-950 group ${
                      isPrim ? 'border-amber-500 shadow-md shadow-amber-500/20' : 'border-white/10 hover:border-indigo-400/50'
                    }`}
                  >
                    <img
                      src={photo.thumbnailUrl || photo.url}
                      alt={photo.tag || 'Rabbit photo'}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />

                    {/* Tag badge */}
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm border border-white/10 text-[9px] font-bold text-white uppercase tracking-wider">
                      {photo.tag || 'Photo'}
                    </div>

                    {/* Primary Star or Sync status icon */}
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                      {isPrim && (
                        <div className="p-1 rounded-md bg-amber-500 text-slate-950">
                          <Star className="w-3 h-3 fill-slate-950" />
                        </div>
                      )}
                      {!isSynced && (
                        <div className="p-1 rounded-md bg-amber-500/80 text-white" title="Saved locally (pending upload)">
                          <Clock className="w-3 h-3 animate-pulse" />
                        </div>
                      )}
                    </div>

                    {/* Caption preview on hover / touch */}
                    {photo.caption && (
                      <div className="absolute bottom-0 inset-x-0 p-1.5 bg-slate-950/80 text-[10px] text-slate-200 truncate">
                        {photo.caption}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: NEW PHOTO STAGING (Tagging, Caption, Set Primary)   */}
      {/* ------------------------------------------------------------- */}
      {stagingPhoto && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in text-left">
          <div className="w-full max-w-lg bg-slate-900 border-t-2 sm:border-2 border-pink-500/50 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-pink-500/20 text-pink-400 rounded-xl">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-base">Attach Photo to {rabbit?.name || 'Animal'}</h4>
                  <p className="text-[11px] text-slate-400">
                    Compressed: {((stagingPhoto.sizeBytes || 0) / 1024).toFixed(0)} KB ({stagingPhoto.compressionRatio}% saved)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStagingPhoto(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Image */}
            <div className="h-48 sm:h-56 bg-slate-950 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center relative">
              <img
                src={stagingPhoto.dataUrl}
                alt="Captured"
                className="w-full h-full object-contain"
              />
              <span className="absolute bottom-2 right-2 text-[10px] bg-slate-900/80 px-2 py-0.5 rounded text-slate-300 font-mono">
                {stagingPhoto.width} &times; {stagingPhoto.height}
              </span>
            </div>

            {/* Tag Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-pink-400" /> Photo Category / Tag
              </label>
              <select
                value={stagedTag}
                onChange={(e) => setStagedTag(e.target.value)}
                className="bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-pink-500 min-h-[44px]"
              >
                {PHOTO_TAGS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Caption Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300">Caption / Barn Note (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 5-month junior coat prime, Best 6-Class win at Ohio State"
                value={stagedCaption}
                onChange={(e) => setStagedCaption(e.target.value)}
                className="bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-pink-500 min-h-[44px]"
              />
            </div>

            {/* Set as Primary Checkbox */}
            <label className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl border border-white/10 cursor-pointer min-h-[48px]">
              <input
                type="checkbox"
                checked={stagedIsPrimary}
                onChange={(e) => setStagedIsPrimary(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Set as Primary Pedigree Photo
                </span>
                <p className="text-[10px] text-slate-400">
                  Featured on official 3-generation pedigrees, show cage cards, and herd lists.
                </p>
              </div>
            </label>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStagingPhoto(null)}
                className="flex-1 min-h-[48px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStagedPhoto}
                disabled={isProcessing}
                className="flex-1 min-h-[48px] rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 cursor-pointer"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                <span>Save Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: FULLSCREEN PHOTO LIGHTBOX / INSPECTOR                */}
      {/* ------------------------------------------------------------- */}
      {activePhoto && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-2 sm:p-4 bg-slate-950/95 backdrop-blur-md animate-fade-in text-left">
          <div className="w-full max-w-3xl bg-slate-900 border border-white/20 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[95vh] overflow-y-auto">
            
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold uppercase">
                  {activePhoto.tag || 'Profile'}
                </span>
                {activePhoto.isPrimary && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-300" /> Primary
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  {activePhoto.createdAt ? new Date(activePhoto.createdAt).toLocaleDateString() : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-res Image Preview */}
            <div className="max-h-[60vh] bg-slate-950 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
              <img
                src={activePhoto.url}
                alt={activePhoto.caption || 'Animal photo preview'}
                className="w-full h-auto max-h-[58vh] object-contain"
              />
            </div>

            {/* Caption */}
            {activePhoto.caption && (
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-xs text-slate-300 italic">
                "{activePhoto.caption}"
              </div>
            )}

            {/* Lightbox Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                {!activePhoto.isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(activePhoto)}
                    className="min-h-[44px] px-3.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Star className="w-4 h-4 fill-amber-300" /> Set as Primary
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => {
                    setEditingPhoto(activePhoto);
                    setEditCaption(activePhoto.caption || '');
                    setEditTag(activePhoto.tag || 'Profile');
                  }}
                  className="min-h-[44px] px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" /> Edit Details
                </button>

                <a
                  href={activePhoto.url}
                  download={`${rabbit?.tattooNumber || 'rabbit'}_${activePhoto.tag || 'photo'}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-[44px] px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold flex items-center gap-1.5 cursor-pointer inline-flex items-center"
                >
                  <Download className="w-4 h-4" /> Save File
                </a>
              </div>

              <button
                type="button"
                onClick={() => handleDeletePhoto(activePhoto)}
                className="min-h-[44px] px-3.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: EDIT PHOTO DETAILS (Caption & Tag)                   */}
      {/* ------------------------------------------------------------- */}
      {editingPhoto && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in text-left">
          <div className="w-full max-w-md bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-bold text-white text-sm">Edit Photo Tag & Caption</h4>
              <button
                type="button"
                onClick={() => setEditingPhoto(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300">Tag</label>
              <select
                value={editTag}
                onChange={(e) => setEditTag(e.target.value)}
                className="bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
              >
                {PHOTO_TAGS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300">Caption / Notes</label>
              <textarea
                rows={3}
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                placeholder="Enter photo notes..."
                className="bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingPhoto(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMeta}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
