const client = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let user = null;
let currentPrize = null;

/* PREMIOS (probabilidad real) */
const prizes = [
  { name:"💩 Piedra", chance:35 },
  { name:"🪙 Moneda", chance:25 },
  { name:"🍀 Suerte", chance:15 },
  { name:"💎 Cristal", chance:12 },
  { name:"🧠 IA", chance:8 },
  { name:"👑 Corona", chance:4 },
  { name:"🌌 LEGENDARIO", chance:1 }
];

/* GENERAR PREMIO REAL */
function generatePrize(){
  let r = Math.random()*100;
  let acc = 0;

  for(let p of prizes){
    acc += p.chance;
    if(r <= acc) return p.name;
  }
}

/* SCRATCH REAL */
const canvas = document.getElementById("scratchCanvas");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  ctx.fillStyle = "#777";
  ctx.fillRect(0,0,canvas.width,canvas.height);
}

resize();
window.addEventListener("resize", resize);

let drawing = false;

function pos(e){
  const r = canvas.getBoundingClientRect();
  return {
    x:(e.touches?e.touches[0].clientX:e.clientX)-r.left,
    y:(e.touches?e.touches[0].clientY:e.clientY)-r.top
  };
}

function scratch(x,y){
  ctx.globalCompositeOperation="destination-out";
  ctx.beginPath();
  ctx.arc(x,y,25,0,Math.PI*2);
  ctx.fill();
}

canvas.addEventListener("mousedown",()=>drawing=true);
canvas.addEventListener("mouseup",()=>drawing=false);
canvas.addEventListener("touchstart",()=>drawing=true);
canvas.addEventListener("touchend",()=>drawing=false);

canvas.addEventListener("mousemove",(e)=>{
  if(!drawing) return;
  const p = pos(e);
  scratch(p.x,p.y);
});

canvas.addEventListener("touchmove",(e)=>{
  if(!drawing) return;
  const p = pos(e);
  scratch(p.x,p.y);
});

/* INICIAR PRIZE AL CARGAR */
window.onload = () => {
  currentPrize = generatePrize();
};

/* CANJEAR */
document.getElementById("claimBtn").onclick = async () => {

  if(!user){
    alert("Debes iniciar sesión");
    return;
  }

  document.getElementById("prizeText").innerText = currentPrize;
  document.getElementById("result").innerText = "🎉 Premio obtenido";

  await client.from("rewards").insert([{
    user_id:user.id,
    reward_name:currentPrize
  }]);
};

/* PERFIL */
document.getElementById("profileBtn").onclick = () => {
  document.getElementById("sideMenu").classList.toggle("hidden");
};
