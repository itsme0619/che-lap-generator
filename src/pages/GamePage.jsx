// NEW FILE
// One page for every game: /games/roll-and-read, /games/bingo, ...
// Step 1: choose the level, lessons and words.  Step 2: play (or print).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react' // NEW: useCallback, useEffect, useRef
import { Link, useParams, useSearchParams } from 'react-router' // NEW: useSearchParams
import { LEVELS } from '../config.js'
import { useAuth } from '../auth/useAuth.js' // NEW
import { getSavedGame, createSavedGame, updateSavedGame } from '../data/savedGames.js' // NEW
import SaveGameDialog from '../components/SaveGameDialog.jsx' // NEW
import { useLevel } from '../data/useLevel.js'
import { buildWordPool } from '../data/wordPool.js'
import { findGame } from '../games/gameList.js'
import LessonPicker from '../components/LessonPicker.jsx'
import WordListEditor from '../components/WordListEditor.jsx'
import RollAndRead from '../games/RollAndRead.jsx'
import Bingo from '../games/Bingo.jsx'
import TicTacToe from '../games/TicTacToe.jsx'
import UpsAndDowns from '../games/UpsAndDowns.jsx'
import WordQuizBoard from '../games/WordQuizBoard.jsx'
import NotFoundPage from './NotFoundPage.jsx'
import '../games/games.css'

// Which component plays which game.
const GAME_COMPONENTS = {
  'roll-and-read': RollAndRead,
  bingo: Bingo,
  'tic-tac-toe': TicTacToe,
  'ups-and-downs': UpsAndDowns,
  'word-quiz-board': WordQuizBoard,
}

function GamePage() {
  const { gameId } = useParams() // the part of the address after /games/
  const game = findGame(gameId)
  const { user } = useAuth() // NEW
  // NEW: "?saved=abc123" at the end of the address means "open this saved game"
  const [searchParams, setSearchParams] = useSearchParams()
  const savedId = searchParams.get('saved')

  const [levelId, setLevelId] = useState('beginning')
  const [selection, setSelection] = useState({}) // { lessonId: [optionIds] }
  const [list, setList] = useState('A') // Challenge List A/B/C
  const [syllableMode, setSyllableMode] = useState('words') // Challenge: words or syllables only
  const [addedWords, setAddedWords] = useState([])
  const [removed, setRemoved] = useState([]) // words the teacher took out
  const [playing, setPlaying] = useState(false)
  const [round, setRound] = useState(0) // goes up each time "Make game" is clicked

  // NEW: saving and opening saved games
  const [savedGame, setSavedGame] = useState(null) // { id, ownerUid, name, shared } of the open saved game
  const [startState, setStartState] = useState(null) // the saved board to start from
  const [frozenWords, setFrozenWords] = useState(null) // a saved game's exact word list
  const [savedLoadError, setSavedLoadError] = useState('')
  const [showSave, setShowSave] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const gameState = useRef(null) // the game's latest board, reported by the game itself

  // NEW: useCallback keeps this the same function between redraws,
  // so games don't think something changed every time the page redraws.
  const handleStateChange = useCallback((state) => {
    gameState.current = state
  }, [])

  const { level, loading, error } = useLevel(levelId)

  // The finished word list. useMemo only rebuilds it when something it uses changes.
  const words = useMemo(() => {
    const fromLessons = level ? buildWordPool(level, selection, { list, syllableMode }) : []
    const seen = new Set(fromLessons.map((w) => w.text.toLowerCase()))
    const added = addedWords
      .filter((w) => !seen.has(w.toLowerCase()))
      .map((w) => ({ text: w, group: 'Added words' }))
    return [...fromLessons, ...added].filter((w) => !removed.includes(w.text))
  }, [level, selection, list, syllableMode, addedWords, removed])

  // A short description for the printed page, like "Extension · Lessons 5, 6".
  const subtitle = useMemo(() => {
    const levelName = LEVELS.find((l) => l.id === levelId)?.name
    if (!level) return levelName
    const labels = level.items
      .filter((item) => item.type === 'lesson' && selection[item.id])
      .map((item) => item.label)
    if (labels.length === 0) return `${levelName} · your words`
    const shown = labels.length > 6 ? `${labels[0]}–${labels[labels.length - 1]}` : labels.join(', ')
    const listNote = levelId === 'challenge' ? ` · List ${list}` : ''
    return `${levelName} · Lesson${labels.length > 1 ? 's' : ''} ${shown}${listNote}`
  }, [level, levelId, selection, list])

  // NEW: open a saved game when the address has ?saved=...
  useEffect(() => {
    if (!savedId || savedGame?.id === savedId) return
    let stillHere = true
    getSavedGame(savedId)
      .then((saved) => {
        if (!stillHere) return
        if (!saved) {
          setSavedLoadError('That saved game wasn’t found. It may have been deleted or unshared.')
          return
        }
        setLevelId(saved.levelId || 'beginning')
        setSelection(saved.selection || {})
        setList(saved.list || 'A')
        setSyllableMode(saved.syllableMode || 'words')
        setAddedWords(saved.addedWords || [])
        setRemoved(saved.removed || [])
        setFrozenWords(saved.words || [])
        setStartState(saved.state || null)
        setSavedGame({ id: saved.id, ownerUid: saved.ownerUid, ownerEmail: saved.ownerEmail, name: saved.name, shared: !!saved.shared })
        setRound((r) => r + 1)
        setPlaying(true)
      })
      .catch((err) => {
        console.error(err)
        if (stillHere) setSavedLoadError('Couldn’t open that saved game.')
      })
    return () => {
      stillHere = false
    }
  }, [savedId, savedGame])

  if (!game) return <NotFoundPage />

  const isOwner = savedGame && savedGame.ownerUid === user.uid // NEW
  const gameWords = frozenWords ?? words // NEW: a saved game keeps its own word list

  // NEW
  async function handleSave({ name, shared, asCopy }) {
    setSaving(true)
    setSaveMessage('')
    const data = {
      name,
      shared,
      gameType: game.id,
      subtitle,
      levelId,
      selection,
      list,
      syllableMode,
      addedWords,
      removed,
      words: gameWords,
      state: gameState.current ?? null,
    }
    try {
      if (isOwner && !asCopy) {
        await updateSavedGame(savedGame.id, { ...data, ownerUid: user.uid, ownerEmail: user.email })
        setSavedGame({ ...savedGame, name, shared })
        setSaveMessage(`Saved “${name}.”`)
      } else {
        const id = await createSavedGame(user, data)
        setSavedGame({ id, ownerUid: user.uid, ownerEmail: user.email, name, shared })
        setSearchParams({ saved: id }, { replace: true })
        setSaveMessage(`Saved “${name}” to My Games.`)
      }
      setShowSave(false)
    } catch (err) {
      console.error(err)
      setSaveMessage(err.message?.startsWith('You have') ? err.message : 'Saving didn’t work. Please try again.')
    }
    setSaving(false)
  }

  function changeLevel(id) {
    setLevelId(id)
    setSelection({}) // lessons belong to one level, so start fresh
  }

  function makeGame() {
    setStartState(null) // NEW: a fresh board, not the saved one
    setFrozenWords(null) // NEW: use the words chosen above
    setSaveMessage('') // NEW
    setRound((r) => r + 1)
    setPlaying(true)
    window.scrollTo(0, 0)
  }

  const GameComponent = GAME_COMPONENTS[game.id]

  if (playing) {
    return (
      <section className="game-page">
        <div className="game-toolbar no-print">
          <button
            type="button"
            className="button"
            onClick={() => {
              setPlaying(false)
              setFrozenWords(null) // NEW: back to the live word list
            }}
          >
            ← Change words
          </button>
          <h1>{game.name}</h1>
          <span className="game-subtitle">
            {savedGame ? `${savedGame.name}${isOwner ? '' : ` · shared by ${savedGame.ownerEmail}`}` : subtitle} {/* NEW */}
          </span>
          {/* NEW: Save (or save a copy of someone else's shared game) */}
          <button type="button" className="button" onClick={() => setShowSave(true)}>
            {savedGame && !isOwner ? 'Save a copy' : 'Save'}
          </button>
          {game.printable && (
            <button type="button" className="button button-primary" onClick={() => window.print()}>
              Print
            </button>
          )}
        </div>
        {saveMessage && <p className="status-message no-print" role="status">{saveMessage}</p>} {/* NEW */}
        {/* key={round} starts the game fresh each time "Make game" is clicked */}
        <GameComponent
          key={round}
          words={gameWords}
          title={game.name}
          subtitle={subtitle}
          initialState={startState} // NEW
          onStateChange={handleStateChange} // NEW
        />
        {/* NEW */}
        {showSave && (
          <SaveGameDialog
            defaultName={(savedGame ? (isOwner ? savedGame.name : `${savedGame.name} (copy)`) : `${game.name} · ${subtitle}`).slice(0, 100)}
            defaultShared={savedGame && isOwner ? savedGame.shared : false}
            canOverwrite={!!isOwner}
            saving={saving}
            onSave={handleSave}
            onClose={() => setShowSave(false)}
          />
        )}
      </section>
    )
  }

  return (
    <section className="game-page">
      <p className="no-print">
        <Link to="/games">← All games</Link>
      </p>
      <h1>{game.name}</h1>
      <p>{game.about}</p>

      <div className="level-tabs" role="tablist" aria-label="SIPPS level">
        {LEVELS.map((l) => (
          <button
            key={l.id}
            type="button"
            role="tab"
            aria-selected={levelId === l.id ? 'true' : 'false'}
            className={`level-tab${levelId === l.id ? ' is-active' : ''}`}
            onClick={() => changeLevel(l.id)}
          >
            {l.name}
          </button>
        ))}
      </div>

      {levelId === 'challenge' && (
        <div className="challenge-options">
          <span>List:</span>
          {['A', 'B', 'C'].map((x) => (
            <label key={x}>
              <input type="radio" name="list" checked={list === x} onChange={() => setList(x)} /> {x}
            </label>
          ))}
          <span className="divider" />
          <span>On the board:</span>
          <label>
            <input type="radio" name="mode" checked={syllableMode === 'words'} onChange={() => setSyllableMode('words')} /> Words
          </label>
          <label>
            <input type="radio" name="mode" checked={syllableMode === 'syllables'} onChange={() => setSyllableMode('syllables')} /> Syllables only
          </label>
        </div>
      )}

      {savedLoadError && <p className="error-message" role="alert">{savedLoadError}</p>} {/* NEW */}
      {loading && <p className="placeholder">Loading lessons…</p>}
      {error && <p className="error-message" role="alert">{error}</p>}
      {level && (
        <LessonPicker levelId={levelId} level={level} selection={selection} onChange={setSelection} list={list} />
      )}

      <WordListEditor
        words={words}
        removedCount={removed.length}
        onRemove={(text) => setRemoved([...removed, text])}
        onRestoreRemoved={() => setRemoved([])}
        onAdd={(newWords) => {
          setAddedWords([...addedWords, ...newWords])
          setRemoved(removed.filter((r) => !newWords.includes(r)))
        }}
      />

      <div className="make-game-bar">
        <button type="button" className="button button-primary" onClick={makeGame} disabled={words.length === 0}>
          Make game
        </button>
        {words.length > 0 && words.length < 6 && (
          <span className="small-note">Short list: words will repeat on the board.</span>
        )}
      </div>
    </section>
  )
}

export default GamePage
