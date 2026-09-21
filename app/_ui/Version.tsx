import s from "./version.module.css";

// A discreet build marker so anyone reporting a bug can say which version they
// were on. The version is injected from package.json in next.config.ts; the
// commit appears when the host provides it (Cloudflare Pages and Vercel both do).
const VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "dev";
const COMMIT = (process.env.CF_PAGES_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "").slice(0, 7);

export default function Version() {
  return (
    <span className={s.badge} aria-label={`Site version ${VERSION}${COMMIT ? `, build ${COMMIT}` : ""}`}>
      v{VERSION}
      {COMMIT ? <em>{COMMIT}</em> : null}
    </span>
  );
}
