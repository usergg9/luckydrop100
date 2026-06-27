
/* ================= SUPABASE ================= */
const client = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/* ================= ESTADO ================= */
let user = null;
let currentPrize = null;
let isDrawing = false;

/* ================= PREMIOS (PROBABILIDAD REAL) ================= */
const prizes = [
  { name: "🪨 Piedra del Desierto", chance: 35 },
  { name: "🪙 Moneda del Tiempo", chance: 25 },
  { name: "🍀 Trébol de Fortuna", chance: 15 },
  { name: "💎 Cristal Aurora", chance: 12 },
  { name: "🧠 Núcleo IA", chance: 8 },
  { name: "👑 Corona Imperial", chance: 4 },
  { name: "🌌 Fragmento Universo", chance: 1 }
];

/* ================= GENERAR PREMIO ================= */
function generatePrize() {
  let r = Math.random() * 100;
  let acc = 0;

  for (let p of prizes) {
    acc += p.chance;
    if (r <= acc) return p.name;
  }
}

/* ================= SCRATCH CANVAS ================= */
const canvas = document.getElementById("scratchCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  ctx.fillStyle = "#9ca3af";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

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
  ctx.arc(x, y, 22, 0, Math.PI * 2);
  ctx.fill();
}

/* eventos */
canvas.addEventListener("mousedown", () => isDrawing = true);
canvas.addEventListener("mouseup", () => isDrawing = false);
canvas.addEventListener("touchstart", () => isDrawing = true);
canvas.addEventListener("touchend", () => isDrawing = false);

canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;
  const p = getPos(e);
  scratch(p.x, p.y);
});

canvas.addEventListener("touchmove", (e) => {
  if (!isDrawing) return;
  const p = getPos(e);
  scratch(p.x, p.y);
});

/* ================= INICIAR JUEGO ================= */
window.onload = () => {
  currentPrize = generatePrize();
  document.getElementById("prizeReveal").innerText = "🎁 Sigue rascando...";
};

/* ================= CANJEAR ================= */
document.getElementById("claimBtn").onclick = async () => {
  if (!user) {
    openLogin();
    return;
  }

  document.getElementById("prizeReveal").innerText = currentPrize;

  await client.from("rewards").insert([{
    user_id: user.id,
    reward_name: currentPrize
  }]);
};

/* ================= PERFIL MENU ================= */
const sideMenu = document.getElementById("sideMenu");
const overlay = document.getElementById("overlay");

function openMenu() {
  sideMenu.classList.remove("hidden");
  overlay.classList.remove("hidden");
}

function closeMenu() {
  sideMenu.classList.add("hidden");
  overlay.classList.add("hidden");
}

/* cerrar tocando fuera */
overlay.addEventListener("click", closeMenu);

document.getElementById("profileBtn").onclick = openMenu;

/* ================= MODAL LOGIN ================= */
const authModal = document.getElementById("authModal");

function openLogin() {
  authModal.classList.remove("hidden");
}

function closeLogin() {
  authModal.classList.add("hidden");
}

/* ================= AUTH ================= */
async function login(email, pass) {
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password: pass
  });

  if (error) return alert(error.message);

  user = data.user;
  closeLogin();
}

async function register(email, pass, username) {
  const { data, error } = await client.auth.signUp({
    email,
    password: pass
  });

  if (error) return alert(error.message);

  user = data.user;

  await client.from("users").insert([{
    id: user.id,
    email,
    username
  }]);

  closeLogin();
}

/* botones login */
document.getElementById("loginBtn").onclick = () => {
  const email = document.getElementById("emailInput").value;
  const pass = document.getElementById("passInput").value;
  login(email, pass);
};

document.getElementById("registerBtn").onclick = () => {
  const email = document.getElementById("emailInput").value;
  const pass = document.getElementById("passInput").value;
  const username = document.getElementById("userInput").value;

  register(email, pass, username);
};

/* ================= BOTÓN CANJEAR ================= */
document.getElementById("claimBtn").disabled = false;
