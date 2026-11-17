// NEW FILE
// A "hook" any page can call to ask: who's signed in?
// Example: const { user, signOutUser } = useAuth()

import { useContext } from 'react'
import { AuthContext } from './AuthContext.js'

export function useAuth() {
  return useContext(AuthContext)
}
