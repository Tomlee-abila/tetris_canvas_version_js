const grid = document.getElementById("grid");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const restartBtn = document.getElementById("restartBtn");

const width = 20;
const height = 20;
let cells = [];
let currentShape = [];
let timer = null;
let paused = false;
grid.style.gridTemplateColumns = "repeat(" + width + ", 30px)";
grid.style.gridTemplateRows = "repeat(" + height + ", 30px)";


function createGrid() {
  grid.innerHTML = "";
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.id = "cell" + ((y * width) + x);
      grid.appendChild(cell)
    }
  }
}

function colorCell(x, y, color) {
  const index = y * width + x;
  const cell = document.getElementById("cell" + index);
  if (cell) {
    cell.style.backgroundColor = color;
  }
}


createGrid();


const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20)
 
function arenaSweep(){
    outer: for (let y = arena.length -1; y > 0; y--){
        for (let x = 0; x < arena[y].length; x++){
            if (arena[y][x] === 0){
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        y++;
    }
}

let dropCounter = 0;
let dropInterval = 1000;

function collide(arena, player){
    // const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < player.matrix.length; y++){
        for (let x = 0; x < player.matrix[y].length; x++){
            if (player.matrix[y][x] !== 0 &&
                (arena[y + player.pos.y] &&
                arena[y + player.pos.y][x + player.pos.x]) !== 0){
                    return true;
            }

        }
    }
    return false;
}

function createMatrix(w, h){
    const matrix = [];
    while (h--){
        matrix.push(new Array(w). fill(0));        
    }
    return matrix;
}

function draw(){
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.clientWidth, canvas.height); 
    drawMatrix(arena, {x:0, y: 0})
    drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset){
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0){
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, 
                                y + offset.y,
                                1, 1);
            }
        })
    });
}

function merge(arena, player){
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0){
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        })
    })
}

function playerMove(dir){
    player.pos.x += dir;
    if (collide(arena, player)){
        player.pos.x -= dir;
    }
}

function rotate(matrix, dir){
    for (let y = 0; y < matrix.length; y++){
        for (let x = 0; x < y; x++){
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ]
        }
    }

    if (dir > 0){
        matrix.forEach(row => row.reverse());
    }else{
        matrix.reverse();
    }
}

function createPiece (type) {
    if (type === 'T'){
        return[
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
    }else if (type === 'O'){
        return[
            [2, 2],
            [2, 2],            
        ];
    }else if (type === 'L'){
        return[
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ];
    }else if (type === 'J'){
        return[ 
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ];
    }else if (type === 'I'){
        return[
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ];
    }else if (type === 'S'){
        return[ 
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    }else if (type === 'Z'){
        return[ 
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    }
}

function playerReset(){
    const pieces = 'ILJOTSZ'
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length/2 | 0) -
                    (player.matrix[0].length/2 | 0);
    
    if (collide(arena, player)){
        arena.forEach(row => row.fill(0))
    }
}

function playerRotate(dir){
    rotate(player.matrix, dir);    
    if (collide(arena, player)){
        rotate(player.matrix, -dir);
    }
}

function playerDrop(){
    player.pos.y++;
    if (collide(arena, player)){
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        // player.pos.y = 0;
        // player.pos.x = 5;
    }
    dropCounter = 0;
}

const colors = [
    '#333',
    "red",
    'blue',
    'violet',
    'green',
    'purple',
    'orange',
    'pink',
]

let lastTime = 0;
function update(time = 0){
    const deltaTime = time -lastTime;
    lastTime = time;
    
    dropCounter += deltaTime;
    
    if (dropCounter > dropInterval){
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

const arena = createMatrix(width, height);
console.log(arena);
console.table(arena);

const player = {
    pos: {x: 5, y: 5},
    matrix: createPiece('T')
}

document.addEventListener('keydown', event => {
    console.log(event)
    if (event.key === "ArrowLeft"){        
        playerMove(-1);
    }else if (event.key === "ArrowRight"){        
        playerMove(1);
    }else if (event.key === "ArrowDown"){
        playerDrop();
    }else if (event.key === "q"){
        playerRotate(-1);
    }else if (event.key === "w"){
        playerRotate(1);
    }
})

update();
