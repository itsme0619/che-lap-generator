// App.jsx is the "map" of the app: it says which page shows for each web address.

import { Routes, Route } from 'react-router'
import { useAuth } from './auth/useAuth.js'
import { isAdminUser } from './config.js'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import GamesPage from './pages/GamesPage.jsx'
import MyGamesPage from './pages/MyGamesPage.jsx'
import StoriesPage from './pages/StoriesPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import WelcomePage from './pages/WelcomePage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import GamePage from './pages/GamePage.jsx' // NEW

function App() {
  const { user, loading } = useAuth()

  // while Firebase checks whether someone is already signed in
  if (loading) {
    return <p className="loading">Loading…</p>
  }

  // signed out = only the Welcome page, whatever address they typed
  if (!user) {
    return <WelcomePage />
  }

  return (
    <Routes>
      {/* Every page inside here is shown inside the Layout (nav bar + footer) */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/games" element={<GamesPage />} />
        {/* NEW: ":gameId" matches any game, like /games/bingo */}
        <Route path="/games/:gameId" element={<GamePage />} />
        <Route path="/my-games" element={<MyGamesPage />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/about" element={<AboutPage />} />
        {/* the Admin page only exists for the admin. Others get "Page not found." */}
        {isAdminUser(user) && <Route path="/admin" element={<AdminPage />} />}
        {/* "*" means "any address we don't recognize" */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
