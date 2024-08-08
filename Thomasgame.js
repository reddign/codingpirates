
//important inits
const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
let FPS = 60;


//#region player init
    let playerx = 350
    let playery = 600
    let playerspeed = 5

    let playerhp = 5

    let psloaded = false
    const playersprite = new Image()
    playersprite.addEventListener("load",() => {
        psloaded = true
    })
    playersprite.src = "player.png"
    
//#endregion

//#region enemy init

let enemyloaded = false
const enemysprite = new Image()
enemysprite.addEventListener("load",() => {
    enemyloaded = true
})
enemysprite.src = "boss1.png"

let enemyhp = 100
let enemyhpmax = 100
let enemyx = 150
let enemyy = 100
let enemywidth = 90
let enemyheight=70
//#endregion



//#region player bullet code
    pbfirerate = 5
    pbtimer = pbfirerate
    pbspeed = 12
    pbullets = [
        /*
        [
            0,//x
            0,//y
        ]
        */
    ]

    function pbulletupdate(){
        for(let i = 0;i < pbullets.length;i++){
            let curBull = pbullets[i]
            curBull[1] -= pbspeed

            context.fillStyle="blue"
            context.fillRect(curBull[0],curBull[1],5,10)
            let inx = false
            let iny = false
            if(curBull[0]+5 > enemyx && curBull[0] < enemyx+enemywidth){
                inx = true
            }
            if(curBull[1]+10> enemyy && curBull[1] < enemyy+enemyheight){
                iny = true
            }

            if(inx && iny){
                enemyhp--
                pbullets.splice(i,1)
                i--
            }
        }
    }
//#endregion


//#region utility functions
    function repeat(num = 0,func){
        for(let i = 0; i < num;i++){
            func()
        }
    }

    function clamp(num,lower,upper){
        if(upper > lower){
            if(num < lower){
                num = lower
            }
            if(num > upper){
                num = upper
            }
        }
        return num
    }

    function dtr(d){//stands for Degrees To Radians
        let radians = (d * Math.PI) /180
        return radians
    }

    function calcXAndYSpeed(angle,speed){
            let xspeed= speed*Math.cos(dtr(angle))
            let yspeed= speed*Math.sin(dtr(angle))
            return [xspeed,yspeed]
    }

    function clearscreen(){
        context.fillStyle = 'black'; 
        context.fillRect(0,0,canvas.width,canvas.height);
    }

    function drawUI(){
        context.fillStyle = "white"
        context.font = "22px Times New Roman"
        context.fillText(`HP: ${playerhp}`,50,650)
    }

    function drawHealthBar(pox=0,poy=0,amount,amountmax){
        context.fillStyle = "green"
        context.fillRect(pox,poy,amount/amountmax*100,15)
        context.fillStyle = "red"
        context.fillRect(amount/amountmax*100+pox,poy,pox+(amountmax-amount)-100,15)

        context.fillText(enemyhp,150,600)
    }

//#endregion


//#region enemy bullet code

    let bulletlist =[

        [
            /*
            100,//x             0
            15,//y              1
            0,//xspeed          2
            0,//yspeed          3
            1,//speed           4
            0,//true angle      5
            15,//size           6
            */
        ]
        
    ]

    function bulletPattern1(tilt=0){
        let dang = tilt
        for(let i = 0;i<15;i++){
            CreateBullet(100,100,dang,2,30)
            dang+=15
        }
    }

    function CreateBullet(x=100,y=100,angle,spd=1,size=15){
        let bigshot = calcXAndYSpeed(angle,spd)
        bulletlist.push([x,y,bigshot[0],bigshot[1],spd,angle,size])
    }

    function bulletUpdate(){
        for(let i = 0;i<bulletlist.length;i++){
            let curBull = bulletlist[i]
            curBull[0] += curBull[2]
            curBull[1] += curBull[3]

            context.fillStyle = "red"
            
            let inx = false
            let iny = false
            if(curBull[0]+curBull[6] > playerx && curBull[0] < playerx+32){
                inx = true
            }
            if(curBull[1]+curBull[6]> playery && curBull[1] < playery+36){
                iny = true
            }
            context.fillRect(curBull[0],curBull[1],curBull[6],curBull[6])
        

            if(curBull[0] > canvas.width || curBull[0] < 0-30 || curBull[1] < 0 || curBull[1] > canvas.height+30){
                bulletlist.splice(i,1)
                i--
            }//removes from list

            if(inx && iny){
                bulletlist.splice(i,1)
                i--
                playerhp--
            }
        }
    }

//#endregion



//#region movement and player input reader
    let left = false
    let right = false
    let up = false
    let down = false
    let slowmode = false
    let shooting = false
    document.addEventListener(//on key down

        "keydown", (event) => {
            if(event.key == "ArrowLeft"){
                left = true
            }
            if(event.key == "ArrowRight"){
                right = true
            }
            if(event.key == "ArrowUp"){
                up = true
            }
            if(event.key == "ArrowDown"){
                down = true
            }
            if(event.key == "Shift"){
                slowmode = true
            }
            if(event.key.toLowerCase() == "z"){
                shooting = true
            }
        }
    )
    document.addEventListener(//on key release
        "keyup", (event) => {
            if(event.key == "ArrowLeft"){
                left = false
            }
            if(event.key == "ArrowRight"){
                right = false
            }
            if(event.key == "ArrowUp"){
                up = false
            }
            if(event.key == "ArrowDown"){
                down = false
            }
            if(event.key == "Shift"){
                slowmode = false
            }
            if(event.key.toLowerCase() == "z"){
                shooting = false
                pbtimer = pbfirerate
            }
        }
    )
    function playermove(){
        let movespeed = playerspeed
        if(slowmode){
            movespeed/=2.5
        }
        if(left){
            playerx-=movespeed
        }
        if(right){
            playerx+=movespeed
        }
        if(up){
            playery-=movespeed
        }
        if(down){
            playery+=movespeed
        }
        if(shooting){
            pbtimer--
            if(pbtimer == 0){
                pbtimer = pbfirerate
                pbullets.push([playerx+11,playery])
            }
        }
    }
//#endregion



//main game loop, runs every frame
function gameloop(){
    clearscreen()
    if(psloaded){
        context.drawImage(playersprite,playerx,playery)
    }
    if(enemyloaded){
        
            context.drawImage(enemysprite,enemyx,enemyy)
        
    }
    playermove()
    pbulletupdate()
    bulletUpdate()
    drawUI()
    drawHealthBar(100,660,enemyhp,enemyhpmax)
}

//actually handles the looping
window.setInterval(gameloop,1000/FPS);