// AuthService — Firebase Authentication wrapper
// Provides real auth (sign up, sign in, sign out, password reset) when Firebase is configured,
// falls back to local IndexedDB auth when offline or unconfigured.
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore, isFirebaseConfigured } from './firebase';
import CryptoJS from 'crypto-js';

/**
 * Register a new user with email and password.
 * Creates a Firebase Auth user + Firestore breeder profile.
 */
export async function registerUser({ email, password, name, rabbitryName, phone, zip, state, isYouth }) {
  if (!isFirebaseConfigured) {
    // Local-only fallback: hash password and store in IndexedDB
    const hashedPassword = CryptoJS.SHA256(password).toString();
    const userId = `ab-${Date.now()}`;
    return {
      id: userId,
      email,
      name,
      rabbitryName: rabbitryName || '',
      phone: phone || '',
      zip: zip || '',
      state: state || '',
      role: 'owner',
      status: 'active',
      isYouth: isYouth || false,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      _authSource: 'local'
    };
  }

  // Firebase Auth: create user with hashed password stored server-side
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  // Update display name
  await updateProfile(firebaseUser, { displayName: name });

  // Create Firestore breeder profile document
  const breederProfile = {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    name,
    rabbitryName: rabbitryName || '',
    phone: phone || '',
    zip: zip || '',
    state: state || '',
    role: 'owner',
    status: 'active',
    isYouth: isYouth || false,
    createdAt: new Date().toISOString(),
    _authSource: 'firebase'
  };

  await setDoc(doc(firestore, 'breeders', firebaseUser.uid), breederProfile);

  return breederProfile;
}

/**
 * Sign in an existing user.
 * Returns the breeder profile from Firestore.
 */
export async function loginUser(email, password) {
  if (!isFirebaseConfigured) {
    return { _authSource: 'local', email };
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  // Fetch full breeder profile from Firestore
  const profileDoc = await getDoc(doc(firestore, 'breeders', firebaseUser.uid));
  if (profileDoc.exists()) {
    return { ...profileDoc.data(), _authSource: 'firebase' };
  }

  // Profile doesn't exist yet in Firestore — create one
  const newProfile = {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    name: firebaseUser.displayName || email.split('@')[0],
    rabbitryName: '',
    phone: '',
    role: 'owner',
    status: 'active',
    createdAt: new Date().toISOString(),
    _authSource: 'firebase'
  };
  await setDoc(doc(firestore, 'breeders', firebaseUser.uid), newProfile);
  return newProfile;
}

/**
 * Sign out the current user.
 */
export async function logoutUser() {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
  // Clear local storage auth tokens
  localStorage.removeItem('rp_logged_in_email');
  localStorage.removeItem('rp_selected_context');
  localStorage.removeItem('rp_current_user');
  localStorage.removeItem('rp_auth_token');
}

/**
 * Send a password reset email.
 */
export async function resetPassword(email) {
  if (!isFirebaseConfigured) {
    throw new Error('Password reset requires Firebase to be configured. Contact the app administrator.');
  }
  await sendPasswordResetEmail(auth, email);
}

/**
 * Listen for auth state changes (login/logout).
 * Returns an unsubscribe function.
 */
export function onAuthChange(callback) {
  if (!isFirebaseConfigured) {
    // In local mode, check localStorage on mount
    const savedUser = localStorage.getItem('rp_current_user');
    if (savedUser) {
      try {
        callback(JSON.parse(savedUser));
      } catch {
        callback(null);
      }
    } else {
      callback(null);
    }
    return () => {}; // No-op unsubscribe
  }

  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const profileDoc = await getDoc(doc(firestore, 'breeders', firebaseUser.uid));
      if (profileDoc.exists()) {
        callback(profileDoc.data());
      } else {
        callback({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || '',
          _authSource: 'firebase'
        });
      }
    } else {
      callback(null);
    }
  });
}

/**
 * Get the current Firebase auth user (or null).
 */
export function getCurrentFirebaseUser() {
  if (!isFirebaseConfigured || !auth) return null;
  return auth.currentUser;
}
