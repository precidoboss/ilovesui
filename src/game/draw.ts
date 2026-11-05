import type { Sim, Shard } from "./sim";
import { lookup } from "./sim";
import type { Favorite } from "./favorites";

export type Sheets = {
  yeti: HTMLImageElement[];
  crystal: HTMLImageElement[];
  hazard: HTMLImageElement[];
};

const ICE = "#7ad7f0";
const GOLD = "#e4b86a";
const PAPER = "#f3fbff";
const NIGHT = "#06141c";
const DEEP = "#030b11";
const VIOLET = "#b9a6ff";

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  sim: Sim,
  sheets: Sheets,
  custom: Favorite[],
) {
  const { w, h } = sim;
  const shake = sim.reduced ? 0 : sim.trauma * sim.trauma;
  const t = sim.anim;
  const ox = shake * Math.sin(t * 47) * 7;
  const oy = shake * Math.cos(t * 39) * 5;

  ctx.clearRect(0, 0, w, h);
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, sim.auroraT > 0 ? "#0c2a3a" : "#08202c");
  sky.addColorStop(0.55, NIGHT);
  sky.addColorStop(1, DEEP);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(ox, oy);

  drawAurora(ctx, w, h, t, sim.auroraT > 0);
  drawCliffs(ctx, w, h);
  for (const flake of sim.flakes) {
    ctx.globalAlpha = 0.35 + flake.s * 0.2;
    ctx.fillStyle = PAPER;
    ctx.beginPath();
    ctx.arc(flake.x * w, flake.y * h, flake.s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const ground = h - 108;
  const ice = ctx.createLinearGradient(0, ground - 40, 0, h);
  ice.addColorStop(0, "#16485a");
  ice.addColorStop(1, "#0b2c38");
  ctx.fillStyle = ice;
  ctx.fillRect(0, ground, w, h - ground);
  ctx.strokeStyle = sim.coldT > 0 ? "rgba(190, 240, 255, 0.8)" : "rgba(122, 215, 240, 0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, ground);
  ctx.lineTo(w, ground);
  ctx.stroke();

  const frame = Math.floor(t * (sim.moving ? 9 : 3.2)) % 4;
  for (const shard of sim.shards) {
    drawShard(ctx, shard, sheets, custom);
  }

  const yeti = sheets.yeti[frame];
  const pw = Math.min(230, Math.max(150, w * 0.3));
  const ph = pw * 1.35;

  if (sim.dashT > 0) {
    // Speed streaks trailing behind the yeti during a dash.
    ctx.save();
    ctx.globalAlpha = Math.min(0.5, sim.dashT * 2.5);
    ctx.fillStyle = ICE;
    for (let i = 1; i <= 3; i++) {
      roundRect(ctx, sim.x - sim.facing * (pw * 0.2 * i), ground - ph * 0.7 + i * 12, 70 / i, 6, 3);
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.save();
  ctx.translate(sim.x, ground + 6);
  ctx.scale(sim.facing, 1);
  const sy = sim.squash;
  const sx = 1 / sy;
  ctx.scale(sx, sy);
  if (yeti && yeti.complete && yeti.naturalWidth > 0) {
    ctx.drawImage(yeti, -pw / 2, -ph, pw, ph);
  } else {
    ctx.fillStyle = PAPER;
    ctx.beginPath();
    ctx.ellipse(0, -ph * 0.42, pw * 0.32, ph * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  for (const bit of sim.bits) {
    ctx.globalAlpha = Math.max(0, bit.life / bit.max);
    ctx.fillStyle = bit.gold ? GOLD : ICE;
    ctx.fillRect(bit.x, bit.y, 4, 4);
  }
  ctx.globalAlpha = 1;

  ctx.font = "640 16px Outfit, sans-serif";
  ctx.textAlign = "center";
  for (const floater of sim.floaters) {
    ctx.globalAlpha = Math.max(0, floater.life);
    ctx.fillStyle = floater.gold ? GOLD : "#9ec4d2";
    ctx.fillText(floater.text, floater.x, floater.y - (1 - floater.life) * 28);
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  if (sim.coldT > 0) {
    ctx.fillStyle = "rgba(122, 215, 240, 0.07)";
    ctx.fillRect(0, 0, w, h);
  }

  if (sim.phase === "play" || sim.phase === "paused") {
    drawHud(ctx, sim);
  }
}

function drawHud(ctx: CanvasRenderingContext2D, sim: Sim) {
  const { w } = sim;

  // Combo decay meter: a thin bar that empties until the chain drops a step.
  if (sim.combo > 0) {
    const frac = Math.max(0, Math.min(1, sim.comboTimer / 2.2));
    const x = 16;
    const y = 132;
    const bw = 140;
    ctx.fillStyle = "rgba(30, 69, 86, 0.8)";
    roundRect(ctx, x, y, bw, 5, 2.5);
    ctx.fill();
    ctx.fillStyle = sim.combo >= 5 ? GOLD : ICE;
    roundRect(ctx, x, y, Math.max(5, bw * frac), 5, 2.5);
    ctx.fill();
  }

  // Active power-up pills, stacked top-right beneath the header buttons.
  const pills: { label: string; color: string; time: number }[] = [];
  if (sim.auroraT > 0) pills.push({ label: `Aurora ×2 ${Math.ceil(sim.auroraT)}s`, color: VIOLET, time: sim.auroraT });
  if (sim.coldT > 0) pills.push({ label: `Cold snap ${Math.ceil(sim.coldT)}s`, color: ICE, time: sim.coldT });
  if (sim.dashCd > 0) pills.push({ label: "Dash charging", color: "#8eafbc", time: 0 });
  else pills.push({ label: "Dash ready · Shift", color: PAPER, time: 0 });

  ctx.font = "600 12px Outfit, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  let y = 74;
  for (const pill of pills) {
    const tw = ctx.measureText(pill.label).width + 22;
    const x = w - 16 - tw;
    ctx.fillStyle = "rgba(6, 20, 28, 0.78)";
    roundRect(ctx, x, y, tw, 24, 12);
    ctx.fill();
    ctx.strokeStyle = pill.color;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = pill.color;
    ctx.fillText(pill.label, w - 27, y + 12.5);
    y += 30;
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
}

function drawAurora(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  boosted: boolean,
) {
  ctx.save();
  ctx.globalAlpha = boosted ? 0.4 : 0.28;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    const y0 = h * (0.18 + i * 0.08);
    ctx.moveTo(0, y0);
    for (let x = 0; x <= w; x += 24) {
      const y = y0 + Math.sin(x * 0.01 + t * 0.6 + i) * 18;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = i === 1 ? GOLD : boosted && i === 0 ? VIOLET : ICE;
    ctx.lineWidth = 10;
    ctx.stroke();
  }
  ctx.restore();
}

function drawCliffs(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#0a2230";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.62);
  ctx.lineTo(w * 0.12, h * 0.42);
  ctx.lineTo(w * 0.28, h * 0.58);
  ctx.lineTo(w * 0.46, h * 0.36);
  ctx.lineTo(w * 0.66, h * 0.55);
  ctx.lineTo(w * 0.84, h * 0.4);
  ctx.lineTo(w, h * 0.58);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.fill();
}

function drawShard(
  ctx: CanvasRenderingContext2D,
  shard: Shard,
  sheets: Sheets,
  custom: Favorite[],
) {
  if (shard.kind === "power") {
    drawPowerOrb(ctx, shard);
    return;
  }

  const sheet = shard.kind === "hazard" ? sheets.hazard : sheets.crystal;
  const frame = sheet[Math.floor(shard.phase * 6) % 4];
  const size = shard.kind === "hazard" ? 72 : shard.kind === "gold" ? 88 : 78;
  ctx.save();
  ctx.translate(shard.x, shard.y);
  if (shard.kind === "gold") {
    const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, size * 0.75);
    glow.addColorStop(0, "rgba(228, 184, 106, 0.55)");
    glow.addColorStop(1, "rgba(228, 184, 106, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.75, 0, Math.PI * 2);
    ctx.fill();
  }
  if (frame && frame.complete && frame.naturalWidth > 0) {
    ctx.drawImage(frame, -size / 2, -size / 2, size, size);
  } else {
    ctx.fillStyle = shard.kind === "hazard" ? "#6e8794" : ICE;
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(18, 8);
    ctx.lineTo(0, 28);
    ctx.lineTo(-18, 8);
    ctx.closePath();
    ctx.fill();
  }
  if (shard.kind === "fav" && shard.favId) {
    const fav = lookup(shard.favId, custom);
    if (fav) {
      ctx.font = "520 12px Outfit, sans-serif";
      const label = fav.title;
      const width = Math.min(180, ctx.measureText(label).width + 18);
      ctx.fillStyle = "rgba(6, 20, 28, 0.78)";
      roundRect(ctx, -width / 2, 34, width, 22, 11);
      ctx.fill();
      ctx.fillStyle = fav.side === "sui" ? ICE : GOLD;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, 0, 45);
    }
  }
  if (shard.kind === "gold") {
    ctx.font = "640 12px Outfit, sans-serif";
    const label = "golden thaw";
    const width = ctx.measureText(label).width + 18;
    ctx.fillStyle = "rgba(6, 20, 28, 0.78)";
    roundRect(ctx, -width / 2, 34, width, 22, 11);
    ctx.fill();
    ctx.fillStyle = GOLD;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 0, 45);
  }
  ctx.restore();
}

function drawPowerOrb(ctx: CanvasRenderingContext2D, shard: Shard) {
  const color = shard.power === "aurora" ? VIOLET : ICE;
  const pulse = 1 + Math.sin(shard.phase * 8) * 0.06;
  ctx.save();
  ctx.translate(shard.x, shard.y);
  const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 56);
  glow.addColorStop(0, color);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 56, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, 18 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PAPER;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = NIGHT;
  ctx.font = "700 14px Outfit, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(shard.power === "aurora" ? "×2" : "❄", 0, 1);
  ctx.font = "640 11px Outfit, sans-serif";
  ctx.fillStyle = color;
  ctx.fillText(shard.power === "aurora" ? "aurora" : "cold snap", 0, 36);
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
