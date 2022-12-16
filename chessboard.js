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


function onMove(from, to) {
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


