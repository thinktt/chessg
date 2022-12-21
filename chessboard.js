import { Chessground } from './node_modules/chessground/chessground.js';


const game = new Chess()
const config = {
  orientation: 'white',  
  turnColor: 'white',
  // viewOnly: true,
  movable: {
    free: false,
    color: 'white',
    dests: getLeglaMoves(game),
    showDests: false,
    events: {
      after: onMove
    }

  },
  premovable: {
    enabled: false,
    showDests: true,
  },
  drawable: {
    enabled: false,
  },
}

const cg = Chessground(document.getElementById('chessground'), config);
window.cg = cg
window.game = game


async function onMove(from, to) {
  console.log(from, to)
  game.move({ from, to })
  cg.set({
    check: game.in_check(),
    movable: {
      color: getTurn(game),
      dests: getLeglaMoves(game),
    }
  })
}

function goBack() {
  game.undo()
  const lastMove = getLastMove(game)
  cg.set({ 
    fen: game.fen(),
    check: game.in_check(),
    movable: {
      color: getTurn(game),
      dests: getLeglaMoves(game),
    },
    turnColor: getTurn(game),
    lastMove,
  })
}


function getLeglaMoves(game)  {
  const dests = new Map();
  game.SQUARES.forEach(s => {
    const ms = game.moves({square: s, verbose: true});
    if (ms.length) dests.set(s, ms.map(m => m.to));
  });
  return dests;
}

function getTurn(game) {
  return (game.turn() === 'w') ? 'white' : 'black';
}

function getLastMove(game) {
  const moves = game.history({ verbose: true })
  const lastMove = moves.length ? moves.pop() : null
  if (!lastMove) return null

  const { from, to } = lastMove 
  return [ from, to ]
}

const goBackbutton = document.querySelector('#go-back-button')
goBackbutton.addEventListener('click', goBack)


const promotionChoiceEl = `
 <div id="promotion-choice" class="bottom">
  <square style="top: 87.5%;left: 62.5%">
    <piece class="queen white"></piece>
  </square>
  <square style="top: 75%;left: 62.5%">
    <piece class="knight white"></piece>
  </square>
  <square style="top: 62.5%;left: 62.5%">
    <piece class="rook white"></piece>
  </square>
  <square style="top: 50%;left: 62.5%">
    <piece class="bishop white"></piece>
  </square></div>
`