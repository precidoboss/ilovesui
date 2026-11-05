import { useEffect, useRef, useState, type FormEvent, type PointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Pause, Play, Snowflake, Volume2, VolumeX } from "lucide-react";
import { COMMUNITY, loadSave, writeSave, type Favorite, type Side } from "@/game/favorites";
import { drawFrame, type Sheets } from "@/game/draw";
import { createSim, dash, lookup, resizeSim, retuneBag, startRun, step, type Sim } from "@/game/sim";
import { isMuted, playCatch, playHazard, playStart, resumeIfNeeded, setMuted, unlockAudio } from "@/game/audio";
import { addFavorite, getFavorites, getLeaderboard, submitScore, type LeaderRow } from "@/lib/game-data";

const HANDLE_KEY = "favorite-freeze.handle";

function loadSheet(folder: string) {
  return [0, 1, 2, 3].map((i) => {
    const img = new Image();
    img.src = `/sprites/${folder}/${i}.png`;
    return img;
  });
}

export function FavoriteFreeze() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<Sim | null>(null);
  const sheetsRef = useRef<Sheets | null>(null);
  const customRef = useRef<Favorite[]>([]);
  const [custom, setCustom] = useState<Favorite[]>([]);
  const [thawed, setThawed] = useState<string[]>([]);
  const [best, setBest] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [phase, setPhase] = useState<Sim["phase"]>("title");
  const [spotlight, setSpotlight] = useState<Favorite | null>(null);
  const [wallOpen, setWallOpen] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [draft, setDraft] = useState("");
  const [side, setSide] = useState<Side>("sui");
  const [ready, setReady] = useState(false);
  const [freezing, setFreezing] = useState(false);
  const [wallError, setWallError] = useState<string | null>(null);
  const [board, setBoard] = useState<LeaderRow[]>([]);
  const [handle, setHandle] = useState("");
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  useEffect(() => {
    const save = loadSave();
    customRef.current = save.custom;
    setCustom(save.custom);
    setThawed(save.thawed);
    setBest(save.best);
    try {
      setHandle(localStorage.getItem(HANDLE_KEY) ?? "");
    } catch {
      setHandle("");
    }
    getLeaderboard().then(setBoard).catch(() => setBoard([]));
    getFavorites()
      .then((rows) => {
        customRef.current = rows;
        setCustom(rows);
        const liveSim = simRef.current;
        if (liveSim) retuneBag(liveSim, rows.map((f) => f.id));
      })
      .catch(() => undefined);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sim = createSim(reduced);
    simRef.current = sim;
    retuneBag(sim, save.custom.map((f) => f.id));
    sheetsRef.current = {
      yeti: loadSheet("yeti"),
      crystal: loadSheet("crystal"),
      hazard: loadSheet("hazard"),
    };
    setReady(true);

    const onVis = () => {
      if (document.visibilityState === "visible") resumeIfNeeded();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
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

    const loop = (now: number) => {
      const dt = (now - last) / 1000;
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
            const next = Array.from(new Set([...prev, ...sim.thawedRun]));
            const save = loadSave();
            const bestScore = Math.max(save.best, sim.score);
            writeSave({ ...save, best: bestScore, thawed: next });
            setBest(bestScore);
            return next;
          });
        }
        if (sim.phase === "over") {
          const save = loadSave();
          const bestScore = Math.max(save.best, sim.score);
          writeSave({ ...save, best: bestScore, thawed: Array.from(new Set([...save.thawed, ...sim.thawedRun])) });
          setBest(bestScore);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [ready, phase]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const sim = simRef.current;
      if (!sim || event.repeat) return;
      const down = event.type === "keydown";
      // Let text fields (handle, freeze box) receive their own keystrokes.
      const target = event.target as HTMLElement | null;
      if (down && target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        sim.inputLeft = down;
        if (down) event.preventDefault();
      } else if (event.code === "ArrowRight" || event.code === "KeyD") {
        sim.inputRight = down;
        if (down) event.preventDefault();
      } else if (down && (event.code === "Space" || event.code === "Enter") && sim.phase !== "play") {
        event.preventDefault();
        begin();
      } else if (down && (event.code === "ShiftLeft" || event.code === "ShiftRight") && sim.phase === "play") {
        dash(sim);
      } else if (down && event.code === "KeyP" && (sim.phase === "play" || sim.phase === "paused")) {
        togglePause();
      }
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
    setPosted(false);
    setPostError(null);
  }

  function togglePause() {
    const sim = simRef.current;
    if (!sim) return;
    if (sim.phase === "play") sim.phase = "paused";
    else if (sim.phase === "paused") sim.phase = "play";
    setPhase(sim.phase);
  }

  function pointFromEvent(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const sim = simRef.current;
    if (!canvas || !sim || sim.phase !== "play") return;
    const rect = canvas.getBoundingClientRect();
    sim.targetX = event.clientX - rect.left;
    sim.inputLeft = false;
    sim.inputRight = false;
  }

  function dashNow() {
    const sim = simRef.current;
    if (sim) dash(sim);
  }

  function hold(dir: "left" | "right", down: boolean) {
    const sim = simRef.current;
    if (!sim) return;
    if (dir === "left") sim.inputLeft = down;
    else sim.inputRight = down;
    if (down) sim.targetX = null;
  }

  async function freezeDraft() {
    const text = draft.trim();
    if (text.length < 8 || freezing) return;
    setFreezing(true);
    setWallError(null);
    try {
      const fav = await addFavorite({ data: { side, text } });
      const next = [fav, ...customRef.current].slice(0, 200);
      customRef.current = next;
      setCustom(next);
      const sim = simRef.current;
      if (sim) retuneBag(sim, [fav.id]);
      setDraft("");
      setSpotlight(fav);
    } catch (err) {
      setWallError(err instanceof Error && err.message ? err.message : "Could not freeze that. Try again.");
    } finally {
      setFreezing(false);
    }
  }

  async function postScore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const sim = simRef.current;
    const name = handle.trim();
    if (!sim || posting || posted) return;
    setPosting(true);
    setPostError(null);
    try {
      const rows = await submitScore({ data: { handle: name, score: sim.score, bestCombo: sim.bestCombo } });
      setBoard(rows);
      setPosted(true);
      try {
        localStorage.setItem(HANDLE_KEY, name);
      } catch {
        // Storage can be blocked; the score still posted.
      }
    } catch {
      setPostError("Could not post. Use 1 to 16 letters, numbers, spaces, _ . or -, then try again.");
    } finally {
      setPosting(false);
    }
  }

  function toggleMute() {
    const next = !isMuted();
    setMuted(next);
    setMutedState(next);
    if (!next) unlockAudio();
  }

  const all = [...custom, ...COMMUNITY];

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-bg text-fg md:flex-row">
      <section className="relative min-h-0 flex-1">
        <canvas
          ref={canvasRef}
          className="h-full w-full touch-none"
          aria-label="Favorite Freeze glacier"
          onPointerDown={pointFromEvent}
          onPointerMove={(event) => {
            if (event.buttons) pointFromEvent(event);
          }}
        />

        <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
          <div>
            <p className="font-display text-lg leading-none text-fg">Favorite Freeze</p>
            <p className="mt-1 text-sm text-muted">Sui & Lofi, caught in the ice</p>
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex h-11 items-center rounded-full border border-line bg-surface px-4 text-sm text-fg"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={toggleMute}
              className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-fg"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            {phase === "play" || phase === "paused" ? (
              <button
                type="button"
                onClick={togglePause}
                className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-fg"
                aria-label={phase === "paused" ? "Resume" : "Pause"}
              >
                {phase === "paused" ? <Play size={18} /> : <Pause size={18} />}
              </button>
            ) : null}
          </div>
        </header>

        {(phase === "play" || phase === "paused" || phase === "over") && (
          <div className="pointer-events-none absolute left-4 top-16 flex items-end gap-6">
            <div>
              <p className="text-xs tracking-wide text-muted uppercase">Score</p>
              <p className="font-display text-4xl tabular-nums text-ice">{score}</p>
            </div>
            <div>
              <p className="text-xs tracking-wide text-muted uppercase">Combo</p>
              <p className="font-display text-2xl tabular-nums text-gold">{combo > 0 ? `×${combo}` : "—"}</p>
            </div>
            <div className="flex gap-1 pb-2" aria-label={`${lives} lives left`}>
              {Array.from({ length: 3 }, (_, i) => (
                <Snowflake
                  key={i}
                  size={18}
                  className={i < lives ? "text-ice" : "text-line"}
                />
              ))}
            </div>
          </div>
        )}

        {spotlight && phase === "play" ? (
          <article className="rise-in pointer-events-none absolute top-36 right-4 left-4 max-w-md rounded-card border border-line bg-surface/90 p-4 backdrop-blur-sm">
            <p className="text-xs tracking-wide text-gold uppercase">
              {spotlight.side === "sui" ? "Sui" : "Lofi"} · {spotlight.voice}
            </p>
            <h2 className="mt-1 text-2xl text-fg">{spotlight.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{spotlight.line}</p>
          </article>
        ) : null}

        {phase === "title" ? (
          <div className="pointer-events-none absolute inset-x-4 top-16 md:top-24 md:left-8 md:max-w-lg">
            <div className="pointer-events-auto rounded-card border border-line bg-surface/95 p-4 md:p-5">
              <p className="text-xs tracking-[0.18em] text-ice uppercase">Glacier arcade</p>
              <h1 className="mt-1 text-3xl leading-none text-fg md:text-4xl">Catch what the ice kept.</h1>
              <p className="mt-2 hidden text-sm leading-relaxed text-muted md:block">
                Glowing crystals are favorite things about Sui and Lofi. Gray frost costs a life.
              </p>
              <p className="mt-2 hidden text-xs tracking-wide text-muted uppercase md:block">
                A / D to slide · Shift to dash · P to pause
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={begin}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-ice px-5 font-medium text-bg-deep"
                >
                  <Play size={18} />
                  Slide
                </button>
                <button
                  type="button"
                  onClick={() => setWallOpen(true)}
                  className="inline-flex h-12 items-center rounded-full border border-line px-5 text-fg md:hidden"
                >
                  Ice wall
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {phase === "paused" ? (
          <div className="absolute inset-0 grid place-items-center bg-bg/50">
            <button
              type="button"
              onClick={togglePause}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-ice px-5 font-medium text-bg-deep"
            >
              <Play size={18} />
              Resume
            </button>
          </div>
        ) : null}

        {phase === "over" ? (
          <div className="absolute inset-0 flex items-end bg-bg/55 p-4 md:items-center md:p-10">
            <div className="rise-in w-full max-w-md rounded-card border border-line bg-surface p-5">
              <p className="text-xs tracking-wide text-gold uppercase">Run frozen</p>
              <h2 className="mt-1 text-4xl text-fg">{score}</h2>
              <p className="mt-1 text-sm text-muted">Best {best}. {thawed.length} favorites stamped on the wall.</p>
              {posted ? (
                <p className="mt-4 text-sm text-ice">Score posted to the leaderboard.</p>
              ) : (
                <form className="mt-4 flex flex-wrap items-center gap-2" onSubmit={postScore}>
                  <label className="sr-only" htmlFor="handle">Handle</label>
                  <input
                    id="handle"
                    value={handle}
                    onChange={(event) => setHandle(event.target.value)}
                    maxLength={16}
                    placeholder="Your handle"
                    className="h-11 min-w-0 flex-1 rounded-full border border-line bg-bg px-4 text-sm text-fg outline-none placeholder:text-muted"
                  />
                  <button
                    type="submit"
                    disabled={posting || handle.trim().length === 0}
                    className="h-11 rounded-full bg-gold px-4 text-sm font-medium text-gold-ink disabled:opacity-40"
                  >
                    {posting ? "Posting…" : "Post score"}
                  </button>
                  {postError ? <p className="w-full text-xs text-gold">{postError}</p> : null}
                </form>
              )}
              <Leaderboard rows={board} />
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={begin}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-ice px-5 font-medium text-bg-deep"
                >
                  <Play size={18} />
                  Again
                </button>
                <button
                  type="button"
                  onClick={() => setWallOpen(true)}
                  className="inline-flex h-12 items-center rounded-full border border-line px-5 md:hidden"
                >
                  Wall
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {phase === "play" ? (
          <div className="absolute inset-x-0 bottom-4 flex justify-between px-4 md:hidden">
            <button
              type="button"
              className="h-14 w-20 rounded-full border border-line bg-surface text-lg text-fg"
              aria-label="Slide left"
              onPointerDown={() => hold("left", true)}
              onPointerUp={() => hold("left", false)}
              onPointerLeave={() => hold("left", false)}
            >
              A
            </button>
            <button
              type="button"
              onPointerDown={dashNow}
              className="h-14 rounded-full bg-ice px-4 text-sm font-medium text-bg-deep"
              aria-label="Dash"
            >
              Dash
            </button>
            <button
              type="button"
              onClick={() => setWallOpen(true)}
              className="h-14 rounded-full border border-line bg-surface px-4 text-sm text-fg"
            >
              Wall
            </button>
            <button
              type="button"
              className="h-14 w-20 rounded-full border border-line bg-surface text-lg text-fg"
              aria-label="Slide right"
              onPointerDown={() => hold("right", true)}
              onPointerUp={() => hold("right", false)}
              onPointerLeave={() => hold("right", false)}
            >
              D
            </button>
          </div>
        ) : null}
      </section>

      <aside className="hidden h-full w-[360px] shrink-0 border-l border-line md:block">
        <IceWall
          favorites={all}
          thawed={thawed}
          draft={draft}
          side={side}
          onDraft={setDraft}
          onSide={setSide}
          onFreeze={freezeDraft}
          freezing={freezing}
          error={wallError}
        />
      </aside>

      {wallOpen ? (
        <div className="absolute inset-0 z-20 flex flex-col bg-bg md:hidden">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-2xl">Ice wall</h2>
            <button
              type="button"
              onClick={() => setWallOpen(false)}
              className="h-11 rounded-full border border-line px-4"
            >
              Close
            </button>
          </div>
          <IceWall
            favorites={all}
            thawed={thawed}
            draft={draft}
            side={side}
            onDraft={setDraft}
            onSide={setSide}
            onFreeze={freezeDraft}
            freezing={freezing}
            error={wallError}
          />
        </div>
      ) : null}
    </main>
  );
}

function IceWall({
  favorites,
  thawed,
  draft,
  side,
  onDraft,
  onSide,
  onFreeze,
  freezing,
  error,
}: {
  favorites: Favorite[];
  thawed: string[];
  draft: string;
  side: Side;
  onDraft: (value: string) => void;
  onSide: (side: Side) => void;
  onFreeze: () => void;
  freezing: boolean;
  error: string | null;
}) {
  const thawedSet = new Set(thawed);
  const [filter, setFilter] = useState<"all" | Side>("all");
  const shown = filter === "all" ? favorites : favorites.filter((fav) => fav.side === filter);
  return (
    <aside className="flex h-full min-h-0 flex-1 flex-col bg-bg-deep">
      <div className="border-b border-line px-5 py-4">
        <p className="text-xs tracking-[0.16em] text-ice uppercase">Everyone's favorites</p>
        <h2 className="mt-1 text-2xl">Ice wall</h2>
        <p className="mt-1 text-sm text-muted">
          {thawedSet.size} thawed · {favorites.length} frozen in
        </p>
        <div className="mt-3 flex gap-2" role="tablist" aria-label="Filter favorites">
          {(["all", "sui", "lofi"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={filter === tab}
              onClick={() => setFilter(tab)}
              className={`h-9 rounded-full px-3 text-xs uppercase tracking-wide ${filter === tab ? "bg-fg text-bg-deep" : "border border-line text-fg"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <form
        className="border-b border-line px-5 py-4"
        onSubmit={(event) => {
          event.preventDefault();
          onFreeze();
        }}
      >
        <label className="text-sm text-muted" htmlFor="favorite">
          Freeze yours
        </label>
        <textarea
          id="favorite"
          value={draft}
          onChange={(event) => onDraft(event.target.value)}
          maxLength={140}
          rows={2}
          placeholder="The thing you love about Sui or Lofi"
          className="mt-2 w-full resize-none rounded-2xl border border-line bg-surface px-3 py-2 text-sm text-fg outline-none placeholder:text-muted"
        />
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSide("sui")}
            className={`h-10 rounded-full px-3 text-sm ${side === "sui" ? "bg-ice text-bg-deep" : "border border-line text-fg"}`}
          >
            Sui
          </button>
          <button
            type="button"
            onClick={() => onSide("lofi")}
            className={`h-10 rounded-full px-3 text-sm ${side === "lofi" ? "bg-gold text-gold-ink" : "border border-line text-fg"}`}
          >
            Lofi
          </button>
          <button
            type="submit"
            disabled={freezing || draft.trim().length < 8}
            className="ml-auto h-10 rounded-full bg-fg px-4 text-sm text-bg-deep disabled:opacity-40"
          >
            {freezing ? "Freezing…" : "Freeze"}
          </button>
        </div>
        {error ? <p className="mt-2 text-xs text-gold">{error}</p> : null}
      </form>
      <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {shown.map((fav) => {
          const on = thawedSet.has(fav.id);
          return (
            <li
              key={fav.id}
              className={`rounded-2xl border px-3 py-3 ${on ? "border-ice bg-surface" : "border-line bg-surface/40"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className={`text-xs tracking-wide uppercase ${fav.side === "sui" ? "text-ice" : "text-gold"}`}>
                  {fav.side} · {fav.voice}
                </p>
                {on ? <span className="text-xs text-ice">thawed</span> : null}
              </div>
              <p className="mt-1 font-display text-lg leading-snug text-fg">{fav.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{fav.line}</p>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export function Leaderboard({ rows }: { rows: LeaderRow[] }) {
  if (rows.length === 0) {
    return <p className="mt-4 text-sm text-muted">No scores yet. Be the first on the board.</p>;
  }
  return (
    <div className="mt-4">
      <p className="text-xs tracking-wide text-muted uppercase">Top 10</p>
      <ol className="mt-2 space-y-1 text-sm">
        {rows.map((row, index) => (
          <li
            key={`${row.handle}-${index}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-line bg-bg/60 px-3 py-1.5"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="w-5 text-right tabular-nums text-muted">{index + 1}</span>
              <span className="truncate text-fg">{row.handle}</span>
            </span>
            <span className="shrink-0 tabular-nums text-ice">
              {row.score}
              {row.best_combo > 1 ? <span className="ml-2 text-xs text-gold">×{row.best_combo}</span> : null}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
