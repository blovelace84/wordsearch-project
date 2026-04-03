const gridSize = 15;
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

let grid = [];
let selectedCells = [];
let startCell = null;
let words = [];
let direction = null;
let foundCount = 0;
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
  foundCount = 0;

  const msg = document.getElementById("complete-message");
  msg.style.display = "none";
  msg.textContent = "";

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
    .join(", ");
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

      gridElement.appendChild(cell);
    }
  }
}

// -------------------- SELECTION LOGIC --------------------

function startSelection(e) {
  if (!e.target.classList.contains("cell")) return;

  isSelecting = true;
  selectedCells = [];
  startCell = e.target;
  direction = null;
  selectCell(e.target);
}

function continueSelection(e) {
  if (!isSelecting) return;

  const cell = getCellFromPoint(e.clientX, e.clientY);
  if (!cell) return;

  direction = getDirectionFromPointer(startCell, e.clientX, e.clientY);
  if (!direction) {
    updateSelectionPath([startCell]);
    return;
  }

  const path = getSelectionPath(startCell, cell, direction);
  updateSelectionPath(path);
}

function getDirectionFromPointer(start, clientX, clientY) {
  const rect = start.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const deltaX = clientX - centerX;
  const deltaY = clientY - centerY;

  if (deltaX === 0 && deltaY === 0) {
    return null;
  }

  const pointerLength = Math.hypot(deltaX, deltaY);
  const normalizedX = deltaX / pointerLength;
  const normalizedY = deltaY / pointerLength;

  const candidates = [
    { dr: -1, dc: -1 },
    { dr: -1, dc: 0 },
    { dr: -1, dc: 1 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
    { dr: 1, dc: -1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 }
  ];

  let bestDirection = null;
  let bestScore = -Infinity;

  candidates.forEach(candidate => {
    const length = Math.hypot(candidate.dc, candidate.dr);
    const score = normalizedX * (candidate.dc / length) + normalizedY * (candidate.dr / length);

    if (score > bestScore) {
      bestScore = score;
      bestDirection = candidate;
    }
  });

  return bestDirection;
}

function getSelectionPath(start, cell, direction) {
  const r1 = parseInt(start.dataset.row);
  const c1 = parseInt(start.dataset.col);
  const r2 = parseInt(cell.dataset.row);
  const c2 = parseInt(cell.dataset.col);
  const rowDelta = r2 - r1;
  const colDelta = c2 - c1;

  const rawSteps = (rowDelta * direction.dr + colDelta * direction.dc) /
    (Math.abs(direction.dr) + Math.abs(direction.dc));
  const steps = Math.max(0, Math.round(rawSteps));

  const path = [start];

  for (let step = 1; step <= steps; step++) {
    const row = r1 + step * direction.dr;
    const col = c1 + step * direction.dc;
    const nextCell = getCellByCoordinates(row, col);

    if (!nextCell) {
      break;
    }

    path.push(nextCell);
  }

  return path;
}

function updateSelectionPath(path) {
  selectedCells.forEach(cell => cell.classList.remove("selected"));
  selectedCells = [];

  path.forEach(selectCell);
}

function getCellByCoordinates(row, col) {
  if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
    return null;
  }

  return gridElement.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
}

function getCellFromPoint(clientX, clientY) {
  const element = document.elementFromPoint(clientX, clientY);
  return element && element.classList.contains("cell") ? element : null;
}

function endSelection() {
  if (!isSelecting) return;

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

function showCompletionMessage(){
  const msg = document.getElementById("complete-message");
  msg.textContent = "🎉 Congratulations! You found all the words!";
  msg.style.display = "block";
  console.log("Message Displayed!"); // For debugging
}

function checkWord(){
  const letters = selectedCells.map(c => c.textContent).join("");

  if(words.includes(letters)){

    //Mark grid cells
    selectedCells.forEach(c => c.classList.add("found"));

    //cross out word in list
    const wordItem = document.getElementById(`word-${letters}`);

    //Only count it once
    if(wordItem && !wordItem.classList.contains("found")){
      wordItem.classList.add("found");

      //Increase found count
      foundCount++;

      //check if puzzle is complete
      if(foundCount === words.length){
        showCompletionMessage();
        console.log("Puzzle complete!"); // For debugging
      }
    }
  }
}

// -------------------- RESET BUTTON --------------------

gridElement.addEventListener("mousemove", continueSelection);
document.addEventListener("mouseup", endSelection);
document.getElementById("reset-btn").addEventListener("click", generateGame);

// Start game
generateGame(foundCount=0);
document.getElementById("complete-message").style.display = "none";

// -------------------- LOAD WORDS --------------------
async function loadWords() {
  try{
    const response = await fetch("words.json");
    const data = await response.json();
    words = data.words
      .sort(() => Math.random() - 0.5)
      .slice(0, 20);

    generateGame();
  } catch(error){
    console.error("Error loading words:", error);
  }
}

//Load words when page starts 
loadWords();