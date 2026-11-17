// NEW FILE
// Creates the "context": a shared box that holds who's signed in.
// AuthProvider.jsx fills the box; useAuth.js lets any page look inside it.

import { createContext } from 'react'

export const AuthContext = createContext(null)
