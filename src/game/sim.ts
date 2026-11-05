import { COMMUNITY, type Favorite } from "./favorites";

export type Phase = "title" | "play" | "paused" | "over";
export type PowerKind = "aurora" | "cold";

export type Shard = {
  id: number;
  x: number;
  y: number;
  vy: number;
  sway: number;
  phase: number;
  kind: "fav" | "hazard" | "gold" | "power";
  favId: string | null;
  power: PowerKind | null;
  alive: boolean;
};

export type Bit = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  gold: boolean;
};

export type Floater = {
  x: number;
  y: number;
  text: string;
  life: number;
  gold: boolean;
};

export type Flake = { x: number; y: number; s: number; v: number };

export type Sim = {
  w: number;
  h: number;
  phase: Phase;
  x: number;
  facing: 1 | -1;
  moving: boolean;
  anim: number;
  squash: number;
  score: number;
  combo: number;
  comboTimer: number;
  lives: number;
  elapsed: number;
  spawn: number;
  nextId: number;
  shards: Shard[];
  bits: Bit[];
  floaters: Floater[];
  flakes: Flake[];
  hitstop: number;
  trauma: number;
  bag: string[];
  bagAt: number;
  thawedRun: string[];
  inputLeft: boolean;
  inputRight: boolean;
  targetX: number | null;
  reduced: boolean;
  lastFavId: string | null;
  revision: number;
  streak: number;
  bestCombo: number;
  dashT: number;
  dashCd: number;
  auroraT: number;
  coldT: number;
  powersTaken: number;
};

const LIVES = 3;
const MAX_COMBO = 8;
// Seconds you can go without a catch before the chain drops one step.
const COMBO_WINDOW = 2.2;
const DASH_TIME = 0.22;
const DASH_COOLDOWN = 1.5;
const DASH_BOOST = 2.6;
const AURORA_TIME = 8;
const COLD_TIME = 5;

export function createSim(reduced: boolean): Sim {
  const flakes: Flake[] = [];
  for (let i = 0; i < 48; i++) {
    flakes.push({
      x: Math.random(),
      y: Math.random(),
      s: 0.6 + Math.random() * 1.6,
      v: 12 + Math.random() * 28,
    });
  }
  return {
    w: 800,
    h: 600,
    phase: "title",
    x: 400,
    facing: 1,
    moving: false,
    anim: 0,
    squash: 1,
    score: 0,
    combo: 0,
    comboTimer: 0,
    lives: LIVES,
    elapsed: 0,
    spawn: 0.4,
    nextId: 1,
    shards: [],
    bits: [],
    floaters: [],
    flakes,
    hitstop: 0,
    trauma: 0,
    bag: shuffle(COMMUNITY.map((f) => f.id)),
    bagAt: 0,
    thawedRun: [],
    inputLeft: false,
    inputRight: false,
    targetX: null,
    reduced,
    lastFavId: null,
    revision: 0,
    streak: 0,
    bestCombo: 0,
    dashT: 0,
    dashCd: 0,
    auroraT: 0,
    coldT: 0,
    powersTaken: 0,
  };
}

function shuffle(ids: string[]) {
  const copy = ids.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy;
}

export function retuneBag(sim: Sim, extraIds: string[]) {
  const seen = new Set(sim.bag);
  for (const id of extraIds) {
    if (!seen.has(id)) {
      sim.bag.push(id);
      seen.add(id);
    }
  }
}

export function resizeSim(sim: Sim, w: number, h: number) {
  sim.w = w;
  sim.h = h;
  sim.x = Math.min(Math.max(sim.x, 70), Math.max(70, w - 70));
}

export function startRun(sim: Sim, extraIds: string[]) {
  sim.phase = "play";
  sim.score = 0;
  sim.combo = 0;
  sim.comboTimer = 0;
  sim.lives = LIVES;
  sim.elapsed = 0;
  sim.spawn = 0.35;
  sim.shards = [];
  sim.bits = [];
  sim.floaters = [];
  sim.hitstop = 0;
  sim.trauma = 0;
  sim.thawedRun = [];
  sim.lastFavId = null;
  sim.streak = 0;
  sim.bestCombo = 0;
  sim.dashT = 0;
  sim.dashCd = 0;
  sim.auroraT = 0;
  sim.coldT = 0;
  sim.powersTaken = 0;
  sim.x = sim.w * 0.5;
  sim.bag = shuffle([...COMMUNITY.map((f) => f.id), ...extraIds]);
  sim.bagAt = 0;
  sim.revision++;
}

/** Burst of speed in the current facing direction. Ignored while cooling down. */
export function dash(sim: Sim) {
  if (sim.phase !== "play" || sim.dashCd > 0) return;
  sim.dashT = DASH_TIME;
  sim.dashCd = DASH_COOLDOWN;
  sim.targetX = null;
  sim.squash = 0.9;
  for (let i = 0; i < 6; i++) {
    sim.bits.push({
      x: sim.x - sim.facing * 30,
      y: sim.h - 120 + Math.random() * 90,
      vx: -sim.facing * (120 + Math.random() * 120),
      vy: -30 - Math.random() * 60,
      life: 0.35 + Math.random() * 0.2,
      max: 0.55,
      gold: false,
    });
  }
}

export function step(sim: Sim, dt: number) {
  const capped = Math.min(dt, 0.05);
  sim.anim += capped;
  if (sim.squash > 1) sim.squash = Math.max(1, sim.squash - capped * 3.2);
  else if (sim.squash < 1) sim.squash = Math.min(1, sim.squash + capped * 3.2);

  if (!sim.reduced) {
    sim.trauma = Math.max(0, sim.trauma - capped * 1.8);
  } else {
    sim.trauma = 0;
  }

  for (const flake of sim.flakes) {
    flake.y += (flake.v * capped) / Math.max(sim.h, 1);
    if (flake.y > 1.05) {
      flake.y = -0.05;
      flake.x = Math.random();
    }
  }

  if (sim.phase !== "play") return;

  if (sim.hitstop > 0) {
    sim.hitstop = Math.max(0, sim.hitstop - capped);
    return;
  }

  sim.elapsed += capped;

  // Timers: power-ups, dash and the decaying combo chain.
  sim.dashT = Math.max(0, sim.dashT - capped);
  sim.dashCd = Math.max(0, sim.dashCd - capped);
  sim.auroraT = Math.max(0, sim.auroraT - capped);
  sim.coldT = Math.max(0, sim.coldT - capped);
  if (sim.combo > 0) {
    sim.comboTimer -= capped;
    if (sim.comboTimer <= 0) {
      sim.combo -= 1;
      sim.comboTimer = sim.combo > 0 ? COMBO_WINDOW : 0;
      sim.revision++;
    }
  }

  const speed = 560 * (sim.dashT > 0 ? DASH_BOOST : 1);
  let dir = 0;
  if (sim.inputLeft) dir -= 1;
  if (sim.inputRight) dir += 1;
  if (sim.dashT > 0 && dir === 0) dir = sim.facing;
  if (dir !== 0) {
    sim.x += dir * speed * capped;
    sim.facing = dir < 0 ? -1 : 1;
    sim.moving = true;
    sim.targetX = null;
  } else if (sim.targetX != null) {
    const dx = sim.targetX - sim.x;
    if (Math.abs(dx) > 6) {
      const stepDir = Math.sign(dx);
      sim.x += stepDir * speed * capped;
      sim.facing = stepDir < 0 ? -1 : 1;
      sim.moving = true;
    } else {
      sim.moving = false;
    }
  } else {
    sim.moving = false;
  }
  const margin = 64;
  sim.x = Math.min(Math.max(sim.x, margin), Math.max(margin, sim.w - margin));

  sim.spawn -= capped;
  const interval = Math.max(0.42, 1.05 - sim.elapsed * 0.012);
  if (sim.spawn <= 0) {
    sim.spawn += interval;
    spawnShard(sim);
  }

  const ground = sim.h - 108;
  const catchTop = ground - 150;
  const half = 110;
  const fall = sim.coldT > 0 ? 0.5 : 1;

  for (const shard of sim.shards) {
    if (!shard.alive) continue;
    shard.phase += capped;
    shard.y += shard.vy * fall * capped;
    shard.x += Math.sin(shard.phase * shard.sway) * 18 * capped;
    if (shard.y > catchTop && shard.y < ground && Math.abs(shard.x - sim.x) < half) {
      resolveCatch(sim, shard);
      continue;
    }
    if (shard.y > sim.h + 50) {
      if (shard.kind === "fav" && shard.alive) {
        sim.combo = 0;
        sim.comboTimer = 0;
        sim.streak = 0;
      }
      shard.alive = false;
    }
  }
  sim.shards = sim.shards.filter((s) => s.alive);

  for (const bit of sim.bits) {
    bit.life -= capped;
    bit.x += bit.vx * capped;
    bit.y += bit.vy * capped;
    bit.vy += 280 * capped;
  }
  sim.bits = sim.bits.filter((b) => b.life > 0);
  for (const floater of sim.floaters) floater.life -= capped;
  sim.floaters = sim.floaters.filter((f) => f.life > 0);
}

function spawnShard(sim: Sim) {
  const roll = Math.random();
  const hazardChance = sim.elapsed > 6 ? Math.min(0.34, 0.12 + sim.elapsed * 0.004) : 0;
  const goldChance = sim.elapsed > 10 ? 0.08 : 0;
  const powerChance = sim.elapsed > 4 ? 0.07 : 0;
  let kind: Shard["kind"];
  if (roll < hazardChance) kind = "hazard";
  else if (roll < hazardChance + goldChance) kind = "gold";
  else if (roll < hazardChance + goldChance + powerChance) kind = "power";
  else kind = "fav";
  const favId =
    kind === "fav" ? sim.bag[sim.bagAt % Math.max(sim.bag.length, 1)] ?? null : null;
  if (kind === "fav") sim.bagAt++;
  const shard: Shard = {
    id: sim.nextId++,
    x: 70 + Math.random() * Math.max(40, sim.w - 140),
    y: -36,
    vy: Math.min(460, 240 + sim.elapsed * 7),
    sway: 1.2 + Math.random() * 2.2,
    phase: Math.random() * 6,
    kind,
    favId,
    power: kind === "power" ? (Math.random() < 0.5 ? "aurora" : "cold") : null,
    alive: true,
  };
  sim.shards.push(shard);
}

function resolveCatch(sim: Sim, shard: Shard) {
  shard.alive = false;
  if (shard.kind === "hazard") {
    sim.lives -= 1;
    sim.combo = 0;
    sim.comboTimer = 0;
    sim.streak = 0;
    sim.hitstop = sim.reduced ? 0 : 0.09;
    sim.trauma = Math.min(1, sim.trauma + 0.55);
    sim.squash = 0.82;
    burst(sim, shard.x, shard.y, false);
    sim.floaters.push({ x: shard.x, y: shard.y - 20, text: "frost", life: 0.7, gold: false });
    if (sim.lives <= 0) {
      sim.phase = "over";
    }
    sim.revision++;
    return;
  }

  if (shard.kind === "power") {
    sim.powersTaken++;
    sim.hitstop = sim.reduced ? 0 : 0.05;
    sim.squash = 1.15;
    burst(sim, shard.x, shard.y, true);
    if (shard.power === "aurora") {
      sim.auroraT = AURORA_TIME;
      sim.floaters.push({ x: shard.x, y: shard.y - 24, text: "Aurora ×2", life: 1.2, gold: true });
    } else {
      sim.coldT = COLD_TIME;
      sim.floaters.push({ x: shard.x, y: shard.y - 24, text: "Cold snap", life: 1.2, gold: false });
    }
    sim.revision++;
    return;
  }

  const mult = sim.auroraT > 0 ? 2 : 1;

  if (shard.kind === "gold") {
    // Golden thaw: a rare crystal that jumps the multiplier and restores a life.
    sim.combo = Math.min(MAX_COMBO, sim.combo + 2);
    sim.comboTimer = COMBO_WINDOW;
    sim.bestCombo = Math.max(sim.bestCombo, sim.combo);
    const gain = 500 * Math.max(1, sim.combo) * mult;
    sim.score += gain;
    sim.hitstop = sim.reduced ? 0 : 0.07;
    sim.trauma = Math.min(1, sim.trauma + 0.35);
    sim.squash = 1.2;
    burst(sim, shard.x, shard.y, true);
    sim.floaters.push({ x: shard.x, y: shard.y - 24, text: `+${gain}`, life: 1.1, gold: true });
    if (sim.lives < LIVES) {
      sim.lives += 1;
      sim.floaters.push({ x: shard.x, y: shard.y - 50, text: "+1 life", life: 1.1, gold: false });
    }
    sim.revision++;
    return;
  }

  sim.combo = Math.min(MAX_COMBO, sim.combo + 1);
  sim.comboTimer = COMBO_WINDOW;
  sim.streak += 1;
  sim.bestCombo = Math.max(sim.bestCombo, sim.combo);
  const gain = 100 * sim.combo * mult;
  sim.score += gain;
  sim.hitstop = sim.reduced ? 0 : 0.045;
  sim.trauma = Math.min(1, sim.trauma + 0.22);
  sim.squash = 1.16;
  if (shard.favId) {
    sim.lastFavId = shard.favId;
    if (!sim.thawedRun.includes(shard.favId)) sim.thawedRun.push(shard.favId);
  }
  burst(sim, shard.x, shard.y, true);
  sim.floaters.push({
    x: shard.x,
    y: shard.y - 24,
    text: `+${gain}`,
    life: 0.85,
    gold: true,
  });
  // Every 5 clean catches in a row announces the streak.
  if (sim.streak % 5 === 0) {
    sim.floaters.push({ x: shard.x, y: shard.y - 50, text: `${sim.streak} clean`, life: 1.1, gold: false });
  }
  // Every 10 clean catches in a row restores one life, up to the cap.
  if (sim.streak % 10 === 0 && sim.lives < LIVES) {
    sim.lives += 1;
    sim.floaters.push({ x: shard.x, y: shard.y - 74, text: "+1 life", life: 1.1, gold: false });
  }
  sim.revision++;
}

function burst(sim: Sim, x: number, y: number, gold: boolean) {
  const n = gold ? 14 : 10;
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n + Math.random() * 0.2;
    const sp = 80 + Math.random() * 160;
    sim.bits.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 40,
      life: 0.45 + Math.random() * 0.25,
      max: 0.7,
      gold,
    });
  }
}

export function lookup(id: string | null, custom: Favorite[]): Favorite | null {
  if (!id) return null;
  return COMMUNITY.find((f) => f.id === id) ?? custom.find((f) => f.id === id) ?? null;
}
