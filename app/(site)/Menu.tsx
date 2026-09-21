"use client";

import { useRef } from "react";
import Link from "next/link";
import type { Social } from "@/app/_lib/content";
import CopyIp from "@/app/_ui/CopyIp";
import s from "@/app/aurora.module.css";

// Full-screen block menu. Native <dialog> gives focus trapping and Esc-to-close for free.
export default function Menu({ ip, storeUrl, socials, links }: { ip: string; storeUrl: string; socials: Social[]; links: readonly (readonly [string, string])[] }) {
  const ref = useRef<HTMLDialogElement>(null);
  const all = [["/", "Home"], ...links, ["/#join", "How to join"]];
  return (
    <>
      <button type="button" className={s.menuBtn} onClick={() => ref.current?.showModal()} aria-haspopup="dialog">
        <span aria-hidden className={s.burger} />
        Menu
      </button>
      <dialog ref={ref} className={s.menu} aria-label="Site menu">
        <button type="button" className={s.menuBtn} onClick={() => ref.current?.close()}>
          ✕ Close
        </button>
        <ol>
          {all.map(([href, label], n) => (
            <li key={href}>
              <Link href={href} onClick={() => ref.current?.close()}>
                <span>{String(n + 1).padStart(2, "0")}</span>
                {label}
              </Link>
            </li>
          ))}
        </ol>
        <div className={s.menuFoot}>
          <CopyIp ip={ip} className={s.btn} />
          <a href={storeUrl} className={s.btn}>
            Store
          </a>
          <ul>
            {socials.map((x) => (
              <li key={x.label}>
                <a href={x.href} target="_blank" rel="noopener noreferrer">
                  {x.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
}
