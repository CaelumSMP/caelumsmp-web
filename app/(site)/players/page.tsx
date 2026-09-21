import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/app/_ui/art";
import { headRender, players } from "@/app/_ui/data";
import s from "@/app/aurora.module.css";
import x from "@/app/(site)/site.module.css";

export const metadata: Metadata = { title: "Players" };

export default async function Players({ searchParams }: PageProps<"/players">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const list = players
    .filter((p) => !query || p.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => Number(!!b.online) - Number(!!a.online) || b.playtime - a.playtime);

  return (
    <main className={x.pageWrap}>
      <header className={x.pageHead}>
        <Icon name="emerald" size={64} />
        <div>
          <h1>Players</h1>
          <p>Everyone who has played this season. Online players first.</p>
        </div>
        <form className={x.search} role="search">
          <input name="q" defaultValue={query} placeholder="Search by name" aria-label="Search players" />
          <button type="submit" className={s.btn}>
            Search
          </button>
        </form>
      </header>

      {query && (
        <p className={x.muted}>
          {list.length} result{list.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo;. <Link href="/players">Clear</Link>
        </p>
      )}
      <ul className={x.playerGrid}>
        {list.map((p) => (
          <li key={p.name}>
            <Link href={`/players/${encodeURIComponent(p.name)}`}>
              <img src={headRender(p.name, 64)} alt="" width={48} height={48} />
              <span>
                <b>{p.name}</b>
                <small>
                  {p.rank} · {p.playtime}h played
                </small>
              </span>
              {p.online ? <i className={x.dot} title="Online now" /> : <small className={x.muted}>{p.lastSeen}</small>}
            </Link>
          </li>
        ))}
      </ul>
      {!list.length && <p className={x.muted}>Nobody by that name has played this season.</p>}
    </main>
  );
}
