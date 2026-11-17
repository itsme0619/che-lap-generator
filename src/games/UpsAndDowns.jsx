// NEW FILE
// Ups and Downs: a winding board with a word on every space.
// Land on an up arrow and climb; land on a down arrow and slide. First to Finish wins.

import { useEffect, useState } from 'react' // NEW: useEffect
import { fillTo, shuffle } from '../data/random.js'
import DiceRoller from '../components/DiceRoller.jsx'
import PrintHeader from '../components/PrintHeader.jsx'
import { MARKER_COLORS } from './markerColors.js'

const ROWS = 6
const COLS = 6
const LAST = ROWS * COLS - 1 // the Finish space
const ARROWS_EACH_WAY = 4

// Space number (0 = Start) -> where it sits. The path snakes up from the bottom left.
function placeOf(space) {
  const rowFromBottom = Math.floor(space / COLS)
  const step = space % COLS
  const col = rowFromBottom % 2 === 0 ? step : COLS - 1 - step
  return { row: ROWS - 1 - rowFromBottom, col } // row 0 is the top of the screen
}

function spaceAt(rowFromBottom, col) {
  const step = rowFromBottom % 2 === 0 ? col : COLS - 1 - col
  return rowFromBottom * COLS + step
}

// Arrows join two spaces stacked on top of each other. No space gets two arrows.
function makeArrows() {
  const pairs = []
  for (let r = 0; r < ROWS - 1; r++) {
    for (let c = 0; c < COLS; c++) {
      const low = spaceAt(r, c)
      const high = spaceAt(r + 1, c)
      if (low !== 0 && high !== LAST) pairs.push([low, high])
    }
  }
  const used = new Set()
  const jumps = {} // { fromSpace: toSpace }
  let ups = 0
  let downs = 0
  for (const [low, high] of shuffle(pairs)) {
    if (used.has(low) || used.has(high)) continue
    if (ups < ARROWS_EACH_WAY) {
      jumps[low] = high
      ups += 1
    } else if (downs < ARROWS_EACH_WAY) {
      jumps[high] = low
      downs += 1
    } else break
    used.add(low)
    used.add(high)
  }
  return jumps
}

function makeBoard(words) {
  return { spaceWords: fillTo(words, LAST - 1).map((w) => w.text), jumps: makeArrows() }
}

// NEW: initialState = a saved board; onStateChange = tells the page what to save
function UpsAndDowns({ words, title, subtitle, initialState, onStateChange }) {
  const [board, setBoard] = useState(() => initialState?.board ?? makeBoard(words)) // NEW
  const [playerCount, setPlayerCount] = useState(2)
  const [positions, setPositions] = useState([0, 0, 0, 0])
  const [turn, setTurn] = useState(0)
  const [message, setMessage] = useState('Red goes first. Click the die to roll.')
  const [winner, setWinner] = useState(null)

  // NEW: report the board (words and arrows) so Save keeps it
  useEffect(() => {
    onStateChange({ board })
  }, [board, onStateChange])

  const players = MARKER_COLORS.slice(0, playerCount)
  const wordOn = (space) => (space === 0 ? 'Start' : space === LAST ? 'Finish' : board.spaceWords[space - 1])

  function restart(newBoard = false) {
    if (newBoard) setBoard(makeBoard(words))
    setPositions([0, 0, 0, 0])
    setTurn(0)
    setWinner(null)
    setMessage('Red goes first. Click the die to roll.')
  }

  function handleRoll(n) {
    const player = players[turn]
    const landed = Math.min(positions[turn] + n, LAST)
    let finalSpace = landed
    let text = `${player.label} rolled ${n}`
    if (landed === LAST) {
      text += ' and reached Finish!'
    } else {
      text += ` and landed on “${wordOn(landed)}.” Read it!`
      if (board.jumps[landed] !== undefined) {
        finalSpace = board.jumps[landed]
        text += finalSpace > landed ? ` Up the arrow to “${wordOn(finalSpace)}.”` : ` Down the arrow to “${wordOn(finalSpace)}.”`
      }
    }
    const next = [...positions]
    next[turn] = finalSpace
    setPositions(next)
    if (finalSpace === LAST) {
      setWinner(player.label)
    } else {
      const nextTurn = (turn + 1) % playerCount
      text += ` ${players[nextTurn].label}’s turn.`
      setTurn(nextTurn)
    }
    setMessage(text)
  }

  // Arrow drawing: each cell is 100 wide and 60 tall in the drawing's units.
  const center = (space) => {
    const { row, col } = placeOf(space)
    return { x: col * 100 + 50, y: row * 60 + 30 }
  }

  return (
    <div className="game ups-and-downs">
      <div className="game-controls no-print">
        <DiceRoller onRolled={handleRoll} disabled={!!winner} />
        <label>
          Players:{' '}
          <select
            value={playerCount}
            onChange={(e) => {
              setPlayerCount(Number(e.target.value))
              restart()
            }}
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="button" onClick={() => restart()}>
          Start over
        </button>
        <button type="button" className="button" onClick={() => restart(true)}>
          New board
        </button>
      </div>
      <p className={`roll-message no-print${winner ? ' is-winner' : ''}`} aria-live="polite">
        {winner ? `🎉 ${winner} wins! ` : ''}
        {message}
      </p>

      <div className="print-page">
        <PrintHeader title={title} subtitle={subtitle} />
        <div className="ud-board" style={{ '--rows': ROWS, '--cols': COLS }}>
          {Array.from({ length: ROWS * COLS }, (_, space) => {
            const { row, col } = placeOf(space)
            const isEnd = space === 0 || space === LAST
            return (
              <div
                key={space}
                className={`ud-cell${isEnd ? ' is-end' : ''}${space % 2 ? ' is-alt' : ''}`}
                style={{ gridRow: row + 1, gridColumn: col + 1 }}
              >
                <span className="ud-word">{wordOn(space)}</span>
                <span className="ud-tokens no-print">
                  {players.map((p, i) =>
                    positions[i] === space ? <span key={p.id} className={`marker marker-${p.id} token`} aria-label={`${p.label} is here`} /> : null,
                  )}
                </span>
              </div>
            )
          })}
          <svg className="ud-arrows" viewBox={`0 0 ${COLS * 100} ${ROWS * 60}`} preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <marker id="ud-head" viewBox="0 0 10 10" refX="5" refY="5" markerUnits="userSpaceOnUse" markerWidth="18" markerHeight="18" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" className="ud-head" />
              </marker>
            </defs>
            {Object.entries(board.jumps).map(([from, to]) => {
              const a = center(Number(from))
              const b = center(to)
              const up = to > Number(from)
              // Drawn near the right edge of the squares so the words stay readable.
              return (
                <line
                  key={from}
                  x1={a.x + 36}
                  y1={a.y + (up ? 4 : -4)}
                  x2={b.x + 36}
                  y2={b.y + (up ? -4 : 4)}
                  className={up ? 'ud-up' : 'ud-down'}
                  markerEnd="url(#ud-head)"
                />
              )
            })}
          </svg>
        </div>
        <p className="ud-key">Start at the bottom left and follow the rows. ⇧ = climb up, ⇩ = slide down.</p>
      </div>
    </div>
  )
}

export default UpsAndDowns
