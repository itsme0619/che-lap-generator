// NEW FILE
// Saved games in Firestore: collection "savedGames", one document per game.
// The security rules make sure teachers only change their own games,
// and only see other teachers' games when those are shared.

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase.js'

export const MAX_SAVED_GAMES = 200
const gamesCollection = collection(db, 'savedGames')

// Newest first. (Sorting here instead of in Firestore avoids needing a special index.)
function newestFirst(list) {
  const time = (g) => g.updatedAt?.toMillis?.() ?? 0
  return list.sort((a, b) => time(b) - time(a))
}

function toList(snapshot) {
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function listMyGames(uid) {
  const snapshot = await getDocs(query(gamesCollection, where('ownerUid', '==', uid)))
  return newestFirst(toList(snapshot))
}

// Games other teachers have shared.
export async function listSharedGames(uid) {
  const snapshot = await getDocs(query(gamesCollection, where('shared', '==', true)))
  return newestFirst(toList(snapshot).filter((g) => g.ownerUid !== uid))
}

export async function getSavedGame(id) {
  const snapshot = await getDoc(doc(db, 'savedGames', id))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

// Saves a new game. Returns its id. Stops at MAX_SAVED_GAMES.
export async function createSavedGame(user, game) {
  const mine = await listMyGames(user.uid)
  if (mine.length >= MAX_SAVED_GAMES) {
    throw new Error(`You have ${MAX_SAVED_GAMES} saved games. Delete a few in My Games first.`)
  }
  const ref = await addDoc(gamesCollection, {
    ...game,
    ownerUid: user.uid,
    ownerEmail: user.email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

// Changes some fields of one of your games (name, shared, or the whole game).
export async function updateSavedGame(id, changes) {
  await updateDoc(doc(db, 'savedGames', id), { ...changes, updatedAt: serverTimestamp() })
}

export async function deleteSavedGame(id) {
  await deleteDoc(doc(db, 'savedGames', id))
}
