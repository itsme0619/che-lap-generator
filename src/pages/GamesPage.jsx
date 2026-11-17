// Lists the games. Each card opens that game's page. // NEW: cards are now links

import { Link } from 'react-router' // NEW
import { GAMES } from '../games/gameList.js' // NEW: the list moved to its own file

function GamesPage() {
  return (
    <section>
      <h1>Games</h1>
      <p>Pick a game. You&apos;ll choose the level and lessons next.</p>

      <div className="card-grid">
        {GAMES.map((game) => (
          <Link key={game.id} to={`/games/${game.id}`} className="card"> {/* NEW */}
            <h2>{game.name}</h2>
            <p>{game.about}</p>
            <p className="card-note">{game.printable ? 'On screen or print' : 'On screen only'}</p> {/* NEW */}
          </Link>
        ))}
      </div>
    </section>
  )
}

export default GamesPage
