import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { fmt, type Status } from "@/app/_lib/status";
import { headRender } from "@/app/_ui/data";
import a from "@/app/aurora.module.css";
import BugForm from "./BugForm";
import GuidesTab from "./GuideView";
import { OwnerTab } from "./owner/OwnerTabs";
import {
  announcements,
  can,
  commands,
  daily,
  href,
  lookup,
  MAX_WARNINGS,
  online,
  profile,
  punishments,
  punishTint,
  roleName,
  roles,
  standing,
  statusTint,
  tickets,
  weekly,
  type Deadlines,
  type Role,
  type Tab,
} from "./data";
import p from "./panels.module.css";
import Timer from "@/app/_ui/Timer";

// Tab contents shared by every dashboard variant. Variants only differ in their shell and overview.

const tint = (c: string) => ({ "--c": c }) as CSSProperties;
const pct = (n: number) => `${Math.min(100, Math.round(n * 100))}%`;
const standingText = {
  ok: "On track this week",
  warn: "Below the weekly minimum: a warning lands at reset",
  demote: "Last warning: miss this week and you're auto-demoted",
};
const standingTint = { ok: "var(--lime)", warn: "var(--violet)", demote: "var(--coral)" };

export const openTickets = tickets.filter((t) => t.status === "open").length;

export function Standing({ role }: { role: Role }) {
  const s = standing(role);
  return (
    <p className={p.standing} style={tint(standingTint[s])}>
      <span className={a.badge}>{s === "ok" ? "Safe" : s === "warn" ? "Warning" : "Demotion risk"}</span>
      {standingText[s]}
    </p>
  );
}

// Points balance on the rank ladder: floor (demote below) → next rank.
export function Meter({ role, d }: { role: Role; d: Deadlines }) {
  const me = profile[role];
  const next = d.expiring[0];
  return (
    <div className={p.meter}>
      <div className={p.meterHead}>
        <b>{me.balance}</b>
        <span>
          pts · {me.promoteAt - me.balance} to {me.next}
        </span>
      </div>
      <div className={p.bar} role="meter" aria-valuemin={0} aria-valuemax={me.promoteAt} aria-valuenow={me.balance} aria-label={`Points toward ${me.next}`}>
        <i style={{ width: pct(me.balance / me.promoteAt) }} />
        <u style={{ left: pct(me.floor / me.promoteAt) }} title={`Demotion floor: ${me.floor}`} />
      </div>
      <div className={p.meterScale}>
        <span>0</span>
        <span style={{ left: pct(me.floor / me.promoteAt) }}>floor {me.floor}</span>
        <span>{me.promoteAt}</span>
      </div>
      <dl className={p.facts}>
        <div>
          <dt>This week</dt>
          <dd>
            {me.week} / {me.weekMin}
          </dd>
        </div>
        <div>
          <dt>Warnings</dt>
          <dd>
            {me.warnings} / {MAX_WARNINGS}
          </dd>
        </div>
        <div>
          <dt>−{next.pts} pts in</dt>
          <dd>
            <Timer target={next.at} label={`${next.pts} points expire`} />
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function TaskList({ role, kind, reset }: { role: Role; kind: "daily" | "weekly"; reset: number }) {
  const list = (kind === "daily" ? daily : weekly).filter((t) => can(role, t.min));
  return (
    <div className={p.tasks}>
      <div className={p.subHead}>
        <h3>{kind === "daily" ? "Daily tasks" : "Weekly tasks"}</h3>
        <span>
          resets in <Timer target={reset} label={`${kind} reset`} />
        </span>
      </div>
      <ul>
        {list.map((t) => {
          const done = t.done >= t.target;
          return (
            <li key={t.title} data-done={done || undefined}>
              <span className={p.tick} aria-label={done ? "Done" : "Not done"} />
              <span className={p.taskTitle}>{t.title}</span>
              <span className={p.taskBar} aria-hidden>
                <i style={{ width: pct(t.done / t.target) }} />
              </span>
              <span className={p.taskNum}>
                {t.done}/{t.target}
              </span>
              <b className={p.pts}>+{t.pts}</b>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function TicketTable({ role, limit }: { role: Role; limit?: number }) {
  return (
    <div className={p.tableWrap}>
      <table className={p.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Topic</th>
            <th>Status</th>
            <th>Age</th>
            <th>
              <span className={p.sr}>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {tickets.slice(0, limit).map((t) => (
            <tr key={t.id}>
              <td className={p.mono}>{t.id}</td>
              <td>
                <span className={p.who}>
                  <img src={headRender(t.player, 32)} alt="" width={20} height={20} />
                  {t.player}
                </span>
              </td>
              <td>
                {t.topic} <small className={p.tag}>{t.tag}</small>
              </td>
              <td>
                <span className={a.badge} style={tint(statusTint[t.status])}>
                  {t.status}
                </span>
                {t.by && <small className={p.by}>{t.by}</small>}
              </td>
              <td className={p.mono}>{t.age}</td>
              <td className={p.actions}>
                {t.status === "open" && <button type="button">Claim</button>}
                {role === "mod" && t.status !== "open" && <button type="button">Resolve</button>}
                {role === "mod" && t.status === "escalated" && <button type="button">Punish</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PlayerList({ limit }: { limit?: number }) {
  return (
    <ul className={p.players}>
      {online.slice(0, limit).map((pl) => (
        <li key={pl.name}>
          <img src={headRender(pl.name, 64)} alt="" width={28} height={28} />
          <span>
            <b>{pl.name}</b>
            <small>
              {pl.world} · {pl.session}
            </small>
          </span>
          {pl.staff && <span className={a.badge} style={tint("var(--lime)")}>Staff</span>}
          {pl.flag && <span className={a.badge} style={tint(pl.flag === "New" ? "var(--cyan)" : "var(--coral)")}>{pl.flag}</span>}
          <span className={p.ping} data-bad={pl.ping > 150 || undefined}>
            {pl.ping}ms
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Announcements() {
  return (
    <ul className={p.news}>
      {announcements.map((n) => (
        <li key={n.text}>
          <small>
            {n.date} · {n.by}
          </small>
          <p>{n.text}</p>
        </li>
      ))}
    </ul>
  );
}

// Stand-in for Discord roles in the dummy: flip between the views. Remove once OAuth decides the role.
export function RoleSwitch({ base, role, tab }: { base: string; role: Role; tab: string }) {
  return (
    <div className={p.switch}>
      <span>Preview as</span>
      {roles.map((r) => (
        <Link key={r} href={href(base, r, tab)} aria-current={r === role || undefined}>
          {roleName[r]}
        </Link>
      ))}
    </div>
  );
}

export function Me({ role }: { role: Role }) {
  const me = profile[role];
  return (
    <div className={p.me}>
      <img src={headRender(me.name, 64)} alt="" width={36} height={36} />
      <span>
        <b>{me.name}</b>
        <span className={a.badge} style={tint(role === "mod" ? "var(--coral)" : "var(--cyan)")}>
          {roleName[role]}
        </span>
      </span>
    </div>
  );
}

export function Locked({ min }: { min: Role }) {
  return (
    <div className={`${a.neon} ${p.locked}`} style={tint("var(--coral)")} role="alert">
      <b aria-hidden>🔒</b>
      <h2>No access</h2>
      <p>
        This page needs the <strong>{roleName[min]}</strong> role on Discord. If you had it a moment ago, it was removed and your access ended right away.
      </p>
    </div>
  );
}

export function Card({ title, c, children }: { title: string; c: string; children: ReactNode }) {
  return (
    <section className={`${a.neon} ${p.card}`} style={tint(c)}>
      <h3 className={p.cardTitle}>{title}</h3>
      {children}
    </section>
  );
}

// Everything except Overview, which each variant lays out itself.
type PanelProps = { tab: Tab; role: Role; d: Deadlines; q: string; base: string; guide: string; cat: string; post: string; status: Status };

export function Panel({ tab, role, d, q, base, guide, cat, post, status }: PanelProps) {
  switch (tab.key) {
    case "tasks": {
      const s = standing(role);
      return (
        <div className={p.stack}>
          <Standing role={role} />
          {s !== "ok" && (
            <Card title={s === "demote" ? "Auto-demote in" : "Auto-warn in"} c={standingTint[s]}>
              <Timer target={d.weekly} label={s === "demote" ? "Auto-demote" : "Auto-warn"} cells />
              <p className={p.note}>
                Earn {profile[role].weekMin - profile[role].week} more points before the weekly reset to stay safe.
              </p>
            </Card>
          )}
          <Card title="Points" c="var(--lime)">
            <Meter role={role} d={d} />
          </Card>
          <div className={p.split}>
            <Card title="Today" c="var(--cyan)">
              <TaskList role={role} kind="daily" reset={d.daily} />
            </Card>
            <Card title="This week" c="var(--violet)">
              <TaskList role={role} kind="weekly" reset={d.weekly} />
            </Card>
          </div>
          <Card title="Expiring points" c="var(--coral)">
            <ul className={p.expiring}>
              {d.expiring.map((g) => (
                <li key={g.reason}>
                  <b>−{g.pts}</b>
                  <span>{g.reason}</span>
                  <Timer target={g.at} label={`${g.pts} points expire`} />
                </li>
              ))}
            </ul>
            <p className={p.note}>
              Points expire 14 days after you earn them. Miss the weekly minimum and you get a warning; {MAX_WARNINGS} warnings in a row, or dropping under the floor, is an automatic demotion.
            </p>
          </Card>
        </div>
      );
    }
    case "tickets":
      return (
        <div className={p.stack}>
          <p className={p.note}>
            {openTickets} open · {tickets.length} total.{" "}
            {role === "helper" ? "Helpers can claim and answer. Escalate anything that needs a punishment." : "Mods can resolve and punish."}
          </p>
          <TicketTable role={role} />
        </div>
      );
    case "players":
      return (
        <div className={p.stack}>
          <p className={p.note}>
            {fmt(status.online)} / {status.max} online. Showing {online.length}.
          </p>
          <PlayerList />
        </div>
      );
    case "guides":
      return <GuidesTab role={role} base={base} q={q} cat={cat} guide={guide} />;
    case "commands":
      return (
        <div className={p.stack}>
          {(["helper", "mod"] as const)
            .filter((r) => can(role, r))
            .map((r) => (
              <Card key={r} title={`${roleName[r]} commands`} c={r === "helper" ? "var(--cyan)" : "var(--coral)"}>
                <dl className={p.commands}>
                  {commands
                    .filter((c) => c.min === r)
                    .map((c) => (
                      <div key={c.cmd}>
                        <dt>
                          <code>{c.cmd}</code>
                        </dt>
                        <dd>{c.text}</dd>
                      </div>
                    ))}
                </dl>
              </Card>
            ))}
        </div>
      );
    case "bugs":
      return (
        <Card title="Report a bug" c="var(--violet)">
          <BugForm />
        </Card>
      );
    case "punishments":
      return (
        <div className={p.tableWrap}>
          <table className={p.table}>
            <thead>
              <tr>
                <th>When</th>
                <th>Player</th>
                <th>Type</th>
                <th>Length</th>
                <th>Reason</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {punishments.map((x) => (
                <tr key={x.when + x.player}>
                  <td className={p.mono}>{x.when}</td>
                  <td>{x.player}</td>
                  <td>
                    <span className={a.badge} style={tint(punishTint[x.type])}>
                      {x.type}
                    </span>
                  </td>
                  <td className={p.mono}>{x.length}</td>
                  <td>{x.reason}</td>
                  <td>{x.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "lookup": {
      const name = q || lookup.name;
      const history = punishments.filter((x) => x.player.toLowerCase() === name.toLowerCase());
      return (
        <div className={p.stack}>
          <form className={p.search} role="search">
            <input type="hidden" name="as" value={role} />
            <input type="hidden" name="tab" value="lookup" />
            <input name="q" defaultValue={q} placeholder="Player name" aria-label="Player name" required />
            <button type="submit" className={a.btn}>
              Look up
            </button>
          </form>
          <Card title={name} c="var(--cyan)">
            <div className={p.lookup}>
              <img src={headRender(name, 128)} alt="" width={96} height={96} />
              <dl className={p.facts}>
                <div>
                  <dt>First joined</dt>
                  <dd>{lookup.first}</dd>
                </div>
                <div>
                  <dt>Last seen</dt>
                  <dd>{lookup.last}</dd>
                </div>
                <div>
                  <dt>Playtime</dt>
                  <dd>{lookup.playtime}</dd>
                </div>
                <div>
                  <dt>Possible alts</dt>
                  <dd>{lookup.alts.join(", ")}</dd>
                </div>
              </dl>
            </div>
            <h4 className={p.h4}>History</h4>
            {history.length ? (
              <ul className={p.expiring}>
                {history.map((x) => (
                  <li key={x.when}>
                    <span className={a.badge} style={tint(punishTint[x.type])}>
                      {x.type}
                    </span>
                    <span>
                      {x.reason} ({x.length})
                    </span>
                    <small>
                      {x.when} · {x.by}
                    </small>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={p.note}>Clean record.</p>
            )}
            <h4 className={p.h4}>Staff notes</h4>
            <ul className={p.news}>
              {lookup.notes.map((n) => (
                <li key={n}>
                  <p>{n}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      );
    }
    case "site":
    case "posts":
    case "team":
    case "vote":
      return <OwnerTab tab={tab.key} role={role} base={base} post={post} />;
    default:
      return null;
  }
}
