/**
 * PhotoManagementService.js
 * Production-grade Rabbitry & Cavy Photo Management Pipeline
 * 
 * Features:
 * - Client-side high-efficiency Canvas compression (downsamples 4-12MB phone photos to ~100-150KB JPEG)
 * - 160x160 list/pedigree thumbnail generation (<15KB)
 * - Offline-first caching in IndexedDB (photoThumbnails & offlinePhotos)
 * - Automatic background upload queue with retry, resume, and non-blocking operation
 * - Primary pedigree photo designation, multi-photo tags (Profile, Ear Tattoo, Show Pose, Undercolor, etc.)
 * - Deterministic sync status tracking ('synced' vs 'pending')
 */

import { db } from '../db/registryDb';
import { uploadPhoto, deletePhoto as deleteCloudPhoto, isCloudPhoto } from './StorageService';
import { globalSyncAdapter } from '../adapters/sync/OfflineSyncAdapter';

export class PhotoManagementService {
  constructor() {
    this.listeners = new Set();
    this.isSyncing = false;

    // Auto-sync when device comes online
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.syncPendingPhotos().catch(err => {
          console.warn('[PhotoManagementService] Background sync on reconnect failed:', err);
        });
      });
    }
  }

  /**
   * Subscribe to photo pipeline updates (saves, deletes, sync completions)
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event) {
    this.listeners.forEach(cb => {
      try { cb(event); } catch (e) { console.error(e); }
    });
  }

  /**
   * Compress an image file or blob on a canvas preserving aspect ratio.
   * Resizes large multi-megapixel barn photos to max 1280px dimension at 0.8 quality.
   */
  async compressImage(fileOrBlob, options = {}) {
    const {
      maxWidth = 1280,
      maxHeight = 1280,
      quality = 0.8,
      mimeType = 'image/jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      const originalSizeBytes = fileOrBlob.size || 0;
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;

          // Scale dimensions preserving aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Failed to get 2D canvas context'));
          }

          // Crisp rendering smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Get compressed dataUrl
          const dataUrl = canvas.toDataURL(mimeType, quality);

          // Also get Blob for uploads
          canvas.toBlob((blob) => {
            const sizeBytes = blob ? blob.size : dataUrl.length;
            resolve({
              dataUrl,
              blob: blob || fileOrBlob,
              width,
              height,
              sizeBytes,
              originalSizeBytes,
              compressionRatio: originalSizeBytes > 0 ? (1 - sizeBytes / originalSizeBytes) * 100 : 0
            });
          }, mimeType, quality);
        };

        img.onerror = () => reject(new Error('Could not load image into element'));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(fileOrBlob);
    });
  }

  /**
   * Generate a 160x160 centered square thumbnail for fast herd grid rendering and pedigree cards.
   */
  async generateThumbnail(fileOrBlob, options = {}) {
    const { size = 160, quality = 0.75, mimeType = 'image/jpeg' } = options;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;

          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('No canvas context'));

          // Center crop calculations
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'medium';
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

          const dataUrl = canvas.toDataURL(mimeType, quality);
          resolve({
            dataUrl,
            width: size,
            height: size,
            sizeBytes: Math.round((dataUrl.length * 3) / 4)
          });
        };
        img.onerror = () => reject(new Error('Could not load image for thumbnail'));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error('Failed to read image for thumbnail'));
      reader.readAsDataURL(fileOrBlob);
    });
  }

  /**
   * Save an animal photo:
   * 1. Compresses image client-side (~120KB)
   * 2. Generates square thumbnail (~15KB)
   * 3. Stores thumbnail in IndexedDB photoThumbnails
   * 4. Attempts cloud upload if online; if offline or fails, saves to IndexedDB offlinePhotos & enqueues sync
   * 5. Updates rabbit profile in IndexedDB and returns updated record
   */
  async saveAnimalPhoto({
    rabbitId,
    fileOrBlob,
    caption = '',
    tag = 'Profile',
    isPrimary = false,
    breederId = 'breeder'
  }) {
    if (!rabbitId) throw new Error('rabbitId is required to save an animal photo');
    if (!fileOrBlob) throw new Error('A photo file or blob is required');

    // 1. Client-side compression
    const compressed = await this.compressImage(fileOrBlob, { maxWidth: 1280, maxHeight: 1280, quality: 0.8 });
    const thumbnail = await this.generateThumbnail(fileOrBlob, { size: 160 });

    const photoId = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    // 2. Persist local thumbnail for instant fast loading
    try {
      if (db.photoThumbnails) {
        await db.photoThumbnails.put({
          id: photoId,
          rabbitId,
          date: nowIso,
          dataUrl: thumbnail.dataUrl
        });
      }
    } catch (err) {
      console.warn('[PhotoManagementService] Failed to cache thumbnail in Dexie:', err);
    }

    // 3. Check connectivity & perform cloud upload or offline queue
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    let finalUrl = compressed.dataUrl;
    let isCloud = false;

    if (isOnline) {
      try {
        const cloudUrl = await uploadPhoto(compressed.blob, breederId, rabbitId, `${photoId}.jpg`);
        if (cloudUrl && isCloudPhoto(cloudUrl)) {
          finalUrl = cloudUrl;
          isCloud = true;
        }
      } catch (uploadErr) {
        console.warn('[PhotoManagementService] Online upload attempt failed, falling back to offline queue:', uploadErr);
      }
    }

    // If still local/pending, save to Dexie offlinePhotos and enqueue sync
    if (!isCloud) {
      try {
        if (db.offlinePhotos) {
          await db.offlinePhotos.put({
            id: photoId,
            rabbitId,
            breederId,
            status: 'pending',
            dataUrl: compressed.dataUrl,
            caption,
            tag,
            isPrimary,
            createdAt: nowIso,
            attempts: 0
          });
        }
        globalSyncAdapter.enqueue('PHOTO_UPLOAD', 'offlinePhotos', { photoId, rabbitId });
      } catch (offlineErr) {
        console.error('[PhotoManagementService] Failed to enqueue offline photo:', offlineErr);
      }
    }

    // 4. Construct photo object
    const photoObj = {
      id: photoId,
      url: finalUrl,
      thumbnailUrl: thumbnail.dataUrl,
      caption: caption || '',
      tag: tag || 'Profile',
      isPrimary: !!isPrimary,
      syncStatus: isCloud ? 'synced' : 'pending',
      width: compressed.width,
      height: compressed.height,
      sizeBytes: compressed.sizeBytes,
      createdAt: nowIso
    };

    // 5. Update rabbit profile in IndexedDB
    let updatedRabbit = null;
    try {
      const existingRabbit = await db.rabbits.get(rabbitId);
      if (existingRabbit) {
        let photos = Array.isArray(existingRabbit.photos) ? [...existingRabbit.photos] : [];

        // If marked primary or if this is the first photo, set isPrimary = true
        if (isPrimary || photos.length === 0) {
          photos = photos.map(p => typeof p === 'object' ? { ...p, isPrimary: false } : { url: p, isPrimary: false });
          photoObj.isPrimary = true;
          photos.unshift(photoObj);
        } else {
          photos.push(photoObj);
        }

        updatedRabbit = {
          ...existingRabbit,
          photos,
          photo: photoObj.isPrimary ? photoObj.url : (existingRabbit.photo || photoObj.url),
          imageUrl: photoObj.isPrimary ? photoObj.url : (existingRabbit.imageUrl || photoObj.url),
          updatedAt: nowIso
        };

        await db.rabbits.put(updatedRabbit);
      }
    } catch (dbErr) {
      console.error('[PhotoManagementService] Failed to update rabbit with photo in Dexie:', dbErr);
    }

    this.notifyListeners({
      type: 'PHOTO_SAVED',
      rabbitId,
      photo: photoObj,
      isOffline: !isCloud
    });

    return {
      success: true,
      photo: photoObj,
      rabbit: updatedRabbit,
      isOffline: !isCloud
    };
  }

  /**
   * Drain offline photo queue when connection is restored.
   */
  async syncPendingPhotos() {
    if (this.isSyncing) return;
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (!isOnline) return;

    if (!db.offlinePhotos) return;

    try {
      this.isSyncing = true;
      const pendingItems = await db.offlinePhotos.where('status').equals('pending').toArray();
      if (pendingItems.length === 0) {
        this.isSyncing = false;
        return { synced: 0, failed: 0 };
      }

      console.log(`[PhotoManagementService] Starting upload sync for ${pendingItems.length} offline photos...`);
      let synced = 0;
      let failed = 0;

      for (const item of pendingItems) {
        try {
          // Convert dataUrl to blob if needed
          let uploadPayload = item.dataUrl;
          if (item.dataUrl && item.dataUrl.startsWith('data:')) {
            const res = await fetch(item.dataUrl);
            uploadPayload = await res.blob();
          }

          const cloudUrl = await uploadPhoto(uploadPayload, item.breederId || 'breeder', item.rabbitId, `${item.id}.jpg`);

          if (cloudUrl && isCloudPhoto(cloudUrl)) {
            // Update rabbit in DB
            const rabbit = await db.rabbits.get(item.rabbitId);
            if (rabbit && Array.isArray(rabbit.photos)) {
              const updatedPhotos = rabbit.photos.map(p => {
                const pid = typeof p === 'object' ? p.id : null;
                if (pid === item.id) {
                  return { ...p, url: cloudUrl, syncStatus: 'synced' };
                }
                return p;
              });

              const isPrimary = item.isPrimary;
              await db.rabbits.update(item.rabbitId, {
                photos: updatedPhotos,
                ...(isPrimary ? { photo: cloudUrl, imageUrl: cloudUrl } : {})
              });
            }

            // Remove from offline queue
            await db.offlinePhotos.delete(item.id);
            synced += 1;
            console.log(`[PhotoManagementService] Successfully synced photo ${item.id} for rabbit ${item.rabbitId}`);
          } else {
            failed += 1;
          }
        } catch (itemErr) {
          console.warn(`[PhotoManagementService] Failed to sync photo ${item.id}:`, itemErr);
          await db.offlinePhotos.update(item.id, {
            attempts: (item.attempts || 0) + 1,
            lastError: itemErr.message
          });
          failed += 1;
        }
      }

      this.notifyListeners({
        type: 'SYNC_COMPLETE',
        synced,
        failed
      });

      return { synced, failed };
    } catch (queueErr) {
      console.error('[PhotoManagementService] Sync queue error:', queueErr);
      return { synced: 0, failed: 1 };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Set a specific photo as the primary pedigree photo for an animal.
   */
  async setPrimaryPhoto(rabbitId, photoId) {
    if (!rabbitId || !photoId) return;

    try {
      const rabbit = await db.rabbits.get(rabbitId);
      if (!rabbit || !Array.isArray(rabbit.photos)) return;

      let selectedPhoto = null;
      const updatedPhotos = [];

      // Find selected photo and mark it primary, mark others false
      rabbit.photos.forEach(p => {
        const obj = typeof p === 'string' ? { id: p, url: p } : { ...p };
        if (obj.id === photoId || obj.url === photoId) {
          obj.isPrimary = true;
          selectedPhoto = obj;
        } else {
          obj.isPrimary = false;
        }
        updatedPhotos.push(obj);
      });

      // Move selected primary photo to front of list
      if (selectedPhoto) {
        const filtered = updatedPhotos.filter(p => p !== selectedPhoto);
        const reordered = [selectedPhoto, ...filtered];

        await db.rabbits.update(rabbitId, {
          photos: reordered,
          photo: selectedPhoto.url,
          imageUrl: selectedPhoto.url,
          updatedAt: new Date().toISOString()
        });

        // Enqueue offline sync
        globalSyncAdapter.enqueue('UPDATE', 'rabbits', { id: rabbitId, photo: selectedPhoto.url });

        this.notifyListeners({
          type: 'PRIMARY_PHOTO_SET',
          rabbitId,
          photoId,
          primaryUrl: selectedPhoto.url
        });

        return { success: true, primaryPhoto: selectedPhoto };
      }
    } catch (err) {
      console.error('[PhotoManagementService] Failed to set primary photo:', err);
      throw err;
    }
  }

  /**
   * Update photo caption and tag metadata.
   */
  async updatePhotoMeta(rabbitId, photoId, { caption, tag }) {
    try {
      const rabbit = await db.rabbits.get(rabbitId);
      if (!rabbit || !Array.isArray(rabbit.photos)) return;

      const updatedPhotos = rabbit.photos.map(p => {
        const obj = typeof p === 'string' ? { id: p, url: p } : { ...p };
        if (obj.id === photoId || obj.url === photoId) {
          if (caption !== undefined) obj.caption = caption;
          if (tag !== undefined) obj.tag = tag;
        }
        return obj;
      });

      await db.rabbits.update(rabbitId, { photos: updatedPhotos, updatedAt: new Date().toISOString() });
      globalSyncAdapter.enqueue('UPDATE', 'rabbits', { id: rabbitId, photos: updatedPhotos });

      this.notifyListeners({ type: 'PHOTO_META_UPDATED', rabbitId, photoId });
      return { success: true };
    } catch (err) {
      console.error('[PhotoManagementService] Failed to update photo metadata:', err);
      throw err;
    }
  }

  /**
   * Delete an animal photo from rabbit, thumbnails, and cloud storage.
   */
  async deleteAnimalPhoto(rabbitId, photoId) {
    try {
      const rabbit = await db.rabbits.get(rabbitId);
      if (!rabbit || !Array.isArray(rabbit.photos)) return;

      let photoToDelete = null;
      const updatedPhotos = [];

      rabbit.photos.forEach(p => {
        const obj = typeof p === 'string' ? { id: p, url: p } : { ...p };
        if (obj.id === photoId || obj.url === photoId) {
          photoToDelete = obj;
        } else {
          updatedPhotos.push(obj);
        }
      });

      // If we deleted the primary photo, assign new primary if photos remain
      let newPrimaryUrl = '';
      if (photoToDelete?.isPrimary && updatedPhotos.length > 0) {
        updatedPhotos[0].isPrimary = true;
        newPrimaryUrl = updatedPhotos[0].url;
      } else if (updatedPhotos.length > 0) {
        newPrimaryUrl = rabbit.photo;
      }

      await db.rabbits.update(rabbitId, {
        photos: updatedPhotos,
        photo: newPrimaryUrl,
        imageUrl: newPrimaryUrl,
        updatedAt: new Date().toISOString()
      });

      // Remove from photoThumbnails & offlinePhotos
      if (db.photoThumbnails) await db.photoThumbnails.delete(photoId);
      if (db.offlinePhotos) await db.offlinePhotos.delete(photoId);

      // If cloud photo, delete from Firebase Storage
      if (photoToDelete?.url && isCloudPhoto(photoToDelete.url)) {
        await deleteCloudPhoto(photoToDelete.url);
      }

      globalSyncAdapter.enqueue('UPDATE', 'rabbits', { id: rabbitId, photos: updatedPhotos });

      this.notifyListeners({
        type: 'PHOTO_DELETED',
        rabbitId,
        photoId
      });

      return { success: true };
    } catch (err) {
      console.error('[PhotoManagementService] Failed to delete photo:', err);
      throw err;
    }
  }

  /**
   * Get pending offline photo uploads count
   */
  async getPendingCount() {
    try {
      if (!db.offlinePhotos) return 0;
      return await db.offlinePhotos.where('status').equals('pending').count();
    } catch {
      return 0;
    }
  }
}

export const photoService = new PhotoManagementService();
