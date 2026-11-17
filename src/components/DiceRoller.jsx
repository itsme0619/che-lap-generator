// NEW FILE
// A die you click to roll. It flickers for a moment, then lands on 1-6.
// The game finds out the number through onRolled(number).

import { useEffect, useRef, useState } from 'react'
import { randomInt } from '../data/random.js'

// Where the dots go on each face (in a 3x3 grid, 0-8).
const PIPS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

export function DieFace({ value, size = 72 }) {
  return (
    <svg className="die-face" width={size} height={size} viewBox="0 0 90 90" role="img" aria-label={`Die showing ${value}`}>
      <rect x="3" y="3" width="84" height="84" rx="14" className="die-body" />
      {PIPS[value].map((spot) => (
        <circle key={spot} cx={20 + (spot % 3) * 25} cy={20 + Math.floor(spot / 3) * 25} r="8" className="die-pip" />
      ))}
    </svg>
  )
}

function DiceRoller({ onRolled, disabled = false }) {
  const [face, setFace] = useState(1)
  const [rolling, setRolling] = useState(false)
  const timer = useRef(null) // useRef keeps a value between redraws without causing one

  // If the page closes mid-roll, stop the flicker.
  useEffect(() => () => clearInterval(timer.current), [])

  function roll() {
    setRolling(true)
    let flickers = 0
    timer.current = setInterval(() => {
      flickers += 1
      setFace(randomInt(1, 6))
      if (flickers >= 8) {
        clearInterval(timer.current)
        const final = randomInt(1, 6)
        setFace(final)
        setRolling(false)
        onRolled(final)
      }
    }, 70)
  }

  return (
    <div className="dice-roller no-print">
      <button type="button" className="die-button" onClick={roll} disabled={rolling || disabled} aria-label="Roll the die">
        <DieFace value={face} />
      </button>
      <span className="die-hint">{rolling ? 'Rolling…' : 'Click to roll'}</span>
    </div>
  )
}

export default DiceRoller
