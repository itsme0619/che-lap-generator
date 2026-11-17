// NEW FILE
// Admin only: upload the SIPPS lesson data file (data-source/sipps-lessons.json) to Firestore.

import { useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth.js'
import { LEVELS } from '../config.js'
import {
  loadLevel,
  checkLessonFile,
  countLessons,
  uploadLessonFile,
} from '../data/curriculum.js'

function AdminPage() {
  const { user } = useAuth()

  const [current, setCurrent] = useState(null) // what's in Firestore now, per level
  const [loadError, setLoadError] = useState('')
  const [fileData, setFileData] = useState(null) // the file you picked, read into memory
  const [fileProblems, setFileProblems] = useState([])
  const [status, setStatus] = useState('') // "Uploading…", "Uploaded!", or an error
  const [refreshCount, setRefreshCount] = useState(0) // bump this to read Firestore again

  // Read what's in Firestore now. Runs when the page opens, and after each upload.
  useEffect(() => {
    let stillHere = true // so we don't update the page after you've left it
    async function readCurrent() {
      try {
        const levels = await Promise.all(LEVELS.map((level) => loadLevel(level.id)))
        if (stillHere) setCurrent(levels)
      } catch (err) {
        console.error(err)
        if (stillHere) setLoadError('Couldn’t read Firestore. Have the security rules been deployed?')
      }
    }
    readCurrent()
    return () => {
      stillHere = false
    }
  }, [refreshCount])

  // When you pick a file: read it, turn the text into data (JSON), and check it.
  async function handleFileChosen(event) {
    setStatus('')
    setFileData(null)
    setFileProblems([])
    const file = event.target.files[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const problems = checkLessonFile(data)
      setFileProblems(problems)
      if (problems.length === 0) setFileData(data)
    } catch {
      setFileProblems(['That file isn’t valid JSON. Pick data-source/sipps-lessons.json.'])
    }
  }

  async function handleUpload() {
    setStatus('Uploading…')
    try {
      await uploadLessonFile(fileData, user.email)
      setStatus('Uploaded! The table below now shows what’s in Firestore.')
      setRefreshCount((n) => n + 1)
    } catch (err) {
      console.error(err)
      setStatus('Upload didn’t work. Check that you’re signed in as the admin and the rules are deployed.')
    }
  }

  return (
    <section>
      <h1>Admin</h1>
      <p>Only you can see this page. Firestore’s security rules only let the admin upload.</p>

      <h2>Lesson data in Firestore now</h2>
      {loadError && <p className="error-message" role="alert">{loadError}</p>}
      {!current && !loadError && <p className="placeholder">Reading…</p>}
      {current && (
        <table className="simple-table">
          <thead>
            <tr>
              <th>Level</th>
              <th>Lessons</th>
              <th>Last uploaded</th>
            </tr>
          </thead>
          <tbody>
            {LEVELS.map((level, i) => {
              const data = current[i]
              return (
                <tr key={level.id}>
                  <td>{level.name}</td>
                  <td>{data ? countLessons(data) : 'Not uploaded yet'}</td>
                  <td>
                    {data?.uploadedAt
                      ? `${data.uploadedAt.toDate().toLocaleString()} by ${data.uploadedBy}`
                      : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      <h2>Upload a new lesson data file</h2>
      <p>
        Pick <code>sipps-lessons.json</code> from the <code>data-source</code> folder. Uploading
        replaces all three levels.
      </p>
      <input type="file" accept=".json,application/json" onChange={handleFileChosen} />

      {fileProblems.length > 0 && (
        <div className="error-message" role="alert">
          {fileProblems.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      )}

      {fileData && (
        <div className="upload-preview">
          <p>This file has:</p>
          <ul>
            {LEVELS.map((level) => {
              const found = fileData.levels.find((l) => l.id === level.id)
              return (
                <li key={level.id}>
                  {level.name}: {countLessons(found)} lessons
                </li>
              )
            })}
          </ul>
          <button
            type="button"
            className="button button-primary"
            onClick={handleUpload}
            disabled={status === 'Uploading…'}
          >
            Upload to Firestore
          </button>
        </div>
      )}

      {status && <p className="status-message">{status}</p>}
    </section>
  )
}

export default AdminPage
