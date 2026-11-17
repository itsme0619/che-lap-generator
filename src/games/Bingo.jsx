// NEW FILE
// Bingo: a set of different cards, plus a caller who draws words one at a time.
// On screen: call words and mark one card. Print: every card (2 per page) and a caller list.

import { useEffect, useState } from 'react' // NEW: useEffect
import { shuffle, fillTo } from '../data/random.js'
import MarkerPicker from '../components/MarkerPicker.jsx'
import PrintHeader from '../components/PrintHeader.jsx'

const FREE = '★ FREE'

// One card: size x size words. 3x3 and 5x5 get a FREE space in the middle.
function makeCard(words, size) {
  const hasFree = size % 2 === 1
  const needed = size * size - (hasFree ? 1 : 0)
  // Different words on a card when there are enough; otherwise words repeat.
  const picked = words.length >= needed ? shuffle(words).slice(0, needed) : fillTo(words, needed)
  const cells = picked.map((w) => w.text)
  if (hasFree) cells.splice(Math.floor((size * size) / 2), 0, FREE)
  return cells
}

function makeCards(words, size, count) {
  return Array.from({ length: count }, () => makeCard(words, size))
}

// NEW: initialState = a saved set of cards; onStateChange = tells the page what to save
function Bingo({ words, title, subtitle, initialState, onStateChange }) {
  const [size, setSize] = useState(initialState?.size ?? 4) // NEW
  const [cardCount, setCardCount] = useState(initialState?.cardCount ?? 6) // NEW
  // NEW: Firestore can't store a list of lists, so each saved card is { cells: [...] }
  const [cards, setCards] = useState(() => initialState?.cards?.map((c) => c.cells) ?? makeCards(words, 4, 6))
  const [cardShown, setCardShown] = useState(0)
  const [markers, setMarkers] = useState({}) // { "card-cell": color }
  const [color, setColor] = useState('red')
  const [callOrder, setCallOrder] = useState(() => shuffle(words.map((w) => w.text)))
  const [calledCount, setCalledCount] = useState(0)

  // NEW: report the cards so Save keeps this exact set
  useEffect(() => {
    onStateChange({ size, cardCount, cards: cards.map((cells) => ({ cells })) })
  }, [size, cardCount, cards, onStateChange])

  const called = callOrder.slice(0, calledCount)
  const current = called[called.length - 1]

  function rebuild(newSize = size, newCount = cardCount) {
    setCards(makeCards(words, newSize, newCount))
    setMarkers({})
    setCardShown(0)
  }

  function restartCalling() {
    setCallOrder(shuffle(words.map((w) => w.text)))
    setCalledCount(0)
  }

  function toggleMarker(cellIndex) {
    const key = `${cardShown}-${cellIndex}`
    const next = { ...markers }
    if (next[key] === color) delete next[key]
    else next[key] = color
    setMarkers(next)
  }

  const shortList = words.length < size * size - 1

  function renderCard(cells, cardIndex, interactive) {
    return (
      <div className="bingo-card" style={{ '--size': size }}>
        <div className="bingo-title">BINGO <span className="card-number">Card {cardIndex + 1}</span></div>
        <div className="bingo-grid">
          {cells.map((text, i) => {
            const marker = interactive ? markers[`${cardIndex}-${i}`] : null
            const isFree = text === FREE
            return interactive ? (
              <button key={i} type="button" className={`bingo-cell${isFree ? ' is-free' : ''}`} onClick={() => toggleMarker(i)}>
                {text}
                {marker && <span className={`marker marker-${marker}`} aria-label={`${marker} marker`} />}
              </button>
            ) : (
              <div key={i} className={`bingo-cell${isFree ? ' is-free' : ''}`}>
                {text}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="game bingo">
      <div className="game-controls no-print">
        <label>
          Card size:{' '}
          <select
            value={size}
            onChange={(e) => {
              const s = Number(e.target.value)
              setSize(s)
              rebuild(s)
            }}
          >
            <option value={3}>3 × 3 (free space)</option>
            <option value={4}>4 × 4</option>
            <option value={5}>5 × 5 (free space)</option>
          </select>
        </label>
        <label>
          Cards:{' '}
          <input
            type="number"
            min="1"
            max="30"
            value={cardCount}
            onChange={(e) => {
              const n = Math.max(1, Math.min(30, Number(e.target.value) || 1))
              setCardCount(n)
              rebuild(size, n)
            }}
          />
        </label>
        <button type="button" className="button" onClick={() => rebuild()}>
          New cards
        </button>
      </div>
      {shortList && (
        <p className="small-note no-print">
          This list is shorter than a card, so some words repeat on a card. A bigger list or a smaller card fixes that.
        </p>
      )}

      {/* ===== On screen: caller + one card ===== */}
      <div className="bingo-play no-print">
        <div className="bingo-caller">
          <h2>Caller</h2>
          <div className="called-word" aria-live="polite">
            {current || '—'}
          </div>
          <button
            type="button"
            className="button button-primary"
            onClick={() => setCalledCount((n) => n + 1)}
            disabled={calledCount >= callOrder.length}
          >
            {calledCount >= callOrder.length ? 'All words called' : 'Call a word'}
          </button>
          <button type="button" className="button" onClick={restartCalling}>
            Start over
          </button>
          <p className="small-note">
            Called {calledCount} of {callOrder.length}
          </p>
          <ul className="called-list">
            {called.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>

        <div className="bingo-card-view">
          <div className="card-nav">
            <button type="button" className="button" onClick={() => setCardShown((c) => Math.max(0, c - 1))} disabled={cardShown === 0}>
              ← Card
            </button>
            <span>
              Card {cardShown + 1} of {cards.length}
            </span>
            <button
              type="button"
              className="button"
              onClick={() => setCardShown((c) => Math.min(cards.length - 1, c + 1))}
              disabled={cardShown >= cards.length - 1}
            >
              Card →
            </button>
          </div>
          <MarkerPicker value={color} onChange={setColor} onClear={() => setMarkers({})} />
          {cards[cardShown] && renderCard(cards[cardShown], cardShown, true)}
        </div>
      </div>

      {/* ===== On paper: every card, 2 per page, then the caller list ===== */}
      <div className="print-only">
        {Array.from({ length: Math.ceil(cards.length / 2) }, (_, page) => (
          <div key={page} className="print-page">
            <PrintHeader title={title} subtitle={subtitle} />
            {cards.slice(page * 2, page * 2 + 2).map((cells, i) => (
              <div key={i}>{renderCard(cells, page * 2 + i, false)}</div>
            ))}
          </div>
        ))}
        <div className="print-page">
          <div className="print-header">
            <strong>{title}: caller list</strong>
            <span className="print-subtitle"> · {subtitle}</span>
          </div>
          <ul className="caller-checklist">
            {words.map((w) => (
              <li key={w.text}>☐ {w.text}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Bingo
