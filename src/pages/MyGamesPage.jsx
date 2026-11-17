// Your saved games, and games other CHE staff have shared. // NEW: this whole page is rebuilt

import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../auth/useAuth.js'
import { findGame } from '../games/gameList.js'
import '../games/games.css' // the tabs share the game page's styles
import {
  listMyGames,
  listSharedGames,
  updateSavedGame,
  deleteSavedGame,
  MAX_SAVED_GAMES,
} from '../data/savedGames.js'

function formatDate(timestamp) {
  return timestamp?.toDate ? timestamp.toDate().toLocaleDateString() : ''
}

function MyGamesPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('mine') // 'mine' or 'shared'
  const [games, setGames] = useState(null) // null = still loading
  const [error, setError] = useState('')
  const [renamingId, setRenamingId] = useState(null)
  const [newName, setNewName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [refresh, setRefresh] = useState(0) // bump to read the list again

  // Read the list whenever the tab changes or after a change.
  useEffect(() => {
    let stillHere = true
    const load = tab === 'mine' ? listMyGames(user.uid) : listSharedGames(user.uid)
    load
      .then((list) => {
        if (stillHere) {
          setGames(list)
          setError('')
        }
      })
      .catch((err) => {
        console.error(err)
        if (stillHere) setError('Couldn’t load games. Try refreshing the page.')
      })
    return () => {
      stillHere = false
    }
  }, [tab, user.uid, refresh])

  function switchTab(next) {
    setGames(null)
    setTab(next)
  }

  // Runs a change, then re-reads the list. Shows a message if it fails.
  async function change(action) {
    try {
      await action()
      setRefresh((n) => n + 1)
    } catch (err) {
      console.error(err)
      setError('That didn’t work. Please try again.')
    }
  }

  function saveRename(game) {
    const name = newName.trim().slice(0, 100)
    setRenamingId(null)
    if (name && name !== game.name) change(() => updateSavedGame(game.id, { name }))
  }

  return (
    <section>
      <h1>My Games</h1>

      <div className="level-tabs" role="tablist" aria-label="Which games">
        <button type="button" role="tab" aria-selected={tab === 'mine' ? 'true' : 'false'} className={`level-tab${tab === 'mine' ? ' is-active' : ''}`} onClick={() => switchTab('mine')}>
          My saved games
        </button>
        <button type="button" role="tab" aria-selected={tab === 'shared' ? 'true' : 'false'} className={`level-tab${tab === 'shared' ? ' is-active' : ''}`} onClick={() => switchTab('shared')}>
          Shared by others
        </button>
      </div>

      {error && <p className="error-message" role="alert">{error}</p>}
      {games === null && !error && <p className="placeholder">Loading…</p>}

      {games && games.length === 0 && (
        <p className="placeholder">
          {tab === 'mine'
            ? 'No saved games yet. Make a game, then click Save.'
            : 'Nobody has shared a game yet.'}
        </p>
      )}

      {games && games.length > 0 && (
        <>
          {tab === 'mine' && (
            <p className="small-note">
              {games.length} of {MAX_SAVED_GAMES} saved games.
            </p>
          )}
          <ul className="saved-list">
            {games.map((g) => {
              const gameInfo = findGame(g.gameType)
              return (
                <li key={g.id} className="saved-row">
                  <div className="saved-main">
                    {renamingId === g.id ? (
                      <form
                        className="rename-form"
                        onSubmit={(e) => {
                          e.preventDefault()
                          saveRename(g)
                        }}
                      >
                        <input value={newName} maxLength={100} onChange={(e) => setNewName(e.target.value)} aria-label="New name" autoFocus />
                        <button type="submit" className="button">Save name</button>
                        <button type="button" className="button" onClick={() => setRenamingId(null)}>Cancel</button>
                      </form>
                    ) : (
                      <Link to={`/games/${g.gameType}?saved=${g.id}`} className="saved-name">
                        {g.name}
                      </Link>
                    )}
                    <span className="saved-details">
                      {gameInfo?.name} · {g.subtitle} · {formatDate(g.updatedAt)}
                      {tab === 'shared' && ` · shared by ${g.ownerEmail}`}
                    </span>
                  </div>

                  {tab === 'mine' && (
                    <div className="saved-actions">
                      <label className="checkbox-line">
                        <input
                          type="checkbox"
                          checked={!!g.shared}
                          onChange={(e) => change(() => updateSavedGame(g.id, { shared: e.target.checked }))}
                        />
                        Shared
                      </label>
                      <button
                        type="button"
                        className="button"
                        onClick={() => {
                          setRenamingId(g.id)
                          setNewName(g.name)
                        }}
                      >
                        Rename
                      </button>
                      {confirmDeleteId === g.id ? (
                        <span className="confirm-delete">
                          Delete for good?{' '}
                          <button
                            type="button"
                            className="button button-danger"
                            onClick={() => {
                              setConfirmDeleteId(null)
                              change(() => deleteSavedGame(g.id))
                            }}
                          >
                            Delete
                          </button>{' '}
                          <button type="button" className="button" onClick={() => setConfirmDeleteId(null)}>
                            Keep
                          </button>
                        </span>
                      ) : (
                        <button type="button" className="button" onClick={() => setConfirmDeleteId(g.id)}>
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}

export default MyGamesPage
