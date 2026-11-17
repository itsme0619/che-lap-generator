// NEW FILE
// Small helpers for mixing up words.

// Returns a shuffled copy (the original list is left alone).
export function shuffle(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// Returns exactly `count` items. Uses every item once before repeating any,
// so a short list repeats evenly instead of one word showing up five times.
export function fillTo(list, count) {
  if (list.length === 0) return []
  const result = []
  while (result.length < count) {
    result.push(...shuffle(list))
  }
  return result.slice(0, count)
}

// A whole number from min to max (both included).
export function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}
