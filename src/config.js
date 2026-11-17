// App-wide settings in one place.

// Only accounts ending in this can use the app.
export const SCHOOL_DOMAIN = 'g.rentonschools.us'

// The admin can manage things other teachers can't (used in later stages).
export const ADMIN_EMAIL = 'anagasak@g.rentonschools.us'

// Returns true only for a verified school email.
export function isAllowedUser(user) {
  if (!user || !user.email) return false
  const email = user.email.toLowerCase()
  return user.emailVerified === true && email.endsWith('@' + SCHOOL_DOMAIN)
}

// NEW: true only for the admin. The security rules check this too.
export function isAdminUser(user) {
  return isAllowedUser(user) && user.email.toLowerCase() === ADMIN_EMAIL
}

// NEW: the three SIPPS levels, in order. "id" is the Firestore document name.
export const LEVELS = [
  { id: 'beginning', name: 'Beginning' },
  { id: 'extension', name: 'Extension' },
  { id: 'challenge', name: 'Challenge' },
]
