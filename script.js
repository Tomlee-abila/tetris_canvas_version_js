const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const restartBtn = document.getElementById("restartBtn");
const pieces = 'ILJOTSZ';


const main_grid = {
    width: 10,
    height: 20,
    cell: "#grid #cell",
    grid: document.getElementById("grid"),
};

const next_grid = {
    width: 5,
    height: 5,
    cell: "#next #cell",
    grid: document.getElementById("next"),
    matrix: createPiece(pieces[pieces.length * Math.random() | 0]),
}



function createGrid(gr) {
  gr.grid.innerHTML = "";  
  gr.grid.style.gridTemplateColumns = "repeat(" + gr.width + ", 30px)";
  gr.grid.style.gridTemplateRows = "repeat(" + gr.height + ", 30px)";

  for (let y = 0; y < gr.height; y++) {
    for (let x = 0; x < gr.width; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.id = "cell" + ((y * gr.width) + x);
      gr.grid.appendChild(cell)
    }
  }
}

createGrid(main_grid);
createGrid(next_grid);


function colorCell(x, y, color, gr) {
  const index = y * gr.width + x;
  const cell = document.querySelector(gr.cell + index);   
  if (cell) {
    if (cell.style.backgroundColor !== color){
      cell.style.backgroundColor = color;
    }
  }
}

function drawMatrix(matrix, offset){
  matrix.forEach((row, y) => {
      row.forEach((value, x) => {
          if (value !== 0){
              colorCell(x + offset.x, y + offset.y, colors[value])
          }
      })
  });
}
 
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



function collide(arena, player){
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

function clear_grid(){
  for (let y = 0; y < height; y++){
    for (let x = 0; x < width; x++){
      colorCell(x, y, colors[0]);
    }
  }
}

function draw(){
    clear_grid();
    drawMatrix(arena, {x:0, y: 0})
    drawMatrix(player.matrix, player.pos);
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
            [1, 1, 1],
            [0, 1, 0],
            [0, 0, 0],
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

const pieces = 'ILJOTSZ';

function playerReset(){    
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length/2 | 0) -
                    (player.matrix[0].length/2 | 0);
    
    if (collide(arena, player)){
        game.over = true;
        // game.pause = true;
        restart();
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

let dropCounter = 0;
let dropInterval = 1000;

function update(time = 0){
    const deltaTime = time -lastTime;
    lastTime = time;
    
    dropCounter += deltaTime;
    
    if (dropCounter >= dropInterval && !game.pause){
        playerDrop();
        lastTime = time
    }
    draw();
    requestAnimationFrame(update);
}

const arena = createMatrix(width, height);
console.log(arena);
console.table(arena);

const game = {
    pause: false,
    score: 0,
    over: false,
};

function restart(){
    arena.forEach(row => row.fill(0));
    player.pos = {x: (arena[0].length/2 | 0) - (player.matrix[0].length/2 | 0), y: 0};

    game = {
        pause: false,
        score: 0,
        over: false,
    };
}

const player = {
    pos: {x: (arena[0].length/2 | 0), y: 0},
    matrix: createPiece(pieces[pieces.length * Math.random() | 0])
}
player.pos.x = (arena[0].length/2 | 0) - (player.matrix[0].length/2 | 0);


document.addEventListener('keydown', event => {
    console.log(event)
    if (event.key === "ArrowLeft" && !game.pause){        
        playerMove(-1);
    }else if (event.key === "ArrowRight" && !game.pause){        
        playerMove(1);
    }else if (event.key === "ArrowDown" && !game.pause){
        playerDrop();
    }else if (event.key === "r"){
        restart()
    }else if (event.key === "p"){
        game.pause = !game.pause
    }else if (event.key === "ArrowUp" && !game.pause){
        playerRotate(1);
    }
})

update();
