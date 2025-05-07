const score = document.querySelector(".score");
const lives = document.querySelector(".lives")
const timer = document.querySelector(".timer");
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

const arena = createMatrix(main_grid.width, main_grid.height);

function updateLives(num){
    lives.innerHTML = '<div class="heart"></div>'.repeat(num);
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
    const cell = gr.grid.children[index];
    if (cell) {
        if (cell.style.background !== color) {
            cell.style.background = color;
        }
    }
}

function drawMatrix(matrix, offset, gr, all = false){
  matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (!all){
            if (value != 0){
                colorCell(x + offset.x, y + offset.y, colors[value], gr);
            }
        }else{
            colorCell(x + offset.x, y + offset.y, colors[value], gr);
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
        game.score += game.add;
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

function clear_grid(gr){
  for (let y = 0; y < gr.height; y++){
    for (let x = 0; x < gr.width; x++){
      colorCell(x, y, colors[0], gr);
    }
  }
}

function draw(){    
    merge(game.arena, player);
    drawMatrix(game.arena, {x:0, y: 0}, main_grid, true);
    clear_grid(next_grid);
    drawMatrix(next_grid.matrix, {x: 1, y: 1}, next_grid)
    game.arena = structuredClone(arena);
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


function playerReset(){
    player.matrix = next_grid.matrix    
    next_grid.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length/2 | 0) - (player.matrix[0].length/2 | 0);    
    
    if (collide(arena, player)) {       
        if (game.lives == 1){
            game.pause = true;
            showGameOverPopup();
        }else{
            if (game.lives > 0){
                game.lives--
            }

            restart();
        }        
    }
}

function showGameOverPopup() {
    if (game.over){
        return;
    }

    const gameOverPopup = document.getElementById('gameOverPopup');
    const finalScoreSpan = document.getElementById('finalScore');
    gameOverPopup.style.display = 'flex';

    let currentScore = 0;
    let duration = 1000;
    const startTime = performance.now();

    function animateScore(time) {
        const elapsed = time - startTime;
        currentScore = Math.min(Math.floor((elapsed / duration) * game.score), game.score);
        finalScoreSpan.textContent = currentScore;

        if (currentScore < game.score) {
            requestAnimationFrame(animateScore);
        } else {
            game.over = true;
        }
    }

    requestAnimationFrame(animateScore);
}


function playerRotate(dir) {
    const pos = player.pos.x;
    rotate(player.matrix, dir);
    let offset = 1;

    while (collide(arena, player)) {
        if (offset > 0) {
            player.pos.x = pos + ++offset;
            if (offset === 3 && collide(arena, player)) {
                player.pos.x = pos;
                offset = -1;
            }
        } else {
            player.pos.x = pos + offset--;
            if (offset === -3 && collide(arena, player)) {
                player.pos.x = pos;
                rotate(player.matrix, -dir);
                break;
            }
        }
    }
}

function pauseGame() {
    if (!game.over && !game.pause) {
        game.pause = true;
        document.getElementById('pausePopup').style.display = 'flex';
    }
}

function resumeGame() {
    if (!game.over && game.pause) {
        game.pause = false;
        document.getElementById('pausePopup').style.display = 'none';
        lastTime = performance.now(); // Prevent large deltaTime
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
    'linear-gradient(45deg, #ff4040,rgb(255, 255, 255))', 
    'linear-gradient(45deg, #4040ff,rgb(255, 255, 255))', 
    'linear-gradient(45deg, #ff00ff,rgb(255, 255, 255))', 
    'linear-gradient(45deg, #00cc00,rgb(252, 252, 252))', 
    'linear-gradient(45deg, #00ffff,rgb(255, 255, 255))', 
    'linear-gradient(45deg, #ff9900,rgb(253, 253, 253))', 
    'linear-gradient(45deg, #ff69b4,rgb(255, 255, 255))', 
];

let lastTime = 0;

let dropCounter = 0;
let dropInterval = 1000;

const game = {
    pause: false,
    score: 0,
    over: false,
    lives: 3,
    add: 5,
    time: 0,
    currentScore: 0,
    arena: structuredClone(arena),
};

updateLives(game.lives);

function update(time = 0){
    const deltaTime = time -lastTime;
    lastTime = time;
    
    dropCounter += deltaTime;     
       
    if (!game.pause && !game.over){
        if (game.score != game.currentScore){
            score.innerHTML = game.score
            game.currentScore = game.score;
        }                

        if (dropCounter >= 1000){
            game.time += Math.floor(dropCounter/1000);
            timer.innerHTML = `${game.time}`;
        }

        if (dropCounter >= dropInterval){        
            playerDrop();
            lastTime = time
            
        } 
        draw();
    }     
    requestAnimationFrame(update);
}

function restart() {
    arena.forEach(row => row.fill(0));
    player.pos = {
        x: (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0),
        y: 0
    };

    if (game.over == true){
        game.score = 0;
        game.lives = 3
        updateLives(game.lives);
    }    

    game.pause = false;
    
    game.over = false;
    game.time = 0;
    score.innerHTML = 0;

    updateLives(game.lives);

    document.getElementById('gameOverPopup').style.display = 'none';

    playerReset();

    draw();
}


const player = {
    pos: {x: (arena[0].length/2 | 0), y: 0},
    matrix: next_grid.matrix
}
player.pos.x = (arena[0].length/2 | 0) - (player.matrix[0].length/2 | 0);


document.addEventListener('keydown', event => {
    if (event.key === "ArrowLeft" && !game.pause){        
        playerMove(-1);
    }else if (event.key === "ArrowRight" && !game.pause){        
        playerMove(1);
    }else if (event.key === "ArrowDown" && !game.pause){
        playerDrop();
    }else if (event.key === "r"){
        restart();
    }else if (event.key === "p"){
        pauseGame();
    }else if (event.key === "ArrowUp" && !game.pause){
        playerRotate(1);
    }
})

pauseBtn.addEventListener('click', pauseGame);
resumeBtn.addEventListener('click', resumeGame);
restartBtn.addEventListener('click', restart);

update();