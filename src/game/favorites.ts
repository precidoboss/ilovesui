export type Side = "sui" | "lofi";

export type Favorite = {
  id: string;
  side: Side;
  title: string;
  line: string;
  voice: string;
};

export const COMMUNITY: Favorite[] = [
  {
    id: "sui-parallel",
    side: "sui",
    title: "Parallel execution",
    line: "Independent transactions run together, so Sui stays quick when the chain gets busy.",
    voice: "builders",
  },
  {
    id: "sui-fees",
    side: "sui",
    title: "Fees that stay low",
    line: "Gas does not spike just because someone else is minting. A transfer still feels cheap.",
    voice: "everyday wallets",
  },
  {
    id: "sui-objects",
    side: "sui",
    title: "Owned objects",
    line: "Assets are objects you hold, not rows in one shared map. Sending one feels direct.",
    voice: "Move devs",
  },
  {
    id: "sui-finality",
    side: "sui",
    title: "Fast finality",
    line: "A transaction settles before the toast fades. That speed is the whole point of being here.",
    voice: "users",
  },
  {
    id: "sui-sponsored",
    side: "sui",
    title: "Sponsored gas",
    line: "An app can pay the fee for a first-timer, so onboarding is not a lecture about gas.",
    voice: "onboarding",
  },
  {
    id: "sui-zk",
    side: "sui",
    title: "Familiar sign-in",
    line: "zkLogin lets people arrive from an account they already know, then land in a real wallet.",
    voice: "newcomers",
  },
  {
    id: "lofi-crowd",
    side: "lofi",
    title: "The yeti crowd",
    line: "Lofi is the cold-weather community that actually replies, shows up, and keeps the joke going.",
    voice: "yetis",
  },
  {
    id: "lofi-more",
    side: "lofi",
    title: "More than a meme",
    line: "Content, community, and collaboration sit beside the token. The bit has a workshop behind it.",
    voice: "holders",
  },
  {
    id: "lofi-nfts",
    side: "lofi",
    title: "Mystic Yetis",
    line: "A frozen collection of 5,555 yetis. Holding one is a pass into drops, merch, and the room.",
    voice: "collectors",
  },
  {
    id: "lofi-merch",
    side: "lofi",
    title: "Plush and jerseys",
    line: "People own the yeti off-chain too — plush on a shelf, jersey in a locker, the whole bit.",
    voice: "fans",
  },
  {
    id: "lofi-water",
    side: "lofi",
    title: "Clean-water fee",
    line: "A slice of trading fees is set aside for clean water and less plastic in the ocean.",
    voice: "the fund",
  },
  {
    id: "lofi-lore",
    side: "lofi",
    title: "Awakened by Sui",
    line: "The mascot is a yeti thawed by the chain itself — frozen for ages, now building on Sui.",
    voice: "lore",
  },
];

const SAVE_KEY = "favorite-freeze.v1";

type Save = {
  version: 1;
  best: number;
  custom: Favorite[];
  thawed: string[];
};

function emptySave(): Save {
  return { version: 1, best: 0, custom: [], thawed: [] };
}

export function loadSave(): Save {
  if (typeof window === "undefined") return emptySave();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return emptySave();
    const parsed = JSON.parse(raw) as Partial<Save>;
    if (parsed.version !== 1) return emptySave();
    return {
      version: 1,
      best: typeof parsed.best === "number" ? parsed.best : 0,
      custom: Array.isArray(parsed.custom) ? parsed.custom.filter(isFavorite) : [],
      thawed: Array.isArray(parsed.thawed)
        ? parsed.thawed.filter((id) => typeof id === "string")
        : [],
    };
  } catch {
    return emptySave();
  }
}

export function writeSave(save: Save) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

function isFavorite(value: unknown): value is Favorite {
  if (!value || typeof value !== "object") return false;
  const row = value as Favorite;
  return (
    typeof row.id === "string" &&
    (row.side === "sui" || row.side === "lofi") &&
    typeof row.title === "string" &&
    typeof row.line === "string" &&
    typeof row.voice === "string"
  );
}

export function makeCustom(text: string, side: Side): Favorite {
  const trimmed = text.trim().replace(/\s+/g, " ").slice(0, 140);
  const title = trimmed.length > 28 ? `${trimmed.slice(0, 26).trimEnd()}…` : trimmed;
  return {
    id: `you-${Date.now().toString(36)}`,
    side,
    title,
    line: trimmed,
    voice: "you",
  };
}
