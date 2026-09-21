"use client";

import { useState } from "react";
import type { Feature, Rule, Settings, Social } from "@/app/_lib/content";
import { sprites } from "@/app/_ui/art";
import { saveSettings } from "./actions";
import o from "./owner.module.css";
import { Rows, SaveBar, useSaver } from "./ui";

const icons = Object.keys(sprites);

// Everything on the public site that isn't a post, a team member or a vote site.
export default function SettingsForm({ initial }: { initial: Settings }) {
  const [s, setS] = useState(initial);
  const saver = useSaver();
  const patch = (p: Partial<Settings>) => {
    setS((cur) => ({ ...cur, ...p }));
    saver.touch();
  };

  return (
    <form
      className={o.form}
      onSubmit={(e) => {
        e.preventDefault();
        saver.save(() => saveSettings(JSON.stringify(s)));
      }}
    >
      <section className={o.section}>
        <h3>Server</h3>
        <div className={o.grid}>
          <label>
            Server IP
            <input value={s.ip} onChange={(e) => patch({ ip: e.target.value })} required />
          </label>
          <label>
            Version label
            <input value={s.version} onChange={(e) => patch({ version: e.target.value })} required />
          </label>
          <label>
            Season
            <input type="number" min={1} value={s.season} onChange={(e) => patch({ season: Number(e.target.value) })} required />
          </label>
          <label>
            Max players
            <input type="number" min={1} value={s.maxPlayers} onChange={(e) => patch({ maxPlayers: Number(e.target.value) })} required />
          </label>
          <label>
            Discord invite
            <input type="url" value={s.discordInvite} onChange={(e) => patch({ discordInvite: e.target.value })} required />
          </label>
          <label>
            Store URL
            <input type="url" value={s.storeUrl} onChange={(e) => patch({ storeUrl: e.target.value })} required />
          </label>
        </div>
      </section>

      <section className={o.section}>
        <h3>Online counters</h3>
        <p className={o.hint}>
          Live asks api.mcsrvstat.us for players online and Discord for members online, refreshed every minute. Demo shows the numbers below, which is useful before
          launch.
        </p>
        <div className={o.grid}>
          <label>
            Source
            <select value={s.status.source} onChange={(e) => patch({ status: { ...s.status, source: e.target.value as "demo" | "live" } })}>
              <option value="demo">Demo numbers</option>
              <option value="live">Live</option>
            </select>
          </label>
          <label>
            Demo: players online
            <input type="number" min={0} value={s.status.online} onChange={(e) => patch({ status: { ...s.status, online: Number(e.target.value) } })} />
          </label>
          <label>
            Demo: Discord online
            <input type="number" min={0} value={s.status.discord} onChange={(e) => patch({ status: { ...s.status, discord: Number(e.target.value) } })} />
          </label>
        </div>
      </section>

      <section className={o.section}>
        <h3>Home hero</h3>
        <div className={o.grid}>
          {s.hero.lines.map((line, i) => (
            <label key={i}>
              Title line {i + 1}
              {i === 2 && " (lime)"}
              <input
                value={line}
                maxLength={40}
                onChange={(e) => patch({ hero: { ...s.hero, lines: s.hero.lines.map((l, n) => (n === i ? e.target.value : l)) as Settings["hero"]["lines"] } })}
                required
              />
            </label>
          ))}
          <label className={o.wide}>
            Intro text
            <textarea rows={3} value={s.hero.lede} maxLength={400} onChange={(e) => patch({ hero: { ...s.hero, lede: e.target.value } })} required />
          </label>
        </div>
      </section>

      <section className={o.section}>
        <h3>Next event</h3>
        <p className={o.hint}>Shown with a live countdown in the info bar under the hero.</p>
        <div className={o.grid}>
          <label>
            Event name
            <input value={s.event.title} maxLength={40} onChange={(e) => patch({ event: { ...s.event, title: e.target.value } })} required />
          </label>
          <label>
            Starts at (UTC)
            <input type="datetime-local" value={s.event.at.slice(0, 16)} onChange={(e) => patch({ event: { ...s.event, at: `${e.target.value}:00Z` } })} required />
          </label>
        </div>
      </section>

      <section className={o.section}>
        <h3>&ldquo;What&apos;s on&rdquo; features</h3>
        <Rows<Feature & Record<string, string>>
          items={s.features as (Feature & Record<string, string>)[]}
          blank={{ icon: "star", title: "", text: "" }}
          itemLabel={(f, i) => f.title || `Feature ${i + 1}`}
          fields={[
            { key: "icon", label: "Icon", type: "select", options: icons },
            { key: "title", label: "Title" },
            { key: "text", label: "Text", type: "textarea" },
          ]}
          onChange={(features) => patch({ features: features as Feature[] })}
        />
      </section>

      <section className={o.section}>
        <h3>House rules</h3>
        <p className={o.hint}>The first six show on the home page; all of them on /rules.</p>
        <Rows<Rule>
          items={s.rules}
          blank={{ q: "", a: "" }}
          itemLabel={(r, i) => `${i + 1}. ${r.q || "New rule"}`}
          fields={[
            { key: "q", label: "Rule / question", wide: true },
            { key: "a", label: "Explanation", type: "textarea" },
          ]}
          onChange={(rules) => patch({ rules })}
        />
      </section>

      <section className={o.section}>
        <h3>Social links</h3>
        <Rows<Social>
          items={s.socials}
          blank={{ label: "", href: "https://" }}
          itemLabel={(x, i) => x.label || `Link ${i + 1}`}
          fields={[
            { key: "label", label: "Name" },
            { key: "href", label: "URL", type: "url" },
          ]}
          onChange={(socials) => patch({ socials })}
        />
      </section>

      <SaveBar {...saver} view="/" />
    </form>
  );
}
