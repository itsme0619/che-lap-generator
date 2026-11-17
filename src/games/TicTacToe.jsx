// NEW FILE
// Tic Tac Toe: read the word to claim the square.
// Click a square: X, click again: O, again: empty. Prints 4 boards per page.

import { useEffect, useState } from 'react' // NEW: useEffect
import { fillTo } from '../data/random.js'
import PrintHeader from '../components/PrintHeader.jsx'

function makeBoards(words, count) {
  return Array.from({ length: count }, () => fillTo(words, 9).map((w) => w.text))
}

const NEXT_MARK = { '': 'X', X: 'O', O: '' }

// NEW: initialState = saved boards; onStateChange = tells the page what to save
function TicTacToe({ words, title, subtitle, initialState, onStateChange }) {
  const [boardCount, setBoardCount] = useState(initialState?.boardCount ?? 4) // NEW
  // NEW: each saved board is { cells: [...] } (Firestore can't store a list of lists)
  const [boards, setBoards] = useState(() => initialState?.boards?.map((b) => b.cells) ?? makeBoards(words, 4))
  const [marks, setMarks] = useState({}) // { "board-cell": "X" | "O" }

  // NEW: report the boards so Save keeps them
  useEffect(() => {
    onStateChange({ boardCount, boards: boards.map((cells) => ({ cells })) })
  }, [boardCount, boards, onStateChange])

  function rebuild(count = boardCount) {
    setBoards(makeBoards(words, count))
    setMarks({})
  }

  function cycle(key) {
    const next = { ...marks, [key]: NEXT_MARK[marks[key] || ''] }
    if (!next[key]) delete next[key]
    setMarks(next)
  }

  // Groups of 4 boards = one printed page.
  const pages = Array.from({ length: Math.ceil(boards.length / 4) }, (_, p) => boards.slice(p * 4, p * 4 + 4))

  return (
    <div className="game tic-tac-toe">
      <div className="game-controls no-print">
        <label>
          Boards:{' '}
          <select
            value={boardCount}
            onChange={(e) => {
              const n = Number(e.target.value)
              setBoardCount(n)
              rebuild(n)
            }}
          >
            {[1, 2, 4, 8, 12].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="button" onClick={() => rebuild()}>
          New boards
        </button>
        <button type="button" className="button" onClick={() => setMarks({})}>
          Clear X’s and O’s
        </button>
        <span className="small-note">Click a square for X, again for O, again to clear.</span>
      </div>

      {pages.map((pageBoards, p) => (
        <div key={p} className="print-page">
          <PrintHeader title={title} subtitle={subtitle} />
          <div className="ttt-boards">
            {pageBoards.map((cells, i) => {
              const b = p * 4 + i
              return (
                <div key={b} className="ttt-board">
                  {cells.map((text, c) => {
                    const mark = marks[`${b}-${c}`]
                    return (
                      <button key={c} type="button" className="ttt-cell" onClick={() => cycle(`${b}-${c}`)}>
                        <span className="ttt-word">{text}</span>
                        {mark && <span className={`ttt-mark ttt-${mark}`}>{mark}</span>}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TicTacToe
