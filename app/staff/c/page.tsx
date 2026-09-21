import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Cube } from "@/app/_ui/art";
import { fmt } from "@/app/_lib/status";
import { can, href, load, roleName, roles, server, tabs } from "../data";
import { Announcements, Locked, Me, Meter, openTickets, Panel, PlayerList, RoleSwitch, Standing, TaskList, TicketTable } from "../Panels";
import c from "./c.module.css";

export const metadata: Metadata = { title: "Staff · Dispatch" };

const BASE = "/staff/c";

// Variant C: dense work tool. Narrow grouped sidebar with counters, ticket queue front and centre, a right rail for "me".
export default async function Dispatch({ searchParams }: PageProps<"/staff/c">) {
  const ctx = await load(searchParams);
  const { role, tab, allowed, d, status } = ctx;
  const count: Partial<Record<string, number>> = { tickets: openTickets, players: status.online ?? undefined };
  const groups = roles.filter((r) => can(role, r) && tabs.some((t) => t.min === r));

  return (
    <div className={c.shell}>
      <aside className={c.side}>
        <Link href="/" className={c.brand}>
          <Cube size={22} top="#c6ff3d" left="#8fc41f" right="#6a9612" trim={null} />
          Dispatch
        </Link>
        <nav aria-label="Dashboard">
          {groups.map((g) => (
            <div key={g} className={c.group}>
              <p>{roleName[g]}</p>
              <ul>
                {tabs
                  .filter((t) => t.min === g)
                  .map((t) => (
                    <li key={t.key}>
                      <Link href={href(BASE, role, t.key)} aria-current={t.key === tab.key ? "page" : undefined}>
                        {t.label}
                        {count[t.key] !== undefined && <b>{count[t.key]}</b>}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className={c.foot}>
          <Me role={role} />
          <RoleSwitch base={BASE} role={role} tab={tab.key} />
        </div>
      </aside>

      <div className={c.main}>
        <header className={c.top}>
          <h1>{tab.label}</h1>
          <ul className={c.stats}>
            <li>
              <i /> {fmt(status.online)}/{status.max} online
            </li>
            <li>TPS {server.tps}</li>
            <li>MSPT {server.mspt}</li>
            <li>RAM {server.ram}</li>
            <li>Up {server.uptime}</li>
          </ul>
        </header>

        {!allowed ? (
          <div className={c.pad}>
            <Locked min={tab.min} />
          </div>
        ) : tab.key === "overview" ? (
          <div className={c.cols}>
            <main className={c.center}>
              <Box title="Ticket queue" aside={`${openTickets} open`}>
                <TicketTable role={role} />
              </Box>
              <Box title="Staff notices">
                <Announcements />
              </Box>
            </main>
            <aside className={c.right}>
              <Standing role={role} />
              <Box title="My points">
                <Meter role={role} d={d} />
              </Box>
              <Box title="Today">
                <TaskList role={role} kind="daily" reset={d.daily} />
              </Box>
              <Box title="Online" aside={fmt(status.online)}>
                <PlayerList limit={6} />
              </Box>
            </aside>
          </div>
        ) : (
          <main className={c.pad}>
            <Panel {...ctx} base={BASE} />
          </main>
        )}
      </div>
    </div>
  );
}

// Flat section: a thin accent rule instead of the neon outline, so the dense view stays quiet.
function Box({ title, aside, children }: { title: string; aside?: string; children: ReactNode }) {
  return (
    <section className={c.box}>
      <h2>
        {title}
        {aside && <span>{aside}</span>}
      </h2>
      {children}
    </section>
  );
}
