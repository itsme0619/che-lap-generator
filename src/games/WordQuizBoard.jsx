// NEW FILE
// Word Quiz Board (on screen only): categories across the top, point values down.
// Pick a square, the word shows big, the team that reads it gets the points.

import { useEffect, useState } from 'react' // NEW: useEffect
import { shuffle } from '../data/random.js'

const POINTS = [100, 200, 300, 400, 500]
const MAX_CATEGORIES = 6

// Categories come from the spelling-sounds. With only one or two, the words are split into sets.
function makeBoard(words) {
  const groups = []
  for (const w of words) {
    let g = groups.find((x) => x.name === w.group)
    if (!g) {
      g = { name: w.group, words: [] }
      groups.push(g)
    }
    g.words.push(w.text)
  }
  let categories = groups.slice(0, MAX_CATEGORIES)
  if (categories.length < 3 && words.length >= 9) {
    const all = shuffle(words.map((w) => w.text))
    const count = Math.min(MAX_CATEGORIES, Math.max(3, Math.ceil(all.length / POINTS.length)))
    categories = Array.from({ length: count }, (_, i) => ({ name: `Set ${i + 1}`, words: all.filter((_, j) => j % count === i) }))
  }
  return categories.map((c) => ({
    name: c.name,
    cells: shuffle(c.words)
      .slice(0, POINTS.length)
      .map((word, i) => ({ word, points: POINTS[i], used: false })),
  }))
}

// NEW: initialState = a saved board; onStateChange = tells the page what to save
function WordQuizBoard({ words, initialState, onStateChange }) {
  const [categories, setCategories] = useState(() => initialState?.categories ?? makeBoard(words)) // NEW
  const [teamCount, setTeamCount] = useState(initialState?.teamCount ?? 2) // NEW
  const [scores, setScores] = useState([0, 0, 0, 0])
  const [open, setOpen] = useState(null) // { cat, cell } of the square being played
  const [editing, setEditing] = useState(false)

  // NEW: save the board fresh (every square unplayed), with any edits to names and words
  useEffect(() => {
    onStateChange({
      teamCount,
      categories: categories.map((c) => ({ ...c, cells: c.cells.map((cell) => ({ ...cell, used: false })) })),
    })
  }, [teamCount, categories, onStateChange])

  const teams = Array.from({ length: teamCount }, (_, i) => `Team ${i + 1}`)
  const openCell = open ? categories[open.cat].cells[open.cell] : null

  function updateCell(catIndex, cellIndex, changes) {
    setCategories(
      categories.map((c, ci) =>
        ci !== catIndex ? c : { ...c, cells: c.cells.map((cell, k) => (k === cellIndex ? { ...cell, ...changes } : cell)) },
      ),
    )
  }

  function award(teamIndex) {
    if (teamIndex !== null) {
      const next = [...scores]
      next[teamIndex] += openCell.points
      setScores(next)
    }
    updateCell(open.cat, open.cell, { used: true })
    setOpen(null)
  }

  function newBoard() {
    setCategories(makeBoard(words))
    setScores([0, 0, 0, 0])
    setOpen(null)
  }

  return (
    <div className="game quiz-board">
      <div className="game-controls">
        <label>
          Teams:{' '}
          <select value={teamCount} onChange={(e) => setTeamCount(Number(e.target.value))}>
            {[2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="button" onClick={() => setEditing(!editing)}>
          {editing ? 'Done editing' : 'Edit board'}
        </button>
        <button type="button" className="button" onClick={newBoard}>
          New board
        </button>
        <button type="button" className="button" onClick={() => setScores([0, 0, 0, 0])}>
          Reset scores
        </button>
      </div>

      <div className="scoreboard">
        {teams.map((t, i) => (
          <div key={t} className="score">
            <span>{t}</span>
            <strong>{scores[i]}</strong>
          </div>
        ))}
      </div>

      <div className="quiz-grid" style={{ '--cats': categories.length }}>
        {categories.map((cat, ci) => (
          <div key={ci} className="quiz-column">
            {editing ? (
              <input
                className="quiz-category-input"
                value={cat.name}
                aria-label="Category name"
                onChange={(e) => setCategories(categories.map((c, k) => (k === ci ? { ...c, name: e.target.value } : c)))}
              />
            ) : (
              <div className="quiz-category">{cat.name}</div>
            )}
            {cat.cells.map((cell, k) =>
              editing ? (
                <input
                  key={k}
                  className="quiz-word-input"
                  value={cell.word}
                  aria-label={`${cat.name} ${cell.points} word`}
                  onChange={(e) => updateCell(ci, k, { word: e.target.value })}
                />
              ) : (
                <button
                  key={k}
                  type="button"
                  className={`quiz-cell${cell.used ? ' is-used' : ''}`}
                  disabled={cell.used}
                  onClick={() => setOpen({ cat: ci, cell: k })}
                >
                  {cell.used ? '' : cell.points}
                </button>
              ),
            )}
          </div>
        ))}
      </div>
      {editing && <p className="small-note">Type to change a category name or a word. Click “Done editing” to play.</p>}

      {openCell && (
        <div className="quiz-overlay" role="dialog" aria-modal="true" aria-label="Read this word">
          <div className="quiz-overlay-box">
            <p className="quiz-overlay-points">
              {categories[open.cat].name} · {openCell.points}
            </p>
            <p className="quiz-overlay-word">{openCell.word}</p>
            <div className="quiz-overlay-buttons">
              {teams.map((t, i) => (
                <button key={t} type="button" className="button button-primary" onClick={() => award(i)}>
                  {t} read it (+{openCell.points})
                </button>
              ))}
              <button type="button" className="button" onClick={() => award(null)}>
                No points
              </button>
              <button type="button" className="button" onClick={() => setOpen(null)}>
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WordQuizBoard
