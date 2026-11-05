import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, MousePointerClick, Snowflake, Sparkles, Trophy, Wind, Zap } from "lucide-react";
import { Leaderboard } from "@/components/favorite-freeze";
import { getFavorites, getLeaderboard } from "@/lib/game-data";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [top, favorites] = await Promise.all([
      getLeaderboard().catch(() => []),
      getFavorites().catch(() => []),
    ]);
    return { top, favorites };
  },
  component: Home,
});

const HOW_TO = [
  {
    icon: Wind,
    title: "Slide",
    body: "Drag across the glacier or hold A and D. Keep the yeti under the falling crystals.",
  },
  {
    icon: Flame,
    title: "Chain catches",
    body: "Each catch raises your multiplier. The chain fades a step at a time if you stop catching, so keep moving.",
  },
  {
    icon: Snowflake,
    title: "Dodge frost",
    body: "Gray frost costs a life. Ten clean catches in a row win one back.",
  },
  {
    icon: Zap,
    title: "Dash out of trouble",
    body: "Shift (or the Dash button on mobile) bursts you sideways. It recharges every few seconds.",
  },
];

const POWER_UPS = [
  {
    name: "Golden thaw",
    tone: "gold",
    body: "A rare gold crystal. Pays big, jumps your multiplier, and restores a life when you are short.",
  },
  {
    name: "Aurora ×2",
    tone: "violet",
    body: "Violet orb. Every catch pays double for eight seconds while the sky lights up.",
  },
  {
    name: "Cold snap",
    tone: "ice",
    body: "Ice-blue orb. Crystals slow to half speed for five seconds, so the chain is easy to hold.",
  },
] as const;

const TONE: Record<(typeof POWER_UPS)[number]["tone"], string> = {
  gold: "text-gold border-gold/40",
  violet: "text-[#b9a6ff] border-[#b9a6ff]/40",
  ice: "text-ice border-ice/40",
};

function Home() {
  const { top, favorites } = Route.useLoaderData();
  const preview = favorites.slice(0, 8);
  const best = top[0]?.score ?? 0;

  return (
    <main className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-30 border-b border-line/60 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Snowflake size={20} className="text-ice" />
            <span className="font-display text-lg leading-none">Favorite Freeze</span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <a href="#how" className="hidden h-10 items-center px-3 text-muted hover:text-fg sm:inline-flex">
              How it plays
            </a>
            <a href="#leaderboard" className="hidden h-10 items-center px-3 text-muted hover:text-fg sm:inline-flex">
              Scores
            </a>
            <a href="#wall" className="hidden h-10 items-center px-3 text-muted hover:text-fg sm:inline-flex">
              Ice wall
            </a>
            <Link
              to="/play"
              className="inline-flex h-10 items-center rounded-full bg-ice px-5 font-medium text-bg-deep transition hover:brightness-110"
            >
              Play
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="aurora-bg pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pt-12 pb-16 md:grid-cols-[1.05fr_0.95fr] md:pt-20">
          <div className="rise-in">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs tracking-[0.16em] text-ice uppercase">
              <Sparkles size={14} /> Glacier arcade · Sui & Lofi
            </p>
            <h1 className="mt-5 text-5xl leading-[0.95] md:text-7xl">Catch what the ice kept.</h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted md:text-lg">
              Slide a yeti across the glacier and catch the community's favorite things about Sui and Lofi. Chain
              your catches, grab the power-ups, and dodge the frost.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/play"
                className="inline-flex h-14 items-center gap-2 rounded-full bg-ice px-8 text-lg font-medium text-bg-deep shadow-[0_10px_40px_-10px_rgba(122,215,240,0.6)] transition hover:brightness-110"
              >
                Start sliding
              </Link>
              <a
                href="#how"
                className="inline-flex h-14 items-center gap-2 rounded-full border border-line px-6 text-fg transition hover:bg-surface"
              >
                <MousePointerClick size={18} /> How to play
              </a>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
              <Stat label="Top score" value={best ? best.toLocaleString() : "—"} />
              <Stat label="Favorites frozen" value={favorites.length.toLocaleString()} />
              <Stat label="On the board" value={top.length.toString()} />
            </dl>
          </div>

          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm md:max-w-none" aria-hidden="true">
            <div className="absolute inset-0 rounded-[2rem] border border-line bg-gradient-to-b from-[#0e2f3d] to-[#030b11] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]" />
            <div className="absolute inset-x-0 top-0 h-[70%] overflow-hidden rounded-t-[2rem]">
              <img src="/sprites/crystal/0.png" alt="" className="crystal-fall absolute left-[12%] top-0 w-16" />
              <img src="/sprites/crystal/1.png" alt="" className="crystal-fall absolute left-[52%] top-0 w-20 [animation-delay:-1.6s]" />
              <img src="/sprites/hazard/0.png" alt="" className="crystal-fall absolute left-[78%] top-0 w-14 [animation-delay:-3.1s]" />
              <img src="/sprites/crystal/2.png" alt="" className="crystal-fall absolute left-[30%] top-0 w-16 [animation-delay:-4.4s]" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-[32%] rounded-b-[2rem] bg-gradient-to-b from-[#16485a] to-[#0b2c38]">
              <img
                src="/sprites/yeti/0.png"
                alt=""
                className="absolute bottom-2 left-1/2 w-40 -translate-x-1/2 drop-shadow-[0_8px_18px_rgba(0,0,0,0.5)]"
              />
            </div>
            <div className="absolute left-5 top-5 rounded-2xl border border-line bg-bg/80 px-4 py-3 backdrop-blur-sm">
              <p className="text-[10px] tracking-[0.16em] text-muted uppercase">Power-up</p>
              <p className="font-display text-3xl text-[#b9a6ff]">Aurora ×2</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16">
        <SectionHead kicker="How it plays" title="Four moves. One glacier." />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_TO.map((step, index) => {
            const Icon = step.icon;
            return (
              <article key={step.title} className="group rounded-card border border-line bg-surface/60 p-5 transition hover:border-ice/50 hover:bg-surface">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ice/10 text-ice">
                    <Icon size={22} />
                  </span>
                  <span className="font-display text-3xl text-line">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <SectionHead kicker="Power-ups" title="Crystals that change the run" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {POWER_UPS.map((power) => (
            <article key={power.name} className={`rounded-card border bg-surface/40 p-5 ${TONE[power.tone]}`}>
              <p className="font-display text-2xl">{power.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{power.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-16 lg:grid-cols-[1fr_1fr]">
        <aside id="leaderboard" className="scroll-mt-24 rounded-card border border-line bg-surface p-6">
          <p className="flex items-center gap-2 text-xs tracking-wide text-gold uppercase">
            <Trophy size={14} /> Leaderboard
          </p>
          <h2 className="mt-1 text-3xl">Best runs</h2>
          <Leaderboard rows={top} />
        </aside>

        <div id="wall" className="scroll-mt-24 rounded-card border border-line bg-surface/60 p-6">
          <p className="text-xs tracking-wide text-ice uppercase">Everyone's favorites</p>
          <div className="mt-1 flex items-end justify-between gap-4">
            <h2 className="text-3xl">The ice wall</h2>
            <Link to="/play" className="text-sm text-ice underline underline-offset-4">
              Freeze yours
            </Link>
          </div>
          {preview.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Nothing frozen in yet. Be the first to add one.</p>
          ) : (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {preview.map((fav) => (
                <li key={fav.id} className="rounded-2xl border border-line bg-bg/60 p-4">
                  <p className={`text-xs tracking-wide uppercase ${fav.side === "sui" ? "text-ice" : "text-gold"}`}>
                    {fav.side} · {fav.voice}
                  </p>
                  <p className="mt-1 font-display text-lg leading-snug">{fav.title}</p>
                  <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted">{fav.line}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="relative overflow-hidden rounded-[2rem] border border-line bg-gradient-to-br from-[#0f3646] via-surface to-bg-deep p-8 text-center md:p-14">
          <div className="aurora-bg pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
          <div className="relative">
            <h2 className="text-4xl md:text-5xl">Think you can hold the chain?</h2>
            <p className="mx-auto mt-3 max-w-md text-muted">
              One run, three lives, and the whole glacier watching. Post your score when the ice gets you.
            </p>
            <Link
              to="/play"
              className="mt-7 inline-flex h-14 items-center rounded-full bg-ice px-9 text-lg font-medium text-bg-deep transition hover:brightness-110"
            >
              Play now
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-base text-fg">Favorite Freeze</p>
          <p>A glacier arcade for the Sui and Lofi community.</p>
        </div>
      </footer>
    </main>
  );
}

function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <p className="text-xs tracking-[0.16em] text-ice uppercase">{kicker}</p>
      <h2 className="mt-2 text-3xl md:text-4xl">{title}</h2>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line/80 bg-surface/50 px-4 py-3">
      <dt className="text-[10px] tracking-[0.14em] text-muted uppercase">{label}</dt>
      <dd className="mt-1 font-display text-2xl tabular-nums text-fg">{value}</dd>
    </div>
  );
}
