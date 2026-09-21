import type { CSSProperties } from "react";
import Link from "next/link";
import CopyIp from "@/app/_ui/CopyIp";
import a from "@/app/aurora.module.css";
import { can, href, type Role } from "./data";
import { categories, guides, knownIssues, type Block, type Category, type Guide, type Issue, type Shot } from "./guides";
import { Locked } from "./Panels";
import g from "./guides.module.css";

// The Guides tab: index (?cat=, ?q=), known issues (?cat=issues) and the reader (?guide=slug).

const catTint: Record<Category, string> = { Onboarding: "var(--lime)", Tickets: "var(--cyan)", Moderation: "var(--coral)", Troubleshooting: "var(--violet)" };
const toneTint = { tip: "var(--lime)", warn: "var(--violet)", danger: "var(--coral)" };
const toneLabel = { tip: "Tip", warn: "Heads up", danger: "Important" };
const tint = (c: string) => ({ "--c": c }) as CSSProperties;
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function GuidesTab({ role, base, q, cat, guide }: { role: Role; base: string; q: string; cat: string; guide: string }) {
  const root = href(base, role, "guides");
  const list = guides.filter((x) => can(role, x.min));

  if (guide) {
    const found = guides.find((x) => x.slug === guide);
    if (!found) return <NotFound root={root} />;
    if (!can(role, found.min)) return <Locked min={found.min} />;
    return <Reader guide={found} root={root} bugs={href(base, role, "bugs")} />;
  }

  const issues = knownIssues(list);
  const needle = q.toLowerCase();
  const hit = (s: string) => s.toLowerCase().includes(needle);
  const shown = list.filter((x) => (!cat || x.category === cat) && (!q || hit(x.title) || hit(x.summary)));
  const issueHits = q ? issues.filter(({ issue }) => hit(issue.symptom) || hit(issue.cause)) : [];

  return (
    <div className={g.home}>
      <form className={g.search} role="search">
        <input type="hidden" name="as" value={role} />
        <input type="hidden" name="tab" value="guides" />
        <input name="q" defaultValue={q} placeholder='Search guides or paste an error, e.g. "timed out"' aria-label="Search guides" />
        <button type="submit" className={a.btn}>
          Search
        </button>
      </form>

      <nav className={g.chips} aria-label="Guide categories">
        <Link href={root} aria-current={!cat || undefined}>
          All <b>{list.length}</b>
        </Link>
        {categories.map((c) => (
          <Link key={c} href={`${root}&cat=${c}`} aria-current={cat === c || undefined} style={tint(catTint[c])}>
            {c} <b>{list.filter((x) => x.category === c).length}</b>
          </Link>
        ))}
        <Link href={`${root}&cat=issues`} aria-current={cat === "issues" || undefined} style={tint("var(--coral)")}>
          Known issues <b>{issues.length}</b>
        </Link>
      </nav>

      {cat === "issues" ? (
        <IssueIndex items={issues} root={root} />
      ) : (
        <>
          {issueHits.length > 0 && (
            <section>
              <h3 className={g.label}>Matching issues</h3>
              <IssueIndex items={issueHits} root={root} />
            </section>
          )}
          {q && <h3 className={g.label}>Guides matching &ldquo;{q}&rdquo;</h3>}
          {shown.length ? (
            <ul className={g.cards}>
              {shown.map((x) => {
                const steps = x.blocks.reduce((n, b) => n + (b.type === "steps" ? b.items.length : 0), 0);
                const fixes = knownIssues([x]).length;
                return (
                  <li key={x.slug}>
                    <Link href={`${root}&guide=${x.slug}`} className={a.neon} style={tint(catTint[x.category])}>
                      <span className={g.badges}>
                        <span className={a.badge}>{x.category}</span>
                        {x.min !== "helper" && (
                          <span className={a.badge} style={tint("var(--coral)")}>
                            Mod only
                          </span>
                        )}
                      </span>
                      <h3>{x.title}</h3>
                      <p>{x.summary}</p>
                      <small>
                        {steps > 0 && `${steps} steps · `}
                        {fixes > 0 && `${fixes} fixes · `}
                        updated {x.updated}
                      </small>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={g.empty}>No guides match. Try fewer words, or check Known issues.</p>
          )}
        </>
      )}
    </div>
  );
}

function IssueIndex({ items, root }: { items: { issue: Issue; guide: Guide }[]; root: string }) {
  return (
    <ul className={g.issueIndex}>
      {items.map(({ issue, guide }) => (
        <li key={issue.id}>
          <Link href={`${root}&guide=${guide.slug}#${issue.id}`}>
            <span className={g.if}>If you see</span>
            <b>{issue.symptom}</b>
            <small>
              {issue.cause} <em>→ {guide.title}</em>
            </small>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Reader({ guide, root, bugs }: { guide: Guide; root: string; bugs: string }) {
  const toc = guide.blocks.flatMap((b) =>
    b.type === "heading" ? [{ id: slug(b.text), text: b.text }] : b.type === "issues" ? b.items.map((i) => ({ id: i.id, text: i.symptom, issue: true })) : [],
  );
  // Step numbering carries on across step blocks: each block starts after all earlier steps.
  const starts = guide.blocks.map((_, n) => guide.blocks.slice(0, n).reduce((sum, b) => sum + (b.type === "steps" ? b.items.length : 0), 0));

  return (
    <article className={g.reader} style={tint(catTint[guide.category])}>
      <Link href={root} className={g.back}>
        ← All guides
      </Link>
      <header className={g.head}>
        <span className={g.badges}>
          <span className={a.badge}>{guide.category}</span>
          {guide.min !== "helper" && (
            <span className={a.badge} style={tint("var(--coral)")}>
              Mod only
            </span>
          )}
        </span>
        <h2>{guide.title}</h2>
        <p>{guide.summary}</p>
        <small>
          By {guide.author} · updated {guide.updated}
        </small>
      </header>

      <div className={g.layout}>
        <div className={g.body}>
          {guide.blocks.map((b, n) => (
            <BlockView key={n} block={b} from={starts[n]} />
          ))}
          <p className={g.outdated}>
            Something here wrong or out of date? <Link href={bugs}>Report it</Link> and mention &ldquo;{guide.title}&rdquo;.
          </p>
        </div>
        {toc.length > 1 && (
          <nav className={g.toc} aria-label="On this page">
            <h3>On this page</h3>
            <ol>
              {toc.map((t) => (
                <li key={t.id} data-issue={"issue" in t || undefined}>
                  <a href={`#${t.id}`}>{t.text}</a>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>
    </article>
  );
}

function BlockView({ block: b, from }: { block: Block; from: number }) {
  switch (b.type) {
    case "heading":
      return (
        <h3 id={slug(b.text)} className={g.h}>
          {b.text}
        </h3>
      );
    case "text":
      return <p className={g.text}>{b.text}</p>;
    case "shot":
      return <ShotView shot={b.shot} />;
    case "callout":
      return (
        <aside className={g.callout} style={tint(toneTint[b.tone])}>
          <b>{toneLabel[b.tone]}</b>
          <p>{b.text}</p>
        </aside>
      );
    case "steps":
      return (
        <ol className={g.steps} start={from + 1}>
          {b.items.map((s, i) => (
            <li key={i}>
              <span className={g.num} aria-hidden>
                {from + i + 1}
              </span>
              <div>
                <p>{s.text}</p>
                {s.cmd && <Cmd cmd={s.cmd} />}
                {s.shot && <ShotView shot={s.shot} />}
              </div>
            </li>
          ))}
        </ol>
      );
    case "issues":
      return (
        <section className={g.issues}>
          <h3 className={g.h} id="troubleshooting">
            Troubleshooting
          </h3>
          {b.items.map((i) => (
            <div key={i.id} id={i.id} className={g.issue}>
              <span className={g.if}>If you see</span>
              <h4>{i.symptom}</h4>
              {i.looks && <ShotView shot={i.looks} />}
              <dl>
                <dt>Why</dt>
                <dd>{i.cause}</dd>
                <dt>Fix</dt>
                <dd>
                  <ol>
                    {i.fix.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ol>
                </dd>
              </dl>
              {i.escalate && (
                <p className={g.escalate}>
                  <b>Escalate:</b> {i.escalate}
                </p>
              )}
            </div>
          ))}
        </section>
      );
  }
}

// Click-to-copy command. Reuses the site's IP copy button.
function Cmd({ cmd }: { cmd: string }) {
  return (
    <CopyIp ip={cmd} className={g.cmd}>
      <code>{cmd}</code>
      <span>copy</span>
    </CopyIp>
  );
}

function ShotView({ shot }: { shot: Shot }) {
  return (
    <figure className={g.shot}>
      {shot.src ? (
        <img src={shot.src} alt={shot.alt} loading="lazy" />
      ) : shot.mock ? (
        <div className={g.mock} data-kind={shot.mock.kind} role="img" aria-label={shot.alt}>
          {shot.mock.lines.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
          {shot.mock.kind === "screen" && <i>Back to server list</i>}
        </div>
      ) : (
        <div className={g.missing}>Screenshot needed: {shot.alt}</div>
      )}
      <figcaption>{shot.caption ?? shot.alt}</figcaption>
    </figure>
  );
}

function NotFound({ root }: { root: string }) {
  return (
    <p className={g.empty}>
      That guide doesn&apos;t exist (anymore). <Link href={root}>Back to all guides</Link>
    </p>
  );
}
