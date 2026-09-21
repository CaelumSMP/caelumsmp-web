import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { Cube } from "@/app/_ui/art";
import a from "@/app/aurora.module.css";
import s from "./staff.module.css";

export const metadata: Metadata = { title: "Staff dashboards" };

const variants = [
  { href: "/staff/a", name: "Control Room", c: "var(--lime)", line: "Closest to the public site. Numbered block sidebar, status board, neon card grid." },
  { href: "/staff/b", name: "Quest Log", c: "var(--coral)", line: "Game-like and task-first. Pixel icon rail, XP bar, big demotion timer, quest tiles." },
  { href: "/staff/c", name: "Dispatch", c: "var(--cyan)", line: "Dense work tool. Grouped sidebar with counters, ticket queue up front, a right rail for you." },
];

// Picker for the three dummy staff dashboard variants. Each one has the same tabs and data.
export default function StaffPicker() {
  return (
    <main className={s.wrap}>
      <p className={s.brand}>
        <Cube size={40} top="#c6ff3d" left="#8fc41f" right="#6a9612" trim={null} />
        CaelumSMP staff
      </p>
      <h1 className={s.title}>
        Pick a <em>dashboard</em>
      </h1>
      <p className={s.lede}>Three dummy looks with the same content. Every one has a &quot;Preview as&quot; switch to compare what a Helper and a Moderator see.</p>
      <ol className={s.grid}>
        {variants.map((v, n) => (
          <li key={v.href}>
            <Link href={v.href} className={a.neon} style={{ "--c": v.c } as CSSProperties}>
              <span className={a.badge}>Variant {"ABC"[n]}</span>
              <h2>{v.name}</h2>
              <p>{v.line}</p>
              <b>Open →</b>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
