// NEW FILE
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
