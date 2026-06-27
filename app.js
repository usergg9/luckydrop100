const client = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let user = null;
let currentReward = null;
let tries = 3;

/* PREMIOS */
const rewards = [
  { name: "💩 Piedra", chance: 35 },
  { name: "🪙 Moneda", chance: 25 },
  { name: "🍀 Suerte", chance: 15 },
  { name: "💎 Cristal", chance: 12 },
  { name: "🧠 IA", chance: 8 },
  { name: "👑 Corona", chance: 4 },
  { name: "🌌 LEGENDARIO", chance: 1 }
];

/* RASCA REAL (CANVAS) */
const canvas = document.getElementById("scratchCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  ctx.fillStyle = "#999";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);

let drawing = false;

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.touches ? e.touches[0].clientX : e.clientX) - rect.left,
    y: (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
  };
}

function scratch(x, y) {
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fill();
}

canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("touchstart", () => drawing = true);
canvas.addEventListener("touchend", () => drawing = false);

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  const pos = getPos(e);
  scratch(pos.x, pos.y);
});

canvas.addEventListener("touchmove", (e) => {
  if (!drawing) return;
  const pos = getPos(e);
  scratch(pos.x, pos.y);
});

/* PREMIOS */
function getReward() {
  let r = Math.random() * 100;
  let acc = 0;

  for (let item of rewards) {
    acc += item.chance;
    if (r <= acc) return item.name;
  }
}

/* LOGIN */
async function register() {

  const email = email.value;
  const password = password.value;
  const username = username.value;

  const { data } = await client.auth.signUp({ email, password });

  user = data.user;

  await client.from("users").insert([{
    id: user.id,
    email,
    username
  }]);
}

async function login() {

  const { data } = await client.auth.signInWithPassword({
    email: email.value,
    password: password.value
  });

  user = data.user;
}

/* BOTONES */
registerBtn.onclick = register;
loginBtn.onclick = login;

/* RECLAMAR (opcional si quieres después) */
