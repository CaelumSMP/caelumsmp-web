import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { Cube } from "@/app/_ui/art";
import { fmt } from "@/app/_lib/status";
import { can, href, load, server, tabs } from "../data";
import { Announcements, Card, Locked, Me, Meter, openTickets, Panel, PlayerList, RoleSwitch, Standing, TaskList, TicketTable } from "../Panels";
import c from "./a.module.css";

export const metadata: Metadata = { title: "Staff · Control Room" };

const BASE = "/staff/a";
const tints = ["var(--lime)", "var(--coral)", "var(--cyan)", "var(--violet)"];

// Variant A: closest to the public site. Numbered block sidebar, board-bar status strip, neon card grid.
export default async function ControlRoom({ searchParams }: PageProps<"/staff/a">) {
  const ctx = await load(searchParams);
  const { role, tab, allowed, me, d, status } = ctx;
  const strip = [
    { label: "Online", value: `${fmt(status.online)} / ${status.max}`, live: status.online !== null },
    { label: "TPS", value: server.tps },
    { label: "Open tickets", value: openTickets },
    { label: "My points", value: me.balance },
  ];

  return (
    <div className={c.shell}>
      <aside className={c.side}>
        <Link href="/" className={c.brand}>
          <Cube size={30} top="#c6ff3d" left="#8fc41f" right="#6a9612" trim={null} />
          <span>
            Caelum <small>Staff</small>
          </span>
        </Link>
        <nav aria-label="Dashboard">
          <ol className={c.nav}>
            {tabs
              .filter((t) => can(role, t.min))
              .map((t, n) => (
                <li key={t.key}>
                  <Link href={href(BASE, role, t.key)} aria-current={t.key === tab.key ? "page" : undefined}>
                    <span>{String(n + 1).padStart(2, "0")}</span>
                    {t.label}
                  </Link>
                </li>
              ))}
          </ol>
        </nav>
        <RoleSwitch base={BASE} role={role} tab={tab.key} />
      </aside>

      <main className={c.main}>
        <header className={c.top}>
          <h1>{tab.label}</h1>
          <Me role={role} />
        </header>

        <dl className={c.strip}>
          {strip.map((b, n) => (
            <div key={b.label} style={{ "--c": tints[n] } as CSSProperties}>
              <dt>
                {b.live && <i />}
                {b.label}
              </dt>
              <dd>{b.value}</dd>
            </div>
          ))}
        </dl>

        {!allowed ? (
          <Locked min={tab.min} />
        ) : tab.key === "overview" ? (
          <div className={c.grid}>
            <div className={c.wide}>
              <Standing role={role} />
            </div>
            <Card title="Points" c="var(--lime)">
              <Meter role={role} d={d} />
            </Card>
            <Card title="Today" c="var(--cyan)">
              <TaskList role={role} kind="daily" reset={d.daily} />
            </Card>
            <div className={c.wide}>
              <Card title="Ticket queue" c="var(--coral)">
                <TicketTable role={role} limit={4} />
                <Link href={href(BASE, role, "tickets")} className={c.more}>
                  All tickets →
                </Link>
              </Card>
            </div>
            <Card title="Online now" c="var(--violet)">
              <PlayerList limit={5} />
            </Card>
            <Card title="Staff notices" c="var(--lime)">
              <Announcements />
            </Card>
          </div>
        ) : (
          <Panel {...ctx} base={BASE} />
        )}
      </main>
    </div>
  );
}
