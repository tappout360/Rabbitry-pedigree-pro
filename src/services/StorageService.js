// StorageService — Firebase Storage wrapper for photo/image uploads
// Replaces base64-in-IndexedDB with cloud CDN-hosted images.
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './firebase';

/**
 * Upload a photo file to Firebase Storage.
 * Returns the public download URL.
 * 
 * @param {File|Blob} file - The image file to upload
 * @param {string} breederId - The breeder's user ID
 * @param {string} rabbitId - The rabbit's ID
 * @param {string} filename - Optional filename override
 * @returns {Promise<string>} The public download URL
 */
export async function uploadPhoto(file, breederId, rabbitId, filename) {
  if (!isFirebaseConfigured || !storage) {
    // Local fallback: convert to base64 data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const safeName = filename || `${Date.now()}_${file.name || 'photo.jpg'}`;
  const storagePath = `breeders/${breederId}/rabbits/${rabbitId}/${safeName}`;
  const storageRef = ref(storage, storagePath);

  // Upload the file
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type || 'image/jpeg',
    customMetadata: {
      breederId,
      rabbitId,
      uploadedAt: new Date().toISOString()
    }
  });

  // Get the public download URL
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

/**
 * Upload a base64 data URL to Firebase Storage.
 * Useful for migrating existing base64 photos to cloud storage.
 * 
 * @param {string} base64DataUrl - The base64 data URL (e.g., "data:image/jpeg;base64,...")
 * @param {string} breederId - The breeder's user ID
 * @param {string} rabbitId - The rabbit's ID
 * @returns {Promise<string>} The public download URL
 */
export async function uploadBase64Photo(base64DataUrl, breederId, rabbitId) {
  if (!isFirebaseConfigured || !storage) {
    return base64DataUrl; // Return as-is in local mode
  }

  // Don't re-upload if it's already a cloud URL
  if (base64DataUrl.startsWith('http')) {
    return base64DataUrl;
  }

  // Convert base64 to blob
  const response = await fetch(base64DataUrl);
  const blob = await response.blob();

  return uploadPhoto(blob, breederId, rabbitId, `migrated_${Date.now()}.jpg`);
}

/**
 * Delete a photo from Firebase Storage.
 * 
 * @param {string} photoUrl - The full storage URL to delete
 */
export async function deletePhoto(photoUrl) {
  if (!isFirebaseConfigured || !storage) return;

  // Only delete Firebase Storage URLs
  if (!photoUrl.includes('firebasestorage.googleapis.com') && !photoUrl.includes('firebasestorage.app')) {
    return;
  }

  try {
    const storageRef = ref(storage, photoUrl);
    await deleteObject(storageRef);
  } catch (err) {
    console.warn('[StorageService] Failed to delete photo:', err.message);
  }
}

/**
 * Check if a URL is a cloud-hosted photo (vs local base64).
 */
export function isCloudPhoto(url) {
  return url && (url.startsWith('http://') || url.startsWith('https://'));
}
