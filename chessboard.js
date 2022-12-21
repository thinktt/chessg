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
let gameHistory = []

function updateBoard() {
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


async function onMove(from, to) {
  let promotion = null
  if (isPromotion(from, to)) {
    promotion = await getUserPromotion(to)
    cg.set({ animation: { enabled: false } })
  }

  game.move({ from, to, promotion})
  gameHistory = game.history()
  window.gameHistory = gameHistory

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

function goForward() {
  const currentPosition = game.history().length
  const nextMove = gameHistory[currentPosition]
  
  console.log(currentPosition, nextMove)
  
  if (!nextMove) return
  game.move(nextMove)

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
const goForwardButton = document.querySelector('#go-forward-button')
goBackbutton.addEventListener('click', goBack)
goForwardButton.addEventListener('click', goForward)

function isPromotion(fromSquare, toSquare) {
  const squareState = game.get(fromSquare)
  if (squareState.type !== 'p') return false
  if (toSquare.includes('8') || toSquare.includes('1')) return true
  return false
}



let setPromotion = null
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
  let queenTop = 86.5
  let topOffsetIncrement = -12.5
  
  if (toSquare.includes('8')) { 
    color = 'white'
    queenTop = 0
    topOffsetIncrement = 12.5
  }

  const knightTop = queenTop + topOffsetIncrement
  const roookTop = knightTop + topOffsetIncrement
  const bishopTop = roookTop + topOffsetIncrement

  const promoChoiceHtml = html`
    <div class="promotion-overlay cg-wrap">
      <square onclick="pickPromotion('q')" style="top:${queenTop}%; left: ${leftOffset}%">
        <piece class="queen ${color}"></piece>
      </square>
      <square onclick="pickPromotion('n')" style="top:${knightTop}%; left: ${leftOffset}%">
        <piece class="knight ${color}"></piece>
      </square>
      <square onclick="pickPromotion('r')" style="top:${roookTop}%; left: ${leftOffset}%">
        <piece class="rook ${color}"></piece>
      </square>
      <square onclick="pickPromotion('b')" style="top:${bishopTop}%; left: ${leftOffset}%">
        <piece class="bishop ${color}"></piece>
      </square>
    </div>
  `

  const boardContainerEl = document.querySelector('.board-container')
  boardContainerEl.insertAdjacentHTML('beforeend', promoChoiceHtml)

  const piece = await new Promise(resolve => setPromotion = resolve)
 
  boardContainerEl.removeChild(document.querySelector('.promotion-overlay'))
  return piece
}

function pickPromotion(piece) {
  if (setPromotion) setPromotion(piece) 
  console.log('Howdy' +  piece)
} 

window.pickPromotion = pickPromotion