
document.addEventListener("DOMContentLoaded", () => {

/* =========================
   SUPABASE INIT
========================= */

const SUPABASE_URL = "https://ybsrkghhgurjgrfukgox.supabase.co";
const SUPABASE_KEY = "TU_SUPABASE_KEY_AQUI";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* =========================
   ESTADO GLOBAL
========================= */

let currentUser = null;
let currentReward = null;
let isDrawing = false;
let scratchPercent = 0;
let dailyAttempts = 3;

/* =========================
   PREMIOS (PROBABILIDAD REAL)
========================= */

const rewards = [
  { name: "Piedra", chance: 35 },
  { name: "Moneda Antigua", chance: 25 },
  { name: "Suerte", chance: 15 },
  { name: "Cristal", chance: 12 },
  { name: "Chip IA", chance: 8 },
  { name: "Corona", chance: 4 },
  { name: "LEGENDARIO", chance: 1 }
];

/* =========================
   DOM ELEMENTS (BASE)
========================= */

const canvas = document.getElementById("scratchCanvas");
const ctx = canvas.getContext("2d");

const rewardText = document.getElementById("rewardText");
const claimBtn = document.getElementById("claimBtn");
const resetBtn = document.getElementById("resetBtn");

const scratchPercentText = document.getElementById("scratchPercent");

const profileBtn = document.getElementById("profileBtn");
const profilePanel = document.getElementById("profilePanel");

const overlay = document.getElementById("overlay");

/* MODALES */
const avatarModal = document.getElementById("avatarModal");
const rewardsModal = document.getElementById("rewardsModal");
const statsModal = document.getElementById("statsModal");
const leaderboardModal = document.getElementById("leaderboardModal");

console.log("🚀 LuckyDrop iniciado correctamente");

});

/* =========================
   INIT SCRATCH CARD
========================= */

function initScratch() {

  canvas.width = 320;
  canvas.height = 220;

  ctx.fillStyle = "#c0c0c0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = "destination-out";

  currentReward = getRandomReward();
  rewardText.innerText = currentReward;

  scratchPercent = 0;
  updateScratchUI();

  claimBtn.disabled = true;
}

initScratch();

/* =========================
   OBTENER PREMIO RANDOM
========================= */

function getRandomReward() {

  let rand = Math.random() * 100;
  let acc = 0;

  for (let r of rewards) {
    acc += r.chance;
    if (rand <= acc) return r.name;
  }

  return "Piedra";
}

/* =========================
   SCRATCH LOGIC (MOUSE + TOUCH)
========================= */

function scratch(x, y) {

  ctx.beginPath();
  ctx.arc(x, y, 18, 0, Math.PI * 2);
  ctx.fill();

  scratchPercent += 1;

  if (scratchPercent >= 10) {
    claimBtn.disabled = false;
  }

  updateScratchUI();
}

/* =========================
   MOUSE EVENTS
========================= */

canvas.addEventListener("mousedown", () => isDrawing = true);
canvas.addEventListener("mouseup", () => isDrawing = false);
canvas.addEventListener("mouseleave", () => isDrawing = false);

canvas.addEventListener("mousemove", (e) => {

  if (!isDrawing) return;

  const rect = canvas.getBoundingClientRect();

  scratch(e.clientX - rect.left, e.clientY - rect.top);

});

/* =========================
   TOUCH EVENTS (MÓVIL)
========================= */

canvas.addEventListener("touchstart", () => isDrawing = true);
canvas.addEventListener("touchend", () => isDrawing = false);

canvas.addEventListener("touchmove", (e) => {

  if (!isDrawing) return;

  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];

  scratch(
    touch.clientX - rect.left,
    touch.clientY - rect.top
  );

});

/* =========================
   UI UPDATE
========================= */

function updateScratchUI() {

  const percent = Math.min(scratchPercent, 100);

  scratchPercentText.innerText = percent + "%";

  const fill = document.getElementById("scratchFill");

  if (fill) {
    fill.style.width = percent + "%";
  }
}

/* =========================
   RESET SCRATCH
========================= */

resetBtn.addEventListener("click", () => {

  initScratch();

  claimBtn.innerText = "Canjear premio";
  claimBtn.disabled = true;

});

/* =========================
   AUTH: REGISTRO
========================= */

const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");

const regUsername = document.getElementById("regUsername");
const regEmail = document.getElementById("regEmail");
const regPassword = document.getElementById("regPassword");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

async function registerUser() {

  const email = regEmail.value;
  const password = regPassword.value;
  const username = regUsername.value;

  if (!email || !password || !username) {
    alert("Completa todos los campos");
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  const userId = data.user.id;

  await supabaseClient.from("profiles").insert([
    {
      id: userId,
      username: username,
      avatar: "👤"
    }
  ]);

  currentUser = data.user;

  loadUserUI(currentUser);

  alert("Cuenta creada ✔");
}

/* =========================
   AUTH: LOGIN
========================= */

async function loginUser() {

  const email = loginEmail.value;
  const password = loginPassword.value;

  if (!email || !password) {
    alert("Completa los campos");
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  currentUser = data.user;

  loadUserUI(currentUser);

  alert("Bienvenido ✔");
}

/* =========================
   LOAD USER DATA
========================= */

async function loadUserUI(user) {

  const { data } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!data) return;

  document.getElementById("usernameText").innerText = data.username;
  document.getElementById("emailText").innerText = user.email;

  document.getElementById("authState").classList.add("hidden");
  document.getElementById("userState").classList.remove("hidden");

}

/* =========================
   LOGOUT
========================= */

const logoutBtn = document.getElementById("logoutBtn");

async function logoutUser() {

  await supabaseClient.auth.signOut();

  currentUser = null;

  document.getElementById("authState").classList.remove("hidden");
  document.getElementById("userState").classList.add("hidden");

}

/* =========================
   EVENT LISTENERS
========================= */

registerBtn.addEventListener("click", registerUser);
loginBtn.addEventListener("click", loginUser);
logoutBtn.addEventListener("click", logoutUser);

/* =========================
   SESSION CHECK (AUTO LOGIN)
========================= */

async function checkSession() {

  const { data } = await supabaseClient.auth.getSession();

  if (data.session) {
    currentUser = data.session.user;
    loadUserUI(currentUser);
  }

}

checkSession();

/* =========================
   GUARDAR PREMIO
========================= */

async function claimReward() {

  if (!currentUser) {
    alert("Debes iniciar sesión primero");
    return;
  }

  if (scratchPercent < 10) {
    alert("Debes rascar al menos un 10%");
    return;
  }

  if (dailyAttempts <= 0) {
    alert("Has agotado tus intentos de hoy");
    return;
  }

  const { error } = await supabaseClient
    .from("rewards")
    .insert([
      {
        user_id: currentUser.id,
        reward_name: currentReward
      }
    ]);

  if (error) {
    alert("Error al guardar premio");
    return;
  }

  dailyAttempts--;

  updateDailyUI();

  claimBtn.innerText = "Volver a rascar";
  claimBtn.disabled = true;

  alert("Premio canjeado ✔");

}

claimBtn.addEventListener("click", claimReward);

/* =========================
   INTENTOS DIARIOS
========================= */

async function loadDailyAttempts() {

  if (!currentUser) return;

  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabaseClient
    .from("daily_attempts")
    .select("*")
    .eq("user_id", currentUser.id)
    .eq("day", today)
    .single();

  if (data) {
    dailyAttempts = 3 - data.attempts;
  } else {
    dailyAttempts = 3;
  }

  updateDailyUI();
}

async function saveDailyAttempt() {

  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabaseClient
    .from("daily_attempts")
    .select("*")
    .eq("user_id", currentUser.id)
    .eq("day", today)
    .single();

  if (data) {

    await supabaseClient
      .from("daily_attempts")
      .update({ attempts: 3 - dailyAttempts })
      .eq("id", data.id);

  } else {

    await supabaseClient
      .from("daily_attempts")
      .insert([
        {
          user_id: currentUser.id,
          attempts: 1,
          day: today
        }
      ]);

  }

}

function updateDailyUI() {
  const el = document.getElementById("attemptsLeft");
  if (el) el.innerText = dailyAttempts;
}

/* =========================
   AVATARES
========================= */

const avatarOptions = document.querySelectorAll(".avatar-option");

avatarOptions.forEach(av => {

  av.addEventListener("click", async () => {

    if (!currentUser) return;

    const avatar = av.innerText;

    await supabaseClient
      .from("profiles")
      .update({ avatar })
      .eq("id", currentUser.id);

    document.getElementById("userAvatar").innerText = avatar;

    alert("Avatar actualizado ✔");

  });

});

/* =========================
   CARGAR PREMIOS
========================= */

async function loadUserRewards() {

  if (!currentUser) return;

  const { data } = await supabaseClient
    .from("rewards")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  const list = document.getElementById("rewardsList");
  if (!list) return;

  list.innerHTML = "";

  data.forEach(r => {

    const div = document.createElement("div");
    div.className = "reward-item";

    div.innerHTML = `
      <div>🎁 ${r.reward_name}</div>
      <small>${new Date(r.created_at).toLocaleString()}</small>
    `;

    list.appendChild(div);

  });

}

/* =========================
   OPEN REWARDS PANEL
========================= */

document.getElementById("openRewards").addEventListener("click", () => {
  document.getElementById("rewardsModal").classList.remove("hidden");
  loadUserRewards();
});

/* =========================
   RESET AFTER CLAIM
========================= */

resetBtn.addEventListener("click", () => {

  if (dailyAttempts <= 0) {
    alert("No tienes intentos disponibles");
    return;
  }

  initScratch();

});

/* =========================
   GLOBAL INIT USER DATA
========================= */

async function initUserData() {

  if (!currentUser) return;

  await loadDailyAttempts();
  await loadUserRewards();

}

/* =========================
   LEADERBOARD (LEGENDARIOS)
========================= */

async function loadLeaderboard() {

  const { data } = await supabaseClient
    .from("rewards")
    .select("*, profiles(username)")
    .eq("reward_name", "LEGENDARIO")
    .order("created_at", { ascending: false });

  const list = document.getElementById("leaderboardList");
  if (!list) return;

  list.innerHTML = "";

  data.forEach(item => {

    const div = document.createElement("div");
    div.className = "leader-item";

    div.innerHTML = `
      <div>👑 ${item.profiles?.username || "Anónimo"}</div>
      <small>${new Date(item.created_at).toLocaleString()}</small>
    `;

    list.appendChild(div);

  });

}

/* =========================
   OPEN LEADERBOARD
========================= */

document.getElementById("openLeaderboard").addEventListener("click", () => {

  document.getElementById("leaderboardModal").classList.remove("hidden");

  loadLeaderboard();

});

/* =========================
   ESTADÍSTICAS GLOBALES
========================= */

async function loadGlobalStats() {

  const { data } = await supabaseClient
    .from("rewards")
    .select("reward_name");

  const stats = {
    "Piedra": 0,
    "Moneda Antigua": 0,
    "Suerte": 0,
    "Cristal": 0,
    "Chip IA": 0,
    "Corona": 0,
    "LEGENDARIO": 0
  };

  data.forEach(r => {
    if (stats[r.reward_name] !== undefined) {
      stats[r.reward_name]++;
    }
  });

  document.getElementById("statStone").innerText = stats["Piedra"];
  document.getElementById("statCoin").innerText = stats["Moneda Antigua"];
  document.getElementById("statLuck").innerText = stats["Suerte"];
  document.getElementById("statCrystal").innerText = stats["Cristal"];
  document.getElementById("statAI").innerText = stats["Chip IA"];
  document.getElementById("statCrown").innerText = stats["Corona"];
  document.getElementById("statLegendary").innerText = stats["LEGENDARIO"];

}

/* =========================
   OPEN STATS
========================= */

document.getElementById("openStats").addEventListener("click", () => {

  document.getElementById("statsModal").classList.remove("hidden");

  loadGlobalStats();

});

/* =========================
   CLOSE MODALS FIX
========================= */

document.querySelectorAll(".closeModal").forEach(btn => {

  btn.addEventListener("click", () => {

    document.querySelectorAll(".modal").forEach(m => {
      m.classList.add("hidden");
    });

    document.getElementById("globalOverlay").classList.add("hidden");

  });

});

/* =========================
   CLICK OUTSIDE CLOSE
========================= */

document.getElementById("globalOverlay").addEventListener("click", () => {

  document.querySelectorAll(".modal").forEach(m => {
    m.classList.add("hidden");
  });

});

/* =========================
   FINAL INIT APP
========================= */

async function initApp() {

  const { data } = await supabaseClient.auth.getSession();

  if (data.session) {

    currentUser = data.session.user;

    await loadUserUI(currentUser);
    await initUserData();

  }

  console.log("🎮 LuckyDrop listo y funcionando");

}

initApp();

/* =========================
   SAFE RESET SYSTEM FIX
========================= */

window.addEventListener("error", (e) => {
  console.log("⚠️ Error capturado:", e.message);
});
