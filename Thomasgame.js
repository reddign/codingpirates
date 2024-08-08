// Important inits
const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
let FPS = 60;

// Resize canvas to fit the window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial resize

//#region Player init
let playerx = canvas.width / 2;
let playery = canvas.height * 0.8;
let playerspeed = 5;
let focusSpeed = playerspeed / 2.5;

let playerhp = 5;
const playerhpmax = 5;
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
let enemyx = canvas.width / 2 - 45;
let enemyy = canvas.height * 0.1;
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
    context.fillText(`HP: ${playerhp}`, 50, canvas.height - 20);
}

function drawHealthBar(pox = 0, poy = 0, amount, amountmax) {
    const barWidth = canvas.width * 0.3;
    context.fillStyle = "green";
    context.fillRect(pox, poy, (amount / amountmax) * barWidth, 15);
    context.fillStyle = "red";
    context.fillRect(
        pox + (amount / amountmax) * barWidth,
        poy,
        barWidth - (amount / amountmax) * barWidth,
        15
    );

    context.fillStyle = "white";
    context.fillText(`Boss HP: ${enemyhp}`, pox + barWidth + 10, poy + 12);
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
            if (playerhp <= 0) {
                gameOver();
            }
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
    if (gameOver) return; // Prevent player movement if game is over

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

    playerx = clamp(playerx, 0, canvas.width - 32);
    playery = clamp(playery, 0, canvas.height - 36);

    if (focus) {
        context.fillStyle = "white";
        context.beginPath();
        context.arc(playerx + 16, playery + 18, playerhitboxsize, 0, 2 * Math.PI);
        context.fill();
    }
}
//#endregion

// Main game loop, runs every frame
function gameloop() {
    if (gameOver) return;

    clearscreen();

    if (enemyloaded) {
        context.drawImage(enemysprite, enemyx, enemyy);
    }

    drawPlayer();
    playermove();
    pbulletupdate();
    bulletUpdate();
    drawUI();
    drawHealthBar(50, canvas.height - 50, enemyhp, enemyhpmax);

    // Trigger bullet patterns
    if (Math.random() < 0.03) {
        bulletPatternSpiral(Math.random() * 360, 36);
    }
    if (Math.random() < 0.01) {
        bulletPatternWave(Math.random() * 360, 10);
    }
}

// Game Over function
function gameOver() {
    context.globalAlpha = 0.5;
    context.fillStyle = "rgba(0, 0, 0, 0.5)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = 1;

    context.fillStyle = "white";
    context.font = "60px Arial";
    context.textAlign = "center";
    context.fillText("YOU LOSE", canvas.width / 2, canvas.height / 2 - 50);

    context.fillStyle = "black";
    context.fillRect(canvas.width / 2 - 100, canvas.height / 2 + 10, 200, 50);

    context.fillStyle = "white";
    context.font = "40px Arial";
    context.fillText("RETRY?", canvas.width / 2, canvas.height / 2 + 40);

    document.addEventListener("click", retryGame);
    window.removeEventListener("keydown", keydownHandler); // Remove keydown listener to prevent new inputs
}

function retryGame() {
    playerhp = playerhpmax;
    enemyhp = enemyhpmax;
    pbullets = [];
    bulletlist = [];
    playerx = canvas.width / 2;
    playery = canvas.height * 0.8;
    gameOver = false;
    window.addEventListener("keydown", keydownHandler); // Re-add keydown listener
    document.removeEventListener("click", retryGame); // Remove retry listener after click
}

// Actually handles the looping
window.setInterval(gameloop, 1000 / FPS);
