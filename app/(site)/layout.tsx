import Link from "next/link";
import { nav } from "@/app/_lib/nav";
import { getContent } from "@/app/_lib/store";
import { fmt, getStatus } from "@/app/_lib/status";
import CopyIp from "@/app/_ui/CopyIp";
import { Cube, Icon } from "@/app/_ui/art";
import { DISCLAIMER } from "@/app/_ui/data";
import Menu from "@/app/(site)/Menu";
import s from "@/app/aurora.module.css";
import x from "./site.module.css";

// Top strip (nav, live counters, store, menu) and footer, shared by every public page.
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const { settings } = await getContent();
  const status = await getStatus(settings);

  return (
    <>
      <div className={s.strip}>
        <Link href="/" className={s.brand}>
          <Cube size={30} top="#c6ff3d" left="#8fc41f" right="#6a9612" trim={null} />
          CAELUM
        </Link>

        <nav className={x.nav} aria-label="Main">
          {nav.map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>

        <div className={x.pills}>
          <span className={x.pill}>
            <i className={x.dot} data-off={status.online === null || undefined} />
            <b>{fmt(status.online)}</b>
            <span className={x.pillLabel}>playing</span>
            <CopyIp ip={settings.ip} className={x.pillBtn}>
              Copy IP
            </CopyIp>
          </span>
          <span className={`${x.pill} ${x.discord}`}>
            <Icon name="discord" size={16} />
            <b>{fmt(status.discord)}</b>
            <span className={x.pillLabel}>on Discord</span>
            <a href={settings.discordInvite} className={x.pillBtn} target="_blank" rel="noopener noreferrer">
              Join
            </a>
          </span>
        </div>

        <a href={settings.storeUrl} className={x.store} target="_blank" rel="noopener noreferrer">
          <Icon name="chest" size={16} />
          Store
        </a>
        <Menu ip={settings.ip} storeUrl={settings.storeUrl} socials={settings.socials} links={nav} />
      </div>

      {children}

      <footer className={s.footer}>
        <p className={s.bye}>
          See you
          <br />
          in-game.
        </p>
        <div className={s.footRow}>
          <ul>
            {settings.socials.map((so) => (
              <li key={so.label}>
                <a href={so.href} target="_blank" rel="noopener noreferrer">
                  {so.label}
                </a>
              </li>
            ))}
          </ul>
          <ul>
            <li>
              <Link href="/#join">How to join</Link>
            </li>
            {nav.map(([href, label]) => (
              <li key={href}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
            <li>
              <a href={settings.storeUrl} target="_blank" rel="noopener noreferrer">
                Store
              </a>
            </li>
            <li>
              <Link href="/staff">Staff</Link>
            </li>
          </ul>
        </div>
        <small>
          © 2026 CaelumSMP. {DISCLAIMER}
        </small>
      </footer>
    </>
  );
}
