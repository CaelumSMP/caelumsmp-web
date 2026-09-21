// Dummy staff dashboard content. Replace with real sources later: Discord OAuth for roles, ticket plugin, LiteBans, CoreProtect.
import { getContent } from "@/app/_lib/store";
import { getStatus } from "@/app/_lib/status";
import type { IconName } from "@/app/_ui/art";

// Ordered lowest → highest; every role sees everything below it. `can` compares positions.
export const roles = ["helper", "mod", "admin", "owner"] as const;
export type Role = (typeof roles)[number];
export const roleName: Record<Role, string> = { helper: "Helper", mod: "Moderator", admin: "Admin", owner: "Owner" };
export const can = (role: Role, min: Role) => roles.indexOf(role) >= roles.indexOf(min);

export const tabs = [
  { key: "overview", label: "Overview", icon: "diamond", min: "helper" },
  { key: "tasks", label: "Tasks & points", icon: "star", min: "helper" },
  { key: "tickets", label: "Tickets", icon: "heart", min: "helper" },
  { key: "players", label: "Online players", icon: "emerald", min: "helper" },
  { key: "guides", label: "Guides", icon: "book", min: "helper" },
  { key: "commands", label: "Commands", icon: "pickaxe", min: "helper" },
  { key: "bugs", label: "Report a bug", icon: "skull", min: "helper" },
  { key: "punishments", label: "Punishments", icon: "sword", min: "mod" },
  { key: "lookup", label: "Player lookup", icon: "map", min: "mod" },
  // Owner: edit what the public site shows. Lower `min` to "admin" to share a tab with admins.
  { key: "site", label: "Site settings", icon: "chest", min: "owner" },
  { key: "posts", label: "Blog posts", icon: "clock", min: "owner" },
  { key: "team", label: "Team", icon: "trophy", min: "owner" },
  { key: "vote", label: "Vote sites", icon: "ballot", min: "owner" },
] as const satisfies { key: string; label: string; icon: IconName; min: Role }[];
export type Tab = (typeof tabs)[number];
export type SearchParams = Record<string, string | string[] | undefined>;

// ponytail: role comes from ?as= for the preview. Real version reads the session's Discord guild roles on every request.
export function resolve(sp: SearchParams) {
  const role = roles.find((r) => r === sp.as) ?? "helper";
  const tab = tabs.find((t) => t.key === sp.tab) ?? tabs[0];
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  return { role, tab, allowed: can(role, tab.min), q: str("q"), guide: str("guide"), cat: str("cat"), post: str("post") };
}

export const href = (base: string, role: Role, tab: string) => `${base}?as=${role}&tab=${tab}`;

// Everything a dashboard page needs: its searchParams, the viewer, deadlines and live server numbers.
export async function load(searchParams: Promise<SearchParams>) {
  const r = resolve(await searchParams);
  const { settings } = await getContent();
  return { ...r, me: profile[r.role], d: deadlines(), status: await getStatus(settings), season: settings.season };
}

// ---------- me: points, rank ladder, activity requirement ----------
export const profile: Record<Role, { name: string; balance: number; next: string; promoteAt: number; floor: number; week: number; weekMin: number; warnings: number }> = {
  helper: { name: "Steve", balance: 312, next: "Moderator", promoteAt: 500, floor: 150, week: 35, weekMin: 60, warnings: 1 },
  mod: { name: "Alex", balance: 540, next: "Senior Mod", promoteAt: 900, floor: 400, week: 72, weekMin: 80, warnings: 0 },
  admin: { name: "jeb_", balance: 980, next: "Head Admin", promoteAt: 1500, floor: 600, week: 140, weekMin: 100, warnings: 0 },
  owner: { name: "NekrosBurek", balance: 1200, next: "—", promoteAt: 1200, floor: 0, week: 90, weekMin: 0, warnings: 0 },
};
export const MAX_WARNINGS = 2;

// ok: on track. warn: below the weekly minimum, a warning lands at weekly reset. demote: that warning would be the last one.
export function standing(role: Role) {
  const p = profile[role];
  if (p.week >= p.weekMin) return "ok" as const;
  return p.warnings + 1 >= MAX_WARNINGS ? ("demote" as const) : ("warn" as const);
}

// Points expire 14 days after they're earned.
export const grants = [
  { pts: 25, reason: "Guide: Handling grief reports", hours: 20 },
  { pts: 40, reason: "Weekly: closed 20 tickets", hours: 58 },
  { pts: 10, reason: "Daily: closed 3 tickets", hours: 131 },
  { pts: 20, reason: "Staff meeting attended", hours: 250 },
];

export const daily = [
  { title: "Close 3 tickets", done: 2, target: 3, pts: 10, min: "helper" },
  { title: "Answer 5 questions in #help", done: 5, target: 5, pts: 5, min: "helper" },
  { title: "60 minutes on duty in-game", done: 40, target: 60, pts: 10, min: "helper" },
  { title: "Review 2 chat reports", done: 0, target: 2, pts: 10, min: "mod" },
] as const satisfies { title: string; done: number; target: number; pts: number; min: Role }[];

export const weekly = [
  { title: "Close 20 tickets", done: 12, target: 20, pts: 40, min: "helper" },
  { title: "Attend the staff meeting", done: 0, target: 1, pts: 20, min: "helper" },
  { title: "Write or update a guide", done: 1, target: 1, pts: 25, min: "helper" },
  { title: "Handle 5 ban appeals", done: 3, target: 5, pts: 35, min: "mod" },
] as const satisfies { title: string; done: number; target: number; pts: number; min: Role }[];

// Absolute deadlines from "now": daily reset at 00:00 UTC, weekly reset Monday 00:00 UTC.
export function deadlines(now = Date.now()) {
  const d = new Date(now);
  const [y, m, day] = [d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()];
  return {
    daily: Date.UTC(y, m, day + 1),
    weekly: Date.UTC(y, m, day + ((8 - d.getUTCDay()) % 7 || 7)),
    expiring: grants.map((g) => ({ ...g, at: now + g.hours * 3_600_000 })),
  };
}
export type Deadlines = ReturnType<typeof deadlines>;

// ---------- server ----------
export const server = { tps: 19.8, mspt: 38, uptime: "6d 14h", ram: "7.1 / 12 GB" };

export const announcements = [
  { date: "Today", by: "jeb_", text: "Launch-night dragon fight Saturday 21:00 UTC. All hands on deck, vanish on." },
  { date: "Sep 17", by: "Notch", text: "New rule: shop signs with slurs are a straight 3-day ban, no warning step." },
  { date: "Sep 14", by: "jeb_", text: "Ticket tags are live. Tag every ticket before closing it." },
];

// ---------- tickets ----------
export const tickets = [
  { id: 1047, player: "Pebble", topic: "Chest emptied at /warp market", tag: "Grief", status: "open", age: "4m", by: "" },
  { id: 1046, player: "Kiwi_", topic: "Someone is flying near spawn", tag: "Cheating", status: "open", age: "11m", by: "" },
  { id: 1045, player: "Mossy", topic: "Lost items after lag spike", tag: "Bug", status: "claimed", age: "26m", by: "Steve" },
  { id: 1044, player: "Ravenna", topic: "How do I trust a friend on my claim?", tag: "Question", status: "claimed", age: "40m", by: "Marc" },
  { id: 1043, player: "Lumen", topic: "Player spamming DMs", tag: "Chat", status: "escalated", age: "1h", by: "Steve" },
  { id: 1041, player: "Birch", topic: "Appeal: mute from Sep 16", tag: "Appeal", status: "waiting", age: "3h", by: "Alex" },
] as const;
export type TicketStatus = (typeof tickets)[number]["status"];
export const statusTint: Record<TicketStatus, string> = { open: "var(--coral)", claimed: "var(--cyan)", waiting: "var(--violet)", escalated: "var(--lime)" };

// ---------- players ----------
export const online = [
  { name: "Notch", world: "Overworld", ping: 24, session: "3h 10m", staff: true },
  { name: "Pebble", world: "Overworld", ping: 61, session: "42m" },
  { name: "Kiwi_", world: "Nether", ping: 88, session: "1h 05m" },
  { name: "Mossy", world: "Overworld", ping: 45, session: "2h 31m" },
  { name: "Ravenna", world: "End", ping: 132, session: "18m", flag: "New" },
  { name: "Lumen", world: "Overworld", ping: 37, session: "4h 02m" },
  { name: "Birch", world: "Nether", ping: 210, session: "9m", flag: "Muted" },
  { name: "Marc", world: "Overworld", ping: 19, session: "5h 44m", staff: true },
];

// ---------- commands ----------
export const commands = [
  { cmd: "/duty", text: "Toggle on-duty. Duty minutes count toward daily tasks.", min: "helper" },
  { cmd: "/ticket list", text: "Show open tickets.", min: "helper" },
  { cmd: "/ticket claim <id>", text: "Claim a ticket so no one doubles up.", min: "helper" },
  { cmd: "/ticket close <id> <tag>", text: "Close with a tag. Untagged tickets don't earn points.", min: "helper" },
  { cmd: "/warn <player> <reason>", text: "Formal warning, stored in history.", min: "helper" },
  { cmd: "/mute <player> <≤1h> <reason>", text: "Helpers can mute for up to one hour.", min: "helper" },
  { cmd: "/co inspect", text: "Toggle the block inspector (CoreProtect).", min: "helper" },
  { cmd: "/sc <message>", text: "Staff chat.", min: "helper" },
  { cmd: "/vanish", text: "Go invisible to players.", min: "mod" },
  { cmd: "/tempban <player> <time> <reason>", text: "Temporary ban. Evidence required in the note.", min: "mod" },
  { cmd: "/ban <player> <reason>", text: "Permanent ban. Tell an Admin in staff chat.", min: "mod" },
  { cmd: "/co rollback u:<player> t:<time> r:<radius>", text: "Undo grief. Preview first with #preview.", min: "mod" },
  { cmd: "/invsee <player>", text: "Look at an inventory without touching it.", min: "mod" },
  { cmd: "/history <player>", text: "Full punishment history.", min: "mod" },
] as const satisfies { cmd: string; text: string; min: Role }[];

// ---------- mod: punishments + lookup ----------
export const punishments = [
  { when: "Today 14:02", player: "Birch", type: "Mute", length: "1h", reason: "Spamming DMs", by: "Steve" },
  { when: "Today 11:40", player: "xX_Grief_Xx", type: "Ban", length: "Perm", reason: "Hacked client (fly, killaura)", by: "Alex" },
  { when: "Yesterday", player: "Kiwi_", type: "Warn", length: "—", reason: "Caps spam", by: "Marc" },
  { when: "Sep 17", player: "Pebble", type: "Tempban", length: "3d", reason: "Grief at /warp market", by: "Alex" },
  { when: "Sep 16", player: "Birch", type: "Mute", length: "10m", reason: "Arguing in global", by: "Steve" },
];
export const punishTint: Record<string, string> = { Warn: "var(--lime)", Mute: "var(--cyan)", Tempban: "var(--violet)", Ban: "var(--coral)" };

export const lookup = {
  name: "Birch",
  first: "Aug 02, 2026",
  last: "Online now",
  playtime: "61h",
  alts: ["Birch_2"],
  notes: ["Argues a lot in global, usually calms down after a warning.", "Mute on Sep 16 was for arguing, not slurs."],
};
