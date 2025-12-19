const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const modeEl = document.getElementById("mode");
const diffEl = document.getElementById("difficulty");
const themeBtn = document.getElementById("themeToggle");

let board, currentPlayer, active;

let stats = JSON.parse(localStorage.getItem("stats")) || {
  X: 0, O: 0, draws: 0, last: "-"
};

const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function init() {
  board = Array(9).fill("");
  currentPlayer = "X";
  active = true;
  statusEl.textContent = "Player X turn";
  drawBoard();
  updateStats();
}

function drawBoard() {
  boardEl.innerHTML = "";
  board.forEach((_, i) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.onclick = () => makeMove(i, cell);
    boardEl.appendChild(cell);
  });
}

function makeMove(i, cell) {
  if (!active || board[i]) return;
  board[i] = currentPlayer;
  cell.textContent = currentPlayer;

  if (checkWin()) return;
  if (board.every(c => c)) {
    stats.draws++;
    stats.last = "Draw";
    endGame("It's a draw!");
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusEl.textContent = `Player ${currentPlayer} turn`;

  if (modeEl.value === "ai" && currentPlayer === "O") {
    setTimeout(aiMove, 400);
  }
}

function aiMove() {
  let move;
  if (diffEl.value === "easy") move = randomMove();
  else if (diffEl.value === "medium") move = smartMove();
  else move = minimaxMove();

  makeMove(move, boardEl.children[move]);
}

function randomMove() {
  return board.map((v,i)=>v===""?i:null).filter(i=>i!==null)
    [Math.floor(Math.random()*board.filter(v=>v==="").length)];
}

function smartMove() {
  for (let p of ["O","X"]) {
    for (let i=0;i<9;i++) {
      if (!board[i]) {
        board[i]=p;
        if (checkWinner(p)) { board[i]=""; return i; }
        board[i]="";
      }
    }
  }
  return randomMove();
}

function minimaxMove() {
  let bestScore = -Infinity, move;
  for (let i=0;i<9;i++) {
    if (!board[i]) {
      board[i]="O";
      let score = minimax(false);
      board[i]="";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(isMax) {
  if (checkWinner("O")) return 1;
  if (checkWinner("X")) return -1;
  if (board.every(c=>c)) return 0;

  let best = isMax ? -Infinity : Infinity;
  for (let i=0;i<9;i++) {
    if (!board[i]) {
      board[i]= isMax ? "O" : "X";
      let score = minimax(!isMax);
      board[i]="";
      best = isMax ? Math.max(score,best) : Math.min(score,best);
    }
  }
  return best;
}

function checkWin() {
  for (let p of wins) {
    if (p.every(i=>board[i]===currentPlayer)) {
      p.forEach(i=>boardEl.children[i].classList.add("win"));
      stats[currentPlayer]++;
      stats.last = currentPlayer;
      endGame(`${currentPlayer} wins!`);
      return true;
    }
  }
  return false;
}

function checkWinner(player) {
  return wins.some(p=>p.every(i=>board[i]===player));
}

function endGame(msg) {
  active = false;
  statusEl.textContent = msg;
  saveStats();
  updateStats();
}

function updateStats() {
  document.getElementById("xScore").textContent = stats.X;
  document.getElementById("oScore").textContent = stats.O;
  document.getElementById("draws").textContent = stats.draws;
  document.getElementById("lastWinner").textContent = stats.last;
}

function saveStats() {
  localStorage.setItem("stats", JSON.stringify(stats));
}

function restartGame() {
  init();
}

function resetStats() {
  stats = { X:0, O:0, draws:0, last:"-" };
  saveStats();
  updateStats();
}

function clearHistory() {
  resetStats();
}

themeBtn.onclick = () => {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
};

init();

