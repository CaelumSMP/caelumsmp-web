"use client";

import { useSyncExternalStore, type CSSProperties } from "react";
import p from "./timer.module.css";

const units = [
  { label: "Days", secs: 86400, color: "var(--lime)" },
  { label: "Hours", secs: 3600, color: "var(--coral)" },
  { label: "Min", secs: 60, color: "var(--cyan)" },
  { label: "Sec", secs: 1, color: "var(--violet)" },
];

// A one-second clock. The server snapshot is null, so the first render shows "--" and hydration never mismatches.
const subscribe = (tick: () => void) => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
};
const nowSecs = () => Math.floor(Date.now() / 1000);

// Counts down to `target` (ms). `cells` draws the big block timer, otherwise an inline "1d 04:12:09".
export default function Timer({ target, label, cells }: { target: number; label: string; cells?: boolean }) {
  const now = useSyncExternalStore(subscribe, nowSecs, () => null);
  const left = now === null ? null : Math.max(0, Math.floor(target / 1000) - now);
  const parts = units.map((u, i) => (left === null ? "--" : String(Math.floor((left % (i ? units[i - 1].secs : Infinity)) / u.secs)).padStart(2, "0")));
  const aria = left === null ? label : `${label}: ${Number(parts[0])} days, ${Number(parts[1])} hours, ${Number(parts[2])} minutes`;

  if (!cells) {
    return (
      <time role="timer" aria-label={aria} className={p.timerInline}>
        {parts[0] !== "00" && `${Number(parts[0]) || parts[0]}d `}
        {parts.slice(1).join(":")}
      </time>
    );
  }
  return (
    <div className={p.cells} role="timer" aria-label={aria}>
      {units.map((u, i) => (
        <div key={u.label} className={p.cell} style={{ "--c": u.color } as CSSProperties} aria-hidden>
          <span className={p.digits}>
            {[...parts[i]].map((d, n) => (
              // Keyed by value, so a changed digit remounts and replays its drop-in.
              <b key={`${n}-${d}`}>{d}</b>
            ))}
          </span>
          <span className={p.unit}>{u.label}</span>
        </div>
      ))}
    </div>
  );
}
