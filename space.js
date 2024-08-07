//board
let tileSize = 32;
let rows = 25;
let columns = 25;

let board;
let boardWidth = tileSize * columns; 
let boardHeight = tileSize * rows; 
let context;

//SHIP SIZEEEE

let shipWidth = tileSize*3;
let shipHeight = tileSize*2;
let shipX = tileSize * columns/2 - tileSize;
let shipY = tileSize * rows - tileSize*2;

let ship = {
    x : shipX,
    y : shipY,
    width : shipWidth,
    height : shipHeight
}
let backgroundImg;
let shipImg;
let shipVelocityX = tileSize; 


let alienArray = [];
let alienWidth = tileSize*2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0; 
let alienspeedX = 1; 


let bulletArray = [];
let bulletspeedY = -10; 

let score = 0;
let gameOver = false;

window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); 


    backgroundImg = new Image();
    backgroundImg.src = "./background.png"
    backgroundImg.onload = function(){
        context.drawImage(backgroundImg, 0, 0, boardWidth, boardHeight );
    }

    
   
    shipImg = new Image();
    shipImg.src = "./ship.png";
    shipImg.onload = function() {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    alienImg = new Image();
    alienImg.src = "./alien.png";
    createAliens();

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        showGameOver();
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienspeedX;

            
            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienspeedX *= -1;
                alien.x += alienspeedX*2;

                
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

            if (alien.y >= ship.y) {
                gameOver = true;
            }
        }
    }

    
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletspeedY;
        context.fillStyle="white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

       
        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && CollisionDetection(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 100;
            }
        }
    }

    //clear bullets
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift(); 
    }

    //next level
    if (alienCount == 0) {
        
        score += alienColumns * alienRows * 100; 
        alienColumns = Math.min(alienColumns + 1, columns/2 -2); 
        alienRows = Math.min(alienRows + 1, rows-4);  
        if (alienspeedX > 0) {
            alienspeedX += 0.2; 
        }
        else {
            alienspeedX -= 0.2; 
        }
        alienArray = [];
        bulletArray = [];
        createAliens();
    }

    //score
    context.fillStyle="white";
    context.font="32px courier";
    context.fillText(score, 10, 35);
}

function moveShip(e) {
    if (gameOver) {
        showGameOver();
        return;
    }

    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX; 
    }
    else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX; 
    }
}

function createAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let alien = {
                img : alienImg,
                x : alienX + c*alienWidth,
                y : alienY + r*alienHeight,
                width : alienWidth,
                height : alienHeight,
                alive : true
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

function shoot(e) {
    if (gameOver) {
        
        return;
    }
//ben this is what shoots the bullets
    if (e.code == "Space") {
        
        let bullet = {
            x : ship.x + shipWidth*15/32,
            y : ship.y,
            width : tileSize/8,
            height : tileSize/2,
            used : false
        }
        bulletArray.push(bullet);
    }
}

function CollisionDetection(a, b) {
    return a.x < b.x + b.width &&  
           a.x + a.width > b.x &&  
           a.y < b.y + b.height &&  
           a.y + a.height > b.y;    
}

function repeat() {

    score = 0;
    gameOver = false;
    requestAnimationFrame(update);
}

function showGameOver(){


    context.fillStyle = "black";
    context.font = "40px Arial";
    context.fillText("YOU LOSE", 230, 175);

    context.fillStyle = "black";
    context.fillRect(10, 9, 95, 40);

    context.fillStyle = "white";
    context.font = "15px Arial";
    context.fillText("REPEAT", 28, 35);

    document.addEventListener("click",repeat);
}