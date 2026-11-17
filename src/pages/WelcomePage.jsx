// NEW FILE
// What signed-out visitors see.

import { useAuth } from '../auth/useAuth.js'
import { SCHOOL_DOMAIN } from '../config.js'

function WelcomePage() {
  const { signIn, error } = useAuth()

  return (
    <div className="welcome">
      <div className="welcome-box">
        <h1>CHE LAP Generator</h1>
        <p>Practice games and stories for SIPPS groups.</p>

        <button type="button" className="button button-primary" onClick={signIn}>
          Sign in with Google
        </button>
        <p className="welcome-note">Use your @{SCHOOL_DOMAIN} account.</p>

        {/* Only shows when there's a message. role="alert" reads it aloud for screen readers. */}
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
      </div>
      <p className="welcome-footer">Created to align with the SIPPS® scope and sequence.</p>
    </div>
  )
}

export default WelcomePage
