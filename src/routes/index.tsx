import { createFileRoute, Link } from "@tanstack/react-router";
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
    title: "Slide",
    body: "Drag across the glacier or hold A and D. Keep the yeti under the falling crystals.",
  },
  {
    title: "Catch",
    body: "Each crystal in a row raises your multiplier. Miss a favorite and the chain breaks.",
  },
  {
    title: "Dodge frost",
    body: "Gray frost costs a life. Ten clean catches in a row win one back.",
  },
  {
    title: "Golden thaw",
    body: "A rare gold crystal pays big and restores a life when you are short.",
  },
];

function Home() {
  const { top, favorites } = Route.useLoaderData();
  const preview = favorites.slice(0, 8);

  return (
    <main className="min-h-dvh bg-bg text-fg">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <p className="font-display text-lg leading-none">Favorite Freeze</p>
        <nav className="flex items-center gap-2 text-sm">
          <Link to="/play" className="inline-flex h-10 items-center rounded-full border border-line px-4 text-fg">
            Ice wall
          </Link>
          <Link to="/play" className="inline-flex h-10 items-center rounded-full bg-ice px-4 font-medium text-bg-deep">
            Play
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-5xl gap-8 px-5 pt-6 pb-12 md:grid-cols-[1.1fr_0.9fr] md:pt-16">
        <div>
          <p className="text-xs tracking-[0.18em] text-ice uppercase">Glacier arcade · Sui & Lofi</p>
          <h1 className="mt-3 text-5xl leading-[0.95] md:text-6xl">Catch what the ice kept.</h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
            Slide a yeti across the glacier and catch the community's favorite things about Sui and Lofi.
            Frost is the only thing that hurts.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/play" className="inline-flex h-14 items-center rounded-full bg-ice px-7 text-lg font-medium text-bg-deep">
              Start sliding
            </Link>
            <a href="#leaderboard" className="inline-flex h-14 items-center rounded-full border border-line px-6 text-fg">
              Top scores
            </a>
          </div>
        </div>

        <aside id="leaderboard" className="rounded-card border border-line bg-surface p-5">
          <p className="text-xs tracking-wide text-gold uppercase">Leaderboard</p>
          <h2 className="mt-1 text-3xl">Best runs</h2>
          <Leaderboard rows={top} />
        </aside>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-12">
        <p className="text-xs tracking-wide text-muted uppercase">How it plays</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_TO.map((step) => (
            <article key={step.title} className="rounded-card border border-line bg-surface/60 p-4">
              <h3 className="text-xl">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-wide text-ice uppercase">Everyone's favorites</p>
            <h2 className="mt-1 text-3xl">The ice wall</h2>
          </div>
          <Link to="/play" className="text-sm text-ice underline underline-offset-4">
            Freeze yours
          </Link>
        </div>
        {preview.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Nothing frozen in yet. Be the first to add one.</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {preview.map((fav) => (
              <li key={fav.id} className="rounded-2xl border border-line bg-surface/60 p-4">
                <p className={`text-xs tracking-wide uppercase ${fav.side === "sui" ? "text-ice" : "text-gold"}`}>
                  {fav.side} · {fav.voice}
                </p>
                <p className="mt-1 font-display text-lg leading-snug">{fav.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{fav.line}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
