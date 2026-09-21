import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/app/_lib/content";
import { getContent } from "@/app/_lib/store";
import { bodyRender, categories, findPlayer, players, rankIn, type Player } from "@/app/_ui/data";
import s from "@/app/aurora.module.css";
import x from "@/app/(site)/site.module.css";

const tints = ["#c6ff3d", "#ff5a5f", "#4de3ff", "#a77bff"];

export const generateStaticParams = () => players.map((p) => ({ name: p.name }));

export async function generateMetadata({ params }: PageProps<"/players/[name]">): Promise<Metadata> {
  const { name } = await params;
  return { title: findPlayer(decodeURIComponent(name))?.name ?? "Player" };
}

// Badges come from stats, so they stay correct when real data replaces the demo numbers.
function badges(p: Player, staffRole?: string) {
  const out: { label: string; c: string }[] = [];
  if (staffRole) out.push({ label: staffRole, c: tints[1] });
  if (p.seasons.includes(1)) out.push({ label: "Founding player", c: tints[0] });
  for (const c of categories) if (c.key !== "deaths" && rankIn(c.key, p.name) <= 3) out.push({ label: `Top 3: ${c.label}`, c: tints[2] });
  if (p.votes >= 25) out.push({ label: "Loyal voter", c: tints[3] });
  if (p.rank === "Supporter") out.push({ label: "Supporter", c: tints[3] });
  return out;
}

export default async function Profile({ params }: PageProps<"/players/[name]">) {
  const { name } = await params;
  const p = findPlayer(decodeURIComponent(name));
  if (!p) notFound();
  const staff = (await getContent()).team.find((m) => m.name === p.name);

  return (
    <main className={x.pageWrap}>
      <Link href="/leaderboards" className={s.back}>
        ← Leaderboards
      </Link>
      <section className={x.profile}>
        <img src={bodyRender(p.name, 384)} alt={`${p.name}'s Minecraft skin`} width={200} height={325} className={x.profileSkin} />
        <div className={x.profileMain}>
          <p className={x.profileState}>
            <i className={x.dot} data-off={!p.online || undefined} /> {p.online ? "Online now" : `Last seen ${p.lastSeen}`}
          </p>
          <h1>{p.name}</h1>
          {p.bio && <p className={x.profileBio}>{p.bio}</p>}
          <ul className={x.badgeRow}>
            {badges(p, staff?.role).map((b) => (
              <li key={b.label} className={s.badge} style={{ "--c": b.c } as CSSProperties}>
                {b.label}
              </li>
            ))}
          </ul>
          <dl className={x.facts}>
            <div>
              <dt>Rank</dt>
              <dd>{p.rank}</dd>
            </div>
            <div>
              <dt>First joined</dt>
              <dd>{formatDate(p.joined)}</dd>
            </div>
            <div>
              <dt>Seasons</dt>
              <dd>{p.seasons.map((n) => `S${n}`).join(" · ")}</dd>
            </div>
          </dl>
        </div>
      </section>

      <h2 className={s.head}>
        <span>01</span>Stats
      </h2>
      <ul className={x.statGrid}>
        {categories.map((c, n) => (
          <li key={c.key} style={{ "--c": tints[n % 4] } as CSSProperties}>
            <span>{c.label}</span>
            <b>{c.format(p[c.key])}</b>
            <Link href={`/leaderboards?by=${c.key}`}>
              #{rankIn(c.key, p.name)} of {players.length}
            </Link>
          </li>
        ))}
      </ul>

      <h2 className={s.head}>
        <span>02</span>Recent activity
      </h2>
      <ol className={x.timeline}>
        {(p.activity ?? []).map((a) => (
          <li key={a.text}>
            <time>{a.when}</time>
            <p>{a.text}</p>
          </li>
        ))}
        <li>
          <time>{formatDate(p.joined)}</time>
          <p>Joined CaelumSMP</p>
        </li>
      </ol>
    </main>
  );
}
