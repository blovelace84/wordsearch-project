const words = ["CAT", "DOG", "BIRD", "FISH"];
const gridSize = 10;
const grid = [];
const gridElement = document.getElementById("grid");
const wordListElement = document.getElementById("word-list");
const directions = [
  { name: "horizontal-right", dr: 0, dc: 1 },
  { name: "horizontal-left", dr: 0, dc: -1 },
  { name: "vertical-down", dr: 1, dc: 0 },
  { name: "vertical-up", dr: -1, dc: 0 },
  { name: "diagonal-down-right", dr: 1, dc: 1 },
  { name: "diagonal-up-left", dr: -1, dc: -1 }
];


let selectedCells = [];

// Display word list
wordListElement.innerHTML = "<strong>Find these words:</strong> " + words.join(", ");

// Create empty grid
for (let i = 0; i < gridSize; i++) {
  grid[i] = [];
  for (let j = 0; j < gridSize; j++) {
    grid[i][j] = "";
  }
}

// Place words horizontally
words.forEach(placeWord);

// Fill empty cells with random letters
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
for (let r = 0; r < gridSize; r++) {
  for (let c = 0; c < gridSize; c++) {
    if (grid[r][c] === "") {
      grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }
}

// Render grid
for (let r = 0; r < gridSize; r++) {
  for (let c = 0; c < gridSize; c++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.textContent = grid[r][c];
    cell.dataset.row = r;
    cell.dataset.col = c;

    cell.addEventListener("mousedown", startSelection);
    cell.addEventListener("mouseover", continueSelection);
    cell.addEventListener("mouseup", endSelection);

    gridElement.appendChild(cell);
  }
}

let isSelecting = false;

function startSelection(e) {
  isSelecting = true;
  selectedCells = [];
  selectCell(e.target);
}

function continueSelection(e) {
  if (isSelecting) {
    selectCell(e.target);
  }
}

function endSelection() {
  isSelecting = false;
  checkWord();
  clearSelection();
}

function selectCell(cell) {
  if (!selectedCells.includes(cell)) {
    selectedCells.push(cell);
    cell.classList.add("selected");
  }
}

function clearSelection() {
  selectedCells.forEach(cell => cell.classList.remove("selected"));
  selectedCells = [];
}

function checkWord() {
  const letters = selectedCells.map(c => c.textContent).join("");

  if (words.includes(letters)) {
    selectedCells.forEach(c => c.classList.add("found"));
  }
}


function placeWord(word) {
    let placed = false;
    while(!placed) {
        const dir = directions[Math.floor(Math.random() * directions.length)];

        //compute valid starting bounds
        const maxRow = dir.dr === 1 ? gridSize - word.length : dir.dr === -1 ? word.length - 1 : gridSize - 1;
        const maxCol = dir.dc === 1 ? gridSize - word.length : dir.dc === -1 ? word.length - 1 : gridSize - 1;

        const row = Math.floor(Math.random() * (maxRow + 1));
        const col = Math.floor(Math.random() * (maxCol + 1));

        if(canPlace(word, row, col, dir)){
            writeWord(word, row, col, dir);
            placed = true;
        }
    }
}

function canPlace(word, row, col, dir) {
  for (let i = 0; i < word.length; i++) {
    const r = row + i * dir.dr;
    const c = col + i * dir.dc;

    if (grid[r][c] !== "" && grid[r][c] !== word[i]) {
      return false;
    }
  }
  return true;
}

function writeWord(word, row, col, dir) {
  for (let i = 0; i < word.length; i++) {
    const r = row + i * dir.dr;
    const c = col + i * dir.dc;
    grid[r][c] = word[i];
  }
}
