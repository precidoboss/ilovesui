-- Favorite Freeze: leaderboard + community ice wall.
--
-- Auth is OFF for this app, so rows are unowned (no user_id) and world-readable
-- and world-writable through the public server functions in
-- src/lib/game-data.ts. Only store player-chosen handles, scores, and
-- favorites about Sui and Lofi. Never store personal data here.

create table if not exists scores (
  id          bigserial primary key,
  handle      text not null check (char_length(handle) between 1 and 16),
  score       integer not null check (score >= 0 and score <= 10000000),
  best_combo  integer not null default 0 check (best_combo >= 0 and best_combo <= 99),
  created_at  timestamptz not null default now()
);

create index if not exists scores_score_idx on scores (score desc, created_at asc);

create table if not exists community_favorites (
  id          text primary key,
  side        text not null check (side in ('sui', 'lofi')),
  title       text not null check (char_length(title) between 1 and 40),
  line        text not null check (char_length(line) between 8 and 140),
  voice       text not null default 'you',
  created_at  timestamptz not null default now()
);

create index if not exists community_favorites_created_idx on community_favorites (created_at desc);
