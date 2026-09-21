import type { Rule } from "@/app/_lib/content";
import x from "./site.module.css";

// Exclusive accordion: the shared `name` makes the browser close the open rule when another opens. No JS.
// The open/close animation is CSS (::details-content + interpolate-size); browsers without it just snap open.
export default function Rules({ rules }: { rules: Rule[] }) {
  return (
    <div className={x.rules}>
      {rules.map((r, n) => (
        <details key={r.q} name="rules" className={x.rule}>
          <summary>
            <span className={x.ruleNum}>{String(n + 1).padStart(2, "0")}</span>
            <span className={x.ruleQ}>{r.q}</span>
            <span className={x.ruleToggle} aria-hidden />
          </summary>
          <p>{r.a}</p>
        </details>
      ))}
    </div>
  );
}
