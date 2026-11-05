import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Favorite } from "@/game/favorites";

// Public, auth-off game data (see migrations/0002_game.sql). Inputs are
// validated here; nothing personal is stored. Rows are world-readable and
// world-writable by design for this app.

const HANDLE_PATTERN = /^[\p{L}\p{N} _.-]{1,16}$/u;

const submitScoreInput = z.object({
  handle: z
    .string()
    .trim()
    .regex(HANDLE_PATTERN, "Handles use 1 to 16 letters, numbers, spaces, _ . or -"),
  score: z.number().int().min(0).max(10_000_000),
  bestCombo: z.number().int().min(0).max(99).default(0),
});

const addFavoriteInput = z.object({
  side: z.enum(["sui", "lofi"]),
  text: z.string().trim().min(8, "Give it at least 8 characters").max(140),
});

export type LeaderRow = { handle: string; score: number; best_combo: number };

async function topScores(): Promise<LeaderRow[]> {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  return sql<LeaderRow>`
    select handle, score, best_combo
    from scores
    order by score desc, created_at asc
    limit 10`;
}

export const getLeaderboard = createServerFn({ method: "GET" }).handler(async () => {
  return topScores();
});

export const submitScore = createServerFn({ method: "POST" })
  .validator((input: unknown) => submitScoreInput.parse(input))
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      insert into scores (handle, score, best_combo)
      values (${data.handle}, ${data.score}, ${data.bestCombo})`;
    return topScores();
  });

export const getFavorites = createServerFn({ method: "GET" }).handler(async () => {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  return sql<Favorite>`
    select id, side, title, line, voice
    from community_favorites
    order by created_at desc
    limit 200`;
});

export const addFavorite = createServerFn({ method: "POST" })
  .validator((input: unknown) => addFavoriteInput.parse(input))
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const text = data.text.replace(/\s+/g, " ");
    const title = text.length > 28 ? `${text.slice(0, 26).trimEnd()}…` : text;
    const id = `you-${globalThis.crypto.randomUUID().slice(0, 8)}`;
    const rows = await sql<Favorite>`
      insert into community_favorites (id, side, title, line, voice)
      values (${id}, ${data.side}, ${title}, ${text}, 'you')
      returning id, side, title, line, voice`;
    const row = rows[0];
    if (!row) throw new Error("Could not save that favorite. Try again.");
    return row;
  });
