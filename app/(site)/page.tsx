import type { CSSProperties } from "react";
import Link from "next/link";
import { visiblePosts } from "@/app/_lib/content";
import { getContent } from "@/app/_lib/store";
import { fmt, getStatus } from "@/app/_lib/status";
import CopyIp from "@/app/_ui/CopyIp";
import Sparkline from "@/app/_ui/Sparkline";
import Timer from "@/app/_ui/Timer";
import { Cube, Icon } from "@/app/_ui/art";
import { bodyRender, joinSteps, playerHistory, stats } from "@/app/_ui/data";
import NewsList from "@/app/(site)/NewsList";
import Podium from "@/app/(site)/Podium";
import Rules from "@/app/(site)/Rules";
import TeamGrid from "@/app/(site)/TeamGrid";
import Tilt from "@/app/(site)/Tilt";
import s from "@/app/aurora.module.css";
import x from "./site.module.css";

const LIME = "#c6ff3d";
const CORAL = "#ff5a5f";
const CYAN = "#4de3ff";
const VIOLET = "#a77bff";
const tints = [LIME, CORAL, CYAN, VIOLET];

const paint = {
  grass: {},
  dirt: { top: "#8b5a2b", left: "#7a4d24", right: "#5e3a1a", trim: null },
  stone: { top: "#8d93a3", left: "#6f7585", right: "#565b69", trim: null },
  deep: { top: "#6f7585", left: "#565b69", right: "#41455a", trim: null },
  water: { top: "#4de3ff", left: "#2a8fd0", right: "#1f6fa8", trim: null },
  sand: { top: "#ead9a0", left: "#cdb878", right: "#ac9858", trim: null },
  wood: { top: "#b08552", left: "#6b4a2b", right: "#54391f", trim: null },
  leaf: { top: "#c6ff3d", left: "#7fc41f", right: "#5c9a12", trim: null },
} as const;
type Voxel = [col: number, row: number, layer: number, paint: keyof typeof paint];

// A slice of a survival world: 4×4 chunk of terrain with a pond, a tree and two layers of ground underneath.
// Drawn bottom-to-top, back-to-front. Below the surface only the two front faces are visible, so only those cubes exist.
const N = 4;
const cells = Array.from({ length: N * N }, (_, i) => [i % N, Math.floor(i / N)] as const).sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
const surface = (c: number, r: number): Voxel[3] => ((c === 3 && r <= 1) || (c === 2 && r === 0) ? "water" : (c === 2 && r === 1) || (c === 3 && r === 2) ? "sand" : "grass");
const voxels: Voxel[] = [
  ...[-2, -1].flatMap((l) => cells.filter(([c, r]) => c === N - 1 || r === N - 1).map(([c, r]): Voxel => [c, r, l, l === -1 ? "dirt" : (c + r) % 2 ? "stone" : "deep"])),
  ...cells.map(([c, r]): Voxel => [c, r, 0, surface(c, r)]),
  [0, 1, 1, "wood"],
  [0, 1, 2, "leaf"],
];
// Cube width is 22% of the frame; one grid step is 46% of that sideways, 23% down, and a layer is 47% up.
const place = ([c, r, l]: Voxel): CSSProperties => ({ left: `${39 + (c - r) * 10.12}%`, top: `${22 + (c + r) * 5.06 - l * 10.34}%` });

const floaters = [
  { top: "4%", left: "-6%", size: 84, d: 38, c: [LIME, "#8fc41f", "#6a9612"] },
  { top: "62%", left: "-10%", size: 56, d: -24, c: [CORAL, "#c93b40", "#9c2b30"] },
  { top: "-7%", left: "74%", size: 60, d: -30, c: [CYAN, "#22a9c9", "#167f99"] },
  { top: "78%", left: "86%", size: 96, d: 46, c: [VIOLET, "#7448d6", "#5631ab"] },
  { top: "36%", left: "98%", size: 40, d: 18, c: ["#ffffff", "#c9cfe6", "#9aa2c4"] },
];

export default async function Home() {
  const { settings, posts, team } = await getContent();
  const status = await getStatus(settings);
  const [l1, l2, l3] = settings.hero.lines;
  const board = [
    { label: "Players online", value: `${fmt(status.online)} / ${status.max}`, live: status.online !== null },
    { label: "On Discord now", value: fmt(status.discord) },
    { label: "Version", value: settings.version },
    { label: settings.event.title, value: <Timer target={Date.parse(settings.event.at)} label={`${settings.event.title} starts in`} /> },
  ];

  return (
    <>
      <Tilt className={s.hero}>
        <div className={s.heroText}>
          <p className={s.kicker}>
            Season {settings.season} · {settings.version}
          </p>
          <h1>
            {l1}
            <br />
            {l2}
            <br />
            <em>{l3}</em>
          </h1>
          <p className={s.lede}>{settings.hero.lede}</p>
          <CopyIp ip={settings.ip} className={`${s.btn} ${s.giant}`}>
            {settings.ip}
            <small>click to copy the IP</small>
          </CopyIp>
          <a href={settings.discordInvite} className={s.textLink} target="_blank" rel="noopener noreferrer">
            or join {fmt(status.discord)} players on Discord →
          </a>
        </div>

        <div className={s.art}>
          <div className={s.frame}>
            <div className={s.island}>
              {voxels.map((v, n) => (
                <Cube key={n} size={100} {...paint[v[3]]} className={s.voxel} style={place(v)} />
              ))}
              <img src={bodyRender("Steve", 256)} alt="" width={90} height={146} className={s.player} style={{ left: "19.6%", bottom: "57.8%" }} />
              <img src={bodyRender("Alex", 256)} alt="" width={90} height={146} className={s.player} style={{ left: "50%", bottom: "52.7%" }} />
            </div>
            <span className={s.frameTag}>LIVE FROM SPAWN</span>
          </div>
          {floaters.map((f, n) => (
            <Cube key={n} size={f.size} top={f.c[0]} left={f.c[1]} right={f.c[2]} trim={null} className={s.floater} style={{ top: f.top, left: f.left, "--d": f.d, animationDelay: `${n * -1.3}s` } as CSSProperties} />
          ))}
        </div>
      </Tilt>

      <dl className={s.boardBar}>
        {board.map((b, n) => (
          <div key={b.label} style={{ "--c": tints[n], "--i": n } as CSSProperties}>
            <dt>
              {b.live && <i />}
              {b.label}
            </dt>
            <dd>{b.value}</dd>
          </div>
        ))}
      </dl>

      <main>
        <section id="news" className={s.section}>
          <Head n="01" title="Hot off the press" />
          <NewsList posts={visiblePosts(posts).slice(0, 3)} />
          <Link href="/news" className={s.textLink}>
            All news →
          </Link>
        </section>

        <section id="features" className={s.section}>
          <Head n="02" title="What's on" />
          <ul className={s.tiles}>
            {settings.features.map((f, n) => (
              <li key={f.title} style={{ "--c": tints[n % 4] } as CSSProperties}>
                <b>{String(n + 1).padStart(2, "0")}</b>
                <Icon name={f.icon} size={56} />
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="ranks" className={s.section}>
          <Head n="03" title="Main stage" />
          <Podium />
          <Link href="/leaderboards" className={s.textLink}>
            Full leaderboards and player profiles →
          </Link>
        </section>

        <section id="stats" className={s.section}>
          <Head n="04" title="Crowd numbers" />
          <dl className={s.stats}>
            {[...stats, { value: `S${settings.season}`, label: "Current season" }].map((st) => (
              <div key={st.label}>
                <dd>{st.value}</dd>
                <dt>{st.label}</dt>
              </div>
            ))}
          </dl>
          <div className={s.neon} style={{ "--c": CYAN } as CSSProperties}>
            <div className={s.chartHead}>
              <h3>Players, last 7 days</h3>
              <span>peak {Math.max(...playerHistory.map((d) => d.players))}</span>
            </div>
            <Sparkline variant="bars" className={s.spark} />
            <ol className={s.days}>
              {playerHistory.map((d) => (
                <li key={d.day}>{d.day}</li>
              ))}
            </ol>
          </div>
        </section>

        <section id="join" className={s.section}>
          <Head n="05" title="Get in" />
          <ol className={s.steps}>
            {joinSteps.map((st, n) => (
              <li key={st.title} className={s.neon} style={{ "--c": tints[n] } as CSSProperties}>
                <b>{n + 1}</b>
                <h3>{st.title}</h3>
                <p>{st.text}</p>
              </li>
            ))}
          </ol>
          <CopyIp ip={settings.ip} className={`${s.btn} ${s.giant} ${s.wide}`}>
            {settings.ip}
            <small>{settings.version} · click to copy</small>
          </CopyIp>
        </section>

        <section id="team" className={s.section}>
          <Head n="06" title="The crew" />
          <TeamGrid team={team} />
          <Link href="/team" className={s.textLink}>
            Meet the whole team →
          </Link>
        </section>

        <section id="faq" className={s.section}>
          <Head n="07" title="House rules" />
          <Rules rules={settings.rules.slice(0, 6)} />
          <div className={x.after}>
            <Link href="/rules" className={s.textLink}>
              All {settings.rules.length} rules →
            </Link>
            <Link href="/vote" className={s.textLink}>
              Vote for us, get rewards →
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

function Head({ n, title }: { n: string; title: string }) {
  return (
    <h2 className={s.head}>
      <span>{n}</span>
      {title}
    </h2>
  );
}
