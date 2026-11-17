// NEW FILE
// Reads and writes the SIPPS lesson data in Firestore.
// Collection "curriculum" holds one document per level: beginning, extension, challenge.

import { doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.js'
import { LEVELS } from '../config.js'

// Get one level's data. Returns null if it hasn't been uploaded yet.
export async function loadLevel(levelId) {
  const snapshot = await getDoc(doc(db, 'curriculum', levelId))
  return snapshot.exists() ? snapshot.data() : null
}

// Checks that a file has the shape we expect before anything is uploaded.
// Returns a list of problems (an empty list means it looks right).
export function checkLessonFile(data) {
  const problems = []
  if (!data || !Array.isArray(data.levels)) {
    return ['This file has no "levels" list. Is it sipps-lessons.json?']
  }
  for (const level of LEVELS) {
    const found = data.levels.find((l) => l.id === level.id)
    if (!found) {
      problems.push(`The ${level.name} level is missing.`)
    } else if (!Array.isArray(found.items) || found.items.length === 0) {
      problems.push(`The ${level.name} level has no lessons.`)
    }
  }
  return problems
}

// Count lessons in a level (skipping Mastery Test rows).
export function countLessons(level) {
  return (level.items || []).filter((item) => item.type === 'lesson').length
}

// Upload all three levels at once. A "batch" means all three save, or none do.
export async function uploadLessonFile(data, uploadedBy) {
  const batch = writeBatch(db)
  for (const level of LEVELS) {
    const levelData = data.levels.find((l) => l.id === level.id)
    batch.set(doc(db, 'curriculum', level.id), {
      ...levelData,
      fileVersion: data.version ?? null,
      uploadedBy,
      uploadedAt: serverTimestamp(),
    })
  }
  await batch.commit()
}
