// NEW FILE
// Turns "which lessons and patterns are checked" into the list of words a game uses.
// Each word is { text, group }. "group" is the spelling-sound (or "Sight words"),
// which the Word Quiz Board uses for its categories.

// The choices inside one lesson (what shows when you open its ▸).
// For Challenge, `list` is 'A', 'B' or 'C'.
export function getLessonOptions(levelId, lesson, list) {
  const options = []
  if (levelId === 'challenge') {
    if (lesson.isPractice) {
      options.push({ id: 'practice', label: 'All Challenge sight syllables' })
      return options
    }
    const syllables = lesson.sightSyllables?.[list] || []
    if (syllables.length > 0) {
      options.push({ id: 'syllables', label: `Sight syllables: ${syllables.join(', ')}` })
    }
    for (const p of lesson.patterns || []) {
      options.push({ id: p.id, label: `${p.label} (single-syllable phonics)` })
    }
    return options
  }
  for (const p of lesson.patterns || []) {
    options.push({ id: p.id, label: p.label })
  }
  if ((lesson.sightWords || []).length > 0) {
    options.push({ id: 'sight', label: 'Sight words' })
  }
  return options
}

// What gets checked when you check a whole lesson.
// Challenge: just the sight syllables (phonics there is optional; open ▸ to add it).
export function getDefaultOptionIds(levelId, lesson, list) {
  const options = getLessonOptions(levelId, lesson, list)
  if (levelId === 'challenge') {
    const main = options.find((o) => o.id === 'syllables' || o.id === 'practice')
    return main ? [main.id] : options.map((o) => o.id)
  }
  return options.map((o) => o.id)
}

// Builds the word list.
//   level:     the level's data from Firestore
//   selection: { lessonId: [optionId, ...] }
//   settings:  { list: 'A'|'B'|'C', syllableMode: 'words'|'syllables' } (Challenge only)
// Returns [{ text, group }] with no repeats, in lesson order.
export function buildWordPool(level, selection, settings = {}) {
  const words = []
  const seen = new Set()
  function add(rawText, group) {
    const text = rawText.replace(/\(\d\)$/, '') // "live(2)" -> "live" (the (2) means two ways to say it)
    const key = text.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    words.push({ text, group })
  }

  const lessons = level.items.filter((item) => item.type === 'lesson')
  const list = settings.list || 'A'
  const syllableMode = settings.syllableMode || 'words'

  function addSyllable(syllable) {
    if (syllableMode === 'syllables') {
      add(syllable.replace('(2)', ''), 'Sight syllables')
    } else {
      for (const w of level.syllableWords?.[syllable] || []) add(w, syllable)
    }
  }

  for (const lesson of lessons) {
    const chosen = selection[lesson.id]
    if (!chosen || chosen.length === 0) continue
    for (const optionId of chosen) {
      if (optionId === 'sight') {
        for (const w of lesson.sightWords || []) add(w, 'Sight words')
      } else if (optionId === 'syllables') {
        for (const s of lesson.sightSyllables?.[list] || []) addSyllable(s)
      } else if (optionId === 'practice') {
        for (const other of lessons) {
          for (const s of other.sightSyllables?.[list] || []) addSyllable(s)
        }
      } else {
        const pattern = (lesson.patterns || []).find((p) => p.id === optionId)
        if (pattern) for (const w of pattern.words) add(w, pattern.label)
      }
    }
  }
  return words
}

// Turns what a teacher typed ("ship, shop  fish") into separate words.
export function parseTypedWords(text) {
  return text
    .split(/[\s,;]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0 && w.length <= 30)
}
