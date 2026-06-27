const SUPABASE_URL = "https://ybsrkghhgurjgrfukgox.supabase.co";
const SUPABASE_KEY = "sb_publishable_gxjNTA6NmdNdyt46l11XBg_3NlCFRrX";
let user = null;
let currentReward = null;

/* 🎁 PREMIOS */
const rewards = [
  { name: "💩 Piedra", chance: 35 },
  { name: "🪙 Moneda", chance: 25 },
  { name: "🍀 Suerte", chance: 15 },
  { name: "💎 Cristal", chance: 12 },
  { name: "🧠 Chip IA", chance: 8 },
  { name: "👑 Corona", chance: 4 },
  { name: "🌌 LEGENDARIO", chance: 1 }
];

/* LOGIN */
async function register(email, password) {
  return await client.auth.signUp({ email, password });
}

async function login(email, password) {
  const { data } = await client.auth.signInWithPassword({
    email,
    password
  });
  user = data.user;
}

/* RASCA */
function getReward() {
  let r = Math.random() * 100;
  let acc = 0;

  for (let item of rewards) {
    acc += item.chance;
    if (r <= acc) return item.name;
  }
}

/* UI */
document.getElementById("scratchBtn").onclick = () => {
  currentReward = getReward();
  document.getElementById("result").innerText =
    "🎉 " + currentReward;
};

/* RECLAMAR */
document.getElementById("claimBtn").onclick = async () => {
  if (!user) {
    alert("Debes iniciar sesión");
    return;
  }

  await client.from("rewards").insert([
    {
      user_id: user.id,
      reward_name: currentReward
    }
  ]);

  alert("Premio guardado");
};

/* REGISTER */
document.getElementById("registerBtn").onclick = async () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  const { error } = await register(email, pass);

  document.getElementById("result").innerText =
    error ? error.message : "Usuario creado";
};

/* LOGIN */
document.getElementById("loginBtn").onclick = async () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  const { error } = await login(email, pass);

  document.getElementById("result").innerText =
    error ? error.message : "Sesión iniciada";
};
