const canvas = document.querySelector("canvas"),
        c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight

class Player{
    constructor(){
        this.velocity={
            x: 0,
            y: 0
        }
        this.rotation = 0;

        const img = new Image();
        img.src = "./img/spaceship.png";
        img.alt = "nave";
        img.onload = ()=>{
            const scale = 0.15;
            this.image  = img;
            this.width  = img.width * scale;
            this.height = img.height* scale;
            this.posicion={
                x: (canvas.width - this.width)/2,
                y: canvas.height - this.height - 15
            }
        }
    }

    draw(){

        c.save();
        c.translate(
            this.posicion.x +this.width/2,
            this.posicion.y +this.height/2       )

        c.rotate(this.rotation);

        c.translate(
            -this.posicion.x-this.width/2,
            -this.posicion.y -this.height/2
        )

        c.drawImage(this.image,this.posicion.x,this.posicion.y,this.width, this.height)
        c.restore();
    }

    update(){
        if(this.image){
            this.draw();
            this.posicion.x += this.velocity.x; 
        }
    }
}

class Projectile{
    constructor({posicion, velocity}){
        this.posicion = posicion;
        this.velocity = velocity;
        this.radius   = 3;
    }

    draw(){
        c.beginPath();
        c.arc( this.posicion.x, this.posicion.y, this.radius, 0, Math.PI*2)
        c.fillStyle = "red"
        c.fill();
        c.closePath();
    }
    update(){
        this.draw();
        this.posicion.x += this.velocity.x;
        this.posicion.y += this.velocity.y
    }

}

class Invader{
    constructor({posicion}){
               
        const img = new Image();
        img.src = "./img/invader.png";
        img.alt = "nave";
        img.onload = ()=>{
            const scale = 1;
            this.image  = img;
            this.width  = img.width * scale;
            this.height = img.height* scale;
            this.posicion={
                x: posicion.x,
                y: posicion.y
            }
        }
    }

    draw(){
        c.drawImage(this.image,this.posicion.x,this.posicion.y,this.width, this.height)
    }

    update({velocity}){
        if(this.image){
            this.draw();
            this.posicion.x += velocity.x; 
            this.posicion.y += velocity.y; 
        }
    }
}

class Grid{
    constructor(){
        this.posicion = {
            x: 0,
            y: 0
        }

        this.velocity = {
            x: 3,
            y: 0
        }

        this.invaders = []
        const row = 10, column = 5;
        this.width = row*30;
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < column; j++) {
             
                this.invaders.push( new Invader(
                    {
                        posicion: {
                            x:i*30,y: j*30
                        }
                    }
                ) )
            }
            
        }
    }

    update(){
        this.posicion.x += this.velocity.x
        this.posicion.y += this.velocity.y
        this.velocity.y = 0;

        if (this.posicion.x + this.width >= canvas.width || this.posicion.x <= 0) {
            this.velocity.x = -this.velocity.x;
            this.velocity.y = 30;
        }
    }
}

const player      = new Player();
const projectiles = [];
const grid = [new Grid()]
const keys = {
    a :{
        pressed: false
    },
    d :{
        pressed: false
    },
    space :{
        pressed: false
    }
}
function animation(){
    requestAnimationFrame(animation);
    c.fillStyle = "black";
    c.fillRect(0,0,canvas.width,canvas.height)

    player.update();    
    projectiles.forEach( (projectile,i) =>{
        if ( projectile.posicion.y + projectile.radius <= 0) {
            setTimeout(()=>{
                projectiles.splice(i,1);
            })
            return
        }

        projectile.update();
    } )

    grid.forEach( (g) =>{

        g.update();
        g.invaders.forEach((invader,i)=>{
            invader.update({velocity: g.velocity });
            projectiles.forEach((projectile,j)=>{
                if(
                       projectile.posicion.y - projectile.radius <= invader.posicion.y + invader.height 
                    && projectile.posicion.y + projectile.radius >= invader.posicion.y  
                    && projectile.posicion.x + projectile.radius >= invader.posicion.x
                    && projectile.posicion.x - projectile.radius <= invader.posicion.x + invader.width
                    ){
                    setTimeout(()=>{
                        g.invaders.splice(i,1);
                        projectiles.splice(j,1);

                        if(g.invaders.length > 0){
                            const firstInvader = g.invaders[0];
                            const lastInvader = g.invaders[g.invaders.length-1];
                            g.width = lastInvader.posicion.x - firstInvader.posicion.x+lastInvader.width;
                            g.posicion.x = firstInvader.posicion.x;
                        }
                    },0)
                }
            })
        })
    } )

    if( keys.a.pressed && player.posicion.x >= 0){
        player.rotation = -0.15;
        player.velocity.x = -4;
    }
    else if( keys.d.pressed && player.posicion.x <= player.posicion.x+player.width){
        player.rotation = 0.15;
        player.velocity.x = 4;
    }
    else{
        player.rotation = 0
        player.velocity.x = 0;
    }
        
}

animation();


addEventListener("keydown",({key})=>{
    
    switch(key){
        case "a":
            keys.a.pressed = true
            break;
        case "d":
            keys.d.pressed = true
            break;
        case " ":
            keys.space.pressed = true
            projectiles.push( new Projectile({
                posicion: { x: player.posicion.x + player.width/2,
                            y: player.posicion.y },
                velocity:{ x: 0, y: -10 }
            }))
            break;
    }
})

addEventListener("keyup",({key})=>{
    switch(key){
        case "a":
            keys.a.pressed = false
            break;
        case "d":
            keys.d.pressed = false
            break;
        case "space":
            keys.space.pressed = false;
            break;
    }
})
