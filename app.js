const client = supabase.createClient(https://ybsrkghhgurjgrfukgox.supabase.co/rest/v1/
,sb_publishable_gxjNTA6NmdNdyt46l11XBg_3NlCFRrX);

let user = null;
let currentReward = null;

/* 🎁 PREMIOS CREATIVOS */
const rewards = [
  { name: "💩 Piedra del Desierto (sin valor)", chance: 35 },
  { name: "🪙 Moneda Antigua Misteriosa", chance: 25 },
  { name: "🍀 Suerte Instantánea (+1 karma)", chance: 15 },
  { name: "💎 Cristal del Sueño Brillante", chance: 12 },
  { name: "🧠 Chip de Inteligencia Aleatoria", chance: 8 },
  { name: "👑 Corona del Usuario Elegido", chance: 4 },
  { name: "🌌 Fragmento del Universo (LEGENDARIO)", chance: 1 }
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

/* BOTÓN RASCAR */
document.getElementById("scratchBtn").onclick = () => {
  currentReward = getReward();
  document.getElementById("result").innerText =
    "🎉 Has obtenido: " + currentReward;
};

/* RECLAMAR (OBLIGA LOGIN) */
document.getElementById("claimBtn").onclick = async () => {
  if (!user) {
    alert("Debes registrarte o iniciar sesión");
    return;
  }

  await client.from("rewards").insert([
    {
      user_id: user.id,
      reward_name: currentReward
    }
  ]);

  alert("Premio guardado!");
};

/* BOTONES LOGIN */
document.getElementById("registerBtn").onclick = async () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  const { error } = await register(email, pass);

  document.getElementById("result").innerText =
    error ? error.message : "✅ Usuario creado";
};

document.getElementById("loginBtn").onclick = async () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  const { error } = await login(email, pass);

  document.getElementById("result").innerText =
    error ? error.message : "🔥 Sesión iniciada";
};
