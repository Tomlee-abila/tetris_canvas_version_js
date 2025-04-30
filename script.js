const grid = document.getElementById("grid");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const restartBtn = document.getElementById("restartBtn");

const width = 10;
const height = 20;
let cells = [];
let currentShape = [];
let timer = null;
let paused = false;

function createGrid() {
  grid.innerHTML = "";
  cells = [];
  for (let i = 0; i < width * height; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    grid.appendChild(cell);
    cells.push(cell);
  }
}

const shapes = {
  L: [0, width, width * 2, width * 2 + 1],
  Z: [0, 1, width + 1, width + 2],
  T: [1, width, width + 1, width + 2],
  O: [0, 1, width, width + 1],
  I: [0, width, width * 2, width * 3]
};

let shapeKeys = Object.keys(shapes);
let currentPosition = 4;
let currentType = "";

function draw() {
  currentShape.forEach(index => {
    cells[currentPosition + index].classList.add("active");
  });
}

function undraw() {
  currentShape.forEach(index => {
    cells[currentPosition + index].classList.remove("active");
  });
}

function moveDown() {
  if (paused) return;

  undraw();
  currentPosition += width;

  if (isCollision()) {
    currentPosition -= width;
    draw();
    freeze();
    spawnShape();
    return;
  }

  draw();
}

function isCollision() {
  return currentShape.some(index => {
    const pos = currentPosition + index;
    const below = pos + width;
    return below >= width * height || cells[below].classList.contains("taken");
  });
}

function freeze() {
  currentShape.forEach(index =>
    cells[currentPosition + index].classList.add("taken")
  );
  clearLines();
}

function spawnShape() {
  currentPosition = 4;
  currentType = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
  currentShape = shapes[currentType];

  if (currentShape.some(i => cells[currentPosition + i].classList.contains("taken"))) {
    alert("Game Over");
    clearInterval(timer);
  }

  draw();
}

function clearLines() {
  for (let row = 0; row < height; row++) {
    const start = row * width;
    const rowCells = cells.slice(start, start + width);
    if (rowCells.every(cell => cell.classList.contains("taken"))) {
      for (let i = start; i < start + width; i++) {
        cells[i].classList.remove("taken", "active");
      }

      const removed = cells.splice(start, width);
      cells = removed.concat(cells);

      cells.forEach(cell => grid.appendChild(cell));
    }
  }
}

function control(e) {
  if (paused) return;

  if (e.key === "ArrowLeft") move(-1);
  else if (e.key === "ArrowRight") move(1);
  else if (e.key === "ArrowDown") moveDown();
  else if (e.key === "ArrowUp") rotate();
  else if (e.key.toLowerCase() === "p") pauseGame();
  else if (e.key.toLowerCase() === "r") restartGame();
}

function move(dir) {
  undraw();
  const newPos = currentPosition + dir;

  if (
    currentShape.every(index => {
      const newIndex = newPos + index;
      const col = newIndex % width;
      return (
        col >= 0 &&
        col < width &&
        !cells[newIndex].classList.contains("taken")
      );
    })
  ) {
    currentPosition = newPos;
  }

  draw();
}

function rotate() {
  undraw();
  currentShape = currentShape.map(i => {
    const x = i % width;
    const y = Math.floor(i / width);
    return x * width - y + 1;
  });

  if (currentShape.some(i => currentPosition + i >= width * height)) {
    currentShape = shapes[currentType]; // revert
  }

  draw();
}

function pauseGame() {
  paused = true;
  clearInterval(timer);
}

function resumeGame() {
  paused = false;
  timer = setInterval(moveDown, 500);
}

function restartGame() {
  clearInterval(timer);
  createGrid();
  spawnShape();
  timer = setInterval(moveDown, 500);
  paused = false;
}

pauseBtn.onclick = pauseGame;
resumeBtn.onclick = resumeGame;
restartBtn.onclick = restartGame;

document.addEventListener("keydown", control);

createGrid();
spawnShape();
timer = setInterval(moveDown, 500);
