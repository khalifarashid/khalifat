// Synthesizes a deterministic SFX kit as 16-bit mono WAVs. No downloads.
import fs from "node:fs";
const SR = 44100;

const wav = (samples) => {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v * 32700), 44 + i * 2);
  }
  return buf;
};
const mk = (dur, fn) => { const n = (SR * dur) | 0; const o = new Float32Array(n);
  for (let i = 0; i < n; i++) o[i] = fn(i / SR, i / n); return o; };

// deterministic pseudo-noise
let seed = 12345;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed / 0x7fffffff) * 2 - 1; };

// one-pole lowpass
const lp = (buf, a) => { let y = 0; const o = new Float32Array(buf.length);
  for (let i = 0; i < buf.length; i++) { y += a * (buf[i] - y); o[i] = y; } return o; };

const out = {};

// whoosh: filtered noise burst, bandpass sweep via lp on rising cutoff
{
  const raw = mk(0.55, () => rnd());
  const o = new Float32Array(raw.length); let y = 0;
  for (let i = 0; i < raw.length; i++) {
    const t = i / raw.length;
    const a = 0.02 + Math.sin(t * Math.PI) * 0.5;      // sweep
    y += a * (raw[i] - y);
    const env = Math.sin(Math.PI * Math.pow(t, 0.75)) ** 2;
    o[i] = y * env * 0.85;
  }
  out.whoosh = o;
}
// pop / click: pitch-dropping sine + tick transient
out.pop = mk(0.16, (t, u) => {
  const f = 1400 * Math.exp(-t * 26) + 180;
  const env = Math.exp(-t * 30);
  return (Math.sin(2 * Math.PI * f * t) * 0.7 + rnd() * Math.exp(-t * 160) * 0.35) * env;
});
// bass hit: sine thump on the cut
out.bass = mk(0.7, (t) => {
  const f = 130 * Math.exp(-t * 9) + 42;
  const env = Math.exp(-t * 5.2);
  return (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t)) * env * 0.8;
});
// riser: rising noise + rising tone into a cut
out.riser = mk(1.0, (t, u) => {
  const f = 200 * Math.pow(6, u);
  const env = Math.pow(u, 2.1);
  return (Math.sin(2 * Math.PI * f * t) * 0.45 + rnd() * 0.35) * env * 0.55;
});
// tick: for the counters
out.tick = mk(0.05, (t) => Math.sin(2 * Math.PI * 2400 * t) * Math.exp(-t * 160) * 0.4);
// shimmer: detuned high sines
out.shimmer = mk(1.2, (t, u) => {
  const env = Math.sin(Math.PI * u) ** 1.4;
  return (Math.sin(2 * Math.PI * 1760 * t) + Math.sin(2 * Math.PI * 1774 * t) + Math.sin(2 * Math.PI * 2637 * t) * 0.5) / 3 * env * 0.35;
});
// 30s music bed: detuned pad drone + soft 100bpm pulse, low volume
{
  const dur = 31, n = SR * dur; const o = new Float32Array(n);
  const chord = [110, 164.81, 220, 329.63]; // A minor-ish open
  const bpm = 100, spb = 60 / bpm;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let v = 0;
    for (const f of chord) {
      v += Math.sin(2 * Math.PI * f * t) + Math.sin(2 * Math.PI * (f * 1.004) * t);
    }
    v = (v / (chord.length * 2)) * 0.5;
    v *= 0.75 + 0.25 * Math.sin(t / 3.1);                 // slow swell
    const bt = t % spb;
    const kick = Math.sin(2 * Math.PI * (70 * Math.exp(-bt * 12) + 40) * bt) * Math.exp(-bt * 9) * 0.5;
    const fade = Math.min(1, t / 2) * Math.min(1, (dur - t) / 2);
    o[i] = (v + kick) * fade * 0.7;
  }
  out.music = lp(o, 0.35);
}

fs.mkdirSync("public/sfx", { recursive: true });
for (const [k, v] of Object.entries(out)) fs.writeFileSync(`public/sfx/${k}.wav`, wav(v));
console.log("wrote", Object.keys(out).join(", "));
