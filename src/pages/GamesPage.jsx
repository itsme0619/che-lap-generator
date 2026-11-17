// NEW FILE
// Lists the games. Each one becomes a real link when we build it (Stages 6-10).

const games = [
  {
    name: 'Roll and Read',
    about: 'Roll the die, read a word in that row.',
    howToUse: 'On screen or print',
  },
  {
    name: 'Bingo',
    about: 'Cards with a free space, plus a caller list.',
    howToUse: 'On screen or print',
  },
  {
    name: 'Tic Tac Toe',
    about: 'Read the word to claim the square.',
    howToUse: 'On screen or print',
  },
  {
    name: 'Ups and Downs',
    about: 'A word on every space. Arrows send you up or down.',
    howToUse: 'On screen or print',
  },
  {
    name: 'Word Quiz Board',
    about: 'Categories by spelling-sound, point values, team scores.',
    howToUse: 'On screen only',
  },
]

function GamesPage() {
  return (
    <section>
      <h1>Games</h1>
      <p>Pick a game. You&apos;ll choose the level and lesson next.</p>

      <div className="card-grid">
        {games.map((game) => (
          <div key={game.name} className="card card-disabled">
            <h2>{game.name}</h2>
            <p>{game.about}</p>
            <p className="card-note">{game.howToUse} · Coming soon</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default GamesPage
