"use client";

import { useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { formatDate, type Member } from "@/app/_lib/content";
import { bodyRender, findPlayer } from "@/app/_ui/data";
import s from "@/app/aurora.module.css";
import x from "./site.module.css";

const tints = ["#c6ff3d", "#ff5a5f", "#4de3ff", "#a77bff"];

// Team cards; clicking one opens a <dialog> with the full profile (Esc and backdrop click close it).
export default function TeamGrid({ team }: { team: Member[] }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const m = open === null ? null : team[open];
  const player = m ? findPlayer(m.name) : undefined;

  function show(n: number) {
    setOpen(n);
    ref.current?.showModal();
  }

  return (
    <>
      <ul className={s.team}>
        {team.map((mem, n) => (
          <li key={mem.name} className={s.neon} style={{ "--c": tints[n % 4] } as CSSProperties}>
            <button type="button" className={x.memberBtn} onClick={() => show(n)} aria-haspopup="dialog">
              <img src={bodyRender(mem.name, 256)} alt={`${mem.name}'s Minecraft skin`} width={120} height={195} loading="lazy" />
              <span className={s.badge}>{mem.role}</span>
              <h3>{mem.name}</h3>
              <p>{mem.bio}</p>
              <b className={x.read}>Profile →</b>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={ref}
        className={x.modal}
        aria-label={m ? `${m.name}, ${m.role}` : "Team member"}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
        style={{ "--c": tints[(open ?? 0) % 4] } as CSSProperties}
      >
        {m && (
          <div className={x.modalBody}>
            <img src={bodyRender(m.name, 384)} alt="" width={180} height={292} className={x.modalSkin} />
            <div>
              <span className={s.badge}>{m.role}</span>
              <h2>{m.name}</h2>
              <p className={x.modalBio}>{m.bio}</p>
              {m.quote && <blockquote className={x.modalQuote}>&ldquo;{m.quote}&rdquo;</blockquote>}
              <dl className={x.facts}>
                <div>
                  <dt>Looks after</dt>
                  <dd>{m.focus}</dd>
                </div>
                <div>
                  <dt>On the team since</dt>
                  <dd>{formatDate(m.joined)}</dd>
                </div>
                {m.discord && (
                  <div>
                    <dt>Discord</dt>
                    <dd>@{m.discord}</dd>
                  </div>
                )}
                {player && (
                  <div>
                    <dt>Playtime</dt>
                    <dd>{player.playtime}h</dd>
                  </div>
                )}
              </dl>
              <div className={x.modalActions}>
                {player && (
                  <Link href={`/players/${encodeURIComponent(m.name)}`} className={s.btn}>
                    Player stats
                  </Link>
                )}
                <button type="button" className={x.ghost} onClick={() => ref.current?.close()}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
