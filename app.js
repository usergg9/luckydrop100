const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ===== DOM SAFE ===== */
const $ = id => document.getElementById(id);

/* ===== VARIABLES ===== */
let user=null;
let prize=null;
let drawing=false;

/* ===== PREMIOS ===== */
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

/* ===== CANVAS ===== */
const canvas=$("scratchCanvas");
const ctx=canvas.getContext("2d",{willReadFrequently:true});

function resize(){
  if(!canvas) return;
  canvas.width=canvas.offsetWidth;
  canvas.height=canvas.offsetHeight;

  ctx.fillStyle="#999";
  ctx.fillRect(0,0,canvas.width,canvas.height);
}

window.addEventListener("load",()=>{
  resize();
  prize=getPrize();
  $("prizeReveal").innerText="🎁 ???";
});

/* ===== SCRATCH ===== */
function scratch(x,y){
  ctx.globalCompositeOperation="destination-out";
  ctx.beginPath();
  ctx.arc(x,y,25,0,Math.PI*2);
  ctx.fill();

  $("prizeReveal").innerText=prize;
}

/* ===== EVENTS ===== */
canvas?.addEventListener("mousedown",()=>drawing=true);
canvas?.addEventListener("mouseup",()=>drawing=false);

canvas?.addEventListener("mousemove",(e)=>{
  if(!drawing) return;
  const r=canvas.getBoundingClientRect();
  scratch(e.clientX-r.left,e.clientY-r.top);
});

/* ===== MENU ===== */
function openMenu(){
  $("sideMenu")?.classList.remove("hidden");
  $("overlay")?.classList.remove("hidden");
}

function closeMenu(){
  $("sideMenu")?.classList.add("hidden");
  $("overlay")?.classList.add("hidden");
}

/* ===== LOGIN TOGGLE ===== */
function showLogin(){
  $("loginBox").classList.remove("hidden");
  $("registerBox").classList.add("hidden");
}

function showRegister(){
  $("registerBox").classList.remove("hidden");
  $("loginBox").classList.add("hidden");
}

/* ===== SAFE BIND (ESTO ARREGLA TODO) ===== */
window.addEventListener("DOMContentLoaded",()=>{

  $("profileBtn")?.addEventListener("click",openMenu);
  $("overlay")?.addEventListener("click",closeMenu);

  $("btnLogout")?.addEventListener("click",async()=>{
    await client.auth.signOut();
    alert("Sesión cerrada");
  });

  $("btnAvatars")?.addEventListener("click",()=>{
    alert("Avatares (pendiente UI)");
  });

  $("btnRewards")?.addEventListener("click",async()=>{
    if(!user) return alert("No logueado");
    let {data}=await client.from("rewards").select("*").eq("user_id",user.id);
    alert(JSON.stringify(data));
  });

  $("loginBtn")?.addEventListener("click",async()=>{
    const email=$("loginEmail").value;
    const pass=$("loginPass").value;

    const {data,error}=await client.auth.signInWithPassword({
      email,password:pass
    });

    if(error) return alert(error.message);
    user=data.user;
    alert("Login correcto");
  });

  $("registerBtn")?.addEventListener("click",async()=>{
    const email=$("regEmail").value;
    const pass=$("regPass").value;

    const {error}=await client.auth.signUp({
      email,password:pass
    });

    if(error) return alert(error.message);
    alert("Cuenta creada");
  });

  $("showLogin")?.addEventListener("click",showLogin);
  $("showRegister")?.addEventListener("click",showRegister);
});
