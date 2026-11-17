// NEW FILE
// Shows the words a game will use. Teachers can remove words (×) or add their own.
// Changes here only affect this game, never the main word lists.

import { useState } from 'react'
import { parseTypedWords } from '../data/wordPool.js'

function WordListEditor({ words, removedCount, onRemove, onAdd, onRestoreRemoved }) {
  const [typed, setTyped] = useState('')

  function handleAdd(event) {
    event.preventDefault() // stop the form from reloading the page
    const newWords = parseTypedWords(typed)
    if (newWords.length > 0) onAdd(newWords)
    setTyped('')
  }

  return (
    <div className="word-list-editor">
      <h3>
        Words in this game <span className="count">({words.length})</span>
      </h3>

      {words.length === 0 ? (
        <p className="placeholder">Check a lesson above, or add your own words below.</p>
      ) : (
        <ul className="word-chips">
          {words.map((w) => (
            <li key={w.text} className={`word-chip${w.group === 'Added words' ? ' is-added' : ''}`}>
              {w.text}
              <button type="button" aria-label={`Remove ${w.text}`} onClick={() => onRemove(w.text)}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {removedCount > 0 && (
        <p className="small-note">
          {removedCount} removed.{' '}
          <button type="button" className="link-button" onClick={onRestoreRemoved}>
            Put them back
          </button>
        </p>
      )}

      <form className="add-words" onSubmit={handleAdd}>
        <label htmlFor="add-words-input">Add your own words</label>
        <div className="add-words-row">
          <input
            id="add-words-input"
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="e.g. chimp, chest, champ"
          />
          <button type="submit" className="button">
            Add
          </button>
        </div>
        <p className="small-note">Separate words with commas or spaces. No student names, please.</p>
      </form>
    </div>
  )
}

export default WordListEditor
