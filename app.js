const client = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let user = null;
let currentReward = null;

/* AVATARES */
const avatars = ["👽","🤖","🐱","🐶","🦊","🐼","🐸","🦁","🐵","🐷"];

/* PREMIOS */
const rewards = [
  "💩 Piedra",
  "🪙 Moneda",
  "🍀 Suerte",
  "💎 Cristal",
  "🧠 IA",
  "👑 Corona",
  "🌌 LEGENDARIO"
];

/* SCRATCH */
const canvas = document.getElementById("scratchCanvas");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  ctx.fillStyle = "#999";
  ctx.fillRect(0,0,canvas.width,canvas.height);
}

resize();
window.addEventListener("resize", resize);

let drawing = false;

function getPos(e){
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.touches?e.touches[0].clientX:e.clientX)-r.left,
    y: (e.touches?e.touches[0].clientY:e.clientY)-r.top
  };
}

function scratch(x,y){
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(x,y,20,0,Math.PI*2);
  ctx.fill();
}

canvas.addEventListener("mousedown",()=>drawing=true);
canvas.addEventListener("mouseup",()=>drawing=false);
canvas.addEventListener("touchstart",()=>drawing=true);
canvas.addEventListener("touchend",()=>drawing=false);

canvas.addEventListener("mousemove",(e)=>{
  if(!drawing) return;
  const p = getPos(e);
  scratch(p.x,p.y);
});

canvas.addEventListener("touchmove",(e)=>{
  if(!drawing) return;
  const p = getPos(e);
  scratch(p.x,p.y);
});

/* CANJEAR */
document.getElementById("claimBtn").onclick = async ()=>{

  currentReward = rewards[Math.floor(Math.random()*rewards.length)];

  if(!user){
    alert("Debes iniciar sesión");
    return;
  }

  await client.from("rewards").insert([{
    user_id:user.id,
    reward_name:currentReward
  }]);

  document.getElementById("result").innerText =
    "🎉 " + currentReward;
};

/* MENU */
document.getElementById("avatarBtn").onclick = ()=>{
  document.getElementById("userMenu").classList.toggle("hidden");
};

/* AVATARES */
avatars.forEach(a=>{
  let s = document.createElement("span");
  s.innerText = a;
  s.onclick = async ()=>{

    await client.from("profiles").upsert({
      id:user.id,
      avatar:a
    });

    alert("Avatar cambiado");
  };

  document.getElementById("avatarList").appendChild(s);
});

/* LOGIN SIMPLE */
async function login(email,password){
  const {data}=await client.auth.signInWithPassword({
    email,password
  });

  user=data.user;
}

/* REGISTER */
async function register(email,password,username){
  const {data}=await client.auth.signUp({
    email,password
  });

  user=data.user;

  await client.from("users").insert({
    id:user.id,
    email,
    username
  });
}
