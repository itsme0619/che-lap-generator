// NEW FILE
// The games, in the order they show on the Games page.
// "id" is the end of the web address: /games/roll-and-read

export const GAMES = [
  {
    id: 'roll-and-read',
    name: 'Roll and Read',
    about: 'Roll the die, read a word in that row.',
    printable: true,
  },
  {
    id: 'bingo',
    name: 'Bingo',
    about: 'Bingo cards plus a caller list.',
    printable: true,
  },
  {
    id: 'tic-tac-toe',
    name: 'Tic Tac Toe',
    about: 'Read the word to claim the square.',
    printable: true,
  },
  {
    id: 'ups-and-downs',
    name: 'Ups and Downs',
    about: 'A word on every space. Arrows send you up or down.',
    printable: true,
  },
  {
    id: 'word-quiz-board',
    name: 'Word Quiz Board',
    about: 'Categories by spelling-sound, point values, team scores.',
    printable: false,
  },
]

export function findGame(id) {
  return GAMES.find((g) => g.id === id)
}
