const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let user=null;
let currentPrize=null;
let drawing=false;

/* PREMIOS */
const prizes=[
  {name:"🪨 Piedra",chance:35},
  {name:"🪙 Moneda",chance:25},
  {name:"🍀 Suerte",chance:15},
  {name:"💎 Cristal",chance:12},
  {name:"🧠 IA",chance:8},
  {name:"👑 Corona",chance:4},
  {name:"🌌 LEGENDARIO",chance:1}
];

function getPrize(){
  let r=Math.random()*100;
  let acc=0;
  for(let p of prizes){
    acc+=p.chance;
    if(r<=acc) return p.name;
  }
}

/* SCRATCH */
const canvas=document.getElementById("scratchCanvas");
const ctx=canvas.getContext("2d");

function resize(){
  canvas.width=canvas.offsetWidth;
  canvas.height=canvas.offsetHeight;
  ctx.fillStyle="#999";
  ctx.fillRect(0,0,canvas.width,canvas.height);
}
resize();

/* SAFE DOM */
const $ = id => document.getElementById(id);

/* MENU */
function openMenu(){
  $("sideMenu").classList.remove("hidden");
  $("overlay").classList.remove("hidden");
}
function closeMenu(){
  $("sideMenu").classList.add("hidden");
  $("overlay").classList.add("hidden");
}

/* NAV */
function showAvatars(){
  $("menuMain").classList.add("hidden");
  $("menuAvatars").classList.remove("hidden");
}
function showRewards(){
  $("menuMain").classList.add("hidden");
  $("menuRewards").classList.remove("hidden");
}
function back(){
  $("menuAvatars").classList.add("hidden");
  $("menuRewards").classList.add("hidden");
  $("menuMain").classList.remove("hidden");
}

/* AUTH */
function showLogin(){
  $("loginBox").classList.remove("hidden");
  $("registerBox").classList.add("hidden");
}
function showRegister(){
  $("registerBox").classList.remove("hidden");
  $("loginBox").classList.add("hidden");
}

/* SCRATCH */
function scratch(x,y){
  ctx.globalCompositeOperation="destination-out";
  ctx.beginPath();
  ctx.arc(x,y,25,0,Math.PI*2);
  ctx.fill();

  $("prizeReveal").innerText=currentPrize;
}

/* INIT */
window.onload=()=>{
  currentPrize=getPrize();
  $("prizeReveal").innerText="🎁 ???";
};

/* EVENTS SAFE */
canvas.addEventListener("mousedown",()=>drawing=true);
canvas.addEventListener("mouseup",()=>drawing=false);

canvas.addEventListener("mousemove",(e)=>{
  if(!drawing) return;
  const r=canvas.getBoundingClientRect();
  scratch(e.clientX-r.left,e.clientY-r.top);
});

/* EXPORT GLOBAL (🔥 FIX TU ERROR) */
window.openMenu=openMenu;
window.closeMenu=closeMenu;
window.showAvatars=showAvatars;
window.showRewards=showRewards;
window.back=back;
window.showLogin=showLogin;
window.showRegister=showRegister;

/* BUTTONS SAFE BIND */
$("profileBtn").onclick=openMenu;
$("overlay").onclick=closeMenu;
$("btnAvatars").onclick=showAvatars;
$("btnRewards").onclick=showRewards;
$("backMenu1").onclick=back;
$("backMenu2").onclick=back;
$("showLogin").onclick=showLogin;
$("showRegister").onclick=showRegister;
