// NEW FILE
// The lesson list: every lesson shows its spelling-sounds and sight words.
// Check a lesson to use all of it, or open ▸ to pick only some of its patterns.

import { useState } from 'react'
import { getLessonOptions, getDefaultOptionIds } from '../data/wordPool.js'

function LessonPicker({ levelId, level, selection, onChange, list }) {
  const [openLessons, setOpenLessons] = useState({}) // which ▸ are open
  const lessons = level.items.filter((item) => item.type === 'lesson')
  const lessonLabel = (id) => lessons.find((l) => l.id === id)?.label

  function setLesson(lessonId, optionIds) {
    const next = { ...selection }
    if (optionIds.length === 0) delete next[lessonId]
    else next[lessonId] = optionIds
    onChange(next)
  }

  function toggleLesson(lesson) {
    if (selection[lesson.id]) setLesson(lesson.id, [])
    else setLesson(lesson.id, getDefaultOptionIds(levelId, lesson, list))
  }

  function toggleOption(lesson, optionId) {
    const current = selection[lesson.id] || []
    const next = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId]
    setLesson(lesson.id, next)
  }

  // Checks every lesson before the last one that's checked.
  function selectAllEarlier() {
    const lastIndex = lessons.reduce((last, l, i) => (selection[l.id] ? i : last), -1)
    const next = { ...selection }
    lessons.slice(0, lastIndex).forEach((l) => {
      if (!next[l.id]) {
        const ids = getDefaultOptionIds(levelId, l, list)
        if (ids.length > 0) next[l.id] = ids
      }
    })
    onChange(next)
  }

  function selectLessons(lessonIds) {
    const next = { ...selection }
    lessonIds.forEach((id) => {
      const l = lessons.find((x) => x.id === id)
      const ids = getDefaultOptionIds(levelId, l, list)
      if (ids.length > 0) next[id] = ids
    })
    onChange(next)
  }

  const anySelected = Object.keys(selection).length > 0

  return (
    <div className="lesson-picker">
      <div className="lesson-picker-tools">
        <button type="button" className="button" onClick={selectAllEarlier} disabled={!anySelected}>
          Add all earlier lessons
        </button>
        <button type="button" className="button" onClick={() => onChange({})} disabled={!anySelected}>
          Clear
        </button>
      </div>

      <ul className="lesson-list">
        {level.items.map((item) => {
          if (item.type === 'masteryTest') {
            const covers = item.covers || []
            return (
              <li key={item.id} className="lesson-row mastery-row">
                <span className="mastery-label">{item.label}</span>
                {covers.length > 0 && (
                  <button type="button" className="link-button" onClick={() => selectLessons(covers)}>
                    Review: Lessons {lessonLabel(covers[0])} to {lessonLabel(covers[covers.length - 1])}
                  </button>
                )}
              </li>
            )
          }

          const lesson = item
          const options = getLessonOptions(levelId, lesson, list)
          const chosen = selection[lesson.id] || []
          const checked = chosen.length > 0
          const partial = checked && chosen.length < options.length
          const isOpen = openLessons[lesson.id]
          const nothingToPick = options.length === 0

          // The one-line summary: sounds, then sight words or syllables.
          const sounds = (lesson.patterns || []).map((p) => p.label).join(', ')
          const summary = sounds || (lesson.isPractice ? 'Grade-level practice' : 'Review lesson')
          const extra =
            levelId === 'challenge'
              ? (lesson.sightSyllables?.[list] || []).join(', ')
              : (lesson.sightWords || []).join(', ')

          return (
            <li key={lesson.id} className={`lesson-row${checked ? ' is-checked' : ''}`}>
              <label className="lesson-main">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={nothingToPick}
                  // "indeterminate" shows a dash when only some patterns are picked
                  ref={(el) => {
                    if (el) el.indeterminate = partial
                  }}
                  onChange={() => toggleLesson(lesson)}
                />
                <span className="lesson-name">Lesson {lesson.label}</span>
                <span className={sounds ? 'lesson-sounds' : 'lesson-review'}>{summary}</span>
                {extra && (
                  <span className="lesson-extra">
                    {levelId === 'challenge' ? 'syllables: ' : 'sight words: '}
                    {extra}
                  </span>
                )}
              </label>

              {options.length > 1 && (
                <button
                  type="button"
                  className="expand-button"
                  aria-expanded={isOpen ? 'true' : 'false'}
                  aria-label={`Choose patterns for Lesson ${lesson.label}`}
                  onClick={() => setOpenLessons({ ...openLessons, [lesson.id]: !isOpen })}
                >
                  {isOpen ? '▾' : '▸'}
                </button>
              )}

              {isOpen && options.length > 1 && (
                <div className="lesson-options">
                  {options.map((option) => (
                    <label key={option.id} className="option-chip">
                      <input
                        type="checkbox"
                        checked={chosen.includes(option.id)}
                        onChange={() => toggleOption(lesson, option.id)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default LessonPicker
