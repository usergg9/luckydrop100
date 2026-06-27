const client = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let user = null;
let currentReward = null;

/* PREMIOS con probabilidad real */
const rewards = [
  { name:"💩 Piedra", chance:35 },
  { name:"🪙 Moneda", chance:25 },
  { name:"🍀 Suerte", chance:15 },
  { name:"💎 Cristal", chance:12 },
  { name:"🧠 IA", chance:8 },
  { name:"👑 Corona", chance:4 },
  { name:"🌌 LEGENDARIO", chance:1 }
];

/* SCRATCH REAL */
const canvas = document.getElementById("scratchCanvas");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  ctx.fillStyle="#777";
  ctx.fillRect(0,0,canvas.width,canvas.height);
}
resize();

let drawing=false;

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
  const p=pos(e);
  scratch(p.x,p.y);
});

canvas.addEventListener("touchmove",(e)=>{
  if(!drawing) return;
  const p=pos(e);
  scratch(p.x,p.y);
});

/* PREMIO REAL (respeta probabilidad) */
function getReward(){
  let r=Math.random()*100;
  let acc=0;

  for(let i of rewards){
    acc+=i.chance;
    if(r<=acc) return i.name;
  }
}

/* CANJEAR */
document.getElementById("claimBtn").onclick=async()=>{

  currentReward=getReward();

  if(!user){
    alert("Debes iniciar sesión");
    return;
  }

  await client.from("rewards").insert([{
    user_id:user.id,
    reward_name:currentReward
  }]);

  document.getElementById("hiddenPrize").innerText=currentReward;
  document.getElementById("result").innerText="🎉 Premio obtenido";
};

/* PERFIL PANEL */
document.getElementById("profileBtn").onclick=()=>{
  document.getElementById("sidePanel").classList.toggle("hidden");
};

/* LOGIN SIMPLE */
async function login(email,password){
  const {data}=await client.auth.signInWithPassword({
    email,password
  });

  user=data.user;
}

/* REGISTER SIMPLE */
async function register(email,password,username){
  const {data}=await client.auth.signUp({
    email,password
  });

  user=data.user;

  await client.from("users").insert([{
    id:user.id,
    email,
    username
  }]);
}
