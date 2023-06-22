import { Chessground } from './node_modules/chessground/chessground.js';
import { html } from './pageTools.js'

// fetch with authorization token
// const url = 'http://yowking.yeoldwizard.com'
const url = 'http://localhost:8080'
const lichessToken = localStorage.getItem('lichessToken')
let yowKingToken = null
const players = [
  'Fischer', 'Karpov', 'Tal', 'Morphy', 'Alekhine', 'Anand', 
  'Andressen', 'Blackburne', 'Kramnik', 'Capablanca', 'Botvinnik', 'Spassky',
  'Petrosian', 'Marshall', 'Lasker', 'Steinitz', 'Euwe', 'Polgar',
  'Evans', 'Wizard'
]

const template = document.querySelector('#my-template')
const tournamentRoom = document.querySelector('#tournament-room')
let boardNumber = 1
let boards = []
for (let i = 0; i < players.length; i=i+2) {
  const clone = document.importNode(template.content, true)
  const whitePlayer = players[i]
  const blackPlayer = players[i + 1]
  const label = `Board ${boardNumber}: ${whitePlayer} vs ${blackPlayer}`
  clone.querySelector('p').textContent = label
  clone.querySelector('.board-container').id = `board${boardNumber}`
  tournamentRoom.appendChild(clone)

  const board = setupChessBoard(`board${boardNumber}`, whitePlayer, blackPlayer)
  boards.push(board)
  boardNumber++
}

// Optionally, modify the clone - here we'll change the paragraph text





// const board1 = setupChessBoard('board1', 'Fischer', 'Karpov')
// const board2 = setupChessBoard('board2', 'Tal', 'Morphy')

// window.board1 = board1
// window.board2 = board2

await doAuthFlow()
// playGame(board1)
// playGame(board2)

async function doAuthFlow() {
  let err = null
  const res = await fetch(`${url}/token`, {
    headers: {
      'Authorization': 'Bearer ' + lichessToken
    }
  }).catch(e => err = e)
  
  if (err) {
    console.log('error', err)
    return
  }
  const data = await res.json()
  
  if (res.status !== 200) {
    console.log(data.error)
    return
  }

  yowKingToken = data.token
}

async function playGame(board) {
  const { whitePlayer, blackPlayer } = board

  const moves = []
  let move = ''
  
  let err = null
  let player = whitePlayer

  while(err === null) {
    move = await getMove(player, moves).catch(e => err = e)
    if (err) {
      console.log('error', err)
      continue
    }
    moves.push(move)
    board.makeMove(move)
    player = player === whitePlayer ? blackPlayer : whitePlayer
  }
}


async function getMove(cmpName, moves) {
  let err = null
  const res = await fetch(`${url}/move-req`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + yowKingToken
    },
    body: JSON.stringify({ cmpName, moves })
  }).catch(e => err = e)
  if (err) {
    throw err
  }

  const data = await res.json()

  if (res.status !== 200) {
    throw new Error(data.error)
  }

  const move = data.coordinateMove

  if (!move) {
    throw new Error('no move')
  }

  return move
}

function setupChessBoard(id, whitePlayer, blackPlayer) {
  console.log(`Setting up board ${id} for ${whitePlayer} vs ${blackPlayer}`)
  const el = document.getElementById(id)
  const game = new Chess()

  const cg = Chessground(document.getElementById(id), {
    orientation: 'white',  
    turnColor: 'white',
    // viewOnly: true,
    movable: {
      free: false,
      color: 'white',
      dests: getLeglaMoves(game),
      showDests: false,
      events: {
        // after: onMove
      }

    },
    premovable: {
      enabled: false,
      showDests: true,
    },
    drawable: {
      enabled: false,
    },
  })

  const makeMove = (move) => {
    makeGameMove(move, game)
    updateBoard(game, cg)
  }
  
  return {id, whitePlayer, blackPlayer, cg, game, makeMove}
}

function makeGameMove(move, game) {
  // divide move into from, to, and promotion
  const from = move.slice(0, 2)
  const to = move.slice(2, 4)
  const promotion = move.slice(4, 5)
  game.move({ from, to, promotion})
  // gameHistory = game.history()
}

function updateBoard(game, cg) {
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
  return dests
}


function getLastMove(game) {
  window.game = game
  const moves = game.history({ verbose: true })
  const lastMove = moves.length ? moves.pop() : null
  if (!lastMove) return null

  const { from, to } = lastMove 
  return [ from, to ]
}

function getTurn(game) {
  return (game.turn() === 'w') ? 'white' : 'black';
}



// async function onMove(from, to) {
//   let promotion = null
//   if (isPromotion(from, to)) {
//     promotion = await getUserPromotion(to)
//     cg.set({ animation: { enabled: false } })
//   }
 
//   game.move({ from, to, promotion})
//   gameHistory = game.history()
//   window.gameHistory = gameHistory
//   updateBoard()
//   renderPgnView()
// }

// function goStart() {
//   console.log('go to start')
//   game.reset()
//   updateBoard()
//   renderPgnView()
// }

// function goEnd() {
//   for (const move of gameHistory) {
//     game.move(move) 
//   }
//   updateBoard()
//   renderPgnView()
// }

// function goBack() {
//   const lastAlgebraMove = game.history().slice(-1)[0]
//   if (lastAlgebraMove && lastAlgebraMove.includes('=')) {
//     cg.set({ animation: { enabled: false } })
//   }

//   game.undo()
//   const lastMove = getLastMove(game)
//   updateBoard()
//   renderPgnView()
// }

// function goForward() {
//   const currentPosition = game.history().length
//   const nextMove = gameHistory[currentPosition]
//   if (nextMove && nextMove.includes('=')) { 
//     cg.set({ animation: { enabled: false } })
//   }
  
//   if (!nextMove) return
//   game.move(nextMove)
//   updateBoard()
//   renderPgnView()
// }


// const goBackbutton = document.querySelector('#go-back-button')
// const goForwardButton = document.querySelector('#go-forward-button')
// const goStartButton = document.querySelector('#go-start-button')
// const goEnddButton = document.querySelector('#go-end-button')
// goStartButton.addEventListener('click', goStart)
// goBackbutton.addEventListener('click', goBack)
// goForwardButton.addEventListener('click', goForward)
// goEnddButton.addEventListener('click', goEnd)

// function isPromotion(fromSquare, toSquare) {
//   const squareState = game.get(fromSquare)
//   if (squareState.type !== 'p') return false
//   if (toSquare.includes('8') || toSquare.includes('1')) return true
//   return false
// }


// let setPromotion = null
// async function getUserPromotion(toSquare) {
//   const column = toSquare[0]
//   const offSetMap = {
//     'a' : 0,
//     'b' : 12.5,
//     'c' : 24.5,
//     'd' : 37,
//     'e' : 49.25,
//     'f' : 61.75,
//     'g' : 74.25,
//     'h' : 86.5,
//   }
//   const leftOffset = offSetMap[column]

//   let color = 'black'
//   let queenTop = 86.5
//   let topOffsetIncrement = -12.5
  
//   if (toSquare.includes('8')) { 
//     color = 'white'
//     queenTop = 0
//     topOffsetIncrement = 12.5
//   }

//   const knightTop = queenTop + topOffsetIncrement
//   const roookTop = knightTop + topOffsetIncrement
//   const bishopTop = roookTop + topOffsetIncrement

//   const promoChoiceHtml = html`
//     <div class="promotion-overlay cg-wrap">
//       <square onclick="pickPromotion('q')" style="top:${queenTop}%; left: ${leftOffset}%">
//         <piece class="queen ${color}"></piece>
//       </square>
//       <square onclick="pickPromotion('n')" style="top:${knightTop}%; left: ${leftOffset}%">
//         <piece class="knight ${color}"></piece>
//       </square>
//       <square onclick="pickPromotion('r')" style="top:${roookTop}%; left: ${leftOffset}%">
//         <piece class="rook ${color}"></piece>
//       </square>
//       <square onclick="pickPromotion('b')" style="top:${bishopTop}%; left: ${leftOffset}%">
//         <piece class="bishop ${color}"></piece>
//       </square>
//     </div>
//   `

//   const boardContainerEl = document.querySelector('.board-container')
//   boardContainerEl.insertAdjacentHTML('beforeend', promoChoiceHtml)

//   const piece = await new Promise(resolve => setPromotion = resolve)
 
//   boardContainerEl.removeChild(document.querySelector('.promotion-overlay'))
//   return piece
// }



// function pickPromotion(piece) {
//   if (setPromotion) setPromotion(piece) 
// } 

// window.pickPromotion = pickPromotion