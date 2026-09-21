// Everything the owner can edit from the staff dashboard: types, the starting content, and small shared helpers.
// The live copy is data/content.json (see store.ts). This file only seeds it the first time.
import type { JSONContent } from "@tiptap/core";
import type { IconName } from "@/app/_ui/art";

export const tints = { lime: "#c6ff3d", coral: "#ff5a5f", cyan: "#4de3ff", violet: "#a77bff" } as const;
export type Tint = keyof typeof tints;

export type Feature = { icon: IconName; title: string; text: string };
export type Rule = { q: string; a: string };
export type Social = { label: string; href: string };

export type Settings = {
  ip: string;
  version: string;
  season: number;
  maxPlayers: number;
  discordInvite: string;
  storeUrl: string;
  // demo: show the numbers below. live: ask mcsrvstat.us and Discord (see status.ts).
  status: { source: "demo" | "live"; online: number; discord: number };
  hero: { lines: [string, string, string]; lede: string };
  event: { title: string; at: string };
  features: Feature[];
  rules: Rule[];
  socials: Social[];
};

export type Post = {
  slug: string;
  title: string;
  tag: string;
  date: string; // YYYY-MM-DD
  author: string;
  excerpt: string;
  cover: string; // image URL, or "" for the generated block-art thumbnail
  tint: Tint;
  points: string[]; // "At a glance" sidebar
  published: boolean;
  doc: JSONContent; // TipTap document
};

export type Member = { name: string; role: string; bio: string; joined: string; discord: string; focus: string; quote: string };
export type VoteSite = { name: string; url: string; reward: string };

export type Content = { settings: Settings; posts: Post[]; team: Member[]; voteSites: VoteSite[] };

// ---------- helpers ----------
export const formatDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const discordCode = (invite: string) => invite.replace(/\/+$/, "").split("/").pop() ?? "";
export const visiblePosts = (posts: Post[]) => posts.filter((p) => p.published).sort((a, b) => b.date.localeCompare(a.date));
export const readMinutes = (doc: JSONContent) => Math.max(1, Math.round(JSON.stringify(doc).split(/"text":"/).slice(1).join(" ").split(/\s+/).length / 200));

// ---------- seed ----------
const p = (text: string): JSONContent => ({ type: "paragraph", content: [{ type: "text", text }] });
const quote = (text: string): JSONContent => ({ type: "blockquote", content: [p(text)] });

export const seed: Content = {
  settings: {
    ip: "play.caelumsmp.net",
    version: "Java 1.21+",
    season: 3,
    maxPlayers: 100,
    discordInvite: "https://discord.gg/caelumsmp",
    storeUrl: "https://store.caelumsmp.net",
    status: { source: "demo", online: 42, discord: 1284 },
    hero: {
      lines: ["Build.", "Survive.", "Belong."],
      lede: "A community survival server: one shared world per season, events every weekend and an economy run by players. No pay-to-win. Just show up.",
    },
    event: { title: "Dragon night", at: "2026-09-26T21:00:00Z" },
    features: [
      { icon: "pickaxe", title: "Pure Survival", text: "Vanilla-feel gameplay with light quality-of-life tweaks. No pay-to-win, ever." },
      { icon: "star", title: "Sky Events", text: "Build contests, boss nights and elytra races run every weekend." },
      { icon: "emerald", title: "Player Economy", text: "A shopping district run entirely by players. Trade diamonds, not dollars." },
      { icon: "map", title: "Seasons", text: "A fresh world every season. Old worlds get archived as downloadable maps." },
    ],
    rules: [
      { q: "Is CaelumSMP pay-to-win?", a: "No. Supporter perks are cosmetic only. Nothing you can buy affects survival gameplay." },
      { q: "Can I play on Bedrock?", a: "Not yet. The server is Java Edition 1.21 or newer." },
      { q: "Is griefing allowed?", a: "No. Claims protect your builds, and griefing or stealing gets you banned." },
      { q: "Are client mods allowed?", a: "Performance and cosmetic mods are fine. X-ray, auto-clickers and hacked clients are not." },
      { q: "When does the world reset?", a: "Only between seasons. Every old world is archived as a free download." },
      { q: "Can I build near spawn?", a: "Not within 300 blocks. Spawn town plots are for player shops and get handed out at the start of each season." },
      { q: "What happens to inactive claims?", a: "After 30 days offline your claim expires, with a 7-day grace period. Supporters get 60 days." },
    ],
    socials: [
      { label: "Discord", href: "https://discord.gg/caelumsmp" },
      { label: "YouTube", href: "https://youtube.com/@caelumsmp" },
      { label: "X", href: "https://x.com/caelumsmp" },
      { label: "TikTok", href: "https://tiktok.com/@caelumsmp" },
    ],
  },
  posts: [
    {
      slug: "season-3-launch",
      title: "Season 3 launches this Friday",
      tag: "Update",
      date: "2026-09-12",
      author: "Notch",
      excerpt: "New world, new spawn and a launch-night event to kick things off. Here is everything you need to know.",
      cover: "",
      tint: "lime",
      points: ["World border starts at 10k and grows every month", "Claims carry a 7-day inactivity grace period", "Keep-inventory stays off, as always", "Season 2 world download goes live on Monday"],
      published: true,
      doc: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Season 3 opens this Friday at " },
              { type: "text", marks: [{ type: "bold" }, { type: "textStyle", attrs: { color: "#c6ff3d" } }], text: "18:00 UTC" },
              { type: "text", text: ". The world is brand new, the seed is secret, and everyone starts with the same empty inventory. Season 2 stays online as a read-only museum until Sunday, then moves to the downloads page." },
            ],
          },
          quote("Same rules as ever: no shortcuts, no pay-to-win, and nobody touches the fountain."),
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "A new spawn town" }] },
          p("Spawn is a walled market town this time, with plots for player shops along the main street. Shops are first come, first served, so bring a name and an idea. The rest of the map is yours: build where you like, claim what you build."),
          p("Launch night ends with a server-wide dragon fight at 21:00 UTC. The egg goes on display at spawn, and the player who lands the final hit gets their name on the plaque next to it."),
        ],
      },
    },
    {
      slug: "build-contest-winners",
      title: "Build contest winners",
      tag: "Event",
      date: "2026-08-28",
      author: "jeb_",
      excerpt: "Floating castles, a cloud whale and one very suspicious cobblestone tower.",
      cover: "",
      tint: "coral",
      points: ["1st: Alex, the cloud whale", "2nd: Steve, the upside-down lighthouse", "3rd: Marc, a cobblestone tower", "Next contest: nether hubs, in two weeks"],
      published: true,
      doc: {
        type: "doc",
        content: [
          p('Forty-one entries, three judges and one long evening of flying around with a clipboard. The theme was "things that should not fly", and you delivered.'),
          quote("We asked for things that should not fly. Somebody built a whale."),
          p("First place goes to Alex for a full-scale whale made of wool and glass, complete with a working redstone blowhole. Second place is Steve's upside-down lighthouse. Third place is Marc's cobblestone tower, which the judges agree is technically a build."),
          p("Every entry has been copied to the contest hall at spawn, where it will stay for the rest of the season."),
        ],
      },
    },
    {
      slug: "server-upgraded-1-21",
      title: "Server upgraded to 1.21",
      tag: "Patch",
      date: "2026-08-10",
      author: "Alex",
      excerpt: "Better performance, trial chambers and a fresh coat of paint for spawn.",
      cover: "",
      tint: "cyan",
      points: ["Minecraft 1.21 with trial chambers and the mace", "New hardware, steadier 20 TPS at peak", "View distance raised from 8 to 10", "Fixed: shop chests eating renamed items"],
      published: true,
      doc: {
        type: "doc",
        content: [
          p("The server now runs on 1.21. Trial chambers generate in any chunk nobody has visited yet, so grab a friend and head out past the 6k line to find one."),
          quote("If you still see lag near the shops, tell us. If you caused it, also tell us."),
          p("We also moved to new hardware over the weekend. Average tick time dropped by about a third, and the evening lag spikes around the shopping district should be gone."),
          p("Spawn got a small refresh while we were at it: new paths, better signs and a notice board that people might actually read."),
        ],
      },
    },
  ],
  team: [
    { name: "Notch", role: "Owner", bio: "Keeps the lights on and the sky clear. Usually found building something far too big near spawn.", joined: "2024-01-10", discord: "notch", focus: "Server direction, hardware, final say", quote: "Build first, argue about it later." },
    { name: "jeb_", role: "Admin", bio: "Runs events, fixes what breaks and answers every ticket before you finish typing it.", joined: "2024-02-02", discord: "jeb", focus: "Events and staff team", quote: "Every weekend is a boss fight if you try hard enough." },
    { name: "Alex", role: "Developer", bio: "Writes the plugins. Responsible for everything that works and denies the rest.", joined: "2024-03-15", discord: "alex.dev", focus: "Plugins, website, bug fixes", quote: "It works on my server." },
    { name: "Steve", role: "Moderator", bio: "Friendly face in chat, strict face in court. Loves a good redstone contraption.", joined: "2025-01-20", discord: "steve", focus: "Chat moderation, tickets", quote: "Read the rules. Then read them again." },
    { name: "Marc", role: "Builder", bio: "Built the spawn town one block at a time. Please do not touch the fountain.", joined: "2025-04-04", discord: "marc.builds", focus: "Spawn, event arenas", quote: "The fountain stays." },
  ],
  voteSites: [
    { name: "Minecraft Server List", url: "https://minecraft-server-list.com", reward: "1 vote key + 50 coins" },
    { name: "PlanetMinecraft", url: "https://www.planetminecraft.com", reward: "1 vote key" },
    { name: "TopG", url: "https://topg.org", reward: "1 vote key + 50 coins" },
    { name: "Minecraft-MP", url: "https://minecraft-mp.com", reward: "1 vote key" },
  ],
};
