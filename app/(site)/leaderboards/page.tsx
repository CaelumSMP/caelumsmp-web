import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { Icon } from "@/app/_ui/art";
import { bodyRender, categories, headRender, players } from "@/app/_ui/data";
import s from "@/app/aurora.module.css";
import x from "@/app/(site)/site.module.css";

export const metadata: Metadata = { title: "Leaderboards" };

// One board per stat, picked with ?by=. Plain links, so every board has its own shareable URL.
export default async function Leaderboards({ searchParams }: PageProps<"/leaderboards">) {
  const { by } = await searchParams;
  const cat = categories.find((c) => c.key === by) ?? categories[0];
  const rows = [...players].sort((a, b) => b[cat.key] - a[cat.key]);
  const max = rows[0][cat.key] || 1;

  return (
    <main className={x.pageWrap}>
      <header className={x.pageHead}>
        <Icon name="trophy" size={64} />
        <div>
          <h1>Leaderboards</h1>
          <p>Season-wide rankings, updated from the server every few minutes. Click a name for their full profile.</p>
        </div>
        <form action="/players" className={x.search} role="search">
          <input name="q" placeholder="Find a player" aria-label="Find a player" required />
          <button type="submit" className={s.btn}>
            Go
          </button>
        </form>
      </header>

      <nav className={s.tabs} aria-label="Leaderboard category">
        {categories.map((c) => (
          <Link key={c.key} href={`/leaderboards?by=${c.key}`} aria-current={c.key === cat.key ? "page" : undefined} className={x.tabLink}>
            {c.label}
          </Link>
        ))}
      </nav>

      <ol className={s.podium}>
        {[rows[1], rows[0], rows[2]].map((p) => {
          const rank = rows.indexOf(p) + 1;
          return (
            <li key={p.name} data-rank={rank}>
              <img src={bodyRender(p.name, 256)} alt="" width={110} height={179} />
              <div className={s.block}>
                <b>{rank}</b>
                <Link href={`/players/${encodeURIComponent(p.name)}`}>{p.name}</Link>
                <em>{cat.format(p[cat.key])}</em>
              </div>
            </li>
          );
        })}
      </ol>

      <ol className={x.board}>
        {rows.map((p, i) => (
          <li key={p.name} style={{ "--share": p[cat.key] / max } as CSSProperties}>
            <b>{i + 1}</b>
            <img src={headRender(p.name, 64)} alt="" width={32} height={32} />
            <Link href={`/players/${encodeURIComponent(p.name)}`}>
              {p.name}
              {p.online && <i className={x.dot} title="Online now" />}
            </Link>
            <span className={x.bar} aria-hidden />
            <em>{cat.format(p[cat.key])}</em>
          </li>
        ))}
      </ol>
    </main>
  );
}
