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
  { name: "🧠 Chip IA", chance: 8 },
  { name: "👑 Corona", chance: 4 },
  { name: "🌌 LEGENDARIO", chance: 1 }
];

/* SCRATCH */
function getReward() {
  let r = Math.random() * 100;
  let acc = 0;

  for (let item of rewards) {
    acc += item.chance;
    if (r <= acc) return item.name;
  }
}

/* RASCAR */
document.getElementById("scratchBtn").onclick = () => {

  if (tries <= 0) {
    alert("No te quedan intentos hoy");
    return;
  }

  tries--;
  document.getElementById("tries").innerText = tries;

  currentReward = getReward();

  document.getElementById("result").innerHTML =
    "🎉 Has conseguido: <b>" + currentReward + "</b>";
};

/* RECLAMAR */
document.getElementById("claimBtn").onclick = async () => {

  if (!user) {
    alert("Debes iniciar sesión");
    return;
  }

  if (!currentReward) {
    alert("Primero rasca");
    return;
  }

  await client.from("rewards").insert([{
    user_id: user.id,
    reward_name: currentReward
  }]);

  alert("Premio guardado");
};

/* REGISTER */
document.getElementById("registerBtn").onclick = async () => {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value;

  const { data, error } = await client.auth.signUp({
    email,
    password
  });

  if (error) return alert(error.message);

  user = data.user;

  await client.from("users").insert([{
    id: user.id,
    email,
    username
  }]);

  alert("Usuario creado");
};

/* LOGIN */
document.getElementById("loginBtn").onclick = async () => {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) return alert(error.message);

  user = data.user;

  alert("Sesión iniciada");
};
