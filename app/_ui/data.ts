// Game-side demo data: player stats, leaderboards, history. Replace with the server's stats plugin (e.g. Plan) later.
// Owner-editable content (IP, posts, team, rules...) lives in app/_lib/content.ts instead.

export const joinSteps = [
  { title: "Open Multiplayer", text: "Launch Minecraft Java 1.21 or newer and click Multiplayer." },
  { title: "Add the server", text: "Click Add Server and paste the IP below as the server address." },
  { title: "Join and claim", text: "Hop in, find a spot you like and claim your first piece of land." },
];

export type Player = {
  name: string;
  rank: "Member" | "Veteran" | "Supporter";
  joined: string; // YYYY-MM-DD
  lastSeen: string;
  online?: boolean;
  seasons: number[];
  playtime: number; // hours
  blocks: number; // mined
  placed: number;
  mobs: number; // mobs killed
  deaths: number;
  votes: number; // this month
  bio?: string;
  activity?: { when: string; text: string }[];
};

export const players: Player[] = [
  { name: "Notch", rank: "Veteran", joined: "2024-01-10", lastSeen: "Online now", online: true, seasons: [1, 2, 3], playtime: 412, blocks: 1_204_000, placed: 2_310_000, mobs: 8_410, deaths: 12, votes: 22, bio: "Builds big. Owns the place.", activity: [{ when: "2h ago", text: "Started the Season 3 spawn tower" }, { when: "Sep 12", text: "Opened Season 3" }] },
  { name: "jeb_", rank: "Veteran", joined: "2024-02-02", lastSeen: "3h ago", seasons: [1, 2, 3], playtime: 388, blocks: 980_000, placed: 1_640_000, mobs: 12_902, deaths: 31, votes: 28, activity: [{ when: "Aug 28", text: "Judged the build contest" }] },
  { name: "Alex", rank: "Supporter", joined: "2024-03-15", lastSeen: "Online now", online: true, seasons: [1, 2, 3], playtime: 301, blocks: 1_310_000, placed: 1_980_000, mobs: 6_120, deaths: 8, votes: 30, bio: "Plugins by day, whales by night.", activity: [{ when: "Aug 28", text: "Won 1st place in the build contest: the cloud whale" }, { when: "Aug 10", text: "Upgraded the server to 1.21" }] },
  { name: "Steve", rank: "Member", joined: "2025-01-20", lastSeen: "Yesterday", seasons: [2, 3], playtime: 276, blocks: 702_000, placed: 910_000, mobs: 9_870, deaths: 44, votes: 19, activity: [{ when: "Aug 28", text: "2nd place in the build contest: upside-down lighthouse" }] },
  { name: "Marc", rank: "Veteran", joined: "2025-04-04", lastSeen: "Online now", online: true, seasons: [2, 3], playtime: 240, blocks: 655_000, placed: 3_120_000, mobs: 2_004, deaths: 24, votes: 14, bio: "Please do not touch the fountain.", activity: [{ when: "Aug 28", text: "3rd place in the build contest: a cobblestone tower" }] },
  { name: "Pebble", rank: "Member", joined: "2025-09-02", lastSeen: "Online now", online: true, seasons: [3], playtime: 188, blocks: 540_000, placed: 420_000, mobs: 3_310, deaths: 51, votes: 27 },
  { name: "Mossy", rank: "Supporter", joined: "2025-02-14", lastSeen: "Online now", online: true, seasons: [2, 3], playtime: 205, blocks: 610_000, placed: 780_000, mobs: 4_450, deaths: 19, votes: 25 },
  { name: "Kiwi_", rank: "Member", joined: "2025-06-30", lastSeen: "Online now", online: true, seasons: [2, 3], playtime: 162, blocks: 402_000, placed: 350_000, mobs: 7_780, deaths: 63, votes: 11 },
  { name: "Lumen", rank: "Member", joined: "2025-03-08", lastSeen: "Online now", online: true, seasons: [2, 3], playtime: 231, blocks: 498_000, placed: 690_000, mobs: 5_260, deaths: 17, votes: 24 },
  { name: "Ravenna", rank: "Member", joined: "2026-09-18", lastSeen: "Online now", online: true, seasons: [3], playtime: 3, blocks: 2_100, placed: 1_450, mobs: 12, deaths: 2, votes: 1 },
  { name: "Birch", rank: "Member", joined: "2026-08-02", lastSeen: "Online now", online: true, seasons: [3], playtime: 61, blocks: 88_000, placed: 71_000, mobs: 1_205, deaths: 29, votes: 6 },
  { name: "Tidewalker", rank: "Supporter", joined: "2024-05-21", lastSeen: "2 days ago", seasons: [1, 2, 3], playtime: 355, blocks: 1_020_000, placed: 1_300_000, mobs: 10_330, deaths: 38, votes: 29 },
  { name: "Quartzy", rank: "Member", joined: "2025-11-11", lastSeen: "5h ago", seasons: [2, 3], playtime: 127, blocks: 310_000, placed: 520_000, mobs: 1_870, deaths: 21, votes: 17 },
  { name: "Emberly", rank: "Veteran", joined: "2024-02-27", lastSeen: "Last week", seasons: [1, 2], playtime: 298, blocks: 860_000, placed: 1_150_000, mobs: 7_050, deaths: 26, votes: 3 },
];

export const findPlayer = (name: string) => players.find((p) => p.name.toLowerCase() === name.toLowerCase());

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
export const categories = [
  { key: "playtime", label: "Playtime", format: (n: number) => `${n}h` },
  { key: "blocks", label: "Blocks mined", format: (n: number) => compact.format(n) },
  { key: "placed", label: "Blocks placed", format: (n: number) => compact.format(n) },
  { key: "mobs", label: "Mobs slain", format: (n: number) => compact.format(n) },
  { key: "votes", label: "Votes this month", format: (n: number) => String(n) },
  { key: "deaths", label: "Deaths", format: (n: number) => String(n) },
] as const;
export type CategoryKey = (typeof categories)[number]["key"];

// Rank of a player in a category (1 = best). Deaths rank highest-first too: it's a "most deaths" board.
export const rankIn = (key: CategoryKey, name: string) => [...players].sort((a, b) => b[key] - a[key]).findIndex((p) => p.name === name) + 1;

export const stats = [
  { value: "12,480", label: "Players joined" },
  { value: "48.2M", label: "Blocks placed" },
  { value: "99.9%", label: "Uptime" },
];

// Peak players per day, last 7 days.
export const playerHistory = [
  { day: "Mon", players: 31 },
  { day: "Tue", players: 38 },
  { day: "Wed", players: 35 },
  { day: "Thu", players: 44 },
  { day: "Fri", players: 61 },
  { day: "Sat", players: 78 },
  { day: "Sun", players: 66 },
];

export const DISCLAIMER = "CaelumSMP is not affiliated with Mojang or Microsoft.";

// 3D skin renders (transparent PNGs) from public APIs.
export const bodyRender = (name: string, size = 256) => `https://visage.surgeplay.com/full/${size}/${encodeURIComponent(name)}`;
export const headRender = (name: string, size = 64) => `https://mc-heads.net/avatar/${encodeURIComponent(name)}/${size}`;
