const words = ["CAT", "DOG", "BIRD", "FISH"];
const gridSize = 10;
const grid = [];
const gridElement = document.getElementById("grid");
const wordListElement = document.getElementById("word-list");

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
words.forEach(word => {
  let row = Math.floor(Math.random() * gridSize);
  let startCol = Math.floor(Math.random() * (gridSize - word.length));

  for (let i = 0; i < word.length; i++) {
    grid[row][startCol + i] = word[i];
  }
});

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
