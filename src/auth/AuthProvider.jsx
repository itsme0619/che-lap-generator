// NEW FILE
// Keeps track of who's signed in and shares it with the whole app.

import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../firebase.js'
import { isAllowedUser, SCHOOL_DOMAIN } from '../config.js'
import { AuthContext } from './AuthContext.js'

export function AuthProvider({ children }) {
  // State: values that, when they change, make React redraw the screen.
  const [user, setUser] = useState(null) // the signed-in teacher, or null
  const [loading, setLoading] = useState(true) // true until Firebase has checked
  const [error, setError] = useState('') // message to show on the Welcome page

  // useEffect runs once when the app starts. It sets up a "listener":
  // Firebase calls this function every time someone signs in or out.
  useEffect(() => {
    const stopListening = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !isAllowedUser(firebaseUser)) {
        // Signed in, but not a verified school account: sign them right back out.
        setError(
          `Please sign in with your @${SCHOOL_DOMAIN} school account. ` +
            `(${firebaseUser.email} can't be used.)`,
        )
        await signOut(auth)
        return // the listener runs again with no user, which finishes the job
      }
      setUser(firebaseUser) // a school account, or null when signed out
      setLoading(false)
    })
    // Clean-up: stop listening if this ever goes away.
    return stopListening
  }, [])

  // async/await: signing in takes a moment, so we "await" the pop-up's answer.
  async function signIn() {
    setError('')
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') return // they closed it; no message
      if (err.code === 'auth/popup-blocked') {
        setError('Your browser blocked the sign-in pop-up. Allow pop-ups for this site and try again.')
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This web address isn’t on Firebase’s list of allowed domains yet (Authentication → Settings → Authorized domains).')
      } else {
        setError('Sign-in didn’t work. Please try again.')
      }
      console.error(err)
    }
  }

  async function signOutUser() {
    setError('')
    await signOut(auth)
  }

  const value = { user, loading, error, signIn, signOutUser }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
