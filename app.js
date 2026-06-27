let client;
let user = null;
let prize = null;
let drawing = false;

/* WAIT DOM */
document.addEventListener("DOMContentLoaded", () => {

  /* ===== FIX SUPABASE (CRÍTICO) ===== */
  if (!window.supabase) {
    console.error("Supabase no cargó correctamente");
    return;
  }

  client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  /* ===== ELEMENTOS ===== */
  const $ = (id) => document.getElementById(id);

  /* ===== PREMIOS ===== */
  const prizes = [
    { name:"🪨 Piedra", chance:35 },
    { name:"🪙 Moneda", chance:25 },
    { name:"🍀 Suerte", chance:15 },
    { name:"💎 Cristal", chance:12 },
    { name:"🧠 IA", chance:8 },
    { name:"👑 Corona", chance:4 },
    { name:"🌌 LEGENDARIO", chance:1 }
  ];

  function getPrize(){
    let r = Math.random() * 100;
    let acc = 0;
    for (let p of prizes) {
      acc += p.chance;
      if (r <= acc) return p.name;
    }
  }

  /* ===== SCRATCH CANVAS ===== */
  const canvas = $("scratchCanvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  function resize(){
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.fillStyle = "#999";
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }

  window.addEventListener("load", () => {
    resize();
    prize = getPrize();
    $("prizeReveal").innerText = "🎁 ???";
  });

  function scratch(x,y){
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x,y,25,0,Math.PI*2);
    ctx.fill();

    $("prizeReveal").innerText = prize;
  }

  canvas?.addEventListener("mousedown", () => drawing = true);
  canvas?.addEventListener("mouseup", () => drawing = false);

  canvas?.addEventListener("mousemove", (e) => {
    if (!drawing) return;
    const r = canvas.getBoundingClientRect();
    scratch(e.clientX - r.left, e.clientY - r.top);
  });

  /* ===== MENU ===== */
  const sideMenu = $("sideMenu");
  const overlay = $("overlay");

  $("profileBtn")?.addEventListener("click", () => {
    sideMenu.classList.remove("hidden");
    overlay.classList.remove("hidden");
  });

  overlay?.addEventListener("click", () => {
    sideMenu.classList.add("hidden");
    overlay.classList.add("hidden");
  });

  /* ===== NAV MENU ===== */
  $("btnAvatars")?.addEventListener("click", () => {
    $("menuMain").classList.add("hidden");
    $("menuAvatars").classList.remove("hidden");
  });

  $("btnRewards")?.addEventListener("click", async () => {
    $("menuMain").classList.add("hidden");
    $("menuRewards").classList.remove("hidden");

    if (!user) return;

    let { data } = await client
      .from("rewards")
      .select("*")
      .eq("user_id", user.id);

    $("myRewards").innerHTML =
      data?.map(r => "🎁 " + r.reward_name).join("<br>") || "Sin premios";
  });

  $("back1")?.addEventListener("click", backMenu);
  $("back2")?.addEventListener("click", backMenu);

  function backMenu(){
    $("menuAvatars").classList.add("hidden");
    $("menuRewards").classList.add("hidden");
    $("menuMain").classList.remove("hidden");
  }

  /* ===== AUTH ===== */
  $("loginBtn")?.addEventListener("click", async () => {
    const email = $("loginEmail").value;
    const pass = $("loginPass").value;

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password: pass
    });

    if (error) return alert(error.message);
    user = data.user;
    alert("Login correcto");
  });

  $("registerBtn")?.addEventListener("click", async () => {
    const email = $("regEmail").value;
    const pass = $("regPass").value;

    const { error } = await client.auth.signUp({
      email,
      password: pass
    });

    if (error) return alert(error.message);
    alert("Cuenta creada");
  });

});
