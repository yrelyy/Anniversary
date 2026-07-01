/* =====================================================================
   EDIT ME FIRST — all the personal stuff lives in this block.
   Swap the text, names, date, and image paths for your own.
   Put real photos inside the /images folder and point to them below,
   e.g. image: "images/smile.jpg"
   ===================================================================== */

const YOUR_NAME = "Me";
const PARTNER_NAME = "You";
const ANNIVERSARY_DATE = "June 2026";

const LETTER_TEXT =
`Three years ago I didn't just gain a partner, I gained my favorite
person to build a life with.

Every ordinary day with you turned into something worth remembering,
and every hard day got softer because you were in it with me.

This little game was silly on purpose, because loving you has never
felt heavy. Thank you for three years of showing up, laughing loud,
and choosing us again and again.

Here's to every year that's still ahead of us.`;

const REASONS = [
  { icon: "😊", title: "His Smile", caption: "it still gives me butterflies, every single time.", image: "smile.jpg" },
  { icon: "🫂", title: "His Presence", caption: "any room feels like home when you're in it.", image: "presence.jpg" },
  { icon: "💫", title: "His Soul", caption: "the kindest, most honest person I know.", image: "soul.jpg" },
  { icon: "😂", title: "His Laugh", caption: "my favorite sound, no contest.", image: "laugh.jpg" },
  { icon: "❤️", title: "His Heart", caption: "the gentlest one I've ever met.", image: "heart.jpg" },
  { icon: "🍯", title: "His Sweetness", caption: "the little things you do always make my heart feel so loved.", image: "sweetness.jpg" },
  { icon: "🌹", title: "His Efforts", caption: "every effort you make, no matter how small, means the world to me.", image: "efforts.jpg" },
  { icon: "⭐", title: "My Constant", caption: "through every high and low, you've always been my safe place.", image: "constant.jpg" },
];

const FINALE_TEXT =
`Three years down. Forever to go.
Thank you for being my person.
I love you so much, my ray of sunshine`;

/* ===================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  spawnAmbientHearts();
  initReasons();
  initLetter();
  initGame();
  bindNav();

  document.getElementById("finaleNames").textContent = `${YOUR_NAME} 💕 ${PARTNER_NAME}`;
  document.getElementById("finaleText").textContent = FINALE_TEXT;
  document.getElementById("letterBody").textContent = LETTER_TEXT;
  document.getElementById("letterFrom").textContent = YOUR_NAME;
});

/* ---------------- screen switching ---------------- */
function showScreen(id){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function bindNav(){
  document.getElementById("startGameBtn").addEventListener("click", () => {
    showScreen("screen-game");
    startGame();
  });
  document.getElementById("toReasonsBtn").addEventListener("click", () => showScreen("screen-reasons"));
  document.getElementById("toFinaleBtn").addEventListener("click", () => {
    showScreen("screen-finale");
    launchConfetti();
    createFlowers();
  });
  document.getElementById("replayBtn").addEventListener("click", () => {
    showScreen("screen-intro");
    resetLetter();
    document.querySelectorAll(".reason-card").forEach(c => c.classList.remove("flipped"));
  });
  document.getElementById("tryAgainBtn").addEventListener("click", () => {
    startGame();
});
}

/* ---------------- ambient floating hearts ---------------- */
function spawnAmbientHearts(){
  const wrap = document.getElementById("ambientHearts");
  const emojis = ["💙","💜","❤️","💗"];
  setInterval(() => {
    const h = document.createElement("div");
    h.className = "ambient-heart";
    h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    h.style.left = Math.random() * 100 + "vw";
    h.style.animationDuration = (8 + Math.random() * 6) + "s";
    h.style.fontSize = (14 + Math.random() * 16) + "px";
    wrap.appendChild(h);
    setTimeout(() => h.remove(), 16000);
  }, 900);
}

/* ---------------- letter / envelope ---------------- */
function initLetter(){
  document.getElementById("envelope").addEventListener("click", openEnvelope);
}
function openEnvelope(){
  document.getElementById("envelope").classList.add("opened");
  setTimeout(() => document.getElementById("letterPaper").classList.add("show"), 350);
}
function resetLetter(){
  document.getElementById("envelope").classList.remove("opened");
  document.getElementById("letterPaper").classList.remove("show");
}

/* ---------------- reasons grid ---------------- */
function initReasons(){
  const grid = document.getElementById("reasonsGrid");
  grid.innerHTML = "";
  REASONS.forEach(r => {
    const card = document.createElement("div");
    card.className = "reason-card";
    card.innerHTML = `
      <div class="reason-card-inner">
        <div class="reason-face reason-front">
          <div class="reason-icon">${r.icon}</div>
          <div class="reason-title">${r.title}</div>
        </div>
        <div class="reason-face reason-back">
          <img src="${r.image}" alt="${r.title}">
          <div class="reason-caption">${r.caption}</div>
        </div>
      </div>`;
    card.addEventListener("click", () => card.classList.toggle("flipped"));
    grid.appendChild(card);
  });
}

/* ---------------- finale confetti ---------------- */
function launchConfetti(){
  const wrap = document.getElementById("finaleConfetti");
  wrap.innerHTML = "";
  const emojis = ["💙","💜","❤️","💗","✨","🎉"];
  for(let i = 0; i < 45; i++){
    const p = document.createElement("div");
    p.className = "confetti-piece";
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.left = Math.random() * 100 + "%";
    p.style.animationDuration = (2.5 + Math.random() * 2.5) + "s";
    p.style.animationDelay = (Math.random() * 1.5) + "s";
    wrap.appendChild(p);
  }
}

/* =====================================================================
   THE GAME — a heart with little wings flies through 3 "photo posts".
   Forgiving physics on purpose: this is a gift, not a challenge.
   ===================================================================== */
let ctx, canvas, W, H;
let bird, gates, gameRunning, gatesPassed, animId;
const GATES_TO_WIN = 3;

function initGame(){
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  canvas.addEventListener("mousedown", flap);
  canvas.addEventListener("touchstart", (e) => { e.preventDefault(); flap(); }, { passive:false });
  document.addEventListener("keydown", (e) => { if(e.code === "Space") flap(); });
}

function resizeCanvas(){
  // keep internal resolution fixed for consistent physics; CSS scales it visually
  W = canvas.width;
  H = canvas.height;
}

function startGame(){

  document.getElementById("gameOverBox").style.display = "none";

  bird = {
    x: W * 0.28,
    y: H / 2,
    vy: 0,
    r: 16,
    wing: 0
  };

  gates = [];
  gatesPassed = 0;
  gameRunning = true;

  document.getElementById("scoreLabel").textContent =
    `Post 0 / ${GATES_TO_WIN}`;

  document.getElementById("congratsToast").classList.remove("show");

  spawnGate(W + 60);
  spawnGate(W + 360);
  spawnGate(W + 660);

  if(animId) cancelAnimationFrame(animId);

  loop();
}

function spawnGate(x){
  const gapHeight = 190; // generous & forgiving
  const margin = 70;
  const gapY = margin + Math.random() * (H - margin * 2 - gapHeight);
  gates.push({ x, gapY, gapHeight, w: 46, passed: false });
}

function flap(){
  if(!gameRunning) return;
  bird.vy = -6.4;
}

function loop(){
  update();
  draw();
  if(gameRunning) animId = requestAnimationFrame(loop);
}

function update(){
  // gentle gravity
  bird.vy += 0.28;
  bird.y += bird.vy;
  bird.wing += 0.35;

  if(bird.y - bird.r < 0){
    gameOver();
    return;
  }

  if(bird.y + bird.r > H){
    gameOver();
    return;
  }

  const speed = 2.1;
  gates.forEach(g => {
    g.x -= speed;

    // collision check (soft bounce, never "game over")
    const withinX = bird.x + bird.r > g.x - g.w/2 && bird.x - bird.r < g.x + g.w/2;
    if(withinX){
      const hitTop = bird.y - bird.r < g.gapY;
      const hitBottom = bird.y + bird.r > g.gapY + g.gapHeight;
      if(hitTop || hitBottom){
        gameOver();
        return;
      }
    }

    if(!g.passed && g.x + g.w/2 < bird.x - bird.r){
      g.passed = true;
      gatesPassed++;
      document.getElementById("scoreLabel").textContent = `Post ${Math.min(gatesPassed, GATES_TO_WIN)} / ${GATES_TO_WIN}`;
      if(gatesPassed >= GATES_TO_WIN){
        winGame();
      }
    }
  });

  // recycle gates that scroll off-screen, keep the loop feeling continuous
  gates = gates.filter(g => g.x > -100);
  if(gameRunning && gatesPassed < GATES_TO_WIN){
    const lastX = gates.length ? gates[gates.length - 1].x : W;
    if(lastX < W - 280) spawnGate(lastX + 300);
  }
}

function draw(){
  ctx.clearRect(0, 0, W, H);

  // soft starry background dots
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  for(let i = 0; i < 22; i++){
    const sx = (i * 53 + 20) % W;
    const sy = (i * 97 + 40) % H;
    ctx.fillRect(sx, sy, 2, 2);
  }

  // gates styled like polaroid photo frames with a glowing heart in the gap
  gates.forEach(g => {
    ctx.fillStyle = "#8fa0ff";
    ctx.fillRect(g.x - g.w/2, 0, g.w, g.gapY);
    ctx.fillRect(g.x - g.w/2, g.gapY + g.gapHeight, g.w, H - (g.gapY + g.gapHeight));

    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 3;
    ctx.strokeRect(g.x - g.w/2, 0, g.w, g.gapY);
    ctx.strokeRect(g.x - g.w/2, g.gapY + g.gapHeight, g.w, H - (g.gapY + g.gapHeight));

    // heart glowing in the middle of the gap
    const hy = g.gapY + g.gapHeight / 2;
    drawHeart(g.x, hy, 12, "#ff5d7a", 0.9);
  });

  // bird: heart body + two little wings
  drawBirdHeart(bird.x, bird.y, bird.r, bird.wing);
}

function drawHeart(cx, cy, size, color, alpha = 1){
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy + size * 0.3);
  ctx.bezierCurveTo(cx - size, cy - size * 0.6, cx - size * 0.4, cy - size * 1.3, cx, cy - size * 0.4);
  ctx.bezierCurveTo(cx + size * 0.4, cy - size * 1.3, cx + size, cy - size * 0.6, cx, cy + size * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBirdHeart(cx, cy, r, wingPhase){
  const flap = Math.sin(wingPhase) * 10;

  // wings (drawn behind the heart body)
  ctx.fillStyle = "#d9c6ff";
  ctx.beginPath();
  ctx.ellipse(cx - r * 1.1, cy + flap * 0.3, r * 0.9, r * 0.5, Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + r * 1.1, cy + flap * 0.3, r * 0.9, r * 0.5, -Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();

  // heart body
  drawHeart(cx, cy, r, "#ff5d7a", 1);

  // tiny sparkle face highlight
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cy - r * 0.1, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

function winGame(){
  gameRunning = false;
  const toast = document.getElementById("congratsToast");
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
    showScreen("screen-letter");
  }, 2200);
}

function gameOver(){

  gameRunning = false;

  cancelAnimationFrame(animId);

  document.getElementById("gameOverBox").style.display = "block";

}

function createFlowers() {

    const container = document.getElementById("finaleFlowers");

    const flowers = ["🌸","🌷","🌹","💐","🌺","🌼","🌻"];

    setInterval(() => {

        const flower = document.createElement("div");
        flower.className = "flower";

        flower.innerHTML =
            flowers[Math.floor(Math.random() * flowers.length)];

        flower.style.left = Math.random() * 100 + "%";
        flower.style.animationDuration =
            (4 + Math.random() * 4) + "s";

        flower.style.fontSize =
            (22 + Math.random() * 18) + "px";

        container.appendChild(flower);

        setTimeout(() => flower.remove(), 9000);

    }, 300);
}
