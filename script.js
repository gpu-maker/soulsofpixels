/* ======================================================
   PIXEL SOULS — COMPLETE GAME CORE
   ====================================================== */

const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

canvas.width=1000;
canvas.height=1500;
ctx.imageSmoothingEnabled=false;


/* ================= INPUT ================= */

const keys={};
window.addEventListener("keydown",e=>keys[e.key]=true);
window.addEventListener("keyup",e=>keys[e.key]=false);


/* ================= PHYSICS ================= */

class Physics{
 constructor(){this.bodies=[];this.gravity=0.6;}
 add(b){this.bodies.push(b)}

 update(){
  for(const b of this.bodies){
   if(b.static) continue;

   b.vy+=this.gravity;
   b.x+=b.vx;
   b.y+=b.vy;
   b.vx*=0.9;

   if(b.y>1200){
    b.y=1200;
    b.vy=0;
    b.onGround=true;
   }
  }
 }
}


/* ================= STAMINA ================= */

class Stamina{
 constructor(max=100){this.max=max;this.value=max;}
 use(v){if(this.value>=v){this.value-=v;return true}return false}
 regen(){this.value=Math.min(this.max,this.value+0.3)}
}


/* ================= ANIMATION ================= */

class Animator{
 constructor(e){this.e=e;this.state="idle"}
 update(){
  if(this.e.attacking) this.state="attack";
  else if(this.e.vy<0) this.state="jump";
  else if(this.e.vx!==0) this.state="run";
  else this.state="idle";
 }
}


/* ================= COMBAT ================= */

class Hitbox{
 constructor(owner,w,h,dmg){
  this.owner=owner;
  this.w=w;this.h=h;
  this.damage=dmg;
  this.life=10;
 }
 get x(){return this.owner.x+this.owner.facing*30}
 get y(){return this.owner.y}
 update(){this.life--}
}

const hitboxes=[];

function attack(e){
 if(e.attacking) return;
 e.attacking=true;
 hitboxes.push(new Hitbox(e,30,20,e.weapon.damage));
 setTimeout(()=>e.attacking=false,200);
}

function dodge(e){
 if(!e.stamina.use(25)) return;
 e.vx+=e.facing*20;
}

function collide(a,b){
 return a.x<b.x+b.w &&
        a.x+a.w>b.x &&
        a.y<b.y+b.h &&
        a.y+a.h>b.y;
}


/* ================= INVENTORY ================= */

class Inventory{
 constructor(){this.items=[];this.gold=0}
 add(i){this.items.push(i)}
}

const weapons={
 sword:{damage:15},
 greatsword:{damage:30}
};


/* ================= SKILL TREE ================= */

const skills=[
 {id:0,x:200,y:200,unlocked:true},
 {id:1,x:350,y:200,requires:0},
 {id:2,x:500,y:200,requires:1}
];

canvas.addEventListener("click",e=>{
 const r=canvas.getBoundingClientRect();
 const mx=e.clientX-r.left;
 const my=e.clientY-r.top;

 for(const s of skills){
  if(Math.hypot(mx-s.x,my-s.y)<20){
   if(!s.requires||skills.find(n=>n.id===s.requires).unlocked)
    s.unlocked=true;
  }
 }
});


/* ================= ENEMY AI ================= */

const enemies=[];

function spawnEnemy(x,y){
 enemies.push({x,y,w:20,h:20,hp:100});
}

function updateEnemies(){
 for(const e of enemies){
  e.x+=(player.x-e.x)*0.01;

  for(const h of hitboxes){
   if(collide(h,e)) e.hp-=h.damage;
  }
 }
}


/* ================= WORLD GENERATION ================= */

const world=[];

function generateWorld(){
 for(let x=0;x<50;x++){
  world[x]=[];
  for(let y=0;y<30;y++){
   world[x][y]=Math.random()>0.8?1:0;
  }
 }
}


/* ================= SAVE / LOAD ================= */

function saveGame(){
 const data=JSON.stringify({player});
 const blob=new Blob([data],{type:"application/json"});
 const a=document.createElement("a");
 a.href=URL.createObjectURL(blob);
 a.download="pixelsouls_save.json";
 a.click();
}


/* ================= NPC SCHEDULE ================= */

class NPCScheduler{
 constructor(){this.time=6;this.npcs=[]}
 add(n){this.npcs.push(n)}

 update(){
  this.time+=0.01;if(this.time>=24)this.time=0;

  for(const n of this.npcs){
   if(this.time<9)n.target=n.work;
   else if(this.time>17)n.target=n.home;

   if(n.target){
    n.x+=(n.target.x-n.x)*0.02;
    n.y+=(n.target.y-n.y)*0.02;
   }
  }
 }
}


/* ================= LIGHTING ================= */

class Lighting{
 constructor(){this.lights=[]}
 clear(){this.lights=[]}
 add(x,y,r){this.lights.push({x,y,r})}

 render(){
  ctx.fillStyle="rgba(0,0,0,0.8)";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.globalCompositeOperation="destination-out";

  for(const l of this.lights){
   const g=ctx.createRadialGradient(l.x,l.y,0,l.x,l.y,l.r);
   g.addColorStop(0,"rgba(0,0,0,1)");
   g.addColorStop(1,"rgba(0,0,0,0)");
   ctx.fillStyle=g;
   ctx.beginPath();
   ctx.arc(l.x,l.y,l.r,0,Math.PI*2);
   ctx.fill();
  }

  ctx.globalCompositeOperation="source-over";
 }
}


/* ================= POST FX ================= */

function fog(){
 ctx.fillStyle="rgba(120,120,150,0.15)";
 ctx.fillRect(0,0,canvas.width,canvas.height);
}


/* ================= PLAYER ================= */

const player={
 x:200,y:200,w:20,h:20,
 vx:0,vy:0,facing:1,
 weapon:weapons.sword,
 stamina:new Stamina(),
 inventory:new Inventory()
};

player.animator=new Animator(player);


/* ================= INIT ================= */

const physics=new Physics();
const lighting=new Lighting();
const scheduler=new NPCScheduler();

physics.add(player);

generateWorld();
spawnEnemy(600,1100);


/* ================= INPUT ================= */

function input(){
 if(keys["a"]){player.vx=-5;player.facing=-1}
 if(keys["d"]){player.vx=5;player.facing=1}

 if(keys["w"]&&player.onGround){
  player.vy=-15;
  player.onGround=false;
 }

 if(keys[" "]){attack(player);keys[" "]=false}
 if(keys["Shift"]){dodge(player);keys["Shift"]=false}
 if(keys["F5"]){saveGame();keys["F5"]=false}
}


/* ================= UPDATE ================= */

function update(){
 input();
 physics.update();
 player.animator.update();
 player.stamina.regen();

 updateEnemies();
 hitboxes.forEach(h=>h.update());
}


/* ================= RENDER ================= */

function drawRect(e,c="white"){
 ctx.fillStyle=c;
 ctx.fillRect(e.x,e.y,e.w,e.h);
}

function render(){

 ctx.fillStyle="#111";
 ctx.fillRect(0,0,canvas.width,canvas.height);

 // world
 for(let x=0;x<50;x++){
  for(let y=0;y<30;y++){
   if(world[x][y]){
    ctx.fillStyle="#333";
    ctx.fillRect(x*40,y*40,40,40);
   }
  }
 }

 drawRect(player,"white");
 enemies.forEach(e=>drawRect(e,"red"));

 // skill tree
 skills.forEach(s=>{
  ctx.fillStyle=s.unlocked?"lime":"gray";
  ctx.beginPath();
  ctx.arc(s.x,s.y,20,0,Math.PI*2);
  ctx.fill();
 });

 lighting.clear();
 lighting.add(player.x,player.y,200);
 lighting.render();

 fog();
}


/* ================= LOOP ================= */

function loop(){
 update();
 render();
 requestAnimationFrame(loop);
}

loop();
