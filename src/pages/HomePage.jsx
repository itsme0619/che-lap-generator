// NEW FILE
// The first page teachers see.

import { Link } from 'react-router'

function HomePage() {
  return (
    <section>
      <h1>CHE LAP Generator</h1>
      <p>
        Make practice games and stories that match the spelling-sounds and sight
        words your SIPPS group is working on.
      </p>

      <div className="card-grid">
        <Link to="/games" className="card">
          <h2>Games</h2>
          <p>Roll and Read, Bingo, Tic Tac Toe, Ups and Downs, and Word Quiz Board.</p>
        </Link>
        <Link to="/my-games" className="card">
          <h2>My Games</h2>
          <p>Games you&apos;ve saved to play or print again.</p>
        </Link>
        <Link to="/stories" className="card">
          <h2>Stories</h2>
          <p>Short practice stories for a lesson.</p>
        </Link>
      </div>
    </section>
  )
}

export default HomePage
