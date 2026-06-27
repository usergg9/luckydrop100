const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let user = null;
let currentPrize = null;
let drawing = false;
let revealed = false;

/* PREMIOS */
const prizes = [
  { name:"🪨 Piedra", chance:35 },
  { name:"🪙 Moneda", chance:25 },
  { name:"🍀 Suerte", chance:15 },
  { name:"💎 Cristal", chance:12 },
  { name:"🧠 IA", chance:8 },
  { name:"👑 Corona", chance:4 },
  { name:"🌌 LEGENDARIO", chance:1 }
];

function randomPrize(){
  let r = Math.random()*100;
  let acc = 0;
  for(let p of prizes){
    acc += p.chance;
    if(r <= acc) return p.name;
  }
}

/* CANVAS */
const canvas = document.getElementById("scratchCanvas");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  ctx.fillStyle="#999";
  ctx.fillRect(0,0,canvas.width,canvas.height);
}

resize();
window.addEventListener("resize", resize);

function scratch(x,y){
  ctx.globalCompositeOperation="destination-out";
  ctx.beginPath();
  ctx.arc(x,y,25,0,Math.PI*2);
  ctx.fill();

  check();
}

function check(){
  if(revealed) return;

  const img = ctx.getImageData(0,0,canvas.width,canvas.height);
  let clear=0;

  for(let i=0;i<img.data.length;i+=4){
    if(img.data[i+3]===0) clear++;
  }

  let percent = (clear/(canvas.width*canvas.height))*100;

  if(percent>55){
    revealed=true;
    document.getElementById("prizeReveal").innerText=currentPrize;
  }
}

/* EVENTS */
canvas.addEventListener("mousedown",()=>drawing=true);
canvas.addEventListener("mouseup",()=>drawing=false);
canvas.addEventListener("touchstart",()=>drawing=true);
canvas.addEventListener("touchend",()=>drawing=false);

canvas.addEventListener("mousemove",(e)=>{
  if(!drawing) return;
  let r=canvas.getBoundingClientRect();
  scratch(e.clientX-r.left,e.clientY-r.top);
});

canvas.addEventListener("touchmove",(e)=>{
  if(!drawing) return;
  let r=canvas.getBoundingClientRect();
  scratch(e.touches[0].clientX-r.left,e.touches[0].clientY-r.top);
});

/* INIT */
window.onload=()=>{
  currentPrize=randomPrize();
};

/* OVERLAY MENU */
const menu=document.getElementById("sideMenu");
const overlay=document.getElementById("overlay");

document.getElementById("profileBtn").onclick=()=>{
  menu.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

overlay.onclick=()=>{
  menu.classList.add("hidden");
  overlay.classList.add("hidden");
};

/* CLAIM */
document.getElementById("claimBtn").onclick=async()=>{
  if(!user){
    document.getElementById("authModal").classList.remove("hidden");
    return;
  }

  document.getElementById("prizeReveal").innerText=currentPrize;

  await client.from("rewards").insert([{
    user_id:user.id,
    reward_name:currentPrize
  }]);
};
