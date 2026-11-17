// NEW FILE
// The box that opens when you click Save: name the game, choose whether to share it.

import { useState } from 'react'

function SaveGameDialog({ defaultName, defaultShared, canOverwrite, saving, onSave, onClose }) {
  const [name, setName] = useState(defaultName)
  const [shared, setShared] = useState(defaultShared)
  const trimmed = name.trim()

  function submit(event, asCopy) {
    event.preventDefault()
    if (trimmed) onSave({ name: trimmed.slice(0, 100), shared, asCopy })
  }

  return (
    <div className="dialog-backdrop no-print" role="dialog" aria-modal="true" aria-labelledby="save-title">
      <form className="dialog-box" onSubmit={(e) => submit(e, false)}>
        <h2 id="save-title">Save to My Games</h2>
        <label htmlFor="save-name">Name</label>
        <input
          id="save-name"
          type="text"
          value={name}
          maxLength={100}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <label className="checkbox-line">
          <input type="checkbox" checked={shared} onChange={(e) => setShared(e.target.checked)} />
          Share with CHE staff (they can open and print it, but not change it)
        </label>
        <p className="small-note">Reminder: no student names in the game name or words.</p>
        <div className="dialog-buttons">
          <button type="submit" className="button button-primary" disabled={!trimmed || saving}>
            {canOverwrite ? 'Save changes' : 'Save'}
          </button>
          {canOverwrite && (
            <button type="button" className="button" disabled={!trimmed || saving} onClick={(e) => submit(e, true)}>
              Save as a new copy
            </button>
          )}
          <button type="button" className="button" onClick={onClose} disabled={saving}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default SaveGameDialog
