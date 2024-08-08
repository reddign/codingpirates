// Important inits
const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
let FPS = 60;

//#region Player init
let playerx = 350;
let playery = 600;
let playerspeed = 5;
let focusSpeed = playerspeed / 2.5;

let playerhp = 5;
let playerhitboxsize = 4;

let psloaded = false;
const playersprite = new Image();
playersprite.addEventListener("load", () => {
    psloaded = true;
});
playersprite.src = "player.png";
//#endregion

//#region Enemy init
let enemyloaded = false;
const enemysprite = new Image();
enemysprite.addEventListener("load", () => {
    enemyloaded = true;
});
enemysprite.src = "boss1.png";

let enemyhp = 500;
const enemyhpmax = 500;
let enemyx = 150;
let enemyy = 100;
const enemywidth = 90;
const enemyheight = 70;
//#endregion

//#region Player bullet code
let pbfirerate = 5;
let pbtimer = pbfirerate;
const pbspeed = 12;
let pbullets = [];

function pbulletupdate() {
    for (let i = 0; i < pbullets.length; i++) {
        let curBull = pbullets[i];
        curBull[1] -= pbspeed;

        context.fillStyle = "blue";
        context.fillRect(curBull[0], curBull[1], 5, 10);

        let inx = curBull[0] + 5 > enemyx && curBull[0] < enemyx + enemywidth;
        let iny = curBull[1] + 10 > enemyy && curBull[1] < enemyy + enemyheight;

        if (inx && iny) {
            enemyhp--;
            pbullets.splice(i, 1);
            i--;
        }
    }
}
//#endregion

//#region Utility functions
function clamp(num, lower, upper) {
    return Math.max(lower, Math.min(num, upper));
}

function dtr(d) {
    return (d * Math.PI) / 180;
}

function calcXAndYSpeed(angle, speed) {
    let xspeed = speed * Math.cos(dtr(angle));
    let yspeed = speed * Math.sin(dtr(angle));
    return [xspeed, yspeed];
}

function clearscreen() {
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawUI() {
    context.fillStyle = "white";
    context.font = "22px Times New Roman";
    context.fillText(`HP: ${playerhp}`, 50, 650);
}

function drawHealthBar(pox = 0, poy = 0, amount, amountmax) {
    context.fillStyle = "green";
    context.fillRect(pox, poy, (amount / amountmax) * 100, 15);
    context.fillStyle = "red";
    context.fillRect(
        (amount / amountmax) * 100 + pox,
        poy,
        100 - (amount / amountmax) * 100,
        15
    );

    context.fillText(enemyhp, 150, 600);
}
//#endregion

//#region Enemy bullet code
let bulletlist = [];

function bulletPatternSpiral(tilt = 0, count = 36) {
    let dang = tilt;
    for (let i = 0; i < count; i++) {
        CreateBullet(enemyx + enemywidth / 2, enemyy + enemyheight / 2, dang, 2, 8);
        dang += 360 / count;
    }
}

function bulletPatternWave(tilt = 0, count = 10) {
    let dang = tilt;
    for (let i = 0; i < count; i++) {
        CreateBullet(enemyx + i * 10, enemyy, 90, 4, 8);
    }
}

function CreateBullet(x = 100, y = 100, angle, spd = 1, size = 8) {
    let [xspeed, yspeed] = calcXAndYSpeed(angle, spd);
    bulletlist.push([x, y, xspeed, yspeed, spd, angle, size]);
}

function bulletUpdate() {
    for (let i = 0; i < bulletlist.length; i++) {
        let curBull = bulletlist[i];
        curBull[0] += curBull[2];
        curBull[1] += curBull[3];

        context.fillStyle = "red";
        context.beginPath();
        context.arc(curBull[0], curBull[1], curBull[6] / 2, 0, 2 * Math.PI);
        context.fill();

        let inx = curBull[0] > playerx && curBull[0] < playerx + playerhitboxsize;
        let iny = curBull[1] > playery && curBull[1] < playery + playerhitboxsize;

        if (
            curBull[0] > canvas.width ||
            curBull[0] < -curBull[6] ||
            curBull[1] < -curBull[6] ||
            curBull[1] > canvas.height + curBull[6]
        ) {
            bulletlist.splice(i, 1);
            i--;
        }

        if (inx && iny) {
            bulletlist.splice(i, 1);
            i--;
            playerhp--;
        }
    }
}
//#endregion

//#region Movement and player input reader
let left = false;
let right = false;
let up = false;
let down = false;
let focus = false;
let shooting = false;

document.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "ArrowLeft":
            left = true;
            break;
        case "ArrowRight":
            right = true;
            break;
        case "ArrowUp":
            up = true;
            break;
        case "ArrowDown":
            down = true;
            break;
        case "Shift":
            focus = true;
            break;
        case "z":
        case "Z":
            shooting = true;
            break;
    }
});

document.addEventListener("keyup", (event) => {
    switch (event.key) {
        case "ArrowLeft":
            left = false;
            break;
        case "ArrowRight":
            right = false;
            break;
        case "ArrowUp":
            up = false;
            break;
        case "ArrowDown":
            down = false;
            break;
        case "Shift":
            focus = false;
            break;
        case "z":
        case "Z":
            shooting = false;
            pbtimer = pbfirerate;
            break;
    }
});

function playermove() {
    let movespeed = focus ? focusSpeed : playerspeed;

    if (left) playerx -= movespeed;
    if (right) playerx += movespeed;
    if (up) playery -= movespeed;
    if (down) playery += movespeed;

    if (shooting) {
        pbtimer--;
        if (pbtimer === 0) {
            pbtimer = pbfirerate;
            pbullets.push([playerx + 11, playery]);
        }
    }

    playerx = clamp(playerx, 0, canvas.width - playerhitboxsize);
    playery = clamp(playery, 0, canvas.height - playerhitboxsize);
}

function drawPlayer() {
    if (psloaded) {
        context.drawImage(playersprite, playerx - 16, playery - 18);
    }
    if (focus) {
        context.fillStyle = "white";
        context.beginPath();
        context.arc(playerx, playery, playerhitboxsize, 0, 2 * Math.PI);
        context.fill();
    }
}
//#endregion

// Main game loop, runs every frame
function gameloop() {
    clearscreen();

    if (enemyloaded) {
        context.drawImage(enemysprite, enemyx, enemyy);
    }

    drawPlayer();
    playermove();
    pbulletupdate();
    bulletUpdate();
    drawUI();
    drawHealthBar(100, 660, enemyhp, enemyhpmax);

    // Trigger bullet patterns
    if (Math.random() < 0.03) {
        bulletPatternSpiral(Math.random() * 360, 36);
    }
    if (Math.random() < 0.01) {
        bulletPatternWave(Math.random() * 360, 10);
    }
}
if (playerhp = 0){
    gameOver();
    return;
}


function gameOver(){
    context.globalAlpha = 0.5;
    context.fillStyle = "rgba(0, 0, 0, 0.5)";
    context.fillRect(0, 0, board.width, board.height);
    context.globalAlpha = 0.5;

    context.fillStyle = "white";
    context.font = "60px Arial";
    context.textAlign = "center";
    context.fillText("YOU LOSE", boardWidth / 2, board.height / 2);

    context.fillStyle = "black";
    context.fillRect(board.width / 2 - 100, board.height / 2 + 30, 200, 50);

    context.fillStyle = "white";
    context.font = "40px Arial";
    context.fillText("REPEAT?", boardWidth / 2, boardHeight / 2 + 68);

    document.addEventListener("click", repeat);
}

function repeat(){
    playerhp = 5;
}

// Actually handles the looping
window.setInterval(gameloop, 1000 / FPS);
