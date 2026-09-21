import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { Cube, Icon } from "@/app/_ui/art";
import { bodyRender } from "@/app/_ui/data";
import { can, daily, href, load, MAX_WARNINGS, roleName, standing, tabs, weekly } from "../data";
import { Announcements, Card, Locked, Panel, RoleSwitch, TicketTable } from "../Panels";
import Timer from "@/app/_ui/Timer";
import c from "./b.module.css";

export const metadata: Metadata = { title: "Staff · Quest Log" };

const BASE = "/staff/b";
const tints = ["var(--lime)", "var(--coral)", "var(--cyan)", "var(--violet)"];

// Variant B: game-like, tasks-first. Pixel icon rail (a hotbar on mobile), aurora hero with XP bar and the block timer.
export default async function QuestLog({ searchParams }: PageProps<"/staff/b">) {
  const ctx = await load(searchParams);
  const { role, tab, allowed, me, d, season } = ctx;
  const s = standing(role);
  const quests = [
    ...daily.filter((t) => can(role, t.min)).map((t) => ({ ...t, kind: "Daily" })),
    ...weekly.filter((t) => can(role, t.min)).map((t) => ({ ...t, kind: "Weekly" })),
  ];

  return (
    <div className={c.shell}>
      <nav className={c.rail} aria-label="Dashboard">
        <Link href="/" className={c.logo} aria-label="CaelumSMP home">
          <Cube size={40} top="#c6ff3d" left="#8fc41f" right="#6a9612" trim={null} />
        </Link>
        <ul>
          {tabs
            .filter((t) => can(role, t.min))
            .map((t) => (
              <li key={t.key}>
                <Link href={href(BASE, role, t.key)} aria-current={t.key === tab.key ? "page" : undefined} title={t.label}>
                  <Icon name={t.icon} size={28} />
                  <span>{t.label}</span>
                </Link>
              </li>
            ))}
        </ul>
      </nav>

      <main className={c.main}>
        {tab.key === "overview" && allowed ? (
          <header className={c.hero}>
            <div className={c.heroText}>
              <p className={c.kicker}>
                {roleName[role]} · Season {season}
              </p>
              <h1>
                Welcome back,
                <br />
                <em>{me.name}</em>
              </h1>
              <div className={c.xp}>
                <div className={c.xpHead}>
                  <b>{me.balance} pts</b>
                  <span>
                    {me.promoteAt} → {me.next}
                  </span>
                </div>
                <div className={c.xpBar} role="meter" aria-valuemin={0} aria-valuemax={me.promoteAt} aria-valuenow={me.balance} aria-label={`Points toward ${me.next}`}>
                  <i style={{ width: `${Math.round((me.balance / me.promoteAt) * 100)}%` }} />
                </div>
                <p className={c.xpNote}>
                  This week {me.week}/{me.weekMin} · Warnings {me.warnings}/{MAX_WARNINGS} · Demote under {me.floor}
                </p>
              </div>
              <RoleSwitch base={BASE} role={role} tab={tab.key} />
            </div>
            <div className={c.clock} data-state={s}>
              <span className={c.clockLabel}>{s === "ok" ? "Weekly reset in" : s === "warn" ? "Auto-warn in" : "Auto-demote in"}</span>
              <Timer target={d.weekly} label={s === "ok" ? "Weekly reset" : s === "warn" ? "Auto-warn" : "Auto-demote"} cells />
              <p>{s === "ok" ? "You've hit the weekly minimum. Nice." : `Earn ${me.weekMin - me.week} more points before reset.`}</p>
            </div>
            <img src={bodyRender(me.name, 256)} alt="" width={120} height={195} className={c.avatar} />
          </header>
        ) : (
          <header className={c.bar}>
            <h1>
              <Icon name={tab.icon} size={34} />
              {tab.label}
            </h1>
            <RoleSwitch base={BASE} role={role} tab={tab.key} />
          </header>
        )}

        <div className={c.body}>
          {!allowed ? (
            <Locked min={tab.min} />
          ) : tab.key === "overview" ? (
            <>
              <h2 className={c.h2}>
                <span>Quests</span>
                <small>
                  Daily resets in <Timer target={d.daily} label="Daily reset" />
                </small>
              </h2>
              <ul className={c.quests}>
                {quests.map((t, n) => {
                  const done = t.done >= t.target;
                  const blocks = Math.min(10, t.target);
                  const filled = Math.round((t.done / t.target) * blocks);
                  return (
                    <li key={t.title} style={{ "--c": tints[n % 4] } as CSSProperties} data-done={done || undefined}>
                      <span className={c.kind}>{t.kind}</span>
                      <b className={c.reward}>+{t.pts}</b>
                      <h3>{t.title}</h3>
                      <span className={c.blocks} aria-label={`${t.done} of ${t.target}`}>
                        {Array.from({ length: blocks }, (_, i) => (
                          <i key={i} data-on={i < filled || undefined} />
                        ))}
                      </span>
                      <small>
                        {t.done} / {t.target}
                      </small>
                      {done && <span className={c.stamp}>Done</span>}
                    </li>
                  );
                })}
              </ul>

              <div className={c.split}>
                <Card title="Ticket queue" c="var(--coral)">
                  <TicketTable role={role} limit={4} />
                </Card>
                <Card title="Staff notices" c="var(--cyan)">
                  <Announcements />
                </Card>
              </div>
            </>
          ) : (
            <Panel {...ctx} base={BASE} />
          )}
        </div>
      </main>
    </div>
  );
}
