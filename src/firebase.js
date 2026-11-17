// NEW FILE
// Connects the app to your Firebase project.
// The settings come from the .env file (names starting with VITE_).

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { SCHOOL_DOMAIN } from './config.js'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// A friendly warning in the browser console if .env is missing or not loaded.
if (!firebaseConfig.apiKey) {
  console.error(
    'Firebase settings are missing. Check that .env exists in the project folder, then stop and restart "npm run dev".',
  )
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// The Google sign-in pop-up.
// "hd" SUGGESTS school accounts in the account picker. It does NOT block other
// accounts. The real check is isAllowedUser() in config.js (and security rules later).
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  hd: SCHOOL_DOMAIN,
  prompt: 'select_account', // always show the account picker
})
