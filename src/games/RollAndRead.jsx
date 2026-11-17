// NEW FILE
// Roll and Read: 6 rows (one for each number on the die) of words.
// Roll, then read a word in that row and drop your marker on it.

import { useEffect, useState } from 'react' // NEW: useEffect
import { fillTo } from '../data/random.js'
import DiceRoller, { DieFace } from '../components/DiceRoller.jsx'
import MarkerPicker from '../components/MarkerPicker.jsx'
import PrintHeader from '../components/PrintHeader.jsx'

const ROWS = 6

// NEW: initialState = a saved board to start from; onStateChange = tells the page what to save
function RollAndRead({ words, title, subtitle, initialState, onStateChange }) {
  const [columns, setColumns] = useState(initialState?.columns ?? 5) // NEW: saved value if there is one
  // useState(() => ...) runs the setup only once, when the game starts.
  const [board, setBoard] = useState(() => initialState?.board ?? fillTo(words, ROWS * 5)) // NEW

  // NEW: whenever the board changes, tell the page (so Save saves this exact board)
  useEffect(() => {
    onStateChange({ columns, board })
  }, [columns, board, onStateChange])
  const [markers, setMarkers] = useState({}) // { cellIndex: color }
  const [color, setColor] = useState('red')
  const [rolledRow, setRolledRow] = useState(null)

  function newBoard(cols = columns) {
    setBoard(fillTo(words, ROWS * cols))
    setMarkers({})
    setRolledRow(null)
  }

  function changeColumns(cols) {
    setColumns(cols)
    newBoard(cols)
  }

  function toggleMarker(index) {
    const next = { ...markers }
    if (next[index] === color) delete next[index]
    else next[index] = color
    setMarkers(next)
  }

  return (
    <div className="game roll-and-read">
      <div className="game-controls no-print">
        <DiceRoller onRolled={(n) => setRolledRow(n)} />
        <MarkerPicker value={color} onChange={setColor} onClear={() => setMarkers({})} />
        <label>
          Words per row:{' '}
          <select value={columns} onChange={(e) => changeColumns(Number(e.target.value))}>
            {[4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="button" onClick={() => newBoard()}>
          New board
        </button>
      </div>
      {rolledRow && <p className="roll-message no-print">You rolled {rolledRow}. Read a word in row {rolledRow}!</p>}

      <div className="print-page">
        <PrintHeader title={title} subtitle={subtitle} />
        <table className="rr-board">
          <tbody>
            {Array.from({ length: ROWS }, (_, row) => (
              <tr key={row} className={rolledRow === row + 1 ? 'is-rolled' : ''}>
                <th scope="row">
                  <DieFace value={row + 1} size={44} />
                </th>
                {Array.from({ length: columns }, (_, col) => {
                  const index = row * columns + col
                  const marker = markers[index]
                  return (
                    <td key={col}>
                      <button type="button" className="word-cell" onClick={() => toggleMarker(index)}>
                        {board[index]?.text}
                        {marker && <span className={`marker marker-${marker}`} aria-label={`${marker} marker`} />}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RollAndRead
