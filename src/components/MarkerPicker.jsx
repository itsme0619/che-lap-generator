// NEW FILE
// Pick which colored marker to drop when you click a word.

import { MARKER_COLORS } from '../games/markerColors.js'

function MarkerPicker({ value, onChange, onClear }) {
  return (
    <div className="marker-picker no-print" role="group" aria-label="Marker color">
      <span>Marker:</span>
      {MARKER_COLORS.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`marker-swatch marker-${c.id}${value === c.id ? ' is-selected' : ''}`}
          aria-pressed={value === c.id ? 'true' : 'false'}
          aria-label={c.label}
          onClick={() => onChange(c.id)}
        />
      ))}
      {onClear && (
        <button type="button" className="button" onClick={onClear}>
          Clear markers
        </button>
      )}
    </div>
  )
}

export default MarkerPicker
