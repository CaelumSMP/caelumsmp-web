import { playerHistory } from "./data";

// 7-day player-count chart as plain SVG. `stepped` draws a blocky staircase line, otherwise bars.
// Colors come from CSS: `stroke`/`fill` via currentColor on the className.
export default function Sparkline({ variant = "stepped", className }: { variant?: "stepped" | "bars"; className?: string }) {
  const W = 140;
  const H = 50;
  const max = Math.max(...playerHistory.map((d) => d.players));
  const col = W / playerHistory.length;
  const y = (n: number) => H - (n / max) * (H - 4);
  const label = `Peak players per day: ${playerHistory.map((d) => `${d.day} ${d.players}`).join(", ")}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={label} preserveAspectRatio="none" shapeRendering="crispEdges">
      {variant === "bars" ? (
        playerHistory.map((d, i) => <rect key={d.day} x={i * col + 2} y={y(d.players)} width={col - 4} height={H - y(d.players)} fill="currentColor" />)
      ) : (
        <>
          <path d={`M0,${H} ${playerHistory.map((d, i) => `L${i * col},${y(d.players)} L${(i + 1) * col},${y(d.players)}`).join(" ")} L${W},${H} Z`} fill="currentColor" opacity=".18" />
          <path
            d={playerHistory.map((d, i) => `${i ? "L" : "M"}${i * col},${y(d.players)} L${(i + 1) * col},${y(d.players)}`).join(" ")}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </>
      )}
    </svg>
  );
}
