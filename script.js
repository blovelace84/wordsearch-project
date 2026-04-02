const words = [
  "CAT","DOG","BIRD","FISH","HORSE","MOUSE","SNAKE","TIGER","LION","BEAR",
  "EAGLE","SHARK","WHALE","ZEBRA","SHEEP","GOAT","FROG","DUCK","OTTER","PANDA"
];

const gridSize = 15;
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

let grid = [];
let selectedCells = [];
let isSelecting = false;
let foundWords = new Set();

const gridElement = document.getElementById("grid");
const wordListElement = document.getElementById("word-list");

// Directions including reverse
const directions = [
  { name: "horizontal-right", dr: 0, dc: 1 },
  { name: "horizontal-left", dr: 0, dc: -1 },
  { name: "vertical-down", dr: 1, dc: 0 },
  { name: "vertical-up", dr: -1, dc: 0 },
  { name: "diagonal-down-right", dr: 1, dc: 1 },
  { name: "diagonal-up-left", dr: -1, dc: -1 }
];

// -------------------- GAME GENERATION --------------------

function generateGame() {
  gridElement.innerHTML = "";
  selectedCells = [];
  foundWords.clear();

  // Reset grid
  grid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => "")
  );

  // Place words
  words.forEach(placeWord);

  // Fill empty cells
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  // Render
  renderGrid();

  // Update word list
  wordListElement.innerHTML = words
    .map(w => `<span id="word-${w}" class="word-item">${w}</span>`)
    .join(" ");
}

function placeWord(word) {
  let placed = false;
  let attempts = 0;

  while (!placed && attempts < 500) {
    attempts++;
    const dir = directions[Math.floor(Math.random() * directions.length)];

    const minRow = dir.dr === -1 ? word.length - 1 : 0;
    const maxRow = dir.dr === 1 ? gridSize - word.length : gridSize - 1;
    const minCol = dir.dc === -1 ? word.length - 1 : 0;
    const maxCol = dir.dc === 1 ? gridSize - word.length : gridSize - 1;

    const row = Math.floor(Math.random() * (maxRow - minRow + 1)) + minRow;
    const col = Math.floor(Math.random() * (maxCol - minCol + 1)) + minCol;

    if (canPlace(word, row, col, dir)) {
      writeWord(word, row, col, dir);
      placed = true;
    }
  }
}

function canPlace(word, row, col, dir) {
  for (let i = 0; i < word.length; i++) {
    const r = row + i * dir.dr;
    const c = col + i * dir.dc;

    if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) {
      return false;
    }

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

// -------------------- RENDERING --------------------

function renderGrid() {
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
}

// -------------------- SELECTION LOGIC --------------------

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

function checkWord(){
  const letters = selectedCells.map(c => c.textContent).join("");
  const reversedLetters = letters.split("").reverse().join("");
  const matchedWord = words.includes(letters)
    ? letters
    : words.includes(reversedLetters)
      ? reversedLetters
      : null;

  if (matchedWord && !foundWords.has(matchedWord)) {
    foundWords.add(matchedWord);
    //Mark grid cells to indicate found word
    selectedCells.forEach(c => c.classList.add("found"));

    //cross out word in list
    const wordItem = document.getElementById(`word-${matchedWord}`);
    if(wordItem){
      wordItem.classList.add("found");
    }
  }
}

// -------------------- RESET BUTTON --------------------

document.getElementById("reset-btn").addEventListener("click", generateGame);

// Start game
generateGame();
