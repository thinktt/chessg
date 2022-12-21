import { Chessground } from './node_modules/chessground/chessground.js';
import { html } from './pageTools.js'


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
  let promotion = null
  if (isPromotion(from, to)) {
    promotion = await getUserPromotion(to)
    cg.set({ animation: { enabled: false } })
  }

  console.log(from, to, promotion)
  game.move({ from, to, promotion})
  cg.set({
    fen: game.fen(),
    check: game.in_check(),
    movable: {
      color: getTurn(game),
      dests: getLeglaMoves(game),
    },
  })

  cg.set({ animation: { enabled: true } })
}

function goBack() {
  const lastAlgebraMove = game.history().slice(-1)[0]
  console.log(lastAlgebraMove)
  if (lastAlgebraMove && lastAlgebraMove.includes('=')) {
    console.log('Howdy')
    cg.set({ animation: { enabled: false } })
  }

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

  cg.set({ animation: { enabled: true } })
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

function isPromotion(fromSquare, toSquare) {
  const squareState = game.get(fromSquare)
  if (squareState.type !== 'p') return false
  if (toSquare.includes('8') || toSquare.includes('1')) return true
  return false
}




async function getUserPromotion(toSquare) {

  const column = toSquare[0]

  const offSetMap = {
    'a' : 0,
    'b' : 12.5,
    'c' : 24.5,
    'd' : 37,
    'e' : 49.25,
    'f' : 61.75,
    'g' : 74.25,
    'h' : 86.5,
  }
  const leftOffset = offSetMap[column]

  let color = 'black'
  let queenTop = 74
  let topOffsetIncrement = -12.5
  
  if (toSquare.includes('8')) { 
    color = 'white'
    queenTop = 0
    topOffsetIncrement = 12.5
  }


  const knightTop = queenTop + topOffsetIncrement
  const roookTop = knightTop + topOffsetIncrement
  const bishopTop = roookTop + topOffsetIncrement

  const promotionChoiceEl = html`
    <div class="promotion-overlay cg-wrap">
      <square style="top:${queenTop}%; left: ${leftOffset}%">
        <piece class="queen ${color}"></piece>
      </square>
      <square style="top:${knightTop}%; left: ${leftOffset}%">
        <piece class="knight ${color}"></piece>
      </square>
      <square style="top:${roookTop}%; left: ${leftOffset}%">
        <piece class="rook ${color}"></piece>
      </square>
      <square style="top:${bishopTop}%; left: ${leftOffset}%">
        <piece class="bishop ${color}"></piece>
      </square>
    </div>
  `

  const boardContainerEl = document.querySelector('.board-container')
  boardContainerEl.insertAdjacentHTML('beforeend', promotionChoiceEl)

  return 'q'
}



function promote(square, piece) {

}