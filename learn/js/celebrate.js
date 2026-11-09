// Ported from Checkpoint Quest. Celebrations when a student finishes something. Two sizes:
// - set(xp): a finished set (word review, quiz, reading, one listening task, a game). Coin sound, gold stars burst
//   from the top of the screen and a "+XP" chip counts up. Nothing to tap.
// - big({ icon, title, sub, xp }): a milestone (a whole unit listening section, a mission, a unit test passed).
//   Arcade victory tune, a flash, spinning light rays, a gold badge that stamps in, confetti from both sides.
//   Tap anywhere (or press a key) to carry on.
// Sounds follow the student's mute button (sound.js); motion is cut down for reduced motion.
import { play } from "./sound.js?v=19e7aff6";

const COLOURS = ["#FFD54A", "#4FC3F7", "#F06292", "#81C784", "#FF8A65", "#B388FF"];
const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Confetti on a canvas over the whole screen. mode "stars": a burst of stars from the top middle; "cannons": both bottom corners.
function confetti(layer, mode) {
  const cv = document.createElement("canvas"); cv.className = "celfx"; layer.appendChild(cv);
  const W = innerWidth, H = innerHeight, dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = W * dpr; cv.height = H * dpr; const g = cv.getContext("2d"); g.scale(dpr, dpr);
  const P = [], add = (x, y, vx, vy) => P.push({ x, y, vx, vy, w: 6 + Math.random() * 6, h: 4 + Math.random() * 5, a: Math.random() * 6, va: (Math.random() - .5) * .4, c: COLOURS[P.length % COLOURS.length] });
  if (mode === "cannons") for (let i = 0; i < 160; i++) {
    const left = i % 2 === 0, sp = 9 + Math.random() * 9, ang = (left ? -62 : -118) * Math.PI / 180 + (Math.random() - .5) * .7;
    add(left ? 0 : W, H, Math.cos(ang) * sp, Math.sin(ang) * sp);
  } else for (let i = 0; i < 36; i++) { const ang = Math.PI * (.1 + .8 * Math.random()), sp = 3 + Math.random() * 6; add(W / 2, 70, Math.cos(ang) * sp * 1.4, Math.sin(ang) * sp - 3); }
  let f = 0; const last = reduced() ? 1 : 190;
  (function step() {
    g.clearRect(0, 0, W, H);
    P.forEach(p => {
      p.vy += .2; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va;
      g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.c;
      if (mode === "stars") { g.font = "18px serif"; g.fillText("★", -7, 7); } else g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      g.restore();
    });
    if (++f < last) requestAnimationFrame(step); else cv.remove();
  })();
}
function countUp(el, to, ms) {
  const t0 = performance.now();
  (function s(now) { const k = Math.min(1, (now - t0) / ms); el.textContent = `+${Math.round(to * k)} XP`; if (k < 1) requestAnimationFrame(s); })(t0);
}
function layer() {
  let l = document.getElementById("celebrate");
  if (!l) { l = document.createElement("div"); l.id = "celebrate"; document.body.appendChild(l); }
  return l;
}

export function set(xp = 0) {
  play("coins");
  const l = layer(); confetti(l, "stars");
  if (xp > 0) {
    const chip = document.createElement("div"); chip.className = "celchip"; chip.setAttribute("aria-hidden", "true"); l.appendChild(chip);
    countUp(chip, xp, 800); setTimeout(() => chip.remove(), 2400);
  }
}

export function big({ icon = "🏆", title, sub = "", xp = 0 } = {}) {
  play("arcade");
  const l = layer(), box = document.createElement("div");
  box.className = "celbig"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", title);
  box.innerHTML = `<div class="celrays" aria-hidden="true"></div><div class="celflash" aria-hidden="true"></div>
    <div class="celcard"><div class="celbadge" aria-hidden="true">${icon}</div><p class="celtitle">${esc(title)}</p>${sub ? `<p class="celsub">${esc(sub)}</p>` : ""}
      ${xp > 0 ? `<p class="celxp">+0 XP</p>` : ""}<p class="celtap">Tap to continue</p></div>`;
  l.appendChild(box);
  if (xp > 0) countUp(box.querySelector(".celxp"), xp, 1400);
  setTimeout(() => confetti(l, "cannons"), 250);
  const close = () => { box.classList.add("out"); setTimeout(() => box.remove(), 300); document.removeEventListener("keydown", close); };
  setTimeout(() => { box.addEventListener("click", close); document.addEventListener("keydown", close); }, 700);    // no accidental close straight away
}
