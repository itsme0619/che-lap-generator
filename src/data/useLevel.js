// NEW FILE
// A hook that loads one SIPPS level from Firestore.
// Example: const { level, loading, error } = useLevel('extension')
// Each level is read once and then remembered while the app is open.

import { useEffect, useState } from 'react'
import { loadLevel } from './curriculum.js'

const remembered = new Map() // levelId -> level data

export function useLevel(levelId) {
  const [result, setResult] = useState({ levelId: null, level: null, error: '' })

  useEffect(() => {
    let stillHere = true
    if (remembered.has(levelId)) {
      // Already loaded: no need to ask Firestore again.
      Promise.resolve().then(() => {
        if (stillHere) setResult({ levelId, level: remembered.get(levelId), error: '' })
      })
    } else {
      loadLevel(levelId)
        .then((level) => {
          if (!stillHere) return
          if (!level) {
            setResult({ levelId, level: null, error: 'This level hasn’t been uploaded yet. (Admin page)' })
            return
          }
          remembered.set(levelId, level)
          setResult({ levelId, level, error: '' })
        })
        .catch((err) => {
          console.error(err)
          if (stillHere) setResult({ levelId, level: null, error: 'Couldn’t load the lessons. Try refreshing the page.' })
        })
    }
    return () => {
      stillHere = false
    }
  }, [levelId])

  // Until the answer for THIS level arrives, we're loading.
  const loading = result.levelId !== levelId
  return {
    level: loading ? null : result.level,
    error: loading ? '' : result.error,
    loading,
  }
}
