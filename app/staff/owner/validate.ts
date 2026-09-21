// Turns untrusted JSON from the editor forms into typed content, or throws a message the form can show.
import { sanitizeDoc } from "@/app/_lib/editor";
import { tints, type Feature, type Member, type Post, type Rule, type Settings, type Social, type Tint, type VoteSite } from "@/app/_lib/content";
import { sprites, type IconName } from "@/app/_ui/art";

type Obj = Record<string, unknown>;
const obj = (v: unknown, what: string): Obj => {
  if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error(`${what} is malformed.`);
  return v as Obj;
};
const arr = (v: unknown, what: string, max: number): unknown[] => {
  if (!Array.isArray(v)) throw new Error(`${what} is malformed.`);
  if (v.length > max) throw new Error(`${what}: at most ${max} entries.`);
  return v;
};

export function text(v: unknown, label: string, max: number, required = true) {
  const s = typeof v === "string" ? v.trim() : "";
  if (required && !s) throw new Error(`${label} can't be empty.`);
  if (s.length > max) throw new Error(`${label} is too long (max ${max} characters).`);
  return s;
}

function link(v: unknown, label: string, required = true) {
  const s = text(v, label, 500, required);
  if (s && !/^https?:\/\/[^\s]+$/i.test(s)) throw new Error(`${label} must start with https://`);
  return s;
}

function int(v: unknown, label: string, min: number, max: number) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) throw new Error(`${label} must be a whole number from ${min} to ${max}.`);
  return n;
}

function date(v: unknown, label: string) {
  const s = text(v, label, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(s))) throw new Error(`${label} must be a date.`);
  return s;
}

export function settings(raw: unknown): Settings {
  const s = obj(raw, "Settings");
  const status = obj(s.status, "Live counters");
  const hero = obj(s.hero, "Hero");
  const event = obj(s.event, "Next event");
  const lines = arr(hero.lines, "Hero title", 3);
  const at = text(event.at, "Event time", 40);
  if (Number.isNaN(Date.parse(at))) throw new Error("Event time must be a date and time.");
  return {
    ip: text(s.ip, "Server IP", 100),
    version: text(s.version, "Version", 40),
    season: int(s.season, "Season", 1, 999),
    maxPlayers: int(s.maxPlayers, "Max players", 1, 100_000),
    discordInvite: link(s.discordInvite, "Discord invite"),
    storeUrl: link(s.storeUrl, "Store URL"),
    status: {
      source: status.source === "live" ? "live" : "demo",
      online: int(status.online, "Demo players online", 0, 100_000),
      discord: int(status.discord, "Demo Discord online", 0, 10_000_000),
    },
    hero: {
      lines: [0, 1, 2].map((i) => text(lines[i], `Hero line ${i + 1}`, 40)) as [string, string, string],
      lede: text(hero.lede, "Hero text", 400),
    },
    event: { title: text(event.title, "Event name", 40), at: new Date(at).toISOString() },
    features: arr(s.features, "Features", 8).map((f, i): Feature => {
      const o = obj(f, `Feature ${i + 1}`);
      const icon = String(o.icon);
      if (!(icon in sprites)) throw new Error(`Feature ${i + 1}: unknown icon.`);
      return { icon: icon as IconName, title: text(o.title, `Feature ${i + 1} title`, 40), text: text(o.text, `Feature ${i + 1} text`, 200) };
    }),
    rules: arr(s.rules, "Rules", 60).map((r, i): Rule => {
      const o = obj(r, `Rule ${i + 1}`);
      return { q: text(o.q, `Rule ${i + 1} question`, 160), a: text(o.a, `Rule ${i + 1} answer`, 1000) };
    }),
    socials: arr(s.socials, "Social links", 12).map((r, i): Social => {
      const o = obj(r, `Social link ${i + 1}`);
      return { label: text(o.label, `Social link ${i + 1} name`, 30), href: link(o.href, `Social link ${i + 1} URL`) };
    }),
  };
}

export function team(raw: unknown): Member[] {
  return arr(raw, "Team", 60).map((m, i) => {
    const o = obj(m, `Member ${i + 1}`);
    const n = `Member ${i + 1}`;
    return {
      name: text(o.name, `${n} name`, 16),
      role: text(o.role, `${n} role`, 30),
      bio: text(o.bio, `${n} bio`, 300),
      joined: date(o.joined, `${n} joined date`),
      discord: text(o.discord, `${n} Discord`, 40, false).replace(/^@/, ""),
      focus: text(o.focus, `${n} "looks after"`, 120, false),
      quote: text(o.quote, `${n} quote`, 160, false),
    };
  });
}

export function voteSites(raw: unknown): VoteSite[] {
  return arr(raw, "Vote sites", 20).map((v, i) => {
    const o = obj(v, `Vote site ${i + 1}`);
    return { name: text(o.name, `Vote site ${i + 1} name`, 60), url: link(o.url, `Vote site ${i + 1} URL`), reward: text(o.reward, `Vote site ${i + 1} reward`, 120) };
  });
}

export function post(raw: unknown): Post {
  const o = obj(raw, "Post");
  const slug = text(o.slug, "URL slug", 80);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) throw new Error("URL slug can only use lowercase letters, numbers and dashes.");
  const cover = text(o.cover, "Cover image", 500, false);
  if (cover && !/^\/uploads\/[\w.-]+$/.test(cover) && !/^https:\/\/\S+$/i.test(cover)) throw new Error("Cover image must be an upload or an https:// link.");
  const doc = sanitizeDoc(obj(o.doc, "Post body"));
  if (!doc || doc.type !== "doc") throw new Error("Post body is malformed.");
  if (JSON.stringify(doc).length > 400_000) throw new Error("Post body is too long.");
  return {
    slug,
    title: text(o.title, "Title", 120),
    tag: text(o.tag, "Tag", 24),
    date: date(o.date, "Date"),
    author: text(o.author, "Author", 16),
    excerpt: text(o.excerpt, "Summary", 300),
    cover,
    tint: (Object.keys(tints).includes(String(o.tint)) ? o.tint : "lime") as Tint,
    points: arr(o.points, "At a glance", 10).map((pt, i) => text(pt, `At a glance line ${i + 1}`, 160)).filter(Boolean),
    published: o.published === true,
    doc,
  };
}
