"use client";

import Link from "next/link";
import { bodyRender, headRender } from "@/app/_ui/data";
import { useLeaderboard } from "@/app/_ui/useLeaderboard";
import s from "@/app/aurora.module.css";

// Top three on a podium (2nd, 1st, 3rd), the rest listed underneath.
export default function Podium() {
  const { categories, key, setKey, category, rows } = useLeaderboard();
  const podium = [rows[1], rows[0], rows[2]];
  return (
    <div className={s.ranks}>
      <div role="tablist" aria-label="Leaderboard category" className={s.tabs}>
        {categories.map((c) => (
          <button key={c.key} type="button" role="tab" aria-selected={c.key === key} onClick={() => setKey(c.key)}>
            {c.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-label={category.label}>
        <ol className={s.podium}>
          {podium.map((r) => (
            <li key={r.name} data-rank={r.rank}>
              <img src={bodyRender(r.name, 256)} alt="" width={110} height={179} />
              <div className={s.block}>
                <b>{r.rank}</b>
                <Link href={`/players/${encodeURIComponent(r.name)}`}>{r.name}</Link>
                <em>{r.value}</em>
              </div>
            </li>
          ))}
        </ol>
        <ol start={4} className={s.rest}>
          {rows.slice(3, 8).map((r) => (
            <li key={r.name}>
              <b>{r.rank}</b>
              <img src={headRender(r.name, 64)} alt="" width={32} height={32} />
              <Link href={`/players/${encodeURIComponent(r.name)}`}>{r.name}</Link>
              <em>{r.value}</em>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
