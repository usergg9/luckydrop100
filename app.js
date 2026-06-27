const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let user=null;
let currentPrize=null;
let revealed=false;
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

function generate(){
  let r=Math.random()*100;
  let acc=0;
  for(let p of prizes){
    acc+=p.chance;
    if(r<=acc) return p.name;
  }
}

/* ===== SCRATCH ===== */
const canvas=document.getElementById("scratchCanvas");
const ctx=canvas.getContext("2d");

function resize(){
  canvas.width=canvas.offsetWidth;
  canvas.height=canvas.offsetHeight;

  ctx.fillStyle="#999";
  ctx.fillRect(0,0,canvas.width,canvas.height);
}

resize();

function scratch(x,y){
  ctx.globalCompositeOperation="destination-out";
  ctx.beginPath();
  ctx.arc(x,y,25,0,Math.PI*2);
  ctx.fill();

  check();
}

function check(){
  if(revealed) return;

  const img=ctx.getImageData(0,0,canvas.width,canvas.height);
  let clear=0;

  for(let i=0;i<img.data.length;i+=4){
    if(img.data[i+3]===0) clear++;
  }

  let percent=(clear/(canvas.width*canvas.height))*100;

  if(percent>60){
    revealed=true;
    document.getElementById("prizeReveal").innerText=currentPrize;

    document.getElementById("prizeReveal").style.transform="scale(1.2)";
    setTimeout(()=>{
      document.getElementById("prizeReveal").style.transform="scale(1)";
    },300);
  }
}

/* INIT */
window.onload=()=>{
  currentPrize=generate();
};

/* EVENTS */
canvas.onmousedown=()=>drawing=true;
canvas.onmouseup=()=>drawing=false;

canvas.onmousemove=(e)=>{
  if(!drawing) return;
  let r=canvas.getBoundingClientRect();
  scratch(e.clientX-r.left,e.clientY-r.top);
};

/* MENU */
function openMenu(){
  document.getElementById("sideMenu").classList.remove("hidden");
  document.getElementById("overlay").classList.remove("hidden");
}

document.getElementById("profileBtn").onclick=openMenu;

document.getElementById("overlay").onclick=()=>{
  document.getElementById("sideMenu").classList.add("hidden");
  document.getElementById("overlay").classList.add("hidden");
};

/* NAV */
function openAvatars(){
  document.getElementById("menuMain").classList.add("hidden");
  document.getElementById("menuAvatars").classList.remove("hidden");
}

function openRewards(){
  document.getElementById("menuMain").classList.add("hidden");
  document.getElementById("menuRewards").classList.remove("hidden");

  loadRewards();
}

function backMenu(){
  document.getElementById("menuAvatars").classList.add("hidden");
  document.getElementById("menuRewards").classList.add("hidden");
  document.getElementById("menuMain").classList.remove("hidden");
}

/* REWARDS */
async function loadRewards(){
  if(!user) return;
  let {data}=await client.from("rewards").select("*").eq("user_id",user.id);

  document.getElementById("myRewards").innerHTML=
    data.map(r=>"🎁 "+r.reward_name).join("<br>");
}

/* AUTH UI */
function showLogin(){
  document.getElementById("loginBox").classList.remove("hidden");
  document.getElementById("registerBox").classList.add("hidden");
}

function showRegister(){
  document.getElementById("registerBox").classList.remove("hidden");
  document.getElementById("loginBox").classList.add("hidden");
}
