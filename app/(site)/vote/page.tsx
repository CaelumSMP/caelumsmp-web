import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { getContent } from "@/app/_lib/store";
import { Icon } from "@/app/_ui/art";
import { headRender, players } from "@/app/_ui/data";
import s from "@/app/aurora.module.css";
import x from "@/app/(site)/site.module.css";

export const metadata: Metadata = { title: "Vote" };

const tints = ["#c6ff3d", "#ff5a5f", "#4de3ff", "#a77bff"];
const streak = [
  { days: 7, reward: "Rare vote key" },
  { days: 14, reward: "Cosmetic trail for a month" },
  { days: 30, reward: "Exclusive season banner" },
];

export default async function Vote() {
  const { voteSites, settings } = await getContent();
  const top = [...players].sort((a, b) => b.votes - a.votes).slice(0, 10);

  return (
    <main className={x.pageWrap}>
      <header className={x.pageHead}>
        <Icon name="ballot" size={64} />
        <div>
          <h1>Vote for CaelumSMP</h1>
          <p>
            Every vote helps new players find us, and each one pays you back in-game. Vote on every site once a day, then run <code>/vote claim</code> on the server.
          </p>
        </div>
      </header>

      <ol className={x.voteList}>
        {voteSites.map((v, n) => (
          <li key={v.url} className={s.neon} style={{ "--c": tints[n % 4] } as CSSProperties}>
            <b className={x.voteNum}>{n + 1}</b>
            <div>
              <h2>{v.name}</h2>
              <p>{v.reward}</p>
            </div>
            <a href={v.url} className={s.btn} target="_blank" rel="noopener noreferrer">
              Vote →
            </a>
          </li>
        ))}
      </ol>

      <div className={x.split}>
        <section>
          <h2 className={s.head}>
            <span>+</span>Streaks
          </h2>
          <ul className={x.streak}>
            {streak.map((st, n) => (
              <li key={st.days} style={{ "--c": tints[n + 1] } as CSSProperties}>
                <b>{st.days} days</b>
                <span>{st.reward}</span>
              </li>
            ))}
          </ul>
          <p className={x.muted}>Vote on at least one site every day to keep a streak. Miss a day and it starts again.</p>
          <a href={settings.storeUrl} className={s.textLink}>
            Want to support the server another way? Visit the store →
          </a>
        </section>
        <section>
          <h2 className={s.head}>
            <span>#</span>Top voters
          </h2>
          <ol className={x.board}>
            {top.map((p, i) => (
              <li key={p.name} style={{ "--share": p.votes / top[0].votes } as CSSProperties}>
                <b>{i + 1}</b>
                <img src={headRender(p.name, 64)} alt="" width={32} height={32} />
                <Link href={`/players/${encodeURIComponent(p.name)}`}>{p.name}</Link>
                <span className={x.bar} aria-hidden />
                <em>{p.votes}</em>
              </li>
            ))}
          </ol>
          <p className={x.muted}>The top voter each month wins a Supporter rank for the next month.</p>
        </section>
      </div>
    </main>
  );
}
