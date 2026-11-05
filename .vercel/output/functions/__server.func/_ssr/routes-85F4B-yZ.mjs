import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Play, i as Snowflake, n as Volume2, o as Pause, t as VolumeX } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-85F4B-yZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var COMMUNITY = [
	{
		id: "sui-parallel",
		side: "sui",
		title: "Parallel execution",
		line: "Independent transactions run together, so Sui stays quick when the chain gets busy.",
		voice: "builders"
	},
	{
		id: "sui-fees",
		side: "sui",
		title: "Fees that stay low",
		line: "Gas does not spike just because someone else is minting. A transfer still feels cheap.",
		voice: "everyday wallets"
	},
	{
		id: "sui-objects",
		side: "sui",
		title: "Owned objects",
		line: "Assets are objects you hold, not rows in one shared map. Sending one feels direct.",
		voice: "Move devs"
	},
	{
		id: "sui-finality",
		side: "sui",
		title: "Fast finality",
		line: "A transaction settles before the toast fades. That speed is the whole point of being here.",
		voice: "users"
	},
	{
		id: "sui-sponsored",
		side: "sui",
		title: "Sponsored gas",
		line: "An app can pay the fee for a first-timer, so onboarding is not a lecture about gas.",
		voice: "onboarding"
	},
	{
		id: "sui-zk",
		side: "sui",
		title: "Familiar sign-in",
		line: "zkLogin lets people arrive from an account they already know, then land in a real wallet.",
		voice: "newcomers"
	},
	{
		id: "lofi-crowd",
		side: "lofi",
		title: "The yeti crowd",
		line: "Lofi is the cold-weather community that actually replies, shows up, and keeps the joke going.",
		voice: "yetis"
	},
	{
		id: "lofi-more",
		side: "lofi",
		title: "More than a meme",
		line: "Content, community, and collaboration sit beside the token. The bit has a workshop behind it.",
		voice: "holders"
	},
	{
		id: "lofi-nfts",
		side: "lofi",
		title: "Mystic Yetis",
		line: "A frozen collection of 5,555 yetis. Holding one is a pass into drops, merch, and the room.",
		voice: "collectors"
	},
	{
		id: "lofi-merch",
		side: "lofi",
		title: "Plush and jerseys",
		line: "People own the yeti off-chain too — plush on a shelf, jersey in a locker, the whole bit.",
		voice: "fans"
	},
	{
		id: "lofi-water",
		side: "lofi",
		title: "Clean-water fee",
		line: "A slice of trading fees is set aside for clean water and less plastic in the ocean.",
		voice: "the fund"
	},
	{
		id: "lofi-lore",
		side: "lofi",
		title: "Awakened by Sui",
		line: "The mascot is a yeti thawed by the chain itself — frozen for ages, now building on Sui.",
		voice: "lore"
	}
];
var SAVE_KEY = "favorite-freeze.v1";
function emptySave() {
	return {
		version: 1,
		best: 0,
		custom: [],
		thawed: []
	};
}
function loadSave() {
	if (typeof window === "undefined") return emptySave();
	try {
		const raw = localStorage.getItem(SAVE_KEY);
		if (!raw) return emptySave();
		const parsed = JSON.parse(raw);
		if (parsed.version !== 1) return emptySave();
		return {
			version: 1,
			best: typeof parsed.best === "number" ? parsed.best : 0,
			custom: Array.isArray(parsed.custom) ? parsed.custom.filter(isFavorite) : [],
			thawed: Array.isArray(parsed.thawed) ? parsed.thawed.filter((id) => typeof id === "string") : []
		};
	} catch {
		return emptySave();
	}
}
function writeSave(save) {
	localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}
function isFavorite(value) {
	if (!value || typeof value !== "object") return false;
	const row = value;
	return typeof row.id === "string" && (row.side === "sui" || row.side === "lofi") && typeof row.title === "string" && typeof row.line === "string" && typeof row.voice === "string";
}
function makeCustom(text, side) {
	const trimmed = text.trim().replace(/\s+/g, " ").slice(0, 140);
	const title = trimmed.length > 28 ? `${trimmed.slice(0, 26).trimEnd()}…` : trimmed;
	return {
		id: `you-${Date.now().toString(36)}`,
		side,
		title,
		line: trimmed,
		voice: "you"
	};
}
var LIVES = 3;
function createSim(reduced) {
	const flakes = [];
	for (let i = 0; i < 48; i++) flakes.push({
		x: Math.random(),
		y: Math.random(),
		s: .6 + Math.random() * 1.6,
		v: 12 + Math.random() * 28
	});
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
		lives: LIVES,
		elapsed: 0,
		spawn: .4,
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
		revision: 0
	};
}
function shuffle(ids) {
	const copy = ids.slice();
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const tmp = copy[i];
		copy[i] = copy[j];
		copy[j] = tmp;
	}
	return copy;
}
function retuneBag(sim, extraIds) {
	const seen = new Set(sim.bag);
	for (const id of extraIds) if (!seen.has(id)) {
		sim.bag.push(id);
		seen.add(id);
	}
}
function resizeSim(sim, w, h) {
	sim.w = w;
	sim.h = h;
	sim.x = Math.min(Math.max(sim.x, 70), Math.max(70, w - 70));
}
function startRun(sim, extraIds) {
	sim.phase = "play";
	sim.score = 0;
	sim.combo = 0;
	sim.lives = LIVES;
	sim.elapsed = 0;
	sim.spawn = .35;
	sim.shards = [];
	sim.bits = [];
	sim.floaters = [];
	sim.hitstop = 0;
	sim.trauma = 0;
	sim.thawedRun = [];
	sim.lastFavId = null;
	sim.x = sim.w * .5;
	sim.bag = shuffle([...COMMUNITY.map((f) => f.id), ...extraIds]);
	sim.bagAt = 0;
	sim.revision++;
}
function step(sim, dt) {
	const capped = Math.min(dt, .05);
	sim.anim += capped;
	if (sim.squash > 1) sim.squash = Math.max(1, sim.squash - capped * 3.2);
	else if (sim.squash < 1) sim.squash = Math.min(1, sim.squash + capped * 3.2);
	if (!sim.reduced) sim.trauma = Math.max(0, sim.trauma - capped * 1.8);
	else sim.trauma = 0;
	for (const flake of sim.flakes) {
		flake.y += flake.v * capped / Math.max(sim.h, 1);
		if (flake.y > 1.05) {
			flake.y = -.05;
			flake.x = Math.random();
		}
	}
	if (sim.phase !== "play") return;
	if (sim.hitstop > 0) {
		sim.hitstop = Math.max(0, sim.hitstop - capped);
		return;
	}
	sim.elapsed += capped;
	const speed = 560;
	let dir = 0;
	if (sim.inputLeft) dir -= 1;
	if (sim.inputRight) dir += 1;
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
		} else sim.moving = false;
	} else sim.moving = false;
	const margin = 64;
	sim.x = Math.min(Math.max(sim.x, margin), Math.max(margin, sim.w - margin));
	sim.spawn -= capped;
	const interval = Math.max(.42, 1.05 - sim.elapsed * .012);
	if (sim.spawn <= 0) {
		sim.spawn += interval;
		spawnShard(sim);
	}
	const ground = sim.h - 108;
	const catchTop = ground - 150;
	const half = 110;
	for (const shard of sim.shards) {
		if (!shard.alive) continue;
		shard.phase += capped;
		shard.y += shard.vy * capped;
		shard.x += Math.sin(shard.phase * shard.sway) * 18 * capped;
		if (shard.y > catchTop && shard.y < ground && Math.abs(shard.x - sim.x) < half) {
			resolveCatch(sim, shard);
			continue;
		}
		if (shard.y > sim.h + 50) {
			if (shard.kind === "fav" && shard.alive) sim.combo = 0;
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
function spawnShard(sim) {
	const hard = sim.elapsed > 6 && Math.random() < Math.min(.34, .12 + sim.elapsed * .004);
	const favId = hard ? null : sim.bag[sim.bagAt % Math.max(sim.bag.length, 1)] ?? null;
	if (!hard) sim.bagAt++;
	const shard = {
		id: sim.nextId++,
		x: 70 + Math.random() * Math.max(40, sim.w - 140),
		y: -36,
		vy: Math.min(460, 240 + sim.elapsed * 7),
		sway: 1.2 + Math.random() * 2.2,
		phase: Math.random() * 6,
		kind: hard ? "hazard" : "fav",
		favId,
		alive: true
	};
	sim.shards.push(shard);
}
function resolveCatch(sim, shard) {
	shard.alive = false;
	if (shard.kind === "hazard") {
		sim.lives -= 1;
		sim.combo = 0;
		sim.hitstop = sim.reduced ? 0 : .09;
		sim.trauma = Math.min(1, sim.trauma + .55);
		sim.squash = .82;
		burst(sim, shard.x, shard.y, false);
		sim.floaters.push({
			x: shard.x,
			y: shard.y - 20,
			text: "frost",
			life: .7,
			gold: false
		});
		if (sim.lives <= 0) sim.phase = "over";
		sim.revision++;
		return;
	}
	sim.combo = Math.min(8, sim.combo + 1);
	const gain = 100 * sim.combo;
	sim.score += gain;
	sim.hitstop = sim.reduced ? 0 : .045;
	sim.trauma = Math.min(1, sim.trauma + .22);
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
		life: .85,
		gold: true
	});
	sim.revision++;
}
function burst(sim, x, y, gold) {
	const n = gold ? 14 : 10;
	for (let i = 0; i < n; i++) {
		const a = Math.PI * 2 * i / n + Math.random() * .2;
		const sp = 80 + Math.random() * 160;
		sim.bits.push({
			x,
			y,
			vx: Math.cos(a) * sp,
			vy: Math.sin(a) * sp - 40,
			life: .45 + Math.random() * .25,
			max: .7,
			gold
		});
	}
}
function lookup(id, custom) {
	if (!id) return null;
	return COMMUNITY.find((f) => f.id === id) ?? custom.find((f) => f.id === id) ?? null;
}
var ICE = "#7ad7f0";
var GOLD = "#e4b86a";
var PAPER = "#f3fbff";
var NIGHT = "#06141c";
var DEEP = "#030b11";
function drawFrame(ctx, sim, sheets, custom) {
	const { w, h } = sim;
	const shake = sim.reduced ? 0 : sim.trauma * sim.trauma;
	const t = sim.anim;
	const ox = shake * Math.sin(t * 47) * 7;
	const oy = shake * Math.cos(t * 39) * 5;
	ctx.clearRect(0, 0, w, h);
	const sky = ctx.createLinearGradient(0, 0, 0, h);
	sky.addColorStop(0, "#08202c");
	sky.addColorStop(.55, NIGHT);
	sky.addColorStop(1, DEEP);
	ctx.fillStyle = sky;
	ctx.fillRect(0, 0, w, h);
	ctx.save();
	ctx.translate(ox, oy);
	drawAurora(ctx, w, h, t);
	drawCliffs(ctx, w, h);
	for (const flake of sim.flakes) {
		ctx.globalAlpha = .35 + flake.s * .2;
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
	ctx.strokeStyle = "rgba(122, 215, 240, 0.45)";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(0, ground);
	ctx.lineTo(w, ground);
	ctx.stroke();
	const frame = Math.floor(t * (sim.moving ? 9 : 3.2)) % 4;
	for (const shard of sim.shards) drawShard(ctx, sim, shard, sheets, custom);
	const yeti = sheets.yeti[frame];
	const pw = Math.min(230, Math.max(150, w * .3));
	const ph = pw * 1.35;
	ctx.save();
	ctx.translate(sim.x, ground + 6);
	ctx.scale(sim.facing, 1);
	const sy = sim.squash;
	const sx = 1 / sy;
	ctx.scale(sx, sy);
	if (yeti && yeti.complete && yeti.naturalWidth > 0) ctx.drawImage(yeti, -pw / 2, -ph, pw, ph);
	else {
		ctx.fillStyle = PAPER;
		ctx.beginPath();
		ctx.ellipse(0, -ph * .42, pw * .32, ph * .42, 0, 0, Math.PI * 2);
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
}
function drawAurora(ctx, w, h, t) {
	ctx.save();
	ctx.globalAlpha = .28;
	for (let i = 0; i < 3; i++) {
		ctx.beginPath();
		const y0 = h * (.18 + i * .08);
		ctx.moveTo(0, y0);
		for (let x = 0; x <= w; x += 24) {
			const y = y0 + Math.sin(x * .01 + t * .6 + i) * 18;
			ctx.lineTo(x, y);
		}
		ctx.strokeStyle = i === 1 ? GOLD : ICE;
		ctx.lineWidth = 10;
		ctx.stroke();
	}
	ctx.restore();
}
function drawCliffs(ctx, w, h) {
	ctx.fillStyle = "#0a2230";
	ctx.beginPath();
	ctx.moveTo(0, h * .62);
	ctx.lineTo(w * .12, h * .42);
	ctx.lineTo(w * .28, h * .58);
	ctx.lineTo(w * .46, h * .36);
	ctx.lineTo(w * .66, h * .55);
	ctx.lineTo(w * .84, h * .4);
	ctx.lineTo(w, h * .58);
	ctx.lineTo(w, h);
	ctx.lineTo(0, h);
	ctx.fill();
}
function drawShard(ctx, sim, shard, sheets, custom) {
	const frame = (shard.kind === "hazard" ? sheets.hazard : sheets.crystal)[Math.floor(shard.phase * 6) % 4];
	const size = shard.kind === "hazard" ? 72 : 78;
	ctx.save();
	ctx.translate(shard.x, shard.y);
	if (frame && frame.complete && frame.naturalWidth > 0) ctx.drawImage(frame, -size / 2, -size / 2, size, size);
	else {
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
	ctx.restore();
}
function roundRect(ctx, x, y, w, h, r) {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.arcTo(x + w, y + h, x, y + h, r);
	ctx.arcTo(x, y + h, x, y, r);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
}
var ctx = null;
var master = null;
var music = null;
var sfx = null;
var drone = null;
var muted = false;
function curve(v) {
	return v * v;
}
function ensure() {
	if (ctx) return ctx;
	ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: "interactive" });
	master = ctx.createGain();
	music = ctx.createGain();
	sfx = ctx.createGain();
	music.gain.value = curve(.22);
	sfx.gain.value = curve(.7);
	master.gain.value = muted ? 0 : 1;
	music.connect(master);
	sfx.connect(master);
	master.connect(ctx.destination);
	return ctx;
}
function unlockAudio() {
	const audio = ensure();
	if (audio.state === "suspended") audio.resume();
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
		g.gain.value = .18;
		osc.connect(filter);
		osc2.connect(filter);
		filter.connect(g);
		g.connect(music);
		osc.start();
		osc2.start();
		drone = osc;
	}
}
function setMuted(next) {
	muted = next;
	if (master && ctx) master.gain.setTargetAtTime(next ? 0 : 1, ctx.currentTime, .03);
}
function isMuted() {
	return muted;
}
function tone(freq, dur, type, gain, slide = 0) {
	if (!ctx || !sfx || muted) return;
	const osc = ctx.createOscillator();
	const g = ctx.createGain();
	osc.type = type;
	osc.frequency.setValueAtTime(freq, ctx.currentTime);
	if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), ctx.currentTime + dur);
	g.gain.setValueAtTime(1e-4, ctx.currentTime);
	g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + .02);
	g.gain.exponentialRampToValueAtTime(1e-4, ctx.currentTime + dur);
	osc.connect(g);
	g.connect(sfx);
	osc.start();
	osc.stop(ctx.currentTime + dur + .02);
	osc.onended = () => {
		osc.disconnect();
		g.disconnect();
	};
}
function playCatch(combo) {
	const wobble = .94 + Math.random() * .1;
	const base = 520 + Math.min(combo, 8) * 40;
	tone(base * wobble, .12, "triangle", .18);
	tone(base * 1.5 * wobble, .16, "sine", .1);
}
function playHazard() {
	tone(140, .22, "sawtooth", .08, -70);
	tone(90, .28, "sine", .16, -30);
}
function playStart() {
	tone(392, .18, "sine", .12);
	tone(523, .22, "triangle", .08);
}
function resumeIfNeeded() {
	if (ctx && ctx.state === "suspended") ctx.resume();
}
function loadSheet(folder) {
	return [
		0,
		1,
		2,
		3
	].map((i) => {
		const img = new Image();
		img.src = `/sprites/${folder}/${i}.png`;
		return img;
	});
}
function FavoriteFreeze() {
	const canvasRef = (0, import_react.useRef)(null);
	const simRef = (0, import_react.useRef)(null);
	const sheetsRef = (0, import_react.useRef)(null);
	const customRef = (0, import_react.useRef)([]);
	const [custom, setCustom] = (0, import_react.useState)([]);
	const [thawed, setThawed] = (0, import_react.useState)([]);
	const [best, setBest] = (0, import_react.useState)(0);
	const [score, setScore] = (0, import_react.useState)(0);
	const [combo, setCombo] = (0, import_react.useState)(0);
	const [lives, setLives] = (0, import_react.useState)(3);
	const [phase, setPhase] = (0, import_react.useState)("title");
	const [spotlight, setSpotlight] = (0, import_react.useState)(null);
	const [wallOpen, setWallOpen] = (0, import_react.useState)(false);
	const [muted, setMutedState] = (0, import_react.useState)(false);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [side, setSide] = (0, import_react.useState)("sui");
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const save = loadSave();
		customRef.current = save.custom;
		setCustom(save.custom);
		setThawed(save.thawed);
		setBest(save.best);
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const sim = createSim(reduced);
		simRef.current = sim;
		retuneBag(sim, save.custom.map((f) => f.id));
		sheetsRef.current = {
			yeti: loadSheet("yeti"),
			crystal: loadSheet("crystal"),
			hazard: loadSheet("hazard")
		};
		setReady(true);
		const onVis = () => {
			if (document.visibilityState === "visible") resumeIfNeeded();
		};
		document.addEventListener("visibilitychange", onVis);
		return () => document.removeEventListener("visibilitychange", onVis);
	}, []);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		const sim = simRef.current;
		const sheets = sheetsRef.current;
		if (!canvas || !sim || !sheets || !ready) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		let raf = 0;
		let last = performance.now();
		let seen = sim.revision;
		let lastFav = sim.lastFavId;
		const loop = (now) => {
			const dt = (now - last) / 1e3;
			last = now;
			const rect = canvas.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			const cssW = Math.max(1, rect.width);
			const cssH = Math.max(1, rect.height);
			const bw = Math.floor(cssW * dpr);
			const bh = Math.floor(cssH * dpr);
			if (canvas.width !== bw || canvas.height !== bh) {
				canvas.width = bw;
				canvas.height = bh;
			}
			resizeSim(sim, cssW, cssH);
			const prevLives = sim.lives;
			const prevScore = sim.score;
			step(sim, dt);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			drawFrame(ctx, sim, sheets, customRef.current);
			if (sim.revision !== seen || sim.phase !== phase) {
				seen = sim.revision;
				setScore(sim.score);
				setCombo(sim.combo);
				setLives(sim.lives);
				setPhase(sim.phase);
				if (sim.score > prevScore) playCatch(sim.combo);
				if (sim.lives < prevLives) playHazard();
				if (sim.lastFavId && sim.lastFavId !== lastFav) {
					lastFav = sim.lastFavId;
					const fav = lookup(sim.lastFavId, customRef.current);
					if (fav) setSpotlight(fav);
					setThawed((prev) => {
						const next = Array.from(/* @__PURE__ */ new Set([...prev, ...sim.thawedRun]));
						const save = loadSave();
						const bestScore = Math.max(save.best, sim.score);
						writeSave({
							...save,
							best: bestScore,
							thawed: next
						});
						setBest(bestScore);
						return next;
					});
				}
				if (sim.phase === "over") {
					const save = loadSave();
					const bestScore = Math.max(save.best, sim.score);
					writeSave({
						...save,
						best: bestScore,
						thawed: Array.from(/* @__PURE__ */ new Set([...save.thawed, ...sim.thawedRun]))
					});
					setBest(bestScore);
				}
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, [ready, phase]);
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			const sim = simRef.current;
			if (!sim || event.repeat) return;
			const down = event.type === "keydown";
			if (event.code === "ArrowLeft" || event.code === "KeyA") {
				sim.inputLeft = down;
				if (down) event.preventDefault();
			} else if (event.code === "ArrowRight" || event.code === "KeyD") {
				sim.inputRight = down;
				if (down) event.preventDefault();
			} else if (down && (event.code === "Space" || event.code === "Enter") && sim.phase !== "play") {
				event.preventDefault();
				begin();
			} else if (down && event.code === "KeyP" && (sim.phase === "play" || sim.phase === "paused")) togglePause();
		};
		window.addEventListener("keydown", onKey);
		window.addEventListener("keyup", onKey);
		return () => {
			window.removeEventListener("keydown", onKey);
			window.removeEventListener("keyup", onKey);
		};
	});
	function begin() {
		const sim = simRef.current;
		if (!sim) return;
		unlockAudio();
		playStart();
		startRun(sim, customRef.current.map((f) => f.id));
		setPhase("play");
		setScore(0);
		setCombo(0);
		setLives(3);
		setSpotlight(null);
		setWallOpen(false);
	}
	function togglePause() {
		const sim = simRef.current;
		if (!sim) return;
		if (sim.phase === "play") sim.phase = "paused";
		else if (sim.phase === "paused") sim.phase = "play";
		setPhase(sim.phase);
	}
	function pointFromEvent(event) {
		const canvas = canvasRef.current;
		const sim = simRef.current;
		if (!canvas || !sim || sim.phase !== "play") return;
		const rect = canvas.getBoundingClientRect();
		sim.targetX = event.clientX - rect.left;
		sim.inputLeft = false;
		sim.inputRight = false;
	}
	function hold(dir, down) {
		const sim = simRef.current;
		if (!sim) return;
		if (dir === "left") sim.inputLeft = down;
		else sim.inputRight = down;
		if (down) sim.targetX = null;
	}
	function freezeDraft() {
		const text = draft.trim();
		if (text.length < 8) return;
		const fav = makeCustom(text, side);
		const next = [fav, ...customRef.current].slice(0, 24);
		customRef.current = next;
		setCustom(next);
		const sim = simRef.current;
		if (sim) retuneBag(sim, [fav.id]);
		writeSave({
			...loadSave(),
			custom: next
		});
		setDraft("");
		setSpotlight(fav);
	}
	function toggleMute() {
		const next = !isMuted();
		setMuted(next);
		setMutedState(next);
		if (!next) unlockAudio();
	}
	const all = [...custom, ...COMMUNITY];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative flex h-dvh flex-col overflow-hidden bg-bg text-fg md:flex-row",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative min-h-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
						ref: canvasRef,
						className: "h-full w-full touch-none",
						"aria-label": "Favorite Freeze glacier",
						onPointerDown: pointFromEvent,
						onPointerMove: (event) => {
							if (event.buttons) pointFromEvent(event);
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-lg leading-none text-fg",
							children: "Favorite Freeze"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Sui & Lofi, caught in the ice"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pointer-events-auto flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: toggleMute,
								className: "grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-fg",
								"aria-label": muted ? "Unmute" : "Mute",
								children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { size: 18 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { size: 18 })
							}), phase === "play" || phase === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: togglePause,
								className: "grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-fg",
								"aria-label": phase === "paused" ? "Resume" : "Pause",
								children: phase === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { size: 18 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { size: 18 })
							}) : null]
						})]
					}),
					(phase === "play" || phase === "paused" || phase === "over") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pointer-events-none absolute left-4 top-16 flex items-end gap-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs tracking-wide text-muted uppercase",
								children: "Score"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-4xl tabular-nums text-ice",
								children: score
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs tracking-wide text-muted uppercase",
								children: "Combo"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-2xl tabular-nums text-gold",
								children: combo > 0 ? `×${combo}` : "—"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-1 pb-2",
								"aria-label": `${lives} lives left`,
								children: Array.from({ length: 3 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Snowflake, {
									size: 18,
									className: i < lives ? "text-ice" : "text-line"
								}, i))
							})
						]
					}),
					spotlight && phase === "play" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rise-in pointer-events-none absolute top-36 right-4 left-4 max-w-md rounded-card border border-line bg-surface/90 p-4 backdrop-blur-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs tracking-wide text-gold uppercase",
								children: [
									spotlight.side === "sui" ? "Sui" : "Lofi",
									" · ",
									spotlight.voice
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-1 text-2xl text-fg",
								children: spotlight.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm leading-relaxed text-muted",
								children: spotlight.line
							})
						]
					}) : null,
					phase === "title" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-none absolute inset-x-4 top-16 md:top-24 md:left-8 md:max-w-lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pointer-events-auto rounded-card border border-line bg-surface/95 p-4 md:p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs tracking-[0.18em] text-ice uppercase",
									children: "Glacier arcade"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "mt-1 text-3xl leading-none text-fg md:text-4xl",
									children: "Catch what the ice kept."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 hidden text-sm leading-relaxed text-muted md:block",
									children: "Glowing crystals are favorite things about Sui and Lofi. Gray frost costs a life."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: begin,
										className: "inline-flex h-12 items-center gap-2 rounded-full bg-ice px-5 font-medium text-bg-deep",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { size: 18 }), "Slide"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setWallOpen(true),
										className: "inline-flex h-12 items-center rounded-full border border-line px-5 text-fg md:hidden",
										children: "Ice wall"
									})]
								})
							]
						})
					}) : null,
					phase === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 grid place-items-center bg-bg/50",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: togglePause,
							className: "inline-flex h-12 items-center gap-2 rounded-full bg-ice px-5 font-medium text-bg-deep",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { size: 18 }), "Resume"]
						})
					}) : null,
					phase === "over" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 flex items-end bg-bg/55 p-4 md:items-center md:p-10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rise-in w-full max-w-md rounded-card border border-line bg-surface p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs tracking-wide text-gold uppercase",
									children: "Run frozen"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-1 text-4xl text-fg",
									children: score
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm text-muted",
									children: [
										"Best ",
										best,
										". ",
										thawed.length,
										" favorites stamped on the wall."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: begin,
										className: "inline-flex h-12 items-center gap-2 rounded-full bg-ice px-5 font-medium text-bg-deep",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { size: 18 }), "Again"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setWallOpen(true),
										className: "inline-flex h-12 items-center rounded-full border border-line px-5 md:hidden",
										children: "Wall"
									})]
								})
							]
						})
					}) : null,
					phase === "play" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-x-0 bottom-4 flex justify-between px-4 md:hidden",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "h-14 w-20 rounded-full border border-line bg-surface text-lg text-fg",
								"aria-label": "Slide left",
								onPointerDown: () => hold("left", true),
								onPointerUp: () => hold("left", false),
								onPointerLeave: () => hold("left", false),
								children: "A"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setWallOpen(true),
								className: "h-14 rounded-full border border-line bg-surface px-4 text-sm text-fg",
								children: "Wall"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "h-14 w-20 rounded-full border border-line bg-surface text-lg text-fg",
								"aria-label": "Slide right",
								onPointerDown: () => hold("right", true),
								onPointerUp: () => hold("right", false),
								onPointerLeave: () => hold("right", false),
								children: "D"
							})
						]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "hidden h-full w-[360px] shrink-0 border-l border-line md:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IceWall, {
					favorites: all,
					thawed,
					draft,
					side,
					onDraft: setDraft,
					onSide: setSide,
					onFreeze: freezeDraft
				})
			}),
			wallOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 z-20 flex flex-col bg-bg md:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl",
						children: "Ice wall"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setWallOpen(false),
						className: "h-11 rounded-full border border-line px-4",
						children: "Close"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IceWall, {
					favorites: all,
					thawed,
					draft,
					side,
					onDraft: setDraft,
					onSide: setSide,
					onFreeze: freezeDraft
				})]
			}) : null
		]
	});
}
function IceWall({ favorites, thawed, draft, side, onDraft, onSide, onFreeze }) {
	const thawedSet = new Set(thawed);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "flex h-full min-h-0 flex-1 flex-col bg-bg-deep",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-line px-5 py-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-[0.16em] text-ice uppercase",
						children: "Everyone's favorites"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 text-2xl",
						children: "Ice wall"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							thawedSet.size,
							" thawed · ",
							favorites.length,
							" frozen in"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "border-b border-line px-5 py-4",
				onSubmit: (event) => {
					event.preventDefault();
					onFreeze();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "text-sm text-muted",
						htmlFor: "favorite",
						children: "Freeze yours"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						id: "favorite",
						value: draft,
						onChange: (event) => onDraft(event.target.value),
						maxLength: 140,
						rows: 2,
						placeholder: "The thing you love about Sui or Lofi",
						className: "mt-2 w-full resize-none rounded-2xl border border-line bg-surface px-3 py-2 text-sm text-fg outline-none placeholder:text-muted"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => onSide("sui"),
								className: `h-10 rounded-full px-3 text-sm ${side === "sui" ? "bg-ice text-bg-deep" : "border border-line text-fg"}`,
								children: "Sui"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => onSide("lofi"),
								className: `h-10 rounded-full px-3 text-sm ${side === "lofi" ? "bg-gold text-gold-ink" : "border border-line text-fg"}`,
								children: "Lofi"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: draft.trim().length < 8,
								className: "ml-auto h-10 rounded-full bg-fg px-4 text-sm text-bg-deep disabled:opacity-40",
								children: "Freeze"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4",
				children: favorites.map((fav) => {
					const on = thawedSet.has(fav.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: `rounded-2xl border px-3 py-3 ${on ? "border-ice bg-surface" : "border-line bg-surface/40"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: `text-xs tracking-wide uppercase ${fav.side === "sui" ? "text-ice" : "text-gold"}`,
									children: [
										fav.side,
										" · ",
										fav.voice
									]
								}), on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-ice",
									children: "thawed"
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-display text-lg leading-snug text-fg",
								children: fav.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm leading-relaxed text-muted",
								children: fav.line
							})
						]
					}, fav.id);
				})
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FavoriteFreeze, {});
}
//#endregion
export { Home as component };
