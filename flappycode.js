let board;
let boardWidth = 700;
let boardHeight = 320;
let context;

let birdWidth = 32;
let birdHeight = 28;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdimg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight,
};

let pipeWidth = 75;
let pipeHeight = 510;
let pipeGap = 100;
let pipeArray = [];
let pipeSpawnInterval = 2000;
let pipeSpeed = -2;

let topPipeImg;
let bottomPipeImg;

let velocityX = 0;
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;

window.onload = function () {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    birdimg = new Image();
    birdimg.src = "marioimg.png";
    birdimg.onload = function () {
        context.drawImage(birdimg, bird.x, bird.y, bird.width, bird.height);
    };

    topPipeImg = new Image();
    topPipeImg.src = "luckyblock.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "luckyblock.png";

  

    requestAnimationFrame(update);
    setInterval(spawnPipes, pipeSpawnInterval);
};

function update() {
    if (gameOver) return;

    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);

    bird.y += velocityY;
    if (bird.y > board.height + 40) {
        bird.x = boardWidth / 8;
        bird.y = boardHeight / 2;
        velocityY = 0;
        gravity = 0;
        showGameOver();
        return;
    }

    if (bird.y < 0) {
        bird.y = 0;
    }
    velocityY += gravity;

    context.drawImage(birdimg, bird.x, bird.y, bird.width, bird.height);

    context.fillStyle = "black";
    context.font = "25px Arial";
    context.fillText("Score: " + score, 10, 30);

    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += pipeSpeed;

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            pipe.passed = true;
            score++;

        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
            showGameOver();
            return;
        }

        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
    }

    pipeArray = pipeArray.filter(pipe => pipe.x + pipe.width > 0);
}

document.addEventListener("keydown", function (e) {
    if (e.key === " ") {
        velocityY = -5;
    }
});

function spawnPipes() {
    let pipeY = Math.random() * (boardHeight - pipeGap - 200) + 70;
    let topPipe = {
        x: boardWidth,
        y: pipeY - pipeHeight,
        width: pipeWidth,
        height: pipeHeight,
        img: topPipeImg,
        passed: false
    };
    let bottomPipe = {
        x: boardWidth,
        y: pipeY + pipeGap,
        width: pipeWidth,
        height: pipeHeight,
        img: bottomPipeImg,
        passed: false
    };
    pipeArray.push(topPipe, bottomPipe);
}

function detectCollision(bird, pipe) {
    return bird.x < pipe.x + pipe.width &&
        bird.x + bird.width > pipe.x &&
        bird.y < pipe.y + pipe.height &&
        bird.y + bird.height > pipe.y;
}

function showGameOver() {
    context.clearRect(0, 0, board.width, board.height);
    context.drawImage(birdimg, bird.x, bird.y, bird.width, bird.height);
    gameOver = true;

    context.globalAlpha = 0.5;
    context.fillStyle = "rgba(0, 0, 0, 0.5)";
    context.fillRect(0, 0, 900, 600);
    context.globalAlpha = 1.0;

    context.fillStyle = "black";
    context.font = "40px Arial";
    context.fillText("YOU LOSE", 230, 175);

    context.fillStyle = "black"; 
    context.fillRect(10, 9, 95, 40);

    context.fillStyle = "white";
    context.font = "15px Arial";
    context.fillText("REPEAT", 28, 35);

    document.removeEventListener("click",repeat);
    document.addEventListener("click",repeat);

    
}

function repeat() {
    birdX = boardWidth / 8;
    birdY = boardHeight / 2;


    velocityX = 0;
    velocityY = 0;
    gravity = 0.4;
    
    pipeArray = [];
    score = 0;
    gameOver = false;
    requestAnimationFrame(update);
}
