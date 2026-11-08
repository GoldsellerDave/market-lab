// Ported from Checkpoint Quest. Short sound effects made with Web Audio (no sound files), and words read aloud with the browser's speech voice.
// Sound can be turned off with the speaker button in the top bar; the choice is kept on this device for each student.
let ctx = null, who = "";
const KEY = () => "ecl-sound-" + who;

export function soundUser(username) { who = username || ""; }
export function soundOn() { try { return localStorage.getItem(KEY()) !== "off"; } catch (e) { return true; } }
export function setSound(on) { try { localStorage.setItem(KEY(), on ? "on" : "off"); } catch (e) {} }

function audio() {
  const C = window.AudioContext || window.webkitAudioContext;
  if (!C) return null;
  if (!ctx) ctx = new C();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}
// [frequency Hz, start s, length s, wave, volume], or ["noise", start s, length s, volume, high-pass Hz] for a hiss (cymbal)
const C4 = 261.63, st = k => +(C4 * Math.pow(2, k / 12)).toFixed(2);       // semitones from middle C
// Finishing a set: coin pings while the XP counts up, then a ding.
const COINS = [...Array.from({ length: 9 }, (_, i) => [[988, i * .085, .06, "square", .045], [1319, i * .085 + .03, .08, "square", .045]]).flat(),
  [st(24), .85, .5, "sine", .18], [st(31), .85, .5, "sine", .12]];
// A big milestone (whole listening section, mission, unit test): an 8-bit victory tune with a bass line and a cymbal shimmer.
const ARCADE = [...[[0, 0], [4, .1], [7, .2], [12, .3], [7, .45], [12, .55], [16, .7], [19, .85], [16, 1.0], [24, 1.15]].map(([k, s]) => [st(k + 12), s, .12, "square", .06]),
  ...[[-12, 0], [-5, .3], [-12, .6], [-5, .9]].map(([k, s]) => [st(k), s, .25, "triangle", .25]),
  ...[12, 16, 19, 24].map(k => [st(k + 12), 1.35, .9, "square", .04]), [st(-12), 1.35, .9, "triangle", .3],
  ...Array.from({ length: 6 }, (_, i) => ["noise", 1.35 + i * .1, .08, .06, 5000])];
const SOUNDS = {
  tap:   [[880, 0, 0.04, "triangle", 0.05]],
  flip:  [[520, 0, 0.06, "triangle", 0.06], [780, 0.05, 0.06, "triangle", 0.05]],
  ok:    [[660, 0, 0.1, "sine", 0.16], [990, 0.09, 0.18, "sine", 0.16]],
  bad:   [[300, 0, 0.12, "triangle", 0.12], [220, 0.11, 0.2, "triangle", 0.12]],
  info:  [[440, 0, 0.12, "sine", 0.1], [392, 0.12, 0.16, "sine", 0.1]],
  level: [[523, 0, 0.1, "square", 0.06], [659, 0.1, 0.1, "square", 0.06], [784, 0.2, 0.1, "square", 0.06], [1047, 0.3, 0.25, "square", 0.07]],
  done:  [[523, 0, 0.12, "sine", 0.14], [659, 0.12, 0.12, "sine", 0.14], [784, 0.24, 0.3, "sine", 0.16]],
  win:   [[392, 0, 0.12, "square", 0.06], [523, 0.12, 0.12, "square", 0.06], [659, 0.24, 0.12, "square", 0.06], [784, 0.36, 0.14, "square", 0.07],
          [659, 0.52, 0.1, "square", 0.06], [784, 0.62, 0.4, "square", 0.08], [1047, 0.62, 0.4, "sine", 0.1]],
  coins: COINS,
  arcade: ARCADE
};
export function play(name) {
  if (!soundOn() || !SOUNDS[name]) return;
  const c = audio(); if (!c) return;
  const t0 = c.currentTime + 0.01;
  SOUNDS[name].forEach(([f, start, len, type, vol]) => {
    if (f === "noise") return hiss(c, t0 + start, len, type, vol);      // ["noise", start, length, volume, high-pass]
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t0 + start);
    g.gain.exponentialRampToValueAtTime(vol, t0 + start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + start + len);
    o.connect(g).connect(c.destination);
    o.start(t0 + start); o.stop(t0 + start + len + 0.05);
  });
}

function hiss(c, at, len, vol, hp) {
  const n = Math.floor(c.sampleRate * len), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  src.buffer = buf; f.type = "highpass"; f.frequency.value = hp;
  g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  src.connect(f).connect(g).connect(c.destination); src.start(at); src.stop(at + len + 0.05);
}

export const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;
// Read a word or sentence aloud with an English voice (British if the device has one).
export function say(text) {
  if (!canSpeak) return;
  const s = window.speechSynthesis, u = new SpeechSynthesisUtterance(text), voices = s.getVoices();
  u.voice = voices.find(v => v.lang === "en-GB") || voices.find(v => /^en/.test(v.lang)) || null;
  u.lang = u.voice ? u.voice.lang : "en-GB"; u.rate = 0.9;
  s.cancel(); s.speak(u);
}
