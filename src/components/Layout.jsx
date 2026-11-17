// The Layout is the frame every page sits inside: nav bar on top, footer on the bottom.
// <Outlet /> is the spot where the current page appears.

import { NavLink, Outlet } from 'react-router'
import { useAuth } from '../auth/useAuth.js'
import { isAdminUser } from '../config.js' // NEW

// The nav links, in order. Adding a page to the nav later = adding one line here.
const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/games', label: 'Games' },
  { to: '/my-games', label: 'My Games' },
  { to: '/stories', label: 'Stories' },
  { to: '/about', label: 'About' },
]

function Layout() {
  const { user, signOutUser } = useAuth()
  // NEW: the admin also gets an Admin link
  const links = isAdminUser(user) ? [...navLinks, { to: '/admin', label: 'Admin' }] : navLinks

  return (
    <div className="layout">
      <header className="site-header">
        <NavLink to="/" className="site-title">
          CHE LAP Generator
        </NavLink>
        <nav className="site-nav" aria-label="Main">
          {links.map((link) => ( // NEW: "links" instead of "navLinks"
            // NavLink adds the "active" class to the link for the page you're on
            <NavLink key={link.to} to={link.to} end={link.to === '/'}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        {/* who's signed in + sign out */}
        <div className="user-box">
          <span className="user-email">{user.email}</span>
          <button type="button" className="button" onClick={signOutUser}>
            Sign out
          </button>
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>
          Created to align with the SIPPS® scope and sequence. Not made by or
          affiliated with the Center for the Collaborative Classroom.
        </p>
        <p>Please don&apos;t enter student names or personal details anywhere in this app.</p>
      </footer>
    </div>
  )
}

export default Layout
