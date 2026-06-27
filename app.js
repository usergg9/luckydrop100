// Crear cliente de Supabase
const client = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let user = null;
let currentReward = null;

// PREMIOS
const rewards = [
  { name: "💩 Piedra", chance: 35 },
  { name: "🪙 Moneda", chance: 25 },
  { name: "🍀 Suerte", chance: 15 },
  { name: "💎 Cristal", chance: 12 },
  { name: "🧠 Chip IA", chance: 8 },
  { name: "👑 Corona", chance: 4 },
  { name: "🌌 LEGENDARIO", chance: 1 }
];

// REGISTRO
async function register(email, password) {
  const { data, error } = await client.auth.signUp({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Usuario registrado");
}

// LOGIN
async function login(email, password) {
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  user = data.user;

  alert("Sesión iniciada");
}

// Obtener premio
function getReward() {
  let r = Math.random() * 100;
  let total = 0;

  for (const reward of rewards) {
    total += reward.chance;

    if (r <= total) {
      return reward.name;
    }
  }
}

// Rascar
document.getElementById("scratchBtn").onclick = () => {

  currentReward = getReward();

  document.getElementById("result").innerHTML =
    "🎉 Has conseguido:<br><br><b>" + currentReward + "</b>";

};

// Reclamar
document.getElementById("claimBtn").onclick = async () => {

  if (!currentReward) {
    alert("Primero rasca.");
    return;
  }

  if (!user) {
    alert("Debes iniciar sesión para reclamar.");
    return;
  }

  const { error } = await client
    .from("rewards")
    .insert([
      {
        user_id: user.id,
        reward_name: currentReward
      }
    ]);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Premio guardado correctamente.");
};

// BOTÓN REGISTRO
document.getElementById("registerBtn").onclick = async () => {

  const email =
    document.getElementById("email").value;

  const password =
    document.getElementById("password").value;

  await register(email, password);

};

// BOTÓN LOGIN
document.getElementById("loginBtn").onclick = async () => {

  const email =
    document.getElementById("email").value;

  const password =
    document.getElementById("password").value;

  await login(email, password);

};
