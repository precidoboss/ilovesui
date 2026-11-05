let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let music: GainNode | null = null;
let sfx: GainNode | null = null;
let drone: OscillatorNode | null = null;
let muted = false;

function curve(v: number) {
  return v * v;
}

function ensure() {
  if (ctx) return ctx;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new Ctx({ latencyHint: "interactive" });
  master = ctx.createGain();
  music = ctx.createGain();
  sfx = ctx.createGain();
  music.gain.value = curve(0.22);
  sfx.gain.value = curve(0.7);
  master.gain.value = muted ? 0 : 1;
  music.connect(master);
  sfx.connect(master);
  master.connect(ctx.destination);
  return ctx;
}

export function unlockAudio() {
  const audio = ensure();
  if (audio.state === "suspended") void audio.resume();
  if (!drone && music && ctx) {
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    osc.type = "sine";
    osc2.type = "triangle";
    osc.frequency.value = 196;
    osc2.frequency.value = 246.9;
    filter.type = "lowpass";
    filter.frequency.value = 420;
    const g = ctx.createGain();
    g.gain.value = 0.18;
    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(g);
    g.connect(music);
    osc.start();
    osc2.start();
    drone = osc;
  }
}

export function setMuted(next: boolean) {
  muted = next;
  if (master && ctx) {
    master.gain.setTargetAtTime(next ? 0 : 1, ctx.currentTime, 0.03);
  }
}

export function isMuted() {
  return muted;
}

function tone(freq: number, dur: number, type: OscillatorType, gain: number, slide = 0) {
  if (!ctx || !sfx || muted) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), ctx.currentTime + dur);
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  osc.connect(g);
  g.connect(sfx);
  osc.start();
  osc.stop(ctx.currentTime + dur + 0.02);
  osc.onended = () => {
    osc.disconnect();
    g.disconnect();
  };
}

export function playCatch(combo: number) {
  const wobble = 0.94 + Math.random() * 0.1;
  const base = 520 + Math.min(combo, 8) * 40;
  tone(base * wobble, 0.12, "triangle", 0.18);
  tone(base * 1.5 * wobble, 0.16, "sine", 0.1);
}

export function playHazard() {
  tone(140, 0.22, "sawtooth", 0.08, -70);
  tone(90, 0.28, "sine", 0.16, -30);
}

export function playStart() {
  tone(392, 0.18, "sine", 0.12);
  tone(523, 0.22, "triangle", 0.08);
}

export function resumeIfNeeded() {
  if (ctx && ctx.state === "suspended") void ctx.resume();
}
