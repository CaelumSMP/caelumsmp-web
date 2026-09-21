"use client";

import { useState } from "react";
import a from "@/app/aurora.module.css";
import p from "./panels.module.css";

// ponytail: dummy submit, posts nowhere. Wire to a route handler (or a Discord webhook) when the real backend exists.
export default function BugForm() {
  const [sent, setSent] = useState(false);
  if (sent)
    return (
      <p className={p.sent} role="status">
        Sent (dummy). Thanks, the dev team gets a ping in #bugs.{" "}
        <button type="button" className={p.linkBtn} onClick={() => setSent(false)}>
          Report another
        </button>
      </p>
    );
  return (
    <form
      className={p.form}
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <label>
        What broke?
        <input name="title" required maxLength={120} placeholder="Shop chest eats renamed items" />
      </label>
      <label>
        Where
        <select name="area" required defaultValue="">
          <option value="" disabled>
            Pick one
          </option>
          <option>Server / plugin</option>
          <option>Website</option>
          <option>Discord bot</option>
          <option>Staff dashboard</option>
        </select>
      </label>
      <fieldset>
        <legend>How bad</legend>
        {["Cosmetic", "Annoying", "Game-breaking", "Exploit"].map((s, n) => (
          <label key={s} className={p.radio}>
            <input type="radio" name="severity" value={s} required defaultChecked={n === 1} />
            {s}
          </label>
        ))}
      </fieldset>
      <label>
        Steps to reproduce
        <textarea name="steps" required rows={5} placeholder={"1. Rename a diamond\n2. Put it in a shop chest\n3. It's gone"} />
      </label>
      <label>
        Coordinates or link (optional)
        <input name="where" placeholder="world 120 64 -340" />
      </label>
      <label className={p.check}>
        <input type="checkbox" name="exploit" /> This is an exploit, hide it from the public tracker
      </label>
      <button type="submit" className={a.btn}>
        Send report
      </button>
    </form>
  );
}
